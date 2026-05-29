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
 *
 * Filter: Es werden NUR Editoren für Bereich-Keys gezeigt, die wirklich
 * GEBUCHT wurden (purchasedKeys aus wedding_purchases). Auch eingehende
 * Daten (RSVP, Gästebuch, Musik, Fotos, Geschenke) erscheinen nur, wenn
 * der zugehörige Bereich gebucht ist — selbst falls is_active=true wäre.
 *
 * Reihenfolge der Inhalte-Editoren: nach dem display_order des Bereichs.
 * Wenn ein gebuchter Bereich noch nicht in wedding_bereiche existiert
 * (Pre-Setup), wird er an den Schluss gesetzt.
 */
export function buildDashboardNav(args: {
  bereiche: Array<{ bereich_key: string; is_active: boolean; display_order: number }>;
  purchasedKeys: BereichKey[];
  stats?: {
    rsvpTotal?: number;
    guestbookPending?: number;
    musicWishes?: number;
    photoUploads?: number;
    giftsReserved?: number;
  };
}): DashboardNavSection[] {
  const { bereiche, purchasedKeys, stats } = args;
  const s = stats ?? {};

  const isPurchased = (k: BereichKey) => purchasedKeys.includes(k);

  // Editor-Items: nur gebuchte Bereiche. Sortiert nach display_order — falls
  // ein gebuchter Bereich noch keinen wedding_bereiche-Eintrag hat, hängen
  // wir ihn ans Ende (Pre-Setup-Stand).
  const editorItems: DashboardNavItem[] = purchasedKeys
    .map((k) => {
      const b = bereiche.find((b) => b.bereich_key === k);
      return {
        key: k,
        order: b?.display_order ?? 999,
        item: {
          id: `edit-${k}`,
          label: bereichLabel(k),
          href: `bereiche/${k}`,
          icon: 'pencil',
        } as DashboardNavItem,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((x) => x.item);

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
        isPurchased('rsvp') && {
          id: 'rsvp',
          label: 'RSVP',
          href: 'rsvp',
          icon: 'envelope',
          badge: s.rsvpTotal,
        },
        isPurchased('guestbook') && {
          id: 'guestbook',
          label: 'Gästebuch',
          href: 'guestbook',
          icon: 'book',
          badge: s.guestbookPending,
          warning: (s.guestbookPending ?? 0) > 0,
        },
        isPurchased('musicwishes') && {
          id: 'music',
          label: 'Musikwünsche',
          href: 'music',
          icon: 'music',
          badge: s.musicWishes,
        },
        isPurchased('photoupload') && {
          id: 'photos',
          label: 'Foto-Uploads',
          href: 'photos',
          icon: 'camera',
          badge: s.photoUploads,
        },
        isPurchased('gifts') && {
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
    {
      id: 'upgrade',
      label: 'Pakete & Upgrades',
      items: [
        { id: 'upgrade', label: 'Komponenten dazubuchen', href: 'upgrade', icon: 'plus' },
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
