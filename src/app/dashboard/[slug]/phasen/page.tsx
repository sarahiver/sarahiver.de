import DashboardSection from '@/components/dashboard/DashboardSection';
import { loadDashboardData } from '@/lib/dashboard-data';
import { notFound } from 'next/navigation';
import PhasenForm from './PhasenForm';
import type { Variant } from '@/types/supabase';

/**
 * /dashboard/[slug]/phasen
 *
 * Steuerung des Seiten-Lebenszyklus: Save-the-Date (davor) und Archiv (danach).
 * Beide an/aus + optionales Datum. Die Hauptseite läuft dazwischen automatisch.
 */

export const dynamic = 'force-dynamic';

export default async function PhasenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const s = data.site;
  const initial = {
    std_enabled: !!s.std_enabled,
    std_until: s.std_until ?? null,
    std_variant: (s.std_variant as Variant) || 'a',
    archiv_enabled: !!s.archiv_enabled,
    archiv_from: s.archiv_from ?? null,
    archiv_message: s.archiv_message ?? null,
  };

  return (
    <DashboardSection
      title="Save-the-Date & Archiv"
      description="Eure Seite begleitet den ganzen Weg: vorher ein Save-the-Date, danach ein Archiv zum Erinnern."
    >
      <PhasenForm slug={slug} initial={initial} />
    </DashboardSection>
  );
}
