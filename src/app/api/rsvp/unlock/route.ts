import { NextResponse } from 'next/server';
import {
  accessCookieName,
  accessCookieOptions,
  clientFingerprint,
  createAccessToken,
  hasAccessSecret,
} from '@/lib/rsvp-access';
import {
  checkRsvpCode,
  isRateLimited,
  loadRsvpSiteContext,
  recordAttempt,
} from '@/lib/rsvp-server';

/**
 * POST /api/rsvp/unlock — Einladungscode prüfen.
 *
 * Erfolg: signiertes, httpOnly-Cookie für GENAU diese Site, gebunden an die
 * aktuelle Code-Version. Das Cookie ist der einzige Nachweis, den der spätere
 * Submit akzeptiert.
 *
 * Der eingegebene Code verlässt diese Funktion nicht: kein Log, keine
 * Fehlermeldung, kein Rate-Limit-Datensatz enthält ihn.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GENERIC_WRONG =
  'Der Einladungscode stimmt leider nicht. Bitte prüft den Code auf eurer Einladung.';

export async function POST(request: Request) {
  let body: { slug?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const slug = (body.slug || '').trim();
  const code = body.code || '';

  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
  }
  // Länge vorab begrenzen, damit bcrypt nicht mit Megabyte gefüttert wird.
  if (typeof code !== 'string' || code.length > 200) {
    return NextResponse.json({ ok: false, error: GENERIC_WRONG }, { status: 400 });
  }

  // Fehlt in Production das eigene Secret, wird nicht heimlich auf den
  // Service-Role-Key ausgewichen — dann bleibt der Schutz geschlossen.
  if (!hasAccessSecret()) {
    return NextResponse.json(
      { ok: false, error: 'Die Rückmeldung ist gerade nicht möglich. Bitte versucht es später erneut.' },
      { status: 503 },
    );
  }

  const ctx = await loadRsvpSiteContext(slug);
  if (!ctx) {
    return NextResponse.json({ ok: false, error: 'Hochzeitsseite nicht gefunden.' }, { status: 404 });
  }

  // Schutz aus oder kein Code hinterlegt: nichts zu entsperren.
  if (!ctx.codeEnabled || !ctx.hasCode) {
    return NextResponse.json({ ok: true, unlocked: true, required: false });
  }

  const client = clientFingerprint(request.headers);

  if (await isRateLimited(ctx.siteId, client)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Zu viele Versuche. Bitte probiert es in einigen Minuten noch einmal.',
      },
      { status: 429 },
    );
  }

  const valid = await checkRsvpCode(ctx.siteId, code);
  await recordAttempt(ctx.siteId, client, valid);

  if (!valid) {
    // Bewusst identische Antwort für „falscher Code", „leerer Code" und
    // „kein Code hinterlegt, aber Schutz an" — keine Rückschlüsse möglich.
    return NextResponse.json({ ok: false, error: GENERIC_WRONG }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, unlocked: true, required: true });
  res.cookies.set(
    accessCookieName(ctx.siteId),
    createAccessToken(ctx.siteId, ctx.codeVersion),
    accessCookieOptions(),
  );
  return res;
}
