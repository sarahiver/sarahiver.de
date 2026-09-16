'use client';

import { useEffect } from 'react';

/**
 * Entfernt den Bestätigungstoken aus der Adresszeile, nachdem der Server die
 * Anmeldung bestätigt hat.
 *
 * Reine Kosmetik und Hygiene: der Token soll nicht in History, Lesezeichen
 * oder einem geteilten Screenshot landen. Die Bestätigung selbst ist zu diesem
 * Zeitpunkt bereits serverseitig passiert und der Token entwertet — hier wird
 * nichts geprüft und nichts umgangen.
 *
 * Zurück bleibt `?ok=1`. Das ist ein reines Anzeigekennzeichen: es bestätigt
 * nichts, es sorgt nur dafür, dass ein Reload weiterhin „Ihr seid dabei."
 * zeigt statt einer Fehlermeldung.
 */
export default function StripToken() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('token')) return;

    url.searchParams.delete('token');
    url.searchParams.set('ok', '1');
    window.history.replaceState(null, '', url.toString());
  }, []);

  return null;
}
