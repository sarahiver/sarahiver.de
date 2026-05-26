import { SITE_CONFIG } from '@/lib/content';

export default function Footer() {
  return (
    <footer className="px-6 md:px-12 lg:px-20 py-12 bg-paper-edge border-t border-rule">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Brand */}
        <div>
          <div className="font-sans font-black text-xl leading-none tracking-[-0.04em] text-ink">
            sarahiver
            <span
              className="font-light italic text-sage-deep"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              .de
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mt-2">
            © 2026 Sarah & Iver · Hamburg
          </p>
        </div>

        {/* Legal Links */}
        <nav className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <a href="/impressum" className="hover:text-ink transition-colors">
            Impressum
          </a>
          <a href="/datenschutz" className="hover:text-ink transition-colors">
            Datenschutz
          </a>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="hover:text-ink transition-colors"
          >
            Kontakt
          </a>
        </nav>
      </div>
    </footer>
  );
}
