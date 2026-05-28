'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  acceptFiles,
  makeUploadItem,
  uploadFile,
  type UploadItem,
} from './shared';

export type Phase = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

/**
 * Gemeinsame Upload-Logik für alle drei Fotoupload-Varianten.
 *
 * SSR-safe: Initial-Phase ist 'idle', items leer — kein zeit-/zufalls-
 * abhängiger Wert im Initial-Render. ObjectURLs entstehen erst bei
 * Datei-Auswahl (Client-Event) und werden beim Unmount/Reset freigegeben.
 */
export function useUpload(weddingSlug?: string) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [guestName, setGuestName] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ObjectURLs beim Unmount aufräumen
  const itemsRef = useRef<UploadItem[]>([]);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    };
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const accepted = acceptFiles(files);
    if (accepted.length === 0) return;
    setItems((prev) => [...prev, ...accepted.map(makeUploadItem)]);
    setPhase((p) => (p === 'success' ? 'selected' : p === 'idle' ? 'selected' : p));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const found = prev.find((it) => it.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      const next = prev.filter((it) => it.id !== id);
      if (next.length === 0) setPhase('idle');
      return next;
    });
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      e.target.value = ''; // erlaubt erneute Auswahl derselben Datei
    },
    [addFiles],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const setStatus = useCallback(
    (id: string, patch: Partial<UploadItem>) => {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    [],
  );

  const startUpload = useCallback(async () => {
    if (items.length === 0) return;
    setPhase('uploading');
    setErrorMsg('');

    let anyError = false;
    await Promise.all(
      items.map(async (it) => {
        if (it.status === 'done') return;
        setStatus(it.id, { status: 'uploading', progress: 0 });
        const res = await uploadFile(
          it.file,
          { guestName: guestName.trim(), weddingSlug },
          (pct) => setStatus(it.id, { progress: pct }),
        );
        if (res.ok) {
          setStatus(it.id, { status: 'done', progress: 100 });
        } else {
          anyError = true;
          setStatus(it.id, { status: 'error' });
        }
      }),
    );

    if (anyError) {
      setErrorMsg('Einige Fotos konnten nicht hochgeladen werden. Bitte erneut versuchen.');
      setPhase('error');
    } else {
      setPhase('success');
    }
  }, [items, guestName, weddingSlug, setStatus]);

  const reset = useCallback(() => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
    setGuestName('');
    setErrorMsg('');
    setPhase('idle');
  }, []);

  const doneCount = items.filter((it) => it.status === 'done').length;

  return {
    items,
    guestName,
    setGuestName,
    phase,
    dragging,
    errorMsg,
    doneCount,
    inputRef,
    addFiles,
    removeItem,
    openPicker,
    onInputChange,
    onDrop,
    onDragOver,
    onDragLeave,
    startUpload,
    reset,
  };
}
