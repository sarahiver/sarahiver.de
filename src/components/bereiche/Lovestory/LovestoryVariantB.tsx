import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';
import {
  LOVESTORY_DEFAULTS,
  readEntries,
  renderTitleWithEm,
} from './shared';

/**
 * Lovestory Variante B — Versetztes Raster mit großen Nummern
 *
 * Alle Meilensteine, zweispaltig alternierend (Bild-links/Text-rechts,
 * Bild-rechts/Text-links). Große Outline-Nummern als typografische Anker.
 * Datum als Pill-Badge auf dem Bild.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function LovestoryVariantB({ tokens, content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? LOVESTORY_DEFAULTS.bc_eyebrow;
  const title = (content.title as string) ?? LOVESTORY_DEFAULTS.bc_title;
  const intro = (content.intro as string) ?? LOVESTORY_DEFAULTS.bc_intro;
  const entries = readEntries(content);

  return (
    <div className="ls lsB">
      <p
        className="ls-eyebrow"
        data-editable="lovestory.eyebrow"
        data-edit-type="text"
      >
        {eyebrow}
      </p>
      <h2
        className="ls-title"
        data-editable="lovestory.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="ls-head-decor-wrap">
        <Decor />
      </div>
      {intro && (
        <p
          className="ls-intro"
          data-editable="lovestory.intro"
          data-edit-type="text"
        >
          {intro}
        </p>
      )}

      <div className="lsB-list">
        {entries.map((m, i) => {
          const num = String(i + 1).padStart(2, '0');
          return (
            <article key={m.id} className="lsB-item">
              <div className="lsB-img-wrap">
                <span
                  className="lsB-date"
                  data-editable={`lovestory.${m.id}.when`}
                  data-edit-type="text"
                >
                  {m.when}
                </span>
                <img
                  src={m.image_url}
                  alt={m.image_alt ?? m.title}
                  data-editable={`lovestory.${m.id}.image`}
                  data-edit-type="image"
                />
              </div>
              <div className="lsB-text">
                <div className="lsB-num" aria-hidden="true">
                  {num}
                </div>
                <h3
                  className="lsB-title"
                  data-editable={`lovestory.${m.id}.title`}
                  data-edit-type="text"
                >
                  {m.title}
                </h3>
                <p
                  className="lsB-desc"
                  data-editable={`lovestory.${m.id}.description`}
                  data-edit-type="text"
                >
                  {m.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
