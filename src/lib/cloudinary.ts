/**
 * Cloudinary-Helpers für sarahiver.de.
 *
 * Wir nutzen:
 *  - Unsigned-Upload via Browser direkt zu api.cloudinary.com
 *    (kein Server-Code im Upload-Pfad, kein API-Secret im Client)
 *  - Signed Delete via Server Action (mit CLOUDINARY_API_SECRET)
 *
 * ENV-Vars:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME       (Public — wird im Client gebraucht)
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET    (Public — Preset-Name, Unsigned)
 *   CLOUDINARY_API_SECRET                   (Private — nur Server, für Delete)
 *   CLOUDINARY_API_KEY                      (Private — nur Server, für Delete)
 */

export interface CloudinaryClientConfig {
  cloudName: string;
  uploadPreset: string;
  configured: boolean;
}

export function getCloudinaryClientConfig(): CloudinaryClientConfig {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  return {
    cloudName,
    uploadPreset,
    configured: Boolean(cloudName && uploadPreset),
  };
}

/**
 * Extrahiert die public_id aus einer Cloudinary-secure_url.
 *
 * Beispiel:
 *   https://res.cloudinary.com/si-weddings/image/upload/v1770992769/weddings/demo-a/hero/abc123.jpg
 *   → "weddings/demo-a/hero/abc123"
 *
 * Returnt null wenn die URL keine Cloudinary-URL ist.
 */
export function extractPublicId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes('cloudinary.com')) return null;

    // Pfad-Struktur: /<cloudname>/image/upload[/transform][/v123]/path/to/file.ext
    const parts = u.pathname.split('/').filter(Boolean);
    // Index des Segments "upload" finden
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return null;

    // Alles nach "upload" — kann Transform-Segmente (z.B. "w_300,h_300")
    // und Versionspräfix "v123" enthalten, beides überspringen.
    let rest = parts.slice(uploadIdx + 1);

    // Transform-Segmente erkennen am Kommata/Underscore-Muster (z.B. "w_300,h_300", "c_fill,g_auto")
    while (rest.length > 0 && /^[a-z]_[^/]+/i.test(rest[0])) {
      rest = rest.slice(1);
    }

    // Versions-Präfix überspringen (immer direkt vor public_id, falls da)
    if (rest[0]?.match(/^v\d+$/)) {
      rest = rest.slice(1);
    }
    if (rest.length === 0) return null;

    // letzten Pfad-Eintrag von Datei-Endung befreien
    const last = rest[rest.length - 1];
    const lastWithoutExt = last.replace(/\.[a-z0-9]+$/i, '');
    rest[rest.length - 1] = lastWithoutExt;

    return rest.join('/');
  } catch {
    return null;
  }
}
