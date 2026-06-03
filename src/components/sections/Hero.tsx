import Link from 'next/link';
import { HERO } from '@/lib/content';
import { DEMO_WEDDINGS } from '@/lib/demos';

/**
 * Hero v2 — Editorial Premium Motion
 *
 * Asymmetrisches Layout: Massive Display-Type links, Mockup einer
 * echten Wedding-Site rechts. Bottom: horizontale Marquee mit
 * Beta-Hochzeiten.
 *
 * Keine Email-Capture mehr im Hero — primary CTA ist "14 Tage gratis
 * starten" (zum Pricing-Section gescrollt). Secondary CTA: zu Examples.
 */
export default function Hero() {
  return (
    <section id="hero" className="section-landing-hero">
      <div className="shell">
        {/* === Top: Eyebrow === */}
        <div className="reveal">
          <span className="eyebrow">{HERO.eyebrow}</span>
        </div>

        {/* === Mitte: Display + Mockup === */}
        <div className="grid-hero" style={{ marginTop: 'clamp(56px, 8vw, 96px)' }}>
          {/* LINKS: Display + Lede + CTA + Trust */}
          <div>
            <h1 className="display-massive reveal reveal-delay-1">
              {HERO.headlinePart1}
              <br />
              {HERO.headlinePart2}<em>{HERO.headlineEm}</em>{HERO.headlinePart3}
            </h1>

            <p
              className="lede-large reveal reveal-delay-2"
              style={{ marginTop: 'clamp(28px, 3vw, 40px)', maxWidth: '36ch' }}
            >
              {HERO.lede}
            </p>

            <div className="cta-pair reveal reveal-delay-3">
              <Link href="#pricing" className="btn-primary-large">
                <span>{HERO.ctaPrimary}</span>
                <span className="arrow">→</span>
              </Link>
              <Link href="#examples" className="btn-secondary-large">
                <span>{HERO.ctaSecondary}</span>
                <span>↗</span>
              </Link>
            </div>

            <div className="trust-row reveal reveal-delay-4">
              {HERO.trust.map((t) => <span key={t}>{t}</span>)}
            </div>
          </div>

          {/* RECHTS: Mockup einer Demo-Site */}
          <div className="hero-mockup-stack reveal reveal-delay-2">
            <HeroMockup wedding={DEMO_WEDDINGS[0]} />
          </div>
        </div>

        {/* === Bottom: Frühvogel-Counter === */}
        <div
          className="reveal reveal-delay-4"
          style={{ marginTop: 'clamp(48px, 6vw, 80px)' }}
        >
          <span className="counter-badge">
            <span className="pulse" />
            <span>{HERO.counterPrefix} <strong>{HERO.counterRemaining}</strong> {HERO.counterSuffix}</span>
          </span>
        </div>
      </div>

      {/* === Marquee (full-bleed, am unteren Ende der Hero) === */}
      <div
        className="marquee-track"
        style={{ marginTop: 'clamp(48px, 6vw, 80px)', paddingBlock: '14px', borderBlock: '1px solid var(--color-rule-soft)' }}
        aria-hidden="true"
      >
        <div className="marquee-content">
          {[...DEMO_WEDDINGS, ...DEMO_WEDDINGS].map((w, i) => (
            <span key={`${w.id}-${i}`}>
              <em>{w.couple}</em>
              <span style={{ fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontSize: '0.6em', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                {w.style}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * HeroMockup — gerenderte Mini-Wedding-Site im Editorial-Stil.
 * Kein iframe (slow, expensive), sondern statisches Markup das die
 * Hero-Bereich-Vorschau einer Wedding-Site andeutet.
 */
function HeroMockup({ wedding }: { wedding: typeof DEMO_WEDDINGS[number] }) {
  return (
    <div className="mockup-frame">
      <div className="mockup-frame-bar">
        <span className="mockup-frame-dot" />
        <span className="mockup-frame-dot" />
        <span className="mockup-frame-dot" />
        <span className="mockup-frame-url">{wedding.url}</span>
      </div>
      <div className="mockup-frame-body">
        <div className="demo-hero">
          <div>
            <div className="demo-hero-eyebrow">Hochzeit · {wedding.style}</div>
          </div>
          <div>
            <h2 className="demo-hero-couple">
              {wedding.couple.split('&')[0]}<em>&</em>{wedding.couple.split('&')[1]}
            </h2>
            <div className="demo-hero-date">{wedding.date}</div>
            <div className="demo-hero-rule" />
            <p className="demo-hero-meta">{wedding.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
