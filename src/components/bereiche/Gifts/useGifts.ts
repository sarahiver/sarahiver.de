'use client';

import { useState, useCallback, useEffect } from 'react';
import { submitReservation, type GiftItem } from './shared';

export type ReservePhase = 'idle' | 'sending' | 'success' | 'error';

/**
 * Reservierungs-Logik fürs Geschenke-Modul (wie sarahiver.com useGifts).
 *
 * - items: lokaler State (initial vom Server); reservierte Items werden
 *   nach erfolgreichem Reservieren optimistisch als reserved markiert.
 * - Modal-Steuerung: openFor(item) / close().
 *
 * SSR-safe: Initial-State deterministisch (items vom Server, modal zu).
 */
export function useGifts(initialItems: GiftItem[], weddingSlug?: string) {
  const [items, setItems] = useState<GiftItem[]>(initialItems);
  const [modalItem, setModalItem] = useState<GiftItem | null>(null);
  const [guestName, setGuestName] = useState('');
  const [phase, setPhase] = useState<ReservePhase>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isReserved = useCallback(
    (id: string) => items.find((it) => it.id === id)?.reserved === true,
    [items],
  );

  const openFor = useCallback((item: GiftItem) => {
    setModalItem(item);
    setGuestName('');
    setErrorMsg('');
    setPhase('idle');
  }, []);

  const close = useCallback(() => {
    setModalItem(null);
    setPhase('idle');
    setErrorMsg('');
  }, []);

  const canSubmit = guestName.trim().length > 0;

  const reserve = useCallback(async () => {
    if (!modalItem || !canSubmit || phase === 'sending') return;
    setPhase('sending');
    setErrorMsg('');
    const res = await submitReservation({
      itemId: modalItem.id,
      itemTitle: modalItem.title,
      guestName: guestName.trim(),
      weddingSlug,
    });
    if (res.ok) {
      const name = guestName.trim();
      setItems((prev) =>
        prev.map((it) =>
          it.id === modalItem.id ? { ...it, reserved: true, reserved_by: name } : it,
        ),
      );
      setPhase('success');
    } else {
      setErrorMsg(res.error || 'Konnte nicht reserviert werden, bitte erneut versuchen.');
      setPhase('error');
    }
  }, [modalItem, canSubmit, phase, guestName, weddingSlug]);

  // Escape schließt; Body-Scroll-Lock während offen
  useEffect(() => {
    if (!modalItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [modalItem, close]);

  return {
    items,
    isReserved,
    modalItem,
    guestName,
    setGuestName,
    phase,
    errorMsg,
    canSubmit,
    openFor,
    close,
    reserve,
  };
}
