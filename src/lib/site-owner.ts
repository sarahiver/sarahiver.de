import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase-server';
import { createSupabaseAdminClient } from './supabase-admin';
import { SANDBOX_PREFIX } from './demo-sandbox';
import { DEMO_OWNER_EMAIL } from './seed-demos';

/**
 * Zentrale Besitzprüfung für alles unter /dashboard/[slug].
 *
 * Das Dashboard liest und schreibt über den Service-Role-Client (RLS-frei).
 * Deshalb MUSS jeder Serverpfad, der einen Slug entgegennimmt, zuerst hier
 * durch: Der Zugriff wird aus der serverseitig geprüften Supabase-Session
 * abgeleitet — nie aus Client-Daten (Slug-Geheimhaltung, versteckte Knöpfe,
 * User-IDs aus FormData zählen nicht).
 *
 * Zugriff haben:
 *   1. der eingeloggte Eigentümer (owner_user_id oder user_id der Site)
 *   2. die Sandbox (/testen): Slug mit Präfix `demo-`, das eigene
 *      `demo_slug`-Cookie zeigt genau auf diesen Slug UND die Site gehört dem
 *      Demo-Owner-Account. Echte Kundenseiten erreichen diesen Pfad nie, auch
 *      wenn ihr Slug zufällig mit `demo-` beginnt.
 *
 * Fremde und nicht existierende Slugs werden gleich behandelt (kein Hinweis,
 * ob eine fremde Seite existiert).
 */

export interface OwnedSite {
  siteId: string;
  slug: string;
  userId: string | null;
  sandbox: boolean;
}

export type SiteOwnerCheck =
  | { ok: true; site: OwnedSite }
  | { ok: false; reason: 'unauthenticated' | 'forbidden' | 'unavailable'; error: string };

const FORBIDDEN = { ok: false as const, reason: 'forbidden' as const, error: 'Keine Berechtigung für diese Seite.' };

export async function checkSiteOwner(rawSlug: unknown): Promise<SiteOwnerCheck> {
  if (typeof rawSlug !== 'string' || !rawSlug.trim()) return FORBIDDEN;
  const slug = rawSlug.trim().toLowerCase();

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, reason: 'unavailable', error: 'Service gerade nicht verfügbar.' };

  const { data } = await admin
    .from('wedding_sites')
    .select('id, slug, owner_user_id, user_id')
    .eq('slug', slug)
    .maybeSingle();
  const site = data as { id: string; slug: string; owner_user_id: string | null; user_id: string | null } | null;

  // Sandbox: nur mit passendem Cookie und nur für Sites des Demo-Owners.
  if (site && slug.startsWith(SANDBOX_PREFIX)) {
    const jar = await cookies();
    if (jar.get('demo_slug')?.value === slug && site.owner_user_id) {
      const { data: owner } = await admin.auth.admin.getUserById(site.owner_user_id);
      if (owner?.user?.email === DEMO_OWNER_EMAIL) {
        return { ok: true, site: { siteId: site.id, slug: site.slug, userId: null, sandbox: true } };
      }
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'unauthenticated', error: 'Bitte zuerst anmelden.' };

  if (!site) return FORBIDDEN;
  if (site.owner_user_id !== user.id && site.user_id !== user.id) return FORBIDDEN;

  return { ok: true, site: { siteId: site.id, slug: site.slug, userId: user.id, sandbox: false } };
}

/**
 * Für Layouts und Seiten: nicht eingeloggt → /login, fremd oder unbekannt →
 * 404. Muss VOR dem Laden sensibler Daten aufgerufen werden.
 */
export async function requireSiteOwnerPage(slug: string): Promise<OwnedSite> {
  const r = await checkSiteOwner(slug);
  if (r.ok) return r.site;
  if (r.reason === 'unauthenticated') {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/${slug}`)}`);
  }
  notFound();
}
