'use client';

import { useState, useEffect } from 'react';
import { liveEventIndex, type TimelineEvent } from './shared';

/**
 * Liefert den Index des gerade "live" laufenden Events — oder -1.
 *
 * SSR-safe: Initial-Wert ist IMMER -1 (kein Live-Marker beim ersten
 * Render auf Server und Client → kein Hydration-Mismatch). Erst nach
 * Hydration wird die echte Uhrzeit ausgewertet, und danach jede Minute
 * aktualisiert.
 *
 * Das statische `current`-Flag aus dem content-JSON wird hierfür NICHT
 * verwendet — nur die echte Uhrzeit zählt.
 */
export function useLiveEventIndex(
  events: TimelineEvent[],
  weddingDate?: string,
): number {
  const [idx, setIdx] = useState(-1);

  useEffect(() => {
    const update = () => setIdx(liveEventIndex(events, new Date(), weddingDate));
    update();
    const id = window.setInterval(update, 60_000); // jede Minute
    return () => window.clearInterval(id);
  }, [events, weddingDate]);

  return idx;
}
