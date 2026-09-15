import { NextResponse } from 'next/server';

/**
 * Stillgelegt — es gibt keine Testphase mehr (Einmalzahlung seit Sept. 2026).
 *
 * Die Route bleibt als No-Op bestehen, falls in Vercel noch ein Cron-Eintrag
 * hängt. Sobald der Schedule aus vercel.json raus und deployed ist, kann der
 * ganze Ordner gelöscht werden.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, disabled: 'Trial-Erinnerungen entfallen (Einmalzahlung).' });
}
