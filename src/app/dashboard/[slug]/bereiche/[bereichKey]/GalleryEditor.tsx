'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { updateBereichContent } from './actions';
import HighlightInput from '@/components/dashboard/HighlightInput';
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';
import { getCloudinaryClientConfig } from '@/lib/cloudinary';

interface GalleryImageInput {
  id: string;
  src: string;
  alt: string;
  caption: string;
  orientation: 'portrait' | 'landscape' | 'square';
}

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    intro: string;
    images: GalleryImageInput[];
  };
}

/**
 * Galerie-Editor.
 *
 * Bulk-Upload: Multi-Select-File-Picker, parallel hochladen, danach
 * Alt-Text / Caption / Orientierung pro Bild pflegen.
 */

export default function GalleryEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    intro: initial.intro,
  });
  const [images, setImages] = useState<GalleryImageInput[]>(initial.images);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const folder = `sarahiver.de/${slug}/gallery`;

  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  const saveContent = useCallback((patch: Record<string, unknown>) => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'gallery',
        contentPatch: patch,
      });
      if (res.ok) {
        setStatus('ok');
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
      } else {
        setStatus('err');
        setErrText(res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  }, [slug, router]);

  const saveText = useCallback(() => saveContent(textRef.current), [saveContent]);
  const saveImages = useCallback((next: GalleryImageInput[]) => saveContent({ images: next }), [saveContent]);

  const debounceRef = useRef<number | null>(null);
  const updateText = (patch: Partial<typeof text>) => {
    setText((t) => ({ ...t, ...patch }));
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(saveText, 1500);
  };
  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  const onText = (field: keyof typeof text) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateText({ [field]: e.target.value } as Partial<typeof text>);

  const debounceImgRef = useRef<number | null>(null);
  const updateImage = (id: string, patch: Partial<GalleryImageInput>) => {
    const next = images.map((img) => (img.id === id ? { ...img, ...patch } : img));
    setImages(next);
    if (debounceImgRef.current) window.clearTimeout(debounceImgRef.current);
    debounceImgRef.current = window.setTimeout(() => saveImages(next), 1500);
  };

  const deleteImage = (id: string) => {
    if (!window.confirm('Bild wirklich aus der Galerie entfernen?')) return;
    const next = images.filter((img) => img.id !== id);
    setImages(next);
    saveImages(next);
  };

  const moveImage = (id: string, dir: -1 | 1) => {
    const idx = images.findIndex((img) => img.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= images.length) return;
    const next = [...images];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setImages(next);
    saveImages(next);
  };

  // ====================================================================
  // Bulk-Upload
  // ====================================================================

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setUploadProgress({ current: 0, total: files.length });
    const uploaded: GalleryImageInput[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i, total: files.length });
      try {
        const url = await uploadToCloudinary(file, folder);
        // Orientierung schätzen via Bildgröße
        const orient = await guessOrientation(url);
        uploaded.push({
          id: `g-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
          src: url,
          alt: '',
          caption: '',
          orientation: orient,
        });
      } catch (err) {
        console.warn('[GalleryEditor] upload failed for', file.name, err);
        setErrText(`Upload von „${file.name}“ fehlgeschlagen.`);
        setStatus('err');
      }
    }

    setUploadProgress(null);
    if (uploaded.length > 0) {
      const next = [...images, ...uploaded];
      setImages(next);
      saveImages(next);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => () => {
    if (debounceImgRef.current) window.clearTimeout(debounceImgRef.current);
  }, []);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-field">
          <label className="dash-form-label">Eyebrow</label>
          <input className="dash-input" value={text.eyebrow} onChange={onText('eyebrow')} placeholder="Momente" />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText({ title: v })}
          placeholder="Bilder unserer [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Intro (optional)</label>
          <textarea className="dash-input" rows={2} value={text.intro} onChange={onText('intro')} placeholder="Ein paar Bilder von uns …" />
        </div>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Bilder ({images.length})</h3>
            <p className="dash-form-section-desc">
              Mehrere Bilder gleichzeitig hochladen. Reihenfolge und Captions danach pflegen.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: 'none' }}
              disabled={uploadProgress !== null}
            />
            <button
              type="button"
              className="dash-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProgress !== null}
            >
              <DashboardIcon name="plus" size={14} />
              <span>{uploadProgress ? `Lädt … (${uploadProgress.current + 1}/${uploadProgress.total})` : 'Bilder hochladen'}</span>
            </button>
          </div>
        </div>

        {images.length === 0 && !uploadProgress && (
          <div className="dash-empty-inline">
            <p>Noch keine Bilder. Klickt auf „Bilder hochladen“, um mehrere gleichzeitig hinzuzufügen.</p>
          </div>
        )}

        <div className="dash-gallery-grid">
          {images.map((img, idx) => (
            <div key={img.id} className="dash-gallery-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className="dash-gallery-thumb" />
              <div className="dash-gallery-card-body">
                <div className="dash-form-field">
                  <label className="dash-form-label">Alt-Text</label>
                  <input
                    className="dash-input"
                    value={img.alt}
                    onChange={(e) => updateImage(img.id, { alt: e.target.value })}
                    placeholder="Sarah lacht im Sonnenuntergang"
                  />
                </div>
                <div className="dash-form-field">
                  <label className="dash-form-label">Bildunterschrift (optional)</label>
                  <input
                    className="dash-input"
                    value={img.caption}
                    onChange={(e) => updateImage(img.id, { caption: e.target.value })}
                    placeholder="Hamburg, Sommer 2024"
                  />
                </div>
                <div className="dash-form-field">
                  <label className="dash-form-label">Orientierung (für Storyboard-Layout)</label>
                  <select
                    className="dash-input"
                    value={img.orientation}
                    onChange={(e) => updateImage(img.id, { orientation: e.target.value as 'portrait' | 'landscape' | 'square' })}
                  >
                    <option value="landscape">Querformat</option>
                    <option value="portrait">Hochformat</option>
                    <option value="square">Quadratisch</option>
                  </select>
                </div>
                <div className="dash-gallery-card-actions">
                  <button type="button" className="dash-icon-btn" onClick={() => moveImage(img.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="dash-icon-btn" onClick={() => moveImage(img.id, 1)} disabled={idx === images.length - 1}>↓</button>
                  <button type="button" className="dash-icon-btn is-danger" onClick={() => deleteImage(img.id)} title="Löschen">
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ====================================================================
// Cloudinary-Upload (direkt aus Browser, unsigned mit Upload-Preset)
// ====================================================================

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const cfg = getCloudinaryClientConfig();
  if (!cfg.configured) throw new Error('Cloudinary nicht konfiguriert');

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', cfg.uploadPreset);
  form.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = await res.json();
  return data.secure_url as string;
}

async function guessOrientation(url: string): Promise<'portrait' | 'landscape' | 'square'> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width > img.height * 1.1) resolve('landscape');
      else if (img.height > img.width * 1.1) resolve('portrait');
      else resolve('square');
    };
    img.onerror = () => resolve('landscape');
    img.src = url;
  });
}
