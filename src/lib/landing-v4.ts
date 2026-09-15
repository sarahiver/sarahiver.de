/**
 * sarahiver.de — Landing v4
 *
 * Alle Texte, Links und Bilder der Landing an EINER Stelle.
 * Wording oder Bilder ändern = hier ändern, nie im TSX.
 */

/* -------------------------------------------------------------------------
   Bilder
   ---------------------------------------------------------------------------
   PLATZHALTER: aktuell picsum.photos, damit die Seite sofort rendert.
   Durch echte Cloudinary-URLs ersetzen — Domains stehen bereits in
   next.config.ts (res.cloudinary.com, *.supabase.co, picsum.photos).
   ------------------------------------------------------------------------- */
export const LANDING_IMAGES = {
  /** Hero-Hintergrund, quer, dunkel/warm — Paar nah, Gegenlicht. */
  hero: 'https://picsum.photos/seed/sdv4-hero/1800/1200',
  /** Bild im Laptop-Mockup (Hero-Bild einer Beispielseite). */
  heroLaptop: 'https://picsum.photos/seed/sdv4-laptop/1200/750',
  /** Vier kleine Thumbnails im Telefon-Mockup. */
  heroPhoneRows: [
    'https://picsum.photos/seed/sdv4-p1/80/80',
    'https://picsum.photos/seed/sdv4-p2/80/80',
    'https://picsum.photos/seed/sdv4-p3/80/80',
    'https://picsum.photos/seed/sdv4-p4/80/80',
  ],
  /** Hintergrund Domain-Check — dunkles Grün/Blattwerk. */
  domain: 'https://picsum.photos/seed/sdv4-green/1800/900',
  /** Hintergrund Schluss-CTA — Händehalten, warm. */
  final: 'https://picsum.photos/seed/sdv4-final/1800/900',
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
  ticks: ['Sofort starten', 'Keine Abo-Kosten', 'Mit Liebe gemacht'],
  note: 'So könnte eure Seite aussehen.',
  /** Inhalt im Laptop-/Telefon-Mockup. */
  mockup: {
    eyebrow: 'Deine Hochzeitsseite',
    couple: 'Sarah & Iver',
    line: 'Wir heiraten',
    date: '14. Juli 2025',
    button: 'Mehr erfahren',
    phoneTitle: 'Unsere Hochzeit',
    phoneRows: ['Countdown', 'Ablauf', 'Location', 'Hotel'],
  },
};

export const FEATURES = {
  eyebrow: 'Alles, was ihr braucht',
  h2: 'Eine Hochzeitswebsite. Viele Möglichkeiten.',
  items: [
    { icon: 'sparkle', title: 'Stilvolle Designs', text: 'Modern, zeitlos und mit Liebe zum Detail.' },
    { icon: 'heart', title: 'Alle wichtigen Inhalte', text: 'Countdown, Ablauf, Location, RSVP, Galerie und mehr.' },
    { icon: 'devices', title: 'Auf allen Geräten', text: 'Sieht auf Smartphone, Tablet und Desktop großartig aus.' },
    { icon: 'pen', title: 'Einfach selbst erstellen', text: 'Ohne Vorkenntnisse. In wenigen Minuten.' },
    { icon: 'infinity', title: 'Einmal zahlen. Für immer.', text: '69 € einmalig. Keine laufenden Kosten.' },
  ],
};

export const DEMOS = {
  eyebrow: 'Live Demos',
  h2: ['Entdeckt', 'die Designs.'],
  lede: 'Schaut euch unsere Vorlagen an und erlebt, wie eure Hochzeitswebsite aussehen könnte.',
  cta: { label: 'Zu den Beispielen', href: '/testen' },
  /**
   * href = Slug einer echten Demo-Site (/[slug]).
   * Aktuell geseedet: sarah-und-iver, mila-und-theo, johanna-und-felix.
   */
  items: [
    {
      couple: 'Julia & Marc',
      date: '12. September 2026',
      style: 'Botanical',
      text: 'Natürlich. Romantisch. Zeitlos.',
      href: '/mila-und-theo',
      image: 'https://picsum.photos/seed/sdv4-demo1/900/680',
    },
    {
      couple: 'Lea & Ben',
      note: 'Wir heiraten',
      date: '20. Juni 2026',
      style: 'Contemporary',
      text: 'Modern. Klar. Stilvoll.',
      href: '/johanna-und-felix',
      image: 'https://picsum.photos/seed/sdv4-demo2/900/680',
    },
    {
      couple: 'Anna & Tom',
      date: '14. Juli 2026',
      style: 'Editorial',
      text: 'Reduziert. Elegant. Besonders.',
      href: '/sarah-und-iver',
      image: 'https://picsum.photos/seed/sdv4-demo3/900/680',
    },
  ],
};

export const DOMAIN = {
  eyebrow: 'Eure Wunschdomain',
  h2: 'Ist eure Wunsch-URL noch frei?',
  lede: 'Findet in Sekunden heraus, ob eure Wunschadresse verfügbar ist.',
  prefix: 'www.',
  placeholder: 'z. B. unserhochzeitstag',
  tlds: ['.de', '.com', '.hochzeit'],
  cta: 'Jetzt prüfen',
  note: 'z. B. wirheiraten.de\nleaundben.de\noder euer name',
  /** Ziel nach dem Absenden — Wunschdomain wird als ?domain= mitgegeben. */
  target: '/signup',
};

export const PRICING = {
  eyebrow: 'Transparent & fair',
  h2: 'Ein Preis. Alles drin.',
  includes: [
    'Alle Design-Vorlagen',
    'Alle Funktionen (RSVP, Galerie, Countdown …)',
    'Eigene Inhalte, Texte und Bilder',
    'Mobil optimiert',
    'Unbegrenzt bearbeitbar',
    'Keine Abo-Kosten',
  ],
  card: {
    eyebrow: 'Unser Preis',
    price: '69',
    currency: '€',
    sub: 'einmalig',
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
  cta: { label: 'Alle FAQ ansehen', href: '/faq' },
  items: [
    {
      q: 'Kann ich das Design später ändern?',
      a: 'Ja. Ihr könnt jederzeit eine andere Vorlage wählen – eure Inhalte bleiben dabei erhalten.',
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
      a: 'Eure Website bleibt ein Jahr lang online. Save-the-Date- und Archiv-Modus stellt ihr selbst im Dashboard um.',
    },
    {
      q: 'Kann ich eine eigene Domain verwenden?',
      a: 'Ja. Für einmalig 39 € verbinden wir eure Wunschdomain mit eurer Hochzeitswebsite.',
    },
    {
      q: 'Gibt es laufende Kosten?',
      a: 'Nein. Ihr zahlt einmalig 69 € – kein Abo, keine automatische Verlängerung.',
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
    { label: 'Kontakt', href: '/kontakt' },
  ],
  social: [
    { name: 'Instagram', href: 'https://www.instagram.com/sarah.iver.wedding/' },
    { name: 'Pinterest', href: 'https://www.pinterest.de/sarahiverwedding/' },
  ],
};
