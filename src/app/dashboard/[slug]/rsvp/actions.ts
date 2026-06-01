'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { RsvpGuest } from '@/lib/rsvp-data';

/**
 * Server Actions für die RSVP-Verwaltung im Dashboard.
 *
 * Drei Operationen:
 *  - updateRsvp:  Felder eines bestehenden RSVPs ändern
 *  - deleteRsvp:  einen RSVP komplett löschen (Kette: inkl. Begleitpersonen
 *                 im guests-Array)
 *  - addRsvp:     manuell hinzufügen (z.B. wenn jemand telefonisch zusagt)
 *
 * Alle Operationen revalidieren das Dashboard. Eine echte Gäste-Seite-
 * Revalidierung ist nicht nötig — RSVPs ändern die Gäste-Anzeige nicht.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// ====================================================================
// UPDATE
// ====================================================================

export interface UpdateRsvpPayload {
  slug: string;
  id: string;
  name: string;
  email: string;
  persons: number;
  attending: boolean;
  dietary: string;
  allergies: string;
  message: string;
  custom_answer: string;
  guests: RsvpGuest[];
}

export async function updateRsvp(p: UpdateRsvpPayload): Promise<ActionResult> {
  if (!p.slug || !p.id) return { ok: false, error: 'Slug oder ID fehlt.' };
  if (!p.name.trim()) return { ok: false, error: 'Name ist erforderlich.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { error } = await supabase
    .from('wedding_rsvps')
    .update({
      name: p.name.trim(),
      email: p.email.trim().toLowerCase(),
      persons: Math.max(1, Math.min(20, p.persons || 1)),
      attending: p.attending,
      dietary: p.dietary || '',
      allergies: p.allergies || '',
      message: p.message || '',
      custom_answer: p.custom_answer || '',
      guests: p.guests && p.guests.length > 0 ? p.guests : null,
    } as never)
    .eq('id', p.id);

  if (error) {
    console.error('[updateRsvp] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// DELETE
// ====================================================================

export async function deleteRsvp(slug: string, id: string): Promise<ActionResult> {
  if (!slug || !id) return { ok: false, error: 'Slug oder ID fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { error } = await supabase.from('wedding_rsvps').delete().eq('id', id);

  if (error) {
    console.error('[deleteRsvp] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// ADD (manuell aus dem Dashboard)
// ====================================================================

export interface AddRsvpPayload {
  slug: string;
  name: string;
  email: string;
  persons: number;
  attending: boolean;
  dietary: string;
  allergies: string;
  message: string;
  custom_answer: string;
}

export async function addRsvp(p: AddRsvpPayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };
  if (!p.name.trim()) return { ok: false, error: 'Name ist erforderlich.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  // Site-ID per Slug holen
  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', p.slug)
    .maybeSingle();

  if (siteErr || !site) {
    return { ok: false, error: siteErr?.message || 'Site nicht gefunden.' };
  }
  const siteId = (site as { id: string }).id;

  // guests-Array: Hauptperson als ersten Eintrag, weitere leer (kann per
  // Edit später ergänzt werden). Falls keine Email → leerer String, das
  // ist unique-konstraint-fähig solange jede manuell-eingegebene Person
  // eine echte Email kriegt. Wenn der User mehrere ohne Email einträgt,
  // wirft der Index — das ist gewollt.
  const guests: RsvpGuest[] = [
    { name: p.name.trim(), dietary: p.dietary || '', allergies: p.allergies || '' },
  ];

  const { error } = await supabase.from('wedding_rsvps').insert({
    wedding_site_id: siteId,
    name: p.name.trim(),
    email: p.email.trim().toLowerCase(),
    persons: Math.max(1, Math.min(20, p.persons || 1)),
    attending: p.attending,
    dietary: p.dietary || '',
    allergies: p.allergies || '',
    message: p.message || '',
    custom_answer: p.custom_answer || '',
    guests,
  } as never);

  if (error) {
    console.error('[addRsvp] failed:', error);
    // Duplicate-Email → freundliche Fehlermeldung
    if (error.code === '23505') {
      return { ok: false, error: 'Diese Email-Adresse hat schon einen RSVP für eure Hochzeit.' };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  return { ok: true };
}
