import { CTA } from '@/lib/content';
import WaitlistForm from '@/components/ui/WaitlistForm';

export default function CtaSection() {
  return (
    <section
      id="cta"
      className="px-6 md:px-12 lg:px-20 py-24 lg:py-32 text-paper-warm relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 18% 22%, rgba(212,165,116,0.12), transparent 40%), radial-gradient(circle at 88% 78%, rgba(181,116,106,0.15), transparent 42%), #2D211C',
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3 mb-8 font-mono text-[10px] tracking-[0.22em] uppercase text-paper-warm/60">
          <span className="pre-launch-pulse" />
          {CTA.eyebrow}
        </div>

        {/* Title */}
        <h2
          className="leading-tight mb-8"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(38px, 4.8vw, 64px)',
            letterSpacing: '-0.02em',
            color: 'var(--color-paper-warm)',
            fontWeight: 400,
          }}
        >
          {CTA.titlePart1}{' '}
          <em
            style={{
              fontFamily: 'var(--font-script)',
              fontStyle: 'normal',
              color: 'var(--color-honey)',
              fontSize: '1.08em',
              fontWeight: 500,
            }}
          >
            {CTA.titleEm}
          </em>
        </h2>

        <p
          className="text-lg leading-relaxed max-w-2xl mx-auto mb-10"
          style={{ color: 'rgba(244,237,226,0.78)' }}
        >
          {CTA.lede}
        </p>

        <div className="max-w-lg mx-auto">
          <WaitlistForm cta={CTA.waitlistCta} variant="dark" showPrivacy={true} />
        </div>

        {/* Trust-Stripe */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {CTA.trust.map((t) => (
            <div key={t.lab} className="text-center">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-paper-warm/45 mb-1.5">
                {t.lab}
              </div>
              <div
                className="text-base"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-paper-warm)' }}
              >
                {t.val}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
