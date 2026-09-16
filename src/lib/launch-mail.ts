import { LAUNCH_DATE_LABEL } from './launch';

/**
 * Bestätigungsmail für die Launch-Liste (Double Opt-In, Schritt 1).
 *
 * Gleicher Weg wie die Login-Mail in lib/provision.ts: Brevo-Transactional-API,
 * dieselben Envs (BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME).
 * Wirft nie — Fehler werden geloggt, damit ein Mailproblem nicht den ganzen
 * Anmeldevorgang mit einem Serverfehler beendet.
 */
export async function sendLaunchConfirmationMail(
  email: string,
  token: string,
): Promise<void> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de';
    const link = `${appUrl}/launch/bestaetigt?token=${encodeURIComponent(token)}`;

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'hallo@sarahiver.de';
    const senderName = process.env.BREVO_SENDER_NAME || 'sarahiver.de';

    if (!apiKey) {
      console.error('[launch-mail] BREVO_API_KEY fehlt — Bestätigungsmail nicht gesendet');
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
        subject: 'Bitte bestätigt eure Anmeldung',
        htmlContent: confirmationHtml(link),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[launch-mail] Brevo send failed:', res.status, detail);
    }
  } catch (err) {
    console.error('[launch-mail] threw:', err);
  }
}

function confirmationHtml(link: string): string {
  return `<!DOCTYPE html>
<html lang="de">
  <body style="margin:0;background:#F7F4ED;font-family:Inter,Helvetica,Arial,sans-serif;color:#1A1714;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4ED;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:14px;padding:40px;">
            <tr>
              <td style="font-family:Georgia,serif;font-size:24px;padding-bottom:10px;">
                Nur noch ein Klick
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#6E665B;padding-bottom:26px;">
                Ihr möchtet erfahren, wann sarahiver.de startet. Bestätigt dafür bitte kurz
                eure E-Mail-Adresse — danach hört ihr erst wieder zum Start am
                ${LAUNCH_DATE_LABEL} von uns.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:26px;">
                <a href="${link}" style="display:inline-block;background:#1A1206;background-color:#E0BC5C;color:#1A1206;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:999px;">
                  Anmeldung bestätigen
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:1.6;color:#A39D92;">
                Falls ihr euch nicht angemeldet habt, ignoriert diese E-Mail einfach — ohne
                Bestätigung schreiben wir euch nicht.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
