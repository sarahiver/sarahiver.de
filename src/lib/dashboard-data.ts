/**
 * Dashboard-Datenlader.
 *
 * Lädt die gesamte Hochzeits-Site für ein Brautpaar im Dashboard:
 *   - das wedding_sites-Record (Stammdaten, Stil, Farben, nav_variant)
 *   - ALLE wedding_bereiche (auch is_active=false — im Dashboard editieren
 *     wir auch deaktivierte Bereiche)
 *
 * Unterschied zu loadWeddingSite (Gäste-Seite): dort nur is_active=true.
 *
 * SSR — wird in Server Components verwendet (Dashboard-Layout).
 */

import { createSupabaseAdminClient } from './supabase-admin';
import type { BereichKey, WeddingBereich } from '@/types/supabase';

export interface WeddingSiteRecord {
  id: string;
  slug: string;
  couple_name_1: string;
  couple_name_2: string;
  wedding_date: string; // ISO mit Zeitzone
  wedding_location: string | null;
  hero_image_url: string | null;
  start_style_id: 'klassisch' | 'modern' | 'floral' | 'minimal' | 'festlich' | null;
  nav_variant: 'a' | 'b' | 'c' | 'none' | null;
  font_preset_id: string | null;
  palette_bg: string | null;
  palette_accent: string | null;
  palette_ink: string | null;
  status: 'in_progress' | 'ready_for_review' | 'finalized' | 'live' | null;
  created_at?: string;
}

export interface DashboardData {
  site: WeddingSiteRecord;
  bereiche: WeddingBereich[]; // alle, sortiert nach display_order
  purchasedKeys: BereichKey[]; // gebuchte Komponenten (aus wedding_purchases)
}

/**
 * Lädt das gesamte Dashboard-Datenpaket für einen Slug.
 * Liefert null, wenn die Site nicht existiert.
 */
export async function loadDashboardData(slug: string): Promise<DashboardData | null> {
  const supabase = createSupabaseAdminClient();

  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (siteErr || !site) {
    if (siteErr) console.error('[dashboard] failed to load site:', siteErr);
    return null;
  }

  const [bereicheRes, purchasesRes] = await Promise.all([
    supabase
      .from('wedding_bereiche')
      .select('*')
      .eq('wedding_site_id', site.id)
      .order('display_order', { ascending: true }),
    supabase
      .from('wedding_purchases')
      .select('bereich_key')
      .eq('wedding_site_id', site.id),
  ]);

  if (bereicheRes.error) {
    console.error('[dashboard] failed to load bereiche:', bereicheRes.error);
  }
  // Tabelle könnte noch nicht existieren — defensiv leerer Fallback
  if (purchasesRes.error) {
    console.warn('[dashboard] failed to load purchases (table missing?):', purchasesRes.error);
  }

  const purchasedKeys: BereichKey[] = (purchasesRes.data || [])
    .map((p) => (p as { bereich_key: string }).bereich_key as BereichKey);

  return {
    site: site as WeddingSiteRecord,
    bereiche: (bereicheRes.data || []) as WeddingBereich[],
    purchasedKeys,
  };
}

/**
 * Kennzahlen für die Dashboard-Übersicht. Defensiv: jede Zählung kann
 * fehlschlagen (Tabelle noch nicht da), Fallback ist 0.
 */
export interface DashboardStats {
  rsvpTotal: number;
  rsvpAccepted: number;
  rsvpDeclined: number;
  guestbookPending: number;
  guestbookApproved: number;
  musicWishes: number;
  photoUploads: number;
  giftsReserved: number;
  giftsTotal: number;
}

export async function loadDashboardStats(
  siteId: string,
  bereiche: WeddingBereich[],
): Promise<DashboardStats> {
  // Stats aus den Bereich-content-Feldern ableiten — wir haben aktuell
  // noch keine echten Submit-Tabellen, also lesen wir aus dem JSONB.
  // Sobald echter Supabase-Submit gebaut ist, kommen hier echte Counts hin.
  const stats: DashboardStats = {
    rsvpTotal: 0,
    rsvpAccepted: 0,
    rsvpDeclined: 0,
    guestbookPending: 0,
    guestbookApproved: 0,
    musicWishes: 0,
    photoUploads: 0,
    giftsReserved: 0,
    giftsTotal: 0,
  };

  for (const b of bereiche) {
    const content = (b.content as Record<string, unknown>) || {};

    if (b.bereich_key === 'guestbook') {
      const entries = (content.entries as unknown[]) || [];
      stats.guestbookApproved = entries.length;
    }

    if (b.bereich_key === 'musicwishes') {
      const items = (content.items as unknown[]) || [];
      stats.musicWishes = items.length;
    }

    if (b.bereich_key === 'gifts') {
      const items = ((content.items as Array<{ reserved?: boolean }>) || []);
      stats.giftsTotal = items.length;
      stats.giftsReserved = items.filter((i) => i.reserved === true).length;
    }
  }

  // siteId ist absichtlich Teil der Signatur (für künftige echte Counts
  // aus rsvp/guestbook_entries/...-Tabellen); aktuell wird sie nicht genutzt.
  void siteId;
  return stats;
}

/** Hilfsfunktion: findet einen Bereich nach Key in der Liste. */
export function findBereich(
  bereiche: WeddingBereich[],
  key: BereichKey,
): WeddingBereich | undefined {
  return bereiche.find((b) => b.bereich_key === key);
}
