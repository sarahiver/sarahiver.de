/**
 * Zentrale Content-Datei.
 * Texte können hier einfach geändert werden, ohne dass die Komponenten angefasst werden müssen.
 *
 * Pre-Launch-Status: Q4 2026 (kommuniziert als "in Kürze")
 */

export const SITE_CONFIG = {
  name: 'sarahiver.de',
  domain: 'sarahiver.de',
  tagline: 'Eure Hochzeitswebsite. In wenigen Minuten.',
  description:
    'Die elegante, deutschsprachige Plattform für eure Save-the-Date, RSVP und Gästekommunikation — DSGVO-konform und ohne Bastelei.',
  email: 'hallo@sarahiver.de',
  launchStatus: 'In Kürze',
};

export const NAV_SECTIONS = [
  { id: 'hero', label: 'Übersicht' },
  { id: 'features', label: 'Funktionen' },
  { id: 'themes', label: 'Themes' },
  { id: 'how', label: "So geht's" },
  { id: 'pricing', label: 'Preis' },
  { id: 'social', label: 'Stimmen' },
  { id: 'faq', label: 'Fragen' },
  { id: 'cta', label: 'Vormerken' },
] as const;

export const HERO = {
  eyebrow: 'sarahiver.de — wedding websites',
  title: 'Eure Hochzeitswebsite. In wenigen Minuten.',
  titleEmphasis: 'Made in Germany.',
  sub: 'Bald könnt ihr eure Save-the-Date, RSVP und Gästekommunikation selbst gestalten — datenschutzkonform, elegant und ohne Bastelei.',
  ctaPrimary: 'Auf die Warteliste',
  ctaSecondary: 'Mehr erfahren',
  trust: ['DSGVO-konform', 'Hosting in Deutschland', 'Made in Hamburg'],
};

export const FEATURES = {
  eyebrow: 'Was ihr bekommt',
  title: 'Alles für den Tag —',
  titleEmphasis: 'nichts darüber hinaus.',
  lede:
    'Sechs Werkzeuge, die euer Hochzeitsorganigramm ersetzen. Keine Plug-ins, keine Newsletter, keine Anmeldepflicht für Gäste.',
  items: [
    {
      tag: '01',
      title: 'RSVP-Management',
      body: 'Zu- und Absagen, Menüwahl, Allergien, Übernachtungsbedarf — alles auf einem Dashboard. Erinnerungen verschickt ihr mit einem Klick.',
    },
    {
      tag: '02',
      title: 'Gästeliste',
      body: 'Importiert eure Liste aus Excel oder pflegt sie direkt — Sitzordnung, +1, Kinder, Tische. Exportierbar bis zur letzten Sekunde.',
    },
    {
      tag: '03',
      title: '7 Themes',
      body: 'Editorial, Botanical, Contemporary, Luxe, Neon, Video, Parallax. Ein Klick zum Wechseln. Eure Texte bleiben.',
    },
    {
      tag: '04',
      title: 'Passwortschutz',
      body: 'Nur eingeladene Gäste sehen eure Seite. Optional pro Bereich — Adresse erst nach RSVP, Galerie erst nach dem Fest.',
    },
    {
      tag: '05',
      title: 'Eigene Domain',
      body: 'Nutzt eine eigene Domain wie julia-tom.de oder unsere kostenlose Subdomain. Wir helfen beim Einrichten.',
    },
    {
      tag: '06',
      title: 'DSGVO',
      body: 'Hosting in Frankfurt, deutscher Datenschutz, AV-Vertrag inklusive. Kein Tracking, kein Drittland.',
    },
  ],
};

export const THEMES = {
  eyebrow: 'Sieben Themes',
  title: 'Ein Stil —',
  titleEmphasis: 'für jede Hochzeit.',
  lede:
    'Jedes Theme wurde mit einem echten Brautpaar getestet. Schriften, Spacing und Bildverhältnisse sind aufeinander abgestimmt — ihr braucht nichts zu konfigurieren.',
  list: [
    { name: 'Editorial', tone: 'Magazin & Serifen', className: 'theme-editorial' },
    { name: 'Botanical', tone: 'Eukalyptus, ruhig', className: 'theme-botanical' },
    { name: 'Contemporary', tone: 'Klar, weiß, modern', className: 'theme-contemporary' },
    { name: 'Luxe', tone: 'Schwarz & Champagner', className: 'theme-luxe' },
    { name: 'Neon', tone: 'Bold, electric', className: 'theme-neon' },
    { name: 'Video', tone: 'Vollbild-Loop', className: 'theme-video' },
    { name: 'Parallax', tone: 'Layered, scrollend', className: 'theme-parallax' },
  ],
};

export const HOW = {
  eyebrow: "So funktioniert's",
  title: 'Drei Schritte —',
  titleEmphasis: 'und ihr seid online.',
  lede: 'Die meisten Paare brauchen einen Abend. Manche eine Stunde. Niemand braucht Hilfe.',
  steps: [
    {
      n: '01',
      h: 'Anmelden',
      p: 'Mit E-Mail. Keine Kreditkarte für den Test. Ihr bekommt sofort eine sarahiver.de-Subdomain — eigene Domain optional.',
    },
    {
      n: '02',
      h: 'Theme & Inhalte',
      p: 'Wählt eines von sieben Themes. Tragt eure Story, Location, Programm und FAQs ein — wir haben Vorlagen für jeden Block.',
    },
    {
      n: '03',
      h: 'Gäste einladen',
      p: 'Versendet einen Link oder einen QR-Code. Ihr seht Zu- und Absagen live; eure Gäste sehen nur, was sie sollen.',
    },
  ],
};

export const PRICING = {
  eyebrow: 'Launch-Preise',
  title: 'Ein Preis. Keine Tricks.',
  titleEmphasis: 'Volle Kontrolle.',
  lede:
    'Startet mit dem Basis-Paket und wählt nur die Zusatz-Komponenten, die ihr wirklich braucht. Je mehr ihr kombiniert, desto günstiger wird jede einzelne.',
};

export const SOCIAL = {
  eyebrow: 'Stimmen',
  title: 'Was Brautpaare',
  titleEmphasis: 'über uns sagen.',
  lede: 'Wir sind in der Beta-Phase — diese Stimmen kommen aus unserer Test-Gruppe.',
  testimonials: [
    {
      quote:
        'Endlich ein Tool, das auf Deutsch funktioniert und nicht nach billigem Baukasten aussieht. Wir waren in einem Abend fertig.',
      author: 'Julia & Tom',
      meta: 'Hochzeit Juni 2026',
    },
    {
      quote:
        'Der RSVP-Prozess hat uns Stunden gespart. Statt Excel-Listen einfach ein Link an die Gäste — fertig.',
      author: 'Anna & Lukas',
      meta: 'Hochzeit August 2026',
    },
    {
      quote:
        'Wir wollten kein generisches Squarespace, sondern etwas, das zu unserer Hochzeit passt. Editorial-Theme war perfekt.',
      author: 'Mia & Noah',
      meta: 'Hochzeit Mai 2026',
    },
  ],
};

export const FAQ = {
  eyebrow: 'Häufige Fragen',
  title: 'Alles, was ihr',
  titleEmphasis: 'wissen müsst.',
  items: [
    {
      q: 'Wann startet sarahiver.de?',
      a: 'Wir starten in Kürze. Trage dich auf die Warteliste ein, dann erfährst du es als Erste:r — und sicherst dir die Launch-Preise.',
    },
    {
      q: 'Was kostet sarahiver.de?',
      a: 'Das Basis-Paket startet bei 19€/Monat. Zusatz-Komponenten könnt ihr frei dazu wählen — je mehr, desto günstiger wird jede einzelne. Volle Übersicht im Pricing-Bereich.',
    },
    {
      q: 'Wie lange muss ich mich binden?',
      a: 'Mindestlaufzeit sind 3 Monate. Nach der Hochzeit könnt ihr in den Archive-Modus für 5€/Monat wechseln — eure Seite bleibt online, ihr könnt aber nicht mehr bearbeiten.',
    },
    {
      q: 'Kann ich eine eigene Domain nutzen?',
      a: 'Ja. Für 4€/Monat extra. Wir haben eine ausführliche Anleitung — oder du buchst unseren Concierge-Service (49€ einmalig), dann richten wir das für dich ein.',
    },
    {
      q: 'Ist das DSGVO-konform?',
      a: 'Ja. Hosting in Deutschland, kein Tracking ohne Einwilligung, AV-Vertrag verfügbar. Wir haben sarahiver.com seit 2024 betrieben und kennen die Anforderungen.',
    },
    {
      q: 'Was ist mit englischen Gästen?',
      a: 'Aktuell ist sarahiver.de auf Deutsch ausgerichtet. Eine englische Variante kommt voraussichtlich 2027 — unter einer eigenen Domain. Trage dich gerne ein, wir informieren dich.',
    },
    {
      q: 'Wer steckt hinter sarahiver.de?',
      a: 'Sarah und Iver — wir haben 2024 unsere eigene Hochzeitswebsite gebaut und das Konzept anderen Brautpaaren als Premium-Service angeboten (sarahiver.com). sarahiver.de ist die Self-Service-Version für alle, die selbst gestalten möchten.',
    },
  ],
};

export const CTA = {
  eyebrow: 'Jetzt vormerken',
  title: 'Bald geht es los —',
  titleEmphasis: 'seid dabei.',
  lede:
    'Trage dich auf die Warteliste ein und erfahre als Erste:r, wenn sarahiver.de live geht. Plus: 20% Rabatt auf die ersten 3 Monate für alle Warteliste-Mitglieder.',
  placeholder: 'eure@email.de',
  cta: 'Auf die Warteliste',
  privacy:
    'Mit dem Eintrag bestätige ich, dass ihr mich kontaktieren dürft. Ich kann mich jederzeit wieder austragen.',
  success: 'Danke! Wir melden uns, sobald es losgeht.',
};
