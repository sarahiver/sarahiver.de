import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Public-Endpoint für Gäste-Submissions.
 * Forciert status='pending' — Moderation muss durchs Dashboard.
 */

interface SubmitPayload {
  slug?: string;
  name?: string;
  message?: string;
}

export async function POST(request: Request) {
  let body: SubmitPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const name = body.name?.trim();
  const message = body.message?.trim();

  if (!slug || !name || !message) {
    return NextResponse.json(
      { ok: false, error: 'Name und Nachricht sind erforderlich.' },
      { status: 400 },
    );
  }
  if (name.length > 100) {
    return NextResponse.json({ ok: false, error: 'Name zu lang (max. 100 Zeichen).' }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json(
      { ok: false, error: 'Nachricht zu lang (max. 2000 Zeichen).' },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Datenbankverbindung nicht verfügbar.' }, { status: 500 });
  }

  // Site-ID lookup
  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (siteErr || !site) {
    return NextResponse.json({ ok: false, error: 'Hochzeitsseite nicht gefunden.' }, { status: 404 });
  }

  const siteId = (site as { id: string }).id;

  const { error: insertErr } = await supabase
    .from('wedding_guestbook_entries')
    .insert({
      wedding_site_id: siteId,
      name,
      message,
      status: 'pending',
    } as never);

  if (insertErr) {
    console.error('[guestbook-submit] insert failed:', insertErr);
    return NextResponse.json({ ok: false, error: 'Konnte nicht gespeichert werden.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
