/**
 * Funnel — Single Source of Truth für Tiers, Bereiche & Pricing-Mapping.
 *
 * Räumt die alte Fragmentierung auf:
 *   - bereiche-katalog.ts nutzte Keys accomm/music/abc → hier auf DB-Keys
 *     (accommodations/musicwishes/weddingabc) normalisiert.
 *   - Tier-Modell ist eindeutig: 4 Standard-Bereiche (immer dabei) + 11 frei
 *     wählbare Zusatz-Bereiche. p11 = alle 11.
 *
 * Die DB-Keys hier MÜSSEN exakt `BereichKey` aus types/supabase.ts entsprechen,
 * weil sie in wedding_bereiche / wedding_purchases landen.
 */

export type Tier = 'std' | 'p3' | 'p6' | 'p9' | 'p11';

/** Immer enthalten (Basis 9 €). */
export const STANDARD_KEYS = ['hero', 'countdown', 'rsvp', 'lovestory'] as const;

/** Frei wählbare Zusatz-Bereiche (11). */
export const ADDON_KEYS = [
  'timeline',
  'directions',
  'accommodations',
  'gallery',
  'photoupload',
  'guestbook',
  'musicwishes',
  'gifts',
  'witnesses',
  'faq',
  'weddingabc',
] as const;

export type AddonKey = (typeof ADDON_KEYS)[number];

const ADDON_SET = new Set<string>(ADDON_KEYS);

/** Alte Konfigurator-/Katalog-Keys → DB-Keys. */
const LEGACY_ADDON_KEY: Record<string, AddonKey> = {
  accomm: 'accommodations',
  music: 'musicwishes',
  abc: 'weddingabc',
};

/** Normalisiert einen (evtl. alten) Zusatz-Key auf den DB-Key oder undefined. */
export function normalizeAddonKey(key: string): AddonKey | undefined {
  if (ADDON_SET.has(key)) return key as AddonKey;
  return LEGACY_ADDON_KEY[key];
}

/** Anzeigenamen je Bereich (Funnel-intern, kundenfreundlich). */
export const BEREICH_LABEL: Record<string, string> = {
  hero: 'Hero',
  countdown: 'Countdown',
  rsvp: 'RSVP',
  lovestory: 'Lovestory',
  timeline: 'Ablauf',
  directions: 'Anfahrt',
  accommodations: 'Übernachtung',
  gallery: 'Galerie',
  photoupload: 'Foto-Upload',
  guestbook: 'Gästebuch',
  musicwishes: 'Musikwünsche',
  gifts: 'Geschenke',
  witnesses: 'Trauzeugen',
  faq: 'FAQ',
  weddingabc: 'Hochzeits-ABC',
};

/** Tier-Stufen: Anzahl Zusatz-Bereiche → Tier + Monatspreis + Stripe-Env. */
export const TIERS: Record<Tier, { maxAddons: number; monthly: number; label: string; priceEnv: string }> = {
  std: { maxAddons: 0, monthly: 9, label: 'Standard', priceEnv: 'STRIPE_PRICE_STD' },
  p3: { maxAddons: 3, monthly: 14, label: 'Plus 3', priceEnv: 'STRIPE_PRICE_P3' },
  p6: { maxAddons: 6, monthly: 18, label: 'Plus 6', priceEnv: 'STRIPE_PRICE_P6' },
  p9: { maxAddons: 9, monthly: 21, label: 'Plus 9', priceEnv: 'STRIPE_PRICE_P9' },
  p11: { maxAddons: 11, monthly: 23, label: 'Komplett', priceEnv: 'STRIPE_PRICE_P11' },
};

/** Tier aus der Anzahl gewählter Zusatz-Bereiche. */
export function tierForCount(count: number): Tier {
  if (count <= 0) return 'std';
  if (count <= 3) return 'p3';
  if (count <= 6) return 'p6';
  if (count <= 9) return 'p9';
  return 'p11';
}

export const DOMAIN_MONTHLY_PRICE = 5;
export const DOMAIN_SETUP_PRICE = 39;

/** Monatspreis gesamt (Tier + optional Domain). */
export function monthlyTotal(count: number, domain: boolean): number {
  return TIERS[tierForCount(count)].monthly + (domain ? DOMAIN_MONTHLY_PRICE : 0);
}
