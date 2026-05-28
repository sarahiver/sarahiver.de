'use client';

import { useState, useCallback } from 'react';
import { submitWish, type MusicWish } from './shared';

export type MwPhase = 'idle' | 'sending' | 'success' | 'error';

/**
 * Gemeinsame Formular-Logik für Musikwünsche.
 *
 * KEINE Moderation → bei Erfolg wird der neue Wunsch SOFORT optimistisch
 * oben in die lokale Liste eingefügt (isFresh) + Success-Strip gezeigt.
 *
 * SSR-safe: Initial-State deterministisch (idle, leere Felder, items =
 * die vom Server gelieferten). Zeit/IDs entstehen erst im Submit-Callback.
 */
export function useMusicWishesForm(initialItems: MusicWish[], weddingSlug?: string) {
  const [items, setItems] = useState<MusicWish[]>(initialItems);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [guestName, setGuestName] = useState('');
  const [phase, setPhase] = useState<MwPhase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicateHint, setDuplicateHint] = useState(false);

  const canSubmit = title.trim().length > 0 && artist.trim().length > 0;

  const isDuplicate = useCallback(
    (t: string, a: string) =>
      items.some(
        (w) =>
          w.title.trim().toLowerCase() === t.trim().toLowerCase() &&
          w.artist.trim().toLowerCase() === a.trim().toLowerCase(),
      ),
    [items],
  );

  const submit = useCallback(async () => {
    if (!canSubmit || phase === 'sending') return;

    // Sanfter Duplikat-Hinweis (kein harter Block)
    if (isDuplicate(title, artist)) {
      setDuplicateHint(true);
    }

    setPhase('sending');
    setErrorMsg('');
    const res = await submitWish({
      title: title.trim(),
      artist: artist.trim(),
      guestName: guestName.trim(),
      weddingSlug,
    });

    if (res.ok && res.wish) {
      // optimistisch oben einfügen
      setItems((prev) => [res.wish as MusicWish, ...prev.map((w) => ({ ...w, isFresh: false }))]);
      setTitle('');
      setArtist('');
      setGuestName('');
      setPhase('success');
    } else {
      setErrorMsg(res.error || 'Konnte nicht gesendet werden, bitte erneut versuchen.');
      setPhase('error');
    }
  }, [canSubmit, phase, title, artist, guestName, weddingSlug, isDuplicate]);

  const dismissSuccess = useCallback(() => {
    setPhase('idle');
    setDuplicateHint(false);
  }, []);

  return {
    items,
    title,
    setTitle,
    artist,
    setArtist,
    guestName,
    setGuestName,
    phase,
    errorMsg,
    duplicateHint,
    canSubmit,
    submit,
    dismissSuccess,
  };
}
