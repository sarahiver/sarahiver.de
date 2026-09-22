import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import {
  isClientLimited,
  isSiteFlooded,
  tooManyRequests,
  isOwnCloudinaryImageUrl,
  isPlausiblePublicId,
} from '@/lib/public-guard';

/**
 * POST /api/photo-uploads
 *
 * Wird vom Gäste-Pfad (PhotoUpload-Variante auf der Hochzeits-Seite) nach
 * erfolgreichem Cloudinary-Upload aufgerufen. Schreibt den Upload in
 * wedding_photo_uploads, damit das Brautpaar ihn im Dashboard sieht.
 *
 * Best-effort: Wenn das fehlschlägt, liegt das Bild trotzdem in Cloudinary,
 * der Gast bekommt nichts mit. Logging im Server reicht.
 *
 * Payload:
 *   { slug, cloudinary_url, cloudinary_public_id, uploaded_by }
 *
 * Härtung: nur Bild-URLs aus dem eigenen Cloudinary-Konto werden gespeichert
 * (keine fremden Hosts, kein data:/javascript:), strengeres Rate Limit als
 * die anderen Gästeformulare.
 */

interface PostBody {
  slug?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  uploaded_by?: string;
}

export async function POST(request: Request) {
  // Missbrauchsschutz (best effort je Client). Großzügig genug für eine
  // Serie von Handyfotos, streng genug gegen Schleifen.
  if (isClientLimited(request.headers, { bucket: 'photo', max: 40, windowMs: 10 * 60_000 })) {
    return tooManyRequests();
  }

  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.slug || !body.cloudinary_url) {
    return NextResponse.json({ ok: false, error: 'Missing slug or url' }, { status: 400 });
  }
  if (!isOwnCloudinaryImageUrl(body.cloudinary_url) || !isPlausiblePublicId(body.cloudinary_public_id)) {
    return NextResponse.json({ ok: false, error: 'Ungültige Bildquelle.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error('[api/photo-uploads] no admin client');
    return NextResponse.json({ ok: false, error: 'Server config missing' }, { status: 500 });
  }

  // Site-ID per Slug holen
  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', body.slug)
    .maybeSingle();

  if (siteErr || !site) {
    console.error('[api/photo-uploads] site lookup failed:', body.slug, siteErr);
    return NextResponse.json({ ok: false, error: 'Site not found' }, { status: 404 });
  }
  const siteId = (site as { id: string }).id;

  // Flutschutz je Hochzeitsseite (DB-basiert, instanzübergreifend).
  if (await isSiteFlooded({ table: 'wedding_photo_uploads', siteId, max: 400, windowMin: 10 })) {
    return tooManyRequests();
  }

  const { error } = await supabase.from('wedding_photo_uploads').insert({
    wedding_site_id: siteId,
    cloudinary_url: body.cloudinary_url,
    cloudinary_public_id: body.cloudinary_public_id || null,
    uploaded_by: String(body.uploaded_by || '').trim().slice(0, 100) || 'Gast',
  } as never);

  if (error) {
    console.error('[api/photo-uploads] insert failed:', error);
    return NextResponse.json({ ok: false, error: 'Speichern fehlgeschlagen.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
