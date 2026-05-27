/**
 * Pricing-Logik für sarahiver.de
 *
 * Basis: 19€/Monat (4 Basis-Bereiche)
 * Add-Ons mit Volumen-Rabatt: 4€ Stückpreis → sinkt bis 15€ Komplett-Cap
 */

export const BASE_PRICE = 19;
export const FULL_PACKAGE_PRICE = 15;
export const TOTAL_ADDONS = 5; // 9 Bereiche gesamt – 4 Basis = 5 Zusatz-Bereiche

/**
 * Aufpreis-Tabelle: Index = Anzahl Add-On-Bereiche
 * Marginalpreis sinkt: 4 → +3 → +2 → +2 → +2 → +2
 */
export const ADDON_PRICES = [0, 4, 7, 9, 11, 13, 15] as const;

export function calculateAddonPrice(count: number): number {
  if (count <= 0) return 0;
  if (count >= 6) return FULL_PACKAGE_PRICE;
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
  const monthly = withoutDiscount - actualPrice;
  return {
    monthly,
    yearly: monthly * 12,
    percentage: Math.round((monthly / withoutDiscount) * 100),
  };
}

export function calculateTotal(count: number): number {
  return BASE_PRICE + calculateAddonPrice(count);
}
