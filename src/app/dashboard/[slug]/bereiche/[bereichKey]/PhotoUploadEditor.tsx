'use client';

import { useCallback, useEffect, useRef, useState, useTransition, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateBereichContent } from './actions';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

/**
 * Editor für den PhotoUpload-Bereich.
 *
 * Felder (alle optional, mit Defaults aus shared.ts):
 *  - eyebrow:         "Ein kleiner Wunsch"
 *  - title:           "Teilt eure <em>Erinnerungen</em>"  (em-Tags erlaubt)
 *  - description:     Erklärtext
 *  - privacy:         Datenschutz-Zeile unter dem Upload
 *  - success_message: Hauptzeile nach Upload
 *  - success_sub:     Untertitel nach Upload
 *
 * Auto-Save 1500ms debounced.
 */

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    privacy: string;
    success_message: string;
    success_sub: string;
  };
}

export default function PhotoUploadEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const latestRef = useRef(form);
  latestRef.current = form;

  const doSave = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'photoupload',
        contentPatch: latestRef.current,
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
  const update = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(doSave, 1500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const onTextChange = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    update(field, e.target.value);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte über dem Upload</h3>

        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="pu-eyebrow">Eyebrow (kleine Zeile oben)</label>
          <input
            id="pu-eyebrow"
            className="dash-input"
            value={form.eyebrow}
            onChange={onTextChange('eyebrow')}
            placeholder="Ein kleiner Wunsch"
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="pu-title">Titel</label>
          <input
            id="pu-title"
            className="dash-input"
            value={form.title}
            onChange={onTextChange('title')}
            placeholder="Teilt eure <em>Erinnerungen</em>"
          />
          <p className="dash-form-hint">
            <code>&lt;em&gt;</code>-Tags sind erlaubt für eine kursive Hervorhebung in der Schreibschrift.
          </p>
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="pu-description">Beschreibung</label>
          <textarea
            id="pu-description"
            className="dash-input"
            rows={3}
            value={form.description}
            onChange={onTextChange('description')}
            placeholder="Habt ihr ein schönes Foto mit uns? Wir sammeln eure liebsten gemeinsamen Momente …"
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="pu-privacy">Datenschutz-Hinweis</label>
          <input
            id="pu-privacy"
            className="dash-input"
            value={form.privacy}
            onChange={onTextChange('privacy')}
            placeholder="Eure Fotos sind nur für das Brautpaar sichtbar."
          />
          <p className="dash-form-hint">
            Erscheint dezent unter der Upload-Zone — gibt euren Gästen Sicherheit, dass die Bilder nicht öffentlich werden.
          </p>
        </div>
      </section>

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte nach erfolgreichem Upload</h3>

        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="pu-success">Hauptzeile</label>
          <input
            id="pu-success"
            className="dash-input"
            value={form.success_message}
            onChange={onTextChange('success_message')}
            placeholder="Danke! Eure Fotos sind bei uns angekommen."
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="pu-success-sub">Untertitel</label>
          <input
            id="pu-success-sub"
            className="dash-input"
            value={form.success_sub}
            onChange={onTextChange('success_sub')}
            placeholder="Wir freuen uns riesig — bis bald."
          />
        </div>
      </section>
    </div>
  );
}
