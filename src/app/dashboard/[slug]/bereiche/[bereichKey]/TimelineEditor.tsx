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
import ImageUploader from '@/components/dashboard/ImageUploader';
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

interface EventInput {
  id: string;
  time: string;
  title: string;
  description: string;
  location_name: string;
  location_url: string;
  image: string;
}

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    events: EventInput[];
  };
}

/**
 * Timeline-Editor.
 *
 * Pro Event: Uhrzeit (HH:MM), Titel, Beschreibung, optional Ort + Link,
 * optional Bild.
 */

export default function TimelineEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
  });
  const [events, setEvents] = useState<EventInput[]>(initial.events);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const folder = `sarahiver.de/${slug}/timeline`;

  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  const saveContent = useCallback((patch: Record<string, unknown>) => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'timeline',
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
  const saveEvents = useCallback((next: EventInput[]) => saveContent({ events: next }), [saveContent]);

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

  const debounceEventsRef = useRef<number | null>(null);
  const updateEvent = (id: string, patch: Partial<EventInput>) => {
    const next = events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev));
    setEvents(next);
    if (debounceEventsRef.current) window.clearTimeout(debounceEventsRef.current);
    debounceEventsRef.current = window.setTimeout(() => saveEvents(next), 1500);
  };

  const updateEventImage = (id: string) => (url: string | null) => {
    const next = events.map((ev) => (ev.id === id ? { ...ev, image: url || '' } : ev));
    setEvents(next);
    saveEvents(next);
  };

  const addEvent = () => {
    const next: EventInput[] = [
      ...events,
      {
        id: `ev-${Date.now()}-${events.length}`,
        time: '',
        title: 'Neuer Programmpunkt',
        description: '',
        location_name: '',
        location_url: '',
        image: '',
      },
    ];
    setEvents(next);
    saveEvents(next);
  };

  const deleteEvent = (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    if (!window.confirm(`Programmpunkt „${ev.title}“ wirklich löschen?`)) return;
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    saveEvents(next);
  };

  const moveEvent = (id: string, dir: -1 | 1) => {
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= events.length) return;
    const next = [...events];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setEvents(next);
    saveEvents(next);
  };

  const sortByTime = () => {
    const sorted = [...events].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    setEvents(sorted);
    saveEvents(sorted);
  };

  useEffect(() => () => {
    if (debounceEventsRef.current) window.clearTimeout(debounceEventsRef.current);
  }, []);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-field">
          <label className="dash-form-label">Eyebrow</label>
          <input className="dash-input" value={text.eyebrow} onChange={onText('eyebrow')} placeholder="Der Ablauf" />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText({ title: v })}
          placeholder="Wie der [highlight] abläuft"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea className="dash-input" rows={2} value={text.description} onChange={onText('description')} placeholder="So sieht unser Tag aus …" />
        </div>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Programmpunkte ({events.length})</h3>
            <p className="dash-form-section-desc">
              Uhrzeit im Format HH:MM (z.B. 14:30). Reihenfolge mit den Pfeilen oder via „Nach Zeit sortieren“.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {events.length > 1 && (
              <button type="button" className="dash-btn-out" onClick={sortByTime} title="Nach Uhrzeit sortieren">
                Nach Zeit sortieren
              </button>
            )}
            <button type="button" className="dash-btn" onClick={addEvent}>
              <DashboardIcon name="plus" size={14} />
              <span>Punkt hinzufügen</span>
            </button>
          </div>
        </div>

        {events.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine Programmpunkte. Klickt auf „Punkt hinzufügen“, um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {events.map((ev, idx) => (
            <div key={ev.id} className="dash-milestone-card">
              <div className="dash-milestone-head">
                <span className="dash-milestone-when-preview">{ev.time || 'HH:MM'}</span>
                <div className="dash-milestone-actions">
                  <button type="button" className="dash-icon-btn" onClick={() => moveEvent(ev.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="dash-icon-btn" onClick={() => moveEvent(ev.id, 1)} disabled={idx === events.length - 1}>↓</button>
                  <button type="button" className="dash-icon-btn is-danger" onClick={() => deleteEvent(ev.id)} title="Löschen">
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="dash-milestone-grid">
                <div className="dash-milestone-image">
                  <ImageUploader
                    image={ev.image || null}
                    folder={folder}
                    ratio="4/3"
                    maxHeight={160}
                    label="Bild (optional)"
                    onUpload={updateEventImage(ev.id)}
                  />
                </div>

                <div className="dash-milestone-fields">
                  <div className="dash-form-row">
                    <div className="dash-form-field" style={{ maxWidth: 140 }}>
                      <label className="dash-form-label">Uhrzeit</label>
                      <input
                        type="time"
                        className="dash-input"
                        value={ev.time}
                        onChange={(e) => updateEvent(ev.id, { time: e.target.value })}
                      />
                    </div>
                    <div className="dash-form-field">
                      <label className="dash-form-label">Titel</label>
                      <input className="dash-input" value={ev.title} onChange={(e) => updateEvent(ev.id, { title: e.target.value })} placeholder="Trauung" />
                    </div>
                  </div>
                  <div className="dash-form-field">
                    <label className="dash-form-label">Beschreibung (optional)</label>
                    <textarea className="dash-input" rows={2} value={ev.description} onChange={(e) => updateEvent(ev.id, { description: e.target.value })} placeholder="Mit Glücksspruch und Sektempfang …" />
                  </div>
                  <div className="dash-form-row">
                    <div className="dash-form-field">
                      <label className="dash-form-label">Ort (optional)</label>
                      <input className="dash-input" value={ev.location_name} onChange={(e) => updateEvent(ev.id, { location_name: e.target.value })} placeholder="Standesamt Hamburg" />
                    </div>
                    <div className="dash-form-field">
                      <label className="dash-form-label">Maps-Link (optional)</label>
                      <input type="url" className="dash-input" value={ev.location_url} onChange={(e) => updateEvent(ev.id, { location_url: e.target.value })} placeholder="https://maps.google.com/…" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
