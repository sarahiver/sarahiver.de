import { HOW } from '@/lib/content';
import Section from '@/components/ui/Section';

export default function HowItWorks() {
  return (
    <Section id="how" eyebrow={HOW.eyebrow} eyebrowNumber="07">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-14 items-end">
        <h2 className="h2-editorial">
          {HOW.titlePart1} <em>{HOW.titleEm}</em>
        </h2>
        <p className="lede">{HOW.lede}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
        {/* Verbindungslinie */}
        <div
          className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px"
          style={{ background: 'var(--color-rule)' }}
        />

        {HOW.steps.map((step) => (
          <div key={step.n} className="relative">
            {/* Step-Number-Circle */}
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center mb-6 border-2"
              style={{
                background: 'var(--color-paper)',
                borderColor: 'var(--color-terra)',
              }}
            >
              <span
                className="text-3xl"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-terra-deep)',
                  fontWeight: 500,
                }}
              >
                {step.n}
              </span>
            </div>

            <h3
              className="text-2xl leading-tight mb-3 text-ink"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
            >
              {step.h}
            </h3>
            <p className="text-[15px] leading-relaxed text-ink-soft mb-3">{step.p}</p>

            {/* Tip in Caveat */}
            <p
              className="text-base"
              style={{
                fontFamily: 'var(--font-script)',
                color: 'var(--color-terra)',
              }}
            >
              {step.tip}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
