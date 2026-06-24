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
 * Pakete verwalten — Hoch- UND Runterbuchen.
 *
 * Preismodell = Tier-Stufen (funnel.ts): Standard (hero/countdown/rsvp/lovestory)
 * gratis, 11 Zusatz-Bereiche, deren Anzahl die Stufe std→p3→p6→p9→p11 bestimmt.
 *
 *   addBereiche()          — sofort hochbuchen (Upgrade), siehe unten.
 *   scheduleDowngrade()    — zum Periodenende runterbuchen (Downgrade).
 *   cancelPendingDowngrade — geplanten Downgrade wieder aufheben.
 *
 * Reihenfolge der Tier-Wertigkeit für Vergleiche.
 *
 * ⚠ Geld-relevant: vor Live im Stripe-TESTMODUS prüfen (Up, Down, Cancel;
 *   jeweils im Trial und im aktiven Abo).
 */

const TIER_ORDER: Tier[] = ['std', 'p3', 'p6', 'p9', 'p11'];
const tierRank = (t: Tier) => TIER_ORDER.indexOf(t);

/** Null-sicheres Auslesen des Perioden-Endes (Renewal) aus einer Subscription. */
function subPeriodEnd(sub: unknown): number | null {
  const root = (sub as { current_period_end?: number }).current_period_end;
  const item = ((sub as { items?: { data?: Array<{ current_period_end?: number }> } }).items?.data?.[0])
    ?.current_period_end;
  return root ?? item ?? null;
}

/** Set der bekannten Tier-Preis-IDs (um die Tarif-Position im Abo zu finden). */
function tierPriceIdSet(): Set<string> {
  return new Set(Object.values(TIERS).map((t) => process.env[t.priceEnv]).filter(Boolean) as string[]);
}

// ===========================================================================
// UPGRADE
// ===========================================================================

export type AddResult =
  | { ok: true; newTier: Tier; charged: boolean; added: AddonKey[] }
  | { error: string };

export async function addBereiche(slug: string, rawKeys: string[]): Promise<AddResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Bitte zuerst anmelden.' };

  const admin = createSupabaseAdminClient();
  if (!admin) return { error: 'Service gerade nicht verfügbar.' };

  const { data: siteRow } = await admin
    .from('wedding_sites')
    .select(
      'id, owner_user_id, user_id, subscription_tier, stripe_subscription_id, subscription_status, pending_tier',
    )
    .eq('slug', slug)
    .maybeSingle();

  const site = siteRow as {
    id: string;
    owner_user_id: string | null;
    user_id: string | null;
    subscription_tier: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string | null;
    pending_tier: string | null;
  } | null;

  if (!site) return { error: 'Seite nicht gefunden.' };
  const owns = site.owner_user_id === user.id || site.user_id === user.id;
  if (!owns) return { error: 'Keine Berechtigung für diese Seite.' };

  // Kein Dazubuchen, solange ein Downgrade geplant ist (sonst widersprüchlicher
  // Stripe-Zustand). Erst aufheben, dann neu entscheiden.
  if (site.pending_tier) {
    return { error: 'Ihr habt einen geplanten Stufenwechsel. Bitte hebt ihn zuerst auf.' };
  }

  const requested = Array.from(
    new Set(rawKeys.map((k) => normalizeAddonKey(k)).filter((k): k is AddonKey => Boolean(k))),
  );
  if (requested.length === 0) return { error: 'Bitte mindestens einen Bereich auswählen.' };

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
    const tierPriceIds = tierPriceIdSet();
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

  // Freischalten: Käufe + Bereiche. Bereits existierende (z. B. früher
  // heruntergebuchte) Bereich-Zeilen werden REAKTIVIERT statt neu angelegt —
  // so kommen ihre Inhalte zurück.
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

  const reactivate = toAdd.filter((k) => existingKeys.has(k));
  const freshKeys = toAdd.filter((k) => !existingKeys.has(k));

  if (reactivate.length > 0) {
    const { error: rErr } = await admin
      .from('wedding_bereiche')
      .update({ is_active: true, is_active_draft: true, is_dirty: true } as never)
      .eq('wedding_site_id', site.id)
      .in('bereich_key', reactivate);
    if (rErr) console.error('[addBereiche] reactivate failed:', rErr);
  }

  if (freshKeys.length > 0) {
    const bereicheRows = freshKeys.map((key, i) => ({
      wedding_site_id: site.id,
      bereich_key: key,
      variant: 'a',
      display_order: maxOrder + 1 + i,
      is_active: true,
      content: {},
      content_draft: {},
      content_published: {},
    }));
    const { error: bErr } = await admin.from('wedding_bereiche').insert(bereicheRows as never);
    if (bErr) console.error('[addBereiche] bereiche insert failed:', bErr);
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  revalidatePath(`/dashboard/${slug}/upgrade`);

  return { ok: true, newTier, charged, added: toAdd };
}

// ===========================================================================
// DOWNGRADE (zum Periodenende)
// ===========================================================================

export type DowngradeResult =
  | { ok: true; newTier: Tier; effectiveAt: string | null }
  | { error: string };

/**
 * Plant einen Downgrade: das Paar wählt, welche Zusatz-Bereiche es BEHALTEN
 * will (`keepKeys`). Daraus ergibt sich die neue, niedrigere Stufe.
 *
 * - Greift zum Periodenende: bis dahin bleibt alles online und bezahlt.
 * - Stripe: Tarif wird mit proration_behavior 'none' getauscht → keine
 *   Gutschrift/Rückzahlung, die nächste Rechnung läuft bereits auf die
 *   günstigere Stufe.
 * - Inhalte werden NICHT gelöscht. Erst zum Stichtag deaktiviert der Cron
 *   /api/cron/apply-downgrades die abgewählten Bereiche (is_active=false) und
 *   entfernt ihre Käufe. Die Bereich-Zeilen + Inhalte bleiben erhalten und
 *   kommen beim erneuten Hochbuchen zurück.
 */
export async function scheduleDowngrade(slug: string, rawKeepKeys: string[]): Promise<DowngradeResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Bitte zuerst anmelden.' };

  const admin = createSupabaseAdminClient();
  if (!admin) return { error: 'Service gerade nicht verfügbar.' };

  const { data: siteRow } = await admin
    .from('wedding_sites')
    .select('id, owner_user_id, user_id, subscription_tier, stripe_subscription_id')
    .eq('slug', slug)
    .maybeSingle();

  const site = siteRow as {
    id: string;
    owner_user_id: string | null;
    user_id: string | null;
    subscription_tier: string | null;
    stripe_subscription_id: string | null;
  } | null;

  if (!site) return { error: 'Seite nicht gefunden.' };
  const owns = site.owner_user_id === user.id || site.user_id === user.id;
  if (!owns) return { error: 'Keine Berechtigung für diese Seite.' };

  // Aktuell gebuchte Zusatz-Bereiche
  const { data: purch } = await admin
    .from('wedding_purchases')
    .select('bereich_key')
    .eq('wedding_site_id', site.id);
  const purchasedAll = new Set((purch || []).map((p) => (p as { bereich_key: string }).bereich_key));
  const currentAddons = ADDON_KEYS.filter((k) => purchasedAll.has(k));

  // Behalten-Auswahl: nur gültige, aktuell gebuchte Zusatz-Keys.
  const keep = Array.from(
    new Set(rawKeepKeys.map((k) => normalizeAddonKey(k)).filter((k): k is AddonKey => Boolean(k))),
  ).filter((k) => purchasedAll.has(k));

  const newTier = tierForCount(keep.length);
  const currentTier = (site.subscription_tier as Tier) || tierForCount(currentAddons.length);

  if (tierRank(newTier) >= tierRank(currentTier)) {
    return { error: 'Das ist kein Downgrade. Zum Erweitern bitte „Bereiche dazubuchen" nutzen.' };
  }

  const stripe = getStripe();
  if (!stripe) return { error: 'Zahlung gerade nicht verfügbar. Bitte später erneut.' };
  if (!site.stripe_subscription_id) {
    return { error: 'Kein aktives Abo gefunden. Bitte meldet euch kurz bei uns.' };
  }
  const newPriceId = process.env[TIERS[newTier].priceEnv];
  if (!newPriceId) {
    console.error('[scheduleDowngrade] Missing env', TIERS[newTier].priceEnv);
    return { error: 'Preis-Konfiguration fehlt. Bitte meldet euch bei uns.' };
  }

  let effectiveAtIso: string | null = null;
  const tierPriceIds = tierPriceIdSet();
  try {
    const sub = await stripe.subscriptions.retrieve(site.stripe_subscription_id);
    const tierItem = sub.items.data.find((it) => it.price?.id && tierPriceIds.has(it.price.id));
    if (!tierItem) return { error: 'Tarif-Position im Abo nicht gefunden.' };

    const periodEnd = subPeriodEnd(sub);
    effectiveAtIso = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

    // proration_behavior 'none': kein Mid-Cycle-Charge/Gutschrift, nächste
    // Rechnung läuft auf die günstigere Stufe. Zugang bleibt app-seitig bis
    // zum Stichtag bestehen (Cron deaktiviert dann die Bereiche).
    await stripe.subscriptions.update(site.stripe_subscription_id, {
      items: [{ id: tierItem.id, price: newPriceId }],
      proration_behavior: 'none',
    });
  } catch (err) {
    console.error('[scheduleDowngrade] stripe update failed:', err);
    return { error: 'Der Wechsel konnte nicht geplant werden. Bitte erneut versuchen.' };
  }

  // Pending-Zustand merken — subscription_tier bleibt vorerst die alte Stufe,
  // damit das Dashboard „aktuell X, wechselt am Y auf Z" zeigt.
  const { error: uErr } = await admin
    .from('wedding_sites')
    .update({
      pending_tier: newTier,
      pending_downgrade_at: effectiveAtIso,
      pending_keep_keys: keep,
    } as never)
    .eq('id', site.id);
  if (uErr) {
    console.error('[scheduleDowngrade] pending update failed:', uErr);
    return { error: 'Der Wechsel konnte nicht gespeichert werden. Bitte erneut versuchen.' };
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  revalidatePath(`/dashboard/${slug}/upgrade`);

  return { ok: true, newTier, effectiveAt: effectiveAtIso };
}

/** Hebt einen geplanten Downgrade wieder auf — Tarif zurück auf die aktuelle Stufe. */
export async function cancelPendingDowngrade(slug: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Bitte zuerst anmelden.' };

  const admin = createSupabaseAdminClient();
  if (!admin) return { error: 'Service gerade nicht verfügbar.' };

  const { data: siteRow } = await admin
    .from('wedding_sites')
    .select('id, owner_user_id, user_id, subscription_tier, stripe_subscription_id, pending_tier')
    .eq('slug', slug)
    .maybeSingle();

  const site = siteRow as {
    id: string;
    owner_user_id: string | null;
    user_id: string | null;
    subscription_tier: string | null;
    stripe_subscription_id: string | null;
    pending_tier: string | null;
  } | null;

  if (!site) return { error: 'Seite nicht gefunden.' };
  const owns = site.owner_user_id === user.id || site.user_id === user.id;
  if (!owns) return { error: 'Keine Berechtigung für diese Seite.' };
  if (!site.pending_tier) return { ok: true }; // nichts geplant

  const currentTier = (site.subscription_tier as Tier) || 'std';
  const currentPriceId = process.env[TIERS[currentTier].priceEnv];
  const stripe = getStripe();

  if (stripe && site.stripe_subscription_id && currentPriceId) {
    const tierPriceIds = tierPriceIdSet();
    try {
      const sub = await stripe.subscriptions.retrieve(site.stripe_subscription_id);
      const tierItem = sub.items.data.find((it) => it.price?.id && tierPriceIds.has(it.price.id));
      if (tierItem) {
        await stripe.subscriptions.update(site.stripe_subscription_id, {
          items: [{ id: tierItem.id, price: currentPriceId }],
          proration_behavior: 'none',
        });
      }
    } catch (err) {
      console.error('[cancelPendingDowngrade] stripe revert failed:', err);
      return { error: 'Aufheben fehlgeschlagen. Bitte erneut versuchen.' };
    }
  }

  const { error: uErr } = await admin
    .from('wedding_sites')
    .update({ pending_tier: null, pending_downgrade_at: null, pending_keep_keys: null } as never)
    .eq('id', site.id);
  if (uErr) {
    console.error('[cancelPendingDowngrade] clear failed:', uErr);
    return { error: 'Aufheben fehlgeschlagen. Bitte erneut versuchen.' };
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  revalidatePath(`/dashboard/${slug}/upgrade`);
  return { ok: true };
}
