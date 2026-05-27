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

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as (typeof RESERVED_SLUGS)[number]);
}

export function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/i.test(slug);
}
