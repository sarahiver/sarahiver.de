/**
 * Pricing-Logik für sarahiver.de v4
 *
 * Basis: 19€/Monat (4 Basis-Bereiche)
 * 11 Zusatz-Bereiche mit Volumen-Rabatt
 *
 * Stufen kalibriert für 11 Zusatz-Bereiche:
 * - 1 Bereich: +4€ (Stückpreis)
 * - 2: +7€ (3€ marginal)
 * - 3: +9€ (2€ marginal) ⭐ "Sweet Spot"
 * - 4: +11€
 * - 5: +13€
 * - 6: +15€
 * - 7: +17€
 * - 8-11: +20€ (Cap = "Komplettpaket")
 *
 * Mindest-Laufzeit: 12 Monate (siehe PRICING_TERMS)
 */

export const BASE_PRICE = 19;
export const COMPLETE_PACKAGE_PRICE = 20;
export const MIN_TERM_MONTHS = 12;
export const ACCESS_PERIOD_MONTHS = 18;

/**
 * Aufpreis-Tabelle: Index = Anzahl Add-On-Bereiche
 */
export const ADDON_PRICES = [0, 4, 7, 9, 11, 13, 15, 17, 20, 20, 20, 20] as const;

export const TOTAL_ADDONS = 11;

export function calculateAddonPrice(count: number): number {
  if (count <= 0) return 0;
  if (count >= 8) return COMPLETE_PACKAGE_PRICE;
  return ADDON_PRICES[count];
}

export function calculateSavings(count: number): {
  monthly: number;
  yearly: number;
  percentage: number;
} {
  if (count <= 1) return { monthly: 0, yearly: 0, percentage: 0 };
  const withoutDiscount = count * 4;
  const actualPrice = calculateAddonPrice(count);
  const monthly = Math.max(0, withoutDiscount - actualPrice);
  return {
    monthly,
    yearly: monthly * MIN_TERM_MONTHS,
    percentage: withoutDiscount > 0 ? Math.round((monthly / withoutDiscount) * 100) : 0,
  };
}

export function calculateTotal(count: number): number {
  return BASE_PRICE + calculateAddonPrice(count);
}

/**
 * Gesamt-Vertragskosten über die Mindestlaufzeit.
 * Beantwortet die Frage "Was kostet mich das insgesamt?"
 */
export function calculateLifetimeCost(count: number): number {
  return calculateTotal(count) * MIN_TERM_MONTHS;
}
