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

interface AccommodationInput {
  id: string;
  name: string;
  description: string;
  image: string;
  distance: string;
  price: string;
  booking_code: string;
  booking_url: string;
}

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    items: AccommodationInput[];
  };
}

/**
 * Übernachtungs-Editor.
 *
 * Texte + Hotels mit Distanz, Preis, optionalem Buchungs-Code/Link.
 * Karten-Pins (lat/lng) für Variante C bleiben Backlog — selten gebraucht.
 */

export default function AccommodationsEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
  });
  const [items, setItems] = useState<AccommodationInput[]>(initial.items);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const folder = `sarahiver.de/${slug}/accommodations`;

  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  const saveContent = useCallback((patch: Record<string, unknown>) => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'accommodations',
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
  const saveItems = useCallback((next: AccommodationInput[]) => saveContent({ items: next }), [saveContent]);

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
  const updateItem = (id: string, patch: Partial<AccommodationInput>) => {
    const next = items.map((it) => (it.id === id ? { ...it, ...patch } : it));
    setItems(next);
    if (debounceItemsRef.current) window.clearTimeout(debounceItemsRef.current);
    debounceItemsRef.current = window.setTimeout(() => saveItems(next), 1500);
  };

  const updateItemImage = (id: string) => (url: string | null) => {
    const next = items.map((it) => (it.id === id ? { ...it, image: url || '' } : it));
    setItems(next);
    saveItems(next);
  };

  const addItem = () => {
    const next: AccommodationInput[] = [
      ...items,
      {
        id: `acc-${Date.now()}-${items.length}`,
        name: 'Neue Übernachtung',
        description: '',
        image: '',
        distance: '',
        price: '',
        booking_code: '',
        booking_url: '',
      },
    ];
    setItems(next);
    saveItems(next);
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!window.confirm(`Übernachtung „${item.name}“ wirklich löschen?`)) return;
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
          <input className="dash-input" value={text.eyebrow} onChange={onText('eyebrow')} placeholder="Übernachten" />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText({ title: v })}
          placeholder="Schlafplätze [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea className="dash-input" rows={2} value={text.description} onChange={onText('description')} placeholder="Hier ein paar Vorschläge in der Nähe der Location …" />
        </div>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Unterkünfte ({items.length})</h3>
            <p className="dash-form-section-desc">
              Wer Buchungscodes von Hotels hat, kann diese hier hinterlegen — Gäste sehen den Code direkt.
            </p>
          </div>
          <button type="button" className="dash-btn" onClick={addItem}>
            <DashboardIcon name="plus" size={14} />
            <span>Unterkunft hinzufügen</span>
          </button>
        </div>

        {items.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine Unterkünfte. Klickt auf „Unterkunft hinzufügen“, um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {items.map((item, idx) => (
            <div key={item.id} className="dash-milestone-card">
              <div className="dash-milestone-head">
                <span className="dash-milestone-when-preview">{item.distance || 'Distanz?'}</span>
                <div className="dash-milestone-actions">
                  <button type="button" className="dash-icon-btn" onClick={() => moveItem(item.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="dash-icon-btn" onClick={() => moveItem(item.id, 1)} disabled={idx === items.length - 1}>↓</button>
                  <button type="button" className="dash-icon-btn is-danger" onClick={() => deleteItem(item.id)} title="Löschen">
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="dash-milestone-grid">
                <div className="dash-milestone-image">
                  <ImageUploader
                    image={item.image || null}
                    folder={folder}
                    ratio="4/3"
                    maxHeight={180}
                    label="Bild (optional)"
                    onUpload={updateItemImage(item.id)}
                  />
                </div>

                <div className="dash-milestone-fields">
                  <div className="dash-form-field">
                    <label className="dash-form-label">Name</label>
                    <input className="dash-input" value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} placeholder="Hotel Atlantic Kempinski" />
                  </div>
                  <div className="dash-form-row">
                    <div className="dash-form-field">
                      <label className="dash-form-label">Distanz</label>
                      <input className="dash-input" value={item.distance} onChange={(e) => updateItem(item.id, { distance: e.target.value })} placeholder="5 Min. zur Location" />
                    </div>
                    <div className="dash-form-field">
                      <label className="dash-form-label">Preis</label>
                      <input className="dash-input" value={item.price} onChange={(e) => updateItem(item.id, { price: e.target.value })} placeholder="ab 120 € / Nacht" />
                    </div>
                  </div>
                  <div className="dash-form-field">
                    <label className="dash-form-label">Beschreibung</label>
                    <textarea className="dash-input" rows={2} value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="Klassisches Grandhotel direkt an der Alster …" />
                  </div>
                  <div className="dash-form-row">
                    <div className="dash-form-field">
                      <label className="dash-form-label">Buchungs-Stichwort</label>
                      <input className="dash-input" value={item.booking_code} onChange={(e) => updateItem(item.id, { booking_code: e.target.value })} placeholder="Hochzeit Sarah & Iver" />
                    </div>
                    <div className="dash-form-field">
                      <label className="dash-form-label">Buchungs-Link</label>
                      <input type="url" className="dash-input" value={item.booking_url} onChange={(e) => updateItem(item.id, { booking_url: e.target.value })} placeholder="https://…" />
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
