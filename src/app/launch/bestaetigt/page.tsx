import type { Metadata } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { CONFIRM_COPY } from '@/lib/launch';

/**
 * /launch/bestaetigt?token=… — Schritt 2 des Double Opt-In.
 *
 * Erst hier wird aus `pending` ein `confirmed`. Der Token wird dabei entwertet,
 * damit ein Link nur einmal funktioniert. Ohne gültigen Token gibt es eine
 * freundliche Fehlermeldung statt eines Serverfehlers.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Anmeldung bestätigen — sarahiver.de',
  robots: { index: false, follow: false },
};

async function confirm(token: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin || !token) return false;

  const { data, error } = await admin
    .from('launch_subscribers')
    .select('id, status')
    .eq('confirm_token', token)
    .maybeSingle();

  if (error || !data) return false;

  const row = data as { id: string; status: string };
  if (row.status === 'confirmed') return true;

  const { error: updErr } = await admin
    .from('launch_subscribers')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      // Token entwerten: der Link funktioniert genau einmal.
      confirm_token: `used:${row.id}`,
    } as never)
    .eq('id', row.id);

  if (updErr) {
    console.error('[launch] confirm failed:', updErr);
    return false;
  }
  return true;
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const ok = await confirm((token || '').trim());
  const copy = ok ? CONFIRM_COPY.ok : CONFIRM_COPY.invalid;

  return (
    <main className="sdlg-page">
      <div className="sdlg-page-in">
        <p className="sdlg-eyebrow">{copy.eyebrow}</p>
        <h1 className="sdlg-title">{copy.title}</h1>
        <p className="sdlg-text">{copy.text}</p>

        <div className="sdlg-explore-actions sdlg-page-actions">
          <a className="sdlg-btn sdlg-btn--gold" href={CONFIRM_COPY.ctaDemos.href}>
            {CONFIRM_COPY.ctaDemos.label}
          </a>
          <a className="sdlg-btn sdlg-btn--ghost" href={CONFIRM_COPY.ctaDashboard.href}>
            {CONFIRM_COPY.ctaDashboard.label}
          </a>
        </div>
      </div>
    </main>
  );
}
