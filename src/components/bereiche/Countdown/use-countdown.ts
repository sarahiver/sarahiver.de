'use client';

import { useState, useEffect, useRef } from 'react';
import { calcCountdown, type CountdownValues } from '@/lib/countdown';

/**
 * Live-tickender Countdown. Aktualisiert jede Sekunde.
 *
 * WICHTIG für SSR / Hydration:
 *   Server-Render und Client-erster-Render müssen IDENTISCH sein.
 *   `calcCountdown()` nutzt aber `Date.now()` → Server und Client
 *   sehen unterschiedliche "now"-Werte → Hydration-Mismatch (#418).
 *
 *   Fix: Initial-Render gibt NULL-Werte zurück (alle Felder = 0, past=false).
 *   Beim Server-Render UND beim Client-Hydration-Render ist der Wert
 *   identisch. Erst nach Hydration (im useEffect) setzt der Client den
 *   echten Wert und startet das Ticking.
 *
 *   Trade-off: kurzer Flash von "00 / 00 / 00 / 00" beim ersten Frame.
 *   In der Praxis kaum sichtbar weil useEffect synchron nach Paint feuert.
 */

const PLACEHOLDER: CountdownValues = {
  past: false,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  daysInCurrentMonth: 30,
};

export function useCountdown(targetDate: Date): CountdownValues {
  // Initial: Placeholder. Sowohl SSR als auch erste Client-Render geben das aus.
  const [values, setValues] = useState<CountdownValues>(PLACEHOLDER);
  const targetRef = useRef(targetDate);

  useEffect(() => {
    targetRef.current = targetDate;
    // Sofort echten Wert berechnen (post-Hydration)
    setValues(calcCountdown(targetDate));

    const id = setInterval(() => {
      setValues(calcCountdown(targetRef.current));
    }, 1000);

    return () => clearInterval(id);
  }, [targetDate]);

  return values;
}
