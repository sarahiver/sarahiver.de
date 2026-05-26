import { HOW } from '@/lib/content';
import Section from '@/components/ui/Section';

export default function HowItWorks() {
  return (
    <Section id="how" eyebrow={HOW.eyebrow} eyebrowNumber="04">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 mb-16 items-end">
        <h2 className="h2-editorial">
          {HOW.title}
          <br />
          <em>{HOW.titleEmphasis}</em>
        </h2>
        <p className="lede">{HOW.lede}</p>
      </div>

      {/* 3 Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
        {/* Verbindungslinie (Desktop) */}
        <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-rule" />

        {HOW.steps.map((step) => (
          <div key={step.n} className="relative">
            {/* Schritt-Nummer als Kreis */}
            <div
              className="relative w-24 h-24 rounded-full border border-ink flex items-center justify-center mb-6 bg-paper"
              style={{ background: 'var(--color-paper)' }}
            >
              <span
                className="text-3xl font-light"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {step.n}
              </span>
            </div>

            <h3
              className="text-2xl font-light leading-tight mb-3 text-ink"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {step.h}
            </h3>
            <p className="text-[15px] leading-relaxed text-muted">{step.p}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
