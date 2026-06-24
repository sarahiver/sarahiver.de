import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { ADDON_KEYS } from '@/lib/funnel';

/**
 * Downgrade-Anwendung zum Periodenende — server-only, Service-Role.
 *
 * Läuft täglich (vercel.json). Für jede Site mit gesetztem `pending_downgrade_at`,
 * dessen Stichtag erreicht ist, wird der geplante Wechsel app-seitig vollzogen:
 *   1. Die abgewählten Zusatz-Bereiche (nicht in pending_keep_keys) werden
 *      DEAKTIVIERT (is_active=false / is_active_draft=false) — Inhalte bleiben
 *      erhalten, die Zeilen werden NICHT gelöscht.
 *   2. Ihre Käufe werden aus wedding_purchases entfernt (Kapazität sinkt).
 *   3. subscription_tier wird auf pending_tier gesetzt, die pending_*-Felder
 *      werden geleert.
 *
 * Die Stripe-Abrechnung wurde bereits beim Planen umgestellt (proration 'none' →
 * nächste Rechnung = günstigere Stufe). Dieser Cron synchronisiert nur den
 * App-Zugang zum selben Zeitpunkt.
 *
 * Schutz: Vercel-Cron sendet Authorization: Bearer <CRON_SECRET>. Manuell via
 * ?key=<CRON_SECRET> auslösbar.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn('[cron/apply-downgrades] CRON_SECRET nicht gesetzt — Endpoint ungeschützt!');
    return true;
  }
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  if (req.nextUrl.searchParams.get('key') === secret) return true;
  return false;
}

type Row = {
  id: string;
  slug: string;
  pending_tier: string | null;
  pending_downgrade_at: string | null;
  pending_keep_keys: string[] | null;
};

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'admin unavailable' }, { status: 500 });

  const nowIso = new Date().toISOString();

  const { data, error } = await admin
    .from('wedding_sites')
    .select('id, slug, pending_tier, pending_downgrade_at, pending_keep_keys')
    .not('pending_downgrade_at', 'is', null)
    .lte('pending_downgrade_at', nowIso);

  if (error) {
    console.error('[cron/apply-downgrades] query failed:', error);
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  const rows = (data || []) as unknown as Row[];
  let applied = 0;
  const details: Array<{ slug: string; dropped: string[] }> = [];

  for (const site of rows) {
    const keep = new Set(site.pending_keep_keys || []);
    // Abzuwählende Zusatz-Bereiche = alle Addons, die NICHT behalten werden.
    const drop = ADDON_KEYS.filter((k) => !keep.has(k));

    if (drop.length > 0) {
      // Bereiche deaktivieren (Inhalte bleiben erhalten)
      const { error: dErr } = await admin
        .from('wedding_bereiche')
        .update({ is_active: false, is_active_draft: false, is_dirty: true } as never)
        .eq('wedding_site_id', site.id)
        .in('bereich_key', drop);
      if (dErr) console.error('[cron/apply-downgrades] deactivate failed', site.slug, dErr);

      // Käufe der abgewählten Bereiche entfernen (Kapazität sinkt)
      const { error: pErr } = await admin
        .from('wedding_purchases')
        .delete()
        .eq('wedding_site_id', site.id)
        .in('bereich_key', drop);
      if (pErr) console.error('[cron/apply-downgrades] purchase delete failed', site.slug, pErr);
    }

    // Stufe finalisieren + Pending leeren
    const { error: uErr } = await admin
      .from('wedding_sites')
      .update({
        subscription_tier: site.pending_tier,
        pending_tier: null,
        pending_downgrade_at: null,
        pending_keep_keys: null,
      } as never)
      .eq('id', site.id);
    if (uErr) {
      console.error('[cron/apply-downgrades] finalize failed', site.slug, uErr);
      continue;
    }

    applied++;
    details.push({ slug: site.slug, dropped: drop });
    // Caches der betroffenen Seiten erneuern
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath(`/dashboard/${site.slug}`, 'layout');
      revalidatePath(`/${site.slug}`, 'layout');
    } catch {
      /* revalidate ist best-effort */
    }
  }

  return NextResponse.json({ ok: true, checked: rows.length, applied, details });
}
