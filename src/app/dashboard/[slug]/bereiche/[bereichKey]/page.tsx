import DashboardSection from '@/components/dashboard/DashboardSection';
import EditorShell from '@/components/dashboard/EditorShell';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';
import VariantPicker from './VariantPicker';
import HeroEditor from './HeroEditor';
import PhotoUploadEditor from './PhotoUploadEditor';
import LovestoryEditor from './LovestoryEditor';
import GuestbookEditor from './GuestbookEditor';
import MusicWishesEditor from './MusicWishesEditor';
import GiftsEditor from './GiftsEditor';
import { bereichLabel } from '@/lib/dashboard-nav';
import { loadDashboardData, findBereich } from '@/lib/dashboard-data';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { BereichKey } from '@/types/supabase';
import { notFound, redirect } from 'next/navigation';

/**
 * Dynamische Editor-Route pro Bereich:
 *   /dashboard/[slug]/bereiche/[bereichKey]
 *
 * Schutz: Nur wenn der Bereich GEBUCHT ist (purchasedKeys), darf der Editor
 * geladen werden — sonst Redirect auf die Upgrade-Seite.
 *
 * Inhalt:
 *  - VariantPicker (drei Karten zur Variantenwahl)
 *  - Bereich-spezifischer Editor (z.B. HeroEditor) oder Coming-Soon
 *
 * Live-Vorschau rechts via EditorShell.
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

  if (!data.purchasedKeys.includes(bereichKey as BereichKey)) {
    redirect(`/dashboard/${slug}/upgrade`);
  }

  const bereich = findBereich(data.bereiche, bereichKey as BereichKey);
  const label = bereichLabel(bereichKey as BereichKey);
  const variant = (bereich?.variant as 'a' | 'b' | 'c') || 'a';

  // Für Gästebuch: pending-Einträge zählen, damit Editor das Banner zeigt
  let guestbookPendingCount = 0;
  let musicWishesTotalCount = 0;
  let giftReservedItemIds = new Set<string>();
  let giftReservedCount = 0;
  if (bereichKey === 'guestbook' || bereichKey === 'musicwishes' || bereichKey === 'gifts') {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      if (bereichKey === 'guestbook') {
        const { count } = await supabase
          .from('wedding_guestbook_entries')
          .select('id', { count: 'exact', head: true })
          .eq('wedding_site_id', data.site.id)
          .eq('status', 'pending');
        guestbookPendingCount = count ?? 0;
      } else if (bereichKey === 'musicwishes') {
        const { count } = await supabase
          .from('wedding_music_wishes')
          .select('id', { count: 'exact', head: true })
          .eq('wedding_site_id', data.site.id);
        musicWishesTotalCount = count ?? 0;
      } else if (bereichKey === 'gifts') {
        const { data: rows } = await supabase
          .from('wedding_gift_reservations')
          .select('item_id')
          .eq('wedding_site_id', data.site.id);
        const list = (rows || []) as Array<{ item_id: string }>;
        giftReservedItemIds = new Set(list.map((r) => r.item_id));
        giftReservedCount = list.length;
      }
    }
  }

  const desc = bereich
    ? `Variante ${variant.toUpperCase()} · ${bereich.is_active ? 'aktiv' : 'deaktiviert'}`
    : 'Dieser Bereich ist noch nicht angelegt — bitte zuerst aktivieren.';

  // Bereich-spezifischer Editor — pro Bereich-Key eine eigene Komponente.
  // Aktuell nur Hero implementiert.
  const content = (bereich?.content || {}) as Record<string, unknown>;

  return (
    <DashboardSection title={label} description={desc}>
      <EditorShell
        bereichKey={bereichKey}
        weddingSlug={slug}
        editorTitle="Inhalte"
        editorDescription="Variante wählen und Felder pflegen. Rechts seht ihr die Live-Vorschau."
      >
        <VariantPicker slug={slug} bereichKey={bereichKey as BereichKey} initial={variant} />
        <div style={{ marginTop: 20 }}>
          {bereichKey === 'hero' ? (
            <HeroEditor
              slug={slug}
              variant={variant}
              initial={{
                hero_image_url: data.site.hero_image_url,
                eyebrow: (content.eyebrow as string) || '',
                image_2: (content.image_2 as string) || null,
              }}
            />
          ) : bereichKey === 'photoupload' ? (
            <PhotoUploadEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                privacy: (content.privacy as string) || '',
                success_message: (content.success_message as string) || '',
                success_sub: (content.success_sub as string) || '',
              }}
            />
          ) : bereichKey === 'lovestory' ? (
            variant === 'a' ? (
              <LovestoryEditor
                slug={slug}
                variant="a"
                initial={{
                  eyebrow: (content.eyebrow as string) || '',
                  title: (content.title as string) || '',
                  when: (content.when as string) || '',
                  moment_title: (content.moment_title as string) || '',
                  description: (content.description as string) || '',
                  signature: (content.signature as string) || '',
                  images: Array.isArray(content.images)
                    ? (content.images as unknown[])
                        .filter((s): s is string => typeof s === 'string')
                        .slice(0, 3)
                    : [],
                }}
              />
            ) : (
              <LovestoryEditor
                slug={slug}
                variant={variant as 'b' | 'c'}
                initial={{
                  eyebrow: (content.eyebrow as string) || '',
                  title: (content.title as string) || '',
                  intro: (content.intro as string) || '',
                  entries: Array.isArray(content.entries)
                    ? (content.entries as Array<Record<string, unknown>>)
                        .filter(
                          (e) =>
                            typeof e?.id === 'string' &&
                            typeof e?.when === 'string' &&
                            typeof e?.title === 'string' &&
                            typeof e?.description === 'string' &&
                            typeof e?.image_url === 'string',
                        )
                        .map((e) => ({
                          id: e.id as string,
                          when: e.when as string,
                          title: e.title as string,
                          description: e.description as string,
                          image_url: e.image_url as string,
                          image_alt: typeof e.image_alt === 'string' ? e.image_alt : undefined,
                        }))
                    : [],
                }}
              />
            )
          ) : bereichKey === 'guestbook' ? (
            <GuestbookEditor
              slug={slug}
              pendingCount={guestbookPendingCount}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                moderation: (content.moderation as string) || '',
                success_message: (content.success_message as string) || '',
                success_sub: (content.success_sub as string) || '',
              }}
            />
          ) : bereichKey === 'musicwishes' ? (
            <MusicWishesEditor
              slug={slug}
              totalCount={musicWishesTotalCount}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                success_message: (content.success_message as string) || '',
                success_sub: (content.success_sub as string) || '',
              }}
            />
          ) : bereichKey === 'gifts' ? (
            <GiftsEditor
              slug={slug}
              reservedItemIds={giftReservedItemIds}
              reservedCount={giftReservedCount}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                reserve_success: (content.reserve_success as string) || '',
                iban_enabled: content.iban_enabled === true,
                iban: (content.iban as string) || '',
                iban_holder: (content.iban_holder as string) || '',
                iban_note: (content.iban_note as string) || '',
                items: Array.isArray(content.items)
                  ? (content.items as Array<Record<string, unknown>>)
                      .filter((it) => typeof it?.id === 'string' && typeof it?.title === 'string')
                      .map((it) => ({
                        id: it.id as string,
                        title: it.title as string,
                        description: typeof it.description === 'string' ? it.description : '',
                        amount: typeof it.amount === 'string' ? it.amount : '',
                        image: typeof it.image === 'string' ? it.image : '',
                      }))
                  : [],
              }}
            />
          ) : (
            <ComingSoonSection what={`Editor-Felder für „${label}"`} />
          )}
        </div>
      </EditorShell>
    </DashboardSection>
  );
}
