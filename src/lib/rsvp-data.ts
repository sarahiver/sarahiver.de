import { createSupabaseAdminClient } from './supabase-admin';

/**
 * RSVP-Daten — gespiegelt aus wedding_rsvps. Die guests-Spalte ist jsonb,
 * Array von { name, dietary, allergies }. Index 0 = Hauptperson (dupliziert
 * sich auch in r.name/r.dietary/r.allergies), ab Index 1 = Begleitpersonen.
 */
export interface RsvpGuest {
  name: string;
  dietary?: string;
  allergies?: string;
}

export interface RsvpRecord {
  id: string;
  wedding_site_id: string;
  name: string;
  email: string;
  persons: number;
  attending: boolean;
  dietary: string;
  allergies: string;
  message: string;
  guests: RsvpGuest[] | null;
  custom_answer: string;
  created_at: string;
}

/**
 * Lädt alle RSVPs einer Site, neueste zuerst. Wenn die Site nicht
 * existiert oder kein Service-Role-Key da ist, kommt [] zurück.
 */
export async function loadRsvps(siteId: string): Promise<RsvpRecord[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error('[loadRsvps] no admin client (SUPABASE_SERVICE_ROLE_KEY fehlt?)');
    return [];
  }

  const { data, error } = await supabase
    .from('wedding_rsvps')
    .select('*')
    .eq('wedding_site_id', siteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[loadRsvps] failed:', error);
    return [];
  }

  // guests kann jsonb-Array oder null sein — Defensiv parsen.
  return (data || []).map((r) => {
    const raw = r as unknown as RsvpRecord & { guests: unknown };
    let guests: RsvpGuest[] | null = null;
    if (Array.isArray(raw.guests)) {
      guests = raw.guests as RsvpGuest[];
    } else if (typeof raw.guests === 'string') {
      try {
        const parsed = JSON.parse(raw.guests);
        if (Array.isArray(parsed)) guests = parsed;
      } catch {
        // ignore
      }
    }
    return { ...raw, guests } as RsvpRecord;
  });
}
