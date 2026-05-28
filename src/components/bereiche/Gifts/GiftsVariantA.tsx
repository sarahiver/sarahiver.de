'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { readConfig, readItems } from './shared';
import { useGifts } from './useGifts';
import {
  GiftHeader,
  IbanCard,
  ReserveButton,
  ReservedTag,
  ReserveModal,
  GiftEmpty,
} from './shared-ui';

/**
 * Geschenke Variante A — Zeilen-Liste mit Reservieren + IBAN-Karte
 *
 * Wunsch-Items als Liste; reservierte ausgegraut + durchgestrichen.
 * Reservieren öffnet Modal mit Namensfeld. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function GiftsVariantA({ content, weddingSlug }: Props) {
  const config = readConfig(content);
  const g = useGifts(readItems(content), weddingSlug);

  return (
    <div className="gift giftA-section">
      <GiftHeader config={config} />

      <div className="giftA-wrap">
        {g.items.length === 0 ? (
          <GiftEmpty ibanEnabled={config.ibanEnabled} />
        ) : (
          <div className="giftA-list">
            {g.items.map((it) => (
              <div key={it.id} className={`giftA-row ${it.reserved ? 'is-reserved' : ''}`}>
                <div className="giftA-body">
                  <div className="giftA-title-row">
                    <h3 className="giftA-title">{it.title}</h3>
                    {it.amount && <span className="gift-amount">{it.amount}</span>}
                  </div>
                  {it.description && <p className="giftA-desc">{it.description}</p>}
                </div>
                <div className="giftA-actions">
                  <ReserveButton item={it} onReserve={g.openFor} />
                  <ReservedTag item={it} />
                </div>
              </div>
            ))}
          </div>
        )}

        <IbanCard config={config} layout="row" />
      </div>

      {g.modalItem && (
        <ReserveModal
          item={g.modalItem}
          guestName={g.guestName}
          setGuestName={g.setGuestName}
          phase={g.phase}
          errorMsg={g.errorMsg}
          canSubmit={g.canSubmit}
          onReserve={g.reserve}
          onClose={g.close}
          successMsg={config.reserveSuccess}
        />
      )}
    </div>
  );
}
