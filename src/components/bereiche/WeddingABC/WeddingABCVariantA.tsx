import type { EffectiveTokens } from '@/types/supabase';
import { ABC_DEFAULTS, readEntries, renderText } from './shared';
import { AbcHeader, AbcEmpty } from './shared-ui';

/**
 * Hochzeits-ABC Variante A — Initialen-Liste
 *
 * Großer Anfangsbuchstabe links, Begriff + Text rechts. Durchlaufende
 * Liste (keine Gruppierung) — bei mehreren Einträgen pro Buchstabe wird
 * der Buchstabe bei jedem Eintrag gezeigt. Server Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function WeddingABCVariantA({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? ABC_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? ABC_DEFAULTS.title;
  const description = (content.description as string) ?? ABC_DEFAULTS.description;
  const items = readEntries(content);

  return (
    <div className="abc abcA-section">
      <AbcHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length === 0 ? (
        <AbcEmpty />
      ) : (
        <div className="abcA-wrap">
          <div className="abcA-list">
            {items.map((e) => (
              <div key={e.id} className="abcA-item">
                <p
                  className="abcA-letter"
                  data-editable={`weddingabc.items.${e.id}.letter`}
                  data-edit-type="text"
                >
                  {e.letter}
                </p>
                <div className="abcA-body">
                  <h3
                    className="abcA-term"
                    data-editable={`weddingabc.items.${e.id}.term`}
                    data-edit-type="text"
                  >
                    {e.term}
                  </h3>
                  <div
                    className="abcA-text"
                    data-editable={`weddingabc.items.${e.id}.text`}
                    data-edit-type="markdown"
                    dangerouslySetInnerHTML={{ __html: renderText(e.text) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
