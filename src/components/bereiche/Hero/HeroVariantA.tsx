import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';

/**
 * Hero Variante A — "Großes Hintergrundbild"
 *
 * Wedding-Magazin-Look. Bild + Vignette + Text mit Shadow.
 */

interface HeroVariantAProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantA({ tokens, content }: HeroVariantAProps) {
  const eyebrow = (content.eyebrow as string) ?? 'Save the date';
  const dateLong = new Date(tokens.wedding_date).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const padding =
    tokens.dna_spacing === 'tight'
      ? 'var(--pad-tight)'
      : tokens.dna_spacing === 'airy'
      ? 'var(--pad-airy)'
      : tokens.dna_spacing === 'wide'
      ? 'var(--pad-wide)'
      : 'var(--pad-regular)';

  const innerAlign: React.CSSProperties =
    tokens.dna_align === 'center'
      ? { textAlign: 'center', marginInline: 'auto' }
      : { textAlign: 'left', marginLeft: 0, marginRight: 'auto' };

  // Background-Gradient als Fallback (CSS, gerendert hinter dem Bild)
  const fallbackBg =
    'radial-gradient(ellipse 60% 50% at 50% 35%, color-mix(in srgb, var(--accent) 45%, transparent), transparent 65%), linear-gradient(160deg, var(--bg-soft) 0%, var(--accent) 50%, var(--accent-deep) 100%)';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 600,
        height: 'min(85vh, 720px)',
        width: '100%',
        overflow: 'hidden',
        color: '#FAF6F0',
        display: 'grid',
        alignItems: 'end',
        padding,
        // Fallback-Gradient liegt IMMER unten — Bild blendet darüber
        background: fallbackBg,
      }}
    >
      {/* Hero Image als Background, NICHT als <img> — sicher gegen broken URLs */}
      {tokens.hero_image_url && (
        <div
          aria-label={`${tokens.couple_name_1} und ${tokens.couple_name_2}`}
          role="img"
          data-editable="hero.image"
          data-edit-type="image"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${tokens.hero_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'var(--img-filter)',
          }}
        />
      )}

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(20,16,12,0) 35%, rgba(20,16,12,0.45) 75%, rgba(20,16,12,0.62) 100%), linear-gradient(180deg, rgba(20,16,12,0.25) 0%, transparent 35%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 720,
          ...innerAlign,
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
            color: 'rgba(255,255,255,0.78)',
            margin: '0 0 14px',
          }}
        >
          {eyebrow}
        </p>

        <Decor className="mb-4" />

        <h1
          data-editable="hero.couple_names"
          data-edit-type="text"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--display-weight)' as unknown as number,
            fontStyle: 'var(--display-style)' as unknown as 'normal' | 'italic',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            margin: '14px 0 0',
            color: '#fff',
            fontSize: 'clamp(40px, 9vw, 104px)',
            textShadow: '0 2px 24px rgba(0,0,0,0.32)',
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

        <p
          data-editable="hero.date"
          data-edit-type="date"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'rgba(255,255,255,0.86)',
            margin: '18px 0 0',
            letterSpacing: '0.04em',
            textShadow: '0 1px 12px rgba(0,0,0,0.4)',
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
              color: 'rgba(255,255,255,0.7)',
              margin: '4px 0 0',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              textShadow: '0 1px 12px rgba(0,0,0,0.4)',
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
    </div>
  );
}
