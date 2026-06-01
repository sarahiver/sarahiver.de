'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { deleteCloudinaryImage } from '@/lib/cloudinary-server';

/**
 * Server Actions für das Photo-Dashboard.
 *
 * Operationen:
 *  - deletePhotos: löscht IDs aus wedding_photo_uploads + best-effort
 *                  Löschung aus Cloudinary.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
  count?: number;
}

export async function deletePhotos(slug: string, ids: string[]): Promise<ActionResult> {
  if (!slug) return { ok: false, error: 'Slug fehlt.' };
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: 'Keine IDs übergeben.' };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  // Records vor dem Delete holen, um an die public_ids für Cloudinary
  // zu kommen.
  const { data: records, error: readErr } = await supabase
    .from('wedding_photo_uploads')
    .select('id, cloudinary_public_id, cloudinary_url')
    .in('id', ids);

  if (readErr) {
    console.error('[deletePhotos] read failed:', readErr);
    return { ok: false, error: readErr.message };
  }

  // DB-Löschung
  const { error: delErr } = await supabase
    .from('wedding_photo_uploads')
    .delete()
    .in('id', ids);

  if (delErr) {
    console.error('[deletePhotos] delete failed:', delErr);
    return { ok: false, error: delErr.message };
  }

  // Cloudinary best-effort danach
  const targets = (records || []) as Array<{
    cloudinary_public_id: string | null;
    cloudinary_url: string;
  }>;
  for (const r of targets) {
    const id = r.cloudinary_public_id || r.cloudinary_url;
    deleteCloudinaryImage(id).catch((err) => {
      console.warn('[deletePhotos] cloudinary cleanup failed:', err);
    });
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  return { ok: true, count: ids.length };
}
