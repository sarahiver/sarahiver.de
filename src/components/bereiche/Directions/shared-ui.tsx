import { renderTitleWithEm, type DirLocation } from './shared';
import { transitIcon, IconPin } from './icons';

export function DirHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="dir-head">
      {eyebrow && (
        <p className="dir-eyebrow" data-editable="directions.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="dir-title"
        data-editable="directions.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="dir-head-ornament" aria-hidden="true" />
      {description && (
        <p className="dir-desc" data-editable="directions.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

export function DirLabelChip({ loc }: { loc: DirLocation }) {
  if (!loc.label) return null;
  return (
    <span
      className="dir-label-chip"
      data-editable={`directions.items.${loc.id}.label`}
      data-edit-type="text"
    >
      {loc.label}
    </span>
  );
}

export function DirTransit({ loc }: { loc: DirLocation }) {
  if (!loc.transit || loc.transit.length === 0) return null;
  return (
    <div className="dir-transit">
      {loc.transit.map((t, i) => (
        <div key={i} className="dir-transit-item">
          <span className="icon">{transitIcon(t.mode)}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

export function RouteBtn({ loc }: { loc: DirLocation }) {
  if (!loc.maps_url) return null;
  return (
    <a className="dir-btn" href={loc.maps_url} target="_blank" rel="noopener noreferrer">
      <IconPin />
      <span>Route planen</span>
    </a>
  );
}

/**
 * Map-iframe-Shell. Key-frei (Embed-URL). Wenn keine URL → Platzhalter.
 */
export function MapFrame({
  loc,
  className = '',
}: {
  loc: DirLocation;
  className?: string;
}) {
  return (
    <div className={`dir-mapframe ${className}`} aria-label={`Karte ${loc.name}`}>
      {loc.maps_embed ? (
        <iframe
          src={loc.maps_embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          title={`Karte ${loc.name}`}
        />
      ) : (
        <div className="dir-map-missing">Karte fehlt</div>
      )}
    </div>
  );
}

export function DirEmpty() {
  return (
    <div className="dir-empty">
      <div className="dir-ornament" aria-hidden="true" />
      <span>Die Anfahrt geben wir euch in Kürze bekannt.</span>
    </div>
  );
}
