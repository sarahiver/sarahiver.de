'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { UPLOAD_DEFAULTS, renderTitleWithEm } from './shared';
import { useUpload } from './useUpload';
import { UpHeader, UpSuccess, UpPrivacy, UpError, HiddenFileInput } from './shared-ui';
import { IconUpload, IconLove } from './icons';

/**
 * Fotoupload Variante B — Einladungs-Karte (erzählerisch, ein Button)
 *
 * Warme zentrierte Karte mit Icon, persönlichem Text, gestapelten runden
 * Mini-Thumbs + Zähler-Pill, Namensfeld und einem Button. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

const CARD_TITLE = 'Habt ihr ein <em>schönes Foto</em> mit uns?';
const CARD_SUB = 'Wir sammeln liebste Erinnerungen für eine Überraschung am großen Tag.';

export default function PhotoUploadVariantB({ content, weddingSlug }: Props) {
  const eyebrow = (content.eyebrow as string) ?? UPLOAD_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? UPLOAD_DEFAULTS.title;
  const description = (content.description as string) ?? UPLOAD_DEFAULTS.description;
  const successMsg = (content.success_message as string) ?? UPLOAD_DEFAULTS.success_message;
  const successSub = (content.success_sub as string) ?? UPLOAD_DEFAULTS.success_sub;
  const privacy = (content.privacy as string) ?? UPLOAD_DEFAULTS.privacy;

  const u = useUpload(weddingSlug);
  const uploading = u.phase === 'uploading';
  const previews = u.items.slice(0, 3);
  const extra = u.items.length - previews.length;

  return (
    <div className="up upB-section">
      <UpHeader eyebrow={eyebrow} title={title} description={description} />
      <HiddenFileInput inputRef={u.inputRef} onChange={u.onInputChange} />

      <div className="upB-wrap">
        {u.phase === 'success' ? (
          <UpSuccess message={successMsg} sub={successSub} onReset={u.reset} />
        ) : (
          <div
            className="upB-card"
            onDrop={u.onDrop}
            onDragOver={u.onDragOver}
            onDragLeave={u.onDragLeave}
          >
            <div className="upB-icon">
              <IconLove />
            </div>
            <h3
              className="upB-title"
              dangerouslySetInnerHTML={{ __html: renderTitleWithEm(CARD_TITLE) }}
            />
            <p className="upB-sub">{CARD_SUB}</p>

            {u.items.length > 0 && (
              <div className="upB-thumbs">
                {previews.map((it) => (
                  <div key={it.id} className="upB-thumb-mini">
                    <img src={it.previewUrl} alt="" />
                  </div>
                ))}
                {extra > 0 && <div className="upB-count-pill">+{extra}</div>}
              </div>
            )}

            <div className="upB-name">
              <input
                className="up-input"
                type="text"
                placeholder="Euer Name (optional)"
                value={u.guestName}
                onChange={(e) => u.setGuestName(e.target.value)}
                disabled={uploading}
              />
            </div>

            <UpError msg={u.errorMsg} />

            <div className="upB-actions">
              {u.items.length === 0 ? (
                <button type="button" className="up-btn" onClick={u.openPicker}>
                  <IconUpload />
                  <span>Fotos auswählen</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="up-btn"
                  onClick={u.startUpload}
                  disabled={uploading}
                >
                  <IconUpload />
                  <span>
                    {uploading
                      ? `${u.doneCount}/${u.items.length} hochgeladen …`
                      : `${u.items.length} ${u.items.length === 1 ? 'Foto' : 'Fotos'} hochladen`}
                  </span>
                </button>
              )}
              <UpPrivacy text={privacy} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
