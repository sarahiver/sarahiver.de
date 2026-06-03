'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { UPLOAD_DEFAULTS, renderTitleWithEm } from './shared';
import { useUpload } from './useUpload';
import { UpHeader, UpSuccess, UpPrivacy, UpError, HiddenFileInput } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';
import { IconUpload, IconX } from './icons';

/**
 * Fotoupload Variante C — Zweispaltig: Anleitung links, Upload rechts
 *
 * Links 1-2-3-Schritte (warum/wie/wann), rechts kompakte Upload-Box mit
 * Mini-Drop-Zone, Listen-Rows je Datei, Namensfeld, Button. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

const KICKER = 'Für unsere Diashow';
const HEADLINE = 'Drei Schritte zu eurer <em>schönsten</em> Erinnerung';
const STEPS = [
  {
    t: 'Sucht eure liebsten Fotos mit uns',
    d: 'Alte Schnappschüsse, gemeinsame Reisen, peinliche Momente — alles ist willkommen.',
  },
  {
    t: 'Ladet sie hier hoch — ganz privat',
    d: 'Ein Klick reicht. Mehrere Dateien auf einmal sind kein Problem.',
  },
  {
    t: 'Wir überraschen euch am großen Tag',
    d: 'Aus euren Fotos basteln wir eine kleine Diashow für die Feier.',
  },
];

export default function PhotoUploadVariantC({ tokens, content, weddingSlug }: Props) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? UPLOAD_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? UPLOAD_DEFAULTS.title;
  const description = (content.description as string) ?? UPLOAD_DEFAULTS.description;
  const successMsg = (content.success_message as string) ?? UPLOAD_DEFAULTS.success_message;
  const successSub = (content.success_sub as string) ?? UPLOAD_DEFAULTS.success_sub;
  const privacy = (content.privacy as string) ?? UPLOAD_DEFAULTS.privacy;

  const u = useUpload(weddingSlug);
  const uploading = u.phase === 'uploading';

  return (
    <div className="up upC-section" data-style-upload={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <UpHeader eyebrow={eyebrow} title={title} description={description} />
      <HiddenFileInput inputRef={u.inputRef} onChange={u.onInputChange} />

      <div className="upC-wrap">
        <div className="upC-grid">
          <div className="upC-left">
            <p className="upC-kicker">{KICKER}</p>
            <h3
              className="upC-h"
              dangerouslySetInnerHTML={{ __html: renderTitleWithEm(HEADLINE) }}
            />
            <ul className="upC-steps">
              {STEPS.map((s, i) => (
                <li key={i} className="upC-step">
                  <span className="upC-step-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="upC-step-body">
                    <h4 className="upC-step-title">{s.t}</h4>
                    <p className="upC-step-desc">{s.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="upC-right">
            {u.phase === 'success' ? (
              <UpSuccess message={successMsg} sub={successSub} onReset={u.reset} />
            ) : (
              <div
                className="upC-box"
                onDrop={u.onDrop}
                onDragOver={u.onDragOver}
                onDragLeave={u.onDragLeave}
              >
                <div
                  className={`upC-mini-drop ${u.dragging ? 'is-drag' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={u.openPicker}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      u.openPicker();
                    }
                  }}
                >
                  <div className="upC-mini-drop-icon">
                    <IconUpload />
                  </div>
                  <h4 className="upC-mini-drop-title">Fotos hierher ziehen oder auswählen</h4>
                  <p className="upC-mini-drop-sub">JPG · PNG · HEIC · WEBP</p>
                </div>

                {u.items.length > 0 && (
                  <div className="upC-selected-list">
                    {u.items.map((it) => (
                      <div key={it.id} className="upC-selected-row">
                        <div className="upC-mini-thumb">
                          <img src={it.previewUrl} alt="" />
                        </div>
                        <div className="upC-selected-info">
                          <span className="upC-selected-name">{it.name}</span>
                          <span className="upC-selected-size">
                            {it.sizeLabel}
                            {it.status === 'done'
                              ? ' · hochgeladen'
                              : it.status === 'uploading'
                                ? ' · lädt…'
                                : it.status === 'error'
                                  ? ' · Fehler'
                                  : ''}
                          </span>
                        </div>
                        {!uploading && (
                          <button
                            type="button"
                            className="upC-remove"
                            aria-label="Entfernen"
                            onClick={() => u.removeItem(it.id)}
                          >
                            <IconX />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="up-field-label" htmlFor="upC-name">
                    Euer Name (optional)
                  </label>
                  <input
                    id="upC-name"
                    className="up-input"
                    type="text"
                    placeholder="z.B. Anna & Tim"
                    value={u.guestName}
                    onChange={(e) => u.setGuestName(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                <UpError msg={u.errorMsg} />

                <button
                  type="button"
                  className="up-btn"
                  style={{ width: '100%' }}
                  onClick={u.items.length === 0 ? u.openPicker : u.startUpload}
                  disabled={uploading}
                >
                  <IconUpload />
                  <span>
                    {u.items.length === 0
                      ? 'Fotos auswählen'
                      : uploading
                        ? `${u.doneCount}/${u.items.length} hochgeladen …`
                        : `${u.items.length} ${u.items.length === 1 ? 'Foto' : 'Fotos'} hochladen`}
                  </span>
                </button>

                <UpPrivacy text={privacy} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
