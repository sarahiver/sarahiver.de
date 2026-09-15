'use server';

import { getStripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { isReservedSlug, isValidSlugFormat } from '@/lib/slug-validation';
import { VALID_STYLE_IDS } from '@/lib/style-migration';
import { PRICE_ENV_DOMAIN, PRICE_ENV_WEBSITE } from '@/lib/pricing';

/**
 * Stripe-Checkout — Einmalzahlung (mode: 'payment').
 *
 * Kein Abo, kein Trial, keine Karte auf Vorrat: das Paar zahlt einmal, die
 * Seite wird im Webhook provisioniert. Alle Bereiche sind enthalten, deshalb
 * gibt es hier auch keine Bereichs-Auswahl mehr.
 */

export interface CheckoutInput {
  email: string;
  name1: string;
  name2: string;
  weddingDate: string; // YYYY-MM-DD
  slug: string;
  style: string;
  /** Eigene Domain als Add-on dazubuchen. */
  domain: boolean;
  /** Wunschdomain aus dem Domain-Check, z. B. "leaundben.de". */
  domainWish?: string;
}

export type CheckoutResult = { url: string } | { error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_RE = /^[a-z0-9äöüß][a-z0-9äöüß-]{1,62}\.[a-z]{2,20}$/;

export async function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const email = (input.email || '').trim().toLowerCase();
  const name1 = (input.name1 || '').trim();
  const name2 = (input.name2 || '').trim();
  const slug = (input.slug || '').trim().toLowerCase();
  const style = (input.style || '').trim();
  const weddingDate = (input.weddingDate || '').trim();
  const domainWish = (input.domainWish || '').trim().toLowerCase();

  // --- Validierung ---
  if (!EMAIL_RE.test(email)) return { error: 'Bitte eine gültige E-Mail angeben.' };
  if (!name1 || !name2) return { error: 'Bitte beide Namen angeben.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weddingDate)) {
    return { error: 'Bitte ein gültiges Hochzeitsdatum wählen.' };
  }
  if (!isValidSlugFormat(slug)) {
    return { error: 'Die Adresse darf nur Buchstaben, Zahlen und Bindestriche enthalten.' };
  }
  if (isReservedSlug(slug)) {
    return { error: 'Diese Adresse ist reserviert — bitte eine andere wählen.' };
  }
  if (!VALID_STYLE_IDS.includes(style as (typeof VALID_STYLE_IDS)[number])) {
    return { error: 'Bitte einen gültigen Stil wählen.' };
  }
  if (input.domain && domainWish && !DOMAIN_RE.test(domainWish)) {
    return { error: 'Die Wunschdomain sieht nicht gültig aus — z. B. lea-und-ben.de.' };
  }

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

  const websitePriceId = process.env[PRICE_ENV_WEBSITE];
  if (!websitePriceId) {
    console.error(`[startCheckout] Missing env ${PRICE_ENV_WEBSITE}`);
    return { error: 'Preis-Konfiguration fehlt. Bitte beim Anbieter melden.' };
  }

  const lineItems: { price: string; quantity: number }[] = [
    { price: websitePriceId, quantity: 1 },
  ];

  if (input.domain) {
    const domainPriceId = process.env[PRICE_ENV_DOMAIN];
    if (!domainPriceId) {
      console.error(`[startCheckout] Missing env ${PRICE_ENV_DOMAIN}`);
      return { error: 'Preis-Konfiguration fehlt. Bitte beim Anbieter melden.' };
    }
    lineItems.push({ price: domainPriceId, quantity: 1 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de';

  // Onboarding-Daten reisen als Metadata zum Webhook (dort wird provisioniert).
  const metadata: Record<string, string> = {
    slug,
    name1,
    name2,
    wedding_date: weddingDate,
    style,
    domain: input.domain ? '1' : '0',
    domain_wish: input.domain ? domainWish : '',
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      customer_creation: 'always',
      line_items: lineItems,
      allow_promotion_codes: true,
      // Rechnung für den Kunden — bei einer Einmalzahlung erzeugt Stripe die
      // sonst nicht automatisch.
      invoice_creation: { enabled: true },
      metadata,
      payment_intent_data: { metadata },
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
