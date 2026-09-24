import { createSupabaseAdminClient } from './supabase-admin';

/**
 * Datenbeschaffung für das interne Ops-Dashboard — ausschließlich lesend.
 *
 * Aufrufer MUSS vorher requireAdminPage()/checkAdmin() bestanden haben; hier
 * wird mit dem Service-Role-Client gelesen.
 *
 * Abfragestrategie gegen N+1: eine Abfrage je Tabelle über alle Seiten, die
 * Zählung passiert im Speicher. Bei MVP-Größe (einige hundert Zeilen) ist das
 * schnell und bleibt eine überschaubare Zahl an Abfragen (7).
 */

export interface AdminSiteRow {
  id: string;
  slug: string;
  couple: string;
  style: string | null;
  status: string | null;
  purchaseStatus: string | null;
  paidAt: string | null;
  accessUntil: string | null;
  weddingDate: string | null;
  createdAt: string | null;
  publishedAt: string | null;
  ownerUserId: string | null;
  ownerEmail: string | null;
  accountCreatedAt: string | null;
  accountLastSignIn: string | null;
  stripeCustomerId: string | null;
  stripeSessionId: string | null;
  bereicheCount: number;
  purchasesCount: number;
  rsvpCount: number;
  guestbookPending: number;
  guestbookTotal: number;
  musicCount: number;
  giftReservations: number;
  photoCount: number;
  diagnosis: Diagnosis;
}

export interface Diagnosis {
  /** Kürzeste Antwort auf „Was ist hier los?" */
  headline: string;
  level: 'ok' | 'info' | 'warn' | 'error';
  notes: string[];
}

type SiteRow = {
  id: string;
  slug: string;
  couple_name_1: string | null;
  couple_name_2: string | null;
  start_style_id: string | null;
  status: string | null;
  purchase_status: string | null;
  paid_at: string | null;
  access_until: string | null;
  wedding_date: string | null;
  created_at: string | null;
  site_published_at: string | null;
  owner_user_id: string | null;
  user_id: string | null;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null;
};

function countBy(rows: { wedding_site_id: string }[] | null): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows ?? []) m.set(r.wedding_site_id, (m.get(r.wedding_site_id) ?? 0) + 1);
  return m;
}

function diagnose(row: AdminSiteRow): Diagnosis {
  const notes: string[] = [];
  const now = Date.now();
  const expired = row.accessUntil ? new Date(row.accessUntil).getTime() < now : false;

  if (row.purchaseStatus === 'refunded') {
    notes.push('Zahlung wurde erstattet — die Seite ist öffentlich gesperrt.');
    return { headline: 'Erstattet', level: 'error', notes };
  }
  if (row.purchaseStatus !== 'paid') {
    // Seiten ohne Kaufstatus UND ohne Stripe-Session stammen aus der Zeit vor
    // dem Verkaufsstart (eigene Tests, frühe Demos). Kein Supportfall.
    if (!row.purchaseStatus && !row.stripeSessionId) {
      notes.push('Angelegt ohne Checkout — Altbestand oder eigene Testseite.');
      return { headline: 'Altbestand / Test', level: 'info', notes };
    }
    notes.push(`Kaufstatus: ${row.purchaseStatus ?? 'unbekannt'}.`);
    return { headline: 'Nicht bezahlt', level: 'warn', notes };
  }
  if (!row.ownerUserId || !row.ownerEmail) {
    notes.push('Zur Seite gehört kein Auth-Account — Provisionierung unvollständig.');
    return { headline: 'Account fehlt', level: 'error', notes };
  }
  if (row.bereicheCount === 0) {
    notes.push('Es wurden keine Bereiche angelegt — Provisionierung unvollständig.');
    return { headline: 'Provisionierung unvollständig', level: 'error', notes };
  }
  if (expired) {
    notes.push(`Laufzeit endete am ${new Date(row.accessUntil as string).toLocaleDateString('de-DE')}.`);
    return { headline: 'Abgelaufen', level: 'warn', notes };
  }
  if (row.status !== 'published') {
    notes.push('Bezahlt, aber vom Paar noch nicht veröffentlicht.');
    if (!row.accountLastSignIn) notes.push('Das Paar hat sich noch nie angemeldet — Login-Mail evtl. nicht angekommen.');
    return { headline: 'Noch nicht veröffentlicht', level: 'info', notes };
  }
  if (row.guestbookPending > 0) notes.push(`${row.guestbookPending} Gästebucheinträge warten auf Freigabe.`);
  if (row.purchasesCount === 0) notes.push('Keine Einträge in wedding_purchases — Bereichsfreischaltung prüfen.');

  return { headline: 'Alles okay', level: 'ok', notes };
}

export interface AdminOverview {
  rows: AdminSiteRow[];
  total: number;
}

export async function loadAdminSites(): Promise<AdminOverview | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const [sitesRes, bereicheRes, purchasesRes, rsvpRes, gbRes, mwRes, grRes, phRes] = await Promise.all([
    admin
      .from('wedding_sites')
      .select(
        'id, slug, couple_name_1, couple_name_2, start_style_id, status, purchase_status, paid_at, access_until, wedding_date, created_at, site_published_at, owner_user_id, user_id, stripe_customer_id, stripe_checkout_session_id',
      )
      .order('created_at', { ascending: false })
      .limit(500),
    admin.from('wedding_bereiche').select('wedding_site_id'),
    admin.from('wedding_purchases').select('wedding_site_id'),
    admin.from('wedding_rsvps').select('wedding_site_id'),
    admin.from('wedding_guestbook_entries').select('wedding_site_id, status'),
    admin.from('wedding_music_wishes').select('wedding_site_id'),
    admin.from('wedding_gift_reservations').select('wedding_site_id'),
    admin.from('wedding_photo_uploads').select('wedding_site_id'),
  ]);

  const sites = (sitesRes.data ?? []) as SiteRow[];

  // Accounts: eine Liste statt einer Abfrage je Seite.
  const users = new Map<string, { email: string | null; created_at: string | null; last_sign_in_at: string | null }>();
  try {
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const u of data?.users ?? []) {
      users.set(u.id, {
        email: u.email ?? null,
        created_at: u.created_at ?? null,
        last_sign_in_at: (u as { last_sign_in_at?: string | null }).last_sign_in_at ?? null,
      });
    }
  } catch (err) {
    console.error('[admin] listUsers fehlgeschlagen:', err);
  }

  const bereiche = countBy(bereicheRes.data as { wedding_site_id: string }[] | null);
  const purchases = countBy(purchasesRes.data as { wedding_site_id: string }[] | null);
  const rsvps = countBy(rsvpRes.data as { wedding_site_id: string }[] | null);
  const music = countBy(mwRes.data as { wedding_site_id: string }[] | null);
  const gifts = countBy(grRes.data as { wedding_site_id: string }[] | null);
  const photos = countBy(phRes.data as { wedding_site_id: string }[] | null);

  const gbAll = countBy(gbRes.data as { wedding_site_id: string }[] | null);
  const gbPending = countBy(
    ((gbRes.data ?? []) as { wedding_site_id: string; status: string }[]).filter((r) => r.status === 'pending'),
  );

  const rows: AdminSiteRow[] = sites.map((s) => {
    const ownerId = s.owner_user_id ?? s.user_id;
    const acc = ownerId ? users.get(ownerId) : undefined;
    const row: AdminSiteRow = {
      id: s.id,
      slug: s.slug,
      couple: [s.couple_name_1, s.couple_name_2].filter(Boolean).join(' & ') || '—',
      style: s.start_style_id,
      status: s.status,
      purchaseStatus: s.purchase_status,
      paidAt: s.paid_at,
      accessUntil: s.access_until,
      weddingDate: s.wedding_date,
      createdAt: s.created_at,
      publishedAt: s.site_published_at,
      ownerUserId: ownerId ?? null,
      ownerEmail: acc?.email ?? null,
      accountCreatedAt: acc?.created_at ?? null,
      accountLastSignIn: acc?.last_sign_in_at ?? null,
      stripeCustomerId: s.stripe_customer_id,
      stripeSessionId: s.stripe_checkout_session_id,
      bereicheCount: bereiche.get(s.id) ?? 0,
      purchasesCount: purchases.get(s.id) ?? 0,
      rsvpCount: rsvps.get(s.id) ?? 0,
      guestbookPending: gbPending.get(s.id) ?? 0,
      guestbookTotal: gbAll.get(s.id) ?? 0,
      musicCount: music.get(s.id) ?? 0,
      giftReservations: gifts.get(s.id) ?? 0,
      photoCount: photos.get(s.id) ?? 0,
      diagnosis: { headline: '', level: 'ok', notes: [] },
    };
    row.diagnosis = diagnose(row);
    return row;
  });

  return { rows, total: rows.length };
}

export async function loadAdminSite(slug: string): Promise<AdminSiteRow | null> {
  const all = await loadAdminSites();
  return all?.rows.find((r) => r.slug === slug) ?? null;
}

/** Filter und Suche für die Übersicht (serverseitig, aus den geladenen Zeilen). */
export function filterRows(
  rows: AdminSiteRow[],
  q: string | undefined,
  filter: string | undefined,
): AdminSiteRow[] {
  let out = rows;
  const needle = (q ?? '').trim().toLowerCase();
  if (needle) {
    out = out.filter(
      (r) =>
        r.slug.includes(needle) ||
        r.couple.toLowerCase().includes(needle) ||
        (r.ownerEmail ?? '').toLowerCase().includes(needle),
    );
  }
  switch (filter) {
    case 'published':
      return out.filter((r) => r.status === 'published');
    case 'unpublished':
      return out.filter((r) => r.status !== 'published');
    case 'paid':
      return out.filter((r) => r.purchaseStatus === 'paid');
    case 'unpaid':
      return out.filter((r) => r.purchaseStatus !== 'paid');
    case 'problem':
      return out.filter((r) => r.diagnosis.level === 'warn' || r.diagnosis.level === 'error');
    case 'expired':
      return out.filter((r) => !!r.accessUntil && new Date(r.accessUntil).getTime() < Date.now());
    case 'refunded':
      return out.filter((r) => r.purchaseStatus === 'refunded');
    case 'legacy':
      return out.filter((r) => !r.purchaseStatus && !r.stripeSessionId);
    case 'customers':
      return out.filter((r) => !!r.stripeSessionId || r.purchaseStatus === 'paid');
    default:
      return out;
  }
}
