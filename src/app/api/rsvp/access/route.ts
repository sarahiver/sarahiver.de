import { NextResponse } from 'next/server';
import { accessCookieName, verifyAccessToken } from '@/lib/rsvp-access';
import { loadRsvpSiteContext } from '@/lib/rsvp-server';

/**
 * GET /api/rsvp/access?slug=… — Ist die Rückmeldung für DIESEN Browser offen?
 *
 * Zweck: Ein Gast, der die Seite innerhalb der gültigen Freischaltung erneut
 * öffnet, soll den Einladungscode nicht noch einmal eingeben müssen. Das
 * Access-Cookie ist httpOnly und für den Browser-Code unsichtbar — also fragt
 * die Komponente hier nach.
 *
 * Diese Route KONSUMIERT die Phase-1-Sicherheit, sie ersetzt nichts:
 *   - dieselbe Bedingung für „Schutz aktiv" wie POST /api/rsvp
 *   - dieselbe Token-Prüfung (Signatur, Ablauf, Site, Code-Version)
 *   - keine Token-Ausgabe, keine Verlängerung, keine Cookie-Änderung
 *
 * Die Antwort ist reine Anzeige-Information. Autorisiert wird weiterhin
 * ausschließlich beim Submit. Ein Client, der `unlocked: true` fälscht, sieht
 * nur ein Formular, dessen Absenden mit 401 endet.
 *
 * Preisgegeben wird nur, ob der Schutz an ist (war schon vorher über das
 * Verhalten der Seite erkennbar) und ob das eigene Cookie gilt.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get('slug') || '').trim().slice(0, 120);
  if (!slug) {
    return NextResponse.json({ ok: false }, { status: 400, headers: NO_STORE });
  }

  const ctx = await loadRsvpSiteContext(slug);
  if (!ctx) {
    return NextResponse.json({ ok: false }, { status: 404, headers: NO_STORE });
  }

  // Exakt die Bedingung aus POST /api/rsvp — sonst könnte die Anzeige
  // „offen" sagen, während der Submit den Code verlangt (oder umgekehrt).
  const required = ctx.codeEnabled && ctx.hasCode;
  if (!required) {
    return NextResponse.json(
      { ok: true, required: false, unlocked: true },
      { headers: NO_STORE },
    );
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const name = accessCookieName(ctx.siteId);
  const token = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);

  // verifyAccessToken ist ohne RSVP_ACCESS_SECRET in Production fail-closed
  // und liefert false — dann zeigt die Seite das Gate, und /unlock antwortet
  // mit 503. Genau das gewünschte Verhalten.
  const unlocked = verifyAccessToken(token, {
    siteId: ctx.siteId,
    version: ctx.codeVersion,
  });

  return NextResponse.json({ ok: true, required: true, unlocked }, { headers: NO_STORE });
}
