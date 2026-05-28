/**
 * FAQ — geteilte Typen und Helfer.
 *
 * content-Schema:
 *   eyebrow?:     string
 *   title?:       string  (em-Tags erlaubt)
 *   description?: string
 *   items:        FaqItem[]
 *
 * FaqItem:
 *   id:        string  — stabile ID (key-Prop)
 *   question:  string
 *   answer:    string  — Text mit Markdown-Lite:
 *                        [text](url) → Link, **bold** → fett,
 *                        \n\n → Absatz, \n → Zeilenumbruch
 *
 * Bewusst FLACH (keine Kategorien) — einfacher für Gast und Brautpaar.
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: FaqItem[];
}

export const FAQ_DEFAULTS = {
  eyebrow: 'Gut zu wissen',
  title: 'Häufige <em>Fragen</em>',
  description: 'Alles Wichtige auf einen Blick — schaut hier zuerst nach, bevor ihr uns fragt.',
} as const;

/**
 * Liest items[] sicher aus dem content-JSON.
 */
export function readItems(content: Record<string, unknown>): FaqItem[] {
  const raw = content.items;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (i): i is FaqItem =>
        typeof i === 'object' &&
        i !== null &&
        typeof (i as FaqItem).question === 'string' &&
        typeof (i as FaqItem).answer === 'string',
    )
    .map((i, idx) => ({
      ...i,
      id: typeof i.id === 'string' && i.id ? i.id : `f${idx + 1}`,
    }));
}

/**
 * Title-Helper mit <em>-Allowlist (identisch zu anderen Bereichen).
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
 * Rendert eine FAQ-Antwort zu sicherem HTML.
 *
 * XSS-safe: erst ALLES escapen, dann nur die erlaubten Muster
 * zurück-konvertieren:
 *   [text](url)  → <a> (extern = neuer Tab; url wird validiert)
 *   **bold**     → <strong>
 *   \n\n         → Absatz <p>
 *   \n           → <br>
 *
 * Link-URLs: nur http(s):// und interne Anker (#...) erlaubt.
 * Alles andere (javascript:, data: …) wird zu # neutralisiert.
 */
export function renderAnswer(raw: string): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safe = esc(raw);

  // Links: [text](url)
  const withLinks = safe.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text: string, url: string) => {
      const trimmed = url.trim();
      const isExternal = /^https?:\/\//i.test(trimmed);
      const isAnchor = /^#[\w-]+$/.test(trimmed);
      // Nur erlaubte URL-Formen; sonst neutralisieren
      const href = isExternal || isAnchor ? trimmed : '#';
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${attrs}>${text}</a>`;
    },
  );

  // Bold: **text**
  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Absätze + Zeilenumbrüche
  return withBold
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
