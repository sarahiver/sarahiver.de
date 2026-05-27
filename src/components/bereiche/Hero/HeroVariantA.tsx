import type { EffectiveTokens } from '@/types/supabase';

/**
 * Hero Variante A — "Großes Hintergrundbild"
 *
 * ⚠️ STUB: Wird ersetzt durch das echte Design aus Claude Design.
 * Aktuell: rudimentäres Layout zum Testen des Token-Systems.
 */

interface HeroVariantAProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantA({ tokens, content }: HeroVariantAProps) {
  const eyebrow = (content.eyebrow as string) ?? '';
  const date = new Date(tokens.wedding_date).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="relative min-h-[85vh] lg:min-h-[100vh] flex items-end"
      style={{
        backgroundImage: tokens.hero_image_url
          ? `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%), url(${tokens.hero_image_url})`
          : `linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="w-full px-6 md:px-12 lg:px-20 pb-16 lg:pb-24"
        style={{ textAlign: tokens.dna_align }}
      >
        {eyebrow && (
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4 text-white/80"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {eyebrow}
          </p>
        )}

        <h1
          className="display text-white mb-4"
          style={{
            fontSize: 'clamp(48px, 8vw, 120px)',
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
          data-editable="hero.couple_names"
          data-edit-type="text"
        >
          {tokens.couple_name_1}{' '}
          <span className="amp" style={{ color: 'var(--accent)' }}>
            &
          </span>{' '}
          {tokens.couple_name_2}
        </h1>

        <p
          className="text-white/90 text-base lg:text-lg"
          style={{ fontFamily: 'var(--font-body)' }}
          data-editable="hero.date"
          data-edit-type="date"
        >
          {date}
          {tokens.wedding_location && (
            <>
              {' · '}
              <span data-editable="hero.location" data-edit-type="text">
                {tokens.wedding_location}
              </span>
            </>
          )}
        </p>

        <p
          className="mt-4 text-xs font-mono tracking-[0.2em] uppercase"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          STUB · Variante A · Background-Image
        </p>
      </div>
    </div>
  );
}
