/**
 * Pricing v5 — Einmalzahlung (Entscheidung Sept. 2026).
 *
 * Löst das Abo-Modell (19 €/Monat + Bereiche-Staffel) vollständig ab:
 *   - EIN Preis, EINE Zahlung, alle Bereiche inklusive
 *   - Laufzeit statt Abo: die Seite ist einen definierten Zeitraum online
 *   - Keine Verlängerung im MVP (bewusste Entscheidung)
 *
 * Diese Datei ist die einzige Quelle für Preise und Laufzeit. Stripe-Preise
 * werden NICHT hier gepflegt, sondern in Vercel-Envs (siehe PRICE_ENV_*),
 * damit Test- und Live-Modus denselben Code teilen.
 */

/** Anzeigepreise (nur für die UI — abgerechnet wird der Stripe-Price). */
export const WEBSITE_PRICE_EUR = 69;
export const DOMAIN_SETUP_PRICE_EUR = 39;

/**
 * Custom Domain (+39 €) ist im MVP NICHT kaufbar: Routing, DNS-Einrichtung und
 * Statusverwaltung sind noch nicht gebaut. Der Backend-Code (Speicherung,
 * Webhook, Provisionierung) bleibt erhalten; bestehende Datensätze mit
 * custom_domain werden nicht angefasst. Auf true stellen, sobald das
 * Domain-System End-to-End funktioniert.
 */
export const CUSTOM_DOMAIN_ENABLED = false;

/** Stripe-Price-IDs kommen aus diesen Environment-Variablen. */
export const PRICE_ENV_WEBSITE = 'STRIPE_PRICE_WEBSITE';
export const PRICE_ENV_DOMAIN = 'STRIPE_PRICE_DOMAIN_SETUP';

/** Grundlaufzeit ab Kaufdatum. */
export const ACCESS_MONTHS = 12;

/**
 * Mindestlaufzeit NACH dem Hochzeitstag.
 *
 * Grund: wer die Seite als Save-the-Date 14 Monate vor der Hochzeit anlegt,
 * hätte mit reinen "12 Monate ab Kauf" eine abgelaufene Seite genau am
 * Hochzeitstag. Ohne Verlängerungsoption im MVP wäre das ein Supportfall
 * ohne Lösung. Deshalb: die Laufzeit endet frühestens 3 Monate nach der
 * Hochzeit — in aller Regel greift trotzdem die 12-Monats-Regel.
 */
export const MIN_MONTHS_AFTER_WEDDING = 3;

function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const targetDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Monatsenden abfangen (31.01. + 1 Monat → 03.03. statt 28.02.)
  if (d.getDate() < targetDay) d.setDate(0);
  return d;
}

/**
 * Enddatum der Laufzeit: 12 Monate ab Kauf, mindestens aber 3 Monate nach
 * dem Hochzeitsdatum. Ohne gültiges Hochzeitsdatum greift nur die 12er-Regel.
 */
export function computeAccessUntil(paidAt: Date, weddingDateISO?: string | null): Date {
  const base = addMonths(paidAt, ACCESS_MONTHS);

  if (!weddingDateISO) return base;
  const wedding = new Date(weddingDateISO);
  if (Number.isNaN(wedding.getTime())) return base;

  const floor = addMonths(wedding, MIN_MONTHS_AFTER_WEDDING);
  return floor.getTime() > base.getTime() ? floor : base;
}

/** Volle Resttage bis zu einem ISO-Zeitpunkt (0, wenn bereits vorbei). */
export function daysUntil(iso: string): number {
  const end = new Date(iso).getTime();
  if (!Number.isFinite(end)) return NaN;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

/** "14. Juli 2027" */
export function formatDateDe(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
