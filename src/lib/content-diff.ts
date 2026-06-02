/**
 * Diff zwischen content_draft und content_published (oder site_draft vs
 * die Live-Spalten der Site). Liefert eine flache Liste von Änderungen
 * im Format „Feld geändert von X zu Y“ — ausreichend fürs Publish-Modal.
 *
 * Keine Tiefen-Diffs für Listen (zu komplex bei jsonb). Stattdessen:
 *   - Bei Listen: Anzahl-Änderung („3 → 5 Einträge“)
 *   - Bei Strings: getrimmter Vorher/Nachher-Vergleich
 *   - Bei Bildern (URL): „Bild ersetzt“
 *   - Bei Booleans: „Ja → Nein“
 */

export interface DiffEntry {
  field: string;        // Roher key, z.B. 'eyebrow'
  label: string;        // Human-readable Label, z.B. 'Eyebrow'
  type: 'added' | 'removed' | 'changed';
  before?: string;      // Truncated Anzeige
  after?: string;
  summary?: string;     // Stattdessen, z.B. „3 → 5 Einträge“
}

const FIELD_LABELS: Record<string, string> = {
  // Texte (kommen in vielen Bereichen vor)
  eyebrow: 'Eyebrow',
  title: 'Titel',
  description: 'Beschreibung',
  intro: 'Intro',
  footer: 'Footer',
  past_text: 'Text nach der Hochzeit',
  signature: 'Signatur',
  when: 'Zeitraum',
  moment_title: 'Moment-Titel',
  // Listen
  items: 'Einträge',
  entries: 'Einträge',
  events: 'Programmpunkte',
  persons: 'Personen',
  images: 'Bilder',
  milestones: 'Meilensteine',
  custom_questions: 'Eigene Fragen',
  // Bilder
  image: 'Bild',
  image_2: 'Zweites Bild',
  hero_image_url: 'Hero-Bild',
  // Sonstige Content-Felder
  privacy: 'Privacy-Hinweis',
  moderation: 'Moderation-Hinweis',
  success_message: 'Dankesnachricht',
  success_sub: 'Zusatztext (Danke)',
  reserve_success: 'Dankesnachricht (Reservierung)',
  deadline: 'Deadline',
  ask_dietary: 'Ernährung abfragen',
  ask_allergies: 'Allergien abfragen',
  iban_enabled: 'Reisekasse aktiv',
  iban: 'IBAN',
  iban_holder: 'Kontoinhaber',
  iban_note: 'Reisekasse-Hinweis',
  // Site-Felder
  couple_name_1: 'Brautpaar (Person 1)',
  couple_name_2: 'Brautpaar (Person 2)',
  wedding_date: 'Hochzeitsdatum',
  wedding_location: 'Ort',
  start_style_id: 'Stil',
  palette_preset_id: 'Farbpalette',
  palette_custom_bg: 'Hintergrundfarbe',
  palette_custom_bg_soft: 'Hintergrund (weich)',
  palette_custom_accent: 'Akzentfarbe',
  palette_custom_accent_deep: 'Akzentfarbe (dunkel)',
  palette_custom_ink: 'Textfarbe',
  font_preset_id: 'Schriftart',
  nav_variant: 'Navigation',
  dna_align_override: 'Ausrichtung (Override)',
  dna_spacing_override: 'Abstände (Override)',
  dna_decor_override: 'Dekoration (Override)',
  dna_contrast_override: 'Kontrast (Override)',
};

function labelFor(field: string): string {
  return FIELD_LABELS[field] || field.replace(/_/g, ' ');
}

function isImageUrl(s: string): boolean {
  if (typeof s !== 'string') return false;
  return s.startsWith('http') && (s.includes('cloudinary.com') || /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(s));
}

function truncate(s: string, n = 60): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + '…';
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

/**
 * Vergleicht zwei beliebige Werte und liefert einen DiffEntry, wenn sich
 * etwas geändert hat — sonst null.
 */
function compareValues(field: string, a: unknown, b: unknown): DiffEntry | null {
  // Beide leer → nichts
  if (isEmpty(a) && isEmpty(b)) return null;

  const label = labelFor(field);

  // Eins leer → added/removed
  if (isEmpty(a) && !isEmpty(b)) {
    // a ist alt (published), b ist neu (draft)
    if (isImageUrl(String(b))) {
      return { field, label, type: 'added', summary: 'Bild hinzugefügt' };
    }
    return {
      field,
      label,
      type: 'added',
      after: typeof b === 'string' ? truncate(b) : describeValue(b),
    };
  }
  if (!isEmpty(a) && isEmpty(b)) {
    if (isImageUrl(String(a))) {
      return { field, label, type: 'removed', summary: 'Bild entfernt' };
    }
    return {
      field,
      label,
      type: 'removed',
      before: typeof a === 'string' ? truncate(a) : describeValue(a),
    };
  }

  // Arrays — Anzahl vergleichen
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length === b.length && JSON.stringify(a) === JSON.stringify(b)) return null;
    if (a.length === b.length) {
      return { field, label, type: 'changed', summary: `${a.length} Einträge bearbeitet` };
    }
    return {
      field,
      label,
      type: 'changed',
      summary: `${a.length} → ${b.length} Einträge`,
    };
  }

  // Booleans
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    if (a === b) return null;
    return {
      field,
      label,
      type: 'changed',
      before: a ? 'Ja' : 'Nein',
      after: b ? 'Ja' : 'Nein',
    };
  }

  // Strings
  if (typeof a === 'string' && typeof b === 'string') {
    if (a === b) return null;
    if (isImageUrl(a) || isImageUrl(b)) {
      return { field, label, type: 'changed', summary: 'Bild ersetzt' };
    }
    return {
      field,
      label,
      type: 'changed',
      before: truncate(a),
      after: truncate(b),
    };
  }

  // Objects — generisch
  if (typeof a === 'object' && typeof b === 'object') {
    if (JSON.stringify(a) === JSON.stringify(b)) return null;
    return { field, label, type: 'changed', summary: 'Inhalt geändert' };
  }

  // Fallback: ungleicher Typ
  if (a !== b) {
    return {
      field,
      label,
      type: 'changed',
      before: describeValue(a),
      after: describeValue(b),
    };
  }

  return null;
}

function describeValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'Ja' : 'Nein';
  if (typeof v === 'string') return truncate(v);
  if (Array.isArray(v)) return `${v.length} Einträge`;
  if (typeof v === 'object') return 'Inhalt';
  return String(v);
}

/**
 * Diff zwischen zwei jsonb-Records auf Top-Level-Keys.
 */
export function diffJsonbContent(
  draft: Record<string, unknown> | null | undefined,
  published: Record<string, unknown> | null | undefined,
): DiffEntry[] {
  const d = draft || {};
  const p = published || {};
  const keys = new Set([...Object.keys(d), ...Object.keys(p)]);
  const out: DiffEntry[] = [];
  for (const k of keys) {
    const entry = compareValues(k, p[k], d[k]);
    if (entry) out.push(entry);
  }
  // Stabile Reihenfolge: bekannte Labels zuerst nach FIELD_LABELS-Reihenfolge
  const order = Object.keys(FIELD_LABELS);
  out.sort((a, b) => {
    const ia = order.indexOf(a.field);
    const ib = order.indexOf(b.field);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.field.localeCompare(b.field);
  });
  return out;
}

/**
 * Diff für die Site: vergleicht site_draft (jsonb-Bündel) mit den
 * korrespondierenden Live-Spalten.
 */
export function diffSiteDraft(
  draft: Record<string, unknown> | null | undefined,
  liveColumns: Record<string, unknown>,
): DiffEntry[] {
  const d = draft || {};
  // Wir vergleichen nur die Felder, die im draft existieren — Live-Spalten
  // sind die Wahrheit für alles andere.
  const keys = Object.keys(d);
  const out: DiffEntry[] = [];
  for (const k of keys) {
    const entry = compareValues(k, liveColumns[k], d[k]);
    if (entry) out.push(entry);
  }
  const order = Object.keys(FIELD_LABELS);
  out.sort((a, b) => {
    const ia = order.indexOf(a.field);
    const ib = order.indexOf(b.field);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.field.localeCompare(b.field);
  });
  return out;
}
