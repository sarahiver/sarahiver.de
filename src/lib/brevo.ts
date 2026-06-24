/**
 * Brevo-Transactional-Mailer (server-only).
 *
 * Eine einzige Stelle für den Versand über die Brevo-API, damit Cron, Kontakt
 * und ggf. weitere Stellen denselben Sender + dasselbe HTML-Gerüst nutzen.
 * Bestehende Stellen (login/actions.ts, provision.ts) bleiben unangetastet —
 * dieser Helper ist additiv.
 *
 * Env: BREVO_API_KEY, BREVO_SENDER_EMAIL (verifiziert), BREVO_SENDER_NAME (opt.).
 * Wirft nie — Fehler werden geloggt und als false zurückgegeben.
 */

export interface BrevoMail {
  to: string;
  subject: string;
  htmlContent: string;
  /** Optional: Antworten landen hier (z. B. beim Kontaktformular die User-Mail). */
  replyTo?: { email: string; name?: string };
  /** Optional override des Empfänger-Senders (Default aus Env). */
  senderEmail?: string;
  senderName?: string;
}

export async function sendBrevoMail(mail: BrevoMail): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = mail.senderEmail || process.env.BREVO_SENDER_EMAIL || 'hallo@sarahiver.de';
  const senderName = mail.senderName || process.env.BREVO_SENDER_NAME || 'S&I. Wedding';

  if (!apiKey) {
    console.error('[brevo] BREVO_API_KEY fehlt — Mail nicht gesendet:', mail.subject);
    return false;
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: mail.to }],
        ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
        subject: mail.subject,
        htmlContent: mail.htmlContent,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[brevo] send failed:', res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[brevo] send threw:', err);
    return false;
  }
}

/**
 * Schlichtes, markenkonformes HTML-Gerüst (gleiche Optik wie die Auth-/Login-Mails).
 * `button` ist optional — ohne Button rendert nur Heading + Body + Footnote.
 */
export function mailShell(opts: {
  heading: string;
  bodyHtml: string;
  button?: { label: string; href: string };
  footnoteHtml?: string;
}): string {
  const { heading, bodyHtml, button, footnoteHtml } = opts;
  return `<!DOCTYPE html>
<html lang="de">
  <body style="margin:0;background:#F7F5F1;font-family:Inter,Helvetica,Arial,sans-serif;color:#0F0E0C;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F1;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:16px;padding:40px;">
            <tr>
              <td style="font-family:Georgia,serif;font-size:24px;font-weight:600;padding-bottom:8px;">
                ${heading}
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#5f5b53;padding-bottom:28px;">
                ${bodyHtml}
              </td>
            </tr>
            ${
              button
                ? `<tr>
              <td style="padding-bottom:28px;">
                <a href="${button.href}" style="display:inline-block;background:#0F0E0C;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
                  ${button.label}
                </a>
              </td>
            </tr>`
                : ''
            }
            <tr>
              <td style="font-size:12px;line-height:1.6;color:#a39d92;">
                ${
                  footnoteHtml ||
                  'Fragen zur Abrechnung oder zu eurer Seite? Antwortet einfach auf diese Mail oder schreibt uns über das Kontaktformular auf sarahiver.de.'
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
