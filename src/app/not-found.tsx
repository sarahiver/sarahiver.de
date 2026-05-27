import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-paper)' }}
    >
      <div className="max-w-md text-center">
        <p
          className="font-mono text-xs tracking-[0.22em] uppercase mb-6"
          style={{ color: 'var(--color-muted)' }}
        >
          404 — Nicht gefunden
        </p>

        <h1
          className="display mb-6"
          style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
          }}
        >
          Hier ist noch{' '}
          <span style={{ fontFamily: 'var(--font-script)', color: 'var(--color-terra)' }}>
            niemand
          </span>
        </h1>

        <p
          className="text-base mb-8"
          style={{ color: 'var(--color-ink-soft)', fontFamily: 'var(--font-sans)' }}
        >
          Diese Hochzeitsseite existiert (noch) nicht. Bitte prüft die Adresse —
          oder fragt das Brautpaar nach dem richtigen Link.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl text-white font-medium text-sm transition-transform hover:-translate-y-px"
          style={{ background: 'var(--color-terra)' }}
        >
          Zur Startseite →
        </Link>
      </div>
    </main>
  );
}
