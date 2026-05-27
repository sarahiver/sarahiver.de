import { NextResponse, type NextRequest } from 'next/server';

/**
 * Multi-Tenant Middleware
 *
 * Erkennt Subdomain-basierte Hochzeitsseiten und rewrites die URL intern.
 *
 * Beispiele:
 *   sarah-und-iver.sarahiver.de       → /site/sarah-und-iver
 *   sarah-und-iver.sarahiver.de/rsvp  → /site/sarah-und-iver/rsvp
 *   sarahiver.de (Hauptdomain)        → kein Rewrite (oder Marketing-Redirect)
 *   localhost:3000?slug=demo          → /site/demo (Dev-Fallback)
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') ?? '';
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'sarahiver.de';

  // === Dev-Fallback: ?slug=demo in URL ===
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const slugParam = url.searchParams.get('slug');
    if (slugParam && !url.pathname.startsWith('/site/')) {
      const newPath = `/site/${slugParam}${url.pathname === '/' ? '' : url.pathname}`;
      url.pathname = newPath;
      url.searchParams.delete('slug');
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // === Production: Subdomain extrahieren ===
  // sarah-und-iver.sarahiver.de → sarah-und-iver
  const hostnameWithoutPort = hostname.split(':')[0];
  const isAppDomain =
    hostnameWithoutPort === appDomain ||
    hostnameWithoutPort === `www.${appDomain}`;

  if (isAppDomain) {
    // Hauptdomain → ggf. redirect zur Marketing-Page (separates Projekt)
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
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static
     * - _next/image
     * - favicon, robots, sitemap
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
