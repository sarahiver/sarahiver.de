'use client';

import { useState, useRef } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import {
  TIMELINE_DEFAULTS,
  readEvents,
  defaultActiveIndex,
} from './shared';
import { TimelineHeader, LocationPill, NowTag, TimelineEmpty } from './shared-ui';
import { useLiveEventIndex } from './use-live-event';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Timeline Variante C — Classic · Größen-Sprung
 *
 * Horizontale Bild-Karten. Aktive Karte wächst (flex-grow + aspect-ratio),
 * inaktive sind schmal und abgedunkelt. Klick aktiviert.
 *
 * Client Component wegen aktivem State. Initial-Active = current (oder 0).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function TimelineVariantC({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? TIMELINE_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? TIMELINE_DEFAULTS.title;
  const description = (content.description as string) ?? TIMELINE_DEFAULTS.description;
  const events = readEvents(content);

  const [active, setActive] = useState(() => defaultActiveIndex(events));
  const liveIdx = useLiveEventIndex(events, tokens.wedding_date);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (events.length === 0) {
    return (
      <div className="tl tlC-section" data-style-tl={style}>
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

  const activate = (i: number) => {
    setActive(i);
    // Auf Mobile die aktive Karte ins Sichtfeld scrollen
    cardRefs.current[i]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <div className="tl tlC-section" data-style-tl={style}>
      <TimelineHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="tlC-wrap">
        <div className="tlC-row">
          {events.map((e, i) => (
            <div
              key={e.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`tlC-card ${i === safeActive ? 'is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${e.time} ${e.title}`}
              onClick={() => activate(i)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
                  activate(i);
                }
              }}
            >
              {e.image && (
                <div
                  className="tlC-img"
                  style={{ backgroundImage: `url('${e.image}')` }}
                />
              )}
              {i === liveIdx && (
                <div className="tlC-now-row">
                  <NowTag />
                </div>
              )}
              <div className="tlC-content">
                <div className="tlC-time">
                  {e.time}
                  <span className="tlC-uhr">Uhr</span>
                </div>
                <div className="tlC-titlelab">{e.title}</div>
                <div className="tlC-bigtitle">{e.title}</div>
                {e.description && <div className="tlC-descpill">{e.description}</div>}
                <div>
                  <LocationPill event={e} glass className="tlC-loc" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
