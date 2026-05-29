import DashboardSection from '@/components/dashboard/DashboardSection';
import EditorShell from '@/components/dashboard/EditorShell';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';
import { bereichLabel } from '@/lib/dashboard-nav';
import { loadDashboardData, findBereich } from '@/lib/dashboard-data';
import type { BereichKey } from '@/types/supabase';
import { notFound, redirect } from 'next/navigation';

/**
 * Dynamische Editor-Route pro Bereich:
 *   /dashboard/[slug]/bereiche/[bereichKey]
 *
 * Schutz: Nur wenn der Bereich GEBUCHT ist (purchasedKeys), darf der Editor
 * geladen werden — sonst Redirect auf die Upgrade-Seite.
 *
 * Aktuell: Editor-Inhalt ist "Coming Soon" (bauen wir Komponente für
 * Komponente). Aber die Hülle (Dreispalten-Layout mit Live-Vorschau im
 * iframe rechts) steht schon.
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

  // Wenn nicht gebucht → ab zur Upgrade-Seite
  if (!data.purchasedKeys.includes(bereichKey as BereichKey)) {
    redirect(`/dashboard/${slug}/upgrade`);
  }

  const bereich = findBereich(data.bereiche, bereichKey as BereichKey);
  const label = bereichLabel(bereichKey as BereichKey);

  const desc = bereich
    ? `Variante ${bereich.variant.toUpperCase()} · ${bereich.is_active ? 'aktiv' : 'deaktiviert'}`
    : 'Dieser Bereich ist noch nicht angelegt — bitte zuerst aktivieren.';

  return (
    <DashboardSection title={label} description={desc}>
      <EditorShell
        bereichKey={bereichKey}
        weddingSlug={slug}
        editorTitle="Inhalte"
        editorDescription="Hier bearbeitet ihr die Felder dieses Bereichs. Rechts seht ihr die Live-Vorschau."
      >
        <ComingSoonSection what={`Editor für „${label}"`} />
      </EditorShell>
    </DashboardSection>
  );
}
