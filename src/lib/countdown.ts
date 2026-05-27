/**
 * Countdown-Berechnungs-Logik.
 *
 * Die exakte Formel: berechnet erst volle Kalender-Monate,
 * dann den Rest in Tage / Stunden / Minuten / Sekunden.
 *
 * Wichtig: NICHT `diff % 30days` verwenden — das gibt
 * an Monatsgrenzen falsche Werte.
 */

export interface CountdownValues {
  past: boolean;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Tage im aktuellen Kalendermonat — für Variante C (Bar-Skalierung) */
  daysInCurrentMonth: number;
}

export function calcCountdown(targetDate: Date, now: Date = new Date()): CountdownValues {
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (targetDate <= now) {
    return { past: true, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, daysInCurrentMonth };
  }

  // Schritt 1: Volle Kalender-Monate
  let months = (targetDate.getFullYear() - now.getFullYear()) * 12
             + (targetDate.getMonth() - now.getMonth());

  // Korrektur: wenn now später im Monat als target, ist der "volle Monat" nicht erreicht
  const dayDiff = targetDate.getDate() - now.getDate();
  const hourDiff = targetDate.getHours() - now.getHours();
  const minDiff = targetDate.getMinutes() - now.getMinutes();
  if (dayDiff < 0
     || (dayDiff === 0 && hourDiff < 0)
     || (dayDiff === 0 && hourDiff === 0 && minDiff < 0)) {
    months -= 1;
  }
  months = Math.max(0, months);

  // Schritt 2: Verschiebe now um months Monate vorwärts
  const intermediate = new Date(now);
  intermediate.setMonth(intermediate.getMonth() + months);

  // Schritt 3: Rest in ms
  const restMs = targetDate.getTime() - intermediate.getTime();
  const days = Math.floor(restMs / 86400e3);
  const hours = Math.floor((restMs % 86400e3) / 3600e3);
  const minutes = Math.floor((restMs % 3600e3) / 60e3);
  const seconds = Math.floor((restMs % 60e3) / 1000);

  return { past: false, months, days, hours, minutes, seconds, daysInCurrentMonth };
}

/**
 * Datum als Mono-Stempel formatieren: "SA · 27 · 06 · 2026 · 14:00"
 *
 * SSR-safe: nutzt UTC-Getter und hardgecodete Wochentag-Kürzel, damit
 * Server und Client identisches Output produzieren.
 *
 * Wichtig: wir nutzen UTC-Getter. Das `wedding_date` aus der DB ist
 * typischerweise als "Wand-Uhrzeit am Veranstaltungsort" gemeint
 * (z.B. "14:00 am 15. November 2026 in Hamburg"). Damit dieselbe
 * Anzeige auf Server und Client funktioniert, parsen wir die "lokale
 * Wand-Uhrzeit" als-wäre-UTC und nutzen dann UTC-Getter.
 *
 * Trick: split den ISO-String an T/+/- und nutze nur den Datums-/Zeit-Teil.
 */
const WEEKDAYS_DE_SHORT = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];

export function formatDateStamp(date: Date): string {
  const weekdayShort = WEEKDAYS_DE_SHORT[date.getUTCDay()];
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const mins = String(date.getUTCMinutes()).padStart(2, '0');
  return `${weekdayShort} · ${day} · ${month} · ${year} · ${hours}:${mins}`;
}

/**
 * Wedding-Date aus DB (timestamptz, z.B. "2026-11-15T14:00:00+01:00")
 * zu einem Date konvertieren, dessen UTC-Getter die ORIGINAL eingetragene
 * Wand-Uhrzeit liefern. Damit wird die Anzeige SSR-stabil.
 *
 * Beispiel: Input "2026-11-15T14:00:00+01:00"
 *   → getUTCFullYear()=2026, getUTCMonth()=10, getUTCDate()=15,
 *     getUTCHours()=14, getUTCMinutes()=0
 *   → Anzeige "15.11.2026 14:00" (überall identisch)
 */
export function parseWeddingDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  // Parse die ISO-Komponenten direkt mit RegExp, ohne Timezone-Interpretation.
  // Format: YYYY-MM-DDTHH:MM:SS(.SSS)?(±HH:MM|Z)?
  const match = String(input).match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!match) return new Date(input);
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
