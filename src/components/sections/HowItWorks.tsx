import { HOWITWORKS } from '@/lib/content';

export default function HowItWorks() {
  return (
    <section className="section rule-top">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{HOWITWORKS.eyebrow}</span>
            <h2 className="display-large">
              {HOWITWORKS.h_pre} <em>{HOWITWORKS.h_em}</em>{HOWITWORKS.h_post}
            </h2>
          </div>
          <div>
            <p className="lede">{HOWITWORKS.lede}</p>
          </div>
        </div>

        <div className="howsteps">
          {HOWITWORKS.steps.map((s, i) => (
            <div key={s.title} className="howstep">
              <div className="howstep__num">{String(i + 1).padStart(2, '0')}</div>
              <div className="howstep__title">{s.title}</div>
              <p className="howstep__desc">{s.desc}</p>
              <div className="howstep__detail">{s.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
