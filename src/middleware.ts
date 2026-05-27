import { NextResponse, type NextRequest } from 'next/server';

/**
 * Multi-Tenant Middleware mit Test-Modus
 *
 * Drei Routing-Modi:
 *
 *   1. PRODUCTION mit Subdomain:
 *      sarah-und-iver.sarahiver.de → /site/sarah-und-iver
 *
 *   2. PREVIEW/STAGING auf Vercel (vercel.app oder andere Test-Domain):
 *      sarahiver-de.vercel.app?slug=sarah-und-iver-demo → /site/sarah-und-iver-demo
 *      → funktioniert solange echte Domain noch nicht eingebunden ist
 *
 *   3. LOCAL DEV:
 *      localhost:3000?slug=sarah-und-iver-demo → /site/sarah-und-iver-demo
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') ?? '';
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'sarahiver.de';
  const hostnameWithoutPort = hostname.split(':')[0];

  // === MODE 2 + 3: Query-Param-Mode (für vercel.app, localhost) ===
  // Aktiviert sich für alle Hosts, die NICHT die App-Domain sind.
  const isAppDomain =
    hostnameWithoutPort === appDomain ||
    hostnameWithoutPort === `www.${appDomain}`;

  const isTestHost =
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.endsWith('.vercel.app');

  if (isTestHost) {
    const slugParam = url.searchParams.get('slug');
    if (slugParam && !url.pathname.startsWith('/site/')) {
      const newPath = `/site/${slugParam}${url.pathname === '/' ? '' : url.pathname}`;
      url.pathname = newPath;
      url.searchParams.delete('slug');
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // === MODE 1: Subdomain-basierte Multi-Tenancy ===
  if (isAppDomain) {
    // Hauptdomain → Homepage (Verweis auf Marketing-Page)
    return NextResponse.next();
  }

  // Subdomain extrahieren (alles vor .sarahiver.de)
  const subdomain = hostnameWithoutPort.replace(`.${appDomain}`, '');

  // Validierung: nur erlaubte Subdomain-Patterns
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/i.test(subdomain)) {
    return NextResponse.next();
  }

  // Bereits unter /site/ → keine doppelte Rewrite
  if (url.pathname.startsWith('/site/')) {
    return NextResponse.next();
  }

  // Rewrite zu /site/{subdomain}{path}
  const internalPath = `/site/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
  url.pathname = internalPath;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
