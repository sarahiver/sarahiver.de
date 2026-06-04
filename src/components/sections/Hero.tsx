import { HERO } from '@/lib/content';

export default function Hero() {
  return (
    <>
      <section className="hero">
        <span className="eyebrow">{HERO.eyebrow}</span>
        <h1 className="display-massive">
          {HERO.h1_pre}<br />
          {HERO.h1_line1}<br />
          {HERO.h1_pre2}<em>{HERO.h1_em}</em><br />
          {HERO.h1_line3}
        </h1>
        <div className="hero__row">
          <p className="lede">{HERO.lede}</p>
          <div className="hero__bullets">
            {HERO.bullets.map((b) => <span key={b}>{b}</span>)}
          </div>
        </div>
        <div className="cta-bar">
          <a href="#config" className="cta-bar__primary">
            <span>{HERO.ctaPrimary}</span>
            <span className="cta-bar__sub">{HERO.ctaPrimarySub}</span>
          </a>
          <a href="#examples" className="cta-bar__secondary">
            <span>{HERO.ctaSecondary}</span>
            <span>↗</span>
          </a>
        </div>
      </section>
      <Marquee />
      <Strip />
    </>
  );
}

function Marquee() {
  // Sample wedding-Marquee, doppelt für seamless loop
  const items = [
    ['Julia & Tom', 'Editorial'],
    ['Anna & Lukas', 'Organic'],
    ['Mia & Noah', 'Brutalist'],
    ['Elena & Felix', 'Opulent'],
    ['Lina & Jonas', 'Mono'],
    ['Clara & Ben', 'Bauhaus'],
    ['Paula & Jakob', 'Liquefy'],
    ['Sarah & Iver', 'Kinetic'],
  ];
  return (
    <div className="marquee" aria-hidden="true">
      <span>
        {[...items, ...items].map(([couple, style], i) => (
          <span key={i} style={{ display: 'inline-block' }}>
            {couple} <em>{style}</em>
          </span>
        ))}
      </span>
    </div>
  );
}

function Strip() {
  return (
    <div className="strip">
      {HERO.trustCells.map((cell) => (
        <div key={cell.num} className="strip__cell">
          <div className="strip__label">{cell.label}</div>
          <div className="strip__num">{cell.num}</div>
          <div className="strip__desc">{cell.desc}</div>
        </div>
      ))}
    </div>
  );
}
