'use client';

import { useState, useCallback } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import {
  ACC_DEFAULTS,
  readItems,
  readVenue,
  computePinGeometry,
} from './shared';
import { AccHeader, AccMeta, AccEmpty } from './shared-ui';
import { CopyCode } from './CopyCode';
import { IconExt, IconHeart } from './icons';

/**
 * Übernachtung Variante C — Karte + Liste (Google Maps Embed + Pins)
 *
 * HTML-Pins liegen über einem Embed-iframe. Pin-Positionen werden aus
 * lat/lng deterministisch in Prozent gerechnet (SSR-safe). Hover synct
 * Pin <-> Listenzeile; Pin-Klick scrollt zur Zeile.
 *
 * Hinweis: Die Pins sind fix positioniert (kein Live-Sync mit Zoom/Pan
 * des iframes). Für echtes Multi-Pin-Verhalten mit Karten-Interaktion
 * bräuchte es die Google Maps JS API + API-Key. Diese Embed-Lösung ist
 * bewusst key-frei (kostenlos) — konsistent mit sarahiver.com.
 *
 * Client Component wegen Hover-Sync, Copy-Code und Pin-Klick-Scroll.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function AccommodationsVariantC({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? ACC_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? ACC_DEFAULTS.title;
  const description = (content.description as string) ?? ACC_DEFAULTS.description;
  const items = readItems(content);
  const venue = readVenue(content);

  const [hoverId, setHoverId] = useState<string | null>(null);

  const { toX, toY, mapSrc } = computePinGeometry(venue, items);

  const jumpToRow = useCallback((id: string) => {
    const row = document.getElementById(`accC-row-${id}`);
    if (!row) return;
    const top = row.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  if (items.length === 0) {
    return (
      <div className="acc accC-section">
        <AccHeader eyebrow={eyebrow} title={title} description={description} />
        <AccEmpty />
      </div>
    );
  }

  return (
    <div className="acc accC-section">
      <AccHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="accC-wrap">
        <div className="accC-grid">
          <div className="accC-mapwrap" aria-label="Karte mit Hotel-Positionen">
            <iframe
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Karte mit Hotel-Positionen"
            />
            <div className="accC-maplegend">
              <span className="heart">
                <IconHeart />
              </span>
              <span>Hochzeit</span>
            </div>

            {venue && (
              <div
                className="accC-pin is-venue"
                style={{ left: `${toX(venue.lng)}%`, top: `${toY(venue.lat)}%` }}
                title={venue.name}
                aria-label={`Hochzeitslocation ${venue.name}`}
              >
                <div className="accC-pin-bubble">
                  <IconHeart />
                </div>
              </div>
            )}

            {items.map((h, i) => {
              if (typeof h.lat !== 'number' || typeof h.lng !== 'number') return null;
              return (
                <div
                  key={h.id}
                  className={`accC-pin ${hoverId === h.id ? 'is-hover' : ''}`}
                  style={{ left: `${toX(h.lng)}%`, top: `${toY(h.lat)}%` }}
                  title={h.name}
                  aria-label={h.name}
                  onMouseEnter={() => setHoverId(h.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => jumpToRow(h.id)}
                >
                  <div className="accC-pin-bubble">
                    <span className="accC-pin-num">{i + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="accC-list">
            {items.map((h, i) => (
              <article
                key={h.id}
                id={`accC-row-${h.id}`}
                className={`accC-row ${hoverId === h.id ? 'is-hover' : ''}`}
                onMouseEnter={() => setHoverId(h.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <div className="accC-num">{i + 1}</div>
                <div className="accC-content">
                  <h3
                    className="accC-name"
                    data-editable={`accommodations.items.${h.id}.name`}
                    data-edit-type="text"
                  >
                    {h.name}
                  </h3>
                  <AccMeta item={h} />
                  <div className="accC-bookline">
                    {h.booking_code && <CopyCode code={h.booking_code} id={h.id} />}
                    {h.booking_url && (
                      <a
                        className="accC-booklink"
                        href={h.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Zur Buchung <IconExt />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
