/**
 * Bereich-Metadaten für die Navigation.
 *
 * ZENTRALE STELLE: Wenn ein neuer Bereich gebaut wird, hier einen Eintrag
 * ergänzen — die Nav rendert ihn dann automatisch (sofern is_active).
 *
 *   label → Anzeigename in der Nav
 *   icon  → Tabler-Icon-Name (für Mobile-Tab-Bar in Variante C)
 *   inNav → ob der Bereich in der Nav auftaucht (Hero z.B. nicht,
 *           weil er ganz oben ist und der Logo-/Home-Link dorthin führt)
 */

export interface BereichNavMeta {
  label: string;
  icon: string; // Tabler-Icon (ti-*)
  inNav: boolean;
}

export const BEREICH_NAV_META: Record<string, BereichNavMeta> = {
  hero: { label: 'Start', icon: 'ti-home', inNav: false },
  countdown: { label: 'Countdown', icon: 'ti-clock', inNav: true },
  lovestory: { label: 'Unsere Geschichte', icon: 'ti-heart', inNav: true },
  timeline: { label: 'Tagesablauf', icon: 'ti-calendar-event', inNav: true },
  gallery: { label: 'Galerie', icon: 'ti-photo', inNav: true },
  rsvp: { label: 'Zusage', icon: 'ti-mail', inNav: true },
  // Künftige Bereiche (Platzhalter — Label anpassen sobald gebaut):
  gifts: { label: 'Geschenke', icon: 'ti-gift', inNav: true },
  accommodations: { label: 'Übernachtung', icon: 'ti-bed', inNav: true },
  faq: { label: 'FAQ', icon: 'ti-help-circle', inNav: true },
  witnesses: { label: 'Trauzeugen', icon: 'ti-users', inNav: true },
  weddingabc: { label: 'Hochzeits-ABC', icon: 'ti-list', inNav: true },
  photoupload: { label: 'Fotos teilen', icon: 'ti-camera-up', inNav: true },
  musicwishes: { label: 'Musikwünsche', icon: 'ti-music', inNav: true },
  guestbook: { label: 'Gästebuch', icon: 'ti-book', inNav: true },
};

/**
 * Default-Fallback für unbekannte Bereiche (sollte nicht vorkommen,
 * aber sicherheitshalber).
 */
export function getNavMeta(bereichKey: string): BereichNavMeta {
  return (
    BEREICH_NAV_META[bereichKey] ?? {
      label: bereichKey,
      icon: 'ti-point',
      inNav: true,
    }
  );
}

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  anchor: string; // #id zum Hinscrollen
}

/**
 * Baut die Nav-Items aus der (bereits is_active-gefilterten, sortierten)
 * Bereich-Liste. Filtert Bereiche raus, die inNav=false haben.
 *
 * @param bereichKeys  geordnete bereich_key-Liste (aus loadWeddingSite)
 */
export function buildNavItems(bereichKeys: string[]): NavItem[] {
  return bereichKeys
    .map((key) => ({ key, meta: getNavMeta(key) }))
    .filter(({ meta }) => meta.inNav)
    .map(({ key, meta }) => ({
      key,
      label: meta.label,
      icon: meta.icon,
      anchor: `bereich-${key}`,
    }));
}
