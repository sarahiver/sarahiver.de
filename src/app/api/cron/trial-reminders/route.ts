import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendBrevoMail, mailShell } from '@/lib/brevo';

/**
 * Trial-Reminder-Cron — server-only, Service-Role.
 *
 * Läuft täglich (siehe vercel.json), geht alle Sites mit subscription_status
 * = 'trialing' durch und schickt 5 / 3 / 1 Tage vor Trial-Ende eine freundliche
 * Erinnerungs-Mail. So weiß das Paar rechtzeitig, dass die Testphase ausläuft
 * und ab wann abgerechnet wird — transparent, kein "Geld aus der Tasche ziehen".
 *
 * Trial-Ende:
 *   Solange ein Stripe-Abo `trialing` ist, ist `current_period_end` exakt der
 *   Zeitpunkt, an dem der Trial endet und die erste Abrechnung startet. Wir
 *   lesen also current_period_end — keine zusätzliche Stripe-Abfrage nötig.
 *
 * Doppel-Versand-Schutz:
 *   Pro Site merken wir in `trial_reminders_sent` (smallint[]) welche Marken
 *   (5 / 3 / 1) schon raus sind. Läuft der Cron mehrmals am Tag oder erneut,
 *   wird kein Reminder doppelt verschickt.
 *
 * Sicherheit:
 *   Vercel-Cron sendet automatisch `Authorization: Bearer <CRON_SECRET>`, wenn
 *   die Env CRON_SECRET gesetzt ist. Wir prüfen das. Zusätzlich erlaubt ein
 *   `?key=<CRON_SECRET>` manuelles Auslösen zum Testen.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Wann erinnert wird (Tage vor Trial-Ende).
const REMINDER_DAYS = [5, 3, 1] as const;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de';

type SiteRow = {
  id: string;
  slug: string;
  couple_name_1: string | null;
  couple_name_2: string | null;
  owner_user_id: string | null;
  user_id: string | null;
  current_period_end: string | null;
  subscription_status: string | null;
  trial_reminders_sent: number[] | null;
};

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Ohne gesetztes Secret nur lokal/preview sinnvoll — wir lassen es zu, loggen
  // aber eine Warnung, damit es in Production nicht ungeschützt bleibt.
  if (!secret) {
    console.warn('[cron/trial-reminders] CRON_SECRET nicht gesetzt — Endpoint ungeschützt!');
    return true;
  }
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const key = req.nextUrl.searchParams.get('key');
  if (key && key === secret) return true;
  return false;
}

/** Volle Resttage bis zum Trial-Ende (aufgerundet auf den nächsten Kalendertag-Abstand). */
function daysUntil(iso: string, now: number): number {
  const end = new Date(iso).getTime();
  if (!Number.isFinite(end)) return NaN;
  const ms = end - now;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function coupleLabel(a: string | null, b: string | null): string {
  const aa = (a || '').trim();
  const bb = (b || '').trim();
  if (aa && bb) return `${aa} & ${bb}`;
  return aa || bb || 'ihr beiden';
}

function reminderHtml(opts: { couple: string; days: number; endDateLabel: string; dashboardUrl: string }): string {
  const { couple, days, endDateLabel, dashboardUrl } = opts;
  const when =
    days === 1 ? 'morgen' : `in ${days} Tagen`;

  return mailShell({
    heading: `Eure Testphase endet ${when}`,
    bodyHtml: `Hallo ${escapeHtml(couple)},<br /><br />
      eure kostenlose 14-Tage-Testphase für eure Hochzeitsseite läuft <strong>${when}</strong>
      (am ${escapeHtml(endDateLabel)}) aus. Danach startet euer Abo automatisch und wird über die
      bei der Anmeldung hinterlegte Zahlungsart abgerechnet.<br /><br />
      Wenn alles passt, müsst ihr nichts tun — eure Seite bleibt einfach online.
      Möchtet ihr vorher noch etwas ändern oder habt ihr eine Frage zur Abrechnung,
      meldet euch jederzeit bei uns.`,
    button: { label: 'Zum Dashboard', href: dashboardUrl },
    footnoteHtml: `Fragen zur Abrechnung oder zu eurer Seite? Schreibt uns über
      <a href="${APP_URL}/kontakt" style="color:#a39d92;">${APP_URL.replace(/^https?:\/\//, '')}/kontakt</a>
      oder antwortet einfach auf diese Mail.`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDateDe(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'admin unavailable' }, { status: 500 });
  }

  const now = Date.now();

  // Nur Sites in der Testphase laden.
  const { data, error } = await admin
    .from('wedding_sites')
    .select(
      'id, slug, couple_name_1, couple_name_2, owner_user_id, user_id, current_period_end, subscription_status, trial_reminders_sent',
    )
    .eq('subscription_status', 'trialing');

  if (error) {
    console.error('[cron/trial-reminders] query failed:', error);
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  const rows = (data || []) as unknown as SiteRow[];

  let sent = 0;
  let skipped = 0;
  const details: Array<{ slug: string; days?: number; reason?: string }> = [];

  for (const site of rows) {
    if (!site.current_period_end) {
      skipped++;
      details.push({ slug: site.slug, reason: 'no current_period_end' });
      continue;
    }

    const days = daysUntil(site.current_period_end, now);
    if (!Number.isFinite(days)) {
      skipped++;
      details.push({ slug: site.slug, reason: 'invalid date' });
      continue;
    }

    // Greift dieser Cron-Lauf eine der Reminder-Marken? (5 / 3 / 1)
    const mark = REMINDER_DAYS.find((d) => d === days);
    if (mark === undefined) {
      skipped++;
      continue;
    }

    const already = site.trial_reminders_sent || [];
    if (already.includes(mark)) {
      skipped++;
      continue;
    }

    // Empfänger-Mail über auth.users auflösen (wedding_sites speichert keine Mail).
    const ownerId = site.owner_user_id || site.user_id;
    if (!ownerId) {
      skipped++;
      details.push({ slug: site.slug, reason: 'no owner' });
      continue;
    }

    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(ownerId);
    const email = userData?.user?.email;
    if (userErr || !email) {
      console.error('[cron/trial-reminders] could not resolve email for', site.slug, userErr);
      skipped++;
      details.push({ slug: site.slug, reason: 'no email' });
      continue;
    }

    const couple = coupleLabel(site.couple_name_1, site.couple_name_2);
    const dashboardUrl = `${APP_URL}/dashboard/${site.slug}`;
    const endDateLabel = formatDateDe(site.current_period_end);

    const ok = await sendBrevoMail({
      to: email,
      subject: `Eure Testphase endet ${mark === 1 ? 'morgen' : `in ${mark} Tagen`} — sarahiver.de`,
      htmlContent: reminderHtml({ couple, days: mark, endDateLabel, dashboardUrl }),
    });

    if (!ok) {
      details.push({ slug: site.slug, reason: 'send failed' });
      continue;
    }

    // Marke als gesendet vermerken (append, dedupe).
    const updated = Array.from(new Set([...already, mark]));
    const { error: updErr } = await admin
      .from('wedding_sites')
      .update({ trial_reminders_sent: updated } as never)
      .eq('id', site.id);
    if (updErr) {
      // Mail ist raus — nur das Logging schlägt fehl. Loggen, nicht abbrechen.
      console.error('[cron/trial-reminders] mark update failed for', site.slug, updErr);
    }

    sent++;
    details.push({ slug: site.slug, days: mark });
  }

  return NextResponse.json({ ok: true, checked: rows.length, sent, skipped, details });
}
