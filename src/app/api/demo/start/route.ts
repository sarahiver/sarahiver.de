import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { startDemoSession, demoSiteExists } from '@/lib/demo-sandbox';

/**
 * Startet eine Sandbox-Session. Reuse ueber Cookie `demo_slug` (24 h), sonst
 * neue Wegwerf-Site. Antwort: { ok, slug }. Der Client leitet danach ins
 * echte Dashboard (/dashboard/<slug>) weiter.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = 'demo_slug';

export async function POST(request: Request) {
  const style = new URL(request.url).searchParams.get('style');

  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing && (await demoSiteExists(existing))) {
    return NextResponse.json({ ok: true, slug: existing, reused: true });
  }

  const r = await startDemoSession(style);
  if (!r.ok || !r.slug) {
    return NextResponse.json({ ok: false, error: r.error ?? 'unknown' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, slug: r.slug });
  res.cookies.set(COOKIE, r.slug, { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });
  return res;
}
