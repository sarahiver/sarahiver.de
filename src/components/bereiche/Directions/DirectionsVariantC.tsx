import type { EffectiveTokens } from '@/types/supabase';
import { DIR_DEFAULTS, readLocations, renderDesc } from './shared';
import { DirHeader, DirLabelChip, DirTransit, RouteBtn, MapFrame, DirEmpty } from './shared-ui';

/**
 * Anfahrt Variante C — Karten-Stapel, je eigene Map
 *
 * Pro Location ein zweispaltiger Block, gestapelt. Seiten alternieren
 * via CSS :nth-child(even). Jede Location hat ihre eigene Karte — ideal
 * wenn Orte weit auseinanderliegen. Server Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function DirectionsVariantC({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? DIR_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? DIR_DEFAULTS.title;
  const description = (content.description as string) ?? DIR_DEFAULTS.description;
  const items = readLocations(content);

  if (items.length === 0) {
    return (
      <div className="dir dirC-section">
        <DirHeader eyebrow={eyebrow} title={title} description={description} />
        <DirEmpty />
      </div>
    );
  }

  return (
    <div className="dir dirC-section">
      <DirHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="dirC-wrap">
        {items.map((loc) => (
          <article key={loc.id} className="dirC-block" data-id={loc.id}>
            <div className="dirC-text">
              <DirLabelChip loc={loc} />
              <h3
                className="dir-name"
                data-editable={`directions.items.${loc.id}.name`}
                data-edit-type="text"
              >
                {loc.name}
              </h3>
              <p
                className="dir-address"
                data-editable={`directions.items.${loc.id}.address`}
                data-edit-type="text"
              >
                {loc.address}
              </p>
              {loc.description && (
                <div
                  className="dir-description"
                  data-editable={`directions.items.${loc.id}.description`}
                  data-edit-type="markdown"
                  dangerouslySetInnerHTML={{ __html: renderDesc(loc.description) }}
                />
              )}
              <DirTransit loc={loc} />
              <RouteBtn loc={loc} />
            </div>
            <MapFrame loc={loc} className="dirC-mapwrap" />
          </article>
        ))}
      </div>
    </div>
  );
}
