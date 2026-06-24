import ContactForm from './ContactForm';

/**
 * /kontakt — öffentliche Kontaktseite mit Formular.
 *
 * Damit User dich nicht nur über Impressum/mailto erreichen, sondern direkt
 * über ein Formular — gerade bei Abrechnungs- oder Trial-Fragen. Die Nachricht
 * geht serverseitig (api/contact) per Brevo an die Kontakt-Adresse.
 */

export const metadata = {
  title: 'Kontakt — sarahiver.de',
  description:
    'Fragen zu eurer Hochzeitsseite, zur Abrechnung oder zur Testphase? Schreibt uns — wir melden uns zeitnah.',
};

export default function KontaktPage() {
  return (
    <div style={wrap}>
      <span style={eyebrow}>Kontakt</span>
      <h1 style={title}>Schreibt uns</h1>
      <p style={lede}>
        Egal ob es um eure Seite, die Testphase oder eine Frage zur Abrechnung geht — meldet euch
        einfach. Wir antworten so schnell wir können, meist innerhalb eines Werktags.
      </p>

      <ContactForm />

      <p style={hint}>
        Lieber direkt per Mail? <a href="mailto:hallo@sarahiver.de" style={link}>hallo@sarahiver.de</a>
      </p>
    </div>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '80px 20px',
  fontFamily: 'Inter, system-ui, sans-serif',
  color: '#0F0E0C',
};
const eyebrow: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#8a857c',
};
const title: React.CSSProperties = {
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: 'clamp(30px,6vw,44px)',
  margin: '10px 0 14px',
  fontWeight: 600,
};
const lede: React.CSSProperties = { color: '#5f5b53', fontSize: 16, lineHeight: 1.6, marginBottom: 36 };
const hint: React.CSSProperties = { color: '#a39d92', fontSize: 13, marginTop: 28, textAlign: 'center' };
const link: React.CSSProperties = { color: '#5f5b53', textDecoration: 'underline' };
