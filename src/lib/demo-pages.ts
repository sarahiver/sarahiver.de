import type { BereichKey } from '@/types/supabase';

/**
 * Acht kuratierte Demo-Hochzeiten — eine je Designwelt.
 *
 * Eine Quelle für drei Verwendungen:
 *   1. /demo/[style] — öffentliche Demo-Seite, rendert direkt aus diesen Daten
 *      (ohne Datenbank, damit die Demos immer erreichbar sind)
 *   2. Landingpage — Stilkarten (Paar, Datum, Bild, Link)
 *   3. Seeding echter Demo-Sites (lib/seed-demos.ts)
 *
 * Grundsätze:
 *   - Jede Demo ist eine eigene Hochzeit: eigenes Paar, eigenes Datum, eigener
 *     Ort, eigener Ton. Keine Variantenschau.
 *   - Reihenfolge, Anzahl und A/B/C-Mischung unterscheiden sich bewusst je
 *     Stil; nicht jede Demo hat alle Bereiche.
 *   - Bilder ausschließlich aus dem vorhandenen Projekt-Bildpool.
 *   - Kein Eingriff in die eingefrorenen Designs — nur Inhalt und Auswahl.
 */

const PHOTO_IDS = [31558934, 34409906, 32439850, 8528876, 8554867, 5859639] as const;

export const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** Stabiler Zugriff auf den Bildpool: img(0) ist immer dasselbe Bild. */
export const img = (i: number, w = 1200) => px(PHOTO_IDS[i % PHOTO_IDS.length], w);

export interface DemoSection {
  key: BereichKey;
  variant: 'a' | 'b' | 'c';
}

export interface DemoStory {
  when: string;
  title: string;
  text: string;
}

export interface DemoPage {
  /** start_styles.id */
  style: string;
  /** Slug der gesäten Demo-Site (auch Ziel der Formulare auf der Demo-Seite). */
  slug: string;
  name1: string;
  name2: string;
  /** YYYY-MM-DD, in der Zukunft, damit der Countdown läuft. */
  date: string;
  location: string;
  /** Kurzbeschreibung für die Landingkarte. */
  claim: string;
  hero: number;
  heroEyebrow: string;
  storyTitle: string;
  storyIntro: string;
  story: DemoStory[];
  timeline: { time: string; title: string; description: string }[];
  venue: { name: string; address: string; hint: string };
  hotels: { name: string; distance: string; price: string }[];
  witnesses: { name: string; role: string; intro: string }[];
  gifts: { title: string; description: string; amount: string }[];
  giftsIntro: string;
  faq: { question: string; answer: string }[];
  guestbook: { name: string; message: string }[];
  music: { title: string; artist: string; guest: string }[];
  abc: { letter: string; term: string; text: string }[];
  sections: DemoSection[];
}

export const DEMO_PAGES: DemoPage[] = [
  {
    style: 'editorial',
    slug: 'sofia-und-mateo',
    name1: 'Sofia',
    name2: 'Mateo',
    date: '2026-08-22',
    location: 'Gut Basthorst, bei Hamburg',
    claim: 'Ruhig, redaktionell, viel Weißraum',
    hero: 0,
    heroEyebrow: 'Wir heiraten',
    storyTitle: 'Ein Ja in Kopenhagen',
    storyIntro:
      'Ein verregneter Morgen am Hafen, zwei Kaffee to go und eine Frage, die alles verändert hat.',
    story: [
      { when: 'Frühjahr 2019', title: 'Der erste Abend', text: 'Eine Ausstellungseröffnung, zu wenig Stühle, ein geteiltes Glas Wein — und drei Stunden, die sich wie zwanzig Minuten anfühlten.' },
      { when: 'Sommer 2022', title: 'Zwei Städte, eine Wohnung', text: 'Nach zwei Jahren zwischen Hamburg und Valencia stand plötzlich ein Umzugswagen vor der Tür. Seitdem sprechen wir zu Hause zwei Sprachen.' },
      { when: 'Winter 2025', title: 'Die Frage am Hafen', text: 'Kopenhagen, Nieselregen, kalte Finger. Und eine Frage, auf die es nur eine Antwort gab.' },
    ],
    timeline: [
      { time: '14:30', title: 'Freie Trauung', description: 'Im Garten hinter dem Herrenhaus. Bitte 20 Minuten vorher da sein.' },
      { time: '15:30', title: 'Sektempfang', description: 'Anstoßen, gratulieren, Sonne genießen.' },
      { time: '18:00', title: 'Dinner', description: 'Ein langes Abendessen mit allen, die uns wichtig sind.' },
      { time: '21:00', title: 'Eröffnungstanz', description: 'Danach gehört die Tanzfläche euch.' },
    ],
    venue: { name: 'Gut Basthorst', address: 'Dorfstraße 1, 21493 Basthorst', hint: 'Parkplätze direkt an der Zufahrt. Shuttle ab Bahnhof Schwarzenbek um 12:30 und 13:00 Uhr.' },
    hotels: [
      { name: 'Landhaus Sonnenberg', distance: '5 Min. mit dem Auto', price: 'ab 120 € / Nacht' },
      { name: 'Hotel Am Markt', distance: '15 Min. mit dem Auto', price: 'ab 95 € / Nacht' },
    ],
    witnesses: [
      { name: 'Lena', role: 'Trauzeugin', intro: 'Kennt alle Geschichten und erzählt die meisten davon nicht weiter.' },
      { name: 'Andrés', role: 'Trauzeuge', intro: 'Zuständig für Reden, Musikwünsche und den zweiten Espresso.' },
    ],
    giftsIntro:
      'Das größte Geschenk ist, dass ihr da seid. Wer trotzdem etwas beitragen möchte: Wir sparen auf zwei Wochen Andalusien.',
    gifts: [
      { title: 'Eine Nacht in der Finca', description: 'Weiße Wände, alter Olivenbaum, kein Handyempfang.', amount: '120 €' },
      { title: 'Abendessen am Hafen', description: 'Für einen langen Abend zu zweit.', amount: '80 €' },
      { title: 'Ein Tag am Meer', description: 'Überrascht uns — wir freuen uns über alles.', amount: '50 €' },
    ],
    faq: [
      { question: 'Gibt es einen Dresscode?', answer: 'Festlich, gern in warmen Farben. Für die Wiese sind flache Schuhe die bessere Wahl.' },
      { question: 'Dürfen Kinder mit?', answer: 'Sehr gern. Sagt uns bei der Zusage kurz Bescheid, es gibt ab 15 Uhr eine Betreuung.' },
      { question: 'Bis wann sollen wir zusagen?', answer: 'Bitte bis vier Wochen vorher über das Formular auf dieser Seite.' },
      { question: 'Können wir übernachten?', answer: 'Im Landhaus haben wir ein Kontingent reserviert, Stichwort „Sofia & Mateo".' },
    ],
    guestbook: [
      { name: 'Oma Hilde', message: 'Ich habe euch beide von Anfang an zusammen gesehen. Was für ein Tag wird das!' },
      { name: 'Clara & Jan', message: 'Alles Liebe — wir sehen uns im August.' },
      { name: 'Tom', message: 'Endlich!' },
    ],
    music: [
      { title: 'Dancing Queen', artist: 'ABBA', guest: 'Johanna' },
      { title: 'Sweet Disposition', artist: 'The Temper Trap', guest: 'Lena' },
      { title: 'Cello', artist: 'Udo Lindenberg', guest: '' },
    ],
    abc: [
      { letter: 'A', term: 'Anfahrt', text: 'Shuttle ab Bahnhof um 12:30 und 13:00 Uhr.' },
      { letter: 'K', term: 'Kinder', text: 'Betreuung ab 15 Uhr in der kleinen Scheune.' },
      { letter: 'R', term: 'Reden', text: 'Bitte bei Lena anmelden, maximal drei Minuten.' },
    ],
    sections: [
      { key: 'hero', variant: 'a' },
      { key: 'countdown', variant: 'a' },
      { key: 'lovestory', variant: 'b' },
      { key: 'timeline', variant: 'a' },
      { key: 'gallery', variant: 'a' },
      { key: 'directions', variant: 'a' },
      { key: 'accommodations', variant: 'a' },
      { key: 'gifts', variant: 'a' },
      { key: 'faq', variant: 'a' },
      { key: 'rsvp', variant: 'a' },
      { key: 'guestbook', variant: 'a' },
    ],
  },

  {
    style: 'organic',
    slug: 'amara-und-julien',
    name1: 'Amara',
    name2: 'Julien',
    date: '2026-09-12',
    location: 'Weingut Sonnenhang, Pfalz',
    claim: 'Weich, natürlich, zwischen Reben',
    hero: 1,
    heroEyebrow: 'Save the date',
    storyTitle: 'Zwischen Reben und Sommerlicht',
    storyIntro:
      'Aus einem geliehenen Fahrrad und einer falschen Abzweigung wurde der schönste Umweg unseres Lebens.',
    story: [
      { when: 'August 2020', title: 'Die falsche Abzweigung', text: 'Amara wollte zum See, Julien kannte den Weg — dachte er. Fünf Kilometer später standen wir vor einem Weinberg und blieben bis zum Sonnenuntergang.' },
      { when: 'Mai 2023', title: 'Der kleine Garten', text: 'Zwei Tomatenpflanzen, ein Rosmarinstrauch und die feste Überzeugung, dass wir das können.' },
      { when: 'Juli 2025', title: 'Barfuß im Gras', text: 'Kein großer Plan, kein Publikum. Nur die Frage, ob wir das hier für immer machen wollen.' },
    ],
    timeline: [
      { time: '15:00', title: 'Trauung im Weinberg', description: 'Oben am Hang, bitte festes Schuhwerk mitbringen.' },
      { time: '16:30', title: 'Aperitif zwischen den Reben', description: 'Mit Blick über das ganze Tal.' },
      { time: '19:00', title: 'Langes Tafeln', description: 'Eine Tafel, alle zusammen, viele Schüsseln in der Mitte.' },
      { time: '22:00', title: 'Feuerschale', description: 'Für alle, die es ruhiger mögen.' },
    ],
    venue: { name: 'Weingut Sonnenhang', address: 'Am Hang 4, 67487 Maikammer', hint: 'Parken auf dem Hofgelände. Der letzte Weg zum Weinberg ist ein Feldweg.' },
    hotels: [
      { name: 'Pension Rebgarten', distance: '10 Min. zu Fuß', price: 'ab 85 € / Nacht' },
      { name: 'Gästehaus Am Tal', distance: '8 Min. mit dem Auto', price: 'ab 70 € / Nacht' },
    ],
    witnesses: [
      { name: 'Yara', role: 'Trauzeugin', intro: 'Hat den Weinberg gefunden und besteht darauf, dass es Absicht war.' },
      { name: 'Milan', role: 'Trauzeuge', intro: 'Kümmert sich um Feuerschale, Decken und den späten Abend.' },
    ],
    giftsIntro:
      'Wir haben alles, was wir brauchen. Wenn ihr etwas schenken möchtet: Wir träumen von einem Sommer in Portugal.',
    gifts: [
      { title: 'Zwei Nächte an der Algarve', description: 'Kleines Haus, großer Balkon.', amount: '150 €' },
      { title: 'Ein Korb vom Markt', description: 'Für das erste Abendessen dort.', amount: '40 €' },
    ],
    faq: [
      { question: 'Wie fest sollten die Schuhe sein?', answer: 'Der Weg zum Weinberg ist ein Feldweg — Absätze sinken ein, Sneaker sind perfekt.' },
      { question: 'Gibt es vegetarisches Essen?', answer: 'Der größte Teil der Tafel ist vegetarisch. Sagt uns bei der Zusage Bescheid, wenn ihr etwas nicht esst.' },
      { question: 'Wie kommen wir abends zurück?', answer: 'Um 23:30 und 01:00 Uhr fährt ein Shuttle ins Dorf.' },
    ],
    guestbook: [
      { name: 'Mama Ruth', message: 'Barfuß im Gras — natürlich ihr beide. Ich freue mich so.' },
      { name: 'Die Nachbarn aus Nr. 7', message: 'Wir bringen den Rosmarin mit, versprochen.' },
    ],
    music: [
      { title: 'Harvest Moon', artist: 'Neil Young', guest: 'Yara' },
      { title: 'Der Weg', artist: 'Herbert Grönemeyer', guest: '' },
    ],
    abc: [
      { letter: 'F', term: 'Feuerschale', text: 'Ab 22 Uhr, Decken liegen bereit.' },
      { letter: 'S', term: 'Shuttle', text: '23:30 und 01:00 Uhr ins Dorf.' },
      { letter: 'W', term: 'Wetter', text: 'Bei Regen feiern wir in der Kelterhalle.' },
    ],
    sections: [
      { key: 'hero', variant: 'b' },
      { key: 'lovestory', variant: 'a' },
      { key: 'countdown', variant: 'b' },
      { key: 'timeline', variant: 'b' },
      { key: 'directions', variant: 'a' },
      { key: 'accommodations', variant: 'b' },
      { key: 'gallery', variant: 'b' },
      { key: 'gifts', variant: 'b' },
      { key: 'rsvp', variant: 'b' },
      { key: 'weddingabc', variant: 'a' },
    ],
  },

  {
    style: 'opulent',
    slug: 'valentina-und-luca',
    name1: 'Valentina',
    name2: 'Luca',
    date: '2026-10-03',
    location: 'Schloss Bensberg, Bergisch Gladbach',
    claim: 'Festlich, zeremoniell, mit Gold',
    hero: 2,
    heroEyebrow: 'Wir laden ein',
    storyTitle: 'Ein Winterabend, ein Versprechen',
    storyIntro:
      'Kerzenlicht, ein letzter Tanz im leeren Saal und die Gewissheit: mit dir, für immer.',
    story: [
      { when: 'Oktober 2018', title: 'Die erste Oper', text: 'Zwei Restkarten, letzte Reihe, ein geteiltes Programmheft. Nach dem dritten Akt haben wir uns nicht mehr auf die Bühne konzentriert.' },
      { when: 'Dezember 2021', title: 'Rom im Regen', text: 'Ein Wochenende, das fünf Tage wurde. Seitdem wissen wir, wie gut wir zusammen improvisieren.' },
      { when: 'Februar 2026', title: 'Der letzte Tanz', text: 'Ein Ballsaal kurz vor Mitternacht, ein Orchester beim Einpacken und eine Frage, die trotzdem alle gehört haben.' },
    ],
    timeline: [
      { time: '13:00', title: 'Trauung in der Kapelle', description: 'Einlass ab 12:30 Uhr.' },
      { time: '14:30', title: 'Empfang im Spiegelsaal', description: 'Champagner und Zeit für Fotos.' },
      { time: '17:00', title: 'Menü', description: 'Fünf Gänge, lange Tafel, kurze Reden.' },
      { time: '20:00', title: 'Eröffnungswalzer', description: 'Danach spielt die Band bis zwei.' },
      { time: '23:30', title: 'Mitternachtssuppe', description: 'Eine Tradition, auf die wir bestehen.' },
    ],
    venue: { name: 'Schloss Bensberg', address: 'Kadettenstraße, 51429 Bergisch Gladbach', hint: 'Valet-Parken am Haupteingang. Taxis fahren bis vor die Treppe.' },
    hotels: [
      { name: 'Schlosshotel, Zimmerkontingent', distance: 'im Haus', price: 'ab 210 € / Nacht' },
      { name: 'Hotel Villa Rheinblick', distance: '12 Min. mit dem Auto', price: 'ab 140 € / Nacht' },
    ],
    witnesses: [
      { name: 'Beatrice', role: 'Trauzeugin', intro: 'Hält den Zeitplan, die Ringe und die Nerven zusammen.' },
      { name: 'Ferdinand', role: 'Trauzeuge', intro: 'Verantwortlich für Reden, Zigarren und die zweite Flasche.' },
    ],
    giftsIntro:
      'Ihr müsst uns nichts mitbringen. Wer möchte, unterstützt unsere Hochzeitsreise nach Japan.',
    gifts: [
      { title: 'Eine Nacht im Ryokan', description: 'Mit Onsen und Blick auf den Garten.', amount: '180 €' },
      { title: 'Abendessen in Kyoto', description: 'Zehn Gänge, kleine Schalen.', amount: '120 €' },
      { title: 'Zugfahrt nach Norden', description: 'Für den Teil der Reise, den wir noch nicht planen.', amount: '60 €' },
    ],
    faq: [
      { question: 'Wie festlich ist festlich?', answer: 'Langes Kleid und dunkler Anzug — der Abend gibt den Ton vor.' },
      { question: 'Gibt es eine Sitzordnung?', answer: 'Ja, ihr findet eure Plätze auf dem Plan im Foyer.' },
      { question: 'Können wir im Haus übernachten?', answer: 'Wir haben ein Kontingent reserviert. Stichwort „Valentina & Luca" bei der Buchung.' },
      { question: 'Dürfen wir fotografieren?', answer: 'Während der Trauung bitte nicht, danach sehr gern.' },
    ],
    guestbook: [
      { name: 'Familie Ricci', message: 'Wir kommen mit dem ganzen Clan — macht euch auf etwas gefasst.' },
      { name: 'Beatrice', message: 'Seit der Oper wusste ich es. Endlich ist es so weit.' },
    ],
    music: [
      { title: 'At Last', artist: 'Etta James', guest: 'Beatrice' },
      { title: 'Nel blu dipinto di blu', artist: 'Domenico Modugno', guest: 'Familie Ricci' },
      { title: 'Rhythm Is a Dancer', artist: 'Snap!', guest: 'Ferdinand' },
    ],
    abc: [
      { letter: 'D', term: 'Dresscode', text: 'Langes Kleid, dunkler Anzug.' },
      { letter: 'M', term: 'Mitternacht', text: 'Suppe im Spiegelsaal, bitte nicht verpassen.' },
      { letter: 'T', term: 'Taxi', text: 'Steht ab 1 Uhr vor dem Haupteingang bereit.' },
    ],
    sections: [
      { key: 'hero', variant: 'c' },
      { key: 'countdown', variant: 'a' },
      { key: 'lovestory', variant: 'c' },
      { key: 'timeline', variant: 'a' },
      { key: 'witnesses', variant: 'a' },
      { key: 'directions', variant: 'b' },
      { key: 'accommodations', variant: 'a' },
      { key: 'gifts', variant: 'c' },
      { key: 'faq', variant: 'a' },
      { key: 'rsvp', variant: 'a' },
    ],
  },

  {
    style: 'mono',
    slug: 'nora-und-karim',
    name1: 'Nora',
    name2: 'Karim',
    date: '2026-06-20',
    location: 'Kunsthalle Speicher, Leipzig',
    claim: 'Reduziert, klar, editorial',
    hero: 3,
    heroEyebrow: '20. Juni 2026',
    storyTitle: 'Zwei Listen, ein Plan',
    storyIntro:
      'Wir haben uns über eine Tabelle kennengelernt. Heute teilen wir Kalender, Kaffeetassen und einen sehr kurzen Gästelistenstreit.',
    story: [
      { when: '2019', title: 'Spalte C', text: 'Ein Projekt, zwei Meinungen, eine Tabelle. Aus der Diskussion wurde ein Feierabendbier und daraus alles Weitere.' },
      { when: '2024', title: 'Der Umzug nach Leipzig', text: 'Zwei Kisten Bücher zu viel und trotzdem der beste Umzug, den wir je gemacht haben.' },
    ],
    timeline: [
      { time: '16:00', title: 'Standesamt', description: 'Im engsten Kreis, danach sehen wir uns alle.' },
      { time: '18:00', title: 'Empfang im Speicher', description: 'Getränke im Erdgeschoss, Ausstellung offen.' },
      { time: '19:30', title: 'Essen', description: 'Buffet, alles vegetarisch.' },
      { time: '22:00', title: 'Musik', description: 'DJ im Gewölbe bis open end.' },
    ],
    venue: { name: 'Kunsthalle Speicher', address: 'Spinnereistraße 7, 04179 Leipzig', hint: 'Straßenbahn 14 bis Plagwitz, dann fünf Minuten zu Fuß. Parken auf dem Hof.' },
    hotels: [
      { name: 'Hotel Baumwollspinnerei', distance: '3 Min. zu Fuß', price: 'ab 105 € / Nacht' },
      { name: 'Apartments West', distance: '10 Min. zu Fuß', price: 'ab 80 € / Nacht' },
    ],
    witnesses: [
      { name: 'Ida', role: 'Trauzeugin', intro: 'War bei der Tabelle dabei und kennt die ganze Geschichte.' },
      { name: 'Samir', role: 'Trauzeuge', intro: 'Bringt die Playlist und den Bruder mit.' },
    ],
    giftsIntro: 'Bitte keine Geschenke. Wer trotzdem möchte: Wir sammeln für eine lange Zugreise.',
    gifts: [
      { title: 'Ein Zugticket nach Lissabon', description: 'Drei Tage, vier Umstiege, ein Ziel.', amount: '90 €' },
      { title: 'Ein Abend unterwegs', description: 'Irgendwo zwischen Start und Ziel.', amount: '45 €' },
    ],
    faq: [
      { question: 'Gibt es einen Dresscode?', answer: 'Kommt so, wie ihr euch wohlfühlt. Wir tragen Schwarz und Weiß.' },
      { question: 'Ist das Essen vegetarisch?', answer: 'Ja, komplett. Sagt uns Bescheid, wenn ihr etwas nicht vertragt.' },
      { question: 'Wann ist Schluss?', answer: 'Offiziell nie. Das Gewölbe schließt um vier.' },
    ],
    guestbook: [
      { name: 'Ida', message: 'Spalte C war der Anfang von allem. Ich finde das immer noch großartig.' },
      { name: 'Kolleginnen aus dem Studio', message: 'Wir kommen pünktlich. Ausnahmsweise.' },
    ],
    music: [
      { title: 'This Must Be the Place', artist: 'Talking Heads', guest: 'Samir' },
      { title: 'Alles neu', artist: 'Peter Fox', guest: '' },
    ],
    abc: [
      { letter: 'B', term: 'Bahn', text: 'Straßenbahn 14 bis Plagwitz.' },
      { letter: 'E', term: 'Essen', text: 'Buffet ab 19:30 Uhr, vegetarisch.' },
      { letter: 'F', term: 'Fotos', text: 'Gern überall — außer im Ausstellungsraum.' },
    ],
    sections: [
      { key: 'hero', variant: 'b' },
      { key: 'lovestory', variant: 'a' },
      { key: 'timeline', variant: 'a' },
      { key: 'directions', variant: 'a' },
      { key: 'gallery', variant: 'c' },
      { key: 'faq', variant: 'b' },
      { key: 'rsvp', variant: 'a' },
      { key: 'musicwishes', variant: 'a' },
    ],
  },

  {
    style: 'liquefy',
    slug: 'maya-und-daniel',
    name1: 'Maya',
    name2: 'Daniel',
    date: '2026-07-11',
    location: 'Strandhaus Prerow, Ostsee',
    claim: 'Weich, atmosphärisch, viel Licht',
    hero: 4,
    heroEyebrow: 'Am Meer',
    storyTitle: 'Immer wieder ans Wasser',
    storyIntro:
      'Neun Jahre, elf Umzüge, ein Hund und ziemlich viel Sand in allen Taschen.',
    story: [
      { when: 'Sommer 2017', title: 'Der Sturm', text: 'Ein Zelt, das nicht hielt, und ein Auto, in dem wir die Nacht verbracht haben. Wir lachen bis heute darüber.' },
      { when: 'Herbst 2021', title: 'Kiwi', text: 'Aus „nur mal gucken" wurde ein Hund, der jetzt bei der Trauung neben uns sitzt.' },
      { when: 'Frühjahr 2026', title: 'Am Steg', text: 'Früh am Morgen, niemand sonst wach. Die Frage kam ohne Ring, der kam später.' },
    ],
    timeline: [
      { time: '16:00', title: 'Trauung an der Düne', description: 'Barfuß erlaubt, Decken liegen bereit.' },
      { time: '17:30', title: 'Apéro am Strand', description: 'Mit Blick auf das Wasser.' },
      { time: '19:30', title: 'Dinner im Strandhaus', description: 'Fisch, Gemüse, lange Tafel.' },
      { time: '22:30', title: 'Feuer am Strand', description: 'Für alle, die noch bleiben.' },
    ],
    venue: { name: 'Strandhaus Prerow', address: 'Strandweg 2, 18375 Prerow', hint: 'Die letzten 300 Meter gehen über den Bohlenweg. Parken am Waldrand.' },
    hotels: [
      { name: 'Hotel Dünenblick', distance: '7 Min. zu Fuß', price: 'ab 130 € / Nacht' },
      { name: 'Ferienwohnungen Kiefernweg', distance: '15 Min. zu Fuß', price: 'ab 95 € / Nacht' },
    ],
    witnesses: [
      { name: 'Jara', role: 'Trauzeugin', intro: 'War beim Sturm dabei und hat trotzdem wieder zugesagt.' },
      { name: 'Ben', role: 'Trauzeuge', intro: 'Kümmert sich um Feuer, Holz und die Playlist danach.' },
    ],
    giftsIntro: 'Kommt einfach — das reicht uns völlig. Wer mag, hilft beim Ausbau unseres Bullis.',
    gifts: [
      { title: 'Ein Stück Bulli', description: 'Küchenzeile, Solarpanel, irgendwann Vorhänge.', amount: '100 €' },
      { title: 'Eine Nacht am Meer', description: 'Auf der ersten Tour im Sommer.', amount: '60 €' },
    ],
    faq: [
      { question: 'Was zieht man am Strand an?', answer: 'Sommerlich und windfest. Absätze bleiben besser zu Hause.' },
      { question: 'Ist es kalt am Abend?', answer: 'Meistens ja. Wir haben Decken da, eine Jacke schadet trotzdem nicht.' },
      { question: 'Dürfen Hunde mit?', answer: 'Kiwi freut sich über Gesellschaft — sagt uns kurz Bescheid.' },
    ],
    guestbook: [
      { name: 'Jara', message: 'Von der Sturmnacht bis zur Düne. Ich könnte heulen vor Freude.' },
      { name: 'Opa Werner', message: 'Ich bringe den guten Korn mit.' },
      { name: 'Familie Sander', message: 'Wir kommen mit Sack, Pack und drei Kindern.' },
    ],
    music: [
      { title: 'Sunset Lover', artist: 'Petit Biscuit', guest: 'Ben' },
      { title: 'Über den Wolken', artist: 'Reinhard Mey', guest: 'Opa Werner' },
    ],
    abc: [
      { letter: 'B', term: 'Barfuß', text: 'Ausdrücklich erlaubt.' },
      { letter: 'D', term: 'Decken', text: 'Liegen am Eingang bereit.' },
      { letter: 'H', term: 'Hunde', text: 'Sehr willkommen, bitte kurz ankündigen.' },
    ],
    sections: [
      { key: 'hero', variant: 'c' },
      { key: 'countdown', variant: 'c' },
      { key: 'lovestory', variant: 'b' },
      { key: 'gallery', variant: 'a' },
      { key: 'timeline', variant: 'b' },
      { key: 'directions', variant: 'a' },
      { key: 'accommodations', variant: 'c' },
      { key: 'rsvp', variant: 'b' },
      { key: 'guestbook', variant: 'c' },
      { key: 'photoupload', variant: 'b' },
    ],
  },

  {
    style: 'kinetic',
    slug: 'layla-und-samir',
    name1: 'Layla',
    name2: 'Samir',
    date: '2026-05-30',
    location: 'Kraftwerk Ost, Berlin',
    claim: 'Laut, typografisch, mit Tempo',
    hero: 5,
    heroEyebrow: 'Save the date',
    storyTitle: 'Zwei Städte, ein Takt',
    storyIntro:
      'Kennengelernt auf einer Tanzfläche, wiedergesehen an einem Bahnsteig, seitdem ziemlich laut zusammen.',
    story: [
      { when: '2020', title: 'Letzter Song', text: 'Um vier Uhr morgens, als das Licht anging. Seitdem ist dieser Track bei uns Pflicht.' },
      { when: '2023', title: 'Gleis 7', text: 'Drei Monate Fernbeziehung und ein Koffer, der nie ganz ausgepackt wurde.' },
      { when: '2025', title: 'Die Ansage', text: 'Kein Kniefall, kein Restaurant. Nur eine klare Ansage im Hausflur — und ein sehr lautes Ja.' },
    ],
    timeline: [
      { time: '15:00', title: 'Trauung in der Halle', description: 'Pünktlich, das Licht macht nur einmal mit.' },
      { time: '16:00', title: 'Empfang im Hof', description: 'Streetfood, Limo, Sonne.' },
      { time: '19:00', title: 'Dinner', description: 'Lange Tische, alles zum Teilen.' },
      { time: '21:00', title: 'Bühne frei', description: 'Live-Set, danach DJ bis vier.' },
    ],
    venue: { name: 'Kraftwerk Ost', address: 'Köpenicker Straße 70, 10179 Berlin', hint: 'U-Bahn bis Heinrich-Heine-Straße, fünf Minuten zu Fuß. Keine eigenen Parkplätze.' },
    hotels: [
      { name: 'Hotel Ostkreuz', distance: '10 Min. mit der U-Bahn', price: 'ab 110 € / Nacht' },
      { name: 'Hostel Spreeufer', distance: '6 Min. zu Fuß', price: 'ab 60 € / Nacht' },
    ],
    witnesses: [
      { name: 'Deniz', role: 'Trauzeuge', intro: 'War auf der Tanzfläche dabei und hat alles fotografiert.' },
      { name: 'Rosa', role: 'Trauzeugin', intro: 'Hält Zeitplan und Gästeliste zusammen.' },
    ],
    giftsIntro: 'Wir brauchen nichts. Wer etwas schenken möchte: Wir sparen auf eine Anlage für den Garten.',
    gifts: [
      { title: 'Ein Lautsprecher', description: 'Für alle Feiern danach.', amount: '130 €' },
      { title: 'Eine Runde für alle', description: 'Am späten Abend, ihr seid dabei.', amount: '50 €' },
    ],
    faq: [
      { question: 'Wie kommen wir hin?', answer: 'Am besten mit der U8 bis Heinrich-Heine-Straße. Parkplätze gibt es keine.' },
      { question: 'Wie laut wird es?', answer: 'Laut. Wer eine Pause braucht: Der Hof ist den ganzen Abend offen.' },
      { question: 'Gibt es einen Dresscode?', answer: 'Kommt, wie ihr tanzen wollt.' },
    ],
    guestbook: [
      { name: 'Deniz', message: 'Ich habe das Foto von der Tanzfläche noch. Es kommt in die Rede.' },
      { name: 'Nachbarn aus dem zweiten Stock', message: 'Wir freuen uns — und schlafen an dem Wochenende woanders.' },
    ],
    music: [
      { title: 'Blinding Lights', artist: 'The Weeknd', guest: 'Rosa' },
      { title: 'Ein Elefant für dich', artist: 'Sportfreunde Stiller', guest: '' },
      { title: 'Bring mich nach Haus', artist: 'AnnenMayKantereit', guest: 'Deniz' },
    ],
    abc: [
      { letter: 'A', term: 'Anreise', text: 'U8 bis Heinrich-Heine-Straße.' },
      { letter: 'H', term: 'Hof', text: 'Den ganzen Abend offen, zum Durchatmen.' },
      { letter: 'S', term: 'Schluss', text: 'Vier Uhr. Theoretisch.' },
    ],
    sections: [
      { key: 'hero', variant: 'c' },
      { key: 'countdown', variant: 'c' },
      { key: 'lovestory', variant: 'b' },
      { key: 'gallery', variant: 'b' },
      { key: 'timeline', variant: 'b' },
      { key: 'directions', variant: 'a' },
      { key: 'rsvp', variant: 'c' },
      { key: 'musicwishes', variant: 'c' },
      { key: 'faq', variant: 'c' },
    ],
  },

  {
    style: 'brutalist',
    slug: 'chloe-und-elias',
    name1: 'Chloé',
    name2: 'Elias',
    date: '2026-04-18',
    location: 'Alte Münze, Frankfurt',
    claim: 'Hart, kontrastreich, ohne Schnörkel',
    hero: 3,
    heroEyebrow: 'Es passiert',
    storyTitle: 'Keine große Geschichte',
    storyIntro:
      'Wir mögen keine Schnörkel. Also kurz: sieben Jahre, eine Wohnung, ein Hund, jetzt das hier.',
    story: [
      { when: '2019', title: 'Baustelle', text: 'Chloé hat den Altbau gekauft, Elias die Bohrmaschine mitgebracht. Der Rest ergab sich.' },
      { when: '2026', title: 'Entscheidung', text: 'An einem Dienstag, zwischen zwei Terminen. Keine Kerzen, kein Ring — nur beide sicher.' },
    ],
    timeline: [
      { time: '17:00', title: 'Trauung', description: 'Im großen Saal. Pünktlich.' },
      { time: '18:00', title: 'Drinks', description: 'Bar offen, Musik läuft.' },
      { time: '20:00', title: 'Essen', description: 'Ein Gang, große Schüsseln, alles zum Teilen.' },
      { time: '23:00', title: 'Tanz', description: 'Bis das Licht angeht.' },
    ],
    venue: { name: 'Alte Münze', address: 'Münzgasse 3, 60311 Frankfurt', hint: 'Parkhaus Dom/Römer, fünf Minuten zu Fuß. S-Bahn bis Konstablerwache.' },
    hotels: [
      { name: 'Hotel Zentrum', distance: '4 Min. zu Fuß', price: 'ab 125 € / Nacht' },
      { name: 'Boardinghouse Ost', distance: '12 Min. mit der Bahn', price: 'ab 85 € / Nacht' },
    ],
    witnesses: [
      { name: 'Malik', role: 'Trauzeuge', intro: 'Hält die Rede kurz. Angeblich.' },
      { name: 'Vera', role: 'Trauzeugin', intro: 'Organisiert alles, was wir vergessen haben.' },
    ],
    giftsIntro: 'Keine Geschenke, wirklich. Wenn doch: Wir sammeln für die neue Werkstatt.',
    gifts: [
      { title: 'Werkbank', description: 'Massiv, schwer, endlich.', amount: '150 €' },
      { title: 'Werkzeug', description: 'Irgendwas fehlt immer.', amount: '60 €' },
    ],
    faq: [
      { question: 'Dresscode?', answer: 'Keiner. Kommt, wie ihr wollt.' },
      { question: 'Kinder?', answer: 'Klar. Es gibt einen ruhigen Raum im ersten Stock.' },
      { question: 'Wann ist Schluss?', answer: 'Wenn das Licht angeht. Gegen drei.' },
    ],
    guestbook: [
      { name: 'Vera', message: 'Ein Dienstag. Natürlich. Passt perfekt zu euch.' },
      { name: 'Malik', message: 'Rede ist fertig. Sie ist lang.' },
    ],
    music: [
      { title: 'Song 2', artist: 'Blur', guest: 'Malik' },
      { title: 'Schrei nach Liebe', artist: 'Die Ärzte', guest: '' },
    ],
    abc: [
      { letter: 'B', term: 'Bar', text: 'Ab 18 Uhr offen.' },
      { letter: 'K', term: 'Kinder', text: 'Ruhiger Raum im ersten Stock.' },
      { letter: 'P', term: 'Parken', text: 'Parkhaus Dom/Römer.' },
    ],
    sections: [
      { key: 'hero', variant: 'a' },
      { key: 'countdown', variant: 'b' },
      { key: 'lovestory', variant: 'a' },
      { key: 'timeline', variant: 'c' },
      { key: 'directions', variant: 'b' },
      { key: 'faq', variant: 'a' },
      { key: 'rsvp', variant: 'a' },
      { key: 'weddingabc', variant: 'b' },
    ],
  },

  {
    style: 'bauhaus',
    slug: 'aisha-und-leo',
    name1: 'Aisha',
    name2: 'Leo',
    date: '2026-09-05',
    location: 'Werkhalle Dessau',
    claim: 'Geometrisch, grafisch, klar sortiert',
    hero: 1,
    heroEyebrow: 'Fünfter September',
    storyTitle: 'Form folgt Gefühl',
    storyIntro:
      'Sie zeichnet Grundrisse, er baut Möbel. Zusammen bauen wir seit acht Jahren an derselben Sache.',
    story: [
      { when: '2018', title: 'Der Stuhl', text: 'Aisha wollte einen Prototyp, Leo hatte die Werkstatt. Der Stuhl steht heute in unserer Küche.' },
      { when: '2022', title: 'Das Regal', text: 'Drei Wochenenden, zwei Meinungsverschiedenheiten, ein Möbelstück, das genau passt.' },
      { when: '2025', title: 'Der Entwurf', text: 'Ein gefalteter Zettel auf dem Zeichentisch: ein Grundriss von einem Tag, den es noch nicht gab.' },
    ],
    timeline: [
      { time: '14:00', title: 'Trauung in der Halle', description: 'Nordlicht, Stühle im Halbkreis.' },
      { time: '15:00', title: 'Kaffee und Kuchen', description: 'Auf dem Hof, bei jedem Wetter.' },
      { time: '18:30', title: 'Abendessen', description: 'An langen Tafeln, alles aus der Region.' },
      { time: '21:00', title: 'Musik', description: 'Erst Band, dann Platten.' },
    ],
    venue: { name: 'Werkhalle Dessau', address: 'Gropiusallee 38, 06846 Dessau', hint: 'Parken auf dem Werksgelände. Vom Bahnhof zehn Minuten mit dem Rad.' },
    hotels: [
      { name: 'Hotel Meisterhaus', distance: '6 Min. mit dem Rad', price: 'ab 115 € / Nacht' },
      { name: 'Pension Werkstraße', distance: '10 Min. zu Fuß', price: 'ab 75 € / Nacht' },
    ],
    witnesses: [
      { name: 'Hanna', role: 'Trauzeugin', intro: 'Hat den Prototyp mitgetragen, im wörtlichen Sinn.' },
      { name: 'Ousmane', role: 'Trauzeuge', intro: 'Zuständig für Platten, Kuchen und die richtige Reihenfolge.' },
    ],
    giftsIntro: 'Wir haben genug Möbel. Wer etwas beitragen möchte: Wir sparen auf eine Reise nach Kopenhagen.',
    gifts: [
      { title: 'Zwei Nächte in Kopenhagen', description: 'Mit Fahrrädern und viel Kaffee.', amount: '140 €' },
      { title: 'Eintritt ins Designmuseum', description: 'Für zwei, ohne Zeitdruck.', amount: '40 €' },
      { title: 'Abendessen am Kanal', description: 'Das teuerste, was wir uns trauen.', amount: '90 €' },
    ],
    faq: [
      { question: 'Gibt es einen Dresscode?', answer: 'Farbe gern. Der Hof ist gepflastert, denkt an die Absätze.' },
      { question: 'Wie kommen wir zur Halle?', answer: 'Vom Bahnhof zehn Minuten mit dem Rad, 20 zu Fuß. Wir stellen Leihräder bereit.' },
      { question: 'Gibt es Kuchen?', answer: 'Sehr viel Kuchen. Ab 15 Uhr auf dem Hof.' },
    ],
    guestbook: [
      { name: 'Hanna', message: 'Der Stuhl war der Anfang. Ich sage das in der Rede noch mal.' },
      { name: 'Werkstatt-Crew', message: 'Wir bringen die Platten mit.' },
    ],
    music: [
      { title: 'Golden Brown', artist: 'The Stranglers', guest: 'Ousmane' },
      { title: 'Tanz mit mir', artist: 'Element of Crime', guest: 'Hanna' },
    ],
    abc: [
      { letter: 'F', term: 'Fahrräder', text: 'Zehn Leihräder stehen am Bahnhof bereit.' },
      { letter: 'K', term: 'Kuchen', text: 'Ab 15 Uhr auf dem Hof.' },
      { letter: 'P', term: 'Parken', text: 'Direkt auf dem Werksgelände.' },
    ],
    sections: [
      { key: 'hero', variant: 'b' },
      { key: 'countdown', variant: 'a' },
      { key: 'lovestory', variant: 'c' },
      { key: 'timeline', variant: 'a' },
      { key: 'gallery', variant: 'b' },
      { key: 'witnesses', variant: 'b' },
      { key: 'accommodations', variant: 'a' },
      { key: 'gifts', variant: 'a' },
      { key: 'weddingabc', variant: 'c' },
      { key: 'rsvp', variant: 'a' },
    ],
  },
];

export function demoByStyle(style: string): DemoPage | undefined {
  return DEMO_PAGES.find((d) => d.style === style);
}

/** Bereichsinhalte einer Demo — dieselbe Struktur wie im Dashboard gepflegt. */
export function buildDemoContent(d: DemoPage, key: BereichKey): Record<string, unknown> {
  const couple = `${d.name1} & ${d.name2}`;
  switch (key) {
    case 'hero':
      return { eyebrow: d.heroEyebrow, image_url: img(d.hero, 1800) };

    case 'countdown':
      return {
        eyebrow: 'Es sind noch',
        footer: `bis ${couple} Ja sagen`,
        past_text: 'Wir haben geheiratet!',
      };

    case 'lovestory':
      return {
        eyebrow: 'Unsere Geschichte',
        title: d.storyTitle,
        intro: d.storyIntro,
        description: d.storyIntro,
        when: d.story[0]?.when ?? '',
        moment_title: d.story[0]?.title ?? '',
        signature: `— ${couple}`,
        images: [img(d.hero + 1, 900), img(d.hero + 2, 900), img(d.hero + 3, 900)],
        entries: d.story.map((s, i) => ({
          id: `ls-${i}`,
          when: s.when,
          title: s.title,
          description: s.text,
          image_url: img(d.hero + i + 1, 900),
          image_alt: `${couple} — ${s.title}`,
        })),
      };

    case 'timeline':
      return {
        eyebrow: 'Ablauf',
        title: 'Der Tag',
        description: 'Von der Trauung bis zur letzten Runde.',
        events: d.timeline.map((e, i) => ({ id: `tl-${i}`, ...e })),
      };

    case 'directions':
      return {
        eyebrow: 'Anfahrt',
        title: 'So findet ihr uns',
        description: 'Adresse, Parken und der einfachste Weg.',
        items: [
          {
            id: 'loc-1',
            label: 'Trauung & Feier',
            name: d.venue.name,
            address: d.venue.address,
            description: d.venue.hint,
            maps_embed: `https://maps.google.com/maps?q=${encodeURIComponent(d.venue.address)}&output=embed&z=15`,
            maps_url: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(d.venue.address)}`,
          },
        ],
      };

    case 'accommodations':
      return {
        eyebrow: 'Übernachten',
        title: 'Wo ihr schlafen könnt',
        description: 'Eine kleine Auswahl in der Nähe.',
        items: d.hotels.map((h, i) => ({
          id: `acc-${i}`,
          name: h.name,
          distance: h.distance,
          price: h.price,
          description: `${h.distance} · ${h.price}`,
          image_url: img(d.hero + i + 2, 900),
        })),
      };

    case 'gallery':
      return {
        eyebrow: 'Momente',
        title: 'Bilder von uns',
        intro: 'Ein paar unserer liebsten Aufnahmen.',
        images: [0, 1, 2, 3, 4, 5].map((i) => ({
          id: `g-${i}`,
          src: img(d.hero + i, 1200),
          alt: `${couple} — Bild ${i + 1}`,
        })),
      };

    case 'witnesses':
      return {
        eyebrow: 'Trauzeugen',
        title: 'Unsere rechte und linke Hand',
        description: 'Fragt sie alles, was ihr uns nicht fragen wollt.',
        persons: d.witnesses.map((p, i) => ({
          id: `w-${i}`,
          name: p.name,
          role: p.role,
          intro: p.intro,
          description: p.intro,
          photo: img(d.hero + i + 4, 900),
          image_url: img(d.hero + i + 4, 900),
        })),
      };

    case 'gifts':
      return {
        eyebrow: 'Schenken',
        title: 'Falls ihr fragt',
        description: d.giftsIntro,
        iban_enabled: true,
        iban: 'DE00 0000 0000 0000 0000 00',
        iban_holder: couple,
        iban_note: 'Verwendungszweck: euer Name',
        reserve_success: 'Danke, ihr Lieben!',
        items: d.gifts.map((g, i) => ({
          id: `gi-${i}`,
          title: g.title,
          description: g.description,
          amount: g.amount,
          price: g.amount,
          image: i < 2 ? img(d.hero + i + 1, 900) : undefined,
        })),
      };

    case 'faq':
      return {
        eyebrow: 'Gut zu wissen',
        title: 'Häufige Fragen',
        description: '',
        items: d.faq.map((f, i) => ({ id: `faq-${i}`, ...f })),
      };

    case 'rsvp':
      return {
        kicker: 'Rückmeldung',
        title: 'Seid ihr dabei?',
        description: 'Sagt uns bitte bis zum genannten Datum Bescheid, ob ihr dabei seid.',
        deadline: d.date,
        ask_dietary: true,
        ask_allergies: true,
        yes_label: 'Ja, wir kommen',
        no_label: 'Leider nicht',
      };

    case 'guestbook':
      return {
        eyebrow: 'Gästebuch',
        title: 'Schreibt uns etwas',
        description: 'Ein paar Zeilen von euch — wir lesen jede einzelne.',
        entries: d.guestbook.map((g, i) => ({
          id: `gb-${i}`,
          name: g.name,
          message: g.message,
          created_at: `2026-0${(i % 6) + 1}-1${i % 9}T12:00:00Z`,
        })),
      };

    case 'musicwishes':
      return {
        eyebrow: 'Musik',
        title: 'Was läuft?',
        description: 'Euer Song darf nicht fehlen — schreibt ihn uns auf.',
        items: d.music.map((m, i) => ({
          id: `mw-${i}`,
          title: m.title,
          artist: m.artist,
          guest_name: m.guest,
          created_at: `2026-0${(i % 6) + 1}-1${i % 9}T12:00:00Z`,
        })),
      };

    case 'photoupload':
      return {
        eyebrow: 'Ein kleiner Wunsch',
        title: 'Teilt eure Erinnerungen',
        description:
          'Habt ihr ein schönes Foto mit uns? Wir sammeln eure Bilder für eine Überraschung am großen Tag.',
        privacy: 'Eure Fotos sind nur für das Brautpaar sichtbar.',
      };

    case 'weddingabc':
      return {
        eyebrow: 'Hochzeits-ABC',
        title: 'Von A bis Z',
        description: '',
        items: d.abc.map((a, i) => ({ id: `abc-${i}`, letter: a.letter, term: a.term, text: a.text })),
      };

    default:
      return {};
  }
}

/** Bereiche einer Demo in der kuratierten Reihenfolge. */
export function buildDemoBereiche(d: DemoPage) {
  return d.sections.map((s, i) => ({
    key: s.key,
    variant: s.variant,
    position: i,
    content: buildDemoContent(d, s.key),
  }));
}
