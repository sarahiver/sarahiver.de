import type { EffectiveTokens } from '@/types/supabase';
import { ACC_DEFAULTS, readItems, renderDesc } from './shared';
import { AccHeader, AccMeta, BookBtn, AccPhoto, AccEmpty } from './shared-ui';
import { CopyCode } from './CopyCode';

/**
 * Übernachtung Variante A — Foto-Karten (Bild oben, Details unten)
 *
 * Raster 3 Spalten (2 bei 2 Hotels, zentrierte Einzelkarte bei 1).
 * Server Component; Copy-Code-Badge ist eine Client-Insel.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function AccommodationsVariantA({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? ACC_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? ACC_DEFAULTS.title;
  const description = (content.description as string) ?? ACC_DEFAULTS.description;
  const items = readItems(content);

  const gridCls =
    items.length === 1 ? ' is-one' : items.length === 2 ? ' is-two' : '';

  return (
    <div className="acc accA-section">
      <AccHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length === 0 ? (
        <AccEmpty />
      ) : (
        <div className="accA-wrap">
          <div className={`accA-grid${gridCls}`}>
            {items.map((h) => (
              <article key={h.id} className="accA-card">
                <div className="accA-photo">
                  <AccPhoto item={h} />
                </div>
                <div className="accA-body">
                  <h3
                    className="accA-name"
                    data-editable={`accommodations.items.${h.id}.name`}
                    data-edit-type="text"
                  >
                    {h.name}
                  </h3>
                  <AccMeta item={h} />
                  {h.description && (
                    <div
                      className="accA-desc"
                      data-editable={`accommodations.items.${h.id}.description`}
                      data-edit-type="markdown"
                      dangerouslySetInnerHTML={{ __html: renderDesc(h.description) }}
                    />
                  )}
                  <div className="accA-footer">
                    {h.booking_code && <CopyCode code={h.booking_code} id={h.id} />}
                    <BookBtn item={h} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
