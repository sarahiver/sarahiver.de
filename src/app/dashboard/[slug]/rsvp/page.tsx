import DashboardSection from '@/components/dashboard/DashboardSection';
import RsvpList from './RsvpList';
import RsvpProtection from './RsvpProtection';
import { loadDashboardData } from '@/lib/dashboard-data';
import { loadRsvps } from '@/lib/rsvp-data';
import { loadRsvpCodeStatus } from '@/lib/rsvp-server';
import { notFound, redirect } from 'next/navigation';

/**
 * /dashboard/[slug]/rsvp
 *
 * Anzeige aller RSVP-Antworten der Hochzeit. Nur erreichbar, wenn der
 * RSVP-Bereich gebucht ist — sonst Redirect auf /upgrade.
 *
 * Keine EditorShell hier: RSVPs sind Daten-Ansicht, keine Editor-Ansicht.
 * Volle Breite, Tabelle mit Suche und Filter.
 *
 * Darüber der RSVP-Schutz: Einladungscode einrichten, ändern, ein- und
 * ausschalten. Der Status kommt aus loadRsvpCodeStatus() und enthält
 * ausdrücklich KEINEN Hash — nur hasCode, enabled und updatedAt.
 */
export default async function RsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  if (!data.purchasedKeys.includes('rsvp')) {
    redirect(`/dashboard/${slug}/upgrade`);
  }

  const [rsvps, codeStatus] = await Promise.all([
    loadRsvps(data.site.id),
    loadRsvpCodeStatus(data.site.id),
  ]);

  return (
    <DashboardSection
      title="RSVP-Antworten"
      description="Wer kommt, wer nicht, mit wem, mit welcher Ernährung."
    >
      <RsvpProtection
        slug={slug}
        hasCode={codeStatus.hasCode}
        enabled={codeStatus.enabled}
        updatedAt={codeStatus.updatedAt}
      />
      <RsvpList slug={slug} initialRsvps={rsvps} />
    </DashboardSection>
  );
}
