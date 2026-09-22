'use client';

import { useState, type ReactNode } from 'react';
import { RSVP_LIMITS, formatDeadline, renderTitleWithEm } from './shared';
import { RSVP_COPY, type RsvpController } from './useRsvp';
import GuestPrivacyNote from '../GuestPrivacyNote';

/**
 * RSVP — stilneutrale Bausteine.
 *
 * Diese Datei kennt keine Variante und keinen Stil. Sie liefert semantisch
 * korrektes, zugängliches Markup mit stabilen Klassen (rv-*). Die Varianten
 * komponieren daraus ihre Struktur, die Stile (editorial.css, später die
 * übrigen sieben) geben ihr das Aussehen.
 *
 * Grundregeln:
 *   - jedes Eingabefeld hat ein sichtbares <label>
 *   - Fehler stehen am Feld und sind per aria-describedby verknüpft
 *   - Entscheidungen sind echte Radio-Gruppen (Pfeiltasten, Space) in
 *     <fieldset>/<legend> — keine Buttons mit aria-pressed
 *   - der Auswahlzustand ist an der Form des Markers erkennbar, nicht nur
 *     an der Farbe
 */

type R = RsvpController;

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

function describedBy(...ids: unknown[]) {
  const v = ids.filter((x): x is string => typeof x === 'string' && x.length > 0).join(' ');
  return v || undefined;
}

/* ====================================================================
   Kopf
   ==================================================================== */

export function RsvpTitle({
  r,
  className = 'rv-title',
  as: Tag = 'h2',
}: {
  r: R;
  className?: string;
  as?: 'h2' | 'p';
}) {
  return (
    <Tag
      className={className}
      data-editable="rsvp.title"
      data-edit-type="text"
      dangerouslySetInnerHTML={{ __html: renderTitleWithEm(r.config.title) }}
    />
  );
}

export function RsvpLead({ r, className = 'rv-lead' }: { r: R; className?: string }) {
  if (!r.config.description) return null;
  return (
    <p className={className} data-editable="rsvp.description" data-edit-type="text">
      {r.config.description}
    </p>
  );
}

export function RsvpDeadline({ r, className = 'rv-deadline' }: { r: R; className?: string }) {
  const text = formatDeadline(r.config.deadline);
  if (!text) return null;
  return (
    <p className={className} data-editable="rsvp.deadline" data-edit-type="date">
      <span className="rv-deadline-label">Rückmeldung bis</span>{' '}
      <span className="rv-deadline-date">{text}</span>
    </p>
  );
}

/* ====================================================================
   Allgemeine Feldhülle
   ==================================================================== */

function FieldShell({
  r,
  k,
  label,
  optional,
  hint,
  className,
  children,
}: {
  r: R;
  k: string;
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const error = r.errors[k];
  return (
    <div className={cx('rv-field', className)} data-invalid={error ? 'true' : undefined}>
      <label className="rv-label" htmlFor={r.fid(k)}>
        <span className="rv-label-text">{label}</span>
        {optional && <span className="rv-optional">optional</span>}
      </label>
      {hint && (
        <p className="rv-hint" id={r.fid(`${k}-hint`)}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p className="rv-error" id={r.fid(`${k}-error`)}>
          {error}
        </p>
      )}
    </div>
  );
}

export function RsvpTextField({
  r,
  k,
  label,
  value,
  onChange,
  optional,
  hint,
  type = 'text',
  autoComplete,
  inputMode,
  maxLength = RSVP_LIMITS.text,
  placeholder,
  className,
}: {
  r: R;
  k: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
  hint?: ReactNode;
  type?: 'text' | 'email';
  autoComplete?: string;
  inputMode?: 'text' | 'email';
  maxLength?: number;
  placeholder?: string;
  className?: string;
}) {
  const error = r.errors[k];
  return (
    <FieldShell r={r} k={k} label={label} optional={optional} hint={hint} className={className}>
      <input
        id={r.fid(k)}
        className="rv-input"
        type={type}
        name={k}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        required={!optional}
        aria-required={!optional || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && r.fid(`${k}-hint`), error && r.fid(`${k}-error`))}
        spellCheck={type === 'email' ? false : undefined}
      />
    </FieldShell>
  );
}

/* ====================================================================
   Teilnahmeentscheidung
   ==================================================================== */

export function RsvpAttendance({
  r,
  legend,
  legendHidden,
  yesLabel = 'Ja, wir kommen',
  noLabel = 'Leider nicht',
  yesNote,
  noNote,
  className,
  lead,
}: {
  r: R;
  legend: ReactNode;
  legendHidden?: boolean;
  yesLabel?: ReactNode;
  noLabel?: ReactNode;
  yesNote?: ReactNode;
  noNote?: ReactNode;
  className?: string;
  lead?: ReactNode;
}) {
  const error = r.errors.attending;
  const name = r.fid('attending');
  const options: { value: boolean; id: string; label: ReactNode; note?: ReactNode }[] = [
    { value: true, id: 'attending-yes', label: yesLabel, note: yesNote },
    { value: false, id: 'attending-no', label: noLabel, note: noNote },
  ];
  return (
    <fieldset
      className={cx('rv-choice', className)}
      data-invalid={error ? 'true' : undefined}
      data-decided={r.form.attending !== null ? 'true' : undefined}
      aria-describedby={describedBy(error && r.fid('attending-error'))}
    >
      <legend className={cx('rv-legend', legendHidden && 'rv-sr')}>{legend}</legend>
      {lead}
      <div className="rv-choice-options">
        {options.map((o) => {
          const checked = r.form.attending === o.value;
          return (
            <label
              key={o.id}
              className="rv-option"
              data-checked={checked ? 'true' : undefined}
              data-value={o.value ? 'yes' : 'no'}
            >
              <input
                id={r.fid(o.id)}
                className="rv-option-input"
                type="radio"
                name={name}
                value={o.value ? 'yes' : 'no'}
                checked={checked}
                onChange={() => r.setAttending(o.value)}
                aria-invalid={error ? true : undefined}
              />
              <span className="rv-option-mark" aria-hidden="true" />
              <span className="rv-option-body">
                <span className="rv-option-label">{o.label}</span>
                {o.note && <span className="rv-option-note">{o.note}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="rv-error" id={r.fid('attending-error')}>
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* ====================================================================
   Personen und Begleitungen
   ==================================================================== */

export function RsvpPersons({
  r,
  label = 'Personen insgesamt',
  hint = 'Euch selbst mitgezählt.',
  className,
}: {
  r: R;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  const n = r.form.persons;
  const labelId = r.fid('persons-label');
  return (
    <div className={cx('rv-field rv-persons', className)}>
      <p className="rv-label" id={labelId}>
        <span className="rv-label-text">{label}</span>
      </p>
      {hint && (
        <p className="rv-hint" id={r.fid('persons-hint')}>
          {hint}
        </p>
      )}
      <div
        className="rv-stepper"
        role="group"
        aria-labelledby={labelId}
        aria-describedby={hint ? r.fid('persons-hint') : undefined}
      >
        <button
          type="button"
          className="rv-stepper-btn"
          onClick={() => r.changePersons(-1)}
          disabled={n <= 1}
          aria-label="Eine Person weniger"
        >
          <span aria-hidden="true">−</span>
        </button>
        <output className="rv-stepper-value" id={r.fid('persons')} aria-live="polite">
          <span className="rv-stepper-num">{n}</span>{' '}
          <span className="rv-stepper-unit">{n === 1 ? 'Person' : 'Personen'}</span>
        </output>
        <button
          type="button"
          className="rv-stepper-btn"
          onClick={() => r.changePersons(1)}
          disabled={n >= RSVP_LIMITS.personsMax}
          aria-label="Eine Person mehr"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}

export function RsvpCompanions({
  r,
  legend = 'Wer kommt mit?',
  hint = 'Namen genügen. Essenswünsche könnt ihr je Person ergänzen.',
  className,
}: {
  r: R;
  legend?: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  const asksFood = r.config.ask_dietary || r.config.ask_allergies;
  const [open, setOpen] = useState<Set<number>>(() => {
    const s = new Set<number>();
    r.form.guests.forEach((g, i) => {
      if (g.dietary || g.allergies) s.add(i);
    });
    return s;
  });
  if (r.form.guests.length === 0) return null;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <fieldset className={cx('rv-companions', className)}>
      <legend className="rv-legend rv-legend--sub">{legend}</legend>
      {hint && asksFood && <p className="rv-hint">{hint}</p>}
      <ol className="rv-companion-list">
        {r.form.guests.map((g, i) => {
          const isOpen = open.has(i) || Boolean(g.dietary || g.allergies);
          const panelId = r.fid(`guest-${i}-food`);
          return (
            <li className="rv-companion" key={i} data-open={isOpen ? 'true' : undefined}>
              <div className="rv-companion-row">
                <div className="rv-field rv-companion-name">
                  <label className="rv-label" htmlFor={r.fid(`guest-${i}-name`)}>
                    <span className="rv-label-text">Person {i + 2}</span>
                  </label>
                  <input
                    id={r.fid(`guest-${i}-name`)}
                    className="rv-input"
                    type="text"
                    value={g.name}
                    onChange={(e) => r.setGuest(i, 'name', e.target.value)}
                    autoComplete="off"
                    maxLength={RSVP_LIMITS.name}
                    placeholder="Vor- und Nachname"
                  />
                </div>
                {asksFood && (
                  <button
                    type="button"
                    className="rv-companion-toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                  >
                    <span className="rv-companion-toggle-mark" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                    <span>
                      Essen<span className="rv-sr"> für Person {i + 2}</span>
                    </span>
                  </button>
                )}
              </div>
              {asksFood && isOpen && (
                <div className="rv-companion-food" id={panelId}>
                  {r.config.ask_dietary && (
                    <div className="rv-field">
                      <label className="rv-label" htmlFor={r.fid(`guest-${i}-dietary`)}>
                        <span className="rv-label-text">Ernährung</span>
                        <span className="rv-optional">optional</span>
                      </label>
                      <input
                        id={r.fid(`guest-${i}-dietary`)}
                        className="rv-input"
                        type="text"
                        value={g.dietary}
                        onChange={(e) => r.setGuest(i, 'dietary', e.target.value)}
                        autoComplete="off"
                        maxLength={RSVP_LIMITS.text}
                        placeholder="z. B. vegetarisch"
                      />
                    </div>
                  )}
                  {r.config.ask_allergies && (
                    <div className="rv-field">
                      <label className="rv-label" htmlFor={r.fid(`guest-${i}-allergies`)}>
                        <span className="rv-label-text">Allergien</span>
                        <span className="rv-optional">optional</span>
                      </label>
                      <input
                        id={r.fid(`guest-${i}-allergies`)}
                        className="rv-input"
                        type="text"
                        value={g.allergies}
                        onChange={(e) => r.setGuest(i, 'allergies', e.target.value)}
                        autoComplete="off"
                        maxLength={RSVP_LIMITS.text}
                        placeholder="z. B. Nüsse"
                      />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
}

/* ====================================================================
   Essen
   --------------------------------------------------------------------
   Ernährung (Entscheidung: vegetarisch, vegan …) und Allergien (medizinisch:
   Nüsse, Laktose …) sind im Datenmodell getrennt. Für Gäste werden sie als
   ein Thema mit zwei klar benannten Feldern gezeigt, nicht als zwei
   gleichartige „Wünsche".
   ==================================================================== */

export function RsvpFood({
  r,
  legend,
  legendHidden,
  className,
}: {
  r: R;
  legend?: ReactNode;
  legendHidden?: boolean;
  className?: string;
}) {
  const { ask_dietary, ask_allergies } = r.config;
  if (!ask_dietary && !ask_allergies) return null;
  const forMain = r.form.persons > 1;
  const resolvedLegend = legend ?? (forMain ? 'Euer Essen' : 'Essen');
  return (
    <fieldset className={cx('rv-food', className)}>
      <legend className={cx('rv-legend rv-legend--sub', legendHidden && 'rv-sr')}>
        {resolvedLegend}
      </legend>
      {forMain && (
        <p className="rv-hint">Eure eigenen Angaben. Für Begleitungen oben je Person ergänzen.</p>
      )}
      <div className="rv-pair">
        {ask_dietary && (
          <RsvpTextField
            r={r}
            k="dietary"
            label="Ernährung"
            optional
            placeholder="z. B. vegetarisch, vegan"
            value={r.form.dietary}
            onChange={(v) => r.setField('dietary', v)}
            autoComplete="off"
          />
        )}
        {ask_allergies && (
          <RsvpTextField
            r={r}
            k="allergies"
            label="Allergien & Unverträglichkeiten"
            optional
            placeholder="z. B. Nüsse, Laktose"
            value={r.form.allergies}
            onChange={(v) => r.setField('allergies', v)}
            autoComplete="off"
          />
        )}
      </div>
    </fieldset>
  );
}

/* ====================================================================
   Individuelle Fragen (custom_questions → custom_answer)
   ==================================================================== */

export function RsvpCustomQuestions({ r, className }: { r: R; className?: string }) {
  const questions = r.config.custom_questions;
  if (questions.length === 0) return null;
  return (
    <div className={cx('rv-questions', className)}>
      {questions.map((q) => {
        const k = `cq-${q.id}`;
        const value = r.form.custom_answers[q.id] ?? '';
        const error = r.errors[k];
        if (q.type === 'text') {
          return (
            <RsvpTextField
              key={q.id}
              r={r}
              k={k}
              label={q.label}
              optional={!q.required}
              value={value}
              onChange={(v) => r.setAnswer(q.id, v)}
              autoComplete="off"
              className="rv-question"
            />
          );
        }
        const opts = q.type === 'boolean' ? ['Ja', 'Nein'] : q.options ?? [];
        return (
          <fieldset
            key={q.id}
            className="rv-field rv-question rv-question--choice"
            data-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy(error && r.fid(`${k}-error`))}
          >
            <legend className="rv-label">
              <span className="rv-label-text">{q.label}</span>
              {!q.required && <span className="rv-optional">optional</span>}
            </legend>
            <div className="rv-pills">
              {opts.map((opt, i) => {
                const checked = value === opt;
                return (
                  <label className="rv-pill" key={opt} data-checked={checked ? 'true' : undefined}>
                    <input
                      id={i === 0 ? r.fid(k) : undefined}
                      className="rv-option-input"
                      type="radio"
                      name={r.fid(k)}
                      value={opt}
                      checked={checked}
                      onChange={() => r.setAnswer(q.id, opt)}
                      aria-invalid={error ? true : undefined}
                    />
                    <span className="rv-pill-mark" aria-hidden="true" />
                    <span className="rv-pill-label">{opt}</span>
                  </label>
                );
              })}
            </div>
            {error && (
              <p className="rv-error" id={r.fid(`${k}-error`)}>
                {error}
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

/* ====================================================================
   Nachricht
   ==================================================================== */

export function RsvpMessage({
  r,
  label,
  hint,
  className,
}: {
  r: R;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  const k = 'message';
  const error = r.errors[k];
  const len = r.form.message.length;
  const rest = RSVP_LIMITS.message - len;
  const showCount = len > RSVP_LIMITS.message * 0.8;
  const resolvedLabel = label ?? (r.form.attending === false ? 'Ein paar Worte an uns' : 'Nachricht an uns');
  return (
    <FieldShell r={r} k={k} label={resolvedLabel} optional hint={hint} className={cx('rv-message', className)}>
      <textarea
        id={r.fid(k)}
        className="rv-input rv-textarea"
        name="message"
        rows={4}
        value={r.form.message}
        onChange={(e) => r.setField('message', e.target.value)}
        maxLength={RSVP_LIMITS.message}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(
          hint && r.fid(`${k}-hint`),
          error && r.fid(`${k}-error`),
          showCount && r.fid(`${k}-count`),
        )}
      />
      {showCount && (
        <p className="rv-count" id={r.fid(`${k}-count`)} aria-live="polite">
          Noch {rest} Zeichen
        </p>
      )}
    </FieldShell>
  );
}

/* ====================================================================
   Senden
   ==================================================================== */

export function RsvpSubmit({
  r,
  label = RSVP_COPY.submit,
  className,
}: {
  r: R;
  label?: ReactNode;
  className?: string;
}) {
  const loading = r.status === 'loading';
  return (
    <div className={cx('rv-submit', className)}>
      {r.notice && (
        <p className="rv-notice" role="status">
          {r.notice}
        </p>
      )}
      {r.status === 'error' && (
        <p className="rv-alert" role="alert">
          {RSVP_COPY.submitError}
        </p>
      )}
      <button
        id={r.fid('submit')}
        type="submit"
        className="rv-button rv-button--primary"
        disabled={loading}
        aria-busy={loading || undefined}
        data-loading={loading ? 'true' : undefined}
      >
        <span className="rv-button-label">{loading ? RSVP_COPY.submitPending : label}</span>
      </button>
      <GuestPrivacyNote />
      <p className="rv-sr" aria-live="polite">
        {loading ? RSVP_COPY.submitPending : ''}
      </p>
    </div>
  );
}

/* ====================================================================
   Einladungscode-Gate
   ==================================================================== */

export function RsvpGate({
  r,
  heading,
  lead,
  className,
  children,
}: {
  r: R;
  heading?: ReactNode;
  lead?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const { code, pending, error, notice } = r.gate;
  return (
    <form
      className={cx('rv-gate', className)}
      onSubmit={r.submitGate}
      noValidate
      aria-labelledby={heading ? r.fid('gate-title') : undefined}
      // Keine Passwort-Heuristik: kein type=password, kein „password" im Namen.
      autoComplete="off"
      data-pending={pending ? 'true' : undefined}
    >
      {heading && (
        <p className="rv-gate-heading" id={r.fid('gate-title')} tabIndex={-1}>
          {heading}
        </p>
      )}
      {lead && <p className="rv-gate-lead">{lead}</p>}
      {children}
      {notice && (
        <p className="rv-notice rv-notice--gate" role="status">
          {notice}
        </p>
      )}
      <div className="rv-gate-row">
        <div className="rv-field rv-gate-field" data-invalid={error ? 'true' : undefined}>
          <label className="rv-label" htmlFor={r.fid('code')}>
            <span className="rv-label-text">{RSVP_COPY.gateLabel}</span>
          </label>
          <input
            id={r.fid('code')}
            className="rv-input rv-code"
            type="text"
            name="invitation"
            value={code}
            onChange={(e) => r.setCode(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            maxLength={60}
            required
            aria-required
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(r.fid('code-hint'), error && r.fid('code-error'))}
            // Passwortmanager bitte nicht anbieten.
            data-1p-ignore=""
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
          />
          <p className="rv-hint" id={r.fid('code-hint')}>
            {RSVP_COPY.gateHint}
          </p>
          {error && (
            <p className="rv-error" id={r.fid('code-error')} role="alert">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="rv-button rv-button--primary rv-gate-button"
          disabled={pending}
          aria-busy={pending || undefined}
          data-loading={pending ? 'true' : undefined}
        >
          <span className="rv-button-label">{pending ? RSVP_COPY.gatePending : RSVP_COPY.gateSubmit}</span>
        </button>
      </div>
      <p className="rv-sr" aria-live="polite">
        {pending ? RSVP_COPY.gatePending : ''}
      </p>
    </form>
  );
}

/* ====================================================================
   Prüfen / Frist / Erfolg
   ==================================================================== */

export function RsvpChecking({ className }: { className?: string }) {
  return (
    <div className={cx('rv-checking', className)} aria-busy="true">
      <p className="rv-checking-text">Einen Moment …</p>
    </div>
  );
}

export function RsvpClosedNote({ className }: { className?: string }) {
  return (
    <div className={cx('rv-closed', className)}>
      <p className="rv-closed-title">Die Rückmeldefrist ist vorbei.</p>
      <p className="rv-closed-text">
        Wenn ihr trotzdem noch zu- oder absagen möchtet, schreibt uns einfach kurz.
      </p>
    </div>
  );
}

/** Überschrift des Erfolgszustands — erhält nach dem Senden den Fokus. */
export function RsvpDoneHeading({
  r,
  className = 'rv-done-title',
  as: Tag = 'h3',
  children,
}: {
  r: R;
  className?: string;
  as?: 'h2' | 'h3';
  children: ReactNode;
}) {
  return (
    <Tag className={className} id={r.fid('done')} tabIndex={-1}>
      {children}
    </Tag>
  );
}

export function successCopy(r: R) {
  const yes = r.sent?.attending === true;
  const first = r.sent?.firstName ?? '';
  return {
    yes,
    kicker: 'Rückmeldung gesendet',
    title: yes ? (first ? `Wie schön, ${first}.` : 'Wie schön.') : 'Danke für eure Rückmeldung.',
    short: yes ? 'Wie schön.' : 'Danke.',
    text: yes
      ? 'Wir freuen uns sehr darauf, diesen Tag mit euch zu feiern.'
      : 'Schade, dass ihr nicht dabei sein könnt. Wir denken an euch.',
  };
}

export function RsvpSummary({ r, className }: { r: R; className?: string }) {
  if (!r.sent) return null;
  const { attending, persons, companions } = r.sent;
  return (
    <dl className={cx('rv-summary', className)}>
      <div className="rv-summary-row">
        <dt>Antwort</dt>
        <dd>{attending ? 'Zusage' : 'Absage'}</dd>
      </div>
      {attending && (
        <div className="rv-summary-row">
          <dt>Personen</dt>
          <dd>{persons}</dd>
        </div>
      )}
      {attending && companions.length > 0 && (
        <div className="rv-summary-row">
          <dt>Mit dabei</dt>
          <dd>{companions.join(', ')}</dd>
        </div>
      )}
    </dl>
  );
}

export function RsvpDoneFooter({ r, className }: { r: R; className?: string }) {
  return (
    <div className={cx('rv-done-foot', className)}>
      {r.mode === 'preview' && <p className="rv-notice">{RSVP_COPY.previewNote}</p>}
      {r.config.couple && <p className="rv-signature">{r.config.couple}</p>}
      <button type="button" className="rv-button rv-button--quiet" onClick={r.restart}>
        Weitere Rückmeldung senden
      </button>
    </div>
  );
}
