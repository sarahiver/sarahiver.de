'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Server Actions für den Settings-Editor.
 *
 * Pattern:
 *  - typisiertes Payload-Argument (kein FormData, das macht Validierung
 *    schwer und Typen unscharf)
 *  - Validierung serverseitig (auch wenn das Frontend schon vorvalidiert)
 *  - Supabase-Update via Admin-Client (umgeht RLS)
 *  - revalidatePath für Dashboard + Gäste-Seite, damit Live-Vorschau
 *    aktualisiert wird
 *  - liefert { ok: true } oder { ok: false, error: string } zurück
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// ====================================================================
// STAMMDATEN
// ====================================================================

export interface StammdatenPayload {
  slug: string;
  couple_name_1: string;
  couple_name_2: string;
  wedding_date_local: string; // "2026-11-15" (YYYY-MM-DD)
  wedding_time_local: string; // "14:00" (HH:MM)
  wedding_location: string;
}

export async function updateStammdaten(p: StammdatenPayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };
  if (!p.couple_name_1.trim() || !p.couple_name_2.trim()) {
    return { ok: false, error: 'Beide Vornamen sind erforderlich.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.wedding_date_local)) {
    return { ok: false, error: 'Datum muss im Format JJJJ-MM-TT sein.' };
  }
  if (!/^\d{2}:\d{2}$/.test(p.wedding_time_local)) {
    return { ok: false, error: 'Uhrzeit muss im Format HH:MM sein.' };
  }

  // Lokale Eingabe (Datum + Uhrzeit) → ISO mit Europe/Berlin-Offset.
  // Die DB speichert TIMESTAMPTZ, wir kennzeichnen die Zone explizit.
  // November = Standardzeit (UTC+1). Wir wandeln in UTC um.
  const wedding_date_utc = berlinLocalToUtcIso(p.wedding_date_local, p.wedding_time_local);

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { error } = await supabase
    .from('wedding_sites')
    .update({
      couple_name_1: p.couple_name_1.trim(),
      couple_name_2: p.couple_name_2.trim(),
      wedding_date: wedding_date_utc,
      wedding_location: p.wedding_location.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', p.slug);

  if (error) {
    console.error('[updateStammdaten] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// STIL (start_style_id, palette_preset_id, font_preset_id + Custom-Overrides)
// ====================================================================

export interface StilPayload {
  slug: string;
  start_style_id: string;
  palette_preset_id: string | null;
  font_preset_id: string | null;
  custom_bg: string | null;
  custom_bg_soft: string | null;
  custom_accent: string | null;
  custom_accent_deep: string | null;
  custom_ink: string | null;
}

export async function updateStil(p: StilPayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };
  if (!p.start_style_id) return { ok: false, error: 'Stil-Auswahl fehlt.' };

  // Hex-Validierung für Custom-Farben (optional)
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const customs = [p.custom_bg, p.custom_bg_soft, p.custom_accent, p.custom_accent_deep, p.custom_ink];
  for (const c of customs) {
    if (c && !hex.test(c)) {
      return { ok: false, error: `Ungültiger Farbwert: ${c}` };
    }
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { error } = await supabase
    .from('wedding_sites')
    .update({
      start_style_id: p.start_style_id,
      palette_preset_id: p.palette_preset_id,
      font_preset_id: p.font_preset_id,
      palette_custom_bg: p.custom_bg,
      palette_custom_bg_soft: p.custom_bg_soft,
      palette_custom_accent: p.custom_accent,
      palette_custom_accent_deep: p.custom_accent_deep,
      palette_custom_ink: p.custom_ink,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', p.slug);

  if (error) {
    console.error('[updateStil] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// NAVIGATION (nav_variant)
// ====================================================================

export interface NavPayload {
  slug: string;
  nav_variant: 'a' | 'b' | 'c' | 'none';
}

export async function updateNavigation(p: NavPayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };
  if (!['a', 'b', 'c', 'none'].includes(p.nav_variant)) {
    return { ok: false, error: 'Ungültige Nav-Variante.' };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { error } = await supabase
    .from('wedding_sites')
    .update({
      nav_variant: p.nav_variant,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', p.slug);

  if (error) {
    console.error('[updateNavigation] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// Helpers
// ====================================================================

/**
 * Konvertiert lokale Berlin-Zeit (Datum + Uhrzeit als getrennte Strings)
 * in einen ISO-UTC-String. Berücksichtigt Sommer-/Winterzeit.
 *
 * Strategie: Wir nutzen Intl.DateTimeFormat, um den UTC-Offset für die
 * gewünschte Berlin-Zeit zu bestimmen — robust und ohne externe libs.
 */
function berlinLocalToUtcIso(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split('-').map((s) => parseInt(s, 10));
  const [hh, mm] = timeStr.split(':').map((s) => parseInt(s, 10));

  // 1. Naive UTC-Repräsentation der lokalen Eingabe konstruieren
  const naive = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));

  // 2. Diese naive UTC-Zeit zurückwerfen in Berlin-Komponenten lesen.
  //    Differenz zur Eingabe = Offset.
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(naive);
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value || '0', 10);
  const berlinAsIfUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );

  // Offset (ms) zwischen Berlin-Anzeige und UTC
  const offsetMs = berlinAsIfUtc - naive.getTime();

  // 3. Echte UTC-Zeit = naive UTC minus Offset
  const realUtc = new Date(naive.getTime() - offsetMs);
  return realUtc.toISOString();
}
