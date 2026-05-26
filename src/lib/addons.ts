/**
 * Add-On-Komponenten für den Pricing-Konfigurator.
 * Reihenfolge bewusst gewählt: empfohlene zuerst (mit `recommended: true`).
 */

export interface AddonComponent {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
}

export const ADDON_COMPONENTS: AddonComponent[] = [
  {
    id: 'photo-upload',
    name: 'Foto-Upload für Gäste',
    description: 'Eure Gäste laden ihre Schnappschüsse direkt auf eure Seite hoch.',
    recommended: true,
  },
  {
    id: 'locations',
    name: 'Locations & Anfahrt',
    description: 'Trauort, Festlocation und Anfahrt mit interaktiver Karte.',
    recommended: true,
  },
  {
    id: 'timeline',
    name: 'Tagesablauf',
    description: 'Zeremonie, Sektempfang, Dinner, Tanz — alles im Überblick.',
    recommended: true,
  },
  {
    id: 'hotels',
    name: 'Hotels & Übernachtung',
    description: 'Empfohlene Hotels in der Nähe, mit Sonderkonditionen.',
  },
  {
    id: 'guestbook',
    name: 'Gästebuch (digital)',
    description: 'Eure Gäste hinterlassen Nachrichten direkt online.',
  },
  {
    id: 'music',
    name: 'Musikwünsche',
    description: 'Eure Gäste sammeln Songs für die Tanzfläche.',
  },
  {
    id: 'wishlist',
    name: 'Wunschliste & Geschenke',
    description: 'Hochzeitskasse, Wunschliste oder Spendenaktion.',
  },
  {
    id: 'faq',
    name: 'FAQ-Bereich',
    description: 'Antworten auf die häufigsten Gäste-Fragen — Dresscode, Kinder, Parken.',
  },
  {
    id: 'abc',
    name: 'Hochzeits-ABC',
    description: 'Eure persönliche Liste von A wie Anfahrt bis Z wie Zugabe.',
  },
];
