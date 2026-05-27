import { HERO } from '@/lib/content';
import WaitlistForm from '@/components/ui/WaitlistForm';

/**
 * Hero — emotional, warm, "Vorfreude" als handgeschriebener Akzent.
 * Email-Sammlung als primärer CTA.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="px-6 md:px-12 lg:px-20 pt-12 pb-20 lg:pt-20 lg:pb-24 min-h-screen flex items-center"
    >
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-20 items-center w-full">
        {/* === LINKS: Copy + Waitlist === */}
        <div className="pr-2 min-w-0">
          {/* Eyebrow with pulse */}
          <div className="inline-flex items-center gap-2.5 mb-8 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(212,165,116,0.16)',
              border: '1px solid rgba(212,165,116,0.32)',
            }}
          >
            <span className="pre-launch-pulse" />
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-terra-deep)' }}
            >
              {HERO.eyebrow}
            </span>
          </div>

          {/* Display Title with Caveat-em + Sage */}
          <h1 className="display mb-7">
            {HERO.titlePart1}
            <br />
            <em>{HERO.titlePart2}</em>
            <span className="sage">{HERO.titlePart3}</span>
          </h1>

          {/* Decorative "Vorfreude." */}
          <div
            className="mb-6 text-3xl"
            style={{
              fontFamily: 'var(--font-script)',
              color: 'var(--color-terra)',
              transform: 'rotate(-2deg)',
              display: 'inline-block',
            }}
            aria-hidden="true"
          >
            {HERO.decor}
          </div>

          <p className="lede max-w-[52ch] mb-9">{HERO.sub}</p>

          {/* Waitlist Form */}
          <div className="max-w-lg mb-7">
            <WaitlistForm />
          </div>

          {/* Trust-Badges */}
          <div className="flex flex-wrap gap-x-7 gap-y-2 font-mono text-[11px] tracking-[0.16em] uppercase text-muted">
            {HERO.trust.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full text-white text-[8px]"
                  style={{ background: 'var(--color-sage-deep)' }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* === RECHTS: Browser Mockup (Julia & Tom Demo) === */}
        <div className="relative" style={{ perspective: '1400px' }}>
          <div
            className="bg-white rounded-[16px] overflow-hidden shadow-lift"
            style={{
              transform: 'rotateY(-3deg) rotateX(2deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Browser Bar */}
            <div className="h-9 bg-[#efece6] border-b border-[#e3dfd5] flex items-center px-3.5 gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
              </div>
              <div
                className="ml-3.5 bg-white rounded-md px-3 py-1 font-mono text-[10px] flex-1 max-w-[60%] border border-[#e3dfd5]"
                style={{ color: 'var(--color-muted)' }}
              >
                <span style={{ color: 'var(--color-sage-deep)' }}>🔒</span> julia-tom.sarahiver.de
              </div>
            </div>

            {/* Editorial-Stil Demo */}
            <div
              className="px-10 pt-9 relative overflow-hidden"
              style={{
                aspectRatio: '4 / 3.2',
                background: 'linear-gradient(180deg, #FAF6F0 0%, #E8C9C0 100%)',
              }}
            >
              <div
                className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3.5"
                style={{ color: 'var(--color-terra-deep)' }}
              >
                Klassisch & warm · Demo
              </div>
              <h2
                className="leading-[0.95] tracking-[-0.015em] mb-3"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(28px, 3.4vw, 50px)',
                  fontWeight: 400,
                  color: 'var(--color-ink)',
                }}
              >
                Julia{' '}
                <em
                  style={{
                    fontFamily: 'var(--font-script)',
                    fontStyle: 'normal',
                    color: 'var(--color-terra)',
                  }}
                >
                  &
                </em>
                <br />
                Tom
              </h2>
              <p
                className="text-[11px] tracking-[0.04em] mb-5"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                12. September 2027 — Schloss Wackerbarth, Sachsen
              </p>

              {/* Meta-Footer */}
              <div
                className="flex gap-7 font-mono text-[10px] tracking-[0.18em] uppercase border-t pt-3.5 mt-2"
                style={{
                  color: 'var(--color-muted)',
                  borderColor: 'rgba(45,37,32,0.15)',
                }}
              >
                <div>
                  <span
                    className="block text-[8px] mb-1"
                    style={{ color: 'var(--color-muted-2)' }}
                  >
                    Datum
                  </span>
                  <span
                    className="text-sm tracking-normal"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--color-ink)',
                    }}
                  >
                    12 · 09 · 27
                  </span>
                </div>
                <div>
                  <span
                    className="block text-[8px] mb-1"
                    style={{ color: 'var(--color-muted-2)' }}
                  >
                    Ort
                  </span>
                  <span
                    className="text-sm tracking-normal"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--color-ink)',
                    }}
                  >
                    Dresden
                  </span>
                </div>
                <div>
                  <span
                    className="block text-[8px] mb-1"
                    style={{ color: 'var(--color-muted-2)' }}
                  >
                    RSVP
                  </span>
                  <span
                    className="text-sm tracking-normal"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--color-ink)',
                    }}
                  >
                    bis 01.08.
                  </span>
                </div>
              </div>

              {/* Photo placeholder */}
              <div
                className="absolute bottom-0 right-6 w-[35%] rounded-t-md overflow-hidden"
                style={{
                  aspectRatio: '3/4',
                  background: 'linear-gradient(135deg, #B5746A 0%, #8E574E 100%)',
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
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] tracking-[0.18em] uppercase text-white/70 text-center"
                  aria-hidden="true"
                >
                  Brautpaar
                  <br />
                  Foto
                </div>
              </div>
            </div>
          </div>

          {/* Caveat-Tag rechts unten am Mockup */}
          <div
            className="absolute -bottom-4 -right-2 px-3 py-1.5 rounded-full text-white text-sm"
            style={{
              background: 'var(--color-terra)',
              fontFamily: 'var(--font-script)',
              transform: 'rotate(-3deg)',
            }}
            aria-hidden="true"
          >
            Beispiel
          </div>
        </div>
      </div>
    </section>
  );
}
