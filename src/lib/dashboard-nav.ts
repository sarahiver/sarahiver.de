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
    guestListPending?: number;
    guestbookPending?: number;
    musicWishes?: number;
    photoUploads?: number;
    giftsReserved?: number;
  };
}): DashboardNavSection[] {
  const { bereiche, purchasedKeys, stats } = args;
  const s = stats ?? {};

  const isPurchased = (k: BereichKey) => purchasedKeys.includes(k);

  // Editor-Items: nur gebuchte UND aktive Bereiche. Ein abgewählter Bereich
  // (is_active=false) wird nicht gerendert und gehört deshalb auch nicht in
  // die "Inhalte pflegen"-Leiste — sonst pflegt man Inhalte, die nirgends
  // erscheinen. Zum erneuten Bearbeiten wird der Bereich auf der Seite
  // "Bereiche & Reihenfolge" wieder aktiviert.
  //
  // Pre-Setup-Fall: ein frisch gebuchter Bereich ohne wedding_bereiche-Zeile
  // (b === undefined) gilt als sichtbar, damit man ihn befüllen kann. Nur ein
  // EXPLIZIT inaktiver Bereich (Zeile existiert, is_active=false) wird versteckt.
  const editorItems: DashboardNavItem[] = purchasedKeys
    .map((k) => {
      const b = bereiche.find((b) => b.bereich_key === k);
      return { key: k, row: b, order: b?.display_order ?? 999 };
    })
    .filter((x) => x.row?.is_active !== false)
    .sort((a, b) => a.order - b.order)
    .map((x) => ({
      id: `edit-${x.key}`,
      label: bereichLabel(x.key),
      href: `bereiche/${x.key}`,
      icon: 'pencil',
    }) as DashboardNavItem);

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
        isPurchased('rsvp') && {
          id: 'guests',
          label: 'Gästeliste',
          href: 'guests',
          icon: 'users',
          badge: s.guestListPending,
          warning: (s.guestListPending ?? 0) > 0,
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
        { id: 'phasen', label: 'Save-the-Date & Archiv', href: 'phasen', icon: 'home' },
        { id: 'settings', label: 'Stil & Stammdaten', href: 'settings', icon: 'sliders' },
        { id: 'navigation', label: 'Navigation', href: 'navigation', icon: 'menu' },
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
