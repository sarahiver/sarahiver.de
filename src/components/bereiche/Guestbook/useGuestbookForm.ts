'use client';

import { useState, useCallback } from 'react';
import { submitEntry } from './shared';

export type FormPhase = 'form' | 'sending' | 'success' | 'error';

/**
 * Gemeinsame Formular-Logik fürs Gästebuch (Name + Nachricht, Submit,
 * Pending-Erfolg). SSR-safe: Initial-Phase 'form', leere Felder.
 *
 * Moderation aktiv → bei Erfolg KEIN optimistisches Einfügen in die Liste,
 * stattdessen Pending-Zustand.
 */
export function useGuestbookForm(weddingSlug?: string) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<FormPhase>('form');
  const [errorMsg, setErrorMsg] = useState('');

  const canSubmit = name.trim().length > 0 && message.trim().length > 0;

  const submit = useCallback(async () => {
    if (!canSubmit || phase === 'sending') return;
    setPhase('sending');
    setErrorMsg('');
    const res = await submitEntry({
      name: name.trim(),
      message: message.trim(),
      weddingSlug,
    });
    if (res.ok) {
      setPhase('success');
    } else {
      setErrorMsg(res.error || 'Konnte nicht gesendet werden, bitte erneut versuchen.');
      setPhase('error');
    }
  }, [canSubmit, phase, name, message, weddingSlug]);

  const reset = useCallback(() => {
    setName('');
    setMessage('');
    setErrorMsg('');
    setPhase('form');
  }, []);

  return {
    name,
    setName,
    message,
    setMessage,
    phase,
    errorMsg,
    canSubmit,
    submit,
    reset,
  };
}
