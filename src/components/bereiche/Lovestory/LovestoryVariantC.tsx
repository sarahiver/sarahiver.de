import type { EffectiveTokens } from '@/types/supabase';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';
import {
  LOVESTORY_DEFAULTS,
  readEntries,
  renderTitleWithEm,
} from './shared';

/**
 * Lovestory Variante C — Kachel-Karten mit Timeline
 *
 * Vertikale Timeline-Linie mit Markern, kompakte Karten untereinander.
 * Karte = Eyebrow (Datum) + Titel + Beschreibung + Bild unten in der Karte.
 * Skaliert sauber bis 12+ Meilensteine.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function LovestoryVariantC({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? LOVESTORY_DEFAULTS.bc_eyebrow;
  const title = (content.title as string) ?? LOVESTORY_DEFAULTS.bc_title;
  const intro = (content.intro as string) ?? LOVESTORY_DEFAULTS.bc_intro;
  const entries = readEntries(content);

  return (
    <div className="ls lsC" data-style-ls={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
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
      <div className="ls-head-ornament" aria-hidden="true" />
      {intro && (
        <p
          className="ls-intro"
          data-editable="lovestory.intro"
          data-edit-type="text"
        >
          {intro}
        </p>
      )}

      <div className="lsC-wrap">
        <div className="lsC-line" aria-hidden="true" />
        {entries.map((m) => (
          <article key={m.id} className="lsC-item">
            <div className="lsC-card">
              <p
                className="lsC-eyebrow"
                data-editable={`lovestory.${m.id}.when`}
                data-edit-type="text"
              >
                {m.when}
              </p>
              <h3
                className="lsC-title"
                data-editable={`lovestory.${m.id}.title`}
                data-edit-type="text"
              >
                {m.title}
              </h3>
              <p
                className="lsC-desc"
                data-editable={`lovestory.${m.id}.description`}
                data-edit-type="text"
              >
                {m.description}
              </p>
              <div className="lsC-img">
                <img
                  src={m.image_url}
                  alt={m.image_alt ?? m.title}
                  data-editable={`lovestory.${m.id}.image`}
                  data-edit-type="image"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
