import type { EffectiveTokens } from '@/types/supabase';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';
import {
  LOVESTORY_DEFAULTS,
  readImagesA,
  renderTitleWithEm,
} from './shared';

/**
 * Lovestory Variante A — Editorial-Stapel
 *
 * EIN bewusst gewählter Moment als emotionaler Anker — 3 gestapelte Bilder
 * links, Text rechts. B und C erzählen die ganze Geschichte; A ist der
 * Kontrast: still, persönlich, ein einzelnes Foto-Cluster.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function LovestoryVariantA({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? LOVESTORY_DEFAULTS.a_eyebrow;
  const title = (content.title as string) ?? LOVESTORY_DEFAULTS.a_title;
  const when = (content.when as string) ?? LOVESTORY_DEFAULTS.a_when;
  const momentTitle =
    (content.moment_title as string) ?? LOVESTORY_DEFAULTS.a_moment_title;
  const description =
    (content.description as string) ?? LOVESTORY_DEFAULTS.a_description;
  const signature =
    (content.signature as string) ?? LOVESTORY_DEFAULTS.a_signature;
  const images = readImagesA(content);

  return (
    <div className="ls lsA" data-style-ls={style}>
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

      <div className="lsA-single">
        <div className="lsA-images">
          {images.slice(0, 3).map((src, idx) => (
            <div key={idx} className={`lsA-img lsA-img--${idx + 1}`}>
              <img
                src={src}
                alt={momentTitle}
                data-editable={`lovestory.image_${idx + 1}`}
                data-edit-type="image"
              />
            </div>
          ))}
        </div>
        <div className="lsA-text">
          <p
            className="lsA-eyebrow"
            data-editable="lovestory.when"
            data-edit-type="text"
          >
            {when}
          </p>
          <h3
            className="lsA-moment-title"
            data-editable="lovestory.moment_title"
            data-edit-type="text"
          >
            {momentTitle}
          </h3>
          <p
            className="lsA-desc"
            data-editable="lovestory.description"
            data-edit-type="text"
          >
            {description}
          </p>
          <div
            className="lsA-sig"
            data-editable="lovestory.signature"
            data-edit-type="text"
          >
            {signature}
          </div>
        </div>
      </div>
    </div>
  );
}
