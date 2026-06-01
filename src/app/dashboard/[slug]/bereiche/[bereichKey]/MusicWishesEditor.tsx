'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateBereichContent } from './actions';
import HighlightInput from '@/components/dashboard/HighlightInput';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

/**
 * Editor für den Musikwünsche-Bereich.
 *
 * Pflegt nur die Rahmen-Texte. Die einzelnen Wünsche werden in
 * „Eingehende Daten → Musikwünsche“ verwaltet (keine Moderation, nur
 * Übersicht und CSV-Export für den DJ).
 */

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    success_message: string;
    success_sub: string;
  };
  totalCount: number;
}

export default function MusicWishesEditor({ slug, initial, totalCount }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
    success_message: initial.success_message,
    success_sub: initial.success_sub,
  });

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const stateRef = useRef(text);
  useEffect(() => { stateRef.current = text; }, [text]);

  const saveText = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'musicwishes',
        contentPatch: stateRef.current,
      });
      if (res.ok) {
        setStatus('ok');
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
      } else {
        setStatus('err');
        setErrText(res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  }, [slug, router]);

  const debounceRef = useRef<number | null>(null);
  const updateText = (field: keyof typeof text, value: string) => {
    setText((t) => ({ ...t, [field]: value }));
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(saveText, 1500);
  };
  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  const onChange = (field: keyof typeof text) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateText(field, e.target.value);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      {/* Wunsch-Übersicht / Banner */}
      {totalCount > 0 && (
        <div className="dash-info-banner">
          <div className="dash-info-banner-content">
            <strong>{totalCount} {totalCount === 1 ? 'Songwunsch eingegangen' : 'Songwünsche eingegangen'}</strong>
            <span>Alle Wünsche ansehen oder als CSV für euren DJ exportieren.</span>
          </div>
          <Link href={`/dashboard/${slug}/music`} className="dash-btn">
            Wünsche ansehen
          </Link>
        </div>
      )}

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-field">
          <label className="dash-form-label">Eyebrow</label>
          <input
            className="dash-input"
            value={text.eyebrow}
            onChange={onChange('eyebrow')}
            placeholder="Eure Lieblingssongs"
          />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText('title', v)}
          placeholder="Wünscht euch was [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea
            className="dash-input"
            rows={3}
            value={text.description}
            onChange={onChange('description')}
            placeholder="Welcher Song darf auf eurer Tanzfläche nicht fehlen?"
          />
        </div>
      </section>

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Nach Absenden (Danke-Nachricht)</h3>
        <p className="dash-form-section-desc">
          Wird euren Gästen direkt nach dem Abschicken ihres Wunsches angezeigt.
        </p>

        <div className="dash-form-field">
          <label className="dash-form-label">Dankesnachricht</label>
          <input
            className="dash-input"
            value={text.success_message}
            onChange={onChange('success_message')}
            placeholder="Danke! Euer Songwunsch ist notiert."
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Zusatztext</label>
          <input
            className="dash-input"
            value={text.success_sub}
            onChange={onChange('success_sub')}
            placeholder="Wir geben dem DJ einen kleinen Stups …"
          />
        </div>
      </section>
    </div>
  );
}
