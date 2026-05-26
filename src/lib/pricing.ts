/**
 * Pricing-Logik für sarahiver.de
 *
 * Single Source of Truth — wird sowohl von der Marketing-Site (Konfigurator)
 * als auch später vom Customer-Dashboard (Upgrade-Flow) genutzt.
 *
 * Modell:
 *  - Basis: 19€/Monat (4 Core-Components inklusive)
 *  - Add-Ons: Volumen-Rabatt (mehr Komponenten = günstiger pro Stück)
 *  - Komplett-Cap bei 15€ flat (egal ob 6, 7, 8 oder 9 Komponenten)
 */

export const BASE_PRICE = 19; // €/Monat
export const FULL_PACKAGE_PRICE = 15; // €/Monat Cap bei 6+ Komponenten

/**
 * Aufpreis-Tabelle: Index = Anzahl Add-On-Komponenten
 * Marginalpreis: 4€ → +3€ → +2€ → +2€ → +2€ → +2€ (= 15€ Cap)
 */
export const ADDON_PRICES = [0, 4, 7, 9, 11, 13, 15] as const;

/**
 * Berechnet den Aufpreis für eine gegebene Anzahl Add-On-Komponenten.
 * Bei 6+ Komponenten wird der "Komplett"-Cap angewendet.
 */
export function calculateAddonPrice(count: number): number {
  if (count <= 0) return 0;
  if (count >= 6) return FULL_PACKAGE_PRICE;
  return ADDON_PRICES[count];
}

/**
 * Berechnet die Ersparnis im Vergleich zum Einzelpreis (4€/Komponente).
 * Wird im UI als "Du sparst X€/Monat"-Badge angezeigt.
 */
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

/**
 * Gesamtpreis pro Monat (Basis + Add-Ons).
 */
export function calculateTotal(count: number): number {
  return BASE_PRICE + calculateAddonPrice(count);
}

/**
 * Marginalpreis: Was kostet die NÄCHSTE Komponente?
 * Wird in der UI als "Nächste Komponente nur +Xe€" angezeigt.
 */
export function calculateMarginalPrice(currentCount: number): number {
  if (currentCount >= 9) return 0; // Schon alle gewählt
  if (currentCount >= 6) return 0; // Schon im Komplett-Cap
  return ADDON_PRICES[currentCount + 1] - ADDON_PRICES[currentCount];
}
