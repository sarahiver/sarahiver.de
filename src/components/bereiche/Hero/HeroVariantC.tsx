import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';

/**
 * Hero Variante C — "Polaroid Editorial"
 *
 * ⚠️ STUB: Wird ersetzt durch das echte Design aus Claude Design.
 */

interface HeroVariantCProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantC({ tokens, content }: HeroVariantCProps) {
  const dateLong = new Date(tokens.wedding_date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const dateStamp = dateLong.replace(/\./g, ' · ');

  return (
    <div
      className="relative min-h-[85vh] px-6 md:px-12 lg:px-20 py-16 lg:py-24 overflow-hidden"
      style={{ background: 'var(--bg)', textAlign: tokens.dna_align }}
    >
      {/* Polaroid (top-right) */}
      {tokens.hero_image_url && (
        <div
          className="absolute top-8 right-8 lg:top-16 lg:right-16 w-48 lg:w-64"
          style={{
            transform: 'rotate(-3deg)',
            padding: '12px 12px 40px 12px',
            background: '#fff',
            boxShadow: '0 12px 32px -8px rgba(0,0,0,0.18)',
          }}
        >
          <div
            className="aspect-[3/4]"
            style={{
              backgroundImage: `url(${tokens.hero_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            data-editable="hero.image"
            data-edit-type="image"
          />
          <p
            className="mt-3 text-center text-xs"
            style={{ fontFamily: 'var(--font-script)', color: 'var(--ink-soft)' }}
          >
            {tokens.couple_name_1} & {tokens.couple_name_2}
          </p>
        </div>
      )}

      {/* Couple Name — riesig */}
      <div className="relative z-10 pt-12 lg:pt-16">
        <Decor className="mb-8" />

        <h1
          className="display"
          style={{
            fontSize: 'clamp(64px, 12vw, 200px)',
            lineHeight: 0.92,
            color: 'var(--accent-deep)',
          }}
          data-editable="hero.couple_names"
          data-edit-type="text"
        >
          {tokens.couple_name_1}
          <span className="amp" style={{ display: 'inline-block', margin: '0 0.15em' }}>
            &
          </span>
          {tokens.couple_name_2}
        </h1>

        {/* Mono-Stempel mit Datum */}
        <div
          className="inline-block mt-12 px-5 py-3 border"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--accent-deep)',
            transform: 'rotate(-1.5deg)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            letterSpacing: '0.3em',
          }}
        >
          <span data-editable="hero.date" data-edit-type="date">{dateStamp}</span>
        </div>

        {tokens.wedding_location && (
          <p
            className="mt-6 text-base lg:text-lg"
            style={{
              fontFamily: 'var(--font-script)',
              color: 'var(--ink-soft)',
              fontSize: '1.4em',
            }}
            data-editable="hero.location"
            data-edit-type="text"
          >
            {tokens.wedding_location}
          </p>
        )}

        <p
          className="mt-12 text-xs font-mono tracking-[0.2em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          STUB · Variante C · Polaroid Editorial
        </p>
      </div>
    </div>
  );
}
