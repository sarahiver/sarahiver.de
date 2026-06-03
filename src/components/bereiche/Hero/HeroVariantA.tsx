import type { EffectiveTokens } from '@/types/supabase';
import { formatLongDateDE } from '@/lib/date-format';
import DecorationBauhausShapes from '@/components/decoration/DecorationBauhausShapes';
import DecorationMarquee from '@/components/decoration/DecorationMarquee';
import DecorationKineticBg from '@/components/decoration/DecorationKineticBg';
import DecorationLiquefyBlob from '@/components/decoration/DecorationLiquefyBlob';

/**
 * Hero Variante A — Centered Statement / Bento-Cover / Marquee
 *
 * Design System v2:
 *   Ein gemeinsames Skelett, das pro Stil komplett anders rendert.
 *   Die schwere Arbeit machen CSS-Selektoren `.hero-a[data-style-hero="..."]`
 *   in globals.css. Diese Komponente liefert nur Content + Decorations.
 */

interface HeroVariantAProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantA({ tokens, content }: HeroVariantAProps) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';

  const eyebrow = (content.eyebrow as string) ?? 'Save the date';
  const dateLong = formatLongDateDE(tokens.wedding_date);
  const coupleNames = `${tokens.couple_name_1} & ${tokens.couple_name_2}`;
  const venue = tokens.wedding_location ?? '';
  const shortDate = formatShortDateDE(tokens.wedding_date);

  return (
    <div className="hero-a" data-style-hero={style}>
      {/* === Stil-spezifische Backgrounds === */}

      {style === 'kinetic' && (
        <DecorationKineticBg
          text={`${coupleNames} · ${shortDate} · ${venue || 'Hamburg'}`}
        />
      )}
      {style === 'bauhaus' && <DecorationBauhausShapes />}

      {/* === Hero-Image (für Brutalist + Kinetic + Bauhaus + Mono + Editorial + Opulent als BG-Image) === */}
      {style !== 'liquefy' && tokens.hero_image_url && (
        <div
          className="hero-a-image"
          aria-label={coupleNames}
          role="img"
          data-editable="hero.image"
          data-edit-type="image"
        />
      )}

      {/* === Liquefy-Spezial: Bild im Acid-Melt-Container === */}
      {style === 'liquefy' && tokens.hero_image_url && (
        <div className="hero-a-liquefy-wrap">
          <DecorationLiquefyBlob size="lg" shape="circle">
            <div
              className="hero-a-liquefy-img"
              aria-label={coupleNames}
              role="img"
              data-editable="hero.image"
              data-edit-type="image"
            />
          </DecorationLiquefyBlob>
        </div>
      )}

      {/* === Brutalist-Spezial: Marquee als Hauptkomposition === */}
      {style === 'brutalist' && (
        <DecorationMarquee
          text={coupleNames}
          tilt="3d"
          fontSize="clamp(80px, 14vw, 200px)"
          className="hero-a-brutalist-marquee"
        />
      )}

      {/* === Content === */}
      <div className="hero-a-content">
        <p
          className="hero-a-eyebrow"
          data-editable="hero.eyebrow"
          data-edit-type="text"
        >
          {eyebrow}
        </p>

        <h1
          className="hero-a-title display"
          data-editable="hero.couple_names"
          data-edit-type="text"
        >
          {tokens.couple_name_1}{' '}
          <em className="amp">&amp;</em>{' '}
          {tokens.couple_name_2}
        </h1>

        <p
          className="hero-a-date"
          data-editable="hero.date"
          data-edit-type="date"
        >
          {dateLong}
        </p>

        {venue && (
          <p
            className="hero-a-location"
            data-editable="hero.location"
            data-edit-type="text"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
              className="hero-a-location-icon"
            >
              <path d="M6 11c2.5-3 4-5 4-7a4 4 0 0 0-8 0c0 2 1.5 4 4 7z" />
              <circle cx="6" cy="4" r="1.4" />
            </svg>
            {venue}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Helper: Kurz-Datum (z.B. "12.07.2026") für Kinetic-Marquee-Text.
 */
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
