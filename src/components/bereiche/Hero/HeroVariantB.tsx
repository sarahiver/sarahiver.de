import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';

/**
 * Hero Variante B — "Split — Text links, Bild rechts"
 */

interface HeroVariantBProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantB({ tokens, content }: HeroVariantBProps) {
  const eyebrow = (content.eyebrow as string) ?? 'Wir heiraten';
  const dateLong = new Date(tokens.wedding_date).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const gridCols =
    tokens.dna_spacing === 'airy'
      ? '0.95fr 1.05fr'
      : tokens.dna_spacing === 'wide'
      ? '0.85fr 1.15fr'
      : '1fr 1fr';

  const padding =
    tokens.dna_spacing === 'tight'
      ? 'var(--pad-tight)'
      : tokens.dna_spacing === 'airy'
      ? 'var(--pad-airy)'
      : tokens.dna_spacing === 'wide'
      ? 'var(--pad-wide)'
      : 'var(--pad-regular)';

  const textAlignItems = tokens.dna_align === 'center' ? 'center' : 'flex-start';

  const fallbackBg =
    'radial-gradient(ellipse 60% 50% at 50% 35%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 65%), linear-gradient(160deg, var(--bg-soft) 0%, var(--accent) 100%)';

  return (
    <div
      className="hero-b-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        minHeight: 580,
        width: '100%',
        background: 'var(--bg)',
      }}
    >
      {/* === LINKS: Text === */}
      <div
        style={{
          padding,
          paddingLeft: `clamp(${padding === 'var(--pad-tight)' ? '20px' : '28px'}, 5vw, 64px)`,
          paddingRight: 'clamp(24px, 4vw, 48px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: textAlignItems,
          textAlign: tokens.dna_align,
          minWidth: 0,
        }}
      >
        <p
          data-editable="hero.eyebrow"
          data-edit-type="text"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--ink-soft)',
            margin: '0 0 18px',
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
            fontSize: 'clamp(34px, 7vw, 84px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '0 0 6px',
            textWrap: 'balance',
          }}
        >
          {tokens.couple_name_1}{' '}
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

        <div style={{ margin: '16px 0 18px' }}>
          <Decor />
        </div>

        <p
          data-editable="hero.date"
          data-edit-type="date"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'var(--ink-soft)',
            margin: '20px 0 0',
            letterSpacing: '0.04em',
          }}
        >
          {dateLong}
        </p>

        {tokens.wedding_location && (
          <p
            data-editable="hero.location"
            data-edit-type="text"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--muted)',
              margin: '4px 0 0',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
              style={{ width: 12, height: 12, color: 'var(--accent)' }}
            >
              <path d="M6 11c2.5-3 4-5 4-7a4 4 0 0 0-8 0c0 2 1.5 4 4 7z" />
              <circle cx="6" cy="4" r="1.4" />
            </svg>
            {tokens.wedding_location}
          </p>
        )}
      </div>

      {/* === RECHTS: Bild als Background-Div (broken-link-safe) === */}
      <div
        aria-label={tokens.hero_image_url ? `${tokens.couple_name_1} und ${tokens.couple_name_2}` : undefined}
        role={tokens.hero_image_url ? 'img' : undefined}
        data-editable="hero.image"
        data-edit-type="image"
        style={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '4 / 5',
          width: '100%',
          alignSelf: 'stretch',
          height: '100%',
          backgroundImage: tokens.hero_image_url
            ? `url(${tokens.hero_image_url}), ${fallbackBg}`
            : fallbackBg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: tokens.hero_image_url ? 'var(--img-filter)' : 'none',
        }}
      />
    </div>
  );
}
