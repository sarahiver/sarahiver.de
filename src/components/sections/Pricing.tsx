import { PRICING_SECTION } from '@/lib/content';
import { PRICING_TIERS } from '@/lib/bereiche-katalog';

export default function Pricing() {
  return (
    <section id="pricing" className="section rule-top">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{PRICING_SECTION.eyebrow}</span>
            <h2 className="display-large">
              {PRICING_SECTION.h_pre} <em>{PRICING_SECTION.h_em}</em>{PRICING_SECTION.h_post}
            </h2>
          </div>
          <div>
            <p className="lede">{PRICING_SECTION.lede}</p>
          </div>
        </div>

        <div className="pricing-grid">
          {PRICING_TIERS.map((t) => (
            <div key={t.key} className={`pricing-tier${t.isPopular ? ' is-popular' : ''}`}>
              <div className="pricing-tier__label">
                {t.zusatz === 0 ? 'Basis' : `+${t.zusatz} Bereiche`}
              </div>
              <div className="pricing-tier__name">{t.name}</div>
              <div className="pricing-tier__price">
                {t.price}€<small>/Monat</small>
              </div>
              <div className="pricing-tier__bereiche">
                {4 + t.zusatz} {4 + t.zusatz === 1 ? 'Bereich' : 'Bereiche'} aktiv · frei wählbar
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-addon">
          <div>
            <div className="pricing-addon__head">{PRICING_SECTION.customDomainTitle}</div>
            <div className="pricing-addon__desc">{PRICING_SECTION.customDomainDesc}</div>
          </div>
          <div className="pricing-addon__price">{PRICING_SECTION.customDomainPrice}</div>
        </div>
      </div>
    </section>
  );
}
