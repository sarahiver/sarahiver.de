import type { EffectiveTokens, WeddingBereich } from '@/types/supabase';
import type { StyleId } from '@/lib/style-migration';
import type { BereichKey, ComponentVariant } from '@/lib/wedding-config';

/**
 * Testdaten für /allelements.
 *
 * Nur Daten — keine Darstellung. Die Bereiche bekommen exakt die
 * content-Strukturen, die auch aus der Datenbank kämen, damit die Review die
 * echten Produktionskomponenten mit echten Datenformen zeigt.
 *
 * -------------------------------------------------------------------------
 * BILDER
 * Quelle: Pexels (https://www.pexels.com). Pexels-Lizenz: kostenlose
 * kommerzielle Nutzung, keine Namensnennung nötig, kein Weiterverkauf des
 * unveränderten Bildes.
 *
 * Verwendet werden ausschließlich die drei Foto-IDs, die bereits in
 * lib/seed-demos.ts für die öffentlichen Demoseiten laufen — sie sind
 * erprobt und erreichbar. Über unterschiedliche Zuschnitte entstehen daraus
 * verschiedene Formate.
 *
 * Für eine breitere Review-Grundlage: weitere Pexels-Foto-IDs in
 * EXTRA_PEXELS_IDS eintragen (nur die Zahl aus der Pexels-URL). Der Pool
 * nimmt sie automatisch auf.
 * ------------------------------------------------------------------------- */

const VERIFIED_PEXELS_IDS = [31558934, 34409906, 32439850];

/** Hier weitere geprüfte Pexels-IDs ergänzen. */
export const EXTRA_PEXELS_IDS: number[] = [];

const PEXELS_IDS = [...VERIFIED_PEXELS_IDS, ...EXTRA_PEXELS_IDS];

function px(id: number, w: number, h?: number): string {
  const size = h ? `w=${w}&h=${h}&fit=crop` : `w=${w}`;
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&${size}`;
}

/**
 * Stabiler Bildpool: dieselbe Position liefert immer dasselbe Bild, egal
 * welcher Stil oder welche Variante gerade betrachtet wird. Nur so lassen
 * sich zwei Varianten überhaupt vergleichen.
 */
export const IMAGE_POOL = {
  hero: px(PEXELS_IDS[0], 1800, 1100),
  portrait: (i: number) => px(PEXELS_IDS[i % PEXELS_IDS.length], 800, 1000),
  landscape: (i: number) => px(PEXELS_IDS[i % PEXELS_IDS.length], 1200, 800),
  square: (i: number) => px(PEXELS_IDS[i % PEXELS_IDS.length], 900, 900),
};

/* -------------------------------------------------------------------------
   Paare, Orte, Texte — drei Stufen, um Umbrüche sichtbar zu machen
   ------------------------------------------------------------------------- */

export type ContentLoad = 'kurz' | 'mittel' | 'lang';

export const COUPLES: Record<ContentLoad, { n1: string; n2: string; location: string }> = {
  kurz: { n1: 'Mia', n2: 'Tom', location: 'Hamburg' },
  mittel: { n1: 'Charlotte', n2: 'Maximilian', location: 'Gut Basthorst, bei Hamburg' },
  lang: {
    n1: 'Katharina-Luise',
    n2: 'Maximilian-Johannes',
    location: 'Gut Sonnenberg – Landhaus & Scheune, Schleswig-Holstein',
  },
};

const STORY_SHORT = 'Café Cinema, ein Donnerstagabend, zwei Cappuccini zu viel.';
const STORY_LONG =
  'Wir haben uns an einem Donnerstagabend in einem Café kennengelernt, das eigentlich schon zu hatte — die Kellnerin ließ uns bleiben, weil draußen so ein Regen fiel, dass niemand vor die Tür wollte. Vier Stunden später standen wir immer noch an derselben Straßenecke und keiner von uns beiden traute sich zu gehen. Sieben Jahre, zwei Umzüge, einen Hund und ungefähr tausend Donnerstagabende später steht nun dieser Tag an, und wir würden uns wieder genau so verspäten.';

/* -------------------------------------------------------------------------
   Tokens je Stil
   -------------------------------------------------------------------------
   Die Farben und Schriften kommen aus den Preset-Tabellen (dieselbe Quelle
   wie im Produktivbetrieb). Ist die Datenbank nicht erreichbar, greift eine
   neutrale Ersatzpalette — die Review zeigt dann Struktur, aber nicht die
   echten Farben, und sagt das oben an.
   ------------------------------------------------------------------------- */

export const FALLBACK_PALETTE = {
  color_bg: '#FAF7F2',
  color_bg_soft: '#F1EBE1',
  color_accent: '#B5746A',
  color_accent_deep: '#8E574E',
  color_ink: '#241F1B',
  font_display: "'Fraunces', Georgia, serif",
  font_body: "'Inter', system-ui, sans-serif",
  font_script: null as string | null,
  display_weight: 400,
  display_style: 'normal' as const,
};

export interface StylePalette {
  color_bg: string;
  color_bg_soft: string;
  color_accent: string;
  color_accent_deep: string;
  color_ink: string;
  font_display: string;
  font_body: string;
  font_script: string | null;
  display_weight: number;
  display_style: 'normal' | 'italic';
  dna_align?: string;
  dna_spacing?: string;
  dna_decor?: string;
  dna_contrast?: string;
}

export function buildTokens(
  style: StyleId,
  palette: StylePalette,
  load: ContentLoad,
): EffectiveTokens {
  const couple = COUPLES[load];

  return {
    wedding_site_id: `allelements-${style}`,
    slug: `allelements-${style}`,
    start_style_id: style,
    nav_variant: 'a',

    color_bg: palette.color_bg,
    color_bg_soft: palette.color_bg_soft,
    color_accent: palette.color_accent,
    color_accent_deep: palette.color_accent_deep,
    color_ink: palette.color_ink,

    font_display: palette.font_display,
    font_body: palette.font_body,
    font_script: palette.font_script,
    display_weight: palette.display_weight,
    display_style: palette.display_style,

    dna_align: (palette.dna_align ?? 'center') as EffectiveTokens['dna_align'],
    dna_spacing: (palette.dna_spacing ?? 'regular') as EffectiveTokens['dna_spacing'],
    dna_decor: (palette.dna_decor ?? 'subtle') as EffectiveTokens['dna_decor'],
    dna_contrast: (palette.dna_contrast ?? 'normal') as EffectiveTokens['dna_contrast'],

    couple_name_1: couple.n1,
    couple_name_2: couple.n2,
    // Immer in der Zukunft, damit der Countdown läuft.
    wedding_date: '2027-07-17',
    wedding_location: couple.location,
    hero_image_url: IMAGE_POOL.hero,
  } as EffectiveTokens;
}

/* -------------------------------------------------------------------------
   Inhalte je Bereich
   -------------------------------------------------------------------------
   Bereiche ohne Eintrag bekommen ein leeres content-Objekt und rendern mit
   ihren eigenen Defaults — genau wie eine frisch angelegte Seite im Produkt.
   ------------------------------------------------------------------------- */

const TIMELINE_EVENTS = [
  { time: '13:30', title: 'Trauung in der Kapelle', description: 'Bitte seid 20 Minuten vorher da.' },
  { time: '14:30', title: 'Sektempfang im Hof', description: STORY_SHORT },
  { time: '15:30', title: 'Gruppenfoto', description: 'Alle Gäste, große Treppe.' },
  { time: '16:00', title: 'Kaffee und Kuchen', description: 'Die Torte ist von Toms Mutter.' },
  { time: '18:00', title: 'Dinner in der Scheune', description: STORY_LONG },
  { time: '20:30', title: 'Reden und Spiele', description: 'Max 3 Minuten pro Rede, bitte.' },
  { time: '21:30', title: 'Eröffnungstanz', description: '' },
  { time: '23:00', title: 'Mitternachtssuppe', description: '' },
];

const FAQ_ITEMS = [
  { question: 'Gibt es einen Dresscode?', answer: STORY_LONG },
  { question: 'Können wir unsere Kinder mitbringen?', answer: 'Sehr gern — es gibt eine Betreuung ab 15 Uhr.' },
  { question: 'Wo können wir übernachten?', answer: 'Im Landhaus gibt es zwölf Zimmer, außerdem zwei Hotels in 10 Minuten Entfernung.' },
  { question: 'Gibt es vegetarisches und veganes Essen?', answer: 'Ja, bitte gebt uns beim RSVP Bescheid.' },
  { question: 'Wie kommen wir zur Location?', answer: 'Shuttle ab Bahnhof um 12:30 und 13:00 Uhr.' },
  { question: 'Dürfen wir fotografieren?', answer: 'Während der Trauung bitte nicht, danach sehr gern.' },
];

/** Inhalte, die aus der Datenbank kämen. */
export function buildContent(key: BereichKey, load: ContentLoad): Record<string, unknown> {
  const couple = COUPLES[load];
  const story = load === 'kurz' ? STORY_SHORT : STORY_LONG;

  switch (key) {
    case 'lovestory':
      return {
        eyebrow: 'Wie alles anfing',
        title: 'Ein Donnerstagabend, <em>Hamburg</em>.',
        when: 'September 2019',
        moment_title: 'Das erste Treffen',
        description: story,
        signature: `— ${couple.n1} & ${couple.n2}`,
        images: [IMAGE_POOL.portrait(0), IMAGE_POOL.landscape(1), IMAGE_POOL.square(2)],
        intro: story,
        entries: [0, 1, 2, 3, 4].map((i) => ({
          id: `ls-${i}`,
          when: ['September 2019', 'Mai 2020', 'August 2021', 'Juni 2023', 'Dezember 2025'][i],
          title: [
            'Das erste Treffen',
            'Die erste gemeinsame Wohnung',
            `Ein Sommer in ${couple.location}`,
            'Der Antrag',
            'Ja, wir machen das',
          ][i],
          description: i % 2 === 0 ? story : STORY_SHORT,
          image_url: IMAGE_POOL.landscape(i),
          image_alt: 'Hochzeitsfoto',
        })),
      };

    case 'gallery':
      return {
        eyebrow: 'Momente',
        title: 'Bilder unserer <em>Reise</em>.',
        intro: load === 'kurz' ? '' : story,
        images: Array.from({ length: 12 }, (_, i) => ({
          id: `img-${i}`,
          src: i % 3 === 0 ? IMAGE_POOL.portrait(i) : i % 3 === 1 ? IMAGE_POOL.landscape(i) : IMAGE_POOL.square(i),
          alt: `Foto ${i + 1}`,
          caption: i % 2 === 0 ? couple.location : '',
          orientation: (i % 3 === 0 ? 'portrait' : i % 3 === 1 ? 'landscape' : 'square') as
            | 'portrait'
            | 'landscape'
            | 'square',
        })),
      };

    case 'timeline':
      return {
        eyebrow: 'Der Tag',
        title: 'Unser <em>Ablauf</em>.',
        description: load === 'kurz' ? '' : story,
        events: TIMELINE_EVENTS.map((e, i) => ({
          id: `ev-${i}`,
          ...e,
          location_name: i === 0 ? couple.location : undefined,
          image: IMAGE_POOL.landscape(i),
        })),
      };

    case 'faq':
      return {
        eyebrow: 'Gut zu wissen',
        title: 'Häufige <em>Fragen</em>.',
        description: load === 'kurz' ? '' : STORY_SHORT,
        items: FAQ_ITEMS.map((f, i) => ({ id: `faq-${i}`, ...f })),
      };

    case 'hero':
      return {
        eyebrow: 'Save the date',
        image_url: IMAGE_POOL.hero,
      };

    case 'directions':
      return {
        eyebrow: 'Anfahrt',
        title: 'So findet ihr <em>uns</em>.',
        description: load === 'kurz' ? '' : STORY_SHORT,
        items: [
          {
            id: 'dir-1',
            label: 'Trauung',
            name: 'Kapelle am Park',
            address: 'Dorfstraße 1\n24558 Sonnenberg',
            description: 'Parkplätze direkt an der Zufahrt, bitte nicht am Hof parken.',
          },
          {
            id: 'dir-2',
            label: 'Feier',
            name: couple.location,
            address: 'Sonnenberger Weg 12\n24558 Sonnenberg',
            description: 'Shuttle ab Bahnhof um 12:30 und 13:00 Uhr.',
          },
        ],
      };

    case 'accommodations':
      return {
        eyebrow: 'Übernachten',
        title: 'Wo ihr <em>schlafen</em> könnt.',
        description: load === 'kurz' ? '' : STORY_SHORT,
        venue: { name: couple.location, lat: 53.75, lng: 10.4 },
        items: [0, 1, 2].map((i) => ({
          id: `acc-${i}`,
          name: ['Landhaus Sonnenberg', 'Hotel Am Markt', 'Pension Deichblick'][i],
          description: i === 0 ? STORY_LONG : 'Kleines Haus, sehr freundlich, gutes Frühstück.',
          image: IMAGE_POOL.landscape(i + 3),
          distance: ['direkt an der Location', '10 Min. mit dem Auto', '15 Min. mit dem Auto'][i],
          price: ['ab 120 € / Nacht', 'ab 95 € / Nacht', 'ab 70 € / Nacht'][i],
        })),
      };

    case 'witnesses':
      return {
        eyebrow: 'Ansprechpartner',
        title: 'Wenn ihr <em>Fragen</em> habt.',
        description: load === 'kurz' ? '' : STORY_SHORT,
        persons: [0, 1, 2].map((i) => ({
          id: `wit-${i}`,
          name: ['Johanna Bergmann', 'Felix Warnke', 'Marie-Christin Osterloh'][i],
          role: ['Trauzeugin', 'Trauzeuge', 'Organisation'][i],
          image: IMAGE_POOL.square(i + 1),
          intro: i === 2 ? STORY_SHORT : '',
          phone: '+49 170 0000000',
          email: 'hallo@example.de',
        })),
      };

    case 'gifts': {
      // Das Feld heißt im Datenmodell `amount` (siehe Gifts/shared.ts,
      // readItems). Hier stand bisher `price` — der Betrag wurde deshalb in
      // der Review nie gerendert.
      const titles = [
        'Eine Nacht im Baumhaus',
        'Abendessen in Kopenhagen',
        'Fahrräder für zwei Tage',
        'Ein Kochkurs',
        'Ein Tag im Thermalbad an der Schlei, inklusive Abendessen',
      ];
      // kurz: ein Eintrag, ohne Beschreibung und ohne Bild — der Fall, in dem
      // wenig gepflegt wurde. mittel: vier. lang: fünf mit langen Texten.
      const count = load === 'kurz' ? 1 : load === 'lang' ? 5 : 4;
      return {
        eyebrow: 'Geschenke',
        title: 'Falls ihr <em>fragt</em>.',
        description: load === 'kurz' ? '' : load === 'lang' ? STORY_LONG : STORY_SHORT,
        iban_enabled: true,
        iban: 'DE02 1203 0000 0000 2020 51',
        iban_holder: `${couple.n1} & ${couple.n2}`,
        iban_note: 'Für unsere Hochzeitsreise.',
        items: Array.from({ length: count }, (_, i) => ({
          id: `gift-${i}`,
          title: titles[i],
          description: load === 'kurz' ? '' : load === 'lang' ? STORY_LONG : i === 0 ? STORY_SHORT : '',
          amount: i === 2 ? null : ['180 €', '120 €', '60 €', '90 €', '240 €'][i],
          image: load === 'kurz' || i === 1 ? null : IMAGE_POOL.landscape(i),
          reserved: i === 3,
          reserved_by: i === 3 ? 'Familie Petersen' : '',
        })),
      };
    }

    case 'musicwishes':
      return {
        eyebrow: 'Musik',
        title: 'Was <em>läuft</em>?',
        description: load === 'kurz' ? '' : STORY_SHORT,
        items: [0, 1, 2, 3].map((i) => ({
          id: `mw-${i}`,
          title: ['Dancing Queen', 'Tanz mit mir', 'September', 'Nichts als die Wahrheit'][i],
          artist: ['ABBA', 'Element of Crime', 'Earth, Wind & Fire', 'Fettes Brot'][i],
          from: i % 2 === 0 ? 'Johanna' : '',
        })),
      };

    case 'guestbook':
      return {
        eyebrow: 'Gästebuch',
        title: 'Schreibt uns <em>etwas</em>.',
        description: load === 'kurz' ? '' : STORY_SHORT,
        entries: [0, 1, 2].map((i) => ({
          id: `gb-${i}`,
          name: ['Oma Hilde', 'Felix', 'Marie-Christin & Jan'][i],
          message: i === 0 ? STORY_LONG : 'Wir freuen uns so für euch beide!',
          created_at: '2027-06-0' + (i + 1) + 'T12:00:00Z',
        })),
      };

    case 'weddingabc':
      return {
        eyebrow: 'Hochzeits-ABC',
        title: 'Von A bis <em>Z</em>.',
        description: load === 'kurz' ? '' : STORY_SHORT,
        items: [
          { id: 'abc-a', letter: 'A', term: 'Anfahrt', text: 'Shuttle ab Bahnhof um 12:30 und 13:00 Uhr.' },
          { id: 'abc-d', letter: 'D', term: 'Dresscode', text: STORY_LONG },
          { id: 'abc-k', letter: 'K', term: 'Kinder', text: 'Betreuung ab 15 Uhr in der kleinen Scheune.' },
          { id: 'abc-p', letter: 'P', term: 'Parken', text: 'Direkt an der Zufahrt, bitte nicht am Hof.' },
          { id: 'abc-r', letter: 'R', term: 'Reden', text: 'Bitte bei Johanna anmelden, max. 3 Minuten.' },
          { id: 'abc-u', letter: 'Ü', term: 'Übernachtung', text: 'Drei Häuser in der Nähe, siehe oben.' },
        ],
      };

    case 'rsvp':
      // Dieselbe Content-Struktur wie aus dem Dashboard (RsvpEditor):
      // title, description, deadline, ask_dietary, ask_allergies,
      // custom_questions[]. Kurz: ohne Fragen. Lang: lange Frage + Auswahl.
      return {
        title: 'Eure Zusage',
        description:
          load === 'kurz'
            ? ''
            : load === 'lang'
              ? 'Wir würden uns riesig freuen, wenn ihr dabei seid. Sagt uns bitte bis zum genannten Datum Bescheid — auch wenn es eine Absage ist, dann können wir besser planen und niemand wartet vergeblich auf euch.'
              : 'Sagt uns bitte bis zum genannten Datum Bescheid, ob ihr dabei seid.',
        deadline: '2027-05-01',
        ask_dietary: true,
        ask_allergies: true,
        custom_questions:
          load === 'kurz'
            ? []
            : load === 'lang'
              ? [
                  {
                    id: 'q1',
                    label:
                      'Wir organisieren einen Shuttle vom Bahnhof Hamburg-Bergedorf zur Location und am späten Abend zurück in die Stadt — möchtet ihr einen Platz reservieren?',
                    type: 'boolean',
                    required: true,
                  },
                  {
                    id: 'q2',
                    label: 'Wann reist ihr an?',
                    type: 'choice',
                    options: ['Freitag', 'Samstag vormittags', 'Samstag direkt zur Trauung'],
                  },
                  { id: 'q3', label: 'Ein Lied, bei dem ihr sofort tanzt?', type: 'text' },
                ]
              : [{ id: 'q1', label: 'Kommt ihr zum Brunch am Sonntag?', type: 'boolean' }],
      };

    default:
      // Bereich rendert mit seinen eigenen Defaults — wie eine neu angelegte Seite.
      return {};
  }
}

/**
 * Baut ein WeddingBereich-Objekt, wie es der BereichRenderer aus der
 * Datenbank bekommt. Damit läuft die Review durch denselben Code wie das
 * Produkt — kein Preview-Sonderweg.
 */
export function buildBereich(
  key: BereichKey,
  variant: ComponentVariant,
  load: ContentLoad,
  index: number,
): WeddingBereich {
  return {
    id: `allelements-${key}-${variant}`,
    wedding_site_id: 'allelements',
    bereich_key: key,
    variant,
    position: index,
    is_active: true,
    content: buildContent(key, load),
  } as unknown as WeddingBereich;
}

/* -------------------------------------------------------------------------
   RSVP — Beispielangaben für die Review-Zustände
   -------------------------------------------------------------------------
   Nur für /allelements (runtime.mode 'review'). Drei Längen wie überall:
   kurz = eine Person, knapp; mittel = Paar; lang = lange Namen, fünf
   Personen, lange Allergie- und Nachrichtentexte (> 1000 Zeichen).
   ------------------------------------------------------------------------- */

export function buildRsvpSample(load: ContentLoad) {
  if (load === 'kurz') {
    return {
      name: 'Mia',
      email: 'mia@example.de',
      persons: 1,
      guests: [],
      dietary: '',
      allergies: '',
      message: '',
    };
  }
  if (load === 'lang') {
    return {
      name: 'Katharina-Luise von Sonnenberg',
      email: 'katharina-luise.von-sonnenberg@beispiel-kanzlei-hamburg.de',
      persons: 5,
      guests: [
        { name: 'Maximilian-Johannes von Sonnenberg', dietary: 'vegetarisch', allergies: '' },
        { name: 'Charlotte-Amelie von Sonnenberg', dietary: '', allergies: 'Laktoseintoleranz, keine Sahnesaucen' },
        { name: 'Friedrich', dietary: 'Kinderteller', allergies: '' },
        { name: '', dietary: '', allergies: '' },
      ],
      dietary: 'pescetarisch — Fisch ja, Fleisch nein',
      allergies:
        'Schwere Haselnuss- und Walnussallergie (auch Spuren), außerdem Sellerie. Wir haben ein Notfallset dabei, würden uns aber freuen, wenn die Küche Bescheid weiß.',
      message: `${STORY_LONG} ${STORY_LONG}`,
    };
  }
  return {
    name: 'Johanna Albers',
    email: 'johanna@example.de',
    persons: 2,
    guests: [{ name: 'Felix Albers', dietary: 'vegetarisch', allergies: '' }],
    dietary: '',
    allergies: 'Haselnüsse',
    message: 'Wir freuen uns riesig auf euch beide und euren Tag!',
  };
}
