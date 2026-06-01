/**
 * Highlight-Pattern für Editor-Felder.
 *
 * Brautpaare sollen kein HTML tippen — stattdessen geben sie zwei Felder ein:
 *   - Plain-Text-Titel mit Platzhalter `[highlight]`
 *   - Highlight-Wort separat
 *
 * Beim Speichern werden beide zu HTML kombiniert:
 *   "Ein Donnerstagabend, [highlight]." + "Dresden"
 *   → "Ein Donnerstagabend, <em>Dresden</em>."
 *
 * Beim Lesen aus der DB wird das wieder zerlegt — so bleiben bestehende
 * Inhalte rückwärtskompatibel.
 *
 * Edge-Cases:
 *   - Kein <em> in HTML → highlight = "", plain = HTML (1:1)
 *   - Mehrere <em> → nur das erste wird als Highlight extrahiert, der Rest
 *     bleibt als rohes HTML im Plain-Text (sollte fast nie passieren)
 *   - Leerer Highlight beim Speichern → kein <em>-Tag, nur Plain
 */

export interface HighlightSplit {
  plain: string;     // Text mit [highlight]-Platzhalter wo das em-Tag war
  highlight: string; // Das Wort, das hervorgehoben wird
}

const PLACEHOLDER = '[highlight]';
const EM_REGEX = /<em>([\s\S]*?)<\/em>/;

/**
 * Zerlegt einen HTML-Titel mit em-Tags in plain + highlight.
 * Wenn kein <em> drin ist, bleibt highlight = "" und plain = der Originaltext.
 */
export function splitHighlight(html: string): HighlightSplit {
  if (!html) return { plain: '', highlight: '' };
  const match = html.match(EM_REGEX);
  if (!match) return { plain: html, highlight: '' };
  const plain = html.replace(EM_REGEX, PLACEHOLDER);
  return { plain, highlight: match[1] };
}

/**
 * Setzt plain + highlight wieder zu HTML zusammen.
 *
 * Wenn highlight leer ist, wird der Platzhalter einfach entfernt (kein em-Tag).
 * Wenn kein Platzhalter im plain steht, wird das Highlight ignoriert
 *   (damit der User durch Versehen kein "<em>Foo</em>" am Ende stehen hat).
 */
export function mergeHighlight(plain: string, highlight: string): string {
  if (!plain) return '';
  const trimmed = highlight.trim();
  if (!trimmed) {
    // Highlight leer — Platzhalter raus
    return plain.replace(PLACEHOLDER, '');
  }
  if (!plain.includes(PLACEHOLDER)) {
    // Kein Platzhalter im Text — Highlight wird ignoriert
    return plain;
  }
  // Nur den ersten Platzhalter ersetzen
  return plain.replace(PLACEHOLDER, `<em>${trimmed}</em>`);
}
