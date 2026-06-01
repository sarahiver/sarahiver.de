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

type TransitMode = 'car' | 'train' | 'bus' | 'park' | 'walk';

interface TransitInput {
  mode: TransitMode;
  text: string;
}

interface DirectionInput {
  id: string;
  label: string;
  name: string;
  address: string;
  description: string;
  maps_embed: string;
  maps_url: string;
  transit: TransitInput[];
}

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    items: DirectionInput[];
  };
}

const MODE_LABELS: Record<TransitMode, string> = {
  car: 'Auto',
  train: 'Bahn',
  bus: 'Bus',
  park: 'Parken',
  walk: 'zu Fuß',
};

/**
 * Anfahrt-Editor.
 *
 * Pro Location: Label, Name, Adresse, Beschreibung, optionale
 * Maps-Embed-URL und Anreise-Hinweise (Liste).
 * Wenn Maps-Felder leer sind, generiert das Frontend sie automatisch
 * aus der Adresse.
 */

export default function DirectionsEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
  });
  const [items, setItems] = useState<DirectionInput[]>(initial.items);

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
        bereich_key: 'directions',
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
  const saveItems = useCallback((next: DirectionInput[]) => saveContent({ items: next }), [saveContent]);

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
  const updateItem = (id: string, patch: Partial<DirectionInput>) => {
    const next = items.map((it) => (it.id === id ? { ...it, ...patch } : it));
    setItems(next);
    if (debounceItemsRef.current) window.clearTimeout(debounceItemsRef.current);
    debounceItemsRef.current = window.setTimeout(() => saveItems(next), 1500);
  };

  const addItem = () => {
    const next: DirectionInput[] = [
      ...items,
      {
        id: `loc-${Date.now()}-${items.length}`,
        label: 'Trauung',
        name: 'Neue Location',
        address: '',
        description: '',
        maps_embed: '',
        maps_url: '',
        transit: [],
      },
    ];
    setItems(next);
    saveItems(next);
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!window.confirm(`Location „${item.name}“ wirklich löschen?`)) return;
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

  // Transit-Hinweise pro Item
  const addTransit = (itemId: string) => {
    const next = items.map((it) =>
      it.id === itemId
        ? { ...it, transit: [...it.transit, { mode: 'car' as TransitMode, text: '' }] }
        : it,
    );
    setItems(next);
    saveItems(next);
  };

  const updateTransit = (itemId: string, transitIdx: number, patch: Partial<TransitInput>) => {
    const next = items.map((it) => {
      if (it.id !== itemId) return it;
      const transit = it.transit.map((t, i) => (i === transitIdx ? { ...t, ...patch } : t));
      return { ...it, transit };
    });
    setItems(next);
    if (debounceItemsRef.current) window.clearTimeout(debounceItemsRef.current);
    debounceItemsRef.current = window.setTimeout(() => saveItems(next), 1500);
  };

  const removeTransit = (itemId: string, transitIdx: number) => {
    const next = items.map((it) => {
      if (it.id !== itemId) return it;
      return { ...it, transit: it.transit.filter((_, i) => i !== transitIdx) };
    });
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
          <input className="dash-input" value={text.eyebrow} onChange={onText('eyebrow')} placeholder="Anreise" />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText({ title: v })}
          placeholder="So [highlight] ihr uns"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea className="dash-input" rows={2} value={text.description} onChange={onText('description')} placeholder="Alle Adressen und Anreise-Hinweise …" />
        </div>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Locations ({items.length})</h3>
            <p className="dash-form-section-desc">
              Pro Location: Adresse + Hinweise. Karten-Einbettung und Route-Link werden
              automatisch aus der Adresse generiert.
            </p>
          </div>
          <button type="button" className="dash-btn" onClick={addItem}>
            <DashboardIcon name="plus" size={14} />
            <span>Location hinzufügen</span>
          </button>
        </div>

        {items.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine Locations. Klickt auf „Location hinzufügen“, um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {items.map((item, idx) => (
            <div key={item.id} className="dash-milestone-card">
              <div className="dash-milestone-head">
                <span className="dash-milestone-when-preview">{item.label || 'Label'}</span>
                <div className="dash-milestone-actions">
                  <button type="button" className="dash-icon-btn" onClick={() => moveItem(item.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="dash-icon-btn" onClick={() => moveItem(item.id, 1)} disabled={idx === items.length - 1}>↓</button>
                  <button type="button" className="dash-icon-btn is-danger" onClick={() => deleteItem(item.id)} title="Löschen">
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="dash-form-row">
                <div className="dash-form-field" style={{ maxWidth: 200 }}>
                  <label className="dash-form-label">Label (Trauung, Feier, …)</label>
                  <input className="dash-input" value={item.label} onChange={(e) => updateItem(item.id, { label: e.target.value })} placeholder="Trauung" />
                </div>
                <div className="dash-form-field">
                  <label className="dash-form-label">Name</label>
                  <input className="dash-input" value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} placeholder="Standesamt Hamburg-Mitte" />
                </div>
              </div>
              <div className="dash-form-field">
                <label className="dash-form-label">Adresse</label>
                <textarea
                  className="dash-input"
                  rows={2}
                  value={item.address}
                  onChange={(e) => updateItem(item.id, { address: e.target.value })}
                  placeholder="Klosterwall 4&#10;20095 Hamburg"
                />
              </div>
              <div className="dash-form-field">
                <label className="dash-form-label">Beschreibung (optional)</label>
                <textarea className="dash-input" rows={2} value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="Treffpunkt 11 Uhr vor dem Eingang …" />
              </div>

              {/* Erweiterte Maps-Felder (optional, expand-on-demand) */}
              <details className="dash-details">
                <summary>Erweitert: Maps-Embed & Route-Link manuell</summary>
                <div className="dash-form-field">
                  <label className="dash-form-label">Maps-Embed-URL (iframe, optional)</label>
                  <input className="dash-input" value={item.maps_embed} onChange={(e) => updateItem(item.id, { maps_embed: e.target.value })} placeholder="https://www.google.com/maps/embed?…" />
                </div>
                <div className="dash-form-field">
                  <label className="dash-form-label">Route-Link (optional)</label>
                  <input type="url" className="dash-input" value={item.maps_url} onChange={(e) => updateItem(item.id, { maps_url: e.target.value })} placeholder="https://www.google.com/maps/dir/?api=1&destination=…" />
                </div>
              </details>

              {/* Transit-Hinweise */}
              <div className="dash-form-field">
                <label className="dash-form-label">Anreise-Hinweise ({item.transit.length})</label>
                {item.transit.map((t, ti) => (
                  <div key={ti} className="dash-transit-row">
                    <select
                      className="dash-input"
                      value={t.mode}
                      onChange={(e) => updateTransit(item.id, ti, { mode: e.target.value as TransitMode })}
                      style={{ maxWidth: 140 }}
                    >
                      {Object.entries(MODE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <input
                      className="dash-input"
                      value={t.text}
                      onChange={(e) => updateTransit(item.id, ti, { text: e.target.value })}
                      placeholder="z.B. Parkplatz hinter dem Gebäude"
                    />
                    <button type="button" className="dash-icon-btn is-danger" onClick={() => removeTransit(item.id, ti)} title="Hinweis entfernen">
                      <DashboardIcon name="trash" size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className="dash-btn-out" onClick={() => addTransit(item.id)} style={{ marginTop: 8 }}>
                  + Hinweis hinzufügen
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
