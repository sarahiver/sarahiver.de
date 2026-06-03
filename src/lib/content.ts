/**
 * Zentrale Content-Datei für sarahiver.de v4
 *
 * v4 Änderungen gegenüber v3:
 * - Pricing-Kommunikation: Mindestlaufzeit + Zugriffsdauer prominent
 * - Streichpreis-Logik in Pricing-Aside
 * - Redundanz "je mehr desto günstiger" nur einmal
 * - Customizer: Live-Preview entfernt → Coming-Soon-Placeholder
 * - Hero-Mockup: bleibt vorerst pur (Tool-Hints kommen später)
 */

import type { ReactNode } from 'react';

export const SITE_CONFIG = {
  name: 'sarahiver.de',
  domain: 'sarahiver.de',
  tagline: 'Eure Hochzeitsseite, in eurem Stil.',
  description:
    'Die warme Hochzeitsseiten-Plattform für Brautpaare im DACH-Raum. Wählt einen Stil, mischt Farben und Schriften, passt jeden Bereich einzeln an.',
  email: 'hallo@sarahiver.de',
};

export const NAV_SECTIONS = [
  { id: 'hero', label: 'Übersicht' },
  { id: 'features', label: 'Was ihr bekommt' },
  { id: 'examples', label: 'Beispielseiten' },
  { id: 'structure', label: 'Aufbau' },
  { id: 'customizer', label: 'Baukasten' },
  { id: 'how', label: "So geht's" },
  { id: 'pricing', label: 'Paket & Preis' },
  { id: 'voices', label: 'Stimmen' },
  { id: 'faq', label: 'Fragen' },
  { id: 'cta', label: 'Loslegen' },
] as const;

export const SIDEBAR = {
  quote:
    'Eine Plattform für eure Hochzeit — gemacht von Menschen, die selbst gerade geheiratet haben.',
  by: '— Sarah & Iver',
  tag: 'Pre-Launch',
};

export const HERO = {
  eyebrow: 'Pre-Launch · für die Saison 2027',
  headlinePart1: 'Eine Hochzeitsseite,',
  headlinePart2: 'die nach ',
  headlineEm: 'euch',
  headlinePart3: ' klingt.',
  lede:
    'Acht Stile. Fünfzehn Bereiche. Null Templates. Baut sie selbst zusammen — in einem Nachmittag fertig. 14 Tage gratis testen.',
  ctaPrimary: 'Jetzt 14 Tage starten',
  ctaSecondary: 'Acht Stile ansehen',
  trust: ['DSGVO-konform', 'Hosting in Deutschland', 'Monatlich kündbar'],
  counterPrefix: 'Frühvogel-Aktion · noch',
  counterRemaining: '87',
  counterSuffix: 'von 100 Plätzen — 2 Monate gratis',
};

export const FEATURES = {
  eyebrow: 'Was ihr bekommt',
  titlePart1: 'Alles für den Tag —',
  titlePart2: 'nichts darüber hinaus.',
  lede:
    'Sechs Werkzeuge, die euer Hochzeits-Organigramm ersetzen. Keine Plug-ins, keine Newsletter, keine Anmeldepflicht für Gäste.',
  items: [
    {
      tone: '',
      title: 'RSVP – auf einen Blick',
      body:
        'Zu- und Absagen, Menüwahl, Allergien, Übernachtungen. Alles auf einem Dashboard. Erinnerungen mit einem Klick.',
    },
    {
      tone: 'sage',
      title: 'Gästeliste, die mitdenkt',
      body:
        'Aus Excel importieren oder direkt pflegen — Sitzordnung, +1, Kinder, Tische. Exportierbar bis zur letzten Sekunde.',
    },
    {
      tone: 'honey',
      title: 'Wirklich anpassbar — wenn ihr wollt',
      body:
        'Start-Stil wählen, fertig. Oder vertiefen: Farben, Schriften und jeden Bereich einzeln. Wir geben gute Vorschläge, ihr habt das letzte Wort.',
    },
    {
      tone: '',
      title: 'Nur für eure Gäste',
      body:
        'Passwortschutz optional pro Bereich — Adresse erst nach RSVP, Galerie erst nach dem Fest. Kein Account nötig.',
    },
    {
      tone: 'sage',
      title: 'Zweisprachig, wenn ihr wollt',
      body:
        'Deutsch immer dabei. Englisch (oder eine andere Sprache) optional dazu — eure Gäste wechseln selbst.',
    },
    {
      tone: 'honey',
      title: 'Daten bleiben in Deutschland',
      body:
        'Hosting in Frankfurt, AV-Vertrag inklusive, kein Tracking. Wir sehen nicht, wer eure Seite besucht.',
    },
  ],
};

export const EXAMPLES = {
  eyebrow: 'Demo-Hochzeiten',
  titlePart1: 'So',
  titleEm: 'könnte',
  titlePart2: ' eure Seite aussehen.',
  lede:
    'Vier Beispielseiten, die wir mit Brautpaaren aus der Closed Beta gebaut haben. Klickt euch durch — jede ist mit dem Baukasten entstanden.',
  liveLabel: 'Live-Vorschau',
};

export const STRUCTURE = {
  eyebrow: 'So ist eure Seite aufgebaut',
  titlePart1: 'Bausteine —',
  titleEm: 'nicht starre Vorlagen.',
  lede:
    'Eure Hochzeitsseite besteht aus einzelnen Bereichen. Vier sind immer dabei, elf wählt ihr nach Bedarf. Je mehr Bereiche ihr kombiniert, desto günstiger wird jeder einzelne.',
  legend: {
    basis: 'IMMER DABEI',
    zusatz: '+4 € / Monat',
    featured: 'BESTSELLER',
  },
  // KEINE Wiederholung mehr am Footer — der Lede sagt es schon einmal
  foot: null,
};

export const CUSTOMIZER = {
  eyebrow: 'Baukasten',
  titlePart1: 'So wird das',
  titleEm: 'eure',
  titlePart2: ' Seite —',
  titleSage: 'nicht eine Vorlage.',
  lede:
    'Startet mit einem Stil, der zu euch passt. Wir empfehlen euch passende Bereiche — ihr nehmt sie, oder mischt selbst. Farben, Schriften und jeder Bereich später frei anpassbar.',
  previewComingSoon: 'Live-Vorschau kommt mit dem Launch',
  previewExplain:
    'Sobald die ersten Bereiche fertig sind, seht ihr hier eure Auswahl in Echtzeit zusammengebaut.',
  cheerPool: [
    'Schöne Wahl!',
    'Das passt!',
    'Sehr gut!',
    'Mhm, schön.',
    'Genau das.',
    'Hach.',
    'Liebe das.',
    'Stimmig.',
  ],
  steps: [
    { key: 'start', label: 'Start-Stil' },
    { key: 'palette', label: 'Farben' },
    { key: 'fonts', label: 'Schriften' },
    { key: 'blocks', label: 'Bereiche' },
  ],
  recommendedLabel: 'Für diesen Stil empfehlen wir',
};

export const PRINT = {
  eyebrow: 'Print-Service',
  titlePart1: 'Und gedruckt —',
  titleEm: 'passt alles zusammen.',
  lede:
    'Eure Farben und Schriften lassen sich für Einladungen, Save-the-Dates und Tischkarten exportieren. Selbst drucken oder von uns gestalten — ihr habt die Wahl.',
  free: {
    tag: 'Inklusive',
    titlePart: 'Druck-Vorlagen ',
    titleEm: 'kostenlos.',
    body:
      'Wir geben euch druckfertige PDF-Vorlagen — eure Farben, eure Schriften, euer Stil. Einfach selbst drucken lassen oder zum Online-Druck. Save-the-Date, Einladung, Tischkarten, Menükarte.',
    price: '0 €',
    alt: 'im Paket enthalten',
    cta: 'PDF-Vorlagen ansehen',
  },
  paid: {
    tag: 'Premium',
    titlePart: 'Wir gestalten ',
    titleEm: 'für euch.',
    body:
      'Lieber sicher gehen? Ein:e Designer:in von uns gestaltet Einladungen, Save-the-Dates und Tischkarten individuell — gemeinsam mit euch. Druckfertige PDFs in 5 Werktagen.',
    price: '300 €',
    alt: 'einmalig · alles dabei',
    cta: 'Designer:in anfragen',
  },
};

export const HOW = {
  eyebrow: "So funktioniert's",
  titlePart1: 'Drei Schritte — und ihr seid',
  titleEm: 'online.',
  lede: 'Die meisten Paare brauchen einen Abend. Manche eine Stunde. Niemand braucht Hilfe.',
  steps: [
    {
      n: '1.',
      h: 'Eure Seite starten',
      p:
        'Mit E-Mail oder Google. Keine Kreditkarte. Ihr bekommt sofort eine sarahiver.de-Subdomain — eigene Domain später, wann ihr wollt.',
      tip: 'Dauert keine zwei Minuten.',
    },
    {
      n: '2.',
      h: 'Stil & Inhalte',
      p:
        'Wählt einen Start-Stil. Tragt eure Geschichte, Location, Programm und FAQs ein — wir haben warme Vorlagen für jeden Bereich.',
      tip: 'Wir helfen euch beim Schreiben.',
    },
    {
      n: '3.',
      h: 'Gäste einladen',
      p:
        'Versendet einen Link oder einen QR-Code. Ihr seht Zu- und Absagen live; eure Gäste sehen nur, was sie sehen sollen.',
      tip: 'Auch Tante Heidi schafft das.',
    },
  ],
};

/**
 * PRICING v4 — der wichtigste Bereich nach Reviewer-Feedback.
 * Neu: Klare Laufzeit-Erklärung, Streichpreis-Logik.
 */
export const PRICING = {
  eyebrow: 'Paket & Preis',
  titlePart1: 'Faire Preise —',
  titleEm: 'so wie ihr es braucht.',
  lede:
    'Ein Basis-Preis für die vier wichtigsten Bereiche. Pro Zusatz-Bereich ein bisschen mehr — und ab 8 ist Schluss mit Aufpreis. 12 Monate Mindestlaufzeit, 18 Monate Zugriff insgesamt.',
  pill: 'Pre-Launch-Preis',

  // Klare Laufzeit-Kommunikation
  termsExplained: {
    title: 'Wie lange zahlt ihr?',
    items: [
      {
        label: 'Mindestlaufzeit',
        value: '12 Monate',
        desc: 'Üblicher Hochzeits-Planungs-Horizont',
      },
      {
        label: 'Seite bleibt online',
        value: '18 Monate',
        desc: '6 Monate Nachbereitung inklusive',
      },
      {
        label: 'Danach',
        value: 'Archiv',
        desc: 'CSV-Export aller Daten · Galerie als ZIP',
      },
    ],
  },

  asideTitle: 'Im Pre-Launch-Plan enthalten',
  asideList: [
    '4 Basis-Bereiche im Basis-Preis',
    'Voller Baukasten – alle Stile, Farben, Schriften',
    'Druckfertige PDF-Vorlagen kostenlos',
    'Unbegrenzte Gäste & RSVP-Antworten',
    'Hosting in Frankfurt, kein Tracking',
    'AV-Vertrag und Support inklusive',
  ],
  asideCta: 'Auf die Warteliste',
  asideNote: 'Ihr werdet als Erste informiert — und bekommt 30% Pre-Launch-Rabatt.',
};

export const VOICES = {
  eyebrow: 'Stimmen aus dem Closed Beta',
  titlePart1: 'Was Paare aus der',
  titleEm: 'Beta',
  titlePart2: ' sagen.',
  lede: 'Aktuell testen 38 Paare die Plattform. Hier zwei Stimmen aus der letzten Woche.',
  items: [
    {
      q:
        'Wir hatten an einem Sonntagabend keine Lust mehr auf Word-Vorlagen. Sechs Stunden später stand die Seite, RSVP lief, und Tante Heidi hat sich allein zurechtgefunden.',
      name: 'Anna & Lukas K.',
      meta: 'Beta · Sachsen · Heirat 09/26',
      ini: 'A',
    },
    {
      q:
        'Der Baukasten ist anders als alles, was wir vorher gesehen haben. Endlich keine fertige Vorlage, sondern wirklich unsere Farben, unsere Schriften, unser Tempo.',
      name: 'Mia & Noah B.',
      meta: 'Beta · Hamburg · Heirat 05/26',
      ini: 'M',
    },
  ],
  footStars: '★★★★★',
  footPart1: 'Beta-Paare',
  footScore: '9,4 / 10',
  footPart2: 'Empfehlungswahrscheinlichkeit',
};

/**
 * FAQ v4 — neue Frage zu Abo-Kommunikation
 */
export const FAQ = {
  eyebrow: 'Häufige Fragen',
  titlePart1: 'Vor dem Start —',
  titleEm: 'noch eine Sache?',
  items: [
    {
      q: 'Ist das ein Abo? Wie lange muss ich zahlen?',
      a:
        '12 Monate Mindestlaufzeit — das ist der typische Hochzeits-Planungs-Horizont. Eure Seite bleibt insgesamt 18 Monate online (6 Monate Nachbereitung für Galerie + Gästebuch). Danach bekommt ihr alle Daten als Export und die Seite geht ins Archiv. Keine versteckte Verlängerung, keine Abo-Falle — wir wissen, dass eine Hochzeit kein Streaming-Dienst ist.',
    },
    {
      q: 'Wann startet sarahiver.de denn nun?',
      a:
        'Wir öffnen in Kürze. Genaues Datum verraten wir aktuell nicht — wir wollen lieber gründlich als pünktlich starten. Tragt euch in die Warteliste ein, dann sagen wir euch als Erste Bescheid (mit einem hübschen Pre-Launch-Rabatt obendrauf).',
    },
    {
      q: 'Was passiert mit unseren Daten nach der Hochzeit?',
      a:
        'Ihr behaltet 18 Monate Zugriff — vom Save-the-Date bis zur Galerie nach dem Fest. Danach bekommt ihr einen CSV-Export eurer RSVP-Liste und ein ZIP eurer Galerie. Nichts wird ohne eure Zustimmung weiterverwendet — das steht so im AV-Vertrag.',
    },
    {
      q: 'Wie unterscheidet sich sarahiver.de von sarahiver.com?',
      a:
        'sarahiver.de ist die Self-Service-Plattform — ihr baut eure Seite selbst, in eurem Tempo, mit dem Baukasten. sarahiver.com ist der Done-for-you-Service mit einem Designer-Team an eurer Seite (ab 1.290 €). Gleiche Werte, andere Reisegeschwindigkeit.',
    },
    {
      q: 'Können wir wirklich ALLES anpassen?',
      a:
        'Farben, Schriften, Spacing und das Layout jedes einzelnen Bereichs — ja. Aber wir geben euch zu jedem Start-Stil eine kuratierte Empfehlung, damit ihr nicht bei null anfangt. So bleibt eure Seite stimmig, auch wenn ihr experimentiert. Was wir bewusst nicht erlauben: HTML-Eingabe oder Custom-CSS.',
    },
    {
      q: 'Funktioniert die Seite auch auf Englisch?',
      a:
        'Ja. Deutsch ist immer dabei, Englisch oder eine andere Sprache lässt sich parallel pflegen. Eure Gäste wechseln oben rechts; alle automatischen Texte (RSVP-Formular, Bestätigungs-Mails) sind übersetzt.',
    },
    {
      q: 'Wo werden die Daten gehostet?',
      a:
        'Bei Hetzner in Frankfurt am Main, ausschließlich in deutschen Rechenzentren. Keine US-Dienste, keine Tracking-Skripte. Wir wissen nicht, wer eure Seite besucht hat — und das soll auch so bleiben.',
    },
    {
      q: 'Brauchen unsere Gäste einen Account?',
      a:
        'Nein. Eure Gäste klicken auf den Einladungslink, geben optional ein Passwort ein und können direkt antworten. Wir speichern nur Name, Antwort und Allergien — kein Konto, kein Newsletter.',
    },
    {
      q: 'Was kostet der Print-Service eigentlich?',
      a:
        'Die PDF-Vorlagen (Save-the-Date, Einladung, Tischkarten, Menükarte) sind in jedem Paket kostenlos enthalten. Wenn ihr lieber von uns gestalten lasst, sind das 300 € einmalig — inklusive Designer-Gespräch, zwei Korrekturschleifen und druckfertige PDFs.',
    },
  ],
};

export const CTA = {
  eyebrow: 'Bereit für eure Seite?',
  titlePart1: 'Wir bauen gerade —',
  titleEm: 'seid ihr dabei?',
  lede:
    'Tragt euch ein, und ihr seid die Ersten, die loslegen können. Inklusive 30% Pre-Launch-Rabatt auf eure ersten 6 Monate.',
  waitlistPh: 'name@beispiel.de',
  waitlistCta: 'Auf die Liste',
  trust: [
    { lab: 'Datenschutz', val: 'DSGVO & AV-Vertrag' },
    { lab: 'Hosting', val: 'Frankfurt, Deutschland' },
    { lab: 'Pre-Launch', val: '30 % Rabatt für euch' },
  ],
  success: 'Danke! Wir melden uns als Erste.',
  privacy:
    'Mit dem Eintrag bestätige ich, dass ihr mich kontaktieren dürft. Ich kann mich jederzeit wieder austragen.',
};

export const FOOTER = {
  desc:
    'sarahiver.de ist die Self-Service-Hochzeitsseiten-Plattform für den DACH-Raum. Wir bauen gerade mit Brautpaaren aus der Closed Beta die Werkzeuge, die wir uns selbst gewünscht hätten.',
  cols: [
    {
      h: 'Produkt',
      links: ['Was ihr bekommt', 'Baukasten', 'Print-Service', 'Roadmap'],
    },
    {
      h: 'Schwester',
      links: ['sarahiver.com', 'Done-for-you', 'Designer-Team', 'Unterschied'],
    },
    {
      h: 'Rechtlich',
      links: ['Impressum', 'Datenschutz', 'AGB', 'AV-Vertrag'],
    },
  ],
  meta: ['© 2026 sarahiver UG (i. Gr.)', 'Hamburg', 'Pre-Launch · 2026'],
};
