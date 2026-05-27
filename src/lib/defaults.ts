/**
 * Globale Default-Texte pro Bereich.
 *
 * Wenn das Brautpaar im content-JSON kein eigenes eyebrow/footer pflegt,
 * fallen die Komponenten auf diese Defaults zurück.
 *
 * Wichtig: Die Werte sind NICHT stilabhängig. "Bald ist es soweit"
 * funktioniert für jeden Stil gut genug, und falls jemand etwas
 * anderes will, schreibt er's einfach selbst in content.eyebrow.
 */

export const COUNTDOWN_DEFAULTS = {
  eyebrow: 'BALD IST ES SOWEIT',
  footer: 'Wir freuen uns auf euch.',
  /** Zeigt bei past=true (Hochzeit ist vorbei) */
  past_text: 'Wir sind verheiratet 🤍',
} as const;

export const HERO_DEFAULTS = {
  eyebrow_variant_a: 'Save the date',
  eyebrow_variant_b: 'Wir heiraten',
  eyebrow_variant_c: 'Save the date — sarahiver.de',
} as const;
