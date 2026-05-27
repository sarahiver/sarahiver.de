/**
 * Die 9 Bereiche, aus denen eine Hochzeitsseite aufgebaut wird.
 *
 * Tier:
 *  - "basis"  → 4 Basis-Bereiche, immer im 19€-Paket enthalten
 *  - "zusatz" → 5 Zusatz-Bereiche, frei wählbar mit Volumen-Rabatt
 *
 * featured = true → "BESTSELLER"-Tag in der Structure-Sektion
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
  // === BASIS-BEREICHE (immer dabei) ===
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
    key: 'prog',
    name: 'Programm',
    desc: 'Tagesablauf — von der Trauung bis zum letzten Tanz.',
    tier: 'basis',
  },
  {
    key: 'info',
    name: 'Infos',
    desc: 'Anreise, Übernachtungstipps, Dresscode, Wetter.',
    tier: 'basis',
  },
  // === ZUSATZ-BEREICHE (frei wählbar) ===
  {
    key: 'love',
    name: 'Lovestory',
    desc: 'Erzählt eure Geschichte — Zeitstrahl, Galerie oder Brief.',
    tier: 'zusatz',
    featured: true,
  },
  {
    key: 'gallery',
    name: 'Galerie',
    desc: 'Eure Bilder vor und nach dem Fest — Gäste können hochladen.',
    tier: 'zusatz',
  },
  {
    key: 'gifts',
    name: 'Geschenke',
    desc: 'Wunschliste oder Geldgeschenk — diskret und herzlich.',
    tier: 'zusatz',
  },
  {
    key: 'faq',
    name: 'FAQ',
    desc: 'Die häufigsten Fragen — Kinder, Hunde, Geschenke, Parken.',
    tier: 'zusatz',
  },
  {
    key: 'guest',
    name: 'Gästebuch',
    desc: 'Glückwünsche und Anekdoten — auch nach der Hochzeit.',
    tier: 'zusatz',
  },
];

export const BASIS_BEREICHE = BEREICHE.filter((b) => b.tier === 'basis');
export const ZUSATZ_BEREICHE = BEREICHE.filter((b) => b.tier === 'zusatz');
