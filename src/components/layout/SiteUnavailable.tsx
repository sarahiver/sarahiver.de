/**
 * SiteUnavailable — freundliche Platzhalter-Seite, wenn eine Hochzeitsseite
 * wegen beendetem Abo nicht ausgeliefert wird. Bewusst KEIN 404: Gäste mit dem
 * geteilten Link sollen eine ruhige Erklärung sehen, keinen Fehler.
 */
export default function SiteUnavailable() {
  return (
    <div style={wrap}>
      <div style={card}>
        <div style={mark}>S&amp;I.</div>
        <h1 style={title}>Diese Seite ist gerade nicht verfügbar</h1>
        <p style={text}>
          Die Hochzeitsseite ist momentan offline. Bist du Gast, frag am besten direkt beim Brautpaar
          nach dem aktuellen Link.
        </p>
        <p style={small}>
          Bist du das Brautpaar?{' '}
          <a href="/login" style={link}>
            Im Dashboard anmelden
          </a>{' '}
          oder{' '}
          <a href="/kontakt" style={link}>
            uns kontaktieren
          </a>
          .
        </p>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#F7F5F1',
  padding: 20,
  fontFamily: 'Inter, system-ui, sans-serif',
};
const card: React.CSSProperties = {
  maxWidth: 480,
  width: '100%',
  background: '#FFFFFF',
  borderRadius: 18,
  padding: 44,
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};
const mark: React.CSSProperties = {
  fontFamily: 'Roboto, system-ui, sans-serif',
  fontWeight: 800,
  letterSpacing: '-0.06em',
  fontSize: 20,
  color: '#0F0E0C',
  marginBottom: 20,
};
const title: React.CSSProperties = {
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: 'clamp(22px,5vw,30px)',
  fontWeight: 600,
  color: '#0F0E0C',
  margin: '0 0 12px',
};
const text: React.CSSProperties = { color: '#5f5b53', fontSize: 15, lineHeight: 1.6, margin: '0 0 18px' };
const small: React.CSSProperties = { color: '#a39d92', fontSize: 13, lineHeight: 1.6, margin: 0 };
const link: React.CSSProperties = { color: '#5f5b53', textDecoration: 'underline' };
