/**
 * Hochzeits-ABC — geteilte Typen und Helfer.
 *
 * content-Schema:
 *   eyebrow?:     string
 *   title?:       string  (em-Tags erlaubt)
 *   description?: string
 *   items:        AbcEntry[]
 *
 * AbcEntry:
 *   id:     string
 *   letter: string  — Anfangsbuchstabe, eigenes Feld (frei setzbar, Pflicht)
 *   term:   string  — Begriff/Titel (Pflicht)
 *   text:   string  — Beschreibung; [text](url) Links, **bold**, \n\n Absätze
 *
 * Sortierung & Gruppierung folden Umlaute: Ä→A, Ö→O, Ü→U, ß→S.
 */

export interface AbcEntry {
  id: string;
  letter: string;
  term: string;
  text: string;
}

export interface AbcContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: AbcEntry[];
}

export const ABC_DEFAULTS = {
  eyebrow: 'Von A bis Z',
  title: 'Hochzeits-<em>ABC</em>',
  description: 'Alles Wissenswerte über unseren Tag — alphabetisch sortiert.',
} as const;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Faltet einen String auf Großbuchstaben mit aufgelösten Umlauten.
 */
function fold(s: string): string {
  return (s || '')
    .toUpperCase()
    .replace(/Ä/g, 'A')
    .replace(/Ö/g, 'O')
    .replace(/Ü/g, 'U')
    .replace(/ß/g, 'S');
}

/**
 * Liefert den gefalteten Gruppierungs-Buchstaben eines Eintrags (1 Zeichen).
 */
export function entryLetter(e: AbcEntry): string {
  return fold(e.letter).charAt(0);
}

/**
 * Liest items[] sicher aus content und sortiert sie nach letter (gefaltet),
 * dann nach term. Eingabe-Reihenfolge ist egal.
 */
export function readEntries(content: Record<string, unknown>): AbcEntry[] {
  const raw = content.items;
  if (!Array.isArray(raw)) return [];
  const items = raw
    .filter(
      (e): e is AbcEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as AbcEntry).letter === 'string' &&
        typeof (e as AbcEntry).term === 'string' &&
        typeof (e as AbcEntry).text === 'string',
    )
    .map((e, i) => ({
      ...e,
      id: typeof e.id === 'string' && e.id ? e.id : `e${i + 1}`,
    }));

  return items.sort((a, b) => {
    const la = fold(a.letter);
    const lb = fold(b.letter);
    if (la !== lb) return la.localeCompare(lb, 'de');
    return (a.term || '').localeCompare(b.term || '', 'de');
  });
}

/**
 * Gruppiert (bereits sortierte) Einträge nach gefaltetem Buchstaben.
 * Liefert ein geordnetes Array von { letter, entries }.
 */
export function groupByLetter(
  entries: AbcEntry[],
): { letter: string; entries: AbcEntry[] }[] {
  const map = new Map<string, AbcEntry[]>();
  for (const e of entries) {
    const L = entryLetter(e);
    if (!map.has(L)) map.set(L, []);
    map.get(L)!.push(e);
  }
  return ALPHABET.filter((L) => map.has(L)).map((L) => ({
    letter: L,
    entries: map.get(L)!,
  }));
}

/**
 * Title-Helper mit <em>-Allowlist.
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

/**
 * Rendert den Beschreibungstext zu sicherem HTML.
 * XSS-safe: erst escapen, dann nur erlaubte Muster zurück:
 *   [text](url) → <a> (http(s) und #anchor erlaubt, sonst neutralisiert)
 *   **bold**    → <strong>
 *   \n\n        → Absatz, \n → <br>
 */
export function renderText(raw: string): string {
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
      return `<a href="${href}"${attrs}>${text}</a>`;
    },
  );

  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  return withBold
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
