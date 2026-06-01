import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Public-Endpoint für Musikwunsch-Submissions.
 *
 * Liefert bei Erfolg den eingefügten Wunsch zurück (mit ID + created_at)
 * — wird vom Frontend für optimistic Insert in die Liste verwendet.
 */

interface SubmitPayload {
  slug?: string;
  title?: string;
  artist?: string;
  guest_name?: string;
}

export async function POST(request: Request) {
  let body: SubmitPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const title = body.title?.trim();
  const artist = body.artist?.trim();
  const guest_name = body.guest_name?.trim() || null;

  if (!slug || !title || !artist) {
    return NextResponse.json(
      { ok: false, error: 'Titel und Interpret sind erforderlich.' },
      { status: 400 },
    );
  }
  if (title.length > 200 || artist.length > 200) {
    return NextResponse.json(
      { ok: false, error: 'Titel oder Interpret zu lang (max. 200 Zeichen).' },
      { status: 400 },
    );
  }
  if (guest_name && guest_name.length > 100) {
    return NextResponse.json(
      { ok: false, error: 'Name zu lang (max. 100 Zeichen).' },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Datenbankverbindung nicht verfügbar.' }, { status: 500 });
  }

  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (siteErr || !site) {
    return NextResponse.json({ ok: false, error: 'Hochzeitsseite nicht gefunden.' }, { status: 404 });
  }
  const siteId = (site as { id: string }).id;

  const { data: inserted, error: insertErr } = await supabase
    .from('wedding_music_wishes')
    .insert({
      wedding_site_id: siteId,
      title,
      artist,
      guest_name,
    } as never)
    .select('id, title, artist, guest_name, created_at')
    .single();

  if (insertErr || !inserted) {
    console.error('[music-wishes-submit] insert failed:', insertErr);
    return NextResponse.json({ ok: false, error: 'Konnte nicht gespeichert werden.' }, { status: 500 });
  }

  const row = inserted as {
    id: string;
    title: string;
    artist: string;
    guest_name: string | null;
    created_at: string;
  };
  return NextResponse.json({
    ok: true,
    wish: {
      id: row.id,
      title: row.title,
      artist: row.artist,
      guest_name: row.guest_name || '',
      created_at: row.created_at,
    },
  });
}
