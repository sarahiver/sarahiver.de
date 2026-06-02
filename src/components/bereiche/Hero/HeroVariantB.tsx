import type { EffectiveTokens } from '@/types/supabase';
import { formatLongDateDE } from '@/lib/date-format';
import DecorationGoo from '@/components/decoration/DecorationGoo';
import DecorationAurora from '@/components/decoration/DecorationAurora';
import DecorationStars from '@/components/decoration/DecorationStars';
import DecorationGrain from '@/components/decoration/DecorationGrain';
import DecorationBauhausShapes from '@/components/decoration/DecorationBauhausShapes';
import DecorationKineticBg from '@/components/decoration/DecorationKineticBg';
import DecorationLiquefyBlob from '@/components/decoration/DecorationLiquefyBlob';

/**
 * Hero Variante B — Split Editorial / Documentary / Asymmetric
 *
 * Zwei Spalten: Text auf einer Seite, Bild auf der anderen.
 * Jeder Stil interpretiert das in seiner eigenen Sprache.
 *
 * Editor-Felder:
 *   - eyebrow (immer)
 *   - intro (optional, im Text-Block sichtbar)
 *   - caption (optional, nur für Mono + Editorial — Photo-Caption-Style)
 *
 * Wenn caption leer ist, generieren Mono+Editorial einen sinnvollen Default
 * aus den Couple-Namen + Location.
 */

interface HeroVariantBProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantB({ tokens, content }: HeroVariantBProps) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';

  const eyebrow = (content.eyebrow as string) ?? 'Wir heiraten';
  const dateLong = formatLongDateDE(tokens.wedding_date);
  const intro = (content.intro as string) ?? '';
  const venue = tokens.wedding_location ?? '';
  const coupleNames = `${tokens.couple_name_1} & ${tokens.couple_name_2}`;
  const customCaption = (content.caption as string) ?? '';

  // Default-Caption-Texte falls leer (Stil-spezifisch)
  const defaultCaptionMono = `fig. 01 · ${tokens.couple_name_1.toLowerCase()} & ${tokens.couple_name_2.toLowerCase()}`;
  const defaultCaptionEditorial = `Pl. 01 · ${tokens.couple_name_1[0]} & ${tokens.couple_name_2[0]}`;

  return (
    <div className="hero-b" data-style-hero={style}>
      {/* Stil-spezifische BG-Decorations (auf der Text-Seite oder global) */}
      {style === 'editorial' && <DecorationGrain intensity="soft" />}
      {style === 'organic' && <DecorationGoo intensity="soft" />}
      {style === 'opulent' && <DecorationAurora />}
      {style === 'kinetic' && (
        <DecorationKineticBg text={`${coupleNames} · ${venue || 'Hamburg'}`} rotation={-15} />
      )}
      {style === 'bauhaus' && <DecorationBauhausShapes shapes={['circle', 'rect']} />}

      {/* === LINKS: Text === */}
      <div className="hero-b-text">
        <p
          className="hero-b-eyebrow"
          data-editable="hero.eyebrow"
          data-edit-type="text"
        >
          {eyebrow}
        </p>

        <h1
          className="hero-b-title display"
          data-editable="hero.couple_names"
          data-edit-type="text"
        >
          {tokens.couple_name_1}<br />
          <em className="amp">&amp;</em> {tokens.couple_name_2}
        </h1>

        <div className="hero-b-rule" aria-hidden="true" />

        <div className="hero-b-meta">
          <p
            className="hero-b-date"
            data-editable="hero.date"
            data-edit-type="date"
          >
            {dateLong}
          </p>
          {venue && (
            <p
              className="hero-b-venue"
              data-editable="hero.location"
              data-edit-type="text"
            >
              {venue}
            </p>
          )}
        </div>

        {intro && (
          <p
            className="hero-b-intro"
            data-editable="hero.intro"
            data-edit-type="text"
          >
            {intro}
          </p>
        )}

        {/* Stars nach dem Text bei Opulent, damit's nicht hinter Text liegt */}
        {style === 'opulent' && <DecorationStars density="sparse" />}
      </div>

      {/* === RECHTS: Bild === */}
      <div className="hero-b-image-col">
        {style === 'liquefy' ? (
          <DecorationLiquefyBlob size="lg" shape="circle">
            <div
              className="hero-b-liquefy-img"
              aria-label={coupleNames}
              role="img"
              data-editable="hero.image"
              data-edit-type="image"
            />
          </DecorationLiquefyBlob>
        ) : (
          <>
            {tokens.hero_image_url && (
              <div
                className="hero-b-image"
                aria-label={coupleNames}
                role="img"
                data-editable="hero.image"
                data-edit-type="image"
              />
            )}
            {/* Stil-spezifische Overlay-Captions */}
            {style === 'mono' && (
              <div
                className="hero-b-image-caption"
                data-editable="hero.caption"
                data-edit-type="text"
              >
                {customCaption ? (
                  <span>{customCaption}</span>
                ) : (
                  <>
                    <span>{defaultCaptionMono}</span>
                    <span>{venue || 'Hamburg'}</span>
                  </>
                )}
              </div>
            )}
            {style === 'editorial' && (
              <div
                className="hero-b-image-caption"
                data-editable="hero.caption"
                data-edit-type="text"
              >
                {customCaption || defaultCaptionEditorial}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
