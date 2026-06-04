import { FINAL_CTA } from '@/lib/content';

export default function FinalCta() {
  return (
    <section className="final-cta">
      <span className="final-cta__eye">{FINAL_CTA.eyebrow}</span>
      <h2 className="final-cta__h">
        {FINAL_CTA.h_pre} <em>{FINAL_CTA.h_em}</em>{FINAL_CTA.h_post}
      </h2>
      <p className="final-cta__sub">{FINAL_CTA.sub}</p>
      <a href="/signup" className="final-cta__btn">
        <span>{FINAL_CTA.cta}</span>
        <span>{FINAL_CTA.ctaSub}</span>
      </a>
      <div className="final-cta__sm">{FINAL_CTA.small}</div>
      <p className="final-cta__legal">{FINAL_CTA.legal}</p>
    </section>
  );
}
