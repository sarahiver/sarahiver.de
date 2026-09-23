'use client';

import { useEffect } from 'react';
import { trackEvent, trackOnce, type EventName, type EventParams } from '@/lib/analytics';

/**
 * Seitenaufruf-Ereignis. `once` verhindert Doppelzählung bei Reload oder
 * Zurück-Navigation innerhalb einer Sitzung (Schlüssel = onceKey).
 */
export function TrackView({
  event,
  params,
  onceKey,
}: {
  event: EventName;
  params?: EventParams;
  onceKey?: string;
}) {
  useEffect(() => {
    if (onceKey) trackOnce(onceKey, event, params);
    else trackEvent(event, params);
    // Nur beim Mount — bewusst ohne Abhängigkeiten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Link, der beim Klick ein Ereignis meldet (Navigation bleibt unverändert). */
export function TrackedLink({
  event,
  params,
  className,
  href,
  children,
}: {
  event: EventName;
  params?: EventParams;
  className?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a className={className} href={href} onClick={() => trackEvent(event, params)}>
      {children}
    </a>
  );
}
