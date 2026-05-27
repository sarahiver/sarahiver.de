import { VOICES } from '@/lib/content';
import Section from '@/components/ui/Section';

export default function Voices() {
  return (
    <Section id="voices" eyebrow={VOICES.eyebrow} eyebrowNumber="09">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-12 items-end">
        <h2 className="h2-editorial">
          {VOICES.titlePart1} <em>{VOICES.titleEm}</em>
          {VOICES.titlePart2}
        </h2>
        <p className="lede">{VOICES.lede}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {VOICES.items.map((v, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl border bg-paper-warm flex flex-col"
            style={{
              borderColor: 'var(--color-rule-soft)',
              background: 'var(--color-paper-warm, #fff)',
            }}
          >
            <div
              className="text-6xl leading-none mb-4 select-none"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-terra-soft)',
              }}
              aria-hidden="true"
            >
              &ldquo;
            </div>

            <p
              className="text-lg leading-relaxed text-ink mb-6 flex-1"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic' }}
            >
              {v.q}
            </p>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ background: 'var(--color-terra)' }}
              >
                {v.ini}
              </div>
              <div>
                <div className="text-sm font-medium text-ink">{v.name}</div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
                  {v.meta}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Foot */}
      <div
        className="mt-10 flex items-center justify-center gap-4 text-sm"
        style={{ color: 'var(--color-ink-soft)' }}
      >
        <span
          className="text-base"
          style={{ color: 'var(--color-honey)' }}
        >
          {VOICES.footStars}
        </span>
        <span>
          <strong className="text-ink">38 {VOICES.footPart1}</strong>,{' '}
          <em
            style={{
              fontFamily: 'var(--font-script)',
              color: 'var(--color-terra)',
              fontStyle: 'normal',
              fontSize: '1.08em',
              fontWeight: 500,
            }}
          >
            {VOICES.footScore}
          </em>{' '}
          {VOICES.footPart2}.
        </span>
      </div>
    </Section>
  );
}
