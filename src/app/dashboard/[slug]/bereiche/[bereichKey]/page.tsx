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
import CountdownEditor from './CountdownEditor';
import FaqEditor from './FaqEditor';
import WeddingAbcEditor from './WeddingAbcEditor';
import WitnessesEditor from './WitnessesEditor';
import TimelineEditor from './TimelineEditor';
import GalleryEditor from './GalleryEditor';
import AccommodationsEditor from './AccommodationsEditor';
import DirectionsEditor from './DirectionsEditor';
import RsvpEditor from './RsvpEditor';
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
  let rsvpCount = 0;
  if (
    bereichKey === 'guestbook' ||
    bereichKey === 'musicwishes' ||
    bereichKey === 'gifts' ||
    bereichKey === 'rsvp'
  ) {
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
      } else if (bereichKey === 'rsvp') {
        const { count } = await supabase
          .from('wedding_rsvps')
          .select('id', { count: 'exact', head: true })
          .eq('wedding_site_id', data.site.id);
        rsvpCount = count ?? 0;
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
          ) : bereichKey === 'countdown' ? (
            <CountdownEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                footer: (content.footer as string) || '',
                past_text: (content.past_text as string) || '',
              }}
            />
          ) : bereichKey === 'faq' ? (
            <FaqEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                items: Array.isArray(content.items)
                  ? (content.items as Array<Record<string, unknown>>)
                      .filter((it) => typeof it?.id === 'string' && typeof it?.question === 'string')
                      .map((it) => ({
                        id: it.id as string,
                        question: it.question as string,
                        answer: typeof it.answer === 'string' ? it.answer : '',
                      }))
                  : [],
              }}
            />
          ) : bereichKey === 'weddingabc' ? (
            <WeddingAbcEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                items: Array.isArray(content.items)
                  ? (content.items as Array<Record<string, unknown>>)
                      .filter((it) => typeof it?.id === 'string' && typeof it?.term === 'string')
                      .map((it) => ({
                        id: it.id as string,
                        letter: typeof it.letter === 'string' ? it.letter : '',
                        term: it.term as string,
                        text: typeof it.text === 'string' ? it.text : '',
                      }))
                  : [],
              }}
            />
          ) : bereichKey === 'witnesses' ? (
            <WitnessesEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                persons: Array.isArray(content.persons)
                  ? (content.persons as Array<Record<string, unknown>>)
                      .filter((p) => typeof p?.id === 'string' && typeof p?.name === 'string')
                      .map((p) => ({
                        id: p.id as string,
                        name: p.name as string,
                        role: typeof p.role === 'string' ? p.role : '',
                        photo: typeof p.photo === 'string' ? p.photo : '',
                        phone: typeof p.phone === 'string' ? p.phone : '',
                        email: typeof p.email === 'string' ? p.email : '',
                        whatsapp: typeof p.whatsapp === 'string' ? p.whatsapp : '',
                        intro: typeof p.intro === 'string' ? p.intro : '',
                      }))
                  : [],
              }}
            />
          ) : bereichKey === 'timeline' ? (
            <TimelineEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                events: Array.isArray(content.events)
                  ? (content.events as Array<Record<string, unknown>>)
                      .filter((ev) => typeof ev?.id === 'string' && typeof ev?.title === 'string')
                      .map((ev) => ({
                        id: ev.id as string,
                        time: typeof ev.time === 'string' ? ev.time : '',
                        title: ev.title as string,
                        description: typeof ev.description === 'string' ? ev.description : '',
                        location_name: typeof ev.location_name === 'string' ? ev.location_name : '',
                        location_url: typeof ev.location_url === 'string' ? ev.location_url : '',
                        image: typeof ev.image === 'string' ? ev.image : '',
                      }))
                  : [],
              }}
            />
          ) : bereichKey === 'gallery' ? (
            <GalleryEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                intro: (content.intro as string) || '',
                images: Array.isArray(content.images)
                  ? (content.images as Array<Record<string, unknown>>)
                      .filter((im) => typeof im?.id === 'string' && typeof im?.src === 'string')
                      .map((im) => ({
                        id: im.id as string,
                        src: im.src as string,
                        alt: typeof im.alt === 'string' ? im.alt : '',
                        caption: typeof im.caption === 'string' ? im.caption : '',
                        orientation: (im.orientation === 'portrait' || im.orientation === 'square' ? im.orientation : 'landscape') as 'portrait' | 'landscape' | 'square',
                      }))
                  : [],
              }}
            />
          ) : bereichKey === 'accommodations' ? (
            <AccommodationsEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                items: Array.isArray(content.items)
                  ? (content.items as Array<Record<string, unknown>>)
                      .filter((it) => typeof it?.id === 'string' && typeof it?.name === 'string')
                      .map((it) => ({
                        id: it.id as string,
                        name: it.name as string,
                        description: typeof it.description === 'string' ? it.description : '',
                        image: typeof it.image === 'string' ? it.image : '',
                        distance: typeof it.distance === 'string' ? it.distance : '',
                        price: typeof it.price === 'string' ? it.price : '',
                        booking_code: typeof it.booking_code === 'string' ? it.booking_code : '',
                        booking_url: typeof it.booking_url === 'string' ? it.booking_url : '',
                      }))
                  : [],
              }}
            />
          ) : bereichKey === 'directions' ? (
            <DirectionsEditor
              slug={slug}
              initial={{
                eyebrow: (content.eyebrow as string) || '',
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                items: Array.isArray(content.items)
                  ? (content.items as Array<Record<string, unknown>>)
                      .filter((it) => typeof it?.id === 'string')
                      .map((it) => ({
                        id: it.id as string,
                        label: typeof it.label === 'string' ? it.label : '',
                        name: typeof it.name === 'string' ? it.name : '',
                        address: typeof it.address === 'string' ? it.address : '',
                        description: typeof it.description === 'string' ? it.description : '',
                        maps_embed: typeof it.maps_embed === 'string' ? it.maps_embed : '',
                        maps_url: typeof it.maps_url === 'string' ? it.maps_url : '',
                        transit: Array.isArray(it.transit)
                          ? (it.transit as Array<Record<string, unknown>>)
                              .filter((t) => typeof t?.mode === 'string')
                              .map((t) => ({
                                mode: (t.mode as 'car' | 'train' | 'bus' | 'park' | 'walk') || 'car',
                                text: typeof t.text === 'string' ? t.text : '',
                              }))
                          : [],
                      }))
                  : [],
              }}
            />
          ) : bereichKey === 'rsvp' ? (
            <RsvpEditor
              slug={slug}
              rsvpCount={rsvpCount}
              initial={{
                title: (content.title as string) || '',
                description: (content.description as string) || '',
                deadline: (content.deadline as string) || '',
                ask_dietary: content.ask_dietary !== false,
                ask_allergies: content.ask_allergies !== false,
                custom_questions: Array.isArray(content.custom_questions)
                  ? (content.custom_questions as Array<Record<string, unknown>>)
                      .filter((q) => typeof q?.label === 'string')
                      .map((q, i) => ({
                        id: typeof q.id === 'string' ? q.id : `q${i + 1}`,
                        label: q.label as string,
                        type: (q.type === 'boolean' || q.type === 'choice' ? q.type : 'text') as 'text' | 'boolean' | 'choice',
                        options: Array.isArray(q.options)
                          ? (q.options as unknown[]).filter((o): o is string => typeof o === 'string')
                          : [],
                        required: q.required === true,
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
