import Link from 'next/link';
import LegalSections from '@/components/legal/LegalSections';
import { AGB_SECTIONS, AGB_DRAFT_NOTICE, LEGAL_VERSION } from '@/lib/legal';

// Texte in lib/legal.ts (eine Quelle für Seite und Vertragsbestätigung).
// ENTWURF — vor öffentlichem Launch rechtlich prüfen lassen.
export const metadata = { title: 'AGB — sarahiver.de' };

export default function Agb() {
  return (
    <main className="px-6 md:px-12 lg:px-20 py-16 max-w-3xl mx-auto">
      <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
        ← Zurück
      </Link>

      <h1 className="display mt-8 mb-4">Allgemeine Geschäftsbedingungen</h1>
      <p className="text-xs text-muted mb-12 italic">
        {AGB_DRAFT_NOTICE} Stand: {LEGAL_VERSION}
      </p>

      <LegalSections sections={AGB_SECTIONS} />
    </main>
  );
}
