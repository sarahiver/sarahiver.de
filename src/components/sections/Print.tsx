import { PRINT } from '@/lib/content';
import Section from '@/components/ui/Section';

export default function Print() {
  return (
    <Section id="print" eyebrow={PRINT.eyebrow} eyebrowNumber="06">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-14 items-end">
        <h2 className="h2-editorial">
          {PRINT.titlePart1} <em>{PRINT.titleEm}</em>
        </h2>
        <p className="lede">{PRINT.lede}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* === Free Card === */}
        <div
          className="p-8 lg:p-10 rounded-2xl border"
          style={{
            background: 'var(--color-sage-soft)',
            borderColor: 'var(--color-sage)',
          }}
        >
          <div className="flex items-baseline justify-between mb-6">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.18em] uppercase text-white"
              style={{ background: 'var(--color-sage-deep)' }}
            >
              {PRINT.free.tag}
            </span>
            <div className="text-right">
              <div
                className="text-3xl font-medium"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-sage-deep)' }}
              >
                {PRINT.free.price}
              </div>
              <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-sage-deep/70">
                {PRINT.free.alt}
              </div>
            </div>
          </div>

          <h3
            className="text-2xl lg:text-3xl mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-sage-deep)', fontWeight: 500 }}
          >
            {PRINT.free.titlePart}
            <em
              style={{
                fontFamily: 'var(--font-script)',
                fontStyle: 'normal',
                color: 'var(--color-terra)',
                fontSize: '1.06em',
              }}
            >
              {PRINT.free.titleEm}
            </em>
          </h3>

          <p className="text-[15px] leading-relaxed text-ink-soft mb-6">{PRINT.free.body}</p>

          <button
            disabled
            className="inline-flex items-center gap-2 text-sm font-medium text-sage-deep opacity-60 cursor-not-allowed"
            title="Verfügbar nach Launch"
          >
            {PRINT.free.cta} →
          </button>
        </div>

        {/* === Paid Card === */}
        <div
          className="p-8 lg:p-10 rounded-2xl border-2 relative"
          style={{
            background: '#fff',
            borderColor: 'var(--color-terra)',
            boxShadow: '0 20px 50px -20px rgba(181,116,106,0.25)',
          }}
        >
          <div className="flex items-baseline justify-between mb-6">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.18em] uppercase text-white"
              style={{ background: 'var(--color-terra)' }}
            >
              {PRINT.paid.tag}
            </span>
            <div className="text-right">
              <div
                className="text-3xl font-medium"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                {PRINT.paid.price}
              </div>
              <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-muted">
                {PRINT.paid.alt}
              </div>
            </div>
          </div>

          <h3
            className="text-2xl lg:text-3xl mb-4 leading-tight text-ink"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
          >
            {PRINT.paid.titlePart}
            <em
              style={{
                fontFamily: 'var(--font-script)',
                fontStyle: 'normal',
                color: 'var(--color-terra)',
                fontSize: '1.06em',
              }}
            >
              {PRINT.paid.titleEm}
            </em>
          </h3>

          <p className="text-[15px] leading-relaxed text-ink-soft mb-6">{PRINT.paid.body}</p>

          <button
            disabled
            className="inline-flex items-center gap-2 text-sm font-medium opacity-60 cursor-not-allowed"
            style={{ color: 'var(--color-terra-deep)' }}
            title="Verfügbar nach Launch"
          >
            {PRINT.paid.cta} →
          </button>
        </div>
      </div>
    </Section>
  );
}
