'use server';

import { getStripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { isReservedSlug, isValidSlugFormat } from '@/lib/slug-validation';
import { VALID_STYLE_IDS } from '@/lib/style-migration';
import {
  ADDON_KEYS,
  TIERS,
  tierForCount,
  normalizeAddonKey,
  type AddonKey,
} from '@/lib/funnel';

export interface CheckoutInput {
  email: string;
  name1: string;
  name2: string;
  weddingDate: string; // YYYY-MM-DD
  slug: string;
  style: string;
  addons: string[]; // DB-Keys (oder alte Keys — werden normalisiert)
  domain: boolean;
}

export type CheckoutResult = { url: string } | { error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADDON_SET = new Set<string>(ADDON_KEYS);

// 14 Tage kostenlos testen, dann startet die Abo-Phase automatisch.
// Über STRIPE_TRIAL_DAYS (Vercel-Env) ohne Code-Edit anpassbar.
const TRIAL_DAYS = Number(process.env.STRIPE_TRIAL_DAYS) || 14;

export async function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const email = (input.email || '').trim().toLowerCase();
  const name1 = (input.name1 || '').trim();
  const name2 = (input.name2 || '').trim();
  const slug = (input.slug || '').trim().toLowerCase();
  const style = (input.style || '').trim();
  const weddingDate = (input.weddingDate || '').trim();

  // --- Validierung ---
  if (!EMAIL_RE.test(email)) return { error: 'Bitte eine gültige E-Mail angeben.' };
  if (!name1 || !name2) return { error: 'Bitte beide Namen angeben.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weddingDate)) return { error: 'Bitte ein gültiges Hochzeitsdatum wählen.' };
  if (!isValidSlugFormat(slug)) return { error: 'Die Adresse darf nur Buchstaben, Zahlen und Bindestriche enthalten.' };
  if (isReservedSlug(slug)) return { error: 'Diese Adresse ist reserviert — bitte eine andere wählen.' };
  if (!VALID_STYLE_IDS.includes(style as (typeof VALID_STYLE_IDS)[number])) {
    return { error: 'Bitte einen gültigen Stil wählen.' };
  }

  // Zusatz-Bereiche normalisieren + deduplizieren
  const addons = Array.from(
    new Set(
      (input.addons || [])
        .map((k) => normalizeAddonKey(k))
        .filter((k): k is AddonKey => Boolean(k)),
    ),
  );
  if (addons.length > ADDON_KEYS.length) return { error: 'Zu viele Zusatz-Bereiche.' };

  const tier = tierForCount(addons.length);
  const tierCfg = TIERS[tier];

  // --- Slug-Verfügbarkeit ---
  const admin = createSupabaseAdminClient();
  if (!admin) return { error: 'Service nicht verfügbar. Bitte später erneut versuchen.' };
  const { data: existing, error: slugErr } = await admin
    .from('wedding_sites')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (slugErr) {
    console.error('[startCheckout] slug check failed:', slugErr);
    return { error: 'Adresse konnte nicht geprüft werden. Bitte erneut versuchen.' };
  }
  if (existing) return { error: 'Diese Adresse ist schon vergeben — bitte eine andere wählen.' };

  // --- Stripe Checkout ---
  const stripe = getStripe();
  if (!stripe) return { error: 'Zahlung ist gerade nicht verfügbar. Bitte später erneut versuchen.' };

  const tierPriceId = process.env[tierCfg.priceEnv];
  if (!tierPriceId) {
    console.error(`[startCheckout] Missing env ${tierCfg.priceEnv}`);
    return { error: 'Preis-Konfiguration fehlt. Bitte beim Anbieter melden.' };
  }

  const lineItems: { price: string; quantity: number }[] = [{ price: tierPriceId, quantity: 1 }];

  if (input.domain) {
    const domMonthly = process.env.STRIPE_PRICE_DOMAIN_MONTHLY;
    const domSetup = process.env.STRIPE_PRICE_DOMAIN_SETUP;
    if (domMonthly) lineItems.push({ price: domMonthly, quantity: 1 });
    // Einmalige Einrichtung: in subscription-mode landet ein one-time Price auf
    // der ersten Rechnung. Falls Stripe das ablehnt, einfach diesen Block entfernen.
    if (domSetup) lineItems.push({ price: domSetup, quantity: 1 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de';

  // Onboarding-Daten reisen als Metadata zum Webhook (dort wird provisioniert).
  const metadata: Record<string, string> = {
    slug,
    name1,
    name2,
    wedding_date: weddingDate,
    style,
    tier,
    addons: addons.join(','),
    domain: input.domain ? '1' : '0',
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: lineItems,
      allow_promotion_codes: true,
      // Karte sofort hinterlegen, damit nach dem Trial automatisch abgerechnet wird.
      payment_method_collection: 'always',
      metadata,
      subscription_data: {
        metadata,
        // 14 Tage kostenlos — erst danach startet die Abrechnung.
        trial_period_days: TRIAL_DAYS,
      },
      success_url: `${appUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/signup?canceled=1`,
    });

    if (!session.url) {
      console.error('[startCheckout] session created without url', session.id);
      return { error: 'Checkout konnte nicht gestartet werden. Bitte erneut versuchen.' };
    }
    return { url: session.url };
  } catch (err) {
    console.error('[startCheckout] Stripe error:', err);
    return { error: 'Checkout fehlgeschlagen. Bitte erneut versuchen.' };
  }
}
