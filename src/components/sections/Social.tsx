import { SOCIAL } from '@/lib/content';
import Section from '@/components/ui/Section';

export default function Social() {
  return (
    <Section id="social" eyebrow={SOCIAL.eyebrow} eyebrowNumber="06">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 mb-16 items-end">
        <h2 className="h2-editorial">
          {SOCIAL.title}
          <br />
          <em>{SOCIAL.titleEmphasis}</em>
        </h2>
        <p className="lede">{SOCIAL.lede}</p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SOCIAL.testimonials.map((t, i) => (
          <div
            key={i}
            className="p-8 rounded-xl border border-rule-soft bg-paper-warm flex flex-col"
          >
            {/* Quote-Mark */}
            <div
              className="text-6xl leading-none text-sage-soft mb-4 select-none"
              style={{ fontFamily: 'var(--font-serif)' }}
              aria-hidden="true"
            >
              "
            </div>

            <p
              className="text-lg leading-relaxed text-ink mb-6 flex-1"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontStyle: 'italic' }}
            >
              {t.quote}
            </p>

            <div>
              <div className="text-sm font-medium text-ink">{t.author}</div>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted mt-1">
                {t.meta}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
