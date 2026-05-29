import DashboardSection from '@/components/dashboard/DashboardSection';
import EditorShell from '@/components/dashboard/EditorShell';
import BereicheListe from './BereicheListe';
import { loadDashboardData } from '@/lib/dashboard-data';
import type { BereichKey } from '@/types/supabase';
import { notFound } from 'next/navigation';

/**
 * /dashboard/[slug]/bereiche
 *
 * Verwaltung der Reihenfolge, Varianten und Aktivierung aller gebuchten
 * Bereiche. Hero ist oben fixiert (kann nicht verschoben/deaktiviert werden).
 *
 * Layout: dreispaltig — Editor links, Live-Vorschau rechts.
 */

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  // Nur gebuchte Bereiche werden gezeigt. Wenn ein gebuchter Bereich noch
  // keinen wedding_bereiche-Eintrag hat (Pre-Setup), blenden wir ihn hier
  // erstmal aus — Setup-Flow erst nach Funnel-Anbindung.
  const purchased = new Set<BereichKey>(data.purchasedKeys);
  const initialBereiche = data.bereiche
    .filter((b) => purchased.has(b.bereich_key as BereichKey))
    .sort((a, b) => a.display_order - b.display_order)
    .map((b) => ({
      id: b.id,
      bereich_key: b.bereich_key as BereichKey,
      variant: (b.variant as 'a' | 'b' | 'c') || 'a',
      is_active: !!b.is_active,
      display_order: b.display_order,
    }));

  return (
    <DashboardSection
      title="Bereiche & Reihenfolge"
      description="Welche Bereiche eure Seite zeigt, in welcher Reihenfolge und Variante."
    >
      <EditorShell weddingSlug={slug} mobileBlock={false}>
        <BereicheListe slug={slug} initialBereiche={initialBereiche} />
      </EditorShell>
    </DashboardSection>
  );
}
