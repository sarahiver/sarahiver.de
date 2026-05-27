import { FOOTER, SITE_CONFIG } from '@/lib/content';

export default function Footer() {
  return (
    <footer
      className="px-6 md:px-12 lg:px-20 py-14 border-t border-rule"
      style={{ background: 'var(--color-paper-soft)' }}
    >
      <div className="grid lg:grid-cols-[1.4fr_2fr] gap-10 lg:gap-16">
        {/* Brand + Description */}
        <div>
          <div
            className="font-medium text-2xl leading-none tracking-[-0.018em] text-ink mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            sarahiver
            <span style={{ color: 'var(--color-terra)' }}>.</span>
            de
          </div>
          <p className="text-sm leading-relaxed text-ink-soft max-w-md">{FOOTER.desc}</p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-3 gap-6">
          {FOOTER.cols.map((col) => (
            <div key={col.h}>
              <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted mb-4">
                {col.h}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href={link === 'Impressum' ? '/impressum' : link === 'Datenschutz' ? '/datenschutz' : '#'}
                      className="text-sm text-ink-soft hover:text-ink transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Meta-Bar */}
      <div className="mt-10 pt-6 border-t border-rule-soft flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
          {FOOTER.meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <a
          href={`mailto:${SITE_CONFIG.email}`}
          className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors"
        >
          {SITE_CONFIG.email}
        </a>
      </div>
    </footer>
  );
}
