/**
 * Reserved Slugs für sarahiver.de
 *
 * Diese Pfade werden NICHT als Hochzeit-Slug behandelt, sondern bleiben
 * der Marketing-Welt oder System-Routes vorbehalten.
 *
 * Wenn ein Brautpaar versucht, einen dieser Slugs zu nehmen, bekommt
 * es eine Validation-Fehlermeldung (im Customer-Dashboard).
 *
 * Wenn jemand /impressum aufruft, läuft das durch die statische Marketing-Route
 * /impressum/page.tsx — NICHT durch [slug]/page.tsx. Next.js priorisiert statische
 * Routes über dynamische, daher reicht diese Liste eigentlich nur als Schutz
 * für den Slug-Validator im Customer-Editor.
 */

export const RESERVED_SLUGS = [
  // Marketing-Pages
  'impressum',
  'datenschutz',
  'agb',
  'av-vertrag',
  'kontakt',

  // System-Routes
  'api',
  'admin',
  'dashboard',
  'login',
  'logout',
  'signup',
  'register',
  'auth',
  'callback',
  'auth-callback',

  // Static Assets
  'static',
  '_next',
  'public',
  'favicon',
  'robots',
  'sitemap',
  'manifest',

  // Häufige falsche Eingaben
  'home',
  'index',
  'app',
  'www',
  'mail',
  'help',
  'support',
  'about',
  'blog',
  'news',
  'press',
  'jobs',
  'careers',

  // Geschäfts-Relevant
  'pricing',
  'preise',
  'features',
  'funktionen',
  'baukasten',
  'customizer',
  'demo',
  'demos',
  'examples',
  'beispiele',
  'roadmap',
  'changelog',

  // Auth-Provider-Endings
  'oauth',
  'sso',

  // Schwester-Produkt
  'sarahiver',
  'iver',
  'sarah',
] as const;

/**
 * Prüft, ob ein Slug reserviert ist.
 * Case-insensitive.
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as (typeof RESERVED_SLUGS)[number]);
}

/**
 * Validiert ein Slug-Format.
 * Erlaubt: a-z, 0-9, Bindestriche; 3-63 Zeichen; nicht mit Bindestrich
 * starten/enden.
 */
export function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/i.test(slug);
}
