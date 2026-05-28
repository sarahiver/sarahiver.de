'use client';

import { useState } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import {
  TIMELINE_DEFAULTS,
  readEvents,
  defaultActiveIndex,
  eventEmoji,
} from './shared';
import { TimelineHeader, LocationInline, TimelineEmpty } from './shared-ui';

/**
 * Timeline Variante A — Contemporary · Horizontale Karten
 *
 * Karten hängen an einer horizontalen Rail. Aktive Karte hebt sich
 * (scale + translateY), inaktive sind leicht rotiert (sticker-look).
 * Klick aktiviert eine Karte.
 *
 * Client Component wegen aktivem State. Initial-Active = current-Event
 * (oder 0) — deterministisch, also SSR-safe.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function TimelineVariantA({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? TIMELINE_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? TIMELINE_DEFAULTS.title;
  const description = (content.description as string) ?? TIMELINE_DEFAULTS.description;
  const events = readEvents(content);

  const [active, setActive] = useState(() => defaultActiveIndex(events));

  if (events.length === 0) {
    return (
      <div className="tl tlA-section">
        <TimelineHeader eyebrow={eyebrow} title={title} description={description} />
        <TimelineEmpty />
      </div>
    );
  }

  const safeActive = Math.max(0, Math.min(events.length - 1, active));

  return (
    <div className="tl tlA-section">
      <TimelineHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="tlA-wrap">
        <div className="tlA-cards">
          {events.map((e, i) => (
            <div
              key={e.id}
              className={`tlA-card ${i === safeActive ? 'is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${e.time} ${e.title}`}
              onClick={() => setActive(i)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
                  setActive(i);
                }
              }}
            >
              <div className="tlA-card-head">
                <span className="tlA-time-badge">{e.time}</span>
                <span className="tlA-emoji-badge">{eventEmoji(e.title)}</span>
              </div>
              <h3 className="tlA-title">{e.title}</h3>
              <LocationInline event={e} />
              {e.description && <p className="tlA-desc">{e.description}</p>}
            </div>
          ))}
        </div>

        <div className="tlA-rail">
          <div className="tlA-rail-line" />
          {events.map((e, i) => {
            const left = ((i + 0.5) / events.length) * 100;
            return (
              <span
                key={e.id}
                className={`tlA-rail-dot ${e.current ? 'is-current' : ''}`}
                style={{ left: `${left.toFixed(2)}%` }}
              />
            );
          })}
        </div>

        <p className="tlA-hint">{events.length} Stationen</p>
      </div>
    </div>
  );
}
