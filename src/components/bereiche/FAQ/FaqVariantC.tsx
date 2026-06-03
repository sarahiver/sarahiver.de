import type { EffectiveTokens } from '@/types/supabase';
import { FAQ_DEFAULTS, readItems, renderAnswer } from './shared';
import { FaqHeader, FaqEmpty } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * FAQ Variante C — Zweispaltig editorial
 *
 * Frage links (mit laufender Nummer), Antwort rechts. Alles offen.
 * Server Component. Frage-Spalte ist sticky beim Scrollen (CSS).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function FaqVariantC({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? FAQ_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? FAQ_DEFAULTS.title;
  const description = (content.description as string) ?? FAQ_DEFAULTS.description;
  const items = readItems(content);

  return (
    <div className="faq faqC-section" data-style-faq={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <FaqHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length === 0 ? (
        <FaqEmpty />
      ) : (
        <div className="faqC-wrap">
          <div className="faqC-list">
            {items.map((f, i) => (
              <div key={f.id} className="faqC-item">
                <div className="faqC-q-col">
                  <span className="faqC-num">№ {String(i + 1).padStart(2, '0')}</span>
                  <h3
                    className="faqC-q"
                    data-editable={`faq.items.${f.id}.question`}
                    data-edit-type="text"
                  >
                    {f.question}
                  </h3>
                </div>
                <div
                  className="faqC-a"
                  data-editable={`faq.items.${f.id}.answer`}
                  data-edit-type="markdown"
                  dangerouslySetInnerHTML={{ __html: renderAnswer(f.answer) }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
