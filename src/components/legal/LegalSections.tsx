import type { LegalSection } from '@/lib/legal';

/** Rendert Rechtstext-Abschnitte im Stil von Impressum/Datenschutz. */
export default function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="space-y-6 text-ink">
      {sections.map((s) => (
        <section key={s.title}>
          <h2 className="text-xl font-medium mb-2">{s.title}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="text-ink-soft leading-relaxed mb-3">
              {p}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
