import { STRUCTURE } from '@/lib/content';
import { BEREICHE } from '@/lib/bereiche';
import Section from '@/components/ui/Section';

/**
 * Aufbau-Sektion — erklärt das Bereich-Konzept BEVOR die Pricing-Sektion kommt.
 * 9 Bereich-Karten in Grid, Basis-Bereiche mit Sage-Akzent hervorgehoben.
 */
export default function Structure() {
  return (
    <Section id="structure" eyebrow={STRUCTURE.eyebrow} eyebrowNumber="04">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-12 items-end">
        <h2 className="h2-editorial">
          {STRUCTURE.titlePart1} <em>{STRUCTURE.titleEm}</em>
        </h2>
        <p className="lede">{STRUCTURE.lede}</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-8 font-mono text-[10px] tracking-[0.18em] uppercase">
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'var(--color-sage-soft)',
            color: 'var(--color-sage-deep)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--color-sage-deep)' }}
          />
          {STRUCTURE.legend.basis}
        </span>
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'var(--color-paper-soft)',
            color: 'var(--color-muted)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--color-muted)' }}
          />
          {STRUCTURE.legend.zusatz}
        </span>
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white"
          style={{ background: 'var(--color-terra)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          {STRUCTURE.legend.featured}
        </span>
      </div>

      {/* Bereich Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BEREICHE.map((b) => {
          const isBasis = b.tier === 'basis';
          return (
            <div
              key={b.key}
              className="relative p-6 rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-card"
              style={{
                borderColor: isBasis ? 'var(--color-sage)' : 'var(--color-rule-soft)',
                background: isBasis ? 'var(--color-sage-soft)' : 'var(--color-paper-warm, #fff)',
              }}
            >
              {/* Featured badge */}
              {b.featured && (
                <div
                  className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-[0.18em] uppercase text-white"
                  style={{ background: 'var(--color-terra)' }}
                >
                  Bestseller
                </div>
              )}

              {/* Mini-Mockup */}
              <div
                className="aspect-[5/3] rounded-lg mb-4 flex items-center justify-center text-3xl"
                style={{
                  background: isBasis
                    ? 'rgba(94,110,80,0.12)'
                    : 'var(--color-paper-soft)',
                  fontFamily: 'var(--font-serif)',
                  color: isBasis ? 'var(--color-sage-deep)' : 'var(--color-muted)',
                }}
                aria-hidden="true"
              >
                <BereichIcon kind={b.key} basis={isBasis} />
              </div>

              {/* Name + Tag */}
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h3
                  className="text-lg font-medium"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: isBasis ? 'var(--color-sage-deep)' : 'var(--color-ink)',
                  }}
                >
                  {b.name}
                </h3>
                <span
                  className="font-mono text-[9px] tracking-[0.18em] uppercase"
                  style={{
                    color: isBasis ? 'var(--color-sage-deep)' : 'var(--color-muted)',
                  }}
                >
                  {isBasis ? '✓ Inkl.' : '+4 €'}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-ink-soft">{b.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Footer-Text mit Script-Em */}
      <p
        className="mt-10 text-center text-lg max-w-2xl mx-auto"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink-soft)' }}
      >
        {STRUCTURE.footPart1}
        <em
          style={{
            fontFamily: 'var(--font-script)',
            fontStyle: 'normal',
            color: 'var(--color-terra)',
            fontSize: '1.06em',
          }}
        >
          {STRUCTURE.footEm}
        </em>
        {STRUCTURE.footPart2}
      </p>
    </Section>
  );
}

/**
 * Mini-SVG-Icons pro Bereich-Typ.
 */
function BereichIcon({ kind, basis }: { kind: string; basis: boolean }) {
  const stroke = basis ? 'var(--color-sage-deep)' : 'var(--color-muted)';
  const common = { stroke, fill: 'none', strokeWidth: 1.2, strokeLinecap: 'round' as const };

  const icons: Record<string, React.ReactNode> = {
    hero: (
      <svg width="56" height="40" viewBox="0 0 56 40">
        <rect x="4" y="4" width="48" height="32" rx="3" {...common} />
        <path d="M4 26 L18 14 L28 20 L40 10 L52 22" {...common} />
        <circle cx="42" cy="12" r="2.5" {...common} />
      </svg>
    ),
    rsvp: (
      <svg width="48" height="40" viewBox="0 0 48 40">
        <rect x="4" y="6" width="40" height="28" rx="2" {...common} />
        <path d="M4 14 L44 14" {...common} />
        <path d="M12 22 L16 26 L24 18" {...common} />
        <path d="M30 22 L36 22 M30 26 L40 26" {...common} />
      </svg>
    ),
    prog: (
      <svg width="48" height="40" viewBox="0 0 48 40">
        <circle cx="24" cy="20" r="14" {...common} />
        <path d="M24 10 L24 20 L32 24" {...common} />
      </svg>
    ),
    info: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="14" {...common} />
        <path d="M20 13 L20 14 M20 18 L20 27" {...common} strokeWidth={1.6} />
      </svg>
    ),
    love: (
      <svg width="48" height="40" viewBox="0 0 48 40">
        <path
          d="M24 32 C 16 24, 8 20, 8 14 A 6 6 0 0 1 20 12 A 6 6 0 0 1 24 16 A 6 6 0 0 1 28 12 A 6 6 0 0 1 40 14 C 40 20, 32 24, 24 32 Z"
          {...common}
        />
      </svg>
    ),
    gallery: (
      <svg width="56" height="40" viewBox="0 0 56 40">
        <rect x="4" y="6" width="20" height="28" rx="2" {...common} />
        <rect x="28" y="6" width="14" height="14" rx="2" {...common} />
        <rect x="28" y="22" width="14" height="12" rx="2" {...common} />
        <rect x="46" y="6" width="8" height="28" rx="2" {...common} />
      </svg>
    ),
    gifts: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect x="6" y="14" width="28" height="20" rx="2" {...common} />
        <path d="M4 14 L36 14 M20 14 L20 34" {...common} />
        <path
          d="M14 14 C 14 8, 26 8, 26 14 M20 14 C 16 10, 12 10, 14 14 M20 14 C 24 10, 28 10, 26 14"
          {...common}
        />
      </svg>
    ),
    faq: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="14" {...common} />
        <path d="M16 16 A 4 4 0 1 1 20 22 L20 25 M20 28 L20 29" {...common} strokeWidth={1.6} />
      </svg>
    ),
    guest: (
      <svg width="48" height="40" viewBox="0 0 48 40">
        <path d="M6 8 L42 8 L42 28 L26 28 L16 36 L16 28 L6 28 Z" {...common} />
        <path d="M14 16 L34 16 M14 21 L28 21" {...common} />
      </svg>
    ),
  };

  return icons[kind] || icons.hero;
}
