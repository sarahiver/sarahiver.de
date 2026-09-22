import Link from 'next/link';
import LegalSections from '@/components/legal/LegalSections';
import { WIDERRUF_SECTIONS, WIDERRUF_FORM_LINES, LEGAL_VERSION } from '@/lib/legal';

// Texte in lib/legal.ts (eine Quelle für Seite und Vertragsbestätigung).
export const metadata = { title: 'Widerrufsbelehrung — sarahiver.de' };

export default function Widerruf() {
  return (
    <main className="px-6 md:px-12 lg:px-20 py-16 max-w-3xl mx-auto">
      <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
        ← Zurück
      </Link>

      <h1 className="display mt-8 mb-4">Widerrufsbelehrung</h1>
      <p className="text-xs text-muted mb-12 italic">Stand: {LEGAL_VERSION}</p>

      <LegalSections sections={WIDERRUF_SECTIONS} />

      <section className="mt-12 text-ink">
        <h2 className="text-xl font-medium mb-2">Muster-Widerrufsformular</h2>
        {WIDERRUF_FORM_LINES.map((line, i) => (
          <p key={i} className="text-ink-soft leading-relaxed mb-2">
            {line}
          </p>
        ))}
      </section>
    </main>
  );
}
