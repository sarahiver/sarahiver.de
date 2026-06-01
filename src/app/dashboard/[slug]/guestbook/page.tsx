import { notFound } from 'next/navigation';
import DashboardSection from '@/components/dashboard/DashboardSection';
import { loadDashboardData } from '@/lib/dashboard-data';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import GuestbookList, { type GuestbookEntryRecord } from './GuestbookList';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function GuestbookModerationPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const supabase = createSupabaseAdminClient();
  let entries: GuestbookEntryRecord[] = [];

  if (supabase) {
    const { data: rows, error } = await supabase
      .from('wedding_guestbook_entries')
      .select('id, name, message, status, created_at, reviewed_at')
      .eq('wedding_site_id', data.site.id)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('[guestbook] load failed:', error);
    } else {
      entries = (rows || []) as GuestbookEntryRecord[];
    }
  }

  const pendingCount = entries.filter((e) => e.status === 'pending').length;

  return (
    <DashboardSection
      title="Gästebuch"
      description={
        pendingCount > 0
          ? `${pendingCount} ${pendingCount === 1 ? 'Eintrag wartet' : 'Einträge warten'} auf Freigabe.`
          : 'Einträge eurer Gäste — prüft, gebt frei oder lehnt ab.'
      }
    >
      <GuestbookList slug={slug} entries={entries} />
    </DashboardSection>
  );
}
