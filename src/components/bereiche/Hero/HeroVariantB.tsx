import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';

/**
 * Hero Variante B — "Bild rechts, Text links"
 *
 * ⚠️ STUB: Wird ersetzt durch das echte Design aus Claude Design.
 */

interface HeroVariantBProps {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function HeroVariantB({ tokens, content }: HeroVariantBProps) {
  const eyebrow = (content.eyebrow as string) ?? 'WIR HEIRATEN';
  const date = new Date(tokens.wedding_date).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] min-h-[85vh]">
      {/* === LINKS: Text === */}
      <div
        className="flex flex-col justify-center px-6 md:px-12 lg:px-20 py-16 lg:py-24"
        style={{
          textAlign: tokens.dna_align,
          background: 'var(--bg)',
        }}
      >
        <p
          className="text-xs tracking-[0.3em] uppercase mb-5"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
        >
          {eyebrow}
        </p>

        <Decor variant="prominent" className="mb-6" />

        <h1
          className="display mb-6"
          style={{ fontSize: 'clamp(40px, 6vw, 88px)', color: 'var(--ink)' }}
          data-editable="hero.couple_names"
          data-edit-type="text"
        >
          {tokens.couple_name_1}
          <br />
          <span className="amp">&</span>
          <br />
          {tokens.couple_name_2}
        </h1>

        <p
          className="text-base lg:text-lg"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)' }}
        >
          <span data-editable="hero.date" data-edit-type="date">
            {date}
          </span>
        </p>
        {tokens.wedding_location && (
          <p
            className="mt-1 text-base lg:text-lg"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)' }}
            data-editable="hero.location"
            data-edit-type="text"
          >
            {tokens.wedding_location}
          </p>
        )}

        <p
          className="mt-8 text-xs font-mono tracking-[0.2em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          STUB · Variante B · Split Layout
        </p>
      </div>

      {/* === RECHTS: Bild === */}
      <div
        className="min-h-[400px] lg:min-h-full"
        style={{
          backgroundImage: tokens.hero_image_url
            ? `url(${tokens.hero_image_url})`
            : `linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-editable="hero.image"
        data-edit-type="image"
      />
    </div>
  );
}
