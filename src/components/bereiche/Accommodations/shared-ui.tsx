import { renderTitleWithEm, type Accommodation } from './shared';
import { IconClock, IconTag, IconExt, IconBed } from './icons';

export function AccHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="acc-head">
      {eyebrow && (
        <p className="acc-eyebrow" data-editable="accommodations.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="acc-title"
        data-editable="accommodations.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="acc-head-ornament" aria-hidden="true" />
      {description && (
        <p className="acc-desc" data-editable="accommodations.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Meta-Zeile: Distanz + Preis mit Icons. Leere Felder weglassen.
 */
export function AccMeta({ item, className = '' }: { item: Accommodation; className?: string }) {
  if (!item.distance && !item.price) return null;
  return (
    <div className={`acc-meta${className ? ' ' + className : ''}`}>
      {item.distance && (
        <span className="meta-item">
          <IconClock />
          <span data-editable={`accommodations.items.${item.id}.distance`} data-edit-type="text">
            {item.distance}
          </span>
        </span>
      )}
      {item.price && (
        <span className="meta-item">
          <IconTag />
          <span data-editable={`accommodations.items.${item.id}.price`} data-edit-type="text">
            {item.price}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * Buchungs-Button. Wenn keine URL → null.
 */
export function BookBtn({ item, label = 'Jetzt buchen' }: { item: Accommodation; label?: string }) {
  if (!item.booking_url) return null;
  return (
    <a className="acc-btn" href={item.booking_url} target="_blank" rel="noopener noreferrer">
      {label} <IconExt />
    </a>
  );
}

/**
 * Foto oder Bett-Platzhalter.
 */
export function AccPhoto({
  item,
  placeholder = true,
}: {
  item: Accommodation;
  placeholder?: boolean;
}) {
  if (item.image) {
    return <img className="acc-photo-img" src={item.image} alt={item.name} loading="lazy" />;
  }
  if (!placeholder) return null;
  return (
    <div className="acc-photo-empty">
      <IconBed />
    </div>
  );
}

export function AccEmpty() {
  return (
    <div className="acc-empty">
      <div className="acc-ornament" aria-hidden="true" />
      <span>Unterkunfts-Tipps folgen in Kürze.</span>
    </div>
  );
}
