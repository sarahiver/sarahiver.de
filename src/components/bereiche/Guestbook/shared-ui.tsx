import { renderTitleWithEm } from './shared';
import { IconHeart, IconInfo } from './icons';

export function GbHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="gb-head">
      {eyebrow && (
        <p className="gb-eyebrow" data-editable="guestbook.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="gb-title"
        data-editable="guestbook.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="gb-head-ornament" aria-hidden="true" />
      {description && (
        <p className="gb-desc" data-editable="guestbook.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

export function GbSuccess({
  message,
  sub,
  onReset,
}: {
  message: string;
  sub: string;
  onReset: () => void;
}) {
  return (
    <div className="gb-success">
      <div className="gb-success-icon">
        <IconHeart />
      </div>
      <h3
        className="gb-success-title"
        data-editable="guestbook.success_message"
        data-edit-type="text"
      >
        {message}
      </h3>
      {sub && <p className="gb-success-sub">{sub}</p>}
      <button type="button" className="gb-success-link" onClick={onReset}>
        Weiteren Eintrag schreiben
      </button>
    </div>
  );
}

export function GbModHint({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="gb-mod-hint">
      <IconInfo />
      <span>{text}</span>
    </div>
  );
}

export function GbError({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="gb-error">{msg}</p>;
}

export function GbEmpty() {
  return (
    <div className="gb-empty">
      <div className="gb-ornament" aria-hidden="true" />
      <span>Seid die Ersten, die ein paar Worte hinterlassen!</span>
    </div>
  );
}
