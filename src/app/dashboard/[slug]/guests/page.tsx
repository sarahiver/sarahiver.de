import DashboardSection from '@/components/dashboard/DashboardSection';
import GuestListSection from './GuestListSection';
import { loadDashboardData } from '@/lib/dashboard-data';
import { loadGuestList } from '@/lib/guest-list-data';
import { loadRsvps } from '@/lib/rsvp-data';
import { notFound, redirect } from 'next/navigation';

/**
 * /dashboard/[slug]/guests
 *
 * Gästeliste mit Status-Abgleich und Erinnerungs-Versand.
 *
 * Vorausgesetzt: rsvp ist gebucht (sonst macht die Liste keinen Sinn).
 */
export default async function GuestsPage({
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

  const [guestList, rsvps] = await Promise.all([
    loadGuestList(data.site.id),
    loadRsvps(data.site.id),
  ]);

  const coupleNames = [data.site.couple_name_1, data.site.couple_name_2]
    .filter(Boolean)
    .join(' & ') || 'Brautpaar';

  return (
    <DashboardSection
      title="Gästeliste"
      description="Eingeladene Gäste verwalten, Status verfolgen, Erinnerungen versenden."
    >
      <GuestListSection
        slug={slug}
        coupleNames={coupleNames}
        weddingDateIso={data.site.wedding_date}
        hasPhotoUpload={data.purchasedKeys.includes('photoupload')}
        guestList={guestList}
        rsvps={rsvps}
      />
    </DashboardSection>
  );
}
