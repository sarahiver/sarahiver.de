/**
 * sarahiver.de — Landing v4.1
 *
 * Alle Texte, Links und Bilder der Landing an EINER Stelle.
 * Wording oder Bilder ändern = hier ändern, nie im TSX.
 */

/* -------------------------------------------------------------------------
   Bilder
   ---------------------------------------------------------------------------
   Hero und Domain-Band sind noch PLATZHALTER (picsum). Durch Cloudinary-URLs
   ersetzen — die Domain steht bereits in next.config.ts.
   Die Demo-Karten holen ihre Bilder aus lib/seed-demos.ts (DEMO_TEMPLATES),
   damit Karte und verlinkte Demo dasselbe Motiv zeigen.
   ------------------------------------------------------------------------- */
export const LANDING_IMAGES = {
  /** Hero-Hintergrund, quer, dunkel/warm — Paar nah, Gegenlicht. */
  hero: 'https://picsum.photos/seed/sdv4-hero/1800/1200',
  /** Hintergrund Domain-Check — dunkles Grün/Blattwerk. */
  domain: 'https://picsum.photos/seed/sdv4-green/1800/900',
  /** Geräte-Rahmen (freigestellt, beide Bildschirme sind transparent). */
  deviceFrame:
    'https://res.cloudinary.com/si-weddings/image/upload/v1789465404/device-frame_nxaalw.png',
};

/**
 * Bildschirm-Ausschnitte im Geräte-Rahmen, gemessen am PNG (1536 × 1024 px).
 * Die Bildschirme sind im Bild transparent — der Inhalt liegt darunter und
 * scheint durch. Werte in Prozent, damit alles mitskaliert.
 *
 *   Laptop: x 197–1242, y 135–769   → 1046 × 635 px
 *   Handy:  x 1171–1452, y 319–933  →  282 × 615 px
 *
 * Wird der Rahmen ausgetauscht, müssen diese Werte je Gerät neu gemessen
 * werden — sonst sitzt der Inhalt daneben.
 */
export const DEVICE_FRAME = {
  aspectRatio: '1536 / 1024',
  laptop: { left: 12.826, top: 13.184, width: 68.099, height: 62.012 },
  phone: { left: 76.237, top: 31.152, width: 18.359, height: 60.059 },
};

/* ------------------------------------------------------------------------- */

export const SEO = {
  title: 'sarahiver.de — Eure Hochzeitswebsite, einfach selbst erstellt',
  description:
    'Erstellt in wenigen Minuten eure persönliche Hochzeitswebsite: stilvolle Designs, RSVP, Countdown, Galerie und mehr. 69 € einmalig, keine Abo-Kosten.',
};

export const NAV = {
  logo: { pre: 'sarah', bold: 'iver', post: '.de' },
  links: [
    { label: 'Designs', href: '#stile' },
    { label: 'Beispiele', href: '#beispiele' },
    { label: 'So funktioniert’s', href: '#ablauf' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: { label: 'Jetzt starten', href: '/signup' },
};

export const HERO = {
  eyebrow: 'Deine Hochzeitswebsite – einfach selbst erstellen',
  h1: ['Eure Geschichte.', 'Online, so schön', 'wie der Tag selbst.'],
  lede:
    'Mit sarahiver.de erstellt ihr in wenigen Minuten eure persönliche Hochzeitswebsite – stilvoll, individuell und ohne technische Vorkenntnisse.',
  cta: { label: 'Jetzt loslegen – 69 € einmalig', href: '/signup' },
  ctaSecondary: { label: 'Erst ausprobieren', href: '/testen' },
  ticks: ['Sofort starten', 'Keine Abo-Kosten', 'Mit Liebe gemacht'],
  note: 'So könnte eure Seite aussehen.',
  /** Inhalt in den beiden Bildschirmen des Geräte-Mockups. */
  mockup: {
    eyebrow: 'Deine Hochzeitsseite',
    couple: 'Sarah & Iver',
    line: 'Wir heiraten',
    date: '22. August 2026',
    button: 'Mehr erfahren',
    phoneTitle: 'Unsere Hochzeit',
    phoneRows: ['Countdown', 'Ablauf', 'Location', 'RSVP'],
  },
};

export const FEATURES = {
  eyebrow: 'Alles, was ihr braucht',
  h2: 'Eine Hochzeitswebsite. Viele Möglichkeiten.',
  items: [
    { icon: 'sparkle', title: 'Stilvolle Designs', text: 'Acht Stile, jeder mit eigenen Schriften und Farben.' },
    { icon: 'heart', title: 'Alle wichtigen Inhalte', text: 'Countdown, Ablauf, Location, RSVP, Galerie und mehr.' },
    { icon: 'devices', title: 'Auf allen Geräten', text: 'Sieht auf Smartphone, Tablet und Desktop großartig aus.' },
    { icon: 'pen', title: 'Einfach selbst erstellen', text: 'Ohne Vorkenntnisse. In wenigen Minuten.' },
    { icon: 'infinity', title: 'Einmal zahlen.', text: '69 € einmalig. 12 Monate online, keine laufenden Kosten.' },
  ],
};

export const STYLES_SECTION = {
  eyebrow: 'Acht Designs',
  h2: 'Wählt den Stil, der zu euch passt.',
  lede:
    'Jeder Stil bringt eigene Schriften, Farben und Abstände mit. Ihr wählt einen als Ausgangspunkt — und könnt jederzeit wechseln, eure Inhalte bleiben erhalten.',
  fontLabel: 'Schriften',
  sampleCouple: 'Anna & Tom',
  cta: { label: 'Alle Stile im Test-Dashboard ausprobieren', href: '/testen' },
};

export const DEMOS = {
  eyebrow: 'Live Demos',
  h2: ['Entdeckt', 'die Designs.'],
  lede:
    'Schaut euch unsere Beispielseiten an und erlebt, wie eure Hochzeitswebsite aussehen könnte.',
  cta: { label: 'Alle Designs ansehen', href: '#stile' },
  /**
   * Die Karten kommen aus DEMO_TEMPLATES (lib/seed-demos.ts) — Slug, Paar,
   * Datum und Bild stammen damit aus den Seiten, die auch wirklich existieren.
   * Hier steht nur noch der Untertitel je Stil.
   */
  taglines: {
    editorial: 'Reduziert. Elegant. Besonders.',
    organic: 'Natürlich. Romantisch. Zeitlos.',
    opulent: 'Festlich. Warm. Glanzvoll.',
    brutalist: 'Klar. Mutig. Kompromisslos.',
    mono: 'Modern. Schlicht. Präzise.',
    liquefy: 'Weich. Fließend. Verspielt.',
    kinetic: 'Lebendig. Dynamisch. Frisch.',
    bauhaus: 'Grafisch. Geordnet. Ikonisch.',
  } as Record<string, string>,
};

export const DEMO_ENTRY = {
  eyebrow: 'Ohne Anmeldung',
  h2: 'Probiert das Dashboard aus, bevor ihr kauft.',
  lede:
    'Ihr bekommt ein fertig gefülltes Beispielprojekt, das nur euch gehört: Stile wechseln, Texte ändern, Bereiche umsortieren — alles wie im echten Dashboard.',
  points: [
    'Keine Anmeldung, keine Zahlungsdaten',
    'Eigene Testseite, die niemand sonst sieht',
    'Wird nach 24 Stunden automatisch gelöscht',
  ],
  cta: { label: 'Test-Dashboard öffnen', href: '/testen' },
};

export const DOMAIN = {
  eyebrow: 'Eure Wunschdomain',
  h2: 'Ist eure Wunsch-URL noch frei?',
  lede: 'Findet in Sekunden heraus, ob eure Wunschadresse verfügbar ist.',
  prefix: 'www.',
  placeholder: 'z. B. unserhochzeitstag',
  tlds: ['.de', '.com', '.hochzeit'],
  cta: 'Jetzt prüfen',
  checking: 'Wir schauen nach …',
  note: 'z. B. wirheiraten.de\nleaundben.de\noder euer name',
  /** Ziel, wenn das Paar mit der geprüften Domain weitermacht. */
  target: '/signup',
  results: {
    free: 'ist noch frei.',
    taken: 'ist leider schon vergeben.',
    unknown: 'konnten wir gerade nicht prüfen — wir schauen bei der Einrichtung für euch nach.',
    freeCta: 'Mit dieser Domain starten',
    takenHint: 'Probiert eine andere Schreibweise oder eine andere Endung.',
    priceHint: 'Einrichtung 39 € einmalig, zusätzlich zur Website.',
  },
};

export const PRICING = {
  eyebrow: 'Transparent & fair',
  h2: 'Ein Preis. Alles drin.',
  includes: [
    'Alle acht Designs, alle 15 Bereiche',
    'Dashboard, Hosting und SSL inklusive',
    'Eigene Inhalte, Texte und Bilder',
    'Mobil optimiert, unbegrenzt bearbeitbar',
    '12 Monate online — mindestens bis 3 Monate nach der Hochzeit',
    'Kein Abo, keine automatische Verlängerung',
  ],
  card: {
    eyebrow: 'Unser Preis',
    price: '69',
    currency: '€',
    sub: 'einmalig',
    vatNote: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.',
    cta: { label: 'Jetzt starten', href: '/signup' },
  },
  addon: {
    eyebrow: 'Optional',
    title: 'Eigene Domain verbinden',
    price: '39 €',
    text:
      'Ihr möchtet eine eigene Domain (z. B. eure-namen.de) verwenden? Wir richten das für euch ein.',
    cta: { label: 'Domain verbinden', href: '#domain' },
  },
};

export const STEPS = {
  eyebrow: 'So einfach geht’s',
  h2: 'In 4 Schritten zu eurer Website.',
  items: [
    { icon: 'user', num: '01', title: 'Account erstellen', text: 'In wenigen Sekunden registrieren.' },
    { icon: 'palette', num: '02', title: 'Design wählen', text: 'Eine Vorlage aussuchen und anpassen.' },
    { icon: 'upload', num: '03', title: 'Inhalte einfügen', text: 'Texte, Bilder und Details ergänzen.' },
    { icon: 'rocket', num: '04', title: 'Veröffentlichen', text: 'Fertig! Eure Website ist online.' },
  ],
};

export const FAQ = {
  eyebrow: 'Häufige Fragen',
  h2: 'Noch Fragen?',
  lede: 'Hier findet ihr die wichtigsten Antworten. Weitere Fragen? Meldet euch gern bei uns.',
  cta: { label: 'Schreibt uns', href: '/kontakt' },
  items: [
    {
      q: 'Kann ich das Design später ändern?',
      a: 'Ja. Ihr könnt jederzeit einen anderen Stil wählen – eure Inhalte bleiben dabei erhalten.',
    },
    {
      q: 'Sind meine Daten geschützt?',
      a: 'Ja. Hosting und Daten liegen in Deutschland, die Seite läuft DSGVO-konform über HTTPS. Eure Gästeliste sieht niemand außer euch.',
    },
    {
      q: 'Was passiert nach der Hochzeit?',
      a: 'Ihr könnt eure Seite in eine Danke-Seite umwandeln: Fotos hochladen, Gäste erinnern, Erinnerungen sammeln.',
    },
    {
      q: 'Wie lange kann die Seite online bleiben?',
      a: 'Eure Website bleibt ein Jahr lang online, mindestens aber bis drei Monate nach eurer Hochzeit. Save-the-Date- und Archiv-Modus stellt ihr selbst im Dashboard um.',
    },
    {
      q: 'Kann ich eine eigene Domain verwenden?',
      a: 'Ja. Für einmalig 39 € verbinden wir eure Wunschdomain mit eurer Hochzeitswebsite.',
    },
    {
      q: 'Gibt es laufende Kosten?',
      a: 'Nein. Ihr zahlt einmalig 69 € – kein Abo, keine automatische Verlängerung. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.',
    },
  ],
};

export const FINAL = {
  eyebrow: 'Los geht’s',
  h2: ['Baut die Seite, die ', 'zu euch passt', '.'],
  lede: 'In wenigen Minuten. Für einen unvergesslichen Tag.',
  cta: { label: 'Jetzt starten – 69 € einmalig', href: '/signup' },
};

export const FOOTER = {
  links: [
    { label: 'Impressum', href: '/impressum' },
    { label: 'Datenschutz', href: '/datenschutz' },
    { label: 'AGB', href: '/agb' },
    { label: 'Widerruf', href: '/widerruf' },
    { label: 'Kontakt', href: '/kontakt' },
  ],
  social: [
    { name: 'Instagram', href: 'https://www.instagram.com/sarah.iver.wedding/' },
    { name: 'Pinterest', href: 'https://www.pinterest.de/sarahiverwedding/' },
  ],
};
