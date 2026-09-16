import { NextResponse } from 'next/server';

/**
 * Domain-Verfügbarkeit — unverbindliche Prüfung per RDAP.
 *
 * RDAP ist der offizielle Nachfolger von WHOIS: rdap.org leitet anhand der
 * Endung an die zuständige Registry weiter (DENIC für .de, Verisign für .com …).
 *   404 → Domain ist dort nicht registriert  ⇒ frei
 *   200 → Datensatz vorhanden                ⇒ vergeben
 *   alles andere / Timeout                   ⇒ unbekannt
 *
 * Bewusst ohne Registrar-Account: die Prüfung ist eine Auskunft, keine
 * Reservierung. Registriert wird die Domain manuell nach dem Kauf.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DOMAIN_RE = /^[a-z0-9äöüß][a-z0-9äöüß-]{1,62}\.[a-z]{2,20}$/;
const TIMEOUT_MS = 5000;

export type DomainStatus = 'free' | 'taken' | 'unknown';

export async function GET(request: Request) {
  const raw = (new URL(request.url).searchParams.get('domain') || '').trim().toLowerCase();

  if (!DOMAIN_RE.test(raw)) {
    return NextResponse.json({ ok: false, error: 'invalid domain' }, { status: 400 });
  }

  const status = await lookup(raw);

  return NextResponse.json(
    { ok: true, domain: raw, status },
    // Gleiche Anfrage kurz cachen — schützt die Registries bei Mehrfachklicks.
    { headers: { 'Cache-Control': 'public, max-age=60' } },
  );
}

async function lookup(domain: string): Promise<DomainStatus> {
  // Umlautdomains müssen als Punycode angefragt werden.
  let ascii = domain;
  try {
    ascii = new URL(`https://${domain}`).hostname;
  } catch {
    return 'unknown';
  }

  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(ascii)}`, {
      headers: { accept: 'application/rdap+json' },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });

    if (res.status === 404) return 'free';
    if (res.ok) return 'taken';
    return 'unknown';
  } catch (err) {
    console.warn('[domain-check] lookup failed for', ascii, err);
    return 'unknown';
  }
}
