import type { EffectiveTokens } from '@/types/supabase';
import { ABC_DEFAULTS, readEntries, renderText } from './shared';
import { AbcHeader, AbcEmpty } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

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

export default function WeddingABCVariantA({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? ABC_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? ABC_DEFAULTS.title;
  const description = (content.description as string) ?? ABC_DEFAULTS.description;
  const items = readEntries(content);

  return (
    <div className="abc abcA-section" data-style-abc={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
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
