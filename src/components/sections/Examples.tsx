import Link from 'next/link';
import { EXAMPLES } from '@/lib/content';
import { DEMO_WEDDINGS, type DemoWedding } from '@/lib/demos';

/**
 * Examples v2 — 8 Style-Mockups, eine pro Design-Stil.
 *
 * Horizontal scrollbarer Strip mit Scroll-Snap. Jede Karte zeigt
 * einen Mini-Wedding-Hero im jeweiligen Stil. Styling erfolgt über
 * data-style-mockup-Attribute + CSS — alle Stile in einem React-
 * Component, keine 8 separaten TSX-Files.
 */
export default function Examples() {
  return (
    <section id="examples" className="section-landing">
      <div className="shell">
        {/* === Section Header === */}
        <div className="grid-section-head">
          <div>
            <span className="eyebrow" style={{ marginBottom: '24px', display: 'inline-flex' }}>
              {EXAMPLES.eyebrow}
            </span>
            <h2 className="display-large" style={{ marginTop: '12px' }}>
              {EXAMPLES.titlePart1}
              <br />
              <em>{EXAMPLES.titleEm}</em>{EXAMPLES.titlePart2}
            </h2>
          </div>
          <div style={{ paddingBottom: '8px' }}>
            <p className="lede-medium" style={{ maxWidth: '38ch' }}>{EXAMPLES.lede}</p>
            <p className="lede-medium" style={{ marginTop: '16px', maxWidth: '38ch', color: 'var(--color-muted)' }}>
              <span className="eyebrow" style={{ display: 'inline', fontSize: '10px', marginRight: '8px' }}>↓</span>
              {EXAMPLES.scrollHint}
            </p>
          </div>
        </div>
      </div>

      {/* === Style-Strip (full-bleed horizontal scroll) === */}
      <div className="style-strip-wrap">
        <div className="style-strip">
          {DEMO_WEDDINGS.map((wedding) => (
            <StyleMockupCard key={wedding.id} wedding={wedding} />
          ))}
        </div>
      </div>

      {/* === Footer-CTA === */}
      <div className="shell" style={{ marginTop: 'clamp(48px, 6vw, 80px)', textAlign: 'center' }}>
        <p className="lede-medium" style={{ maxWidth: '50ch', marginInline: 'auto', marginBottom: '24px' }}>
          {EXAMPLES.footerLine}
        </p>
        <Link href="#pricing" className="btn-primary-large">
          <span>{EXAMPLES.footerCta}</span>
          <span className="arrow">→</span>
        </Link>
      </div>
    </section>
  );
}

function StyleMockupCard({ wedding }: { wedding: DemoWedding }) {
  const initial1 = wedding.couple.split(' & ')[0];
  const initial2 = wedding.couple.split(' & ')[1];

  return (
    <a
      href={`https://${wedding.url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="style-card"
      data-style-mockup={wedding.style}
    >
      {/* Browser-Frame */}
      <div className="style-card-frame">
        <div className="style-card-bar">
          <span className="style-card-dot" />
          <span className="style-card-dot" />
          <span className="style-card-dot" />
          <span className="style-card-url">{wedding.url}</span>
        </div>
        <div className="style-card-body">
          {/* Style-specific Hero — Background + Type via [data-style-mockup] in CSS */}
          <div className="mockup-hero">
            <div className="mockup-hero-eyebrow">{wedding.styleLabel}</div>
            <div className="mockup-hero-main">
              <h3 className="mockup-hero-couple">
                <span>{initial1}</span>
                <span className="mockup-hero-amp">&amp;</span>
                <span>{initial2}</span>
              </h3>
              <div className="mockup-hero-date">{wedding.date}</div>
              <div className="mockup-hero-rule" />
              <div className="mockup-hero-location">{wedding.location}</div>
            </div>
            {/* Style-Decoration (per Style unterschiedlich, in CSS) */}
            <div className="mockup-hero-decor" aria-hidden="true">
              <div className="mockup-hero-decor-1" />
              <div className="mockup-hero-decor-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Info Below Frame */}
      <div className="style-card-info">
        <div className="style-card-name">{wedding.styleLabel.split(' · ')[0]}</div>
        <div className="style-card-tagline">{wedding.tagline}</div>
        <div className="style-card-meta">
          <span>{wedding.couple}</span>
          <span className="style-card-cta">Live ansehen ↗</span>
        </div>
      </div>
    </a>
  );
}
