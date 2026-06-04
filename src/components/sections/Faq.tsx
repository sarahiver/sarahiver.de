import { FAQ } from '@/lib/content';

export default function Faq() {
  return (
    <section id="faq" className="section rule-top">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{FAQ.eyebrow}</span>
            <h2 className="display-large">
              {FAQ.h_pre} <em>{FAQ.h_em}</em>{FAQ.h_post}
            </h2>
          </div>
        </div>

        <div className="faq-list">
          {FAQ.items.map((item, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-item__head">
                <span>{item.q}</span>
                <span className="faq-item__indicator">+</span>
              </summary>
              <div className="faq-item__body">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
