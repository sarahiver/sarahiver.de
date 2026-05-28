import Decor from '@/components/ui/Decor';
import { renderTitleWithEm, type TimelineEvent } from './shared';

/**
 * Geteilter Header — Server-renderbar (keine Interaktivität).
 */
export function TimelineHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="tl-head">
      {eyebrow && (
        <p className="tl-eyebrow" data-editable="timeline.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="tl-title"
        data-editable="timeline.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="tl-head-decor-wrap">
        <Decor />
      </div>
      {description && (
        <p className="tl-desc" data-editable="timeline.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

const PinIcon = () => (
  <svg
    className="pin"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    aria-hidden="true"
  >
    <path d="M6 11c2.5-3 4-5 4-7a4 4 0 0 0-8 0c0 2 1.5 4 4 7z" />
    <circle cx="6" cy="4" r="1.4" />
  </svg>
);

/**
 * Location-Pill (Link zu Google Maps falls location_url gesetzt).
 */
export function LocationPill({
  event,
  glass = false,
  className = '',
}: {
  event: TimelineEvent;
  glass?: boolean;
  className?: string;
}) {
  if (!event.location_name) return null;
  const cls = `loc-pill${glass ? ' glass' : ''}${className ? ' ' + className : ''}`;
  if (event.location_url) {
    return (
      <a className={cls} href={event.location_url} target="_blank" rel="noopener noreferrer">
        <PinIcon />
        <span>{event.location_name}</span>
      </a>
    );
  }
  return (
    <span className={cls}>
      <PinIcon />
      <span>{event.location_name}</span>
    </span>
  );
}

/**
 * "Läuft jetzt"-Tag mit Pulse-Dot.
 */
export function NowTag() {
  return (
    <span className="now-tag" title="läuft jetzt">
      <span className="pulse" />
      Läuft jetzt
    </span>
  );
}

/**
 * Inline-Location für Variante A (kleiner, ohne Pill-Hintergrund).
 */
export function LocationInline({ event }: { event: TimelineEvent }) {
  if (!event.location_name) return null;
  return (
    <div className="tlA-loc-inline">
      <PinIcon />
      <span>{event.location_name}</span>
    </div>
  );
}

/**
 * Empty-State.
 */
export function TimelineEmpty() {
  return <div className="tl-empty">Der Tagesablauf wird in Kürze ergänzt.</div>;
}
