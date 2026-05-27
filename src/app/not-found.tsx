import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs tracking-[0.22em] uppercase mb-6 text-muted">
          404 — Nicht gefunden
        </p>
        <h1 className="display mb-6">
          Hier ist noch <em>niemand</em>
        </h1>
        <p className="text-base mb-8 text-ink-soft">
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
