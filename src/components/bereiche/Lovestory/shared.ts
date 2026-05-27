/**
 * Geteilte Typen und Defaults für die Lovestory-Varianten.
 *
 * SCHEMA-Unterscheidung:
 *
 *   Variante A (Single Moment, 3 Bilder) — content:
 *     eyebrow?:     string  — "Wie alles anfing"
 *     title?:       string  — z.B. "Ein Donnerstagabend, *Hamburg*." (em-Tags erlaubt)
 *     when?:        string  — "September 2019"
 *     moment_title?: string — z.B. "Das erste Treffen"
 *     description?: string  — 1-3 Sätze
 *     images:       string[] — 1-3 URLs (1 Pflicht, 2-3 empfohlen)
 *     signature?:   string  — z.B. "— Sarah & Iver"
 *
 *   Varianten B + C (alle Meilensteine) — content:
 *     eyebrow?:     string  — "Unsere Geschichte"
 *     title?:       string  — "Sieben Jahre *&* ein Tag." (em-Tags erlaubt)
 *     intro?:       string  — Optionaler Lead
 *     entries:      Milestone[]
 *
 *   Milestone (für B + C):
 *     id:           string
 *     when:         string
 *     title:        string
 *     description:  string
 *     image_url:    string  — Pflicht bei B und C
 *     image_alt?:   string
 */

export interface Milestone {
  id: string;
  when: string;
  title: string;
  description: string;
  image_url: string;
  image_alt?: string;
}

export interface LovestoryContentA {
  eyebrow?: string;
  title?: string;
  when?: string;
  moment_title?: string;
  description?: string;
  images?: string[];
  signature?: string;
}

export interface LovestoryContentBC {
  eyebrow?: string;
  title?: string;
  intro?: string;
  entries?: Milestone[];
}

export const LOVESTORY_DEFAULTS = {
  // Variante A
  a_eyebrow: 'Wie alles anfing',
  a_title: 'Ein Donnerstagabend, <em>Hamburg</em>.',
  a_when: 'September 2019',
  a_moment_title: 'Das erste Treffen',
  a_description:
    'Café Cinema in Hamburg, ein Donnerstagabend, zwei Cappuccini zu viel. Wir wussten nicht, dass wir vier Stunden später noch dasitzen würden — aber wir blieben.',
  a_signature: '— Sarah & Iver',
  // Varianten B + C
  bc_eyebrow: 'Unsere Geschichte',
  bc_title: 'Sieben Jahre <em>&amp;</em> ein Tag.',
  bc_intro: 'Wie aus einem Donnerstagabend in Hamburg ein langer Tisch in der Speicherstadt geworden ist — in fünf Stationen.',
} as const;

/**
 * Lese entries[] sicher aus dem content-JSON.
 */
export function readEntries(content: Record<string, unknown>): Milestone[] {
  const raw = content.entries;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is Milestone =>
      typeof e === 'object' &&
      e !== null &&
      typeof (e as Milestone).id === 'string' &&
      typeof (e as Milestone).when === 'string' &&
      typeof (e as Milestone).title === 'string' &&
      typeof (e as Milestone).description === 'string' &&
      typeof (e as Milestone).image_url === 'string',
  );
}

/**
 * Lese A-Bilder sicher.
 */
export function readImagesA(content: Record<string, unknown>): string[] {
  const raw = content.images;
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === 'string').slice(0, 3);
}

/**
 * Render-Helfer: erlaubt &lt;em&gt;-Tags im title für Script-Akzente.
 * Inhalt wird zuerst escaped, dann gezielt &lt;em&gt; wieder erlaubt.
 *
 * SICHERHEIT: Das ist eine bewusste Allowlist — *nur* &lt;em&gt;-Tags ohne
 * Attribute werden zugelassen. Beispiel: "Sieben Jahre &lt;em&gt;&amp;&lt;/em&gt; ein Tag."
 */
export function renderTitleWithEm(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  // re-allow <em> and </em> only
  return escaped
    .replace(/&lt;em&gt;/g, '<em>')
    .replace(/&lt;\/em&gt;/g, '</em>');
}
