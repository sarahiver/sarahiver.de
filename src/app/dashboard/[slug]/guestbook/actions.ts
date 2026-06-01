'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Moderations-Actions für Gästebuch-Einträge.
 *
 * Drei Operationen:
 *   - approveEntry: status → approved + reviewed_at
 *   - rejectEntry:  status → rejected + reviewed_at (bleibt in DB für Audit)
 *   - deleteEntry:  Hard-Delete (z.B. Spam)
 *
 * Pfade werden nach jeder Aktion revalidiert, sodass die Gäste-Seite und
 * das Dashboard-Banner aktuell sind.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface BasePayload {
  slug: string;
  entryId: string;
}

async function performStatusUpdate(p: BasePayload, status: 'approved' | 'rejected'): Promise<ActionResult> {
  if (!p.slug || !p.entryId) return { ok: false, error: 'Slug oder Eintrag fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  // Site-Check, damit wir nicht versehentlich einen Eintrag einer fremden
  // Site bearbeiten (defensiv für später wenn Auth/Multi-Tenant härter wird)
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
    .from('wedding_guestbook_entries')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
    } as never)
    .eq('id', p.entryId)
    .eq('wedding_site_id', siteId);

  if (error) {
    console.error(`[guestbook-moderation] ${status} failed:`, error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}/guestbook`);
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

export async function approveEntry(p: BasePayload): Promise<ActionResult> {
  return performStatusUpdate(p, 'approved');
}

export async function rejectEntry(p: BasePayload): Promise<ActionResult> {
  return performStatusUpdate(p, 'rejected');
}

export async function deleteEntry(p: BasePayload): Promise<ActionResult> {
  if (!p.slug || !p.entryId) return { ok: false, error: 'Slug oder Eintrag fehlt.' };

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
    .from('wedding_guestbook_entries')
    .delete()
    .eq('id', p.entryId)
    .eq('wedding_site_id', siteId);

  if (error) {
    console.error('[guestbook-moderation] delete failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}/guestbook`);
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}
