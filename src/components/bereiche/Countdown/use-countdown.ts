'use client';

import { useState, useEffect, useRef } from 'react';
import { calcCountdown, type CountdownValues } from '@/lib/countdown';

/**
 * Live-tickender Countdown. Aktualisiert jede Sekunde.
 *
 * Startwert wird Server-Side aus targetDate berechnet (für SSR ohne
 * Hydration-Flicker), dann übernimmt der Client das Ticken.
 */
export function useCountdown(targetDate: Date): CountdownValues {
  const [values, setValues] = useState<CountdownValues>(() => calcCountdown(targetDate));
  const targetRef = useRef(targetDate);

  useEffect(() => {
    targetRef.current = targetDate;
    // Sofort neu rechnen falls sich targetDate geändert hat
    setValues(calcCountdown(targetDate));

    const id = setInterval(() => {
      setValues(calcCountdown(targetRef.current));
    }, 1000);

    return () => clearInterval(id);
  }, [targetDate]);

  return values;
}
