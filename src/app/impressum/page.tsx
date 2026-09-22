import Link from 'next/link';
import { OPERATOR, VAT_NOTE } from '@/lib/legal';

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
          <h2 className="text-xl font-medium mb-2">Angaben gemäß § 5 DDG</h2>
          <p className="text-ink-soft leading-relaxed">
            {OPERATOR.name}
            <br />
            {OPERATOR.person}
            <br />
            {OPERATOR.street}
            <br />
            {OPERATOR.city}
            <br />
            {OPERATOR.country}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">Kontakt</h2>
          <p className="text-ink-soft leading-relaxed">
            E-Mail: <a className="underline" href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p className="text-ink-soft leading-relaxed">
            {OPERATOR.person}, {OPERATOR.street}, {OPERATOR.city}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">Umsatzsteuer</h2>
          <p className="text-ink-soft leading-relaxed">{VAT_NOTE}</p>
        </section>
      </div>
    </main>
  );
}
