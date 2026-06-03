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
import { useLiveEventIndex } from './use-live-event';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Timeline Variante A — Contemporary · Horizontale Karten
 *
 * Karten hängen an einer horizontalen Rail. Aktive Karte hebt sich
 * (scale + translateY), inaktive sind leicht rotiert (sticker-look).
 * Klick aktiviert eine Karte. Rail-Dot des LIVE-Events pulsiert
 * (echte Uhrzeit, SSR-safe).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function TimelineVariantA({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? TIMELINE_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? TIMELINE_DEFAULTS.title;
  const description = (content.description as string) ?? TIMELINE_DEFAULTS.description;
  const events = readEvents(content);

  const [active, setActive] = useState(() => defaultActiveIndex(events));
  const liveIdx = useLiveEventIndex(events, tokens.wedding_date);

  if (events.length === 0) {
    return (
      <div className="tl tlA-section" data-style-tl={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
        <TimelineHeader eyebrow={eyebrow} title={title} description={description} />
        <TimelineEmpty />
      </div>
    );
  }

  const safeActive = Math.max(0, Math.min(events.length - 1, active));

  return (
    <div className="tl tlA-section" data-style-tl={style}>
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
                className={`tlA-rail-dot ${i === liveIdx ? 'is-current' : ''}`}
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
