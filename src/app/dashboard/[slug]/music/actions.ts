'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Delete-Action für Musikwünsche. Hard-Delete — kein Soft-Delete-Pattern,
 * weil keine Moderation und auch keine Audit-Anforderung besteht.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface DeletePayload {
  slug: string;
  wishId: string;
}

export async function deleteWish(p: DeletePayload): Promise<ActionResult> {
  if (!p.slug || !p.wishId) return { ok: false, error: 'Slug oder Wunsch fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', p.slug)
    .maybeSingle();
  if (siteErr || !site) {
    return { ok: false, error: siteErr?.message || 'Site nicht gefunden.' };
  }
  const siteId = (site as { id: string }).id;

  const { error } = await supabase
    .from('wedding_music_wishes')
    .delete()
    .eq('id', p.wishId)
    .eq('wedding_site_id', siteId);

  if (error) {
    console.error('[music-wishes] delete failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}/music`);
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}
