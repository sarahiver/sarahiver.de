'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

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

  // Aktuelles site_draft holen und Stammdaten mergen
  const { data: site, error: readErr } = await supabase
    .from('wedding_sites')
    .select('site_draft')
    .eq('slug', p.slug)
    .maybeSingle();
  if (readErr) {
    return { ok: false, error: readErr.message };
  }

  const currentDraft = ((site as unknown as { site_draft: Record<string, unknown> | null } | null)?.site_draft) || {};
  const nextDraft = {
    ...currentDraft,
    couple_name_1: p.couple_name_1.trim(),
    couple_name_2: p.couple_name_2.trim(),
    wedding_date: wedding_date_utc,
    wedding_location: p.wedding_location.trim() || null,
  };

  const { error } = await supabase
    .from('wedding_sites')
    .update({
      site_draft: nextDraft,
      site_is_dirty: true,
      updated_at: new Date().toISOString(),
    } as never)
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
  console.log('[updateStil] payload received:', JSON.stringify({
    slug: p.slug,
    start_style_id: p.start_style_id,
    palette_preset_id: p.palette_preset_id,
    font_preset_id: p.font_preset_id,
    custom_bg: p.custom_bg,
    custom_bg_soft: p.custom_bg_soft,
    custom_accent: p.custom_accent,
    custom_accent_deep: p.custom_accent_deep,
    custom_ink: p.custom_ink,
  }));

  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };
  if (!p.start_style_id) return { ok: false, error: 'Stil-Auswahl fehlt.' };

  // Hex-Validierung für Custom-Farben
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const customs = [p.custom_bg, p.custom_bg_soft, p.custom_accent, p.custom_accent_deep, p.custom_ink];
  for (const c of customs) {
    if (c && !hex.test(c)) {
      return { ok: false, error: `Ungültiger Farbwert: ${c}` };
    }
  }

  // DB-Constraint "palette_source_check":
  //   ENTWEDER palette_preset_id NOT NULL + alle Custom NULL
  //   ODER     palette_preset_id NULL     + Custom gefüllt
  //
  // → Wenn IRGENDEINE Custom-Farbe gesetzt ist, gehen wir in "Custom-Modus":
  //   palette_preset_id wird auf NULL gesetzt, alle 5 Customs müssen gefüllt
  //   sein (sonst hätten wir eine unvollständige Palette).
  // → Wenn keine Custom gesetzt ist, bleibt es bei der Preset-Palette und
  //   alle Customs werden auf NULL gesetzt.
  const hasAnyCustom = customs.some((c) => c && c.trim().length > 0);
  const hasAllCustoms = customs.every((c) => c && c.trim().length > 0);

  // Im Draft können alle Felder einzeln gesetzt sein — der CHECK-Constraint
  // (Preset XOR Custom) gilt nur beim Publish. So kann das Brautpaar in
  // Ruhe wechseln, ohne dass uns die Validierung dazwischenfunkt.
  const draftPatch: Record<string, unknown> = {
    start_style_id: p.start_style_id,
    font_preset_id: p.font_preset_id,
  };

  if (hasAnyCustom) {
    if (!hasAllCustoms) {
      return {
        ok: false,
        error:
          'Wenn einzelne Farben angepasst werden, müssen alle fünf gesetzt sein (Hintergrund, Hintergrund weich, Akzent, Akzent dunkel, Text).',
      };
    }
    draftPatch.palette_preset_id = null;
    draftPatch.palette_custom_bg = p.custom_bg;
    draftPatch.palette_custom_bg_soft = p.custom_bg_soft;
    draftPatch.palette_custom_accent = p.custom_accent;
    draftPatch.palette_custom_accent_deep = p.custom_accent_deep;
    draftPatch.palette_custom_ink = p.custom_ink;
  } else {
    if (!p.palette_preset_id) {
      return {
        ok: false,
        error: 'Bitte eine Palette wählen oder alle fünf Farben individuell setzen.',
      };
    }
    draftPatch.palette_preset_id = p.palette_preset_id;
    draftPatch.palette_custom_bg = null;
    draftPatch.palette_custom_bg_soft = null;
    draftPatch.palette_custom_accent = null;
    draftPatch.palette_custom_accent_deep = null;
    draftPatch.palette_custom_ink = null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  // Aktuelles Draft holen und mergen
  const { data: site, error: readErr } = await supabase
    .from('wedding_sites')
    .select('site_draft')
    .eq('slug', p.slug)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  const currentDraft = ((site as unknown as { site_draft: Record<string, unknown> | null } | null)?.site_draft) || {};
  const nextDraft = { ...currentDraft, ...draftPatch };

  const { error } = await supabase
    .from('wedding_sites')
    .update({
      site_draft: nextDraft,
      site_is_dirty: true,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('slug', p.slug);

  if (error) {
    console.error('[updateStil] update failed:', error);
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

  const { data: site, error: readErr } = await supabase
    .from('wedding_sites')
    .select('site_draft')
    .eq('slug', p.slug)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  const currentDraft = ((site as unknown as { site_draft: Record<string, unknown> | null } | null)?.site_draft) || {};
  const nextDraft = { ...currentDraft, nav_variant: p.nav_variant };

  const { error } = await supabase
    .from('wedding_sites')
    .update({
      site_draft: nextDraft,
      site_is_dirty: true,
      updated_at: new Date().toISOString(),
    } as never)
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
// KONTO / PASSWORT
// ====================================================================

/**
 * Setzt (oder ändert) das Passwort des aktuell eingeloggten Users.
 *
 * Nutzt die bestehende Session (z. B. aus dem Magic-Link-Login) — daher der
 * Server-Client mit Cookies, NICHT der Admin-Client. `updateUser({ password })`
 * funktioniert auch für Accounts, die bisher kein Passwort hatten; Magic-Link
 * bleibt danach parallel nutzbar.
 */
export async function setAccountPassword(password: string): Promise<ActionResult> {
  if (!password || password.length < 8) {
    return { ok: false, error: 'Passwort muss mindestens 8 Zeichen haben.' };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sitzung abgelaufen — bitte neu einloggen.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error('[setAccountPassword] failed:', error);
    return { ok: false, error: 'Passwort konnte nicht gesetzt werden.' };
  }
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
