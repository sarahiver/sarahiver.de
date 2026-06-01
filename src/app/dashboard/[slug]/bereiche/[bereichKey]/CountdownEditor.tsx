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
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

/**
 * Countdown-Editor.
 *
 * Sehr schlank: drei Texte (eyebrow, footer, past_text). Das Datum selbst
 * kommt aus den Stammdaten (Einstellungen → Stammdaten → Hochzeitsdatum).
 */

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    footer: string;
    past_text: string;
  };
}

export default function CountdownEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState(initial);

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
        bereich_key: 'countdown',
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

      <div className="dash-info-banner">
        <div className="dash-info-banner-content">
          <strong>Hochzeitsdatum verwalten</strong>
          <span>Das Datum kommt aus euren Stammdaten — dort könnt ihr es ändern.</span>
        </div>
        <Link href={`/dashboard/${slug}/settings`} className="dash-btn-out">
          Stammdaten öffnen
        </Link>
      </div>

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-field">
          <label className="dash-form-label">Eyebrow</label>
          <input
            className="dash-input"
            value={text.eyebrow}
            onChange={onChange('eyebrow')}
            placeholder="Nur noch"
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Footer (unter dem Countdown)</label>
          <input
            className="dash-input"
            value={text.footer}
            onChange={onChange('footer')}
            placeholder="Wir freuen uns auf euch."
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Text nach der Hochzeit</label>
          <input
            className="dash-input"
            value={text.past_text}
            onChange={onChange('past_text')}
            placeholder="Wir haben geheiratet!"
          />
          <p className="dash-form-hint">
            Wird angezeigt, wenn der Termin vorbei ist.
          </p>
        </div>
      </section>
    </div>
  );
}
