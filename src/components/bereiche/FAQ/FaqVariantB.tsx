import type { EffectiveTokens } from '@/types/supabase';
import { FAQ_DEFAULTS, readItems, renderAnswer } from './shared';
import { FaqHeader, FaqEmpty } from './shared-ui';

/**
 * FAQ Variante B — Karten-Raster
 *
 * Jede Frage als eigene Karte, Antwort direkt sichtbar. Server Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function FaqVariantB({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? FAQ_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? FAQ_DEFAULTS.title;
  const description = (content.description as string) ?? FAQ_DEFAULTS.description;
  const items = readItems(content);

  return (
    <div className="faq faqB-section">
      <FaqHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length === 0 ? (
        <FaqEmpty />
      ) : (
        <div className="faqB-wrap">
          <div className="faqB-grid">
            {items.map((f, i) => (
              <article key={f.id} className="faqB-card">
                <span className="faqB-num">{String(i + 1).padStart(2, '0')}</span>
                <h3
                  className="faqB-q"
                  data-editable={`faq.items.${f.id}.question`}
                  data-edit-type="text"
                >
                  {f.question}
                </h3>
                <div
                  className="faqB-a"
                  data-editable={`faq.items.${f.id}.answer`}
                  data-edit-type="markdown"
                  dangerouslySetInnerHTML={{ __html: renderAnswer(f.answer) }}
                />
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
