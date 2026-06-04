/**
 * Landing-Page Content — alle Texte zentral.
 * Iver kann hier Wording tweaken ohne TSX anfassen zu müssen.
 */

export const NAV = {
  links: [
    { label: 'Beispiele', href: '#examples' },
    { label: 'Bereiche', href: '#bereiche' },
    { label: 'Preise', href: '#pricing' },
    { label: 'Login', href: '/login' },
  ],
  cta: { label: 'Jetzt starten', href: '#config' },
};

export const HERO = {
  eyebrow: 'Studio Hamburg · Cohort 01 · 2026',
  h1_pre: 'Der',
  h1_line1: 'schönste Tag',
  h1_pre2: 'verdient ',
  h1_em: 'seine eigene',
  h1_line3: 'Seite.',
  lede: 'Wir bauen keine Templates. Wir bauen Hochzeitsseiten, die wie Designer-Stücke wirken — nur dass ihr sie selbst zusammenstellt.',
  bullets: ['8 Stile, keine Templates', '15 Bereiche, frei wählbar', 'Live in unter 30 Minuten'],
  ctaPrimary: '2 Monate gratis sichern',
  ctaPrimarySub: '87 / 100 Plätze frei →',
  ctaSecondary: 'Beispiele ansehen',
  trustCells: [
    { label: '9 €/Monat',     num: '01', desc: 'Standard mit 4 Bereichen. Monatlich kündbar.' },
    { label: 'DSGVO · DE',    num: '02', desc: 'Hosting + Daten in Deutschland. Eure Liste bleibt eure Liste.' },
    { label: '14 Tage gratis', num: '03', desc: 'Testet alle 8 Stile vor der ersten Abbuchung.' },
  ],
};

export const EXAMPLES = {
  eyebrow: 'Beispiel-Hochzeiten · komplett konfiguriert',
  h_pre: 'Acht Stile.',
  h_em: 'Eure',
  h_post: ' Wahl.',
  lede: 'Jede Hochzeit hat ihren Ton. Wählt euren Startpunkt — den Rest passt ihr in Echtzeit an.',
  scrollHint: 'Scrollt seitwärts durch alle acht →',
};

export const BEREICHE_SECTION = {
  eyebrow: 'Was eure Gäste sehen',
  h_pre: 'Bereiche —',
  h_em: 'nicht',
  h_post: ' Features.',
  lede: 'Wir nennen sie Bereiche, weil das ist, was eure Gäste sehen. Nicht Code. Nicht "Funktionalität". Vier sind immer dabei. Elf zusätzliche sind frei wählbar.',
};

export const CONFIG = {
  eyebrow: 'Euer Pricing — interaktiv',
  h_pre: 'Stellt euren Plan',
  h_em: 'live',
  h_post: ' zusammen.',
  lede: 'Wählt die Bereiche, die ihr braucht. Der Preis updatet automatisch. Keine Tarif-Falle, kein Lock-In.',
  cta: 'Diesen Plan starten — 14 Tage gratis',
  ctaSub: '→',
  legalLine: 'Mit Kreditkarte. Nach 14 Tagen Abbuchung. Erste 100 Kunden: 2 Monate gratis.',
};

export const PRICING_SECTION = {
  eyebrow: 'Pricing — transparent',
  h_pre: '9 €',
  h_em: 'für alle',
  h_post: ', mehr nur wenn ihr es braucht.',
  lede: 'Standard mit 4 Bereichen. Plus weitere, in 3er-Stufen dazubuchbar. Monatlich kündbar.',
  customDomainTitle: 'Eigene Domain',
  customDomainDesc: 'Statt julia-tom.sarahiver.de eure eigene Adresse. Einmalige Einrichtung, dann monatlich.',
  customDomainPrice: '39 € einmalig · 5 €/Monat',
};

export const HOWITWORKS = {
  eyebrow: 'Von 0 auf live',
  h_pre: 'Drei Schritte.',
  h_em: 'Fertig.',
  h_post: '',
  lede: 'Keine Anrufe. Keine Beratung. Keine Excel-Tabellen. Ihr klickt zusammen, was zu euch passt — und seid online.',
  steps: [
    {
      title: 'Stil wählen',
      desc: 'Acht Stile von Editorial bis Bauhaus. Jeder bringt Schriften, Farben und Akzente mit.',
      detail: 'Mit einem Klick wechselbar — auch nach Veröffentlichung.',
    },
    {
      title: 'Bereiche füllen',
      desc: 'RSVP, Ablauf, Foto-Upload, Gästebuch — was ihr braucht, in welcher Reihenfolge ihr wollt.',
      detail: 'Inhalte bleiben gespeichert, auch wenn ein Bereich deaktiviert wird.',
    },
    {
      title: 'Online stellen',
      desc: 'Eure eigene Subdomain auf sarahiver.de — oder eure eigene Domain als Add-On.',
      detail: 'SSL, DSGVO, Hosting in DE inklusive.',
    },
  ],
};

export const VOICES = {
  eyebrow: 'Warum wir das bauen',
  founder: {
    quote: 'Wir haben sarahiver gebaut, weil keine Plattform unsere eigene Hochzeit auch nur ansatzweise verdient hätte. Was wir uns gewünscht hätten — gibt es jetzt.',
    name: 'Sarah & Iver',
    role: 'Gründer · Hamburg · Heiraten 07/2026',
  },
  beta: [
    {
      quote: 'Endlich keine pinken Templates mehr. Die Site sieht aus, als hätten wir sie bei einem Studio in Auftrag gegeben — kostet aber 18 € im Monat.',
      sig: 'L. & J.',
      meta: 'Pfalz · 2027',
    },
    {
      quote: 'Der RSVP-Bereich hat uns zwei Wochen Excel-Arbeit gespart. Plus: Wir können den Stil nach jeder Vorbesprechung mit der Location neu wählen.',
      sig: 'A. & L.',
      meta: 'Schwarzwald · 2027',
    },
  ],
};

export const FAQ = {
  eyebrow: 'Vor dem Start',
  h_pre: 'Fragen,',
  h_em: 'vor',
  h_post: ' dem Checkout.',
  items: [
    {
      q: 'Was kostet sarahiver wirklich?',
      a: 'Standard 9 €/Monat mit 4 Bereichen. Jede 3er-Stufe weiterer Bereiche +5 / +9 / +12 / +14 €. Custom-Domain optional 39 € einmalig plus 5 €/Monat. Keine Setup-Gebühren, keine Lock-Ins, monatlich kündbar.',
    },
    {
      q: 'Bekommen die ersten 100 Kunden wirklich 2 Monate gratis?',
      a: 'Ja. Es gibt einen Live-Counter auf der Seite, keinen Promo-Code. Sobald 100 Kunden registriert sind, läuft die Aktion aus — Restliche zahlen ab dem 15. Tag.',
    },
    {
      q: 'Was passiert nach der Hochzeit?',
      a: 'Eure Seite bleibt online, so lange ihr das Abo behaltet. Ihr könnt jederzeit kündigen — die Seite geht dann offline, die Daten könnt ihr exportieren.',
    },
    {
      q: 'Kann ich den Stil später ändern?',
      a: 'Ja, jederzeit und beliebig oft. Inhalte werden nicht gelöscht, nur das Design wechselt.',
    },
    {
      q: 'Was passiert mit den Gäste-Daten?',
      a: 'Hosting in Deutschland, DSGVO-konform. RSVP-Antworten gehören euch — keine Auswertung, keine Weitergabe, keine Werbung an eure Gäste.',
    },
    {
      q: 'Bekomme ich die Daten meiner Gäste exportiert?',
      a: 'Ja. RSVP-Liste, Musikwünsche, Gästebuch-Einträge — alles als CSV oder PDF aus dem Dashboard.',
    },
    {
      q: 'Funktioniert die Seite auch auf Englisch?',
      a: 'Aktuell DE/EN switchbar pro Bereich. Italienisch, Französisch, Spanisch sind in der Roadmap für Saison 2027.',
    },
    {
      q: 'Warum sollte ich euch trauen — ihr seid neu?',
      a: 'Stimmt. Wir starten mit Cohort 01: Erste 100 Brautpaare bekommen 2 Monate gratis und direkten Kontakt zu uns. Wir bauen für unsere eigene Hochzeit mit — der Druck, dass es funktioniert, ist also persönlich.',
    },
  ],
};

export const FINAL_CTA = {
  eyebrow: 'Ihr habt nichts zu verlieren',
  h_pre: 'Beginnt',
  h_em: 'euer',
  h_post: ' Kapitel.',
  sub: 'Vierzehn Tage gratis testen. Erste 100 Kunden bekommen zusätzlich 2 Monate Bonus. Monatlich kündbar.',
  cta: 'Jetzt starten',
  ctaSub: '→',
  small: '87 / 100 Plätze frei',
  legal: 'Mit Kreditkarte — Abbuchung erst nach Trial. Kein Promo-Code nötig, der Bonus wird automatisch verrechnet.',
};

export const FOOTER = {
  links: [
    { label: 'Impressum', href: '/impressum' },
    { label: 'Datenschutz', href: '/datenschutz' },
    { label: 'AGB', href: '/agb' },
    { label: 'Kontakt', href: 'mailto:hallo@sarahiver.de' },
    { label: 'Status', href: '/status' },
  ],
  copyright: '© 2026 Sarah & Iver Gentz GbR · Hamburg, Deutschland · Made with love and ink',
};

/**
 * Site-Metadata für layout.tsx (next/metadata API).
 * Wird in layout.tsx genutzt für <title>, <meta description>, OG-Tags.
 */
export const SITE_CONFIG = {
  name: 'sarahiver.de',
  tagline: 'Hochzeitsseiten, die wie Designer-Stücke wirken',
  description:
    'Eure Hochzeitsseite — selbst zusammengestellt aus 8 Stilen und 15 Bereichen. 9 €/Monat, monatlich kündbar, DSGVO-konform. Erste 100 Kunden bekommen 2 Monate gratis.',
  domain: 'sarahiver.de',
};
