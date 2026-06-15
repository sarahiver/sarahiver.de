/**
 * Stil-Migration: altes 5-Stil-System → neues 8-Stil-System (Design System v2).
 *
 * Hintergrund:
 *   Bis v0.4 gab es 5 Customizer-Stile (klassisch | modern | floral | minimal |
 *   festlich). Design System v2 hat 8 identitäts-spezifische Stile, deren CSS
 *   ausschließlich über `.wedding-site-wrapper[data-style="X"]` greift.
 *
 *   Ältere `wedding_sites.start_style_id`-Werte (und das `site_draft`-JSON) zeigen
 *   teilweise noch auf die alten IDs. Ein `data-style="klassisch"` hat aber KEINEN
 *   passenden CSS-Block → die Seite rendert ungestylt.
 *
 *   Dieser Helper ist das Render-seitige Sicherheitsnetz: er mappt jede alte ID
 *   auf einen neuen Stil und fällt für unbekannte/leere Werte auf `editorial`
 *   zurück. Damit rendert jede Seite korrekt — unabhängig davon, ob die
 *   DB-Migration (supabase-style-migration.sql) schon gelaufen ist.
 */

/** Die 8 gültigen Stile des aktuellen Design Systems. */
export const VALID_STYLE_IDS = [
  'editorial',
  'brutalist',
  'organic',
  'mono',
  'opulent',
  'liquefy',
  'kinetic',
  'bauhaus',
] as const;

export type StyleId = (typeof VALID_STYLE_IDS)[number];

const VALID_SET = new Set<string>(VALID_STYLE_IDS);

/** Standard-Stil, wenn nichts gesetzt oder nichts mappbar ist. */
export const DEFAULT_STYLE_ID: StyleId = 'editorial';

/**
 * Mapping alter Customizer-Stile auf die neuen 8 Stile.
 *
 * Begründung der Zuordnung (kann pro Site jederzeit im Dashboard geändert
 * werden — das hier ist nur der automatische Default):
 *   klassisch → editorial  (warm, serif, Magazin-Charakter)
 *   floral    → organic    (weich, italic, natürlich)
 *   minimal   → mono        (monospace, hairlines, ruhig)
 *   festlich  → opulent     (dunkel, gold, hoher Kontrast)
 *   modern    → bauhaus     (klar, geometrisch, modern)
 *
 * Die Stile brutalist, liquefy und kinetic sind bewusst opt-in
 * (kein alter Stil mappt automatisch darauf).
 */
export const LEGACY_STYLE_MAP: Record<string, StyleId> = {
  klassisch: 'editorial',
  floral: 'organic',
  minimal: 'mono',
  festlich: 'opulent',
  modern: 'bauhaus',
};

/**
 * Löst eine beliebige (evtl. veraltete/leere) Stil-ID zu einem gültigen
 * Design-System-v2-Stil auf.
 *
 *   - gültige neue ID  → unverändert
 *   - bekannte alte ID → gemappte neue ID
 *   - alles andere     → DEFAULT_STYLE_ID ('editorial')
 */
export function resolveStyleId(id: string | null | undefined): StyleId {
  if (!id) return DEFAULT_STYLE_ID;
  if (VALID_SET.has(id)) return id as StyleId;
  return LEGACY_STYLE_MAP[id] ?? DEFAULT_STYLE_ID;
}
