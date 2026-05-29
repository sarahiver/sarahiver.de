import { createSupabaseAdminClient } from './supabase-admin';

/**
 * Preset-Tabellen (start_styles, palette_presets, font_presets) — Stammdaten,
 * die selten geändert werden. Werden im Settings-Editor angezeigt.
 *
 * Die Felder spiegeln die DB-Spalten 1:1 (siehe Diagnose vom 29.05.2026).
 */

export interface StartStylePreset {
  id: string;
  name: string;
  meta: string;
  default_palette_id: string;
  default_font_id: string;
  dna_align: string;
  dna_spacing: string;
  dna_decor: string;
  dna_contrast: string;
  display_order: number;
}

export interface PalettePreset {
  id: string;
  name: string;
  color_bg: string;
  color_bg_soft: string;
  color_accent: string;
  color_accent_deep: string;
  color_ink: string;
  display_order: number;
}

export interface FontPreset {
  id: string;
  name: string;
  font_display: string;
  font_body: string;
  font_script: string | null;
  display_weight: number;
  display_style: string;
  display_order: number;
}

export interface AllPresets {
  styles: StartStylePreset[];
  palettes: PalettePreset[];
  fonts: FontPreset[];
}

export async function loadAllPresets(): Promise<AllPresets> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { styles: [], palettes: [], fonts: [] };
  }

  const [stylesRes, palettesRes, fontsRes] = await Promise.all([
    supabase.from('start_styles').select('*').order('display_order'),
    supabase.from('palette_presets').select('*').order('display_order'),
    supabase.from('font_presets').select('*').order('display_order'),
  ]);

  if (stylesRes.error) console.error('[presets] start_styles failed:', stylesRes.error);
  if (palettesRes.error) console.error('[presets] palette_presets failed:', palettesRes.error);
  if (fontsRes.error) console.error('[presets] font_presets failed:', fontsRes.error);

  return {
    styles: (stylesRes.data || []) as StartStylePreset[],
    palettes: (palettesRes.data || []) as PalettePreset[],
    fonts: (fontsRes.data || []) as FontPreset[],
  };
}
