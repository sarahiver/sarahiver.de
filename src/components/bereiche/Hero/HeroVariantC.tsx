import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';

/**
 * Hero Variante C — "Polaroid Editorial"
 *
 * Name riesig links/rechts (je Alignment), zwei Polaroids als Stack
 * eingeklebt. Pro Stil:
 *   - klassisch: leichte Rotation
 *   - modern: keine Rotation, schärfere Kanten
 *   - floral: stärkere Rotation + Eck-Blumen
 *   - festlich: goldener Polaroid-Rahmen
 *   - minimal: hairline frames, keine Rotation
 *
 * Datum als Mono-Stempel (z.B. "SA · 27 · 06 · 2026").
 */

interface HeroVariantCProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantC({ tokens, content }: HeroVariantCProps) {
  const eyebrow = (content.eyebrow as string) ?? 'Save the date — sarahiver.de';

  // Datum als Stempel-Format: "SA · 27 · 06 · 2026"
  const dateObj = new Date(tokens.wedding_date);
  const weekdayShort = dateObj.toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase().replace('.', '');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const dateStamp = `${weekdayShort} · ${day} · ${month} · ${year}`;

  // Style-Hint für Polaroid-Anpassungen
  const styleHint = (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'klassisch';

  // Optional: Zweites Polaroid-Bild (Backwards-kompatibel)
  const image1 = tokens.hero_image_url;
  const image2 = (content.image_2 as string) ?? image1; // Falls nur 1 Bild da ist, beides gleich

  // Padding und Gap je Stil
  const padding =
    styleHint === 'festlich'
      ? 'clamp(22px, 4vw, 48px)'
      : styleHint === 'modern'
      ? 'clamp(36px, 6vw, 80px)'
      : styleHint === 'minimal'
      ? 'clamp(40px, 7vw, 88px)'
      : 'clamp(28px, 5vw, 64px)';

  const gap =
    styleHint === 'festlich'
      ? 'clamp(24px, 4vw, 56px)'
      : styleHint === 'modern'
      ? 'clamp(40px, 6vw, 96px)'
      : styleHint === 'minimal'
      ? 'clamp(48px, 7vw, 112px)'
      : 'clamp(28px, 5vw, 72px)';

  const gridCols =
    styleHint === 'modern'
      ? 'minmax(0, 0.9fr) minmax(0, 1.1fr)'
      : styleHint === 'minimal'
      ? 'minmax(0, 0.95fr) minmax(0, 1.05fr)'
      : 'minmax(0, 0.85fr) minmax(0, 1.15fr)';

  // Polaroid rotation/style per Stil
  const polaroid1Rotation =
    styleHint === 'klassisch'
      ? 'rotate(-4deg)'
      : styleHint === 'floral'
      ? 'rotate(-7deg)'
      : styleHint === 'festlich'
      ? 'rotate(-3deg)'
      : styleHint === 'modern' || styleHint === 'minimal'
      ? 'none'
      : 'rotate(-5deg)';

  const polaroid2Rotation =
    styleHint === 'klassisch'
      ? 'rotate(3deg)'
      : styleHint === 'floral'
      ? 'rotate(6deg)'
      : styleHint === 'festlich'
      ? 'rotate(2deg)'
      : styleHint === 'modern' || styleHint === 'minimal'
      ? 'none'
      : 'rotate(4deg)';

  // Polaroid-Container styling
  const polaroidBase: React.CSSProperties = {
    position: 'absolute',
    width: '58%',
    background: styleHint === 'minimal' ? 'transparent' : '#fff',
    padding: styleHint === 'minimal' ? 0 : styleHint === 'modern' ? '8px 8px 10px' : '10px 10px 14px',
    borderRadius: styleHint === 'modern' ? 8 : styleHint === 'minimal' ? 0 : 4,
    boxShadow:
      styleHint === 'minimal'
        ? 'none'
        : styleHint === 'modern'
        ? '0 20px 40px -16px rgba(20,16,12,0.18)'
        : '0 12px 32px -8px rgba(20,16,12,0.18), 0 22px 60px -20px rgba(20,16,12,0.22)',
    border: styleHint === 'minimal' ? '1px solid var(--border)' : styleHint === 'festlich' ? '2px solid var(--gold)' : 'none',
  };

  const imageFallbackStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '3 / 4',
    background:
      'radial-gradient(ellipse at 30% 30%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 60%), linear-gradient(135deg, var(--bg-soft), var(--accent))',
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 600,
        padding,
        background: 'var(--bg)',
        color: 'var(--ink)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap,
        alignItems: 'center',
      }}
    >
      {/* Floral-only: Eck-Blumen */}
      {styleHint === 'floral' && (
        <>
          <svg
            width="120"
            height="120"
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              color: 'var(--accent)',
              opacity: 0.7,
            }}
          >
            <path d="M40 76 Q 40 50, 38 22" />
            <path d="M38 58 Q 22 54, 14 44 M38 58 Q 26 64, 22 50" />
            <path d="M39 40 Q 56 36, 64 24 M39 40 Q 54 46, 60 32" />
            <circle cx="38" cy="22" r="2.5" fill="currentColor" />
          </svg>
          <svg
            width="120"
            height="120"
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              color: 'var(--accent)',
              opacity: 0.7,
              transform: 'rotate(180deg)',
            }}
          >
            <path d="M40 76 Q 40 50, 38 22" />
            <path d="M38 58 Q 22 54, 14 44 M38 58 Q 26 64, 22 50" />
            <path d="M39 40 Q 56 36, 64 24 M39 40 Q 54 46, 60 32" />
            <circle cx="38" cy="22" r="2.5" fill="currentColor" />
          </svg>
        </>
      )}

      {/* LINKS: 2 Polaroids als Stack */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 5',
          maxWidth: '100%',
        }}
      >
        {/* Polaroid 1 (oben links) */}
        <div
          style={{
            ...polaroidBase,
            top: 0,
            left: 0,
            transform: polaroid1Rotation,
            zIndex: 2,
          }}
        >
          {image1 ? (
            <img
              src={image1}
              alt={`Polaroid ${tokens.couple_name_1} und ${tokens.couple_name_2} — eins`}
              loading="eager"
              data-editable="hero.image"
              data-edit-type="image"
              style={{
                width: '100%',
                aspectRatio: '3 / 4',
                objectFit: 'cover',
                display: 'block',
                filter: 'var(--img-filter)',
              }}
            />
          ) : (
            <div style={imageFallbackStyle} aria-hidden="true" />
          )}
        </div>

        {/* Polaroid 2 (versetzt) */}
        <div
          style={{
            ...polaroidBase,
            top: '30%',
            left: '42%',
            transform: polaroid2Rotation,
            zIndex: 3,
          }}
        >
          {image2 ? (
            <img
              src={image2}
              alt={`Polaroid ${tokens.couple_name_1} und ${tokens.couple_name_2} — zwei`}
              loading="eager"
              data-editable="hero.image_2"
              data-edit-type="image"
              style={{
                width: '100%',
                aspectRatio: '3 / 4',
                objectFit: 'cover',
                display: 'block',
                filter: 'var(--img-filter)',
              }}
            />
          ) : (
            <div style={imageFallbackStyle} aria-hidden="true" />
          )}
        </div>
      </div>

      {/* RECHTS: Names + Datum */}
      <div style={{ textAlign: tokens.dna_align, minWidth: 0 }}>
        <p
          data-editable="hero.eyebrow"
          data-edit-type="text"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--ink-soft)',
            margin: '0 0 16px',
          }}
        >
          {eyebrow}
        </p>

        <h1
          data-editable="hero.couple_names"
          data-edit-type="text"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--display-weight)' as unknown as number,
            fontStyle: 'var(--display-style)' as unknown as 'normal' | 'italic',
            fontSize: 'clamp(48px, 11vw, 140px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: 0,
            textWrap: 'balance',
          }}
        >
          {tokens.couple_name_1}
          <br />
          <span
            className="amp"
            style={{
              fontFamily: 'var(--font-script)',
              color: 'var(--accent)',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '1.05em',
              padding: '0 0.05em',
              display: 'inline-block',
            }}
          >
            &amp;
          </span>{' '}
          {tokens.couple_name_2}
        </h1>

        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <Decor />
        </div>

        <div>
          <span
            data-editable="hero.date"
            data-edit-type="date"
            style={{
              display: 'inline-block',
              padding: '10px 18px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.22em',
              color: 'var(--accent-deep)',
              border: '1px solid var(--accent)',
              transform: tokens.dna_align === 'center' ? 'rotate(-1.5deg)' : 'none',
              marginTop: 8,
            }}
          >
            {dateStamp}
          </span>
        </div>

        {tokens.wedding_location && (
          <div
            data-editable="hero.location"
            data-edit-type="text"
            style={{
              fontFamily: 'var(--font-script)',
              fontSize: 'clamp(22px, 3vw, 32px)',
              color: 'var(--ink-soft)',
              marginTop: 20,
              fontWeight: 500,
            }}
          >
            {tokens.wedding_location}
          </div>
        )}
      </div>
    </div>
  );
}
