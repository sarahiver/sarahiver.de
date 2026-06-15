import SignupForm from './SignupForm';

/**
 * /signup — Onboarding-Einstieg in den Self-Service-Funnel.
 *
 * Übernimmt die Konfigurator-Auswahl per Query (?addons=key,key&domain=1)
 * und startet nach dem Ausfüllen den Stripe-Checkout (Server Action).
 */

export const metadata = {
  title: 'Hochzeitsseite buchen — sarahiver.de',
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ addons?: string; domain?: string; canceled?: string }>;
}) {
  const sp = await searchParams;
  const initialAddons = (sp?.addons || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const initialDomain = sp?.domain === '1';
  const canceled = sp?.canceled === '1';

  return (
    <SignupForm
      initialAddons={initialAddons}
      initialDomain={initialDomain}
      canceled={canceled}
    />
  );
}
