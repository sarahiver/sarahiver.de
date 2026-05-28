/**
 * Übernachtung (Accommodations) — geteilte Typen und Helfer.
 *
 * content-Schema:
 *   eyebrow?:     string
 *   title?:       string  (em-Tags erlaubt)
 *   description?: string
 *   venue?:       { name, lat, lng }   — Hochzeitslocation (für Karte/Pin in C)
 *   items:        Accommodation[]
 *
 * Accommodation:
 *   id:            string
 *   name:          string  (Pflicht)
 *   description?:  string  ([text](url) Links, \n\n Absätze)
 *   image?:        string  (URL)
 *   distance?:     string  ("5 Min. zur Location")
 *   price?:        string  ("ab 95 € / Nacht")
 *   booking_code?: string  (Stichwort/Kontingent)
 *   booking_url?:  string  (Buchungs-Link)
 *   lat?:          number  (für Variante C — Map-Pin)
 *   lng?:          number  (für Variante C — Map-Pin)
 */

export interface Accommodation {
  id: string;
  name: string;
  description?: string;
  image?: string;
  distance?: string;
  price?: string;
  booking_code?: string;
  booking_url?: string;
  lat?: number;
  lng?: number;
}

export interface AccVenue {
  name: string;
  lat: number;
  lng: number;
}

export interface AccContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  venue?: AccVenue;
  items?: Accommodation[];
}

export const ACC_DEFAULTS = {
  eyebrow: 'Für Übernachtungsgäste',
  title: 'Wo ihr <em>schlafen</em> könnt',
  description:
    'Wir haben in einigen Häusern Zimmer für euch vorreserviert — bucht gerne mit dem jeweiligen Stichwort.',
} as const;

export function readItems(content: Record<string, unknown>): Accommodation[] {
  const raw = content.items;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (h): h is Accommodation =>
        typeof h === 'object' && h !== null && typeof (h as Accommodation).name === 'string',
    )
    .map((h, i) => ({
      ...h,
      id: typeof h.id === 'string' && h.id ? h.id : `h${i + 1}`,
    }));
}

export function readVenue(content: Record<string, unknown>): AccVenue | null {
  const v = content.venue as Partial<AccVenue> | undefined;
  if (v && typeof v.lat === 'number' && typeof v.lng === 'number') {
    return { name: typeof v.name === 'string' ? v.name : '', lat: v.lat, lng: v.lng };
  }
  return null;
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

/**
 * Beschreibungstext → sicheres HTML. [text](url) Links + \n\n Absätze.
 */
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
      return `<a class="acc-inline-link" href="${href}"${attrs}>${text}</a>`;
    },
  );
  return withLinks
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/**
 * Geo-bbox + Prozent-Mapping für die Pin-Positionen in Variante C.
 * Deterministisch (SSR-safe). Liefert toX/toY und Map-Center.
 */
export function computePinGeometry(
  venue: AccVenue | null,
  items: Accommodation[],
): {
  toX: (lng: number) => number;
  toY: (lat: number) => number;
  centerLat: number;
  centerLng: number;
  mapSrc: string;
} {
  const points: { lat: number; lng: number }[] = [];
  if (venue) points.push({ lat: venue.lat, lng: venue.lng });
  for (const h of items) {
    if (typeof h.lat === 'number' && typeof h.lng === 'number') {
      points.push({ lat: h.lat, lng: h.lng });
    }
  }
  // Fallback falls keine Punkte: Hamburg-Zentrum
  if (points.length === 0) points.push({ lat: 53.5511, lng: 9.9937 });

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats) - 0.005;
  const maxLat = Math.max(...lats) + 0.005;
  const minLng = Math.min(...lngs) - 0.008;
  const maxLng = Math.max(...lngs) + 0.008;

  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;

  const toX = (lng: number) => ((lng - minLng) / spanLng) * 100;
  const toY = (lat: number) => (1 - (lat - minLat) / spanLat) * 100;

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const mapSrc = `https://maps.google.com/maps?ll=${centerLat},${centerLng}&z=13&t=m&output=embed`;

  return { toX, toY, centerLat, centerLng, mapSrc };
}
