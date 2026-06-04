export interface Bereich {
  key: string;
  name: string;
  desc: string;
  isStandard: boolean;
}

export const BEREICHE: Bereich[] = [
  { key: 'hero',       name: 'Hero',       desc: 'Eure Namen, Datum, Location. Der Eindruck zählt.', isStandard: true },
  { key: 'countdown',  name: 'Countdown',  desc: 'Live-Zähler bis zum großen Tag.',                  isStandard: true },
  { key: 'rsvp',       name: 'RSVP',       desc: 'Antworten sammeln, ohne Excel-Listen.',            isStandard: true },
  { key: 'lovestory',  name: 'Lovestory',  desc: 'Wo alles anfing — als Timeline oder Text.',        isStandard: true },
  { key: 'timeline',   name: 'Ablauf',         desc: 'Stunde für Stunde — Trauung bis Mitternacht.', isStandard: false },
  { key: 'directions', name: 'Anfahrt',        desc: 'Karte, Adresse, Hotels in der Nähe.',          isStandard: false },
  { key: 'accomm',     name: 'Übernachtung',   desc: 'Hotels mit Kontingenten, Vorbuchungs-Link.',   isStandard: false },
  { key: 'gallery',    name: 'Galerie',        desc: 'Engagement-Shots vor der Hochzeit.',           isStandard: false },
  { key: 'photoupload',name: 'Foto-Upload',    desc: 'Gäste laden Fotos hoch — privat fürs Paar.',   isStandard: false },
  { key: 'guestbook',  name: 'Gästebuch',      desc: 'Glückwünsche statt Karten-Tütchen.',           isStandard: false },
  { key: 'music',      name: 'Musikwünsche',   desc: 'Sammlung für die DJ-Playlist.',                isStandard: false },
  { key: 'gifts',      name: 'Geschenke',      desc: 'Hochzeitskasse oder Wunschliste — euer Call.', isStandard: false },
  { key: 'witnesses',  name: 'Trauzeugen',     desc: 'Bilder und kurze Bios der Trauzeugen.',        isStandard: false },
  { key: 'faq',        name: 'FAQ',            desc: 'Dresscode, Kinder, Geschenke — einmal klären.',isStandard: false },
  { key: 'abc',        name: 'Hochzeits-ABC',  desc: 'Die wichtigsten Infos alphabetisch.',          isStandard: false },
];

export const STANDARD_BEREICHE = BEREICHE.filter(b => b.isStandard);
export const ZUSATZ_BEREICHE = BEREICHE.filter(b => !b.isStandard);

export interface PricingTier {
  key: string;
  name: string;
  zusatz: number;
  price: number;
  isPopular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  { key: 'std',  name: 'Standard',     zusatz: 0,  price: 9 },
  { key: 'p3',   name: '+3 Bereiche',  zusatz: 3,  price: 14 },
  { key: 'p6',   name: '+6 Bereiche',  zusatz: 6,  price: 18, isPopular: true },
  { key: 'p9',   name: '+9 Bereiche',  zusatz: 9,  price: 21 },
  { key: 'p11',  name: 'Alle Bereiche', zusatz: 11, price: 23 },
];

export function priceForZusatzCount(count: number): number {
  if (count === 0) return 9;
  if (count <= 3) return 14;
  if (count <= 6) return 18;
  if (count <= 9) return 21;
  return 23;
}
