import { createSupabaseAdminClient } from './supabase-admin';
import { STANDARD_KEYS, ADDON_KEYS, normalizeAddonKey, type Tier } from './funnel';

/**
 * Provisioning — vom Stripe-Webhook aufgerufen, nachdem eine Zahlung
 * erfolgreich war. Legt Account + Hochzeitsseite + Bereiche + Käufe an
 * und mailt dem Paar den Login-Link.
 *
 * Idempotent über den Slug: existiert die Site schon, werden nur die
 * Billing-Felder aktualisiert (kein doppeltes Anlegen).
 *
 * Schreibt ausschließlich mit dem Service-Role-Client (server-only).
 */

export interface ProvisionInput {
  email: string;
  slug: string;
  name1: string;
  name2: string;
  weddingDate: string; // YYYY-MM-DD
  style: string;
  tier: Tier;
  addons: string[];
  domain: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null; // ISO
}

export type ProvisionResult = { ok: true; siteId: string; userId: string } | { ok: false; error: string };

export async function provisionSite(input: ProvisionInput): Promise<ProvisionResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: 'admin client unavailable' };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de';
  const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(`/dashboard/${input.slug}`)}`;

  // --- 1) Account sicherstellen -------------------------------------------
  let userId: string | null = null;

  const created = await admin.auth.admin.createUser({
    email: input.email,
    email_confirm: true, // bestätigt; Login via Magic-Link/Passwort
  });

  if (created.data?.user) {
    userId = created.data.user.id;
  } else {
    // Vermutlich existiert die E-Mail schon → ID über generateLink auflösen
    const link = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: input.email,
    });
    if (link.data?.user) userId = link.data.user.id;
  }

  if (!userId) {
    console.error('[provision] could not create/resolve user for', input.email, created.error);
    return { ok: false, error: 'user provisioning failed' };
  }

  // --- 2) Site idempotent anlegen / Billing aktualisieren -----------------
  const billing = {
    owner_user_id: userId,
    stripe_customer_id: input.stripeCustomerId,
    stripe_subscription_id: input.stripeSubscriptionId,
    subscription_status: input.subscriptionStatus,
    subscription_tier: input.tier,
    current_period_end: input.currentPeriodEnd,
    custom_domain_status: input.domain ? 'pending' : 'none',
  };

  const { data: existing } = await admin
    .from('wedding_sites')
    .select('id')
    .eq('slug', input.slug)
    .maybeSingle();

  let siteId: string;

  if (existing) {
    siteId = (existing as { id: string }).id;
    await admin.from('wedding_sites').update(billing as never).eq('id', siteId);
    // Bereiche/Käufe nicht erneut anlegen (Unique-Index schützt zusätzlich).
    await sendLoginMail(admin, input.email, redirectTo);
    return { ok: true, siteId, userId };
  }

  // --- 2a) Default-Palette + -Font des gewählten Stils auflösen -----------
  // DB-Constraint "palette_source_check" verlangt: ENTWEDER palette_preset_id
  // NOT NULL + alle Custom NULL — ODER palette_preset_id NULL + alle 5 Custom
  // gefüllt. Beim Anlegen gehen wir in den Preset-Modus mit der Default-Palette
  // des Stils; alle palette_custom_* bleiben NULL. font_preset_id wird ebenfalls
  // aus dem Stil-Default gesetzt (Spalte ist NOT NULL).
  const { data: styleRow, error: styleErr } = await admin
    .from('start_styles')
    .select('default_palette_id, default_font_id')
    .eq('id', input.style)
    .maybeSingle();

  if (styleErr || !styleRow) {
    console.error('[provision] start_styles lookup failed for style', input.style, styleErr);
    return { ok: false, error: 'style preset lookup failed' };
  }

  const { default_palette_id, default_font_id } = styleRow as {
    default_palette_id: string;
    default_font_id: string;
  };

  const { data: site, error: siteErr } = await admin
    .from('wedding_sites')
    .insert({
      slug: input.slug,
      couple_name_1: input.name1,
      couple_name_2: input.name2,
      wedding_date: input.weddingDate,
      start_style_id: input.style,
      palette_preset_id: default_palette_id, // Preset-Modus (Custom bleibt NULL)
      font_preset_id: default_font_id,
      status: 'draft',
      ...billing,
    } as never)
    .select('id')
    .single();

  if (siteErr || !site) {
    console.error('[provision] site insert failed:', siteErr);
    return { ok: false, error: 'site insert failed' };
  }
  siteId = (site as { id: string }).id;

  // --- 3) Bereiche anlegen (Standard + gewählte Zusatz) -------------------
  const addonKeys = Array.from(
    new Set(input.addons.map((k) => normalizeAddonKey(k)).filter(Boolean) as string[]),
  );
  const allKeys = [...STANDARD_KEYS, ...ADDON_KEYS.filter((k) => addonKeys.includes(k))];

  const bereicheRows = allKeys.map((key, index) => ({
    wedding_site_id: siteId,
    bereich_key: key,
    variant: 'a',
    display_order: index,
    is_active: true,
    content: {},
    content_draft: {},
    content_published: {},
  }));

  const { error: bErr } = await admin.from('wedding_bereiche').insert(bereicheRows as never);
  if (bErr) console.error('[provision] bereiche insert failed:', bErr);

  // --- 4) Käufe freischalten (Gating in tokens.ts greift hierauf) ---------
  const purchaseRows = allKeys.map((key) => ({
    wedding_site_id: siteId,
    bereich_key: key,
  }));
  const { error: pErr } = await admin.from('wedding_purchases').insert(purchaseRows as never);
  if (pErr) console.error('[provision] purchases insert failed:', pErr);

  // --- 5) Login-Mail senden -----------------------------------------------
  await sendLoginMail(admin, input.email, redirectTo);

  return { ok: true, siteId, userId };
}

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

/**
 * Schickt dem Paar den Magic-Link zum ersten Login.
 *
 * Robust gegen Supabase-SMTP-Ausfälle: Wir erzeugen den Magic-Link über
 * `admin.generateLink()` (löst KEINEN SMTP-Versand auf Supabase-Seite aus,
 * gibt nur den fertigen Link zurück) und stellen die Mail selbst über die
 * Brevo-Transactional-API zu.
 *
 * Voraussetzungen (Vercel-Env):
 *   - BREVO_API_KEY        (hast du bereits für die Waitlist)
 *   - BREVO_SENDER_EMAIL   (z. B. hallo@sarahiver.de — in Brevo verifiziert)
 *   - BREVO_SENDER_NAME    (optional, Default "S&I. Wedding")
 *
 * Wirft nie — Fehler werden geloggt, der Webhook bleibt 200 (sonst würde
 * Stripe den ganzen Event neu zustellen).
 */
async function sendLoginMail(admin: AdminClient, email: string, redirectTo: string): Promise<void> {
  try {
    // 1) Magic-Link erzeugen (kein Mailversand durch Supabase)
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    });
    if (error || !data?.properties?.action_link) {
      console.error('[provision] generateLink failed:', error);
      return;
    }
    const actionLink = data.properties.action_link;

    // 2) Mail über Brevo-Transactional-API zustellen
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'hallo@sarahiver.de';
    const senderName = process.env.BREVO_SENDER_NAME || 'S&I. Wedding';
    if (!apiKey) {
      console.error('[provision] BREVO_API_KEY fehlt — Login-Mail nicht gesendet');
      return;
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        subject: 'Euer Login-Link für eure Hochzeitsseite',
        htmlContent: loginMailHtml(actionLink),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[provision] Brevo send failed:', res.status, detail);
    }
  } catch (err) {
    console.error('[provision] login mail threw:', err);
  }
}

/** Schlichtes, markenkonformes HTML für die Login-Mail. */
function loginMailHtml(link: string): string {
  return `<!DOCTYPE html>
<html lang="de">
  <body style="margin:0;background:#F7F5F1;font-family:Inter,Helvetica,Arial,sans-serif;color:#0F0E0C;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F1;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:16px;padding:40px;">
            <tr>
              <td style="font-family:Georgia,serif;font-size:24px;font-weight:600;padding-bottom:8px;">
                Eure Hochzeitsseite ist startklar
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#5f5b53;padding-bottom:28px;">
                Hallo ihr beiden, schön, dass ihr dabei seid. Über den Button kommt ihr
                direkt in euer Dashboard und könnt loslegen.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:28px;">
                <a href="${link}" style="display:inline-block;background:#0F0E0C;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
                  Zum Dashboard
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:1.6;color:#a39d92;">
                Der Link ist nur für kurze Zeit gültig. Falls ihr ihn nicht angefordert
                habt, könnt ihr diese E-Mail einfach ignorieren.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
