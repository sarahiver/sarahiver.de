/**
 * Die 15 Bereiche, aus denen eine Hochzeitsseite aufgebaut wird.
 *
 * Tier:
 *  - "basis"  → 4 Basis-Bereiche, immer im Basis-Paket enthalten
 *  - "zusatz" → 11 Zusatz-Bereiche, frei wählbar mit Volumen-Rabatt
 *
 * featured = true → "BESTSELLER"-Tag in der Structure-Sektion
 *
 * Namen analog zum si-wedding-themes Repo (Hero.js, RSVP.js, Timeline.js usw.)
 */

export type BereichTier = 'basis' | 'zusatz';

export interface Bereich {
  key: string;
  name: string;
  desc: string;
  tier: BereichTier;
  featured?: boolean;
}

export const BEREICHE: Bereich[] = [
  // === 4 BASIS-BEREICHE (immer dabei) ===
  {
    key: 'hero',
    name: 'Hero',
    desc: 'Begrüßt eure Gäste mit Datum, Ort und einem starken Bild.',
    tier: 'basis',
  },
  {
    key: 'rsvp',
    name: 'RSVP',
    desc: 'Gäste sagen zu oder ab — Menüwahl, Allergien, Übernachtung.',
    tier: 'basis',
  },
  {
    key: 'timeline',
    name: 'Timeline',
    desc: 'Tagesablauf — von der Trauung bis zum letzten Tanz.',
    tier: 'basis',
  },
  {
    key: 'infos',
    name: 'Infos',
    desc: 'Anreise, Locations, Dresscode und Wetter — alles auf einen Blick.',
    tier: 'basis',
  },

  // === 11 ZUSATZ-BEREICHE (frei wählbar) ===
  {
    key: 'lovestory',
    name: 'Lovestory',
    desc: 'Erzählt eure Geschichte — Zeitstrahl, Galerie oder Brief.',
    tier: 'zusatz',
    featured: true,
  },
  {
    key: 'gallery',
    name: 'Galerie',
    desc: 'Eure Bilder vor und nach dem Fest — kuratiert und schön.',
    tier: 'zusatz',
  },
  {
    key: 'photoupload',
    name: 'Foto-Upload',
    desc: 'Gäste laden ihre Schnappschüsse direkt hoch — moderiert.',
    tier: 'zusatz',
  },
  {
    key: 'gifts',
    name: 'Geschenke',
    desc: 'Wunschliste oder Geldgeschenk — diskret und herzlich.',
    tier: 'zusatz',
    featured: true,
  },
  {
    key: 'accommodations',
    name: 'Übernachtung',
    desc: 'Hotelempfehlungen, Anfahrt, gesperrte Zimmerkontingente.',
    tier: 'zusatz',
  },
  {
    key: 'countdown',
    name: 'Countdown',
    desc: 'Die Tage bis zum großen Tag — sichtbar für alle Gäste.',
    tier: 'zusatz',
  },
  {
    key: 'guestbook',
    name: 'Gästebuch',
    desc: 'Glückwünsche und Anekdoten — auch nach der Hochzeit.',
    tier: 'zusatz',
  },
  {
    key: 'faq',
    name: 'FAQ',
    desc: 'Die häufigsten Fragen — Kinder, Hunde, Geschenke, Parken.',
    tier: 'zusatz',
  },
  {
    key: 'musicwishes',
    name: 'Musikwünsche',
    desc: 'Songwünsche eurer Gäste sammeln — für die perfekte Playlist.',
    tier: 'zusatz',
  },
  {
    key: 'witnesses',
    name: 'Trauzeugen',
    desc: 'Direkter Kontakt zu Trauzeugen — für Fragen und Notfälle.',
    tier: 'zusatz',
  },
  {
    key: 'weddingabc',
    name: 'Hochzeits-ABC',
    desc: 'Von A wie Anreise bis Z wie Zugabe — euer Hochzeits-Glossar.',
    tier: 'zusatz',
  },
];

export const BASIS_BEREICHE = BEREICHE.filter((b) => b.tier === 'basis');
export const ZUSATZ_BEREICHE = BEREICHE.filter((b) => b.tier === 'zusatz');
