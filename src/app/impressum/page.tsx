import Link from 'next/link';

export const metadata = { title: 'Impressum — sarahiver.de' };

export default function Impressum() {
  return (
    <main className="px-6 md:px-12 lg:px-20 py-16 max-w-3xl mx-auto">
      <Link
        href="/"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink"
      >
        ← Zurück
      </Link>

      <h1 className="display mt-8 mb-12">Impressum</h1>

      <div className="space-y-6 text-ink">
        <section>
          <h2 className="text-xl font-medium mb-2">Angaben gemäß § 5 TMG</h2>
          <p className="text-ink-soft leading-relaxed">
            [PLATZHALTER]<br />
            sarahiver UG (i. Gr.)<br />
            Iver Gentz<br />
            [Straße + Hausnummer]<br />
            [PLZ + Ort]<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">Kontakt</h2>
          <p className="text-ink-soft leading-relaxed">E-Mail: hallo@sarahiver.de</p>
        </section>

        <p className="text-xs text-muted mt-12 italic">
          Hinweis: Dieses Impressum wird vor dem Launch durch ein vollständiges,
          rechtssicheres Impressum ersetzt.
        </p>
      </div>
    </main>
  );
}
