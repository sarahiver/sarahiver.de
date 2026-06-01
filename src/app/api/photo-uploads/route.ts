import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

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
 */

interface PostBody {
  slug?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  uploaded_by?: string;
}

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.slug || !body.cloudinary_url) {
    return NextResponse.json({ ok: false, error: 'Missing slug or url' }, { status: 400 });
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

  const { error } = await supabase.from('wedding_photo_uploads').insert({
    wedding_site_id: siteId,
    cloudinary_url: body.cloudinary_url,
    cloudinary_public_id: body.cloudinary_public_id || null,
    uploaded_by: (body.uploaded_by || '').trim() || 'Gast',
  } as never);

  if (error) {
    console.error('[api/photo-uploads] insert failed:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
