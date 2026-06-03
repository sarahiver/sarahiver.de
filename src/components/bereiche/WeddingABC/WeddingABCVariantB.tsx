import type { EffectiveTokens } from '@/types/supabase';
import { ABC_DEFAULTS, readEntries, renderText } from './shared';
import { AbcHeader, AbcEmpty } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Hochzeits-ABC Variante B — Karten-Raster mit Buchstaben-Badge
 *
 * Jeder Begriff eine Karte mit rundem Buchstaben-Badge oben. Server Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function WeddingABCVariantB({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? ABC_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? ABC_DEFAULTS.title;
  const description = (content.description as string) ?? ABC_DEFAULTS.description;
  const items = readEntries(content);

  return (
    <div className="abc abcB-section" data-style-abc={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <AbcHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length === 0 ? (
        <AbcEmpty />
      ) : (
        <div className="abcB-wrap">
          <div className="abcB-grid">
            {items.map((e) => (
              <article key={e.id} className="abcB-card">
                <div
                  className="abcB-badge"
                  data-editable={`weddingabc.items.${e.id}.letter`}
                  data-edit-type="text"
                >
                  {e.letter}
                </div>
                <h3
                  className="abcB-term"
                  data-editable={`weddingabc.items.${e.id}.term`}
                  data-edit-type="text"
                >
                  {e.term}
                </h3>
                <div
                  className="abcB-text"
                  data-editable={`weddingabc.items.${e.id}.text`}
                  data-edit-type="markdown"
                  dangerouslySetInnerHTML={{ __html: renderText(e.text) }}
                />
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
