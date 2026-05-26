import { CTA } from '@/lib/content';
import WaitlistForm from '@/components/ui/WaitlistForm';

export default function CtaSection() {
  return (
    <section
      id="cta"
      className="px-6 md:px-12 lg:px-20 py-24 lg:py-32 bg-ink text-paper-warm relative overflow-hidden"
    >
      {/* Dezenter Sage-Akzent oben */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, oklch(0.86 0.025 145), transparent)',
        }}
      />

      <div className="max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3 mb-8 font-mono text-[11px] tracking-[0.22em] uppercase text-paper-warm/55">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'oklch(0.86 0.025 145)' }}
          />
          {CTA.eyebrow}
        </div>

        {/* Title */}
        <h2
          className="font-light leading-tight mb-8 text-paper-warm"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 5vw, 72px)',
            letterSpacing: '-0.02em',
          }}
        >
          {CTA.title}
          <br />
          <em style={{ color: 'oklch(0.86 0.025 145)' }}>{CTA.titleEmphasis}</em>
        </h2>

        {/* Lede */}
        <p className="text-lg leading-relaxed text-paper-warm/75 max-w-2xl mx-auto mb-12">
          {CTA.lede}
        </p>

        {/* Waitlist Form - zentriert */}
        <div className="max-w-lg mx-auto">
          <WaitlistForm variant="inline" showPrivacy={true} />
        </div>
      </div>
    </section>
  );
}
