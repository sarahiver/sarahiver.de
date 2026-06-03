export const RESERVED_SLUGS = [
  'impressum', 'datenschutz', 'agb', 'av-vertrag', 'kontakt',
  'api', 'admin', 'dashboard', 'login', 'logout', 'signup', 'register',
  'auth', 'callback', 'auth-callback',
  'static', '_next', 'public', 'favicon', 'robots', 'sitemap', 'manifest',
  'home', 'index', 'app', 'www', 'mail', 'help', 'support',
  'about', 'blog', 'news', 'press', 'jobs', 'careers',
  'pricing', 'preise', 'features', 'funktionen', 'baukasten',
  'customizer', 'demo', 'demos', 'examples', 'beispiele',
  'roadmap', 'changelog',
  'oauth', 'sso',
  'sarahiver', 'iver', 'sarah',
] as const;

/**
 * Defensive Slug-Validierung.
 *
 * Beide Funktionen sind robust gegen undefined/null/non-string Input.
 * Vorher: slug.toLowerCase() crashte mit "Cannot read properties of
 * undefined (reading 'toLowerCase')" wenn slug fehlt (z.B. bei Pre-
 * Rendering oder Static Generation mit leeren params).
 */
export function isReservedSlug(slug: string | undefined | null): boolean {
  if (!slug || typeof slug !== 'string') return false;
  return RESERVED_SLUGS.includes(
    slug.toLowerCase() as (typeof RESERVED_SLUGS)[number],
  );
}

export function isValidSlugFormat(slug: string | undefined | null): boolean {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/i.test(slug);
}
