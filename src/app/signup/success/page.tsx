import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { TrackView } from '@/components/analytics/Track';
import { EVENTS } from '@/lib/analytics';
import { WEBSITE_PRICE_EUR } from '@/lib/pricing';
/**
 * /signup/success — Landung nach erfolgreichem Stripe-Checkout.
 *
 * Hinweis: Die eigentliche Bereitstellung (Account + Seite anlegen, Login-Mail)
 * passiert serverseitig im Stripe-Webhook (nächste Bau-Scheibe). Diese Seite
 * bestätigt nur die Zahlung und verweist auf die Login-Mail.
 */

// Immer frisch prüfen, ob der Webhook die Seite schon angelegt hat.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Zahlung erfolgreich — sarahiver.de',
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;

  /**
   * Funnel-Messung: checkout_success und site_created feuern NUR, wenn zu
   * dieser Checkout-Session serverseitig bereits eine Hochzeitsseite
   * angelegt wurde (der Stripe-Webhook hat also Zahlung und Provisionierung
   * bestätigt). Der bloße Aufruf dieser URL zählt nicht. An Analytics geht
   * nur der Stil — keine Session-ID, keine Kundendaten.
   */
  let paidStyle: string | null = null;
  const sessionId = typeof sp?.session_id === 'string' ? sp.session_id : '';
  if (sessionId) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data } = await admin
        .from('wedding_sites')
        .select('start_style_id, purchase_status')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();
      const row = data as { start_style_id: string | null; purchase_status: string | null } | null;
      if (row && row.purchase_status === 'paid') paidStyle = row.start_style_id ?? 'unknown';
    }
  }
  // Gleicher Schlüssel je Session-ID: ein Reload zählt nicht erneut.
  const onceKey = `checkout-${sessionId.slice(-12) || 'none'}`;

  return (
    <div style={wrap}>
      {paidStyle && (
        <>
          <TrackView
            event={EVENTS.checkoutSuccess}
            onceKey={onceKey}
            params={{ style: paidStyle, amount: WEBSITE_PRICE_EUR, currency: 'EUR' }}
          />
          <TrackView event={EVENTS.siteCreated} onceKey={`site-${onceKey}`} params={{ style: paidStyle }} />
        </>
      )}
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
