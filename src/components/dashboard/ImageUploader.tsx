'use client';

import {
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import DashboardIcon from './DashboardIcon';
import { getCloudinaryClientConfig } from '@/lib/cloudinary';

/**
 * Wiederverwendbare Bild-Upload-Komponente fürs Dashboard.
 *
 * Pattern:
 *   - Drop-Zone oder Click-to-Upload
 *   - Direkter unsigned Upload zu Cloudinary (XHR mit Progress)
 *   - Vorschau mit Overlay (Ändern / Entfernen)
 *
 * Aufruf:
 *   <ImageUploader
 *     image={currentUrl}
 *     folder={`sarahiver.de/${slug}/hero`}
 *     ratio="16/9"
 *     label="Hero-Bild"
 *     onUpload={(url) => ...}    // url = neue Cloudinary-secure_url, oder null beim Entfernen
 *   />
 */

interface Props {
  /** Aktuelle Bild-URL (oder null wenn noch kein Bild). */
  image: string | null | undefined;
  /** Cloudinary-Folder, z.B. "sarahiver.de/sarah-iver-demo-a/hero". */
  folder: string;
  /** Aspect-Ratio als CSS-Property (z.B. "16/9", "4/5", "1/1"). */
  ratio?: string;
  /** Label über der Drop-Zone. */
  label?: string;
  /** Max-Height in Pixel (optional, sonst nur ratio). */
  maxHeight?: number;
  /** Callback: neue URL nach Upload, null bei Entfernen. */
  onUpload: (url: string | null) => void;
}

export default function ImageUploader({
  image,
  folder,
  ratio = '16/9',
  label,
  maxHeight,
  onUpload,
}: Props) {
  const { cloudName, uploadPreset, configured } = getCloudinaryClientConfig();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = (file: File) => {
    if (!configured) {
      setError('Cloudinary ist nicht konfiguriert. Bitte ENV-Vars prüfen.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Bitte eine Bilddatei wählen (JPG, PNG, WebP …).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Datei zu groß (max 20 MB).');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
      formData.append('asset_folder', folder);
    }

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      setUploading(false);
      setProgress(0);
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            onUpload(data.secure_url);
            return;
          }
        } catch {
          // fallthrough
        }
      }
      setError('Upload fehlgeschlagen. Bitte erneut versuchen.');
      console.error('[ImageUploader] upload failed:', xhr.status, xhr.responseText);
    };
    xhr.onerror = () => {
      setUploading(false);
      setProgress(0);
      setError('Netzwerkfehler beim Upload.');
    };

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.send(formData);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) upload(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = ''; // Reset, damit dieselbe Datei nochmal hochladbar
  };

  const onRemove = (e: MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bild wirklich entfernen?')) return;
    onUpload(null);
  };

  const aspectStyle: CSSProperties = maxHeight
    ? { maxHeight: `${maxHeight}px`, height: `${maxHeight}px` }
    : { aspectRatio: ratio };

  return (
    <div className="dash-uploader">
      {label && <label className="dash-form-label">{label}</label>}

      <div
        className={`dash-uploader-zone ${dragging ? 'is-dragging' : ''} ${image ? 'has-image' : ''}`}
        style={{
          ...aspectStyle,
          ...(image ? { backgroundImage: `url(${image})` } : {}),
        }}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {image ? (
          <div className="dash-uploader-overlay">
            <button type="button" className="dash-uploader-btn" disabled={uploading}>
              <DashboardIcon name="upload" size={14} />
              <span>Ändern</span>
            </button>
            <button
              type="button"
              className="dash-uploader-btn is-danger"
              onClick={onRemove}
              disabled={uploading}
            >
              <DashboardIcon name="trash" size={14} />
              <span>Entfernen</span>
            </button>
          </div>
        ) : (
          <div className="dash-uploader-placeholder">
            <DashboardIcon name="image" size={28} />
            <p>
              {configured ? (
                <>
                  Bild hier ablegen oder <strong>klicken zum Auswählen</strong>
                </>
              ) : (
                'Cloudinary nicht konfiguriert'
              )}
            </p>
            <p className="dash-uploader-hint">JPG, PNG, WebP — bis 20 MB</p>
          </div>
        )}

        {uploading && (
          <div className="dash-uploader-progress">
            <div className="dash-uploader-progress-bar" style={{ width: `${progress}%` }} />
            <span className="dash-uploader-progress-label">{progress}%</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          style={{ display: 'none' }}
        />
      </div>

      {error && <p className="dash-form-msg is-err" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
