/**
 * /signup/success — Landung nach erfolgreichem Stripe-Checkout.
 *
 * Hinweis: Die eigentliche Bereitstellung (Account + Seite anlegen, Login-Mail)
 * passiert serverseitig im Stripe-Webhook (nächste Bau-Scheibe). Diese Seite
 * bestätigt nur die Zahlung und verweist auf die Login-Mail.
 */

export const metadata = {
  title: 'Zahlung erfolgreich — sarahiver.de',
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  await searchParams; // session_id wird später (Webhook-Scheibe) zur Statusanzeige genutzt

  return (
    <div style={wrap}>
      <span style={eyebrow}>Geschafft</span>
      <h1 style={title}>Zahlung erfolgreich 🤍</h1>
      <p style={lede}>
        Wir richten eure Hochzeitsseite gerade ein. In wenigen Augenblicken bekommt ihr
        eine E-Mail mit eurem persönlichen Login-Link — darüber kommt ihr direkt ins Dashboard.
      </p>
      <p style={hint}>
        Keine Mail nach ein paar Minuten? Schaut im Spam-Ordner oder meldet euch bei uns.
      </p>
    </div>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '80px 20px',
  textAlign: 'center',
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
const lede: React.CSSProperties = { color: '#5f5b53', fontSize: 16, lineHeight: 1.6 };
const hint: React.CSSProperties = { color: '#a39d92', fontSize: 13, marginTop: 18 };
