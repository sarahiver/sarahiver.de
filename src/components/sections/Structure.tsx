import { STRUCTURE } from '@/lib/content';
import { BEREICHE } from '@/lib/bereiche';
import Section from '@/components/ui/Section';

/**
 * Aufbau-Sektion v4 — 4 Basis + 11 Zusatz = 15 Bereiche.
 * Grid responsive: 1 → 2 → 3 → 4 Spalten.
 * v4: Footer-Wiederholung entfernt (Reviewer-Punkt #6).
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
      <div className="flex flex-wrap gap-3 mb-8 font-mono text-[10px] tracking-[0.18em] uppercase">
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
          {STRUCTURE.legend.basis} · 4 dabei
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
          {STRUCTURE.legend.zusatz} · 11 frei wählbar
        </span>
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white"
          style={{ background: 'var(--color-terra)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          {STRUCTURE.legend.featured}
        </span>
      </div>

      {/* Bereich Grid — 4 Spalten für 15 Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {BEREICHE.map((b) => {
          const isBasis = b.tier === 'basis';
          return (
            <div
              key={b.key}
              className="relative p-5 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-card"
              style={{
                borderColor: isBasis ? 'var(--color-sage)' : 'var(--color-rule-soft)',
                background: isBasis
                  ? 'var(--color-sage-soft)'
                  : 'var(--color-paper-warm, #fff)',
              }}
            >
              {b.featured && (
                <div
                  className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-[0.18em] uppercase text-white"
                  style={{ background: 'var(--color-terra)' }}
                >
                  Bestseller
                </div>
              )}

              {/* Mini-Icon */}
              <div
                className="aspect-[5/3] rounded-md mb-3 flex items-center justify-center"
                style={{
                  background: isBasis
                    ? 'rgba(94,110,80,0.12)'
                    : 'var(--color-paper-soft)',
                }}
                aria-hidden="true"
              >
                <BereichIcon kind={b.key} basis={isBasis} />
              </div>

              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3
                  className="text-base font-medium"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: isBasis ? 'var(--color-sage-deep)' : 'var(--color-ink)',
                  }}
                >
                  {b.name}
                </h3>
                <span
                  className="font-mono text-[9px] tracking-[0.18em] uppercase whitespace-nowrap"
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

      {/* KEIN Footer-Text mehr — Lede sagt es bereits einmal */}
    </Section>
  );
}

/**
 * SVG-Icons pro Bereich-Typ — auf 15 erweitert.
 */
function BereichIcon({ kind, basis }: { kind: string; basis: boolean }) {
  const stroke = basis ? 'var(--color-sage-deep)' : 'var(--color-muted)';
  const common = {
    stroke,
    fill: 'none',
    strokeWidth: 1.2,
    strokeLinecap: 'round' as const,
  };

  const icons: Record<string, React.ReactNode> = {
    hero: (
      <svg width="48" height="34" viewBox="0 0 56 40">
        <rect x="4" y="4" width="48" height="32" rx="3" {...common} />
        <path d="M4 26 L18 14 L28 20 L40 10 L52 22" {...common} />
        <circle cx="42" cy="12" r="2.5" {...common} />
      </svg>
    ),
    rsvp: (
      <svg width="42" height="34" viewBox="0 0 48 40">
        <rect x="4" y="6" width="40" height="28" rx="2" {...common} />
        <path d="M4 14 L44 14" {...common} />
        <path d="M12 22 L16 26 L24 18" {...common} />
        <path d="M30 22 L36 22 M30 26 L40 26" {...common} />
      </svg>
    ),
    timeline: (
      <svg width="42" height="34" viewBox="0 0 48 40">
        <path d="M8 20 L40 20" {...common} />
        <circle cx="12" cy="20" r="3" {...common} />
        <circle cx="24" cy="20" r="3" {...common} />
        <circle cx="36" cy="20" r="3" {...common} />
        <path d="M12 14 L12 11 M24 14 L24 11 M36 14 L36 11" {...common} />
      </svg>
    ),
    lovestory: (
      <svg width="42" height="34" viewBox="0 0 48 40">
        <path
          d="M24 32 C 16 24, 8 20, 8 14 A 6 6 0 0 1 20 12 A 6 6 0 0 1 24 16 A 6 6 0 0 1 28 12 A 6 6 0 0 1 40 14 C 40 20, 32 24, 24 32 Z"
          {...common}
        />
      </svg>
    ),
    gallery: (
      <svg width="48" height="34" viewBox="0 0 56 40">
        <rect x="4" y="6" width="20" height="28" rx="2" {...common} />
        <rect x="28" y="6" width="14" height="14" rx="2" {...common} />
        <rect x="28" y="22" width="14" height="12" rx="2" {...common} />
        <rect x="46" y="6" width="8" height="28" rx="2" {...common} />
      </svg>
    ),
    photoupload: (
      <svg width="42" height="34" viewBox="0 0 48 40">
        <rect x="6" y="10" width="36" height="22" rx="2" {...common} />
        <path d="M24 16 L24 26 M19 21 L24 16 L29 21" {...common} />
      </svg>
    ),
    gifts: (
      <svg width="34" height="34" viewBox="0 0 40 40">
        <rect x="6" y="14" width="28" height="20" rx="2" {...common} />
        <path d="M4 14 L36 14 M20 14 L20 34" {...common} />
        <path
          d="M14 14 C 14 8, 26 8, 26 14 M20 14 C 16 10, 12 10, 14 14 M20 14 C 24 10, 28 10, 26 14"
          {...common}
        />
      </svg>
    ),
    accommodations: (
      <svg width="42" height="34" viewBox="0 0 48 40">
        <path d="M8 32 L8 16 L24 6 L40 16 L40 32 Z" {...common} />
        <rect x="18" y="22" width="12" height="10" {...common} />
        <path d="M14 20 L14 24 M20 16 L20 18 M28 16 L28 18 M34 20 L34 24" {...common} />
      </svg>
    ),
    countdown: (
      <svg width="34" height="34" viewBox="0 0 40 40">
        <circle cx="20" cy="22" r="13" {...common} />
        <path d="M16 6 L24 6 M20 6 L20 9" {...common} />
        <path d="M20 14 L20 22 L26 26" {...common} />
      </svg>
    ),
    guestbook: (
      <svg width="42" height="34" viewBox="0 0 48 40">
        <path d="M6 8 L42 8 L42 28 L26 28 L16 36 L16 28 L6 28 Z" {...common} />
        <path d="M14 16 L34 16 M14 21 L28 21" {...common} />
      </svg>
    ),
    faq: (
      <svg width="34" height="34" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="14" {...common} />
        <path
          d="M16 16 A 4 4 0 1 1 20 22 L20 25 M20 28 L20 29"
          {...common}
          strokeWidth={1.6}
        />
      </svg>
    ),
    musicwishes: (
      <svg width="34" height="34" viewBox="0 0 40 40">
        <circle cx="12" cy="28" r="4" {...common} />
        <circle cx="30" cy="24" r="4" {...common} />
        <path d="M16 28 L16 12 L34 8 L34 24" {...common} />
      </svg>
    ),
    witnesses: (
      <svg width="42" height="34" viewBox="0 0 48 40">
        <circle cx="16" cy="14" r="5" {...common} />
        <circle cx="32" cy="14" r="5" {...common} />
        <path d="M8 32 C 8 26, 12 22, 16 22 C 20 22, 24 26, 24 32" {...common} />
        <path d="M24 32 C 24 26, 28 22, 32 22 C 36 22, 40 26, 40 32" {...common} />
      </svg>
    ),
    weddingabc: (
      <svg width="34" height="34" viewBox="0 0 40 40">
        <path d="M10 30 L14 18 L18 30 M11 26 L17 26" {...common} />
        <path d="M22 18 L28 18 C 30 18, 30 22, 28 22 L22 22 L28 22 C 30 22, 30 26, 28 26 L22 26 Z" {...common} />
      </svg>
    ),
  };

  return icons[kind] || icons.hero;
}
