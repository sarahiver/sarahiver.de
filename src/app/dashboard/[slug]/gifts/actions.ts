'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Storno-Action für Geschenk-Reservierungen.
 *
 * Wird verwendet, wenn ein Gast irrtümlich reserviert hat oder das Brautpaar
 * eine Reservierung manuell aufheben möchte.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface CancelPayload {
  slug: string;
  reservationId: string;
}

export async function cancelReservation(p: CancelPayload): Promise<ActionResult> {
  if (!p.slug || !p.reservationId) return { ok: false, error: 'Slug oder Reservierung fehlt.' };

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
    .from('wedding_gift_reservations')
    .delete()
    .eq('id', p.reservationId)
    .eq('wedding_site_id', siteId);

  if (error) {
    console.error('[gift-reservations] cancel failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}/gifts`);
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}
