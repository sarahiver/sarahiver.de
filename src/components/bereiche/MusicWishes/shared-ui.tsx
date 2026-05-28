import Decor from '@/components/ui/Decor';
import { renderTitleWithEm } from './shared';
import { IconCheck } from './icons';

export function MwHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mw-head">
      {eyebrow && (
        <p className="mw-eyebrow" data-editable="musicwishes.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="mw-title"
        data-editable="musicwishes.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="mw-head-decor-wrap">
        <Decor />
      </div>
      {description && (
        <p className="mw-desc" data-editable="musicwishes.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

export function MwSuccessStrip({
  message,
  sub,
}: {
  message: string;
  sub: string;
}) {
  return (
    <div className="mw-success">
      <div className="mw-success-icon">
        <IconCheck />
      </div>
      <div className="mw-success-body">
        <p className="mw-success-title" data-editable="musicwishes.success_message" data-edit-type="text">
          {message}
        </p>
        {sub && <p className="mw-success-sub">{sub}</p>}
      </div>
    </div>
  );
}

export function MwError({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="mw-error">{msg}</p>;
}

export function MwDuplicateHint() {
  return <p className="mw-dup-hint">Steht schon auf der Liste 🎉 — wir notieren es trotzdem.</p>;
}

export function MwEmpty() {
  return (
    <div className="mw-empty">
      <Decor />
      <span>Noch keine Wünsche — macht den Anfang!</span>
    </div>
  );
}
