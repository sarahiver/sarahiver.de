/**
 * SSR-safe Datums-Formatierung.
 *
 * Problem mit toLocaleDateString('de-DE'):
 *   Server (Node.js) hat oft nur eingeschränkte ICU-Daten installiert.
 *   `weekday: 'long'` und `month: 'long'` ergeben dann auf Server
 *   "Sunday" / "November", auf Client (Browser) aber "Sonntag" / "November"
 *   → Hydration-Mismatch (#418).
 *
 * Problem mit new Date() + getDate()/getHours():
 *   Diese Getter geben Werte in LOKALER Zeitzone zurück. Server (UTC) und
 *   Client (z.B. Europe/Berlin) sehen unterschiedliche Werte → Mismatch.
 *
 * Lösung: ISO-Komponenten direkt mit RegExp parsen, dann mit Date.UTC
 *   ein Date konstruieren dessen UTC-Komponenten die original-eingetragene
 *   Wand-Uhrzeit am Veranstaltungsort sind. Dann UTC-Getter verwenden →
 *   überall identisches Output.
 */

const WOCHENTAGE_LANG = [
  'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag',
];
const WOCHENTAGE_KURZ = [
  'SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA',
];
const MONATE_LANG = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/**
 * Parst einen DB-Timestamp ("2026-11-15T14:00:00+01:00") als
 * "Wand-Uhrzeit am Ort" und erzeugt ein Date dessen UTC-Komponenten
 * exakt diese Wand-Uhrzeit reflektieren. Damit ist die Anzeige
 * SSR-stabil über alle Zeitzonen hinweg.
 */
export function parseWallClock(input: string | Date): Date | null {
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return input;
  }
  const match = String(input).match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!match) {
    const fallback = new Date(input);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  const [, y, mo, d, h, mi, s] = match;
  return new Date(
    Date.UTC(
      parseInt(y, 10),
      parseInt(mo, 10) - 1,
      parseInt(d, 10),
      parseInt(h, 10),
      parseInt(mi, 10),
      s ? parseInt(s, 10) : 0,
    ),
  );
}

/**
 * "Sonntag, 15. November 2026"
 */
export function formatLongDateDE(input: string | Date): string {
  const d = parseWallClock(input);
  if (!d) return '';
  const wd = WOCHENTAGE_LANG[d.getUTCDay()];
  const day = d.getUTCDate();
  const month = MONATE_LANG[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${wd}, ${day}. ${month} ${year}`;
}

/**
 * "SO" (Wochentag-Kürzel groß, ohne Punkt)
 */
export function formatWeekdayShortDE(input: string | Date): string {
  const d = parseWallClock(input);
  if (!d) return '';
  return WOCHENTAGE_KURZ[d.getUTCDay()];
}

/**
 * Zerlegt das Datum in die Bestandteile, die das Hero-C-Layout braucht.
 */
export function getDateParts(input: string | Date): {
  weekdayShort: string;
  day: string;
  month: string;
  year: string;
} {
  const d = parseWallClock(input);
  if (!d) {
    return { weekdayShort: '', day: '', month: '', year: '' };
  }
  return {
    weekdayShort: WOCHENTAGE_KURZ[d.getUTCDay()],
    day: String(d.getUTCDate()).padStart(2, '0'),
    month: String(d.getUTCMonth() + 1).padStart(2, '0'),
    year: String(d.getUTCFullYear()),
  };
}
