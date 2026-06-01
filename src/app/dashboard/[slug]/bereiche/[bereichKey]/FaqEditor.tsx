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
import { updateBereichContent } from './actions';
import HighlightInput from '@/components/dashboard/HighlightInput';
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

interface FaqItemInput {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    items: FaqItemInput[];
  };
}

/**
 * FAQ-Editor.
 *
 * Texte (Eyebrow, Titel mit Highlight, Beschreibung) + dynamische Q&A-Liste.
 * Antworten unterstützen Markdown-Lite: [text](url), **bold**, \n\n.
 */

export default function FaqEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
  });
  const [items, setItems] = useState<FaqItemInput[]>(initial.items);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const saveContent = useCallback((patch: Record<string, unknown>) => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'faq',
        contentPatch: patch,
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

  const saveText = useCallback(() => {
    saveContent(textRef.current);
  }, [saveContent]);

  const saveItems = useCallback((nextItems: FaqItemInput[]) => {
    saveContent({ items: nextItems });
  }, [saveContent]);

  const debounceRef = useRef<number | null>(null);
  const updateText = (patch: Partial<typeof text>) => {
    setText((t) => ({ ...t, ...patch }));
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(saveText, 1500);
  };
  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  const onText = (field: keyof typeof text) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateText({ [field]: e.target.value } as Partial<typeof text>);

  const debounceItemsRef = useRef<number | null>(null);
  const updateItem = (id: string, patch: Partial<FaqItemInput>) => {
    const next = items.map((it) => (it.id === id ? { ...it, ...patch } : it));
    setItems(next);
    if (debounceItemsRef.current) window.clearTimeout(debounceItemsRef.current);
    debounceItemsRef.current = window.setTimeout(() => saveItems(next), 1500);
  };

  const addItem = () => {
    const next: FaqItemInput[] = [
      ...items,
      { id: `faq-${Date.now()}-${items.length}`, question: 'Neue Frage', answer: '' },
    ];
    setItems(next);
    saveItems(next);
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!window.confirm(`Frage „${item.question}“ wirklich löschen?`)) return;
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    saveItems(next);
  };

  const moveItem = (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    const next = [...items];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setItems(next);
    saveItems(next);
  };

  useEffect(() => () => {
    if (debounceItemsRef.current) window.clearTimeout(debounceItemsRef.current);
  }, []);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-field">
          <label className="dash-form-label">Eyebrow</label>
          <input className="dash-input" value={text.eyebrow} onChange={onText('eyebrow')} placeholder="Gut zu wissen" />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText({ title: v })}
          placeholder="Häufige [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea className="dash-input" rows={2} value={text.description} onChange={onText('description')} placeholder="Ein paar Antworten auf häufige Fragen …" />
        </div>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Fragen & Antworten ({items.length})</h3>
            <p className="dash-form-section-desc">
              In den Antworten könnt ihr Links setzen mit <code>[Text](https://…)</code>, fett mit
              <code> **fett**</code> und Absätze mit Leerzeile.
            </p>
          </div>
          <button type="button" className="dash-btn" onClick={addItem}>
            <DashboardIcon name="plus" size={14} />
            <span>Frage hinzufügen</span>
          </button>
        </div>

        {items.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine Fragen. Klickt auf „Frage hinzufügen“, um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {items.map((item, idx) => (
            <div key={item.id} className="dash-milestone-card">
              <div className="dash-milestone-head">
                <span className="dash-milestone-when-preview">Frage {idx + 1}</span>
                <div className="dash-milestone-actions">
                  <button type="button" className="dash-icon-btn" onClick={() => moveItem(item.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="dash-icon-btn" onClick={() => moveItem(item.id, 1)} disabled={idx === items.length - 1}>↓</button>
                  <button type="button" className="dash-icon-btn is-danger" onClick={() => deleteItem(item.id)} title="Löschen">
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="dash-form-field">
                <label className="dash-form-label">Frage</label>
                <input
                  className="dash-input"
                  value={item.question}
                  onChange={(e) => updateItem(item.id, { question: e.target.value })}
                  placeholder="Gibt es einen Dresscode?"
                />
              </div>
              <div className="dash-form-field">
                <label className="dash-form-label">Antwort</label>
                <textarea
                  className="dash-input"
                  rows={4}
                  value={item.answer}
                  onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                  placeholder="Festlich-elegant, aber bequem. Mehr Infos: [Dresscode](https://…)"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
