import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { isClientLimited, isSiteFlooded, tooManyRequests } from '@/lib/public-guard';

/**
 * Public-Endpoint für Geschenk-Reservierungen.
 *
 * Liefert bei Erfolg ok zurück. Race-Schutz durch UNIQUE
 * (wedding_site_id, item_id) — zweiter Versuch für dasselbe Item
 * scheitert mit konkretem Fehlertext "bereits reserviert".
 */

interface SubmitPayload {
  slug?: string;
  item_id?: string;
  item_title?: string;
  guest_name?: string;
}

export async function POST(request: Request) {
  // Missbrauchsschutz (best effort je Client, siehe lib/public-guard.ts).
  if (isClientLimited(request.headers, { bucket: 'gifts', max: 10, windowMs: 10 * 60_000 })) return tooManyRequests();
  let body: SubmitPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const itemId = body.item_id?.trim();
  const itemTitle = body.item_title?.trim();
  const guestName = body.guest_name?.trim();

  if (!slug || !itemId || !itemTitle || !guestName) {
    return NextResponse.json(
      { ok: false, error: 'Alle Felder sind erforderlich.' },
      { status: 400 },
    );
  }
  if (guestName.length > 100) {
    return NextResponse.json({ ok: false, error: 'Name zu lang (max. 100 Zeichen).' }, { status: 400 });
  }
  if (itemTitle.length > 300) {
    return NextResponse.json({ ok: false, error: 'Titel zu lang.' }, { status: 400 });
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

  // Flutschutz je Hochzeitsseite (DB-basiert, instanzübergreifend).
  if (await isSiteFlooded({ table: 'wedding_gift_reservations', siteId, max: 40, windowMin: 10 })) return tooManyRequests();

  const { error: insertErr } = await supabase
    .from('wedding_gift_reservations')
    .insert({
      wedding_site_id: siteId,
      item_id: itemId,
      item_title: itemTitle,
      guest_name: guestName,
    } as never);

  if (insertErr) {
    // 23505 = unique_violation in Postgres
    if (insertErr.code === '23505') {
      return NextResponse.json(
        { ok: false, error: 'Dieses Geschenk wurde gerade eben schon reserviert. Bitte Seite neu laden.' },
        { status: 409 },
      );
    }
    console.error('[gift-reserve] insert failed:', insertErr);
    return NextResponse.json({ ok: false, error: 'Konnte nicht reserviert werden.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
