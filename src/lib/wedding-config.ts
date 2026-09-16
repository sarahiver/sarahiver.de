import { ALL_BEREICH_KEYS, BEREICH_LABEL } from './funnel';
import { VALID_STYLE_IDS, type StyleId } from './style-migration';

/**
 * Konfiguration einer Hochzeitsseite: welcher Stil, und welche Variante je
 * Bereich.
 *
 * Bewusst KEIN QA-Sonderformat. Die Bereich-Keys kommen aus lib/funnel.ts
 * (dieselben Keys wie in der Tabelle wedding_bereiche), die Stil-IDs aus
 * lib/style-migration.ts. /allelements baut daraus dieselben Objekte, die
 * BereichRenderer im Produktivpfad bekommt — und das Dashboard kann später
 * dieselbe Struktur speichern, ohne dass ein zweites System entsteht.
 */

export type ComponentVariant = 'a' | 'b' | 'c';

export const COMPONENT_VARIANTS: readonly ComponentVariant[] = ['a', 'b', 'c'];

/** Die 15 Bereiche in der Reihenfolge, in der sie auf der Seite stehen. */
export const PAGE_ORDER = [
  'hero',
  'countdown',
  'lovestory',
  'gallery',
  'timeline',
  'directions',
  'accommodations',
  'witnesses',
  'gifts',
  'faq',
  'rsvp',
  'guestbook',
  'musicwishes',
  'photoupload',
  'weddingabc',
] as const;

export type BereichKey = (typeof PAGE_ORDER)[number];

/**
 * Sicherheitsnetz: PAGE_ORDER ist eine Reihenfolge-Entscheidung, aber es
 * müssen exakt dieselben 15 Keys sein wie im Funnel. Weicht das ab, fällt es
 * beim Build auf und nicht erst in der Review.
 */
const FUNNEL_SET = new Set<string>(ALL_BEREICH_KEYS);
export const PAGE_ORDER_MATCHES_FUNNEL =
  PAGE_ORDER.length === ALL_BEREICH_KEYS.length &&
  PAGE_ORDER.every((k) => FUNNEL_SET.has(k));

export interface WeddingPageConfiguration {
  style: StyleId;
  variants: Record<BereichKey, ComponentVariant>;
}

/** Alle Bereiche auf dieselbe Variante — die drei Schnelltests A/B/C. */
export function presetConfiguration(
  style: StyleId,
  variant: ComponentVariant,
): WeddingPageConfiguration {
  const variants = Object.fromEntries(
    PAGE_ORDER.map((k) => [k, variant]),
  ) as Record<BereichKey, ComponentVariant>;
  return { style, variants };
}

export function defaultConfiguration(): WeddingPageConfiguration {
  return presetConfiguration(VALID_STYLE_IDS[0] as StyleId, 'a');
}

/** Anzeigename je Bereich — aus dem Funnel, damit es nur eine Liste gibt. */
export function bereichLabel(key: BereichKey): string {
  return BEREICH_LABEL[key] ?? key;
}

export function isComponentVariant(v: string): v is ComponentVariant {
  return v === 'a' || v === 'b' || v === 'c';
}

/**
 * Konfiguration ⇄ URL. /allelements hält seinen Zustand in der Adresszeile,
 * damit ein Fund per Link teilbar ist ("schau dir Opulent, Gallery C an").
 * Format: `hero:a,countdown:b,…` — nur abweichende Bereiche.
 */
export function variantsToParam(
  variants: Record<BereichKey, ComponentVariant>,
  base: ComponentVariant = 'a',
): string {
  return PAGE_ORDER.filter((k) => variants[k] !== base)
    .map((k) => `${k}:${variants[k]}`)
    .join(',');
}

export function variantsFromParam(
  param: string | undefined | null,
  base: ComponentVariant = 'a',
): Record<BereichKey, ComponentVariant> {
  const variants = Object.fromEntries(
    PAGE_ORDER.map((k) => [k, base]),
  ) as Record<BereichKey, ComponentVariant>;

  if (!param) return variants;

  for (const pair of param.split(',')) {
    const [key, value] = pair.split(':');
    if ((PAGE_ORDER as readonly string[]).includes(key) && isComponentVariant(value)) {
      variants[key as BereichKey] = value;
    }
  }
  return variants;
}
