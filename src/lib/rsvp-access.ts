import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

/**
 * RSVP-Zugangsnachweis.
 *
 * Nach erfolgreicher Code-Prüfung setzt der Server ein signiertes,
 * httpOnly-Cookie. Der finale Submit leitet seine Berechtigung ausschließlich
 * daraus ab — niemals aus dem Client-State. Ein manipuliertes `unlocked=true`
 * im Browser kann nichts absenden.
 *
 * INHALT des Tokens (keine Code-Daten!):
 *   sid  Site-ID  — die Freischaltung gilt nur für diese eine Hochzeitsseite
 *   ver  Code-Version (rsvp_code_updated_at als Zeitstempel in ms)
 *   exp  Ablaufzeit
 *
 * `ver` ist die eigentliche Invalidierung: Ändert das Paar seinen Code oder
 * schaltet den Schutz um, wandert `updated_at` weiter und jedes zuvor
 * ausgestellte Token passt nicht mehr — unabhängig von seiner Restlaufzeit.
 * Eine reine Ablaufzeit wäre als einziges Modell zu schwach.
 */

/** Zwei Stunden. Lang genug zum Ausfüllen, kurz genug für ein geteiltes Gerät. */
export const ACCESS_TTL_MS = 2 * 60 * 60 * 1000;

export interface AccessClaims {
  sid: string;
  ver: number;
  exp: number;
}

/**
 * Ein Cookie PRO SITE. Damit kann eine Freischaltung für Hochzeit A niemals
 * Hochzeit B entsperren, selbst wenn beide im selben Browser offen sind.
 * Die Site-ID steckt zusätzlich signiert im Token — der Name allein ist nur
 * die Ablage, nicht der Nachweis.
 */
export function accessCookieName(siteId: string): string {
  return `si_rsvp_${siteId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}`;
}

/**
 * In Production MUSS ein eigenes RSVP_ACCESS_SECRET gesetzt sein. Der
 * Rückfall auf den Service-Role-Key ist eine Entwicklungsbequemlichkeit und
 * darf sich nicht unbemerkt in den Betrieb schleichen: sonst hängen
 * Datenbankzugriff und Token-Signatur an demselben Schlüssel, und ein
 * Schlüsselwechsel entwertet beides zugleich.
 *
 * Fehlt das Secret in Production, ist das System fail-closed — es wird kein
 * Token ausgestellt und keines akzeptiert (siehe hasAccessSecret()).
 */
export function hasAccessSecret(): boolean {
  if (process.env.RSVP_ACCESS_SECRET) return true;
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[rsvp-access] RSVP_ACCESS_SECRET fehlt in Production. ' +
        'Der RSVP-Schutz bleibt geschlossen, bis das Secret gesetzt ist.',
    );
    return false;
  }
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function secret(): string {
  const own = process.env.RSVP_ACCESS_SECRET;
  if (own) return own;
  // Nur ausserhalb von Production.
  if (process.env.NODE_ENV !== 'production') {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  }
  return '';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createAccessToken(siteId: string, version: number, now = Date.now()): string {
  if (!hasAccessSecret()) throw new Error('RSVP access secret missing');
  const claims: AccessClaims = { sid: siteId, ver: version, exp: now + ACCESS_TTL_MS };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

/**
 * Prüft Signatur, Ablauf, Site-Bindung und Code-Version. Gibt nur
 * true/false zurück — der Aufrufer erfährt nicht, WORAN es lag, damit sich
 * daraus nichts ableiten lässt.
 */
export function verifyAccessToken(
  token: string | undefined,
  expected: { siteId: string; version: number },
  now = Date.now(),
): boolean {
  if (!hasAccessSecret()) return false;
  if (!token || !token.includes('.')) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expectedSig = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  let claims: AccessClaims;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return false;
  }

  if (claims.sid !== expected.siteId) return false;
  if (claims.ver !== expected.version) return false;
  if (!Number.isFinite(claims.exp) || claims.exp <= now) return false;
  return true;
}

/** Cookie-Flags. secure nur in Production, sonst scheitert die lokale Entwicklung. */
export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(ACCESS_TTL_MS / 1000),
  };
}

/** Client-Kennung fürs Rate Limit — gesalzener Hash, niemals die IP selbst. */
export function clientFingerprint(headers: Headers): string {
  // Vercel setzt x-forwarded-for; der erste Eintrag ist der ursprüngliche
  // Client. x-real-ip als Rückfall, sonst eine Konstante (dann greift das
  // Limit pro Site statt pro Client — bewusst konservativ).
  const fwd = headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
  return createHmac('sha256', secret()).update(`ip:${ip}`).digest('hex').slice(0, 32);
}

/** Nur für Tests/Seeds. */
export function randomToken(): string {
  return randomBytes(16).toString('hex');
}
