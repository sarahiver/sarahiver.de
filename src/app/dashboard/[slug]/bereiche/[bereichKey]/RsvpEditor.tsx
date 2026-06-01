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
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

type QuestionType = 'text' | 'boolean' | 'choice';

interface CustomQuestionInput {
  id: string;
  label: string;
  type: QuestionType;
  options: string[]; // nur bei type='choice'
  required: boolean;
}

interface Props {
  slug: string;
  initial: {
    title: string;
    description: string;
    deadline: string;
    ask_dietary: boolean;
    ask_allergies: boolean;
    custom_questions: CustomQuestionInput[];
  };
  rsvpCount: number;
}

/**
 * RSVP-Editor.
 *
 * Pflegt die Formular-Konfiguration:
 *   - Header-Texte (Titel mit Highlight, Beschreibung)
 *   - Deadline (Datum)
 *   - Toggles für Diät/Allergien
 *   - Dynamic Custom Questions (text / boolean / choice mit Optionen)
 *
 * Die eingehenden RSVPs werden separat unter /dashboard/[slug]/rsvp verwaltet.
 */

export default function RsvpEditor({ slug, initial, rsvpCount }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [state, setState] = useState({
    title: initial.title,
    description: initial.description,
    deadline: initial.deadline,
    ask_dietary: initial.ask_dietary,
    ask_allergies: initial.ask_allergies,
    custom_questions: initial.custom_questions,
  });

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const saveAll = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const s = stateRef.current;
      const res = await updateBereichContent({
        slug,
        bereich_key: 'rsvp',
        contentPatch: {
          title: s.title,
          description: s.description,
          deadline: s.deadline,
          ask_dietary: s.ask_dietary,
          ask_allergies: s.ask_allergies,
          custom_questions: s.custom_questions,
        },
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
  const debouncedSave = useCallback(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(saveAll, 1500);
  }, [saveAll]);

  const immediateSave = useCallback(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    saveAll();
  }, [saveAll]);

  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  const updateText = (field: keyof typeof state, value: string) => {
    setState((s) => ({ ...s, [field]: value }));
    debouncedSave();
  };

  const toggleField = (field: 'ask_dietary' | 'ask_allergies') => (e: ChangeEvent<HTMLInputElement>) => {
    setState((s) => ({ ...s, [field]: e.target.checked }));
    immediateSave();
  };

  const onText = (field: 'description') => (e: ChangeEvent<HTMLTextAreaElement>) => updateText(field, e.target.value);

  // ====================================================================
  // Custom Questions
  // ====================================================================

  const updateQuestion = (id: string, patch: Partial<CustomQuestionInput>) => {
    const next = state.custom_questions.map((q) => (q.id === id ? { ...q, ...patch } : q));
    setState((s) => ({ ...s, custom_questions: next }));
    debouncedSave();
  };

  const addQuestion = () => {
    const next: CustomQuestionInput[] = [
      ...state.custom_questions,
      {
        id: `q-${Date.now()}-${state.custom_questions.length}`,
        label: 'Neue Frage',
        type: 'text',
        options: [],
        required: false,
      },
    ];
    setState((s) => ({ ...s, custom_questions: next }));
    immediateSave();
  };

  const deleteQuestion = (id: string) => {
    const q = state.custom_questions.find((qq) => qq.id === id);
    if (!q) return;
    if (!window.confirm(`Frage „${q.label}“ wirklich löschen?`)) return;
    const next = state.custom_questions.filter((qq) => qq.id !== id);
    setState((s) => ({ ...s, custom_questions: next }));
    immediateSave();
  };

  const moveQuestion = (id: string, dir: -1 | 1) => {
    const idx = state.custom_questions.findIndex((q) => q.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= state.custom_questions.length) return;
    const next = [...state.custom_questions];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setState((s) => ({ ...s, custom_questions: next }));
    immediateSave();
  };

  const addOption = (qId: string) => {
    updateQuestion(qId, {
      options: [...(state.custom_questions.find((q) => q.id === qId)?.options || []), ''],
    });
  };

  const updateOption = (qId: string, optIdx: number, value: string) => {
    const q = state.custom_questions.find((qq) => qq.id === qId);
    if (!q) return;
    const opts = q.options.map((o, i) => (i === optIdx ? value : o));
    updateQuestion(qId, { options: opts });
  };

  const removeOption = (qId: string, optIdx: number) => {
    const q = state.custom_questions.find((qq) => qq.id === qId);
    if (!q) return;
    const opts = q.options.filter((_, i) => i !== optIdx);
    updateQuestion(qId, { options: opts });
  };

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      {rsvpCount > 0 && (
        <div className="dash-info-banner">
          <div className="dash-info-banner-content">
            <strong>{rsvpCount} {rsvpCount === 1 ? 'Zusage eingegangen' : 'Zusagen eingegangen'}</strong>
            <span>Übersicht aller Antworten + CSV-Export.</span>
          </div>
          <Link href={`/dashboard/${slug}/rsvp`} className="dash-btn">
            Antworten ansehen
          </Link>
        </div>
      )}

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <HighlightInput
          label="Titel"
          value={state.title}
          onChange={(v) => updateText('title', v)}
          placeholder="Eure [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea
            className="dash-input"
            rows={2}
            value={state.description}
            onChange={onText('description')}
            placeholder="Schön, dass ihr hier seid. Sagt uns bitte bis zum unten genannten Datum Bescheid."
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Deadline</label>
          <input
            type="date"
            className="dash-input"
            value={state.deadline}
            onChange={(e) => updateText('deadline', e.target.value)}
            style={{ maxWidth: 220 }}
          />
          <p className="dash-form-hint">
            Bis zu diesem Datum sollen Gäste antworten. Wird im Formular angezeigt.
          </p>
        </div>
      </section>

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Standard-Felder</h3>
        <p className="dash-form-section-desc">
          Diese Felder werden auf dem Formular angezeigt, wenn aktiviert. Sie werden pro Person
          erfasst (Hauptperson + Begleitungen).
        </p>

        <label className="dash-toggle" style={{ display: 'block', marginBottom: 10 }}>
          <input type="checkbox" checked={state.ask_dietary} onChange={toggleField('ask_dietary')} />
          <span>Ernährung abfragen (vegetarisch, vegan …)</span>
        </label>
        <label className="dash-toggle" style={{ display: 'block' }}>
          <input type="checkbox" checked={state.ask_allergies} onChange={toggleField('ask_allergies')} />
          <span>Allergien & Unverträglichkeiten abfragen</span>
        </label>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Eigene Fragen ({state.custom_questions.length})</h3>
            <p className="dash-form-section-desc">
              Z.B. „Kommt ihr zum Brunch?“, „Wie reist ihr an?“. Drei Antwort-Typen:
              freier Text, Ja/Nein oder Auswahl aus Optionen.
            </p>
          </div>
          <button type="button" className="dash-btn" onClick={addQuestion}>
            <DashboardIcon name="plus" size={14} />
            <span>Frage hinzufügen</span>
          </button>
        </div>

        {state.custom_questions.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine eigenen Fragen. Klickt auf „Frage hinzufügen“, um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {state.custom_questions.map((q, idx) => (
            <div key={q.id} className="dash-milestone-card">
              <div className="dash-milestone-head">
                <span className="dash-milestone-when-preview">Frage {idx + 1}</span>
                <div className="dash-milestone-actions">
                  <button type="button" className="dash-icon-btn" onClick={() => moveQuestion(q.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="dash-icon-btn" onClick={() => moveQuestion(q.id, 1)} disabled={idx === state.custom_questions.length - 1}>↓</button>
                  <button type="button" className="dash-icon-btn is-danger" onClick={() => deleteQuestion(q.id)} title="Löschen">
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="dash-form-field">
                <label className="dash-form-label">Fragetext</label>
                <input
                  className="dash-input"
                  value={q.label}
                  onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                  placeholder="Kommt ihr zum Brunch am Sonntag?"
                />
              </div>

              <div className="dash-form-row">
                <div className="dash-form-field" style={{ maxWidth: 200 }}>
                  <label className="dash-form-label">Antwort-Typ</label>
                  <select
                    className="dash-input"
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                  >
                    <option value="text">Freier Text</option>
                    <option value="boolean">Ja / Nein</option>
                    <option value="choice">Auswahl</option>
                  </select>
                </div>
                <div className="dash-form-field">
                  <label className="dash-toggle" style={{ marginTop: 24 }}>
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                    />
                    <span>Pflichtfeld</span>
                  </label>
                </div>
              </div>

              {q.type === 'choice' && (
                <div className="dash-form-field">
                  <label className="dash-form-label">Antwort-Optionen ({q.options.length})</label>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="dash-transit-row" style={{ marginBottom: 6 }}>
                      <input
                        className="dash-input"
                        value={opt}
                        onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                      />
                      <button
                        type="button"
                        className="dash-icon-btn is-danger"
                        onClick={() => removeOption(q.id, optIdx)}
                        title="Option entfernen"
                      >
                        <DashboardIcon name="trash" size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="dash-btn-out" onClick={() => addOption(q.id)}>
                    + Option hinzufügen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
