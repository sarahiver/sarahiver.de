/**
 * RSVP — geteilte Typen, Defaults und Submit-Logik.
 *
 * DATENMODELL:
 *   Eine RSVP-Antwort = 1 Hauptperson + 0..n Begleitpersonen.
 *   In der DB als 1 Row gespeichert, mit `guests[]` als JSONB-Array.
 *
 *   guests[].length === persons - 1
 *   (Hauptperson zählt zu persons, ist aber NICHT in guests[])
 *
 * Beim Excel-Export (server-seitig, im Admin-Dashboard) wird daraus
 * 1 Zeile pro Person — Hauptperson + n Begleitungen = persons Zeilen.
 *   - Pro custom_question wird eine Spalte erzeugt (Header = label).
 *   - dietary/allergies sind pro Person (Hauptperson + guests).
 *
 * CONFIG kommt aus dem Bereich-content (vom Brautpaar im Dashboard gesetzt):
 *   title, description, deadline, ask_dietary, ask_allergies, custom_questions[]
 */

export type CustomQuestionType = 'text' | 'boolean' | 'choice';

export interface CustomQuestion {
  id: string;            // stabile ID, z.B. "q1" — wird Key in custom_answers
  label: string;         // die Frage, z.B. "Kommt ihr zum Brunch?"
  type: CustomQuestionType;
  options?: string[];    // nur bei type='choice'
  required?: boolean;    // default false
}

export interface RsvpGuest {
  name: string;
  dietary: string;
  allergies: string;
}

export interface RsvpState {
  name: string;
  email: string;
  attending: boolean | null;
  persons: number;
  guests: RsvpGuest[];
  dietary: string;
  allergies: string;
  /** Antworten auf Custom-Fragen, key = CustomQuestion.id */
  custom_answers: Record<string, string>;
  message: string;
}

export interface RsvpConfig {
  title: string;
  description: string;
  deadline: string; // ISO-Datum oder formatiertes deutsches Datum, je nach Editor
  couple: string;
  ask_dietary: boolean;
  ask_allergies: boolean;
  custom_questions: CustomQuestion[];
}

export const RSVP_DEFAULTS: Omit<RsvpConfig, 'couple'> = {
  title: 'Eure Zusage',
  description: 'Schön, dass ihr hier seid. Sagt uns bitte bis zum unten genannten Datum Bescheid.',
  deadline: '',
  ask_dietary: true,
  ask_allergies: true,
  custom_questions: [],
};

export const INITIAL_STATE: RsvpState = {
  name: '',
  email: '',
  attending: null,
  persons: 1,
  guests: [],
  dietary: '',
  allergies: '',
  custom_answers: {},
  message: '',
};

/**
 * Synchronisiert die guests[]-Liste mit `persons`:
 *   guests.length === persons - 1
 * (Hauptperson ist NICHT in guests[])
 */
export function syncGuests(state: RsvpState): RsvpState {
  const target = Math.max(0, (state.persons || 1) - 1);
  const guests = [...state.guests];
  while (guests.length < target) guests.push({ name: '', dietary: '', allergies: '' });
  while (guests.length > target) guests.pop();
  return { ...state, guests };
}

/**
 * Validiert + normalisiert ein CustomQuestion-Objekt aus dem rohen JSON.
 * Gibt null zurück wenn ungültig (wird dann rausgefiltert).
 */
function normalizeQuestion(raw: unknown, index: number): CustomQuestion | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const q = raw as Record<string, unknown>;
  const label = typeof q.label === 'string' ? q.label.trim() : '';
  if (!label) return null;
  const id = typeof q.id === 'string' && q.id.trim() ? q.id.trim() : `q${index + 1}`;
  const type: CustomQuestionType =
    q.type === 'boolean' || q.type === 'choice' ? q.type : 'text';
  const options =
    type === 'choice' && Array.isArray(q.options)
      ? q.options.filter((o): o is string => typeof o === 'string')
      : undefined;
  // choice ohne valide Optionen → degradiere zu text
  if (type === 'choice' && (!options || options.length === 0)) {
    return { id, label, type: 'text', required: q.required === true };
  }
  return { id, label, type, options, required: q.required === true };
}

/**
 * Liest die RSVP-Config aus dem content-JSON (mit Fallback auf Defaults).
 * `couple` wird separat aus tokens (couple_name_1/2) gefüllt.
 *
 * Abwärtskompatibel: wenn noch ein altes `custom_question` (String) im
 * content liegt, wird es in ein einzelnes custom_questions[]-Element migriert.
 */
export function readConfig(
  content: Record<string, unknown>,
  coupleNames: { name1?: string; name2?: string } = {},
): RsvpConfig {
  const couple =
    coupleNames.name1 && coupleNames.name2
      ? `${coupleNames.name1} & ${coupleNames.name2}`
      : '';

  // custom_questions[] lesen
  let customQuestions: CustomQuestion[] = [];
  if (Array.isArray(content.custom_questions)) {
    customQuestions = content.custom_questions
      .map((raw, i) => normalizeQuestion(raw, i))
      .filter((q): q is CustomQuestion => q !== null);
  } else if (typeof content.custom_question === 'string' && content.custom_question.trim()) {
    // Legacy-Fallback: einzelne custom_question (String) migrieren
    customQuestions = [
      { id: 'q1', label: content.custom_question.trim(), type: 'text', required: false },
    ];
  }

  return {
    title: (content.title as string) ?? RSVP_DEFAULTS.title,
    description: (content.description as string) ?? RSVP_DEFAULTS.description,
    deadline: (content.deadline as string) ?? '',
    couple,
    ask_dietary: content.ask_dietary !== false, // default true
    ask_allergies: content.ask_allergies !== false, // default true
    custom_questions: customQuestions,
  };
}

/* ====================================================================
   Deadline-Helfer (SSR-safe)
   ==================================================================== */

const MONATE_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/**
 * Formatiert das Deadline-Datum (ISO oder bereits formatiert) zu DE-Format.
 * SSR-SAFE: kein toLocaleDateString().
 */
export function formatDeadline(input: string): string {
  if (!input) return '';
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = match[1];
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${day}. ${MONATE_DE[month - 1]} ${year}`;
    }
  }
  return input;
}

/**
 * Prüft ob die Deadline überschritten ist.
 * SSR-SAFE: ohne explizites `now` → false (kein Date.now() im SSR-Render).
 */
export function isDeadlinePassed(deadline: string, now?: Date): boolean {
  if (!deadline) return false;
  if (!now) return false;
  const match = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const today = now.toISOString().slice(0, 10);
  return today > deadline;
}

/* ====================================================================
   Submit-Payload
   ==================================================================== */

/**
 * Bereitet den Submit-Payload vor (was an Supabase geschickt wird).
 * Passend zum sarahiver.com Excel-Export-Schema:
 *   - Hauptperson in Top-Level-Feldern
 *   - guests[] = nur Begleitungen (ohne Hauptperson)
 *   - custom_answers = { questionId: answer }
 */
export function buildSubmitPayload(state: RsvpState, config: RsvpConfig) {
  const synced = syncGuests(state);

  // Nur Antworten auf tatsächlich existierende Fragen mitschicken
  const validIds = new Set(config.custom_questions.map((q) => q.id));
  const cleanAnswers: Record<string, string> = {};
  for (const [k, v] of Object.entries(synced.custom_answers)) {
    if (validIds.has(k) && v != null && String(v).trim() !== '') {
      cleanAnswers[k] = String(v).trim();
    }
  }

  return {
    name: synced.name.trim(),
    email: synced.email.trim() || null,
    attending: synced.attending === true,
    persons: synced.attending ? synced.persons : 0,
    dietary: synced.attending ? synced.dietary.trim() : '',
    allergies: synced.attending ? synced.allergies.trim() : '',
    custom_answers: synced.attending ? cleanAnswers : {},
    message: synced.message.trim(),
    guests: synced.attending ? synced.guests : [],
  };
}

/* ====================================================================
   Title-Helper
   ==================================================================== */

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
