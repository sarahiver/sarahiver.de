/**
 * Komponenten-Katalog — Stammdaten aller 15 Bereiche aus Verkaufssicht.
 *
 * Hier liegen Preis, Beschreibung und Kurz-Vorschau-Bild pro Bereich. Wird
 * im Dashboard (Upsell-Section) und später im Funnel-Checkout verwendet.
 *
 * Preise sind PLATZHALTER — wenn ihr die Preisliste fix habt, hier
 * anpassen oder besser in eine Supabase-Tabelle `component_catalog`
 * auslagern, damit ihr ohne Deploy ändern könnt.
 */

import type { BereichKey } from '@/types/supabase';

export interface ComponentCatalogEntry {
  key: BereichKey;
  label: string;
  /** Ein-Satz-Beschreibung — was die Komponente leistet. */
  desc: string;
  /** Bruttopreis in EUR (Platzhalter — final über Backend). */
  priceEur: number;
  /** Ist sie typischerweise im "Basis-Paket" enthalten? Nur Anzeige-Hinweis. */
  inBasis: boolean;
  /** Icon-Key für DashboardIcon. */
  icon: string;
}

export const COMPONENT_CATALOG: Record<BereichKey, ComponentCatalogEntry> = {
  hero:           { key: 'hero',           label: 'Hero',                 desc: 'Eröffnungsbild mit Namen und Datum — das Erste, was Gäste sehen.', priceEur: 0,  inBasis: true,  icon: 'home' },
  countdown:      { key: 'countdown',      label: 'Countdown',            desc: 'Tage, Stunden, Minuten bis zum großen Tag.',                       priceEur: 0,  inBasis: true,  icon: 'home' },
  rsvp:           { key: 'rsvp',           label: 'RSVP',                 desc: 'Online-Zusage mit Menüauswahl und Allergie-Hinweisen.',           priceEur: 0,  inBasis: true,  icon: 'envelope' },
  timeline:       { key: 'timeline',       label: 'Ablauf',               desc: 'Tagesplan von der Trauung bis zum letzten Tanz.',                 priceEur: 0,  inBasis: true,  icon: 'home' },
  faq:            { key: 'faq',            label: 'FAQ',                  desc: 'Häufige Fragen der Gäste — Dresscode, Kinder, Geschenke.',        priceEur: 0,  inBasis: true,  icon: 'book' },
  directions:     { key: 'directions',     label: 'Anfahrt',              desc: 'Adressen, Karte, Parkhinweise zu den Locations.',                  priceEur: 0,  inBasis: true,  icon: 'home' },
  accommodations: { key: 'accommodations', label: 'Übernachtung',         desc: 'Hotel-Empfehlungen mit Kontingenten und Preisen.',                priceEur: 19, inBasis: false, icon: 'home' },
  lovestory:      { key: 'lovestory',      label: 'Lovestory',            desc: 'Eure Geschichte als erzählerischer Block.',                       priceEur: 19, inBasis: false, icon: 'book' },
  gallery:        { key: 'gallery',        label: 'Galerie',              desc: 'Bildergalerie mit Lightbox.',                                     priceEur: 19, inBasis: false, icon: 'camera' },
  weddingabc:     { key: 'weddingabc',     label: 'Hochzeits-ABC',        desc: 'Stichwortglossar — alles Wichtige von A bis Z.',                   priceEur: 19, inBasis: false, icon: 'book' },
  witnesses:      { key: 'witnesses',      label: 'Trauzeugen',           desc: 'Ansprechpartner mit Spam-geschützten Kontaktwegen.',              priceEur: 19, inBasis: false, icon: 'home' },
  guestbook:      { key: 'guestbook',      label: 'Gästebuch',            desc: 'Glückwünsche online sammeln, mit Moderation.',                    priceEur: 29, inBasis: false, icon: 'book' },
  musicwishes:    { key: 'musicwishes',    label: 'Musikwünsche',         desc: 'Songwünsche der Gäste — direkt an euren DJ.',                     priceEur: 29, inBasis: false, icon: 'music' },
  photoupload:    { key: 'photoupload',    label: 'Fotoupload',           desc: 'Gäste laden vor der Hochzeit Bilder hoch (privat).',              priceEur: 29, inBasis: false, icon: 'camera' },
  gifts:          { key: 'gifts',          label: 'Geschenke',            desc: 'Wunschliste mit Reservierungs-Funktion und IBAN.',                priceEur: 29, inBasis: false, icon: 'gift' },
};

export const ALL_BEREICH_KEYS: BereichKey[] = [
  'hero', 'countdown', 'lovestory', 'timeline', 'gallery', 'rsvp', 'faq',
  'weddingabc', 'accommodations', 'directions', 'photoupload', 'guestbook',
  'musicwishes', 'gifts', 'witnesses',
];

export function priceLabel(priceEur: number): string {
  if (priceEur === 0) return 'Im Basis-Paket';
  return `${priceEur.toFixed(0)} €`;
}
