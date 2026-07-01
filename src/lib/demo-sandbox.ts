import { randomBytes } from 'crypto';
import { createSupabaseAdminClient } from './supabase-admin';
import { DEMO_TEMPLATES, ensureDemoOwner, provisionDemoSite, type DemoTemplate } from './seed-demos';

/**
 * Sandbox (/testen) — jeder Besucher bekommt eine eigene Wegwerf-Hochzeitsseite
 * (`demo-<zufall>`), geklont aus einem Template. Da das Dashboard adminbasiert
 * und ungegatet ist, reicht der eigene Slug als Isolation — kein Login noetig.
 * Aufraeumen uebernimmt /api/cron/cleanup-demos (Slugs `demo-%`, aelter als 24 h).
 */

export const SANDBOX_PREFIX = 'demo-';

function pickTemplate(style?: string | null): DemoTemplate {
  if (style) {
    const match = DEMO_TEMPLATES.find((t) => t.style === style);
    if (match) return match;
  }
  return DEMO_TEMPLATES[0];
}

/** Prueft, ob eine (per Cookie gemerkte) Sandbox-Site noch existiert. */
export async function demoSiteExists(slug: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;
  const { data } = await admin.from('wedding_sites').select('id').eq('slug', slug).maybeSingle();
  return !!data;
}

/** Legt eine neue Sandbox-Site an und liefert deren Slug. */
export async function startDemoSession(style?: string | null): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: 'admin client unavailable' };

  const ownerId = await ensureDemoOwner(admin);
  if (!ownerId) return { ok: false, error: 'demo owner unavailable' };

  const template = pickTemplate(style);
  const slug = `${SANDBOX_PREFIX}${randomBytes(4).toString('hex')}`; // demo-xxxxxxxx

  const r = await provisionDemoSite(admin, { slug, template, ownerId });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, slug };
}
