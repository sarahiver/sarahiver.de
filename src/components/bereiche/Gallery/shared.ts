/**
 * Geteilte Typen für die Galerie-Varianten.
 *
 * content-Schema (alle drei Varianten gleich):
 *   eyebrow?:  string  — z.B. "Momente"
 *   title?:    string  — z.B. "Bilder unserer <em>Reise</em>." (em-Tags erlaubt)
 *   intro?:    string  — Optionaler Lead
 *   images:    GalleryImage[]
 *
 * GalleryImage:
 *   id:           string  — stabile ID für key-Prop
 *   src:          string  — Cloudinary-URL
 *   alt:          string  — Alt-Text
 *   caption?:     string  — Bildunterschrift (sichtbar nur in B + Lightbox)
 *   orientation?: 'portrait' | 'landscape' | 'square'  — für Variante B
 */

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface GalleryContent {
  eyebrow?: string;
  title?: string;
  intro?: string;
  images?: GalleryImage[];
}

export const GALLERY_DEFAULTS = {
  eyebrow: 'Momente',
  title: 'Bilder unserer <em>Reise</em>.',
  intro: '',
} as const;

/**
 * Lese images[] sicher aus dem content-JSON.
 */
export function readImages(content: Record<string, unknown>): GalleryImage[] {
  const raw = content.images;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (i): i is GalleryImage =>
      typeof i === 'object' &&
      i !== null &&
      typeof (i as GalleryImage).id === 'string' &&
      typeof (i as GalleryImage).src === 'string' &&
      typeof (i as GalleryImage).alt === 'string',
  );
}

/**
 * Storyboard-Pattern für Variante B.
 * Erzeugt Gruppen mit variierenden Layouts: full → pair → triple → pair → ...
 */
const STORYBOARD_PATTERN = ['full', 'pair', 'triple', 'pair', 'full', 'pair', 'pair'] as const;
const PATTERN_SIZE = { full: 1, pair: 2, triple: 3 } as const;

export type StoryboardLayout = (typeof STORYBOARD_PATTERN)[number];

export interface StoryboardGroup {
  layout: StoryboardLayout;
  items: GalleryImage[];
}

export function buildStoryboardGroups(images: GalleryImage[]): StoryboardGroup[] {
  const groups: StoryboardGroup[] = [];
  let i = 0;
  let p = 0;
  while (i < images.length) {
    const layout = STORYBOARD_PATTERN[p % STORYBOARD_PATTERN.length];
    const size = PATTERN_SIZE[layout];
    const slice = images.slice(i, i + size);
    if (slice.length === 0) break;
    // Wenn weniger Bilder als Pattern-Slot übrig: degradiere zu "full"
    const actualLayout: StoryboardLayout = slice.length < size ? 'full' : layout;
    groups.push({ layout: actualLayout, items: slice });
    i += slice.length;
    p++;
  }
  return groups;
}

/**
 * Title-Helper mit <em>-Allowlist (identisch zur Lovestory-Logik).
 */
export function renderTitleWithEm(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped
    .replace(/&lt;em&gt;/g, '<em>')
    .replace(/&lt;\/em&gt;/g, '</em>');
}
