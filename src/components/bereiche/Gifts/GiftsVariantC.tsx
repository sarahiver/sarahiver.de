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
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Geschenke Variante C — Editorial: überlappende Foto-Collage + Liste
 *
 * Links eine Collage aus den ersten Item-Bildern (leicht versetzt), rechts
 * die Liste mit Reservieren. Das bestehende sarahiver.com-Layout.
 * Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function GiftsVariantC({ tokens, content, weddingSlug }: Props) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const config = readConfig(content);
  const g = useGifts(readItems(content), weddingSlug);

  // Collage aus den ersten bis zu 3 Item-Bildern
  const collage = g.items.map((it) => it.image).filter((src): src is string => !!src).slice(0, 3);
  const showCollage = collage.length > 0;

  return (
    <div className="gift giftC-section" data-style-gift={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <GiftHeader config={config} />

      <div className="giftC-wrap">
        {g.items.length === 0 ? (
          <GiftEmpty ibanEnabled={config.ibanEnabled} />
        ) : (
          <div className={`giftC-grid ${showCollage ? '' : 'is-no-collage'}`}>
            {showCollage && (
              <div className="giftC-collage">
                {collage.map((src, i) => (
                  <div key={i} className="giftC-coll-img">
                    <img src={src} alt="" />
                  </div>
                ))}
              </div>
            )}
            <div className="giftC-list">
              {g.items.map((it) => (
                <div key={it.id} className={`giftC-row ${it.reserved ? 'is-reserved' : ''}`}>
                  <div className="giftC-body">
                    <div className="giftC-title-row">
                      <h3 className="giftC-title">{it.title}</h3>
                      {it.amount && <span className="gift-amount">{it.amount}</span>}
                    </div>
                    {it.description && <p className="giftC-desc">{it.description}</p>}
                  </div>
                  <div className="giftC-actions">
                    <ReserveButton item={it} onReserve={g.openFor} />
                    <ReservedTag item={it} />
                  </div>
                </div>
              ))}
            </div>
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
