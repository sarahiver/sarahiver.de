/**
 * TypeScript-Types die das Supabase-Schema spiegeln.
 *
 * Manuell gepflegt für jetzt; später ersetzbar durch generierten
 * supabase.ts via: `npm run types:supabase`
 */

// === Stil-DNA ===
export type Alignment = 'center' | 'left';
export type Spacing = 'tight' | 'regular' | 'airy' | 'wide';
export type Decor = 'none' | 'rule' | 'sprig' | 'hairline' | 'gold';
export type Contrast = 'warm' | 'clean' | 'soft' | 'neutral' | 'high';

// === Preset-Tabellen ===
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
  display_style: 'normal' | 'italic';
  display_order: number;
}

export interface StartStyle {
  id: string;
  name: string;
  meta: string;
  default_palette_id: string;
  default_font_id: string;
  dna_align: Alignment;
  dna_spacing: Spacing;
  dna_decor: Decor;
  dna_contrast: Contrast;
  recommended_bereiche: string[];
  display_order: number;
}

// === Wedding-Site ===
export type SiteStatus = 'draft' | 'published' | 'archived';

export interface WeddingSite {
  id: string;
  user_id: string | null;
  slug: string;
  couple_name_1: string;
  couple_name_2: string;
  wedding_date: string; // ISO date
  wedding_location: string | null;
  hero_image_url: string | null;
  start_style_id: string;
  palette_preset_id: string | null;
  palette_custom_bg: string | null;
  palette_custom_bg_soft: string | null;
  palette_custom_accent: string | null;
  palette_custom_accent_deep: string | null;
  palette_custom_ink: string | null;
  font_preset_id: string;
  dna_align_override: Alignment | null;
  dna_spacing_override: Spacing | null;
  dna_decor_override: Decor | null;
  dna_contrast_override: Contrast | null;
  status: SiteStatus;
  /**
   * JSON-Bündel aller editierbaren Felder im Bearbeitungszustand
   * (couple_name_1/2, wedding_date, hero_image_url, palette_*, font_preset_id,
   * nav_variant, dna_*_override, …). Beim Publish wird der Inhalt zurück in
   * die einzelnen Spalten geschrieben.
   */
  site_draft: Record<string, unknown>;
  site_is_dirty: boolean;
  site_published_at: string | null;
  created_at: string;
  updated_at: string;
}

// === Bereich auf einer Hochzeitsseite ===
export type BereichKey =
  | 'hero'
  | 'rsvp'
  | 'timeline'
  | 'lovestory'
  | 'gallery'
  | 'photoupload'
  | 'gifts'
  | 'accommodations'
  | 'directions'
  | 'countdown'
  | 'guestbook'
  | 'faq'
  | 'musicwishes'
  | 'witnesses'
  | 'weddingabc';

export type Variant = 'a' | 'b' | 'c';

export interface WeddingBereich {
  id: string;
  wedding_site_id: string;
  bereich_key: BereichKey;
  variant: Variant;
  display_order: number;
  is_active: boolean;
  /**
   * Veralteter Content-Eintrag — bleibt aus Migrationsgründen erhalten.
   * Neuer Pfad: content_draft (im Dashboard) + content_published (auf der Gäste-Seite).
   */
  content: Record<string, unknown>;
  content_draft: Record<string, unknown>;
  content_published: Record<string, unknown>;
  variant_draft: Variant | null;
  display_order_draft: number | null;
  is_active_draft: boolean | null;
  is_dirty: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// === Effective Tokens View (kombiniert preset + custom) ===
export interface EffectiveTokens {
  wedding_site_id: string;
  slug: string;

  // Start-Stil-Hint (wird zum Image-Filter gemappt)
  start_style_id?: string;

  // Navigations-Variante ('a' | 'b' | 'c' | 'none')
  nav_variant?: string;

  // Farben (effective: custom > preset)
  color_bg: string;
  color_bg_soft: string;
  color_accent: string;
  color_accent_deep: string;
  color_ink: string;

  // Schriften (immer preset)
  font_display: string;
  font_body: string;
  font_script: string | null;
  display_weight: number;
  display_style: 'normal' | 'italic';

  // DNA (effective: override > start_style default)
  dna_align: Alignment;
  dna_spacing: Spacing;
  dna_decor: Decor;
  dna_contrast: Contrast;

  // Couple-Daten
  couple_name_1: string;
  couple_name_2: string;
  wedding_date: string;
  wedding_location: string | null;
  hero_image_url: string | null;
}
