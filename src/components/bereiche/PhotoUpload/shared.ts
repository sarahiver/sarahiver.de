/**
 * Fotoupload (PhotoUpload) — geteilte Typen, Config und Upload-Service.
 *
 * Use-Case (WICHTIG): Gäste teilen VOR der Hochzeit private Fotos fürs
 * Brautpaar (Diashow-Material). Die Bilder werden NIEMALS im Frontend
 * angezeigt — kein Feed, keine Galerie, keine Wall. Sie gehen direkt und
 * ausschließlich ans Brautpaar (Cloudinary + optionaler Supabase-Record
 * fürs Dashboard).
 *
 * content-Schema:
 *   eyebrow?:          string
 *   title?:            string  (em-Tags erlaubt)
 *   description?:      string
 *   success_message?:  string
 *   success_sub?:      string
 *   privacy?:          string
 */

export interface UploadContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  success_message?: string;
  success_sub?: string;
  privacy?: string;
}

export const UPLOAD_DEFAULTS = {
  eyebrow: 'Ein kleiner Wunsch',
  title: 'Teilt eure <em>Erinnerungen</em>',
  description:
    'Habt ihr ein schönes Foto mit uns? Wir sammeln eure liebsten gemeinsamen Momente für eine Überraschung am großen Tag — ganz privat, nur für uns.',
  success_message: 'Danke! Eure Fotos sind bei uns angekommen.',
  success_sub: 'Wir freuen uns riesig — bis bald.',
  privacy: 'Eure Fotos sind nur für das Brautpaar sichtbar.',
} as const;

export const ACCEPTED_TYPES = 'image/jpeg,image/png,image/heic,image/heif,image/webp';
export const MAX_FILE_MB = 25;

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  file: File;
  previewUrl: string; // ObjectURL (client-only)
  name: string;
  sizeLabel: string;
  status: UploadStatus;
  progress: number; // 0..100
}

export function renderTitleWithEm(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let idCounter = 0;
export function makeUploadItem(file: File): UploadItem {
  idCounter += 1;
  return {
    id: `up-${Date.now()}-${idCounter}`,
    file,
    previewUrl: URL.createObjectURL(file),
    name: file.name,
    sizeLabel: formatSize(file.size),
    status: 'pending',
    progress: 0,
  };
}

/**
 * Filtert eine FileList auf akzeptierte Bilder unterhalb der Größengrenze.
 */
export function acceptFiles(files: FileList | File[]): File[] {
  const arr = Array.from(files);
  return arr.filter(
    (f) => f.type.startsWith('image/') && f.size <= MAX_FILE_MB * 1024 * 1024,
  );
}

/**
 * Cloudinary-Konfiguration aus public Env-Vars (unsigned upload preset).
 * Fehlt sie, läuft der Upload im Demo-Modus (simulierter Fortschritt,
 * kein echter Netzwerk-Call) — so bleibt die Komponente überall lauffähig.
 */
function cloudinaryConfig(): { cloudName: string; preset: string } | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (cloudName && preset) return { cloudName, preset };
  return null;
}

export interface UploadResult {
  ok: boolean;
  secureUrl?: string;
  publicId?: string;
  error?: string;
}

/**
 * Lädt eine einzelne Datei hoch. Echter Cloudinary-Upload wenn konfiguriert,
 * sonst simulierter Fortschritt (Demo-Modus). onProgress liefert 0..100.
 *
 * Metadaten: guestName + weddingSlug werden als context/tags mitgegeben,
 * damit das Brautpaar im Dashboard sieht, von wem das Foto stammt.
 */
export function uploadFile(
  file: File,
  opts: { guestName?: string; weddingSlug?: string },
  onProgress: (pct: number) => void,
): Promise<UploadResult> {
  const cfg = cloudinaryConfig();

  // Demo-Modus: kein Cloudinary konfiguriert
  if (!cfg) {
    return new Promise((resolve) => {
      let pct = 0;
      const tick = () => {
        pct += 12 + Math.round(Math.random() * 16);
        if (pct >= 100) {
          onProgress(100);
          // eslint-disable-next-line no-console
          console.log('[PhotoUpload demo]', {
            file: file.name,
            guestName: opts.guestName || '(anonym)',
            weddingSlug: opts.weddingSlug,
          });
          resolve({ ok: true, secureUrl: '', publicId: '' });
        } else {
          onProgress(pct);
          window.setTimeout(tick, 180);
        }
      };
      window.setTimeout(tick, 180);
    });
  }

  // Echter Cloudinary-Upload via XHR (für Fortschritts-Events)
  return new Promise((resolve) => {
    const url = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`;
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', cfg.preset);
    if (opts.weddingSlug) {
      form.append('folder', `guest-uploads/${opts.weddingSlug}`);
      form.append('tags', `guest-upload,${opts.weddingSlug}`);
    } else {
      form.append('tags', 'guest-upload');
    }
    if (opts.guestName) {
      form.append('context', `guest=${opts.guestName.replace(/[|=]/g, ' ')}`);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          onProgress(100);
          resolve({ ok: true, secureUrl: res.secure_url, publicId: res.public_id });
        } catch {
          resolve({ ok: false, error: 'Antwort konnte nicht gelesen werden.' });
        }
      } else {
        resolve({ ok: false, error: `Upload fehlgeschlagen (${xhr.status}).` });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: 'Netzwerkfehler beim Upload.' });
    xhr.send(form);
  });
}
