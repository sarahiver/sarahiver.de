'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { TIMELINE_DEFAULTS, readEvents } from './shared';
import { TimelineHeader, LocationPill, NowTag, TimelineEmpty } from './shared-ui';
import { useLiveEventIndex } from './use-live-event';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Timeline Variante B — Editorial · Vertikaler Zeitstrahl
 *
 * Uhrzeit links groß, Knoten auf der Linie, Event-Inhalt rechts.
 * Client Component wegen Live-"Läuft jetzt"-Logik (echte Uhrzeit,
 * SSR-safe via useLiveEventIndex → initial -1).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function TimelineVariantB({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? TIMELINE_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? TIMELINE_DEFAULTS.title;
  const description = (content.description as string) ?? TIMELINE_DEFAULTS.description;
  const events = readEvents(content);
  const liveIdx = useLiveEventIndex(events, tokens.wedding_date);

  return (
    <div className="tl tlB-section" data-style-tl={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <TimelineHeader eyebrow={eyebrow} title={title} description={description} />

      {events.length === 0 ? (
        <TimelineEmpty />
      ) : (
        <div className="tlB-wrap">
          <div className="tlB-line" />
          {events.map((e, i) => (
            <div key={e.id} className={`tlB-event ${i === liveIdx ? 'is-current' : ''}`}>
              <div className="tlB-event-time">
                <div className="t">{e.time}</div>
                <div className="u">Uhr</div>
              </div>
              <div className="tlB-knode">
                <div className="dot" />
              </div>
              <div className="tlB-event-content">
                <h3 className="ttl">{e.title}</h3>
                {e.description && <p className="dsc">{e.description}</p>}
                <div className="pills">
                  <LocationPill event={e} />
                  {i === liveIdx && <NowTag />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
