import type { ChangeEvent, RefObject } from 'react';
import { renderTitleWithEm, ACCEPTED_TYPES } from './shared';
import { IconHeart, IconLock } from './icons';

/**
 * Design System v2: alte <Decor />-Komponente raus, stattdessen ein
 * semantischer Slot `.up-head-ornament` der pro Stil per CSS gestaltet wird
 * (analog zu RSVP/Countdown).
 */

export function UpHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="up-head">
      {eyebrow && (
        <p className="up-eyebrow" data-editable="photoupload.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="up-title"
        data-editable="photoupload.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="up-head-ornament" aria-hidden="true" />
      {description && (
        <p className="up-desc" data-editable="photoupload.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

export function UpSuccess({
  message,
  sub,
  onReset,
}: {
  message: string;
  sub: string;
  onReset: () => void;
}) {
  return (
    <div className="up-success">
      <div className="up-success-icon">
        <IconHeart />
      </div>
      <h3
        className="up-success-title"
        data-editable="photoupload.success_message"
        data-edit-type="text"
      >
        {message}
      </h3>
      {sub && <p className="up-success-sub">{sub}</p>}
      <button type="button" className="up-success-link" onClick={onReset}>
        Weitere Fotos teilen
      </button>
    </div>
  );
}

export function UpPrivacy({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="up-privacy">
      <IconLock />
      <span>{text}</span>
    </div>
  );
}

export function UpError({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="up-error">{msg}</p>;
}

/**
 * Verstecktes File-Input — gemeinsam genutzt. ref + onChange aus dem Hook.
 */
export function HiddenFileInput({
  inputRef,
  onChange,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPTED_TYPES}
      multiple
      onChange={onChange}
      style={{ display: 'none' }}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
