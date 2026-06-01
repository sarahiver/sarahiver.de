/**
 * Server-Only Cloudinary-Helpers für signed Operations (vor allem Delete).
 *
 * NICHT in Client-Code importieren — würde den Build sprengen, weil
 * CLOUDINARY_API_SECRET nur server-side existiert.
 */

import { createHash } from 'node:crypto';
import { extractPublicId } from './cloudinary';

interface DeleteConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function getServerConfig(): DeleteConfig | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

/**
 * Löscht ein Bild aus Cloudinary anhand seiner public_id oder Cloudinary-URL.
 *
 * Fail-safe: Wenn API-Secret/Key fehlen → loggt Warnung, returnt false,
 * wirft KEINEN Fehler. Bilder als Leichen sind ein kleineres Problem als
 * eine fehlschlagende Update-Operation auf dem User-Pfad.
 */
export async function deleteCloudinaryImage(urlOrPublicId: string | null | undefined): Promise<boolean> {
  if (!urlOrPublicId) return false;

  const config = getServerConfig();
  if (!config) {
    console.warn('[deleteCloudinaryImage] CLOUDINARY_API_KEY/SECRET nicht gesetzt — Cleanup übersprungen.');
    return false;
  }

  // public_id ermitteln: entweder direkt übergeben oder aus URL extrahieren
  const publicId = urlOrPublicId.startsWith('http')
    ? extractPublicId(urlOrPublicId)
    : urlOrPublicId;

  if (!publicId) {
    console.warn('[deleteCloudinaryImage] Konnte public_id nicht ermitteln:', urlOrPublicId);
    return false;
  }

  try {
    // Cloudinary Signed Delete: SHA1(public_id=...&timestamp=...&{API_SECRET})
    const timestamp = Math.round(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
    const signature = createHash('sha1').update(stringToSign).digest('hex');

    const form = new URLSearchParams();
    form.append('public_id', publicId);
    form.append('timestamp', String(timestamp));
    form.append('api_key', config.apiKey);
    form.append('signature', signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      },
    );

    const data = (await res.json()) as { result?: string };
    if (data.result === 'ok' || data.result === 'not found') {
      // "not found" ist okay — Bild ist schon weg, Ziel erreicht
      return true;
    }
    console.warn('[deleteCloudinaryImage] Cloudinary antwortete unerwartet:', data);
    return false;
  } catch (err) {
    console.error('[deleteCloudinaryImage] Request fehlgeschlagen:', err);
    return false;
  }
}
