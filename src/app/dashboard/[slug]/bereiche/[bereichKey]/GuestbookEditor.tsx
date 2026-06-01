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
 * Editor für den Gästebuch-Bereich.
 *
 * Pflegt nur die Rahmen-Texte (Eyebrow, Titel mit Highlight, Beschreibung,
 * Moderation-Hinweis, Success-Texte). Die einzelnen Einträge der Gäste
 * werden separat unter „Eingehende Daten → Gästebuch" moderiert.
 */

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    moderation: string;
    success_message: string;
    success_sub: string;
  };
  pendingCount: number;
}

export default function GuestbookEditor({ slug, initial, pendingCount }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
    moderation: initial.moderation,
    success_message: initial.success_message,
    success_sub: initial.success_sub,
  });

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Latest-State für die Save-Closure
  const stateRef = useRef(text);
  useEffect(() => { stateRef.current = text; }, [text]);

  const saveText = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'guestbook',
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

  // Debounced Save für Text-Felder
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

      {/* Moderations-Hinweis-Banner */}
      {pendingCount > 0 && (
        <div className="dash-info-banner">
          <div className="dash-info-banner-content">
            <strong>{pendingCount} {pendingCount === 1 ? 'Eintrag wartet' : 'Einträge warten'} auf Freigabe</strong>
            <span>Die Einträge erscheinen erst auf eurer Seite, nachdem ihr sie geprüft habt.</span>
          </div>
          <Link href={`/dashboard/${slug}/guestbook`} className="dash-btn">
            Einträge prüfen
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
            placeholder="Eure Worte"
          />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText('title', v)}
          placeholder="Unser [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea
            className="dash-input"
            rows={3}
            value={text.description}
            onChange={onChange('description')}
            placeholder="Hinterlasst uns ein paar Worte …"
          />
        </div>
      </section>

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Moderation</h3>
        <p className="dash-form-section-desc">
          Jeder Eintrag wird euch zur Freigabe vorgelegt — erscheint erst nach Bestätigung
          auf eurer Seite. Dieser Hinweis steht direkt am Formular für eure Gäste.
        </p>
        <div className="dash-form-field">
          <label className="dash-form-label">Hinweistext am Formular</label>
          <input
            className="dash-input"
            value={text.moderation}
            onChange={onChange('moderation')}
            placeholder="Einträge erscheinen nach einer kurzen Prüfung."
          />
        </div>
      </section>

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Nach Absenden (Danke-Seite)</h3>
        <p className="dash-form-section-desc">
          Wird euren Gästen direkt nach dem Abschicken ihres Eintrags angezeigt.
        </p>

        <div className="dash-form-field">
          <label className="dash-form-label">Dankesnachricht</label>
          <input
            className="dash-input"
            value={text.success_message}
            onChange={onChange('success_message')}
            placeholder="Danke für eure lieben Worte!"
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Zusatztext</label>
          <input
            className="dash-input"
            value={text.success_sub}
            onChange={onChange('success_sub')}
            placeholder="Wir schauen uns jeden Eintrag persönlich an …"
          />
        </div>
      </section>
    </div>
  );
}
