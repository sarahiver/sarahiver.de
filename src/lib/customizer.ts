/**
 * Customizer DNA System
 *
 * Jeder Start-Stil hat eine eigene "DNA": Palette + Schriften + Layout + Spacing + Decor.
 * Beim Wechsel des Start-Stils ändern sich Live-Vorschau und Sub-Auswahl-Defaults.
 *
 * Das ist der Kern der visuellen Differenzierung — nicht nur Farben tauschen,
 * sondern auch Alignment, Spacing, Schriftgewichte und Decor-Elemente.
 */

// === PALETTEN ===
export interface Palette {
  id: string;
  name: string;
  colors: string[]; // [bg, soft, accent, deep, ink]
}

export const PALETTES: Palette[] = [
  {
    id: 'sand-terra',
    name: 'Sandstein & Terrakotta',
    colors: ['#FAF6F0', '#E8C9C0', '#B5746A', '#8E574E', '#2D2520'],
  },
  {
    id: 'olive-honig',
    name: 'Olive & Honig',
    colors: ['#FAF6F0', '#D9DCC5', '#8A9A7B', '#D4A574', '#3A322C'],
  },
  {
    id: 'burgund',
    name: 'Burgund & Creme',
    colors: ['#F4EDE2', '#E3CFB8', '#9C4A3E', '#5C2A26', '#2A1B18'],
  },
  {
    id: 'salbei-rose',
    name: 'Salbei & Rosé',
    colors: ['#FAF6F0', '#E8D6D2', '#C99B92', '#A6B59A', '#3D352F'],
  },
  {
    id: 'pur-schiefer',
    name: 'Reines Weiß & Schiefer',
    colors: ['#FFFFFF', '#EEEEEE', '#9A9A9A', '#3A3A3A', '#0E0E0E'],
  },
  {
    id: 'champagner',
    name: 'Schwarz & Champagner',
    colors: ['#FAF6F0', '#E8D9B8', '#C9A668', '#3A322C', '#0F0D0A'],
  },
];

// === SCHRIFTEN ===
export interface FontPair {
  id: string;
  name: string;
  meta: string;
  display: string;
  body: string;
  weight: number;
  style: 'normal' | 'italic';
}

export const FONTS: FontPair[] = [
  {
    id: 'klassisch-serif',
    name: 'Klassisch-Serif',
    meta: 'Display: Fraunces · Body: Inter',
    display: 'Fraunces, serif',
    body: 'Inter, sans-serif',
    weight: 400,
    style: 'normal',
  },
  {
    id: 'modern-sans',
    name: 'Modern-Sans',
    meta: 'Display: Inter Bold · Body: Inter',
    display: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
    weight: 700,
    style: 'normal',
  },
  {
    id: 'handschrift',
    name: 'Mit Handschrift',
    meta: 'Display: Fraunces Italic · Caveat-Akzent',
    display: 'Fraunces, serif',
    body: 'Inter, sans-serif',
    weight: 400,
    style: 'italic',
  },
  {
    id: 'minimal-mono',
    name: 'Mono-Minimal',
    meta: 'Display: DM Mono · Body: Inter',
    display: '"DM Mono", ui-monospace, monospace',
    body: 'Inter, sans-serif',
    weight: 500,
    style: 'normal',
  },
  {
    id: 'editorial-mix',
    name: 'Editorial-Mix',
    meta: 'Display: Fraunces 700 · Body: Inter',
    display: 'Fraunces, serif',
    body: 'Inter, sans-serif',
    weight: 700,
    style: 'normal',
  },
];

// === START-STILE mit DNA ===
export type Alignment = 'center' | 'left';
export type Spacing = 'tight' | 'regular' | 'airy' | 'wide';
export type Decor = 'none' | 'rule' | 'sprig' | 'hairline' | 'gold';
export type Contrast = 'warm' | 'clean' | 'soft' | 'neutral' | 'high';

export interface StartStyle {
  id: string;
  name: string;
  meta: string;
  defaultPalette: string;
  defaultFonts: string;
  dna: {
    align: Alignment;
    spacing: Spacing;
    decor: Decor;
    contrast: Contrast;
  };
}

export const START_STYLES: StartStyle[] = [
  {
    id: 'klassisch',
    name: 'Klassisch & Warm',
    meta: 'Symmetrisch, Serifen, Sandtöne',
    defaultPalette: 'sand-terra',
    defaultFonts: 'klassisch-serif',
    dna: { align: 'center', spacing: 'regular', decor: 'rule', contrast: 'warm' },
  },
  {
    id: 'modern',
    name: 'Modern & Klar',
    meta: 'Asymmetrisch, Sans, viel Weiß',
    defaultPalette: 'olive-honig',
    defaultFonts: 'modern-sans',
    dna: { align: 'left', spacing: 'airy', decor: 'none', contrast: 'clean' },
  },
  {
    id: 'floral',
    name: 'Verspielt & Floral',
    meta: 'Geschwungen, Italic + Caveat, Ranken',
    defaultPalette: 'salbei-rose',
    defaultFonts: 'handschrift',
    dna: { align: 'center', spacing: 'regular', decor: 'sprig', contrast: 'soft' },
  },
  {
    id: 'minimal',
    name: 'Minimal & Ruhig',
    meta: 'Mono, Hairlines, kein Schmuck',
    defaultPalette: 'pur-schiefer',
    defaultFonts: 'minimal-mono',
    dna: { align: 'left', spacing: 'wide', decor: 'hairline', contrast: 'neutral' },
  },
  {
    id: 'festlich',
    name: 'Bold & Festlich',
    meta: 'Großes Display, Kontrast, Gold',
    defaultPalette: 'burgund',
    defaultFonts: 'editorial-mix',
    dna: { align: 'center', spacing: 'tight', decor: 'gold', contrast: 'high' },
  },
];

// === Helper-Funktionen ===
export const getPalette = (id: string): Palette =>
  PALETTES.find((p) => p.id === id) ?? PALETTES[0];

export const getFontPair = (id: string): FontPair =>
  FONTS.find((f) => f.id === id) ?? FONTS[0];

export const getStartStyle = (id: string): StartStyle =>
  START_STYLES.find((s) => s.id === id) ?? START_STYLES[0];

// Spacing → konkrete Padding-Werte
export const spacingToPadding = (spacing: Spacing): string => {
  switch (spacing) {
    case 'tight':
      return '24px 26px';
    case 'airy':
      return '44px 32px';
    case 'wide':
      return '56px 40px';
    default:
      return '36px 30px'; // regular
  }
};
