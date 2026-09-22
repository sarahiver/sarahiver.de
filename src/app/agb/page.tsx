import Link from 'next/link';

// TODO: finaler Rechtstext vor Launch einsetzen.
// Diese Seite ist nur die technische Grundlage (Route, Verlinkung aus Footer
// und Bestellformular). Sie enthält bewusst KEINEN juristischen Text.
export const metadata = { title: 'AGB — sarahiver.de', robots: { index: false, follow: false } };

export default function Agb() {
  return (
    <main className="px-6 md:px-12 lg:px-20 py-16 max-w-3xl mx-auto">
      <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
        ← Zurück
      </Link>

      <h1 className="display mt-8 mb-12">Allgemeine Geschäftsbedingungen</h1>

      <p className="text-ink-soft leading-relaxed">
        Die Allgemeinen Geschäftsbedingungen werden vor dem Launch hier veröffentlicht.
      </p>
      <p className="text-ink-soft leading-relaxed mt-4">
        Fragen vorab: <a className="underline" href="mailto:hallo@sarahiver.de">hallo@sarahiver.de</a>
      </p>
    </main>
  );
}
