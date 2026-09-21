import type { CSSProperties } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import type { DnaValues } from '@/lib/dna-context';
import type { StartStylePreset, PalettePreset, FontPreset } from '@/lib/presets';

/* -------------------------------------------------------------------------
   Client-sichere Repliken der reinen tokens.ts-Bausteine.
   (tokens.ts selbst importiert supabase-server/admin und ist daher nicht
   client-importierbar. Diese Funktionen sind 1:1-Kopien der reinen Logik.)
   ------------------------------------------------------------------------- */
const SPACING_MULTIPLIER: Record<string, number> = { tight: 0.75, regular: 1.0, airy: 1.25, wide: 1.5 };
const PADDING_SCALE = { tight: '18px', regular: '32px', airy: '48px', wide: '64px' };
const IMAGE_FILTERS: Record<string, string> = {
  editorial: 'contrast(1.04) saturate(0.92)',
  brutalist: 'grayscale(1) contrast(1.25)',
  organic: 'saturate(0.95)',
  mono: 'grayscale(0.4) contrast(1.02)',
  opulent: 'saturate(1.04) contrast(1.03)', // warme Farbfotografie, kein Sepia
  liquefy: 'none', // Liquefy zeigt Fotos klar; die Weichheit liegt in der Umgebung
  kinetic: 'contrast(1.05) saturate(0.95)',
  bauhaus: 'none', // Bauhaus zeigt Farbfotografie (Kontrast zu Mono/Brutalist)
};

function imgVariants(url: string | null) {
  const f = url || '';
  // Pexels/externe URLs unverändert in allen Ratios (nur Cloudinary wird transformiert).
  return { base: f, portrait: f, square: f, wide: f, tall: f };
}

/** Client-sichere Kopie von tokensToCSSVariables. */
export function buildCssVars(t: EffectiveTokens): CSSProperties {
  const styleHint = (t as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const imgFilter = IMAGE_FILTERS[styleHint] ?? IMAGE_FILTERS.editorial;
  const iv = imgVariants(t.hero_image_url);
  const vars: Record<string, string> = {
    '--bg': t.color_bg,
    '--bg-soft': t.color_bg_soft,
    '--accent': t.color_accent,
    '--accent-deep': t.color_accent_deep,
    '--ink': t.color_ink,
    '--font-display': t.font_display,
    '--font-body': t.font_body,
    '--font-script': t.font_script ?? 'inherit',
    '--font-mono': "'JetBrains Mono', ui-monospace, monospace",
    '--display-weight': String(t.display_weight),
    '--display-style': t.display_style,
    '--align': t.dna_align,
    '--spacing': t.dna_spacing,
    '--decor': t.dna_decor,
    '--contrast': t.dna_contrast,
    '--spacing-multiplier': String(SPACING_MULTIPLIER[t.dna_spacing] ?? 1),
    '--ink-soft': `color-mix(in srgb, ${t.color_ink} 65%, transparent)`,
    '--muted': `color-mix(in srgb, ${t.color_ink} 45%, transparent)`,
    '--border': `color-mix(in srgb, ${t.color_ink} 15%, transparent)`,
    '--border-soft': `color-mix(in srgb, ${t.color_ink} 8%, transparent)`,
    '--img-filter': imgFilter,
    '--vignette': 'rgba(20, 16, 12, 0.45)',
    '--vignette-soft': 'rgba(20, 16, 12, 0.12)',
    '--gold': '#C9A668',
    '--pad-tight': PADDING_SCALE.tight,
    '--pad-regular': PADDING_SCALE.regular,
    '--pad-airy': PADDING_SCALE.airy,
    '--pad-wide': PADDING_SCALE.wide,
    '--img-base': `url('${iv.base}')`,
    '--img-portrait': `url('${iv.portrait}')`,
    '--img-square': `url('${iv.square}')`,
    '--img-wide': `url('${iv.wide}')`,
    '--img-tall': `url('${iv.tall}')`,
  };
  return vars as unknown as CSSProperties;
}

/* -------------------------------------------------------------------------
   Fallback-Presets — werden genutzt, wenn keine DB-Presets geladen sind
   (Build/Dev ohne Supabase). In Produktion überschreiben die echten
   DB-Presets diese via Props.
   ------------------------------------------------------------------------- */
export const FALLBACK_PALETTES: PalettePreset[] = [
  { id: 'rose', name: 'Rosé', color_bg: '#F7F2EC', color_bg_soft: '#efe7dd', color_accent: '#7C2B38', color_accent_deep: '#5a1f29', color_ink: '#26201d', display_order: 0 },
  { id: 'sage', name: 'Salbei', color_bg: '#F1F3ED', color_bg_soft: '#e2e7da', color_accent: '#5B7355', color_accent_deep: '#3f5340', color_ink: '#2b3327', display_order: 1 },
  { id: 'midnight', name: 'Mitternacht', color_bg: '#14161C', color_bg_soft: '#1d212a', color_accent: '#C9A24B', color_accent_deep: '#a5822f', color_ink: '#EDEAF2', display_order: 2 },
  { id: 'sand', name: 'Sand', color_bg: '#FAF4E9', color_bg_soft: '#efe3cf', color_accent: '#C2764A', color_accent_deep: '#9c5b34', color_ink: '#3a2f22', display_order: 3 },
  { id: 'bordeaux', name: 'Bordeaux', color_bg: '#F5EEEF', color_bg_soft: '#e7d7da', color_accent: '#8E2C43', color_accent_deep: '#6a1f31', color_ink: '#2a1418', display_order: 4 },
  // Signal — Standardpalette für Brutalist: fast Schwarz, warmes Off-White,
  // Signal-Orange. Bewusst ohne Gold/Neon: Brutalist soll grafisch wirken,
  // nicht nach Acid-Design.
  { id: 'signal', name: 'Signal', color_bg: '#F2EFE6', color_bg_soft: '#DEDAD0', color_accent: '#FF4A17', color_accent_deep: '#D6350A', color_ink: '#111111', display_order: 5 },
  // Mono — reines Schwarz/Weiß/Grau. Der "Akzent" ist bewusst ein Grau:
  // Mono hat keine Akzentfarbe, die Rolle wird mit neutralen Stufen belegt.
  { id: 'mono-ink', name: 'Mono', color_bg: '#F6F6F4', color_bg_soft: '#E7E7E4', color_accent: '#3A3A3A', color_accent_deep: '#1C1C1C', color_ink: '#141414', display_order: 6 },
  // Bauhaus — Creme-Grund, Rot als accent, Blau als accent_deep. Das Gelb ist
  // die dritte Primärfarbe und liegt als feste Konstante im Bauhaus-Layer,
  // weil das Palettenschema nur zwei Akzente kennt.
  { id: 'bauhaus-primary', name: 'Bauhaus', color_bg: '#F3EEE3', color_bg_soft: '#E7E0D1', color_accent: '#D6322B', color_accent_deep: '#1D4E9E', color_ink: '#161616', display_order: 7 },
  // Opulent — Elfenbein, Champagner, Espresso, Gold. accent = Gold (nur Linien
  // und Großschrift, 2,75:1 auf Elfenbein), accent_deep = tiefes Gold für
  // kleine Meta (5,5:1), ink = Espresso (14,5:1) — zugleich die Abendfläche.
  { id: 'opulent-ivory', name: 'Opulent', color_bg: '#F7F1E6', color_bg_soft: '#EBDDC5', color_accent: '#B08D57', color_accent_deep: '#7A5C2E', color_ink: '#2A1D15', display_order: 8 },
  // Liquefy — Perle, Blush, Rosé, Pflaume. accent = Rosé (nur Flächen/Glow),
  // accent_deep = Pflaume für kleinen Text, ink = tiefes Violett-Grau. Die
  // Nachtfarben (Blau, Violett, Wein, Glow) liegen als Konstanten im Layer.
  { id: 'liquefy-pearl', name: 'Liquefy', color_bg: '#FBF4EF', color_bg_soft: '#F3E3DE', color_accent: '#C9788A', color_accent_deep: '#6B4A73', color_ink: '#2A2230', display_order: 9 },
];

export const FALLBACK_FONTS: FontPreset[] = [
  { id: 'classic', name: 'Klassisch', font_display: "'Cormorant Garamond', serif", font_body: "'Karla', sans-serif", font_script: "'Caveat', cursive", display_weight: 500, display_style: 'normal', display_order: 0 },
  { id: 'modern', name: 'Modern', font_display: "'Space Grotesk', sans-serif", font_body: "'Manrope', sans-serif", font_script: null, display_weight: 500, display_style: 'normal', display_order: 1 },
  // Brutal — fette Grotesk für Brutalist. Syne 800 ist bereits geladen.
  { id: 'brutal', name: 'Brutal', font_display: "'Syne', 'Arial Black', sans-serif", font_body: "'Space Grotesk', sans-serif", font_script: null, display_weight: 800, display_style: 'normal', display_order: 3 },
  // Mono Serif — Cormorant Garamond aufrecht in 500, Manrope für Text und Meta.
  // Beide Schriften sind bereits in design-system-v2.css geladen.
  { id: 'mono-serif', name: 'Mono Serif', font_display: "'Cormorant Garamond', 'Times New Roman', serif", font_body: "'Manrope', sans-serif", font_script: null, display_weight: 500, display_style: 'normal', display_order: 4 },
  // Bauhaus Sans — Manrope 800 als geometrische Display-Sans, Karla für Text.
  // Beide bereits geladen; bewusst nicht Syne/Space Grotesk (Brutalist).
  { id: 'bauhaus-sans', name: 'Bauhaus Sans', font_display: "'Manrope', 'Helvetica Neue', sans-serif", font_body: "'Karla', system-ui, sans-serif", font_script: null, display_weight: 800, display_style: 'normal', display_order: 5 },
  // Opulent Serif — Italiana als zeremonielle Display-Serif, Manrope für Text.
  // Beide bereits geladen; keine Script-Schrift.
  { id: 'opulent-serif', name: 'Opulent Serif', font_display: "'Italiana', 'Cormorant Garamond', serif", font_body: "'Manrope', system-ui, sans-serif", font_script: null, display_weight: 400, display_style: 'normal', display_order: 6 },
  // Liquefy Serif — Cormorant Garamond 400 als weiche, moderne Serif, Manrope
  // für Text. Beide geladen; keine Script-Schrift.
  { id: 'liquefy-serif', name: 'Liquefy Serif', font_display: "'Cormorant Garamond', 'Times New Roman', serif", font_body: "'Manrope', system-ui, sans-serif", font_script: null, display_weight: 400, display_style: 'normal', display_order: 7 },
  { id: 'romantic', name: 'Romantisch', font_display: "'Fraunces', serif", font_body: "'Crimson Pro', serif", font_script: "'Caveat', cursive", display_weight: 400, display_style: 'italic', display_order: 2 },
];

export const FALLBACK_STYLES: StartStylePreset[] = [
  { id: 'editorial', name: 'Editorial', meta: 'Redaktionell, ruhig', default_palette_id: 'rose', default_font_id: 'classic', dna_align: 'left', dna_spacing: 'airy', dna_decor: 'rule', dna_contrast: 'warm', display_order: 0 },
  { id: 'organic', name: 'Organic', meta: 'Weich, natürlich', default_palette_id: 'sage', default_font_id: 'classic', dna_align: 'center', dna_spacing: 'airy', dna_decor: 'sprig', dna_contrast: 'soft', display_order: 1 },
  { id: 'opulent', name: 'Opulent', meta: 'Edel, festlich', default_palette_id: 'opulent-ivory', default_font_id: 'opulent-serif', dna_align: 'center', dna_spacing: 'wide', dna_decor: 'gold', dna_contrast: 'warm', display_order: 2 },
  { id: 'mono', name: 'Mono', meta: 'Reduziert, klar', default_palette_id: 'mono-ink', default_font_id: 'mono-serif', dna_align: 'left', dna_spacing: 'regular', dna_decor: 'hairline', dna_contrast: 'clean', display_order: 3 },
  { id: 'liquefy', name: 'Liquefy', meta: 'Fließend, verträumt', default_palette_id: 'liquefy-pearl', default_font_id: 'liquefy-serif', dna_align: 'center', dna_spacing: 'airy', dna_decor: 'none', dna_contrast: 'soft', display_order: 4 },
  { id: 'kinetic', name: 'Kinetic', meta: 'Dynamisch, modern', default_palette_id: 'midnight', default_font_id: 'modern', dna_align: 'left', dna_spacing: 'regular', dna_decor: 'none', dna_contrast: 'high', display_order: 5 },
  { id: 'brutalist', name: 'Brutalist', meta: 'Roh, kontrastreich', default_palette_id: 'signal', default_font_id: 'brutal', dna_align: 'left', dna_spacing: 'tight', dna_decor: 'none', dna_contrast: 'high', display_order: 6 },
  { id: 'bauhaus', name: 'Bauhaus', meta: 'Geometrisch, grafisch', default_palette_id: 'bauhaus-primary', default_font_id: 'bauhaus-sans', dna_align: 'left', dna_spacing: 'regular', dna_decor: 'none', dna_contrast: 'clean', display_order: 7 },
];

/* Demo-Stammdaten für die Vorschau */
export const DEMO_META = {
  couple_name_1: 'Sarah',
  couple_name_2: 'Iver',
  wedding_date: '2026-07-11',
  wedding_location: 'Grüner Jäger, Hamburg',
  hero_image_url: 'https://images.pexels.com/photos/31558934/pexels-photo-31558934.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

/** Demo-Inhalte je Bereich (Text-Keys; unbekannte Keys ignorieren die Komponenten). */
export const DEMO_CONTENT: Record<string, Record<string, unknown>> = {
  hero: { eyebrow: 'Wir heiraten' },
  countdown: { eyebrow: 'Es sind noch', footer: 'bis zum großen Tag' },
  lovestory: {
    eyebrow: 'Unsere Geschichte', title: 'Wie alles begann', moment_title: 'Der Antrag',
    when: '2023', description: 'Ein verregneter Morgen in Kopenhagen — und ein Ja, das alles veränderte.',
    signature: 'Sarah & Iver',
  },
  timeline: { eyebrow: 'Ablauf', title: 'Der Tag', description: 'Von der Trauung bis zur letzten Runde auf der Tanzfläche.' },
  faq: { eyebrow: 'Gut zu wissen', title: 'Fragen & Antworten', description: 'Dresscode, Anfahrt, Kinder — hier steht alles.' },
  gallery: { eyebrow: 'Momente', title: 'Galerie', intro: 'Ein paar unserer liebsten Bilder.' },
  gifts: { eyebrow: 'Schenken', title: 'Reisekasse' },
  rsvp: { eyebrow: 'Antwort erbeten', title: 'Seid ihr dabei?' },
  directions: { eyebrow: 'Anfahrt', title: 'So findet ihr uns' },
  accommodations: { eyebrow: 'Übernachtung', title: 'Wo ihr schlafen könnt' },
  witnesses: { eyebrow: 'Trauzeugen', title: 'Unsere rechte & linke Hand' },
  guestbook: { eyebrow: 'Gästebuch', title: 'Hinterlasst ein paar Worte' },
  musicwishes: { eyebrow: 'Musikwünsche', title: 'Welcher Song darf nicht fehlen?' },
  photoupload: { eyebrow: 'Eure Bilder', title: 'Teilt eure Momente' },
  weddingabc: { eyebrow: 'Hochzeits-ABC', title: 'Von A bis Z' },
};

export interface PresetBundle {
  styles: StartStylePreset[];
  palettes: PalettePreset[];
  fonts: FontPreset[];
}

/** Baut Demo-EffectiveTokens aus gewähltem Stil / Palette / Font. */
export function demoTokens(
  styleId: string,
  paletteId: string,
  fontId: string,
  presets: PresetBundle,
): EffectiveTokens {
  const pal = presets.palettes.find((p) => p.id === paletteId) ?? presets.palettes[0];
  const fnt = presets.fonts.find((f) => f.id === fontId) ?? presets.fonts[0];
  const sty = presets.styles.find((s) => s.id === styleId) ?? presets.styles[0];
  return {
    wedding_site_id: 'demo',
    slug: 'sarah-und-iver',
    start_style_id: styleId,
    nav_variant: 'none',
    color_bg: pal.color_bg,
    color_bg_soft: pal.color_bg_soft,
    color_accent: pal.color_accent,
    color_accent_deep: pal.color_accent_deep,
    color_ink: pal.color_ink,
    font_display: fnt.font_display,
    font_body: fnt.font_body,
    font_script: fnt.font_script,
    display_weight: fnt.display_weight,
    display_style: fnt.display_style as 'normal' | 'italic',
    dna_align: sty.dna_align as EffectiveTokens['dna_align'],
    dna_spacing: sty.dna_spacing as EffectiveTokens['dna_spacing'],
    dna_decor: sty.dna_decor as EffectiveTokens['dna_decor'],
    dna_contrast: sty.dna_contrast as EffectiveTokens['dna_contrast'],
    couple_name_1: DEMO_META.couple_name_1,
    couple_name_2: DEMO_META.couple_name_2,
    wedding_date: DEMO_META.wedding_date,
    wedding_location: DEMO_META.wedding_location,
    hero_image_url: DEMO_META.hero_image_url,
  };
}

export function dnaFromTokens(t: EffectiveTokens): DnaValues {
  return {
    align: t.dna_align,
    spacing: t.dna_spacing,
    decor: t.dna_decor,
    contrast: t.dna_contrast,
    spacingMultiplier: SPACING_MULTIPLIER[t.dna_spacing] ?? 1,
  };
}
