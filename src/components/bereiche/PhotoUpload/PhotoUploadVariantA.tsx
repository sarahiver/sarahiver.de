'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { UPLOAD_DEFAULTS } from './shared';
import { useUpload } from './useUpload';
import { UpHeader, UpSuccess, UpPrivacy, UpError, HiddenFileInput } from './shared-ui';
import { IconUpload, IconX, IconCheck } from './icons';

/**
 * Fotoupload Variante A — Große Drop-Zone mit Upload-Status
 *
 * Drag&Drop-Fläche; nach Auswahl Thumbnails mit Lade-Ring/Check, Namensfeld
 * und „X Fotos hochladen". Erfolg → Danke-Karte. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function PhotoUploadVariantA({ content, weddingSlug }: Props) {
  const eyebrow = (content.eyebrow as string) ?? UPLOAD_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? UPLOAD_DEFAULTS.title;
  const description = (content.description as string) ?? UPLOAD_DEFAULTS.description;
  const successMsg = (content.success_message as string) ?? UPLOAD_DEFAULTS.success_message;
  const successSub = (content.success_sub as string) ?? UPLOAD_DEFAULTS.success_sub;
  const privacy = (content.privacy as string) ?? UPLOAD_DEFAULTS.privacy;

  const u = useUpload(weddingSlug);
  const uploading = u.phase === 'uploading';

  return (
    <div className="up upA-section">
      <UpHeader eyebrow={eyebrow} title={title} description={description} />
      <HiddenFileInput inputRef={u.inputRef} onChange={u.onInputChange} />

      <div className="upA-wrap">
        {u.phase === 'success' ? (
          <UpSuccess message={successMsg} sub={successSub} onReset={u.reset} />
        ) : (
          <>
            <div
              className={`upA-drop ${u.dragging ? 'is-drag' : ''}`}
              role="button"
              tabIndex={0}
              onClick={u.openPicker}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  u.openPicker();
                }
              }}
              onDrop={u.onDrop}
              onDragOver={u.onDragOver}
              onDragLeave={u.onDragLeave}
            >
              <div className="upA-drop-icon">
                <IconUpload />
              </div>
              <h3 className="upA-drop-title">
                Fotos hierher ziehen
                <br />
                <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>
                  oder klicken zum Auswählen
                </span>
              </h3>
              <p className="upA-drop-mono">JPG · PNG · HEIC · WEBP · mehrere möglich</p>
            </div>

            {u.items.length > 0 && (
              <div className="upA-selected">
                <div className="upA-selected-head">
                  <span className="upA-selected-count">
                    <strong>{u.items.length}</strong>
                    {u.items.length === 1 ? 'Foto ausgewählt' : 'Fotos ausgewählt'}
                  </span>
                  {uploading && (
                    <span className="upA-selected-count" style={{ color: 'var(--accent)' }}>
                      {u.doneCount}/{u.items.length} hochgeladen
                    </span>
                  )}
                </div>

                <div className="up-thumbs">
                  {u.items.map((it) => (
                    <div
                      key={it.id}
                      className={`up-thumb ${it.status === 'done' ? 'is-done' : ''}`}
                    >
                      <img src={it.previewUrl} alt="" />
                      {(it.status === 'uploading' || it.status === 'done') && (
                        <div className="upA-thumb-progress">
                          <div className="ring" />
                          <div className="check">
                            <IconCheck />
                          </div>
                        </div>
                      )}
                      {!uploading && (
                        <button
                          type="button"
                          className="up-thumb-remove"
                          aria-label="Entfernen"
                          onClick={() => u.removeItem(it.id)}
                        >
                          <IconX />
                        </button>
                      )}
                      <div className="up-thumb-meta">{it.name}</div>
                    </div>
                  ))}
                </div>

                <div className="upA-field">
                  <label className="up-field-label" htmlFor="upA-name">
                    Euer Name (optional)
                  </label>
                  <input
                    id="upA-name"
                    className="up-input"
                    type="text"
                    placeholder="Damit wir wissen, wer uns dieses Foto schenkt"
                    value={u.guestName}
                    onChange={(e) => u.setGuestName(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                <UpError msg={u.errorMsg} />

                <div className="upA-actions">
                  <UpPrivacy text={privacy} />
                  <button
                    type="button"
                    className="up-btn"
                    onClick={u.startUpload}
                    disabled={uploading}
                  >
                    <IconUpload />
                    <span>
                      {uploading
                        ? 'Wird hochgeladen …'
                        : `${u.items.length} ${u.items.length === 1 ? 'Foto' : 'Fotos'} hochladen`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
