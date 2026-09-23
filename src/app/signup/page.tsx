import SignupForm from './SignupForm';
import { VALID_STYLE_IDS } from '@/lib/style-migration';
import PrelaunchNotice from '@/components/launch/PrelaunchNotice';
import { PRE_LAUNCH_MODE } from '@/lib/launch';

/**
 * /signup — Einstieg in den Kauf-Funnel (Einmalzahlung).
 *
 * Vor dem 15.10.2026 wird hier NICHT das Formular gezeigt, sondern der
 * Prelaunch-Zustand: kein Checkout, stattdessen Launch-Anmeldung und die
 * beiden offenen Ziele Demoseiten und Dashboard. Gesteuert allein über
 * PRE_LAUNCH_MODE in lib/launch.ts; die verbindliche Sperre sitzt zusätzlich
 * in der Server Action.
 *
 * Nach dem Launch übernimmt die Wunschdomain aus dem Domain-Check der Landing
 * (?domain=lea-und-ben.de) die Vorbelegung.
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
  searchParams: Promise<{ domain?: string; canceled?: string; style?: string }>;
}) {
  if (PRE_LAUNCH_MODE) return <PrelaunchNotice />;

  const sp = await searchParams;

  return (
    <SignupForm
      initialDomainWish={sanitizeDomain(sp?.domain)}
      canceled={sp?.canceled === '1'}
      // Von der Demo-Seite: ?style=kinetic wählt den Stil vor.
      initialStyle={VALID_STYLE_IDS.includes(sp?.style as never) ? sp?.style : undefined}
    />
  );
}
