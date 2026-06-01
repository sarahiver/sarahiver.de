import DashboardSection from '@/components/dashboard/DashboardSection';
import RsvpList from './RsvpList';
import { loadDashboardData } from '@/lib/dashboard-data';
import { loadRsvps } from '@/lib/rsvp-data';
import { notFound, redirect } from 'next/navigation';

/**
 * /dashboard/[slug]/rsvp
 *
 * Anzeige aller RSVP-Antworten der Hochzeit. Nur erreichbar, wenn der
 * RSVP-Bereich gebucht ist — sonst Redirect auf /upgrade.
 *
 * Keine EditorShell hier: RSVPs sind Daten-Ansicht, keine Editor-Ansicht.
 * Volle Breite, Tabelle mit Suche und Filter.
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

  const rsvps = await loadRsvps(data.site.id);

  return (
    <DashboardSection
      title="RSVP-Antworten"
      description="Wer kommt, wer nicht, mit wem, mit welcher Ernährung."
    >
      <RsvpList slug={slug} initialRsvps={rsvps} />
    </DashboardSection>
  );
}
