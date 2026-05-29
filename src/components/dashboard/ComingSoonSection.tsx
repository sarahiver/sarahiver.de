/**
 * Platzhalter für Dashboard-Sections, deren Inhalt wir noch nicht gebaut haben.
 * Wird Section für Section ersetzt, sobald wir die Felder/Logik klären.
 */

interface Props {
  what: string;
}

export default function ComingSoonSection({ what }: Props) {
  return (
    <div className="dash-coming-soon">
      <div className="dash-coming-mark">In Arbeit</div>
      <h2 className="dash-coming-title">{what}</h2>
      <p className="dash-coming-desc">
        Diese Section bauen wir gleich gemeinsam aus. Wir gehen Komponente für Komponente
        durch und klären Felder, Datenbankeinträge und Editor-UI.
      </p>
    </div>
  );
}
