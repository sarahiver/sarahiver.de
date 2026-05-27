import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-md text-center">
        <p
          className="font-mono text-xs tracking-[0.22em] uppercase mb-6"
          style={{ color: 'var(--muted)' }}
        >
          404 — Hochzeit nicht gefunden
        </p>

        <h1
          className="display mb-6"
          style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}
        >
          Hier ist noch{' '}
          <span style={{ fontFamily: 'var(--font-script)', color: 'var(--accent)' }}>
            niemand
          </span>
        </h1>

        <p
          className="text-base mb-8"
          style={{ color: 'var(--ink-soft)' }}
        >
          Diese Hochzeitsseite existiert (noch) nicht. Bitte prüft die Adresse —
          oder fragt das Brautpaar nach dem richtigen Link.
        </p>

        <Link
          href="https://sarahiver.com"
          className="text-sm font-medium underline decoration-1 underline-offset-4"
          style={{ color: 'var(--accent-deep)' }}
        >
          Mehr über sarahiver.de
        </Link>
      </div>
    </main>
  );
}
