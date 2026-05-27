'use client';

import Decor from '@/components/ui/Decor';
import { formatDeadline, renderTitleWithEm, type RsvpConfig } from './shared';

/**
 * RSVP-Header: Eyebrow + Titel + Decor + Description + Deadline-Pill
 * Wird von allen 3 Varianten gleich genutzt.
 */
export function RsvpHeader({ config }: { config: RsvpConfig }) {
  const deadlineText = formatDeadline(config.deadline);
  return (
    <div className="rsvp-head">
      <p className="rsvp-eyebrow">RSVP</p>
      <h2
        className="rsvp-title"
        data-editable="rsvp.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(config.title) }}
      />
      <div className="rsvp-head-decor-wrap">
        <Decor />
      </div>
      {config.description && (
        <p
          className="rsvp-desc"
          data-editable="rsvp.description"
          data-edit-type="text"
        >
          {config.description}
        </p>
      )}
      {deadlineText && (
        <span
          className="rsvp-deadline"
          data-editable="rsvp.deadline"
          data-edit-type="date"
        >
          Bitte bis zum {deadlineText}
        </span>
      )}
    </div>
  );
}

/**
 * Closed-State: nach Deadline-Ablauf gezeigt.
 */
export function RsvpClosed() {
  return (
    <div className="rsvp-closed">
      <p className="closed-tag">Frist abgelaufen</p>
      <h3>Die Anmeldefrist ist leider vorbei.</h3>
      <p>
        Wenn ihr trotzdem noch zusagen oder absagen möchtet, schreibt uns einfach kurz — wir kümmern uns.
      </p>
    </div>
  );
}

/**
 * Success-State: nach erfolgreichem Submit gezeigt.
 */
export function RsvpSuccess({
  firstName,
  couple,
  onEdit,
}: {
  firstName: string;
  couple: string;
  onEdit: () => void;
}) {
  const greeting = firstName ? `Danke, ${firstName}!` : 'Danke!';
  return (
    <div className="rsvp-success">
      <div className="check" aria-hidden="true">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <h3>{greeting}</h3>
      <p>
        Wir haben eure Antwort. Falls sich etwas ändert, könnt ihr eure RSVP jederzeit hier bearbeiten.
      </p>
      <button type="button" className="btn-ghost" onClick={onEdit}>
        RSVP bearbeiten
      </button>
      {couple && <div className="signed">— {couple}</div>}
    </div>
  );
}
