import DashboardSection from '@/components/dashboard/DashboardSection';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';
import { bereichLabel } from '@/lib/dashboard-nav';
import { loadDashboardData, findBereich } from '@/lib/dashboard-data';
import type { BereichKey } from '@/types/supabase';
import { notFound } from 'next/navigation';

/**
 * Dynamische Editor-Route pro Bereich:
 *   /dashboard/[slug]/bereiche/[bereichKey]
 *
 * Aktuell: zeigt nur "Coming Soon" mit Bereichsname. Die Editoren bauen wir
 * Bereich für Bereich gemeinsam (Felder, Validierung, Submit).
 */

const KNOWN_KEYS: BereichKey[] = [
  'hero', 'countdown', 'lovestory', 'timeline', 'gallery', 'rsvp', 'faq',
  'weddingabc', 'accommodations', 'directions', 'photoupload', 'guestbook',
  'musicwishes', 'gifts', 'witnesses',
];

export default async function BereichEditorPage({
  params,
}: {
  params: Promise<{ slug: string; bereichKey: string }>;
}) {
  const { slug, bereichKey } = await params;

  if (!KNOWN_KEYS.includes(bereichKey as BereichKey)) {
    notFound();
  }

  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const bereich = findBereich(data.bereiche, bereichKey as BereichKey);
  const label = bereichLabel(bereichKey as BereichKey);

  return (
    <DashboardSection
      title={label}
      description={
        bereich
          ? `Variante ${bereich.variant.toUpperCase()} · ${bereich.is_active ? 'aktiv' : 'deaktiviert'}`
          : 'Dieser Bereich ist noch nicht angelegt.'
      }
    >
      <ComingSoonSection what={`Editor für „${label}"`} />
    </DashboardSection>
  );
}
