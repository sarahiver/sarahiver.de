/**
 * Optionen für das Live-Dashboard.
 *
 * Nur Stil-Switch — Color/Font sind Teil der Stil-DNA (laut Design-System-Spec v2)
 * und nicht einzeln wählbar. Override würde die Stil-Identität zerstören.
 */

export interface DashStyleOption {
  id: string;
  label: string;
  hint: string;
  tagline: string;
}

export const DASH_STYLES: DashStyleOption[] = [
  { id: 'editorial', label: 'Editorial', hint: 'Kinfolk · Aesop',     tagline: 'Magazin-DNA mit Bento-Dekonstruktion.' },
  { id: 'brutalist', label: 'Brutalist', hint: 'Awwwards · Statement',tagline: 'Marquee, 3D-Tilt, SVG-Distortion.' },
  { id: 'organic',   label: 'Organic',   hint: 'Goo · Mesh',           tagline: 'Wabernde Formen, Quecksilber-Blobs.' },
  { id: 'mono',      label: 'Mono',      hint: 'Print-Buch · Code',    tagline: 'JetBrains Mono. Radikal ruhig.' },
  { id: 'opulent',   label: 'Opulent',   hint: 'Vogue Italia · Gold',  tagline: 'Aurora, Gold-Shimmer, 3D-Stack.' },
  { id: 'liquefy',   label: 'Liquefy',   hint: 'Acid-Melt · Mercury',  tagline: 'Verflüssigt zu Liquid-Mercury.' },
  { id: 'kinetic',   label: 'Kinetic',   hint: 'Magazine-Skew · Loop', tagline: 'Diagonale Marquee, gekippte Bilder.' },
  { id: 'bauhaus',   label: 'Bauhaus',   hint: 'Konstruktivistisch',   tagline: 'Roter Kreis, gelbes Rechteck.' },
];
