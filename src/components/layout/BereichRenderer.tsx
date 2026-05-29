import type { WeddingBereich, EffectiveTokens } from '@/types/supabase';
import HeroVariantA from '@/components/bereiche/Hero/HeroVariantA';
import HeroVariantB from '@/components/bereiche/Hero/HeroVariantB';
import HeroVariantC from '@/components/bereiche/Hero/HeroVariantC';
import CountdownVariantA from '@/components/bereiche/Countdown/CountdownVariantA';
import CountdownVariantB from '@/components/bereiche/Countdown/CountdownVariantB';
import CountdownVariantC from '@/components/bereiche/Countdown/CountdownVariantC';
import LovestoryVariantA from '@/components/bereiche/Lovestory/LovestoryVariantA';
import LovestoryVariantB from '@/components/bereiche/Lovestory/LovestoryVariantB';
import LovestoryVariantC from '@/components/bereiche/Lovestory/LovestoryVariantC';
import GalleryVariantA from '@/components/bereiche/Gallery/GalleryVariantA';
import GalleryVariantB from '@/components/bereiche/Gallery/GalleryVariantB';
import GalleryVariantC from '@/components/bereiche/Gallery/GalleryVariantC';
import RsvpVariantA from '@/components/bereiche/RSVP/RsvpVariantA';
import RsvpVariantB from '@/components/bereiche/RSVP/RsvpVariantB';
import RsvpVariantC from '@/components/bereiche/RSVP/RsvpVariantC';
import TimelineVariantA from '@/components/bereiche/Timeline/TimelineVariantA';
import TimelineVariantB from '@/components/bereiche/Timeline/TimelineVariantB';
import TimelineVariantC from '@/components/bereiche/Timeline/TimelineVariantC';
import FaqVariantA from '@/components/bereiche/FAQ/FaqVariantA';
import FaqVariantB from '@/components/bereiche/FAQ/FaqVariantB';
import FaqVariantC from '@/components/bereiche/FAQ/FaqVariantC';
import WeddingABCVariantA from '@/components/bereiche/WeddingABC/WeddingABCVariantA';
import WeddingABCVariantB from '@/components/bereiche/WeddingABC/WeddingABCVariantB';
import WeddingABCVariantC from '@/components/bereiche/WeddingABC/WeddingABCVariantC';
import AccommodationsVariantA from '@/components/bereiche/Accommodations/AccommodationsVariantA';
import AccommodationsVariantB from '@/components/bereiche/Accommodations/AccommodationsVariantB';
import AccommodationsVariantC from '@/components/bereiche/Accommodations/AccommodationsVariantC';
import DirectionsVariantA from '@/components/bereiche/Directions/DirectionsVariantA';
import DirectionsVariantB from '@/components/bereiche/Directions/DirectionsVariantB';
import DirectionsVariantC from '@/components/bereiche/Directions/DirectionsVariantC';
import PhotoUploadVariantA from '@/components/bereiche/PhotoUpload/PhotoUploadVariantA';
import PhotoUploadVariantB from '@/components/bereiche/PhotoUpload/PhotoUploadVariantB';
import PhotoUploadVariantC from '@/components/bereiche/PhotoUpload/PhotoUploadVariantC';
import GuestbookVariantA from '@/components/bereiche/Guestbook/GuestbookVariantA';
import GuestbookVariantB from '@/components/bereiche/Guestbook/GuestbookVariantB';
import GuestbookVariantC from '@/components/bereiche/Guestbook/GuestbookVariantC';
import MusicWishesVariantA from '@/components/bereiche/MusicWishes/MusicWishesVariantA';
import MusicWishesVariantB from '@/components/bereiche/MusicWishes/MusicWishesVariantB';
import MusicWishesVariantC from '@/components/bereiche/MusicWishes/MusicWishesVariantC';
import GiftsVariantA from '@/components/bereiche/Gifts/GiftsVariantA';
import GiftsVariantB from '@/components/bereiche/Gifts/GiftsVariantB';
import GiftsVariantC from '@/components/bereiche/Gifts/GiftsVariantC';
import WitnessesVariantA from '@/components/bereiche/Witnesses/WitnessesVariantA';
import WitnessesVariantB from '@/components/bereiche/Witnesses/WitnessesVariantB';
import WitnessesVariantC from '@/components/bereiche/Witnesses/WitnessesVariantC';
import BereichPlaceholder from '@/components/layout/BereichPlaceholder';

/**
 * BereichRenderer — wählt die richtige Komponente basierend auf
 * bereich_key + variant.
 *
 * Wenn eine Bereich-Komponente noch nicht existiert (z.B. RSVP während
 * der Entwicklung), wird ein BereichPlaceholder gerendert, damit das
 * Layout nicht bricht.
 */

interface BereichRendererProps {
  bereich: WeddingBereich;
  tokens: EffectiveTokens;
  weddingSlug?: string;
}

export function BereichRenderer({ bereich, tokens, weddingSlug }: BereichRendererProps) {
  const { bereich_key, variant, content } = bereich;
  const props = { tokens, content };

  // === HERO ===
  if (bereich_key === 'hero') {
    if (variant === 'a') return <HeroVariantA {...props} />;
    if (variant === 'b') return <HeroVariantB {...props} />;
    if (variant === 'c') return <HeroVariantC {...props} />;
  }

  // === COUNTDOWN ===
  if (bereich_key === 'countdown') {
    if (variant === 'a') return <CountdownVariantA {...props} />;
    if (variant === 'b') return <CountdownVariantB {...props} />;
    if (variant === 'c') return <CountdownVariantC {...props} />;
  }

  // === LOVESTORY ===
  if (bereich_key === 'lovestory') {
    if (variant === 'a') return <LovestoryVariantA {...props} />;
    if (variant === 'b') return <LovestoryVariantB {...props} />;
    if (variant === 'c') return <LovestoryVariantC {...props} />;
  }

  // === GALLERY ===
  if (bereich_key === 'gallery') {
    if (variant === 'a') return <GalleryVariantA {...props} />;
    if (variant === 'b') return <GalleryVariantB {...props} />;
    if (variant === 'c') return <GalleryVariantC {...props} />;
  }

  // === RSVP ===
  if (bereich_key === 'rsvp') {
    if (variant === 'a') return <RsvpVariantA {...props} />;
    if (variant === 'b') return <RsvpVariantB {...props} />;
    if (variant === 'c') return <RsvpVariantC {...props} />;
  }

  // === TIMELINE ===
  if (bereich_key === 'timeline') {
    if (variant === 'a') return <TimelineVariantA {...props} />;
    if (variant === 'b') return <TimelineVariantB {...props} />;
    if (variant === 'c') return <TimelineVariantC {...props} />;
  }

  // === FAQ ===
  if (bereich_key === 'faq') {
    if (variant === 'a') return <FaqVariantA {...props} />;
    if (variant === 'b') return <FaqVariantB {...props} />;
    if (variant === 'c') return <FaqVariantC {...props} />;
  }

  // === HOCHZEITS-ABC ===
  if (bereich_key === 'weddingabc') {
    if (variant === 'a') return <WeddingABCVariantA {...props} />;
    if (variant === 'b') return <WeddingABCVariantB {...props} />;
    if (variant === 'c') return <WeddingABCVariantC {...props} />;
  }

  // === ÜBERNACHTUNG ===
  if (bereich_key === 'accommodations') {
    if (variant === 'a') return <AccommodationsVariantA {...props} />;
    if (variant === 'b') return <AccommodationsVariantB {...props} />;
    if (variant === 'c') return <AccommodationsVariantC {...props} />;
  }

  // === ANFAHRT ===
  if (bereich_key === 'directions') {
    if (variant === 'a') return <DirectionsVariantA {...props} />;
    if (variant === 'b') return <DirectionsVariantB {...props} />;
    if (variant === 'c') return <DirectionsVariantC {...props} />;
  }

  // === FOTOUPLOAD ===
  if (bereich_key === 'photoupload') {
    if (variant === 'a') return <PhotoUploadVariantA {...props} weddingSlug={weddingSlug} />;
    if (variant === 'b') return <PhotoUploadVariantB {...props} weddingSlug={weddingSlug} />;
    if (variant === 'c') return <PhotoUploadVariantC {...props} weddingSlug={weddingSlug} />;
  }

  // === GÄSTEBUCH ===
  if (bereich_key === 'guestbook') {
    if (variant === 'a') return <GuestbookVariantA {...props} weddingSlug={weddingSlug} />;
    if (variant === 'b') return <GuestbookVariantB {...props} weddingSlug={weddingSlug} />;
    if (variant === 'c') return <GuestbookVariantC {...props} weddingSlug={weddingSlug} />;
  }

  // === MUSIKWÜNSCHE ===
  if (bereich_key === 'musicwishes') {
    if (variant === 'a') return <MusicWishesVariantA {...props} weddingSlug={weddingSlug} />;
    if (variant === 'b') return <MusicWishesVariantB {...props} weddingSlug={weddingSlug} />;
    if (variant === 'c') return <MusicWishesVariantC {...props} weddingSlug={weddingSlug} />;
  }

  // === GESCHENKE ===
  if (bereich_key === 'gifts') {
    if (variant === 'a') return <GiftsVariantA {...props} weddingSlug={weddingSlug} />;
    if (variant === 'b') return <GiftsVariantB {...props} weddingSlug={weddingSlug} />;
    if (variant === 'c') return <GiftsVariantC {...props} weddingSlug={weddingSlug} />;
  }

  // === TRAUZEUGEN ===
  if (bereich_key === 'witnesses') {
    if (variant === 'a') return <WitnessesVariantA {...props} weddingSlug={weddingSlug} />;
    if (variant === 'b') return <WitnessesVariantB {...props} weddingSlug={weddingSlug} />;
    if (variant === 'c') return <WitnessesVariantC {...props} weddingSlug={weddingSlug} />;
  }

  // === Alle anderen Bereiche: noch nicht gebaut → Placeholder ===
  return <BereichPlaceholder bereich={bereich} />;
}
