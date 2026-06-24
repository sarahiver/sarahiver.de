import DashboardSection from '@/components/dashboard/DashboardSection';
import { loadDashboardData } from '@/lib/dashboard-data';
import { notFound } from 'next/navigation';
import PhasenForm from './PhasenForm';
import type { Variant } from '@/types/supabase';

/**
 * /dashboard/[slug]/phasen
 *
 * Lebenszyklus der Seite: Save-the-Date (davor) und Archiv (danach), je mit
 * Aktivierung (Aus / Jetzt live / Per Datum), Komponenten-Varianten (A/B/C)
 * und rechter Live-Vorschau.
 */

export const dynamic = 'force-dynamic';

const asV = (v: unknown): Variant => (v === 'b' || v === 'c' ? v : 'a');

export default async function PhasenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const s = data.site;
  const initial = {
    std_enabled: !!s.std_enabled,
    std_until: s.std_until ?? null,
    std_hero_variant: asV(s.std_hero_variant),
    std_countdown_variant: asV(s.std_countdown_variant),
    archiv_enabled: !!s.archiv_enabled,
    archiv_from: s.archiv_from ?? null,
    archiv_message: s.archiv_message ?? null,
    archiv_hero_variant: asV(s.archiv_hero_variant),
    archiv_fotoupload_variant: asV(s.archiv_fotoupload_variant),
  };

  return (
    <DashboardSection
      title="Save-the-Date & Archiv"
      description="Eure Seite begleitet den ganzen Weg: vorher ein Save-the-Date, danach ein Archiv. Links steuern, rechts live sehen."
    >
      <PhasenForm slug={slug} initial={initial} />
    </DashboardSection>
  );
}
