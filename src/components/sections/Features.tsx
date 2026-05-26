import { FEATURES } from '@/lib/content';
import Section from '@/components/ui/Section';

export default function Features() {
  return (
    <Section id="features" eyebrow={FEATURES.eyebrow} eyebrowNumber="02">
      {/* Title + Lede */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 mb-16 items-end">
        <h2 className="h2-editorial">
          {FEATURES.title}
          <br />
          <em>{FEATURES.titleEmphasis}</em>
        </h2>
        <p className="lede">{FEATURES.lede}</p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule-soft">
        {FEATURES.items.map((item) => (
          <div
            key={item.tag}
            className="bg-paper p-8 hover:bg-paper-warm transition-colors duration-300"
          >
            <div className="flex items-baseline gap-4 mb-4">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-sage">
                {item.tag}
              </span>
              <div className="h-px flex-1 bg-rule" />
            </div>
            <h3
              className="text-2xl font-light leading-tight mb-3 text-ink"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {item.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
