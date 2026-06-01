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

interface AbcItemInput {
  id: string;
  letter: string;
  term: string;
  text: string;
}

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    items: AbcItemInput[];
  };
}

/**
 * Hochzeits-ABC-Editor.
 *
 * Pro Eintrag: Buchstabe (1 Zeichen), Begriff, Text (mit Markdown-Lite).
 * Buchstabe wird beim Anlegen aus dem Begriff vorgeschlagen (erster Buchstabe).
 */

export default function WeddingAbcEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
  });
  const [items, setItems] = useState<AbcItemInput[]>(initial.items);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  const saveContent = useCallback((patch: Record<string, unknown>) => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'weddingabc',
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

  const saveText = useCallback(() => saveContent(textRef.current), [saveContent]);
  const saveItems = useCallback((next: AbcItemInput[]) => saveContent({ items: next }), [saveContent]);

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
  const updateItem = (id: string, patch: Partial<AbcItemInput>) => {
    const next = items.map((it) => {
      if (it.id !== id) return it;
      const merged = { ...it, ...patch };
      // Buchstabe automatisch aus Begriff übernehmen wenn noch leer
      if (patch.term !== undefined && !merged.letter && patch.term.length > 0) {
        merged.letter = patch.term.charAt(0).toUpperCase();
      }
      // Letter immer 1 Zeichen + Uppercase
      if (patch.letter !== undefined) {
        merged.letter = patch.letter.charAt(0).toUpperCase();
      }
      return merged;
    });
    setItems(next);
    if (debounceItemsRef.current) window.clearTimeout(debounceItemsRef.current);
    debounceItemsRef.current = window.setTimeout(() => saveItems(next), 1500);
  };

  const addItem = () => {
    const next: AbcItemInput[] = [
      ...items,
      { id: `abc-${Date.now()}-${items.length}`, letter: '', term: 'Neuer Begriff', text: '' },
    ];
    setItems(next);
    saveItems(next);
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!window.confirm(`Begriff „${item.term}“ wirklich löschen?`)) return;
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    saveItems(next);
  };

  // Sortier-Helper: alphabetisch nach Buchstabe → Begriff
  const sortAlphabetically = () => {
    const sorted = [...items].sort((a, b) => {
      const la = (a.letter || '').toLowerCase();
      const lb = (b.letter || '').toLowerCase();
      if (la !== lb) return la.localeCompare(lb, 'de');
      return a.term.localeCompare(b.term, 'de');
    });
    setItems(sorted);
    saveItems(sorted);
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
          <input className="dash-input" value={text.eyebrow} onChange={onText('eyebrow')} placeholder="Von A bis Z" />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText({ title: v })}
          placeholder="Unser [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea className="dash-input" rows={2} value={text.description} onChange={onText('description')} placeholder="Alles, was ihr für den Tag wissen müsst …" />
        </div>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Begriffe ({items.length})</h3>
            <p className="dash-form-section-desc">
              Pro Eintrag: Anfangsbuchstabe, Begriff, kurzer Text. Markdown-Lite wie bei FAQ.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {items.length > 1 && (
              <button type="button" className="dash-btn-out" onClick={sortAlphabetically} title="Alphabetisch sortieren">
                A–Z sortieren
              </button>
            )}
            <button type="button" className="dash-btn" onClick={addItem}>
              <DashboardIcon name="plus" size={14} />
              <span>Eintrag hinzufügen</span>
            </button>
          </div>
        </div>

        {items.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine Einträge. Klickt auf „Eintrag hinzufügen“, um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {items.map((item) => (
            <div key={item.id} className="dash-milestone-card">
              <div className="dash-milestone-head">
                <span className="dash-milestone-when-preview">
                  {item.letter || '?'}
                </span>
                <div className="dash-milestone-actions">
                  <button type="button" className="dash-icon-btn is-danger" onClick={() => deleteItem(item.id)} title="Löschen">
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="dash-form-row">
                <div className="dash-form-field" style={{ maxWidth: 100 }}>
                  <label className="dash-form-label">Buchstabe</label>
                  <input
                    className="dash-input"
                    value={item.letter}
                    onChange={(e) => updateItem(item.id, { letter: e.target.value })}
                    maxLength={1}
                    style={{ textAlign: 'center', textTransform: 'uppercase' }}
                  />
                </div>
                <div className="dash-form-field">
                  <label className="dash-form-label">Begriff</label>
                  <input
                    className="dash-input"
                    value={item.term}
                    onChange={(e) => updateItem(item.id, { term: e.target.value })}
                    placeholder="Anreise"
                  />
                </div>
              </div>
              <div className="dash-form-field">
                <label className="dash-form-label">Text</label>
                <textarea
                  className="dash-input"
                  rows={3}
                  value={item.text}
                  onChange={(e) => updateItem(item.id, { text: e.target.value })}
                  placeholder="So kommt ihr zu uns: [Routenplaner](https://…)"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
