import Link from 'next/link';

export const metadata = {
  title: 'Impressum — sarahiver.de',
};

/**
 * Impressum-Platzhalter
 *
 * Vor Launch: Mit echten Daten füllen (TMG-konform).
 * Empfehlung: eRecht24-Generator nutzen (ca. 10€/Jahr).
 */
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
          <p className="text-muted leading-relaxed">
            [PLATZHALTER]
            <br />
            Iver Gentz
            <br />
            [Straße + Hausnummer]
            <br />
            [PLZ + Ort]
            <br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">Kontakt</h2>
          <p className="text-muted leading-relaxed">
            E-Mail: hallo@sarahiver.de
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">Verantwortlich für den Inhalt</h2>
          <p className="text-muted leading-relaxed">
            Iver Gentz (Anschrift wie oben)
          </p>
        </section>

        <p className="text-xs text-muted-2 mt-12 italic">
          Hinweis: Dieses Impressum wird vor dem Launch durch ein vollständiges, rechtssicheres
          Impressum ersetzt.
        </p>
      </div>
    </main>
  );
}
