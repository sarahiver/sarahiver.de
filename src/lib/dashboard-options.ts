/**
 * Optionen für das Live-Dashboard auf der Landing.
 *
 * Style, Color und Font sind orthogonal — jede Kombination
 * ist anwählbar (8 × 5 × 4 = 160 Kombinationen).
 *
 * Color- und Font-Vars werden via [data-dp-color] und [data-dp-font]
 * Attribute auf dem Preview-Wrapper aus CSS angewendet.
 */

export interface DashStyleOption {
  id: string;
  label: string;
  hint: string;
}

export const DASH_STYLES: DashStyleOption[] = [
  { id: 'editorial', label: 'Editorial', hint: 'warm · magazinhaft' },
  { id: 'organic',   label: 'Organic',   hint: 'weich · fließend' },
  { id: 'brutalist', label: 'Brutalist', hint: 'klar · laut' },
  { id: 'mono',      label: 'Mono',      hint: 'technisch · ruhig' },
  { id: 'opulent',   label: 'Opulent',   hint: 'dunkel · gold' },
  { id: 'liquefy',   label: 'Liquefy',   hint: 'flüssig · tief' },
  { id: 'kinetic',   label: 'Kinetic',   hint: 'bewegt · scharf' },
  { id: 'bauhaus',   label: 'Bauhaus',   hint: 'primär · geometrisch' },
];

export interface DashColorOption {
  id: string;
  label: string;
  swatches: string[];
}

export const DASH_COLORS: DashColorOption[] = [
  {
    id: 'sand-terra',
    label: 'Sand & Terra',
    swatches: ['#FAF6F0', '#8B2A2A', '#1A0E14'],
  },
  {
    id: 'salbei-rose',
    label: 'Salbei & Rosé',
    swatches: ['#EDE7DC', '#B5746A', '#3E4A35'],
  },
  {
    id: 'pur-schiefer',
    label: 'Pur & Schiefer',
    swatches: ['#FFFFFF', '#1A1A1A', '#888888'],
  },
  {
    id: 'burgund-gold',
    label: 'Burgund & Gold',
    swatches: ['#1A0E14', '#C9A14F', '#F4E8D3'],
  },
  {
    id: 'olive-honig',
    label: 'Olive & Honig',
    swatches: ['#F3EFE0', '#9B8A4F', '#3D3B22'],
  },
];

export interface DashFontOption {
  id: string;
  label: string;
  hint: string;
}

export const DASH_FONTS: DashFontOption[] = [
  { id: 'klassisch-serif', label: 'Klassisch',   hint: 'Fraunces + Inter' },
  { id: 'modern-sans',     label: 'Modern',       hint: 'Inter + Inter' },
  { id: 'editorial-mix',   label: 'Editorial',    hint: 'Fraunces + Mono' },
  { id: 'minimal-mono',    label: 'Mono',         hint: 'DM Mono · überall' },
];

/**
 * Default-Combinations pro Stil — wenn User Stil wechselt,
 * werden diese als Voreinstellung gesetzt (sieht initial gut aus).
 */
export const DASH_STYLE_DEFAULTS: Record<string, { color: string; font: string }> = {
  editorial: { color: 'sand-terra',   font: 'klassisch-serif' },
  organic:   { color: 'salbei-rose',  font: 'klassisch-serif' },
  brutalist: { color: 'pur-schiefer', font: 'modern-sans' },
  mono:      { color: 'pur-schiefer', font: 'minimal-mono' },
  opulent:   { color: 'burgund-gold', font: 'editorial-mix' },
  liquefy:   { color: 'salbei-rose',  font: 'klassisch-serif' },
  kinetic:   { color: 'pur-schiefer', font: 'modern-sans' },
  bauhaus:   { color: 'pur-schiefer', font: 'modern-sans' },
};
