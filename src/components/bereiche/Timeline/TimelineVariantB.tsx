import type { EffectiveTokens } from '@/types/supabase';
import { TIMELINE_DEFAULTS, readEvents } from './shared';
import { TimelineHeader, LocationPill, NowTag, TimelineEmpty } from './shared-ui';

/**
 * Timeline Variante B — Editorial · Vertikaler Zeitstrahl
 *
 * Server Component (keine Interaktivität). Uhrzeit links groß,
 * Knoten auf der Linie, Event-Inhalt rechts.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function TimelineVariantB({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? TIMELINE_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? TIMELINE_DEFAULTS.title;
  const description = (content.description as string) ?? TIMELINE_DEFAULTS.description;
  const events = readEvents(content);

  return (
    <div className="tl tlB-section">
      <TimelineHeader eyebrow={eyebrow} title={title} description={description} />

      {events.length === 0 ? (
        <TimelineEmpty />
      ) : (
        <div className="tlB-wrap">
          <div className="tlB-line" />
          {events.map((e) => (
            <div key={e.id} className={`tlB-event ${e.current ? 'is-current' : ''}`}>
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
                  {e.current && <NowTag />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
