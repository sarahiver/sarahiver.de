import { renderTitleWithEm } from './shared';

/**
 * Geteilter FAQ-Header — Eyebrow, Titel, Decor, Description.
 */
export function FaqHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="faq-head">
      {eyebrow && (
        <p className="faq-eyebrow" data-editable="faq.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="faq-title"
        data-editable="faq.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="faq-head-ornament" aria-hidden="true" />
      {description && (
        <p className="faq-desc" data-editable="faq.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Empty-State.
 */
export function FaqEmpty() {
  return (
    <div className="faq-empty">
      <div className="faq-ornament" aria-hidden="true" />
      <span>Hier sammeln wir bald die häufigsten Fragen.</span>
    </div>
  );
}
