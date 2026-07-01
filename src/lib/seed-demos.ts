import { createSupabaseAdminClient } from './supabase-admin';

/**
 * Demo-Seeding — legt 1-3 oeffentliche Beispiel-Hochzeitsseiten an, die auf der
 * Landing als "Live ansehen"-Beispiele verlinkt werden UND spaeter als Vorlage
 * fuer die Sandbox (/testen) geklont werden.
 *
 * Spiegelt provision.ts: eigener Demo-Owner (auth user), Preset-Modus ueber die
 * Style-Defaults, Kaeufe zur Freischaltung. Unterschied: content_published ist
 * mit echten Beispielinhalten gefuellt und subscription_status = null
 * (=> oeffentlich sichtbar, isPublicallyBlocked(null) === false).
 *
 * Idempotent ueber den Slug: Bereiche/Kaeufe werden pro Lauf neu gesetzt.
 * Nur mit Service-Role-Client (server-only) aufrufen.
 */

const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export interface DemoTemplate {
  slug: string;
  style: string; // start_styles.id (z.B. 'editorial')
  name1: string;
  name2: string;
  date: string; // YYYY-MM-DD (Zukunft, damit Countdown laeuft)
  location: string;
  hero: string;
  story: { title: string; text: string };
}

export const DEMO_TEMPLATES: DemoTemplate[] = [
  {
    slug: 'sarah-und-iver', style: 'editorial', name1: 'Sarah', name2: 'Iver',
    date: '2026-08-22', location: 'Gut Basthorst, bei Hamburg', hero: px(31558934, 1400),
    story: { title: 'Ein Ja in Kopenhagen', text: 'Ein verregneter Morgen am Hafen, zwei Kaffee to go und eine Frage, die alles veraenderte.' },
  },
  {
    slug: 'mila-und-theo', style: 'organic', name1: 'Mila', name2: 'Theo',
    date: '2026-09-12', location: 'Weingut Sonnenhang, Pfalz', hero: px(34409906, 1400),
    story: { title: 'Zwischen Reben und Sommerlicht', text: 'Aus einem geliehenen Fahrrad und einer falschen Abzweigung wurde der schoenste Umweg unseres Lebens.' },
  },
  {
    slug: 'johanna-und-felix', style: 'opulent', name1: 'Johanna', name2: 'Felix',
    date: '2026-10-03', location: 'Schloss Bensberg, Bergisch Gladbach', hero: px(32439850, 1400),
    story: { title: 'Ein Winterabend, ein Versprechen', text: 'Kerzenlicht, ein letzter Tanz im leeren Saal und die Gewissheit: mit dir, fuer immer.' },
  },
];

/** Baut den kompletten Bereich-Content fuer eine Demo. */
export function buildBereiche(t: DemoTemplate) {
  const g = (id: number) => px(id, 900);
  return [
    { key: 'hero', variant: 'a', content: { eyebrow: 'Wir heiraten' } },
    { key: 'countdown', variant: 'a', content: { eyebrow: 'Es sind noch', footer: `bis ${t.name1} & ${t.name2} Ja sagen`, past_text: 'Wir haben geheiratet!' } },
    {
      key: 'lovestory', variant: 'b', content: {
        eyebrow: 'Unsere Geschichte', title: t.story.title, intro: t.story.text,
        images: [g(8528876), g(8554867), g(5859639)],
        entries: [
          { id: 'm1', when: '2021', title: 'Der erste Blick', description: 'Auf einer Feier von Freunden - und danach war nichts mehr wie vorher.', image_url: g(8554867), image_alt: 'Paar lacht zusammen' },
          { id: 'm2', when: '2023', title: 'Zusammengezogen', description: 'Zwei Wohnungen, eine Kiste Buecher zu viel und trotzdem der beste Umzug ever.', image_url: g(34409906), image_alt: 'Paar draussen' },
          { id: 'm3', when: '2025', title: 'Die Frage', description: t.story.text, image_url: g(31558934), image_alt: 'Paar bei Sonnenuntergang' },
        ],
      },
    },
    {
      key: 'timeline', variant: 'a', content: {
        eyebrow: 'Ablauf', title: 'Der Tag', description: 'Von der Trauung bis zur letzten Runde auf der Tanzflaeche.',
        events: [
          { id: 'e1', time: '14:30', title: 'Freie Trauung', description: 'Im Garten - bitte rechtzeitig da sein.' },
          { id: 'e2', time: '15:30', title: 'Sektempfang', description: 'Anstossen, gratulieren, Sonne geniessen.' },
          { id: 'e3', time: '18:00', title: 'Dinner', description: 'Ein langes Abendessen mit allen, die uns wichtig sind.' },
          { id: 'e4', time: '21:00', title: 'Party', description: 'Tanzflaeche offen bis in die Nacht.' },
        ],
      },
    },
    {
      key: 'directions', variant: 'a', content: {
        eyebrow: 'Anfahrt', title: 'So findet ihr uns', description: 'Location, Parken und der schnellste Weg.',
        items: [
          { id: 'l1', name: t.location.split(',')[0], address: t.location, description: 'Parkplaetze direkt vor Ort. Shuttle ab Bahnhof auf Anfrage.' },
        ],
      },
    },
    {
      key: 'accommodations', variant: 'a', content: {
        eyebrow: 'Uebernachten', title: 'Wo ihr schlafen koennt', description: 'Eine kleine Auswahl in der Naehe.',
        items: [
          { id: 'h1', name: 'Landhotel am See', distance: '5 Min.', price: 'ab 95 EUR', booking_url: 'https://example.com' },
          { id: 'h2', name: 'Boutique-Pension Mitte', distance: '12 Min.', price: 'ab 78 EUR', booking_url: 'https://example.com' },
        ],
      },
    },
    {
      key: 'gallery', variant: 'a', content: {
        eyebrow: 'Momente', title: 'Galerie', intro: 'Ein paar unserer liebsten Bilder.',
        images: [
          { id: 'g1', src: g(31558934), alt: 'Paar bei Sonnenuntergang', caption: 'Der Antrag' },
          { id: 'g2', src: g(34409906), alt: 'Paar draussen im Sommer' },
          { id: 'g3', src: g(8554867), alt: 'Paar lacht' },
          { id: 'g4', src: g(5859639), alt: 'Paar posiert' },
          { id: 'g5', src: g(32439850), alt: 'Umarmung bei Sonnenuntergang' },
          { id: 'g6', src: g(8528876), alt: 'Kuss auf die Nase' },
        ],
      },
    },
    {
      key: 'witnesses', variant: 'a', content: {
        eyebrow: 'Trauzeugen', title: 'Unsere rechte & linke Hand',
        persons: [
          { id: 'p1', name: 'Lena', role: 'Trauzeugin', intro: 'Kennt alle Geheimnisse - fragt sie bei Fragen zur Ueberraschung.', photo: g(8554867) },
          { id: 'p2', name: 'Jonas', role: 'Trauzeuge', intro: 'Zustaendig fuer Spiele, Musikwuensche und gute Laune.', photo: g(5859639) },
        ],
      },
    },
    {
      key: 'gifts', variant: 'a', content: {
        eyebrow: 'Schenken', title: 'Reisekasse', description: 'Das groesste Geschenk ist eure Anwesenheit. Wer moechte, fuellt unsere Flitterwochen-Kasse.',
        iban_enabled: true, iban: 'DE00 0000 0000 0000 0000 00', iban_holder: `${t.name1} & ${t.name2}`,
        iban_note: 'Verwendungszweck: euer Name', reserve_success: 'Danke, ihr Lieben!',
        items: [
          { id: 'gi1', title: 'Eine Nacht im Boutique-Hotel', description: 'Damit unsere Reise ein Highlight bekommt.', amount: '120 EUR', image: g(34409906) },
          { id: 'gi2', title: 'Abendessen am Meer', description: 'Fuer einen unvergesslichen Abend zu zweit.', amount: '80 EUR', image: g(32439850) },
          { id: 'gi3', title: 'Ausflug & Abenteuer', description: 'Ueberrascht uns - wir freuen uns auf alles.', amount: '50 EUR' },
        ],
      },
    },
    {
      key: 'faq', variant: 'a', content: {
        eyebrow: 'Gut zu wissen', title: 'Fragen & Antworten',
        items: [
          { question: 'Gibt es einen Dresscode?', answer: 'Festlich, gern in Sommerfarben. Flache Schuhe fuer die Wiese empfehlenswert.' },
          { question: 'Duerfen Kinder mit?', answer: 'Sehr gern - sagt uns bei der Zusage kurz Bescheid, wir planen eine kleine Betreuung.' },
          { question: 'Bis wann sollen wir zusagen?', answer: 'Bitte bis vier Wochen vor dem Termin ueber das Formular auf dieser Seite.' },
          { question: 'Kann ich Musikwuensche loswerden?', answer: 'Unbedingt. Sprecht Lena oder Jonas an oder schreibt es uns.' },
        ],
      },
    },
    {
      key: 'rsvp', variant: 'a', content: {
        title: 'Seid ihr dabei?', description: 'Wir freuen uns auf eure Zusage.',
        deadline: t.date, ask_dietary: true, ask_allergies: true,
      },
    },
  ];
}

export interface SeedResult { ok: boolean; created: string[]; errors: string[] }

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

const DEMO_OWNER_EMAIL = 'demo-owner@sarahiver.de';

/** Demo-Owner (auth user) sicherstellen — Eigentuemer aller Demo-/Sandbox-Seiten. */
export async function ensureDemoOwner(admin: AdminClient): Promise<string | null> {
  const created = await admin.auth.admin.createUser({ email: DEMO_OWNER_EMAIL, email_confirm: true });
  if (created.data?.user) return created.data.user.id;
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: DEMO_OWNER_EMAIL });
  return link.data?.user?.id ?? null;
}

/** Legt eine Demo-Site (Site + Bereiche + Kaeufe) an bzw. aktualisiert sie (idempotent nach slug). */
export async function provisionDemoSite(
  admin: AdminClient,
  opts: { slug: string; template: DemoTemplate; ownerId: string },
): Promise<{ ok: boolean; siteId?: string; error?: string }> {
  const { slug, template: t, ownerId } = opts;

  const { data: styleRow } = await admin
    .from('start_styles').select('default_palette_id, default_font_id').eq('id', t.style).maybeSingle();
  if (!styleRow) return { ok: false, error: `style '${t.style}' not found` };
  const { default_palette_id, default_font_id } = styleRow as { default_palette_id: string; default_font_id: string };

  const siteFields = {
    slug,
    couple_name_1: t.name1, couple_name_2: t.name2,
    wedding_date: t.date, wedding_location: t.location, hero_image_url: t.hero,
    start_style_id: t.style, palette_preset_id: default_palette_id, font_preset_id: default_font_id,
    nav_variant: 'a', status: 'draft',
    owner_user_id: ownerId, user_id: ownerId,
    subscription_status: null, subscription_tier: 'p11',
  };

  const { data: existing } = await admin.from('wedding_sites').select('id').eq('slug', slug).maybeSingle();
  let siteId: string;
  if (existing) {
    siteId = (existing as { id: string }).id;
    await admin.from('wedding_sites').update(siteFields as never).eq('id', siteId);
  } else {
    const { data: site, error: siteErr } = await admin
      .from('wedding_sites').insert(siteFields as never).select('id').single();
    if (siteErr || !site) return { ok: false, error: `site insert failed (${siteErr?.message})` };
    siteId = (site as { id: string }).id;
  }

  await admin.from('wedding_bereiche').delete().eq('wedding_site_id', siteId);
  const rows = buildBereiche(t).map((b, i) => ({
    wedding_site_id: siteId, bereich_key: b.key, variant: b.variant, display_order: i, is_active: true,
    content: b.content, content_draft: b.content, content_published: b.content,
  }));
  const { error: bErr } = await admin.from('wedding_bereiche').insert(rows as never);
  if (bErr) return { ok: false, siteId, error: `bereiche insert failed (${bErr.message})` };

  await admin.from('wedding_purchases').delete().eq('wedding_site_id', siteId);
  const purchases = buildBereiche(t).map((b) => ({ wedding_site_id: siteId, bereich_key: b.key }));
  const { error: pErr } = await admin.from('wedding_purchases').insert(purchases as never);
  if (pErr) return { ok: false, siteId, error: `purchases insert failed (${pErr.message})` };

  return { ok: true, siteId };
}

export async function seedDemos(): Promise<SeedResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, created: [], errors: ['admin client unavailable'] };
  const ownerId = await ensureDemoOwner(admin);
  if (!ownerId) return { ok: false, created: [], errors: ['demo owner could not be created'] };

  const created: string[] = [];
  const errors: string[] = [];
  for (const t of DEMO_TEMPLATES) {
    const r = await provisionDemoSite(admin, { slug: t.slug, template: t, ownerId });
    if (r.ok) created.push(t.slug);
    else errors.push(`${t.slug}: ${r.error}`);
  }
  return { ok: errors.length === 0, created, errors };
}
