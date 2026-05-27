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
 *
 * CONFIG kommt aus dem Bereich-content (vom Brautpaar gesetzt):
 *   title, description, deadline, ask_dietary, ask_allergies, custom_question
 */

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
  custom_answer: string;
  message: string;
}

export interface RsvpConfig {
  title: string;
  description: string;
  deadline: string; // ISO-Datum oder formatiertes deutsches Datum, je nach Editor
  couple: string;
  ask_dietary: boolean;
  ask_allergies: boolean;
  custom_question: string;
}

export const RSVP_DEFAULTS: RsvpConfig = {
  title: 'Eure Zusage',
  description: 'Schön, dass ihr hier seid. Sagt uns bitte bis zum unten genannten Datum Bescheid.',
  deadline: '',
  couple: '',
  ask_dietary: true,
  ask_allergies: true,
  custom_question: '',
};

export const INITIAL_STATE: RsvpState = {
  name: '',
  email: '',
  attending: null,
  persons: 1,
  guests: [],
  dietary: '',
  allergies: '',
  custom_answer: '',
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
 * Liest die RSVP-Config aus dem content-JSON (mit Fallback auf Defaults).
 * `couple` wird separat aus tokens (couple_name_1/2) gefüllt.
 */
export function readConfig(
  content: Record<string, unknown>,
  coupleNames: { name1?: string; name2?: string } = {},
): RsvpConfig {
  const couple =
    coupleNames.name1 && coupleNames.name2
      ? `${coupleNames.name1} & ${coupleNames.name2}`
      : '';
  return {
    title: (content.title as string) ?? RSVP_DEFAULTS.title,
    description: (content.description as string) ?? RSVP_DEFAULTS.description,
    deadline: (content.deadline as string) ?? '',
    couple,
    ask_dietary: content.ask_dietary !== false, // default true
    ask_allergies: content.ask_allergies !== false, // default true
    custom_question: (content.custom_question as string) ?? '',
  };
}

/**
 * Formatiert das Deadline-Datum (ISO oder bereits formatiert) zu DE-Format.
 *
 * SSR-SAFE: nutzt KEIN `toLocaleDateString()` (das verhält sich auf Server
 * und Client unterschiedlich je nach installierter Locale). Stattdessen
 * eine deterministische Formatierung mit hardgecodeten Monatsnamen.
 *
 * Wenn input ungültig ist oder schon formatiert aussieht: gibt original
 * zurück.
 */
const MONATE_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function formatDeadline(input: string): string {
  if (!input) return '';
  // Reines ISO-Date? (YYYY-MM-DD)
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = match[1];
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${day}. ${MONATE_DE[month - 1]} ${year}`;
    }
  }
  // Schon formatiert (oder unparsbar) → unverändert zurück
  return input;
}

/**
 * Prüft ob die Deadline überschritten ist.
 *
 * SSR-SAFE: nimmt `now` als optionalen Parameter. Wird ohne `now`-Parameter
 * aufgerufen, gibt es false zurück — das ist absichtlich. Auf Server soll
 * der Check NICHT laufen (Date.now() würde Hydration-Mismatch verursachen).
 * Stattdessen ruft die Komponente diese Funktion erst NACH Hydration in
 * einem useEffect auf und übergibt explizit `new Date()`.
 *
 * Vergleich rein über ISO-String — keine Timezone-Probleme.
 */
export function isDeadlinePassed(deadline: string, now?: Date): boolean {
  if (!deadline) return false;
  if (!now) return false; // SSR-safe: ohne explicit now → immer false

  // ISO-Date parsen
  const match = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  // Vergleich als YYYY-MM-DD String — kein Timezone-Drama
  const today = now.toISOString().slice(0, 10);
  // "today > deadline" als String-Vergleich funktioniert für YYYY-MM-DD
  return today > deadline;
}

/**
 * Bereitet den Submit-Payload vor (was an Supabase geschickt wird).
 * Wird die Hauptperson-Felder + guests[] enthalten — passend zum
 * sarahiver.com Excel-Export-Schema.
 */
export function buildSubmitPayload(state: RsvpState) {
  const synced = syncGuests(state);
  return {
    name: synced.name.trim(),
    email: synced.email.trim() || null,
    attending: synced.attending === true,
    persons: synced.attending ? synced.persons : 0,
    dietary: synced.attending ? synced.dietary.trim() : '',
    allergies: synced.attending ? synced.allergies.trim() : '',
    custom_answer: synced.attending ? synced.custom_answer.trim() : '',
    message: synced.message.trim(),
    guests: synced.attending ? synced.guests : [],
  };
}

/**
 * Title-Helper mit <em>-Allowlist (identisch zu Lovestory/Gallery).
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
