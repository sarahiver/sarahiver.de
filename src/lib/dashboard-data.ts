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
import type { BereichKey, WeddingBereich, Variant } from '@/types/supabase';

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
  palette_preset_id: string | null;
  palette_custom_bg: string | null;
  palette_custom_bg_soft: string | null;
  palette_custom_accent: string | null;
  palette_custom_accent_deep: string | null;
  palette_custom_ink: string | null;
  status: 'in_progress' | 'ready_for_review' | 'finalized' | 'live' | null;
  /** Anzahl Bereiche, deren Draft vom Published abweicht (gefüllt von loadDashboardStats). */
  site_is_dirty?: boolean;
  site_published_at?: string | null;
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
 *
 * Draft/Published-Aware: Die `site`- und `bereiche`-Records werden mit ihren
 * DRAFT-Werten zurückgegeben (was das Brautpaar gerade bearbeitet). Die
 * Gäste-Seite liest separat aus den Published-Quellen.
 */
export async function loadDashboardData(slug: string): Promise<DashboardData | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error('[dashboard-data] Admin client unavailable. See logs above.');
    return null;
  }

  const { data: siteRaw, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (siteErr) {
    console.error('[dashboard-data] wedding_sites query failed:', {
      slug,
      message: siteErr.message,
      details: siteErr.details,
      hint: siteErr.hint,
      code: siteErr.code,
    });
    return null;
  }
  if (!siteRaw) {
    console.warn('[dashboard-data] no site found for slug:', slug);
    return null;
  }

  // site_draft über die Published-Spalten legen — Dashboard liest und
  // schreibt die editierbaren Felder in den Draft-Zustand. Die Spalten
  // selbst bleiben "Published" als Quelle für die Gäste-Seite.
  const merged = mergeDraftIntoSite(siteRaw as WeddingSiteRecord & { site_draft?: Record<string, unknown> });

  const [bereicheRes, purchasesRes] = await Promise.all([
    supabase
      .from('wedding_bereiche')
      .select('*')
      .eq('wedding_site_id', merged.id)
      .order('display_order', { ascending: true }),
    supabase
      .from('wedding_purchases')
      .select('bereich_key')
      .eq('wedding_site_id', merged.id),
  ]);

  if (bereicheRes.error) {
    console.error('[dashboard-data] wedding_bereiche query failed:', {
      site_id: merged.id,
      message: bereicheRes.error.message,
      details: bereicheRes.error.details,
      hint: bereicheRes.error.hint,
      code: bereicheRes.error.code,
    });
  }
  if (purchasesRes.error) {
    console.error('[dashboard-data] wedding_purchases query failed:', {
      site_id: merged.id,
      message: purchasesRes.error.message,
      details: purchasesRes.error.details,
      hint: purchasesRes.error.hint,
      code: purchasesRes.error.code,
    });
  }

  const purchasedKeys: BereichKey[] = (purchasesRes.data || [])
    .map((p) => (p as { bereich_key: string }).bereich_key as BereichKey);

  // Bereich-Records: Draft-Felder werden auf die Haupt-Felder gespiegelt,
  // damit bestehende Editor-Komponenten (die `bereich.content`/`.variant`/
  // `.display_order`/`.is_active` lesen) ohne Änderung weiterlaufen.
  const bereiche = (bereicheRes.data || []).map((b) => {
    const raw = b as WeddingBereich;
    return {
      ...raw,
      content: raw.content_draft || raw.content || {},
      variant: (raw.variant_draft ?? raw.variant) as Variant,
      display_order: raw.display_order_draft ?? raw.display_order,
      is_active: raw.is_active_draft ?? raw.is_active,
    } as WeddingBereich;
  });
  // Falls Draft-Order anders ist als Published, müssen wir neu sortieren
  bereiche.sort((a, b) => a.display_order - b.display_order);

  console.log('[dashboard-data] loaded', {
    slug,
    site_id: merged.id,
    bereiche_count: bereiche.length,
    purchases_count: purchasedKeys.length,
    dirty_bereiche: bereiche.filter((b) => b.is_dirty).length,
    site_dirty: merged.site_is_dirty,
  });

  return {
    site: merged,
    bereiche,
    purchasedKeys,
  };
}

/**
 * Merged die Werte aus site_draft in die Site-Record, damit das Dashboard
 * den Bearbeitungszustand sieht. Bei fehlenden Draft-Werten wird der
 * Published-Wert beibehalten.
 */
function mergeDraftIntoSite(
  raw: WeddingSiteRecord & { site_draft?: Record<string, unknown> },
): WeddingSiteRecord {
  const draft = (raw.site_draft || {}) as Record<string, unknown>;
  // Nur Werte mergen, die wirklich im Draft gesetzt sind (!= undefined).
  // null ist ein gültiger Wert (z.B. hero_image_url entfernt).
  const merged: Record<string, unknown> = { ...raw };
  for (const [key, value] of Object.entries(draft)) {
    if (value !== undefined) merged[key] = value;
  }
  return merged as WeddingSiteRecord;
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
    // Dashboard zeigt Draft-Stand → Stats müssen auch aus Draft kommen.
    // loadDashboardData() spiegelt content_draft auf content; falls dieser
    // Loader umgangen wird, fallback auf content_draft direkt.
    const content =
      (b.content as Record<string, unknown>) ||
      (b.content_draft as Record<string, unknown>) ||
      {};

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

  // siteId wird jetzt genutzt — echte Counts aus separaten Tabellen,
  // wo wir sie schon haben.
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    // wedding_photo_uploads — count
    try {
      const { count } = await supabase
        .from('wedding_photo_uploads')
        .select('*', { count: 'exact', head: true })
        .eq('wedding_site_id', siteId);
      if (typeof count === 'number') stats.photoUploads = count;
    } catch (err) {
      // Tabelle könnte noch nicht existieren — defensiv schlucken
      console.warn('[loadDashboardStats] photoUploads count failed:', err);
    }

    // wedding_rsvps — count + breakdown
    try {
      const { data: rsvps } = await supabase
        .from('wedding_rsvps')
        .select('attending, persons')
        .eq('wedding_site_id', siteId);
      if (Array.isArray(rsvps)) {
        stats.rsvpTotal = rsvps.length;
        for (const r of rsvps as Array<{ attending: boolean }>) {
          if (r.attending) stats.rsvpAccepted += 1;
          else stats.rsvpDeclined += 1;
        }
      }
    } catch (err) {
      console.warn('[loadDashboardStats] rsvp counts failed:', err);
    }
  }

  return stats;
}

/** Hilfsfunktion: findet einen Bereich nach Key in der Liste. */
export function findBereich(
  bereiche: WeddingBereich[],
  key: BereichKey,
): WeddingBereich | undefined {
  return bereiche.find((b) => b.bereich_key === key);
}
