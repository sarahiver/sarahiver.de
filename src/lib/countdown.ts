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
 */
export function formatDateStamp(date: Date): string {
  const weekdayShort = date.toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase().replace('.', '');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${weekdayShort} · ${day} · ${month} · ${year} · ${hours}:${mins}`;
}
