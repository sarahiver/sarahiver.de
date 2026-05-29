/**
 * Dashboard-Navigation — Section-Struktur für die Sidebar.
 *
 * Vier Bereiche:
 *   1. Übersicht (Start, Stats, Status)
 *   2. Eingehende Daten (RSVP, Gästebuch, Musik, Fotos, Geschenke)
 *   3. Inhalte pflegen (Bereich-Editoren — pro aktivem Bereich ein Eintrag)
 *   4. Einstellungen (Stil, Stammdaten, Bereich-Verwaltung)
 *
 * Die Bereich-Editoren werden dynamisch aus den geladenen Bereichen
 * generiert (siehe buildContentEditorItems in der Dashboard-Component).
 */

import type { BereichKey } from '@/types/supabase';

export interface DashboardNavItem {
  id: string;
  label: string;
  href: string; // relativ zum /dashboard/[slug]/
  icon: string; // Inline-SVG-Path-D oder ein Key, den DashboardIcon mappt
  badge?: number;
  warning?: boolean; // rote/akzent Badge-Farbe
}

export interface DashboardNavSection {
  id: string;
  label: string;
  items: DashboardNavItem[];
}

/**
 * Baut die komplette Navigation für ein Brautpaar.
 * 'inhalte' wird dynamisch aus den vorhandenen Bereichen befüllt — Editor
 * pro Bereich-Key, in display_order-Reihenfolge.
 */
export function buildDashboardNav(args: {
  bereiche: Array<{ bereich_key: string; is_active: boolean; display_order: number }>;
  stats?: {
    rsvpTotal?: number;
    guestbookPending?: number;
    musicWishes?: number;
    photoUploads?: number;
    giftsReserved?: number;
  };
}): DashboardNavSection[] {
  const { bereiche, stats } = args;
  const s = stats ?? {};

  const hasBereich = (k: BereichKey) =>
    bereiche.some((b) => b.bereich_key === k && b.is_active);

  // Editor-Items dynamisch aus aktiven Bereichen
  const editorOrder = [...bereiche]
    .filter((b) => b.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const editorItems: DashboardNavItem[] = editorOrder.map((b) => ({
    id: `edit-${b.bereich_key}`,
    label: bereichLabel(b.bereich_key as BereichKey),
    href: `bereiche/${b.bereich_key}`,
    icon: 'pencil',
  }));

  return [
    {
      id: 'overview',
      label: 'Übersicht',
      items: [{ id: 'dashboard', label: 'Dashboard', href: '', icon: 'home' }],
    },
    {
      id: 'inbox',
      label: 'Eingehende Daten',
      items: [
        hasBereich('rsvp') && {
          id: 'rsvp',
          label: 'RSVP',
          href: 'rsvp',
          icon: 'envelope',
          badge: s.rsvpTotal,
        },
        hasBereich('guestbook') && {
          id: 'guestbook',
          label: 'Gästebuch',
          href: 'guestbook',
          icon: 'book',
          badge: s.guestbookPending,
          warning: (s.guestbookPending ?? 0) > 0,
        },
        hasBereich('musicwishes') && {
          id: 'music',
          label: 'Musikwünsche',
          href: 'music',
          icon: 'music',
          badge: s.musicWishes,
        },
        hasBereich('photoupload') && {
          id: 'photos',
          label: 'Foto-Uploads',
          href: 'photos',
          icon: 'camera',
          badge: s.photoUploads,
        },
        hasBereich('gifts') && {
          id: 'gifts',
          label: 'Geschenke',
          href: 'gifts',
          icon: 'gift',
          badge: s.giftsReserved,
        },
      ].filter(Boolean) as DashboardNavItem[],
    },
    {
      id: 'content',
      label: 'Inhalte pflegen',
      items: editorItems,
    },
    {
      id: 'settings',
      label: 'Einstellungen',
      items: [
        { id: 'bereiche', label: 'Bereiche & Reihenfolge', href: 'bereiche', icon: 'layers' },
        { id: 'settings', label: 'Stil & Stammdaten', href: 'settings', icon: 'sliders' },
      ],
    },
  ].filter((s) => s.items.length > 0);
}

/** Deutsche Labels für die Bereich-Keys (gleich wie nav-config.ts der Gäste-Seite). */
export function bereichLabel(key: BereichKey): string {
  const map: Record<BereichKey, string> = {
    hero: 'Hero',
    countdown: 'Countdown',
    lovestory: 'Lovestory',
    timeline: 'Ablauf',
    gallery: 'Galerie',
    rsvp: 'RSVP',
    faq: 'FAQ',
    weddingabc: 'Hochzeits-ABC',
    accommodations: 'Übernachtung',
    directions: 'Anfahrt',
    photoupload: 'Fotoupload',
    guestbook: 'Gästebuch',
    musicwishes: 'Musikwünsche',
    gifts: 'Geschenke',
    witnesses: 'Trauzeugen',
  };
  return map[key] ?? key;
}
