import { notFound } from 'next/navigation';
import DashboardSection from '@/components/dashboard/DashboardSection';
import { loadDashboardData } from '@/lib/dashboard-data';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import MusicWishesList, { type MusicWishRecord } from './MusicWishesList';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function MusicWishesPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const supabase = createSupabaseAdminClient();
  let wishes: MusicWishRecord[] = [];

  if (supabase) {
    const { data: rows, error } = await supabase
      .from('wedding_music_wishes')
      .select('id, title, artist, guest_name, created_at')
      .eq('wedding_site_id', data.site.id)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('[music-wishes] load failed:', error);
    } else {
      wishes = (rows || []) as MusicWishRecord[];
    }
  }

  const coupleNames = `${data.site.couple_name_1}-${data.site.couple_name_2}`;

  return (
    <DashboardSection
      title="Musikwünsche"
      description={
        wishes.length > 0
          ? `${wishes.length} ${wishes.length === 1 ? 'Wunsch' : 'Wünsche'} eingegangen. Exportiert die Liste für euren DJ.`
          : 'Hier sammeln sich die Songwünsche eurer Gäste.'
      }
    >
      <MusicWishesList slug={slug} wishes={wishes} coupleNames={coupleNames} />
    </DashboardSection>
  );
}
