import { FEATURES } from '@/lib/content';
import Section from '@/components/ui/Section';

const TONE_COLORS = {
  '': { tag: 'var(--color-terra)', bg: 'transparent' },
  sage: { tag: 'var(--color-sage-deep)', bg: 'transparent' },
  honey: { tag: 'var(--color-honey)', bg: 'transparent' },
};

export default function Features() {
  return (
    <Section id="features" eyebrow={FEATURES.eyebrow} eyebrowNumber="02">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-14 items-end">
        <h2 className="h2-editorial">
          {FEATURES.titlePart1} <em>{FEATURES.titlePart2}</em>
        </h2>
        <p className="lede">{FEATURES.lede}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule-soft">
        {FEATURES.items.map((item, i) => {
          const tone = TONE_COLORS[item.tone as keyof typeof TONE_COLORS] || TONE_COLORS[''];
          return (
            <div
              key={i}
              className="bg-paper p-8 hover:bg-paper-warm transition-colors duration-300"
            >
              <div className="flex items-baseline gap-4 mb-4">
                <span
                  className="font-mono text-[10px] tracking-[0.22em] uppercase font-medium"
                  style={{ color: tone.tag }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="h-px flex-1 bg-rule" />
              </div>
              <h3
                className="text-2xl leading-tight mb-3 text-ink"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}
              >
                {item.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
