import { describeSubscription } from '@/lib/subscription';

/**
 * SubscriptionBanner — zeigt oben im Dashboard den Abo-Zustand:
 *   - trial:    "Testphase, noch X Tage" (+ Hinweis auf automatische Abrechnung)
 *   - past_due: "Zahlung fehlgeschlagen" (+ Abrechnung verwalten)
 *   - canceled: "Abo beendet" (+ reaktivieren/Abrechnung)
 *   - none:     nichts (active oder Alt-Site)
 *
 * Server Component. Reines Markup + Links; keine Client-Interaktion nötig.
 */

interface Props {
  slug: string;
  status: string | null | undefined;
  currentPeriodEnd: string | null | undefined;
}

export default function SubscriptionBanner({ slug, status, currentPeriodEnd }: Props) {
  const view = describeSubscription(status, currentPeriodEnd);
  if (view.kind === 'none') return null;

  const portalHref = `/api/stripe/portal?slug=${encodeURIComponent(slug)}`;

  if (view.kind === 'trial') {
    const days = view.daysLeft;
    const when =
      days === undefined ? 'bald' : days === 0 ? 'heute' : days === 1 ? 'morgen' : `in ${days} Tagen`;
    return (
      <div style={shell('info')}>
        <div style={textCol}>
          <strong style={heading}>Testphase aktiv — endet {when}</strong>
          <span style={sub}>
            {view.endDateLabel ? `Bis ${view.endDateLabel} kostenlos. ` : ''}
            Danach startet euer Abo automatisch über die hinterlegte Zahlungsart. Ihr müsst nichts tun.
          </span>
        </div>
        <a href={portalHref} style={btnGhost}>
          Abrechnung verwalten
        </a>
      </div>
    );
  }

  if (view.kind === 'past_due') {
    return (
      <div style={shell('warn')}>
        <div style={textCol}>
          <strong style={heading}>Zahlung fehlgeschlagen</strong>
          <span style={sub}>
            Die letzte Abbuchung hat nicht geklappt. Bitte aktualisiert eure Zahlungsart, damit eure
            Seite online bleibt.
          </span>
        </div>
        <a href={portalHref} style={btnSolid}>
          Zahlungsart aktualisieren
        </a>
      </div>
    );
  }

  // canceled
  return (
    <div style={shell('warn')}>
      <div style={textCol}>
        <strong style={heading}>Abo beendet</strong>
        <span style={sub}>
          Euer Abo ist beendet — eure Seite ist für Gäste nicht mehr erreichbar. Über die Abrechnung
          könnt ihr es reaktivieren.
        </span>
      </div>
      <a href={portalHref} style={btnSolid}>
        Abrechnung öffnen
      </a>
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

const textCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 240, flex: 1 };
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
