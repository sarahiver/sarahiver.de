import { HERO } from '@/lib/content';
import WaitlistForm from '@/components/ui/WaitlistForm';

/**
 * Hero-Section mit Browser-Mockup (Editorial-Theme Preview).
 *
 * Pre-Launch-Mode: Primary CTA ist die Email-Sammlung statt Kauf-Button.
 * Mockup zeigt eine Beispiel-Hochzeitswebsite zur Veranschaulichung.
 */
export default function Hero() {
  return (
    <section id="hero" className="min-h-screen px-6 md:px-12 lg:px-20 pt-12 pb-20 lg:pt-24">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        {/* Left: Copy + CTA */}
        <div className="pr-2 min-w-0">
          {/* Eyebrow */}
          <div className="eyebrow mb-7">
            <span className="dot" />
            <span>{HERO.eyebrow}</span>
          </div>

          {/* Title */}
          <h1 className="display mb-8 hyphens-auto break-words">
            {HERO.title}
            <br />
            <em>{HERO.titleEmphasis}</em>
          </h1>

          {/* Sub */}
          <p className="lede max-w-[44ch] mb-10">{HERO.sub}</p>

          {/* Waitlist Form als primärer CTA */}
          <div className="max-w-lg">
            <WaitlistForm variant="inline" showPrivacy={true} />
          </div>

          {/* Trust-Badges */}
          <div className="mt-9 flex flex-wrap gap-7 font-mono text-[11px] tracking-[0.16em] uppercase text-muted">
            {HERO.trust.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full text-white text-[8px]"
                  style={{ background: 'oklch(0.46 0.04 145)' }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Browser Mockup */}
        <div className="relative" style={{ perspective: '1400px' }}>
          <div
            className="bg-white rounded-[14px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(14,13,11,0.25),0_60px_120px_-40px_rgba(14,13,11,0.15)]"
            style={{ transform: 'rotateY(-3deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}
          >
            {/* Browser Bar */}
            <div className="h-9 bg-[#efece6] border-b border-[#e3dfd5] flex items-center px-3.5 gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
              </div>
              <div className="ml-3.5 bg-white rounded-md px-3 py-1 font-mono text-[10px] text-muted flex-1 max-w-[60%] border border-[#e3dfd5]">
                <span className="text-[oklch(0.46_0.04_145)] mr-1.5">🔒</span>
                julia-tom.sarahiver.de
              </div>
            </div>

            {/* Mockup Body — Editorial Theme */}
            <div
              className="px-10 pt-9 relative overflow-hidden"
              style={{ aspectRatio: '4 / 3.2', background: '#f8f4ec' }}
            >
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted mb-3.5">
                Editorial · No. 01
              </div>
              <h2
                className="font-light leading-[0.95] tracking-[-0.015em] mb-3"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.4vw, 54px)' }}
              >
                Julia <em className="italic">&</em>
                <br />
                Tom
              </h2>
              <p className="text-[11px] text-muted tracking-[0.04em] mb-5">
                Am 27. Juni 2026 — Schloss Wackerbarth
              </p>

              {/* Meta-Footer */}
              <div className="flex gap-7 font-mono text-[10px] tracking-[0.18em] uppercase text-muted border-t border-ink/10 pt-3.5 mt-2">
                <div>
                  <span className="block text-[8px] text-muted-2 mb-1">Datum</span>
                  <span
                    className="text-sm tracking-normal text-ink"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    27 · 06 · 26
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] text-muted-2 mb-1">Ort</span>
                  <span
                    className="text-sm tracking-normal text-ink"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Dresden
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] text-muted-2 mb-1">RSVP</span>
                  <span
                    className="text-sm tracking-normal text-ink"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    bis 15.05.
                  </span>
                </div>
              </div>

              {/* Photo placeholder (rechts unten) */}
              <div
                className="absolute bottom-0 right-5 w-[38%] rounded-t-md overflow-hidden"
                style={{
                  aspectRatio: '3/4',
                  background: 'linear-gradient(135deg, #d4cdb8 0%, #b8b09a 100%)',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'repeating-linear-gradient(45deg, transparent 0, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 9px)',
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] tracking-[0.18em] uppercase text-ink/45 text-center"
                  aria-hidden="true"
                >
                  Brautpaar
                  <br />
                  Foto
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
