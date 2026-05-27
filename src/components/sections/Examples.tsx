import { EXAMPLES } from '@/lib/content';
import { DEMO_WEDDINGS } from '@/lib/demos';
import { getStartStyle, getPalette } from '@/lib/customizer';
import Section from '@/components/ui/Section';

/**
 * Demo-Hochzeiten — 4 echte Beispielseiten.
 * Asymmetrisches Grid: 1 großes Featured links, 3 kleinere rechts.
 *
 * Jede Karte zeigt einen Mini-Mockup im jeweiligen Stil (DNA-basiert).
 * "Live ansehen" → öffnet die echte Subdomain.
 */
export default function Examples() {
  const featured = DEMO_WEDDINGS.find((d) => d.featured) ?? DEMO_WEDDINGS[0];
  const others = DEMO_WEDDINGS.filter((d) => d.id !== featured.id);

  return (
    <Section id="examples" eyebrow={EXAMPLES.eyebrow} eyebrowNumber="03">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-14 items-end">
        <h2 className="h2-editorial">
          {EXAMPLES.titlePart1} <em>{EXAMPLES.titleEm}</em>
          {EXAMPLES.titlePart2}
        </h2>
        <p className="lede">{EXAMPLES.lede}</p>
      </div>

      {/* Asymmetric grid */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Featured (big) */}
        <DemoCard wedding={featured} variant="featured" />

        {/* Smaller stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {others.map((d) => (
            <DemoCard key={d.id} wedding={d} variant="compact" />
          ))}
        </div>
      </div>
    </Section>
  );
}

interface DemoCardProps {
  wedding: (typeof DEMO_WEDDINGS)[number];
  variant: 'featured' | 'compact';
}

function DemoCard({ wedding, variant }: DemoCardProps) {
  const style = getStartStyle(wedding.start);
  const palette = getPalette(style.defaultPalette);
  const isFeatured = variant === 'featured';

  // Mockup background = palette[0] → palette[1]
  const bg = `linear-gradient(180deg, ${palette.colors[0]} 0%, ${palette.colors[1]} 100%)`;
  const accentColor = palette.colors[2];
  const inkColor = palette.colors[palette.colors.length - 1];

  return (
    <a
      href={`https://${wedding.url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl overflow-hidden border border-rule-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
    >
      {/* Mockup */}
      <div
        className={`relative px-8 ${isFeatured ? 'pt-12 pb-16' : 'pt-8 pb-10'} overflow-hidden`}
        style={{
          background: bg,
          aspectRatio: isFeatured ? '4 / 3' : '5 / 3',
        }}
      >
        {/* Stil-Tagline */}
        <div
          className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3"
          style={{ color: accentColor }}
        >
          {wedding.tagline}
        </div>

        {/* Brautpaar-Name */}
        <div
          className={`leading-[0.95] tracking-[-0.015em]`}
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: style.id === 'festlich' ? 700 : 400,
            fontStyle: style.id === 'floral' ? 'italic' : 'normal',
            fontSize: isFeatured ? 'clamp(34px, 4vw, 56px)' : 'clamp(24px, 2.8vw, 36px)',
            color: inkColor,
          }}
        >
          {wedding.couple.split(' & ')[0]}{' '}
          <span
            style={{
              fontFamily: 'var(--font-script)',
              color: accentColor,
              fontStyle: 'normal',
              fontWeight: 500,
            }}
          >
            &
          </span>
          <br />
          {wedding.couple.split(' & ')[1]}
        </div>

        {/* Date + Location */}
        <p
          className="text-xs tracking-[0.04em] mt-3"
          style={{ color: palette.colors[3] }}
        >
          {wedding.date}
          <br />
          {wedding.location}
        </p>

        {/* Featured corner badge */}
        {isFeatured && (
          <div
            className="absolute top-5 right-5 px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.18em] uppercase text-white"
            style={{ background: accentColor }}
          >
            Featured
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-6 border-t border-rule-soft">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div
              className="text-base font-medium text-ink mb-0.5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {wedding.couple}
            </div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              {wedding.url}
            </div>
          </div>
          <span
            className="text-sm font-medium flex-shrink-0 transition-transform group-hover:translate-x-1"
            style={{ color: 'var(--color-terra)' }}
          >
            Live ansehen →
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted">{wedding.config}</p>
      </div>
    </a>
  );
}
