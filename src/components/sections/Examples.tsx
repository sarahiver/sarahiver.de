import { EXAMPLES } from '@/lib/content';
import { DEMO_WEDDINGS, type DemoWedding } from '@/lib/demos';

export default function Examples() {
  return (
    <section id="examples" className="section rule-top">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{EXAMPLES.eyebrow}</span>
            <h2 className="display-large">
              {EXAMPLES.h_pre} <em>{EXAMPLES.h_em}</em>{EXAMPLES.h_post}
            </h2>
          </div>
          <div>
            <p className="lede">{EXAMPLES.lede}</p>
            <p className="lede" style={{ marginTop: 16, color: 'var(--land-muted)', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {EXAMPLES.scrollHint}
            </p>
          </div>
        </div>
      </div>
      <div className="ex-strip-wrap">
        <div className="ex-strip">
          {DEMO_WEDDINGS.map((w) => (
            <StyleCard key={w.id} wedding={w} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StyleCard({ wedding }: { wedding: DemoWedding }) {
  const a = wedding.couple.split(' & ')[0];
  const b = wedding.couple.split(' & ')[1];
  return (
    <a
      href={`https://${wedding.url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="ex-card"
      data-style-mockup={wedding.style}
    >
      <div className="ex-card__frame">
        <div className="ex-card__bar">
          <span className="ex-card__dot" />
          <span className="ex-card__dot" />
          <span className="ex-card__dot" />
          <span className="ex-card__url">{wedding.url}</span>
        </div>
        <div className="ex-card__body">
          <div className="ex-card-hero">
            <div className="ex-card-hero__eye">{wedding.styleLabel}</div>
            <div>
              <h3 className="ex-card-hero__h">
                <span>{a}</span>
                <span className="ex-card-hero__amp">&amp;</span>
                <span>{b}</span>
              </h3>
              <div className="ex-card-hero__date">{wedding.date}</div>
              <div className="ex-card-hero__rule" />
              <div className="ex-card-hero__loc">{wedding.location}</div>
            </div>
            <div className="ex-card-hero__decor" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="ex-card__info">
        <div className="ex-card__name">
          {wedding.styleLabel.split(' · ')[0]}
          <span>{wedding.styleLabel.split(' · ')[1]}</span>
        </div>
        <div className="ex-card__cta">Live ansehen ↗</div>
      </div>
    </a>
  );
}
