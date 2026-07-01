import { NextResponse } from 'next/server';
import { seedDemos } from '@/lib/seed-demos';

/**
 * Geschuetzter Trigger fuer das Demo-Seeding (einmalig nach Deploy aufrufen).
 *
 * Auth wie bei den Cron-Routes: Authorization: Bearer <SECRET> ODER ?key=<SECRET>.
 * Secret: SEED_SECRET (Fallback CRON_SECRET). Ohne gesetztes Secret => 500,
 * damit die Route nie ungeschuetzt laeuft.
 *
 * Aufruf (Browser genuegt):
 *   https://sarahiver.de/api/seed-demos?key=DEIN_SECRET
 *
 * Idempotent — kann gefahrlos mehrfach laufen. Danach kann die Route wieder
 * entfernt werden.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(request: Request): boolean {
  const secret = process.env.SEED_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const bearer = request.headers.get('authorization');
  return key === secret || bearer === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const result = await seedDemos();
  return NextResponse.json(result, { status: result.ok ? 200 : 207 });
}

export async function POST(request: Request) {
  return GET(request);
}
