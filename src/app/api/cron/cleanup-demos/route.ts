import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { ensureDemoOwner } from '@/lib/seed-demos';

/**
 * Cleanup der Sandbox-Sites (`demo-%`), aelter als MAX_AGE_HOURS.
 * Auth wie die anderen Cron-Routes: Bearer <CRON_SECRET> oder ?key=<CRON_SECRET>.
 * Vercel-Cron sendet automatisch den Bearer, wenn CRON_SECRET gesetzt ist.
 *
 * Vercel-Cron-Eintrag (vercel.json):
 *   { "path": "/api/cron/cleanup-demos", "schedule": "0 * * * *" }
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_AGE_HOURS = 24;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET || process.env.SEED_SECRET;
  if (!secret) return false;
  const key = new URL(req.url).searchParams.get('key');
  const bearer = req.headers.get('authorization');
  return key === secret || bearer === `Bearer ${secret}`;
}

async function run() {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, deleted: 0, error: 'admin client unavailable' };

  // Defense in Depth: gelöscht wird nur, was ALLE Merkmale einer Sandbox hat —
  // Slug demo-%, gehört dem Demo-Owner-Account und hat keine Stripe-Session
  // (jede bezahlte Seite hat eine). Ohne auflösbaren Demo-Owner wird nichts
  // gelöscht.
  const demoOwnerId = await ensureDemoOwner(admin);
  if (!demoOwnerId) return { ok: false, deleted: 0, error: 'demo owner unresolved — nothing deleted' };

  const cutoff = new Date(Date.now() - MAX_AGE_HOURS * 3600_000).toISOString();
  const { data, error } = await admin
    .from('wedding_sites')
    .select('id, slug')
    .like('slug', 'demo-%')
    .eq('owner_user_id', demoOwnerId)
    .is('stripe_checkout_session_id', null)
    .lt('created_at', cutoff);
  if (error) return { ok: false, deleted: 0, error: error.message };

  const sites = (data ?? []) as { id: string; slug: string }[];
  let deleted = 0;
  const failed: string[] = [];
  for (const s of sites) {
    // Bekannte Kinder zuerst; der Rest sollte per FK ON DELETE CASCADE gehen.
    await admin.from('wedding_bereiche').delete().eq('wedding_site_id', s.id);
    await admin.from('wedding_purchases').delete().eq('wedding_site_id', s.id);
    const { error: delErr } = await admin.from('wedding_sites').delete().eq('id', s.id);
    if (delErr) failed.push(`${s.slug}: ${delErr.message}`);
    else deleted++;
  }
  return { ok: failed.length === 0, deleted, scanned: sites.length, failed };
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  return NextResponse.json(await run());
}
export async function POST(req: Request) {
  return GET(req);
}
