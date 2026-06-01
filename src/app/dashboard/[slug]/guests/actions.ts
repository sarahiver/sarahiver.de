'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Server Actions für die Gästeliste.
 *
 * Operationen:
 *  - uploadGuestList:   Batch-Insert von n Gästen, Duplikate übersprungen
 *  - deleteGuestEntry:  einzelnen Gast aus der Liste entfernen
 *  - clearGuestList:    komplette Liste leeren (mit Confirm)
 *  - markRemindersSent: nach Versand markieren (Brevo später, hier Stub)
 *  - sendReminders:     Versand-Stub. Loggt was passieren würde, schreibt
 *                       reminder_sent_at, kein echter Mail-Versand.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
  count?: number;
}

interface UploadGuest {
  name: string;
  email: string;
  group_name: string;
}

// ====================================================================
// UPLOAD
// ====================================================================

export async function uploadGuestList(
  slug: string,
  guests: UploadGuest[],
): Promise<ActionResult> {
  if (!slug) return { ok: false, error: 'Slug fehlt.' };
  if (!Array.isArray(guests) || guests.length === 0) {
    return { ok: false, error: 'Keine Gäste im Upload.' };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (siteErr || !site) {
    return { ok: false, error: siteErr?.message || 'Site nicht gefunden.' };
  }
  const siteId = (site as { id: string }).id;

  // Filterung: nur gültige Emails, Duplikate im Upload-File selbst entfernen
  const seen = new Set<string>();
  const valid: UploadGuest[] = [];
  for (const g of guests) {
    const name = g.name?.trim() || '';
    const email = g.email?.trim().toLowerCase() || '';
    if (!name || !email || !email.includes('@')) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    valid.push({ name, email, group_name: g.group_name?.trim() || '' });
  }

  if (valid.length === 0) {
    return { ok: false, error: 'Keine gültigen Einträge gefunden (Name + Email mit @ erforderlich).' };
  }

  // Batch-Insert mit upsert/ignore-Duplikate-Strategie:
  // Wir nutzen ON CONFLICT DO NOTHING via .upsert mit ignoreDuplicates.
  const rows = valid.map((g) => ({
    wedding_site_id: siteId,
    name: g.name,
    email: g.email,
    group_name: g.group_name,
  }));

  // Supabase JS Client: .upsert mit onConflict + ignoreDuplicates
  const { error, count } = await supabase
    .from('wedding_guest_list')
    .upsert(rows as never[], {
      onConflict: 'wedding_site_id,email',
      ignoreDuplicates: true,
      count: 'exact',
    });

  if (error) {
    console.error('[uploadGuestList] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  return { ok: true, count: count ?? valid.length };
}

// ====================================================================
// DELETE
// ====================================================================

export async function deleteGuestEntry(slug: string, id: string): Promise<ActionResult> {
  if (!slug || !id) return { ok: false, error: 'Slug oder ID fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { error } = await supabase.from('wedding_guest_list').delete().eq('id', id);
  if (error) {
    console.error('[deleteGuestEntry] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// CLEAR
// ====================================================================

export async function clearGuestList(slug: string): Promise<ActionResult> {
  if (!slug) return { ok: false, error: 'Slug fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (siteErr || !site) {
    return { ok: false, error: siteErr?.message || 'Site nicht gefunden.' };
  }
  const siteId = (site as { id: string }).id;

  const { error } = await supabase
    .from('wedding_guest_list')
    .delete()
    .eq('wedding_site_id', siteId);

  if (error) {
    console.error('[clearGuestList] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// SEND REMINDERS — STUB (Brevo-Versand kommt später)
// ====================================================================

export type ReminderType = 'rsvp_reminder' | 'thank_you' | 'photo_reminder';

export interface SendRemindersPayload {
  slug: string;
  guestIds: string[];
  type: ReminderType;
  customSubject: string;
  customBody: string;
}

export async function sendReminders(p: SendRemindersPayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };
  if (!Array.isArray(p.guestIds) || p.guestIds.length === 0) {
    return { ok: false, error: 'Keine Empfänger ausgewählt.' };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  // STUB: Logge, was versendet werden würde. Echter Brevo-Versand wird
  // hier später eingehängt. Wir loggen nur und markieren die Empfänger
  // als "erinnert" — UI-Verhalten ist damit schon vollständig testbar.
  console.log('[sendReminders] STUB — would send via Brevo:', {
    type: p.type,
    recipientCount: p.guestIds.length,
    subject: p.customSubject,
    bodyPreview: (p.customBody || '').slice(0, 80) + '…',
  });

  // Nur für rsvp_reminder markieren — bei thank_you/photo_reminder ist die
  // Gästeliste der "Versendet-Status" kein eigenes Konzept.
  if (p.type === 'rsvp_reminder') {
    const now = new Date().toISOString();
    for (const id of p.guestIds) {
      const { error } = await supabase
        .from('wedding_guest_list')
        // increment reminder_count via raw update — Supabase JS hat kein
        // .increment(), also fetch + write. Bei wenigen IDs okay.
        .update({ reminder_sent_at: now } as never)
        .eq('id', id);
      if (error) {
        console.error('[sendReminders] mark failed for', id, error);
      }
    }
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  return { ok: true, count: p.guestIds.length };
}
