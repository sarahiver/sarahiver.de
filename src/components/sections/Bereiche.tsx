import { BEREICHE_SECTION } from '@/lib/content';
import { BEREICHE } from '@/lib/bereiche-katalog';

export default function Bereiche() {
  return (
    <section id="bereiche" className="section rule-top">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{BEREICHE_SECTION.eyebrow}</span>
            <h2 className="display-large">
              {BEREICHE_SECTION.h_pre} <em>{BEREICHE_SECTION.h_em}</em>{BEREICHE_SECTION.h_post}
            </h2>
          </div>
          <div>
            <p className="lede">{BEREICHE_SECTION.lede}</p>
          </div>
        </div>
        <div className="bereich-grid">
          {BEREICHE.map((b, i) => (
            <div
              key={b.key}
              className={`bereich-card${b.isStandard ? ' is-standard' : ''}`}
            >
              <div className="bereich-card__num">{String(i + 1).padStart(2, '0')}</div>
              <div className="bereich-card__name">{b.name}</div>
              <p className="bereich-card__desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
