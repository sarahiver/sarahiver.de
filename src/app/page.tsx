import Link from 'next/link';

/**
 * Homepage auf der Hauptdomain (sarahiver.de).
 *
 * Da sarahiver.de das Wedding-Site-Repo ist und das Marketing
 * in einem SEPARATEN Repo läuft, zeigt diese Seite einen
 * Hinweis und Link.
 *
 * Sobald Multi-Tenant funktioniert, wird das Brautpaar von hier
 * NICHT mehr aus erreicht — User landen direkt auf ihrer Subdomain.
 */
export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-lg text-center">
        <div
          className="font-medium text-3xl leading-none tracking-[-0.018em] mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          sarahiver
          <span style={{ color: 'var(--accent)' }}>.</span>
          de
        </div>

        <p
          className="text-base mb-8"
          style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}
        >
          Diese Domain hostet Hochzeitsseiten von Brautpaaren im DACH-Raum.
          <br />
          Jedes Brautpaar bekommt seine eigene Subdomain.
        </p>

        <p
          className="text-sm mb-8"
          style={{ color: 'var(--muted)' }}
        >
          Beispiel: <code style={{ color: 'var(--accent-deep)' }}>sarah-und-iver.sarahiver.de</code>
        </p>

        <Link
          href="https://sarahiver.com"
          className="inline-block px-6 py-3 rounded-xl text-white font-medium text-sm transition-transform hover:-translate-y-px"
          style={{ background: 'var(--accent)' }}
        >
          Mehr über sarahiver.de →
        </Link>
      </div>
    </main>
  );
}
