'use client';

import {
  formatDeadline,
  renderTitleWithEm,
  type RsvpConfig,
  type CustomQuestion,
} from './shared';

/**
 * CustomQuestionField — rendert eine einzelne Custom-Frage je nach Typ.
 * Genutzt von Variante A (und sinngemäß B/C mit eigenem Styling).
 *
 *   text    → Text-Input
 *   boolean → Ja/Nein Pill-Toggle
 *   choice  → Options als Pills (single-select)
 */
export function CustomQuestionField({
  question,
  value,
  onChange,
}: {
  question: CustomQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field rsvp-cq">
      <label>
        {question.label}
        {question.required && <span className="rsvp-req"> *</span>}
      </label>

      {question.type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Eure Antwort"
        />
      )}

      {question.type === 'boolean' && (
        <div className="rsvp-cq-pills">
          {['Ja', 'Nein'].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`rsvp-cq-pill ${value === opt ? 'is-on' : ''}`}
              onClick={() => onChange(opt)}
              aria-pressed={value === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === 'choice' && question.options && (
        <div className="rsvp-cq-pills">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`rsvp-cq-pill ${value === opt ? 'is-on' : ''}`}
              onClick={() => onChange(opt)}
              aria-pressed={value === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * RSVP-Header: Eyebrow + Titel + (stil-spezifisches Ornament) + Description + Deadline-Pill.
 *
 * Design System v2:
 *   Statt der alten generischen <Decor />-Komponente rendert der Header
 *   pro Stil eine eigene Ornament-Form via CSS-Klasse `.rsvp-head-ornament`.
 *   Der Style wird über das `data-style-rsvp` Attribute am Top-Wrapper
 *   gesteuert — Header selbst muss nichts wissen.
 */
export function RsvpHeader({ config }: { config: RsvpConfig }) {
  const deadlineText = formatDeadline(config.deadline);
  return (
    <div className="rsvp-head">
      <p className="rsvp-eyebrow">RSVP</p>
      <h2
        className="rsvp-title display"
        data-editable="rsvp.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(config.title) }}
      />
      {/* Stil-spezifisches Ornament — wird per CSS pro [data-style-rsvp] gestaltet.
          Per Default unsichtbar; bei spezifischen Stilen sichtbar gemacht. */}
      <div className="rsvp-head-ornament" aria-hidden="true" />
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
