'use client';

import { useState, useCallback } from 'react';
import Decor from '@/components/ui/Decor';
import { renderTitleWithEm, type GiftsConfig, type GiftItem } from './shared';
import { IconCheck, IconCopy, IconX, IconBookmark } from './icons';

export function GiftHeader({ config }: { config: GiftsConfig }) {
  return (
    <div className="gift-head">
      {config.eyebrow && (
        <p className="gift-eyebrow" data-editable="gifts.eyebrow" data-edit-type="text">
          {config.eyebrow}
        </p>
      )}
      <h2
        className="gift-title"
        data-editable="gifts.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(config.title) }}
      />
      <div className="gift-head-decor-wrap">
        <Decor />
      </div>
      {config.description && (
        <p className="gift-desc" data-editable="gifts.description" data-edit-type="text">
          {config.description}
        </p>
      )}
    </div>
  );
}

/**
 * IBAN-Copy-Button mit "Kopiert"-Zustand. navigator.clipboard nur im
 * Callback (client-only), Fallback auf execCommand.
 */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <button
      type="button"
      className={`gift-iban-copy ${copied ? 'is-copied' : ''}`}
      onClick={copy}
    >
      {copied ? <IconCheck /> : <IconCopy />}
      <span>{copied ? 'Kopiert' : 'IBAN kopieren'}</span>
    </button>
  );
}

/**
 * IBAN-Karte. layout='row' (Variante A/C: Karte breit, Copy rechts) oder
 * 'card' (Variante B: als Raster-Kachel, Copy unten).
 */
export function IbanCard({
  config,
  layout = 'row',
}: {
  config: GiftsConfig;
  layout?: 'row' | 'card';
}) {
  if (!config.ibanEnabled || !config.iban) return null;

  if (layout === 'card') {
    return (
      <div className="giftB-iban-card">
        <p className="gift-iban-label">Reisekasse</p>
        <p className="gift-iban-note" data-editable="gifts.iban_note" data-edit-type="text">
          {config.ibanNote}
        </p>
        <span className="gift-iban-num">{config.iban}</span>
        {config.ibanHolder && <span className="gift-iban-holder">Inhaber · {config.ibanHolder}</span>}
        <div style={{ alignSelf: 'flex-start', marginTop: 8 }}>
          <CopyButton value={config.iban} />
        </div>
      </div>
    );
  }

  return (
    <div className="gift-iban">
      <div className="gift-iban-body">
        <p className="gift-iban-label">Reisekasse · Bankverbindung</p>
        <p className="gift-iban-note" data-editable="gifts.iban_note" data-edit-type="text">
          {config.ibanNote}
        </p>
        <span className="gift-iban-num">{config.iban}</span>
        {config.ibanHolder && <span className="gift-iban-holder">Inhaber · {config.ibanHolder}</span>}
      </div>
      <CopyButton value={config.iban} />
    </div>
  );
}

/** Reservieren-Button für eine Zeile/Karte. */
export function ReserveButton({
  item,
  onReserve,
}: {
  item: GiftItem;
  onReserve: (item: GiftItem) => void;
}) {
  if (item.reserved) {
    return (
      <button type="button" className="gift-btn-out" disabled>
        <IconCheck />
        <span>Reserviert</span>
      </button>
    );
  }
  return (
    <button type="button" className="gift-btn-out" onClick={() => onReserve(item)}>
      <IconBookmark />
      <span>Reservieren</span>
    </button>
  );
}

/** "Reserviert von {Name}"-Badge (für A/C). */
export function ReservedTag({ item }: { item: GiftItem }) {
  if (!item.reserved || !item.reserved_by) return null;
  return (
    <span className="gift-reserved-tag">
      <IconLockInline />
      <span>Reserviert von {item.reserved_by}</span>
    </span>
  );
}

function IconLockInline() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

/**
 * Reservieren-Modal. Echtes Overlay (Backdrop-Klick + Escape via Hook).
 * Zeigt nach Erfolg eine Bestätigung.
 */
export function ReserveModal({
  item,
  guestName,
  setGuestName,
  phase,
  errorMsg,
  canSubmit,
  onReserve,
  onClose,
  successMsg,
}: {
  item: GiftItem;
  guestName: string;
  setGuestName: (v: string) => void;
  phase: 'idle' | 'sending' | 'success' | 'error';
  errorMsg: string;
  canSubmit: boolean;
  onReserve: () => void;
  onClose: () => void;
  successMsg: string;
}) {
  const sending = phase === 'sending';
  return (
    <div className="gift-modal-layer" onClick={onClose}>
      <div
        className="gift-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="gift-modal-close" aria-label="Schließen" onClick={onClose}>
          <IconX />
        </button>

        {phase === 'success' ? (
          <>
            <p className="gift-modal-eyebrow">Reserviert</p>
            <h3 className="gift-modal-title">{successMsg}</h3>
            <p className="gift-modal-sub">
              „{item.title}" ist jetzt für euch vermerkt. Danke!
            </p>
            <div className="gift-modal-actions">
              <button type="button" className="gift-btn" onClick={onClose}>
                <IconCheck />
                <span>Schließen</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="gift-modal-eyebrow">Reservieren</p>
            <h3 className="gift-modal-title">„{item.title}" reservieren</h3>
            <p className="gift-modal-sub">
              So vermeiden wir Doppelgeschenke. Euer Name ist nur für uns sichtbar.
            </p>
            <div>
              <label className="gift-field-label" htmlFor="gift-reserve-name">
                Euer Name *
              </label>
              <input
                id="gift-reserve-name"
                className="gift-input"
                type="text"
                placeholder="z.B. Lisa & Tom"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={sending}
              />
            </div>
            {errorMsg && <p className="gift-modal-error">{errorMsg}</p>}
            <div className="gift-modal-actions">
              <button type="button" className="gift-btn-out" onClick={onClose} disabled={sending}>
                Abbrechen
              </button>
              <button
                type="button"
                className="gift-btn"
                onClick={onReserve}
                disabled={!canSubmit || sending}
              >
                <IconCheck />
                <span>{sending ? 'Moment …' : 'Reservieren'}</span>
              </button>
            </div>
            <p className="gift-modal-esc">Esc · Schließen</p>
          </>
        )}
      </div>
    </div>
  );
}

export function GiftEmpty({ ibanEnabled }: { ibanEnabled: boolean }) {
  return (
    <div className="gift-empty">
      <Decor />
      <span>
        {ibanEnabled
          ? 'Wir freuen uns über jeden Beitrag zur Reisekasse.'
          : 'Wir freuen uns einfach, dass ihr da seid.'}
      </span>
    </div>
  );
}
