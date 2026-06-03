'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { readConfig, readItems } from './shared';
import { useGifts } from './useGifts';
import { GiftHeader, IbanCard, ReserveButton, ReserveModal, GiftEmpty } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Geschenke Variante B — Karten mit Bild
 *
 * Items als Karten mit optionalem Bild (Graustufen wenn reserviert).
 * IBAN als eigene Kachel im Raster. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function GiftsVariantB({ tokens, content, weddingSlug }: Props) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const config = readConfig(content);
  const g = useGifts(readItems(content), weddingSlug);

  return (
    <div className="gift giftB-section" data-style-gift={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <GiftHeader config={config} />

      <div className="giftB-wrap">
        {g.items.length === 0 ? (
          <GiftEmpty ibanEnabled={config.ibanEnabled} />
        ) : (
          <div className="giftB-grid">
            {g.items.map((it) => (
              <article key={it.id} className={`giftB-card ${it.reserved ? 'is-reserved' : ''}`}>
                <div className="giftB-img">
                  {it.image ? (
                    <img src={it.image} alt="" />
                  ) : (
                    <div className="giftB-img-placeholder">Bild folgt</div>
                  )}
                </div>
                <div className="giftB-body">
                  <h3 className="giftB-title">{it.title}</h3>
                  {it.description && <p className="giftB-desc">{it.description}</p>}
                  {it.reserved && it.reserved_by && (
                    <span className="giftB-reserved-by">Reserviert von {it.reserved_by}</span>
                  )}
                  <div className="giftB-foot">
                    {it.amount ? <span className="gift-amount">{it.amount}</span> : <span />}
                    <ReserveButton item={it} onReserve={g.openFor} />
                  </div>
                </div>
              </article>
            ))}
            <IbanCard config={config} layout="card" />
          </div>
        )}
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
