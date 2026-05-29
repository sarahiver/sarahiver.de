import type { WeddingBereich } from '@/types/supabase';

/**
 * BereichPlaceholder — Stub für Bereich-Komponenten, die noch
 * nicht gebaut sind. Zeigt eine dezente Karte mit dem Bereich-Namen.
 *
 * Sobald die echte Komponente existiert, wird dieser Stub
 * in BereichRenderer.tsx ersetzt.
 */

const BEREICH_LABELS: Record<string, string> = {
  hero: 'Hero',
  rsvp: 'RSVP',
  timeline: 'Timeline',
  lovestory: 'Lovestory',
  gallery: 'Galerie',
  photoupload: 'Foto-Upload',
  gifts: 'Geschenke',
  accommodations: 'Übernachtung',
  countdown: 'Countdown',
  guestbook: 'Gästebuch',
  faq: 'FAQ',
  musicwishes: 'Musikwünsche',
  witnesses: 'Trauzeugen',
  weddingabc: 'Hochzeits-ABC',
};

export default function BereichPlaceholder({ bereich }: { bereich: WeddingBereich }) {
  const label = BEREICH_LABELS[bereich.bereich_key] ?? bereich.bereich_key;

  return (
    <div
      className="px-6 md:px-12 lg:px-20 py-16 text-center"
      style={{ color: 'var(--ink-soft)' }}
    >
      <div
        className="inline-flex items-center gap-3 px-4 py-2 rounded-full"
        style={{
          background: 'var(--bg-soft)',
          border: '1px dashed var(--border)',
        }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Coming soon
        </span>
        <span
          className="text-sm font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
        >
          {label} — Variante {bereich.variant.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
