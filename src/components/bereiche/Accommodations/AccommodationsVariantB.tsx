import type { EffectiveTokens } from '@/types/supabase';
import { ACC_DEFAULTS, readItems, renderDesc } from './shared';
import { AccHeader, AccMeta, BookBtn, AccPhoto, AccEmpty } from './shared-ui';
import { CopyCode } from './CopyCode';

/**
 * Übernachtung Variante B — Horizontale Listen-Einträge (Foto seitlich)
 *
 * Foto links (120px), Mitte Name + Beschreibung (2-Zeilen-Clamp) + Meta,
 * rechts Code-Badge + Button. Funktioniert auch ohne Foto.
 * Server Component; Copy-Code-Badge ist Client-Insel.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function AccommodationsVariantB({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? ACC_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? ACC_DEFAULTS.title;
  const description = (content.description as string) ?? ACC_DEFAULTS.description;
  const items = readItems(content);

  return (
    <div className="acc accB-section">
      <AccHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length === 0 ? (
        <AccEmpty />
      ) : (
        <div className="accB-wrap">
          <div className="accB-list">
            {items.map((h) => (
              <article key={h.id} className={`accB-item ${h.image ? '' : 'no-photo'}`}>
                {h.image && (
                  <div className="accB-photo">
                    <AccPhoto item={h} placeholder={false} />
                  </div>
                )}
                <div className="accB-body">
                  <h3
                    className="accB-name"
                    data-editable={`accommodations.items.${h.id}.name`}
                    data-edit-type="text"
                  >
                    {h.name}
                  </h3>
                  {h.description && (
                    <p
                      className="accB-desc"
                      data-editable={`accommodations.items.${h.id}.description`}
                      data-edit-type="markdown"
                      dangerouslySetInnerHTML={{
                        __html: renderDesc(h.description).replace(/<\/?p>/g, ''),
                      }}
                    />
                  )}
                  <AccMeta item={h} className="accB-metaRow" />
                </div>
                <div className="accB-cta">
                  {h.booking_code && <CopyCode code={h.booking_code} id={h.id} />}
                  <BookBtn item={h} />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
