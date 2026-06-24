'use server';

import { getStripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import {
  ADDON_KEYS,
  TIERS,
  tierForCount,
  normalizeAddonKey,
  type Tier,
  type AddonKey,
} from '@/lib/funnel';
import { revalidatePath } from 'next/cache';

/**
 * Nachbuchen — schaltet zusätzliche Zusatz-Bereiche frei.
 *
 * Preismodell = Tier-Stufen (funnel.ts), exakt wie im Signup-Funnel:
 *   - Standard (hero/countdown/rsvp/lovestory) immer gratis.
 *   - 11 Zusatz-Bereiche; die Anzahl bestimmt die Stufe std→p3→p6→p9→p11.
 *
 * Ablauf:
 *   1. Auth + Ownership prüfen.
 *   2. Neue Zusatz-Anzahl → neue Stufe berechnen.
 *   3. Wenn die Stufe steigt UND ein Stripe-Abo existiert: Tarif-Position im Abo
 *      auf den neuen Preis umstellen.
 *        · trialing → keine Proration, neuer Preis greift nach der Testphase.
 *        · aktiv    → anteilige Differenz wird sofort berechnet (transparent).
 *      Bleibt die Stufe gleich (Kapazität reicht), wird ohne Stripe-Änderung
 *      freigeschaltet — ist ja bereits bezahlt.
 *   4. Bereiche + Käufe in der DB anlegen (wie beim Provisioning).
 *
 * ⚠ Geld-relevant: vor Live-Schaltung im Stripe-TESTMODUS durchspielen
 *   (Upgrade während Trial UND im aktiven Abo).
 */

export type AddResult =
  | { ok: true; newTier: Tier; charged: boolean; added: AddonKey[] }
  | { error: string };

export async function addBereiche(slug: string, rawKeys: string[]): Promise<AddResult> {
  // --- 1) Auth ---
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Bitte zuerst anmelden.' };

  const admin = createSupabaseAdminClient();
  if (!admin) return { error: 'Service gerade nicht verfügbar.' };

  // --- Site + Ownership ---
  const { data: siteRow } = await admin
    .from('wedding_sites')
    .select('id, owner_user_id, user_id, subscription_tier, stripe_subscription_id, subscription_status')
    .eq('slug', slug)
    .maybeSingle();

  const site = siteRow as {
    id: string;
    owner_user_id: string | null;
    user_id: string | null;
    subscription_tier: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string | null;
  } | null;

  if (!site) return { error: 'Seite nicht gefunden.' };
  const owns = site.owner_user_id === user.id || site.user_id === user.id;
  if (!owns) return { error: 'Keine Berechtigung für diese Seite.' };

  // --- 2) Auswahl normalisieren ---
  const requested = Array.from(
    new Set(rawKeys.map((k) => normalizeAddonKey(k)).filter((k): k is AddonKey => Boolean(k))),
  );
  if (requested.length === 0) return { error: 'Bitte mindestens einen Bereich auswählen.' };

  // Aktuell gebuchte Zusatz-Bereiche
  const { data: purch } = await admin
    .from('wedding_purchases')
    .select('bereich_key')
    .eq('wedding_site_id', site.id);
  const purchasedAll = new Set((purch || []).map((p) => (p as { bereich_key: string }).bereich_key));
  const currentAddons = ADDON_KEYS.filter((k) => purchasedAll.has(k));

  const toAdd = requested.filter((k) => !purchasedAll.has(k));
  if (toAdd.length === 0) return { error: 'Diese Bereiche sind bereits gebucht.' };

  const newAddonCount = currentAddons.length + toAdd.length;
  if (newAddonCount > ADDON_KEYS.length) return { error: 'Zu viele Bereiche ausgewählt.' };

  const currentTier = (site.subscription_tier as Tier) || tierForCount(currentAddons.length);
  const newTier = tierForCount(newAddonCount);

  let charged = false;

  // --- 3) Stripe: Tarif nur bei Stufenwechsel anpassen ---
  if (newTier !== currentTier) {
    const stripe = getStripe();
    if (!stripe) return { error: 'Zahlung gerade nicht verfügbar. Bitte später erneut.' };
    if (!site.stripe_subscription_id) {
      return { error: 'Kein aktives Abo gefunden. Bitte meldet euch kurz bei uns.' };
    }

    const newPriceId = process.env[TIERS[newTier].priceEnv];
    if (!newPriceId) {
      console.error('[addBereiche] Missing env', TIERS[newTier].priceEnv);
      return { error: 'Preis-Konfiguration fehlt. Bitte meldet euch bei uns.' };
    }

    // Alle bekannten Tier-Preise → um die Tarif-Position (nicht Domain) zu finden.
    const tierPriceIds = new Set(
      (Object.values(TIERS).map((t) => process.env[t.priceEnv]).filter(Boolean) as string[]),
    );

    try {
      const sub = await stripe.subscriptions.retrieve(site.stripe_subscription_id);
      const tierItem = sub.items.data.find((it) => it.price?.id && tierPriceIds.has(it.price.id));
      if (!tierItem) return { error: 'Tarif-Position im Abo nicht gefunden.' };

      const isTrialing = sub.status === 'trialing';
      await stripe.subscriptions.update(site.stripe_subscription_id, {
        items: [{ id: tierItem.id, price: newPriceId }],
        proration_behavior: isTrialing ? 'none' : 'always_invoice',
      });
      charged = !isTrialing;
    } catch (err) {
      console.error('[addBereiche] stripe update failed:', err);
      return { error: 'Das Abo konnte nicht aktualisiert werden. Bitte erneut versuchen.' };
    }

    await admin.from('wedding_sites').update({ subscription_tier: newTier } as never).eq('id', site.id);
  }

  // --- 4) Freischalten: Käufe + Bereiche ---
  const purchaseRows = toAdd.map((key) => ({ wedding_site_id: site.id, bereich_key: key }));
  const { error: pErr } = await admin.from('wedding_purchases').insert(purchaseRows as never);
  if (pErr) console.error('[addBereiche] purchases insert failed:', pErr);

  const { data: existingBer } = await admin
    .from('wedding_bereiche')
    .select('bereich_key, display_order')
    .eq('wedding_site_id', site.id);
  const existingKeys = new Set((existingBer || []).map((b) => (b as { bereich_key: string }).bereich_key));
  const maxOrder = (existingBer || []).reduce(
    (m, b) => Math.max(m, (b as { display_order: number }).display_order ?? 0),
    0,
  );
  const bereicheRows = toAdd
    .filter((k) => !existingKeys.has(k))
    .map((key, i) => ({
      wedding_site_id: site.id,
      bereich_key: key,
      variant: 'a',
      display_order: maxOrder + 1 + i,
      is_active: true,
      content: {},
      content_draft: {},
      content_published: {},
    }));
  if (bereicheRows.length > 0) {
    const { error: bErr } = await admin.from('wedding_bereiche').insert(bereicheRows as never);
    if (bErr) console.error('[addBereiche] bereiche insert failed:', bErr);
  }

  revalidatePath(`/dashboard/${slug}`);
  revalidatePath(`/dashboard/${slug}/upgrade`);

  return { ok: true, newTier, charged, added: toAdd };
}
