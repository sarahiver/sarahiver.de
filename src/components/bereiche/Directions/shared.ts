/**
 * Anfahrt (Directions) — geteilte Typen und Helfer.
 *
 * content-Schema:
 *   eyebrow?:     string
 *   title?:       string  (em-Tags erlaubt)
 *   description?: string
 *   items:        DirLocation[]
 *
 * DirLocation:
 *   id:           string
 *   label:        string  — Kurz-Label/Typ (Trauung, Feier, …) (Pflicht)
 *   name:         string  — Name des Orts (Pflicht)
 *   address:      string  — Adresse, \n erlaubt (Pflicht)
 *   description?: string  — Fließtext, [text](url) Links, \n erlaubt
 *   maps_embed?:  string  — iframe-Embed-URL (key-frei). Fehlt sie, wird
 *                           sie aus address generiert.
 *   maps_url?:    string  — "Route planen"-Link. Fehlt er, wird er aus
 *                           address generiert.
 *   transit?:     { mode, text }[]  — Anreise-Hinweise (car/train/bus/park/walk)
 *
 * Maps-Strategie (wie sarahiver.com): key-freie Embed-iframes + dir-Links.
 * Kein Google-Maps-SDK, kein API-Key im Frontend.
 */

export type TransitMode = 'car' | 'train' | 'bus' | 'park' | 'walk';

export interface DirTransit {
  mode: TransitMode | string;
  text: string;
}

export interface DirLocation {
  id: string;
  label: string;
  name: string;
  address: string;
  description?: string;
  maps_embed?: string;
  maps_url?: string;
  transit?: DirTransit[];
}

export interface DirContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: DirLocation[];
}

export const DIR_DEFAULTS = {
  eyebrow: 'So findet ihr uns',
  title: '<em>Anfahrt</em> & Location',
  description: 'Alle Orte und Wege auf einen Blick — drei Klicks zum Ziel.',
} as const;

/** Key-freie Google-Maps-Embed-URL aus einer Adresse. */
export function makeEmbed(addr: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&output=embed&z=15`;
}

/** Route-planen-Link aus einer Adresse. */
export function makeDirUrl(addr: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
}

/**
 * Liest items[] sicher aus content. Generiert fehlende maps_embed/maps_url
 * aus der (zu einer Zeile zusammengeführten) Adresse.
 */
export function readLocations(content: Record<string, unknown>): DirLocation[] {
  const raw = content.items;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is DirLocation =>
        typeof l === 'object' &&
        l !== null &&
        typeof (l as DirLocation).name === 'string' &&
        typeof (l as DirLocation).address === 'string',
    )
    .map((l, i) => {
      const oneLineAddr = (l.address || '').split('\n').join(', ');
      return {
        ...l,
        id: typeof l.id === 'string' && l.id ? l.id : `l${i + 1}`,
        label: typeof l.label === 'string' ? l.label : '',
        maps_embed: l.maps_embed || (oneLineAddr ? makeEmbed(oneLineAddr) : ''),
        maps_url: l.maps_url || (oneLineAddr ? makeDirUrl(oneLineAddr) : ''),
        transit: Array.isArray(l.transit) ? l.transit : [],
      };
    });
}

export function renderTitleWithEm(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');
}

/** Beschreibungstext → sicheres HTML. [text](url) Links + \n\n Absätze. */
export function renderDesc(raw: string): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safe = esc(raw);
  const withLinks = safe.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text: string, url: string) => {
      const trimmed = url.trim();
      const isExternal = /^https?:\/\//i.test(trimmed);
      const isAnchor = /^#[\w-]+$/.test(trimmed);
      const href = isExternal || isAnchor ? trimmed : '#';
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a class="dir-inline-link" href="${href}"${attrs}>${text}</a>`;
    },
  );
  return withLinks
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
