import { describeAccess } from '@/lib/access';

/**
 * AccessBanner — zeigt oben im Dashboard, wie lange die Seite online ist.
 *
 * Löst den SubscriptionBanner ab (es gibt kein Abo mehr):
 *   info     — dezenter Hinweis mit Enddatum
 *   expiring — weniger als 60 Tage
 *   expired  — Laufzeit vorbei, Seite ist für Gäste offline
 *   none     — Alt-Site ohne Laufzeitdatum: nichts anzeigen
 *
 * Server Component. Reines Markup, keine Client-Interaktion.
 */

interface Props {
  accessUntil: string | null | undefined;
}

export default function AccessBanner({ accessUntil }: Props) {
  const view = describeAccess(accessUntil);
  if (view.kind === 'none') return null;

  if (view.kind === 'expired') {
    return (
      <div style={shell('warn')}>
        <div style={textCol}>
          <strong style={heading}>Laufzeit beendet</strong>
          <span style={sub}>
            Eure Seite war bis {view.dateLabel} online und ist jetzt für Gäste nicht mehr
            erreichbar. Eure Inhalte sind gespeichert — schreibt uns, wenn ihr sie wieder online
            stellen möchtet.
          </span>
        </div>
        <a href="/kontakt" style={btnSolid}>
          Kontakt aufnehmen
        </a>
      </div>
    );
  }

  if (view.kind === 'expiring') {
    const days = view.daysLeft ?? 0;
    const when = days === 0 ? 'heute' : days === 1 ? 'morgen' : `in ${days} Tagen`;
    return (
      <div style={shell('warn')}>
        <div style={textCol}>
          <strong style={heading}>Eure Seite läuft {when} aus</strong>
          <span style={sub}>
            Online bis {view.dateLabel}. Danach ist sie für Gäste nicht mehr erreichbar — ladet
            euch vorher eure Fotos und die Gästeliste herunter.
          </span>
        </div>
        <a href="/kontakt" style={btnGhost}>
          Fragen? Schreibt uns
        </a>
      </div>
    );
  }

  return (
    <div style={shell('info')}>
      <div style={textCol}>
        <strong style={heading}>Eure Seite ist online bis {view.dateLabel}</strong>
        <span style={sub}>Einmal bezahlt, kein Abo — es wird nichts automatisch verlängert.</span>
      </div>
    </div>
  );
}

type Tone = 'info' | 'warn';

function shell(tone: Tone): React.CSSProperties {
  const palette =
    tone === 'warn'
      ? { bg: '#FCEEEC', border: '#F3CFC9', ink: '#7A1F1A' }
      : { bg: '#F1F4EF', border: '#D8E0CF', ink: '#3F4A33' };
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    background: palette.bg,
    border: `1px solid ${palette.border}`,
    color: palette.ink,
    borderRadius: 12,
    padding: '14px 18px',
    margin: '0 0 20px',
    fontFamily: 'Inter, system-ui, sans-serif',
  };
}

const textCol: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 240,
  flex: 1,
};
const heading: React.CSSProperties = { fontSize: 14, fontWeight: 700 };
const sub: React.CSSProperties = { fontSize: 13, lineHeight: 1.5, opacity: 0.9 };

const btnBase: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
  padding: '9px 16px',
  borderRadius: 8,
  whiteSpace: 'nowrap',
};
const btnSolid: React.CSSProperties = { ...btnBase, background: '#0F0E0C', color: '#FFFFFF' };
const btnGhost: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: 'inherit',
  border: '1px solid currentColor',
};
