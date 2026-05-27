import Link from 'next/link';

export const metadata = { title: 'Datenschutz — sarahiver.de' };

export default function Datenschutz() {
  return (
    <main className="px-6 md:px-12 lg:px-20 py-16 max-w-3xl mx-auto">
      <Link
        href="/"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink"
      >
        ← Zurück
      </Link>

      <h1 className="display mt-8 mb-12">Datenschutz</h1>

      <div className="space-y-6 text-ink">
        <section>
          <h2 className="text-xl font-medium mb-2">1. Verantwortlicher</h2>
          <p className="text-ink-soft leading-relaxed">
            sarahiver UG (i. Gr.) — Anschrift siehe Impressum<br />
            E-Mail: hallo@sarahiver.de
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">2. Warteliste-Anmeldung</h2>
          <p className="text-ink-soft leading-relaxed">
            Wenn ihr euch auf unsere Warteliste eintragt, verarbeiten wir eure E-Mail-Adresse,
            um euch über den Launch von sarahiver.de zu informieren. Die Speicherung erfolgt
            bei unserem Email-Dienstleister Brevo (Sendinblue GmbH, Köpenicker Straße 126,
            10179 Berlin). Ihr könnt euch jederzeit über den Abmeldelink austragen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">3. Hosting</h2>
          <p className="text-ink-soft leading-relaxed">
            Diese Website wird bei Vercel Inc. gehostet. Vercel speichert Server-Logs mit
            IP-Adresse zur Sicherheit für maximal 30 Tage.
          </p>
        </section>

        <p className="text-xs text-muted mt-12 italic">
          Hinweis: Diese Datenschutzerklärung wird vor dem Launch durch eine vollständige,
          rechtssichere Version ersetzt.
        </p>
      </div>
    </main>
  );
}
