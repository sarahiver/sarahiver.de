import type { EffectiveTokens } from '@/types/supabase';
import { formatLongDateDE } from '@/lib/date-format';
import DecorationAurora from '@/components/decoration/DecorationAurora';
import DecorationStars from '@/components/decoration/DecorationStars';
import DecorationGrain from '@/components/decoration/DecorationGrain';
import DecorationMarquee from '@/components/decoration/DecorationMarquee';
import DecorationGoo from '@/components/decoration/DecorationGoo';
import DecorationKineticBg from '@/components/decoration/DecorationKineticBg';
import DecorationBauhausShapes from '@/components/decoration/DecorationBauhausShapes';

/**
 * Hero Variante C — Full Bleed Magazine / Cinematic / Inverted
 *
 * Bild flutet die ganze Sektion. Text als Overlay, meist mit Vignette.
 *
 * Editor-Felder:
 *   - eyebrow (immer)
 *   - volume (optional, oben rechts — Default: "Vol. I · MMXXVI")
 */

interface HeroVariantCProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantC({ tokens, content }: HeroVariantCProps) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';

  const eyebrow = (content.eyebrow as string) ?? 'Save the Date';
  const volume = (content.volume as string) ?? 'Vol. I · MMXXVI';
  const dateLong = formatLongDateDE(tokens.wedding_date);
  const shortDate = formatShortDateDE(tokens.wedding_date);
  const venue = tokens.wedding_location ?? '';
  const coupleNames = `${tokens.couple_name_1} & ${tokens.couple_name_2}`;

  return (
    <div className="hero-c" data-style-hero={style}>
      {/* === Background-Bild (für die meisten Stile) === */}
      {style !== 'bauhaus' && style !== 'kinetic' && tokens.hero_image_url && (
        <div
          className="hero-c-image"
          aria-label={coupleNames}
          role="img"
          data-editable="hero.image"
          data-edit-type="image"
        />
      )}

      {/* === Bauhaus + Kinetic: kein Background-Bild, dafür Compositions === */}
      {style === 'bauhaus' && (
        <>
          <DecorationBauhausShapes />
          {tokens.hero_image_url && (
            <div
              className="hero-c-bauhaus-img"
              aria-label={coupleNames}
              role="img"
              data-editable="hero.image"
              data-edit-type="image"
            />
          )}
        </>
      )}

      {style === 'kinetic' && (
        <>
          <DecorationKineticBg text={`${coupleNames} · ${shortDate}`} />
          {tokens.hero_image_url && (
            <div
              className="hero-c-kinetic-img"
              aria-label={coupleNames}
              role="img"
              data-editable="hero.image"
              data-edit-type="image"
            />
          )}
        </>
      )}

      {/* === Stil-spezifische Overlay-Schichten === */}
      {style === 'editorial' && <div className="hero-c-vignette" aria-hidden="true" />}
      {style === 'mono' && <div className="hero-c-vignette" aria-hidden="true" />}
      {style === 'opulent' && (
        <>
          <div className="hero-c-vignette" aria-hidden="true" />
          <DecorationAurora blendMode="screen" intensity="strong" />
          <DecorationStars />
        </>
      )}
      {style === 'organic' && (
        <>
          <DecorationGoo intensity="soft" />
          <DecorationGrain intensity="soft" />
        </>
      )}
      {style === 'liquefy' && (
        <div className="hero-c-liquefy-overlay" aria-hidden="true" />
      )}

      {/* === Brutalist: Counter-Marquees oben + unten === */}
      {style === 'brutalist' && (
        <>
          <div className="hero-c-brutalist-marquee-top">
            <DecorationMarquee
              text="★ Save the Date"
              speed={18}
              fontSize="11px"
            />
          </div>
          <div className="hero-c-brutalist-marquee-bot">
            <DecorationMarquee
              text={`· ${shortDate} · ${venue || 'Hamburg'}`}
              direction="reverse"
              speed={24}
              fontSize="11px"
            />
          </div>
        </>
      )}

      {/* === Content === */}
      <div className="hero-c-content">
        <div className="hero-c-top">
          <p
            className="hero-c-eyebrow"
            data-editable="hero.eyebrow"
            data-edit-type="text"
          >
            {eyebrow}
          </p>
          <p
            className="hero-c-volume"
            data-editable="hero.volume"
            data-edit-type="text"
          >
            {volume}
          </p>
        </div>

        <div className="hero-c-mid">
          <h1
            className="hero-c-title display"
            data-editable="hero.couple_names"
            data-edit-type="text"
          >
            {tokens.couple_name_1} <em className="amp">&amp;</em> {tokens.couple_name_2}
          </h1>
        </div>

        <div className="hero-c-bot">
          <p
            className="hero-c-date"
            data-editable="hero.date"
            data-edit-type="date"
          >
            {dateLong}
          </p>
          {venue && (
            <p
              className="hero-c-venue"
              data-editable="hero.location"
              data-edit-type="text"
            >
              {venue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatShortDateDE(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return '';
  }
}
