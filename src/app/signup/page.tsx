import SignupForm from './SignupForm';

/**
 * /signup — Einstieg in den Self-Service-Funnel (Einmalzahlung).
 *
 * Übernimmt die Wunschdomain aus dem Domain-Check der Landing
 * (?domain=lea-und-ben.de) und startet nach dem Ausfüllen den
 * Stripe-Checkout (Server Action).
 */

export const metadata = {
  title: 'Hochzeitswebsite bestellen — sarahiver.de',
  robots: { index: false, follow: false },
};

/** Nur übernehmen, was wie eine Domain aussieht — der Wert kommt aus der URL. */
function sanitizeDomain(raw: string | undefined): string {
  const v = (raw || '').trim().toLowerCase();
  return /^[a-z0-9äöüß][a-z0-9äöüß-]{1,62}\.[a-z]{2,20}$/.test(v) ? v : '';
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; canceled?: string }>;
}) {
  const sp = await searchParams;

  return (
    <SignupForm
      initialDomainWish={sanitizeDomain(sp?.domain)}
      canceled={sp?.canceled === '1'}
    />
  );
}
