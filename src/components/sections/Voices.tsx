import { VOICES } from '@/lib/content';

export default function Voices() {
  return (
    <section className="section">
      <div className="shell" style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}>
        <span className="eyebrow">{VOICES.eyebrow}</span>
      </div>
      <div className="voices">
        <div className="voices__founder">
          <span className="voices__founder-eye">Gründer-Note</span>
          <p className="voices__founder-quote">{VOICES.founder.quote}</p>
          <div style={{ marginTop: 'auto', paddingTop: 32 }}>
            <div className="voices__founder-sig">— {VOICES.founder.name}</div>
            <div className="voices__founder-meta">{VOICES.founder.role}</div>
          </div>
        </div>
        <div className="voices__list">
          {VOICES.beta.map((v, i) => (
            <div key={i} className="voices__item">
              <p className="voices__item-quote">{v.quote}</p>
              <div className="voices__item-sig">
                <strong>{v.sig}</strong> · {v.meta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
