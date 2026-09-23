'use client';

import { useState, type CSSProperties } from 'react';

/**
 * Google-Maps-Einbettung erst nach aktivem Klick.
 *
 * Vorher: neutrale Fläche mit Adresse, kurzem Hinweis und „Karte anzeigen" —
 * KEIN Request an Google. Nach dem Klick: exakt der bisherige iframe (gleiche
 * src, gleiche Attribute), damit die Design-Layer ihn wie gewohnt stylen.
 * Der Zustand bleibt erhalten, solange die Komponente lebt (z. B. beim
 * Ortswechsel in Anfahrt B lädt die nächste Karte ohne erneuten Klick).
 *
 * Keine Cookies, keine Consent-Plattform. Stil: .map-consent in globals.css
 * (erbt Schrift und Farbe des jeweiligen Designs).
 */
const PRIVACY_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de'}/datenschutz`;

export default function ClickToLoadMap({
  src,
  title,
  address,
  allowFullScreen,
  style,
}: {
  src: string;
  title: string;
  address?: string;
  allowFullScreen?: boolean;
  style?: CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen={allowFullScreen}
        title={title}
        style={style}
      />
    );
  }

  return (
    <div className="map-consent">
      {address ? <p className="map-consent-address">{address}</p> : null}
      <button type="button" className="map-consent-btn" onClick={() => setLoaded(true)}>
        Karte anzeigen
      </button>
      <p className="map-consent-note">
        Beim Laden der Karte werden Daten an Google übertragen.{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
          Datenschutz
        </a>
      </p>
    </div>
  );
}
