import { createSupabaseServerClient } from './supabase-server';
import { createSupabaseAdminClient } from './supabase-admin';

/**
 * Owner-Vorschau für RSVP — NUR serverseitig.
 *
 * Die Dashboard-Vorschau lädt die Hochzeitsseite im iframe mit
 * `?preview=draft` bzw. `?preview=1`. Dieser Parameter ist öffentlich: jeder
 * kann ihn an eine URL hängen. Er ist deshalb nur der ANLASS für die Prüfung,
 * nie ihr Ergebnis.
 *
 * Entsperrt wird ausschließlich, wenn zusätzlich
 *   1. eine gültige Supabase-Session existiert (auth.getUser prüft das Token
 *      gegen den Auth-Server, nicht nur das Cookie), und
 *   2. dieser Nutzer Besitzer genau dieser Site ist
 *      — dieselbe Besitzprüfung wie in den Dashboard-Actions.
 *
 * Und selbst dann entsperrt die Vorschau nur die ANSICHT: eine Rückmeldung
 * aus der Vorschau wird nicht gesendet (siehe useRsvp, mode 'preview'), und
 * /api/rsvp kennt keine Preview-Ausnahme. Einen Bypass des Einladungscodes
 * gibt es damit weder im UI noch in der API.
 */
export async function isOwnerPreview(
  slug: string,
  previewParam: string | undefined,
): Promise<boolean> {
  if (previewParam !== 'draft' && previewParam !== '1') return false;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const admin = createSupabaseAdminClient();
    if (!admin) return false;

    const { data } = await admin
      .from('wedding_sites')
      .select('owner_user_id, user_id')
      .eq('slug', slug)
      .maybeSingle();

    const site = data as { owner_user_id: string | null; user_id: string | null } | null;
    if (!site) return false;
    return site.owner_user_id === user.id || site.user_id === user.id;
  } catch {
    // Im Zweifel keine Vorschau-Freischaltung: dann sieht der Owner das Gate
    // wie ein Gast. Das ist unbequem, aber nie unsicher.
    return false;
  }
}
