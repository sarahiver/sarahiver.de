import { notFound } from 'next/navigation';
import DashboardSection from '@/components/dashboard/DashboardSection';
import { loadDashboardData, findBereich } from '@/lib/dashboard-data';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import GiftReservationsList, { type GiftReservationRecord } from './GiftReservationsList';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function GiftReservationsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const supabase = createSupabaseAdminClient();
  let reservations: GiftReservationRecord[] = [];

  if (supabase) {
    const { data: rows, error } = await supabase
      .from('wedding_gift_reservations')
      .select('id, item_id, item_title, guest_name, created_at')
      .eq('wedding_site_id', data.site.id)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('[gift-reservations] load failed:', error);
    } else {
      reservations = (rows || []) as GiftReservationRecord[];
    }
  }

  // Total-Anzahl der Items aus content_draft (Editor-Ansicht)
  const giftsBereich = findBereich(data.bereiche, 'gifts');
  const items = giftsBereich?.content_draft && Array.isArray((giftsBereich.content_draft as Record<string, unknown>).items)
    ? ((giftsBereich.content_draft as Record<string, unknown>).items as unknown[])
    : [];
  const totalItems = items.length;

  return (
    <DashboardSection
      title="Geschenke"
      description={
        reservations.length > 0
          ? `${reservations.length} ${reservations.length === 1 ? 'Reservierung' : 'Reservierungen'} eingegangen.`
          : 'Hier seht ihr, welche Geschenke reserviert wurden.'
      }
    >
      <GiftReservationsList slug={slug} reservations={reservations} totalItems={totalItems} />
    </DashboardSection>
  );
}
