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
import ImageUploader from '@/components/dashboard/ImageUploader';
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

/**
 * Editor für den Geschenke-Bereich.
 *
 * Drei Teile:
 *   1. Texte (Eyebrow, Titel mit Highlight, Beschreibung, Danke-Text)
 *   2. Reisekasse (IBAN-Block, optional)
 *   3. Geschenk-Ideen (Items-Liste mit Add/Edit/Delete/Move + Bild)
 *
 * Reservierungs-Status der Items wird NICHT hier gepflegt — der kommt aus
 * der wedding_gift_reservations-Tabelle und wird vom Render-Pfad gemerged.
 * Im Editor zeigen wir den aktuellen Reservierungsstand als Read-only-Badge.
 */

interface GiftItemInput {
  id: string;
  title: string;
  description: string;
  amount: string;
  image: string;
}

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    reserve_success: string;
    iban_enabled: boolean;
    iban: string;
    iban_holder: string;
    iban_note: string;
    items: GiftItemInput[];
  };
  reservedItemIds: Set<string>;
  reservedCount: number;
}

export default function GiftsEditor({ slug, initial, reservedItemIds, reservedCount }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
    reserve_success: initial.reserve_success,
    iban_enabled: initial.iban_enabled,
    iban: initial.iban,
    iban_holder: initial.iban_holder,
    iban_note: initial.iban_note,
  });
  const [items, setItems] = useState<GiftItemInput[]>(initial.items);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const folder = `sarahiver.de/${slug}/gifts`;

  // Refs damit save-Closure den aktuellen State sieht
  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // ====================================================================
  // Save-Helpers
  // ====================================================================

  const saveContent = useCallback((patch: Record<string, unknown>) => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'gifts',
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

  const saveItems = useCallback((nextItems: GiftItemInput[]) => {
    saveContent({ items: nextItems });
  }, [saveContent]);

  // Debounced Text-Save (1500ms)
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

  const toggleIban = (enabled: boolean) => {
    updateText({ iban_enabled: enabled });
  };

  // ====================================================================
  // Item-Operationen
  // ====================================================================

  const debounceItemsRef = useRef<number | null>(null);
  const updateItem = (id: string, patch: Partial<GiftItemInput>) => {
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
    const next: GiftItemInput[] = [
      ...items,
      {
        id: `g-${Date.now()}-${items.length}`,
        title: 'Neue Geschenkidee',
        description: '',
        amount: '',
        image: '',
      },
    ];
    setItems(next);
    saveItems(next);
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (reservedItemIds.has(id)) {
      if (!window.confirm(
        `„${item.title}“ ist bereits reserviert. Wirklich löschen? Die Reservierung wird ebenfalls entfernt.`,
      )) return;
    } else if (!window.confirm(`Geschenkidee „${item.title}“ wirklich löschen?`)) {
      return;
    }
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

      {/* Reservierungs-Banner */}
      {reservedCount > 0 && (
        <div className="dash-info-banner">
          <div className="dash-info-banner-content">
            <strong>{reservedCount} {reservedCount === 1 ? 'Geschenk reserviert' : 'Geschenke reserviert'}</strong>
            <span>Übersicht aller Reservierungen mit Gast-Namen.</span>
          </div>
          <Link href={`/dashboard/${slug}/gifts`} className="dash-btn">
            Reservierungen ansehen
          </Link>
        </div>
      )}

      {/* ============ Texte ============ */}
      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-field">
          <label className="dash-form-label">Eyebrow</label>
          <input
            className="dash-input"
            value={text.eyebrow}
            onChange={onText('eyebrow')}
            placeholder="Wünsche"
          />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText({ title: v })}
          placeholder="Unsere [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea
            className="dash-input"
            rows={3}
            value={text.description}
            onChange={onText('description')}
            placeholder="Das größte Geschenk ist eure Anwesenheit …"
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Dankesnachricht nach Reservierung</label>
          <input
            className="dash-input"
            value={text.reserve_success}
            onChange={onText('reserve_success')}
            placeholder="Danke! Wir haben das für euch vermerkt."
          />
        </div>
      </section>

      {/* ============ IBAN ============ */}
      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Reisekasse (optional)</h3>
        <p className="dash-form-section-desc">
          Wer lieber Geld zur Reisekasse beisteuert, sieht eure Bankverbindung. Wenn aus, wird
          der ganze Block ausgeblendet.
        </p>

        <label className="dash-toggle">
          <input
            type="checkbox"
            checked={text.iban_enabled}
            onChange={(e) => toggleIban(e.target.checked)}
          />
          <span>Reisekasse-Block anzeigen</span>
        </label>

        {text.iban_enabled && (
          <div className="dash-form-row" style={{ marginTop: 12 }}>
            <div className="dash-form-field">
              <label className="dash-form-label">Kontoinhaber</label>
              <input
                className="dash-input"
                value={text.iban_holder}
                onChange={onText('iban_holder')}
                placeholder="Sarah & Iver Gentz"
              />
            </div>
            <div className="dash-form-field">
              <label className="dash-form-label">IBAN</label>
              <input
                className="dash-input"
                value={text.iban}
                onChange={onText('iban')}
                placeholder="DE12 3456 7890 1234 5678 90"
                style={{ fontFamily: 'var(--dash-font-mono)' }}
              />
            </div>
            <div className="dash-form-field" style={{ gridColumn: '1 / -1' }}>
              <label className="dash-form-label">Hinweis-Text</label>
              <input
                className="dash-input"
                value={text.iban_note}
                onChange={onText('iban_note')}
                placeholder="Wer uns lieber etwas zur Reisekasse beisteuern mag:"
              />
            </div>
          </div>
        )}
      </section>

      {/* ============ Geschenk-Ideen ============ */}
      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Geschenk-Ideen ({items.length})</h3>
            <p className="dash-form-section-desc">
              Jede Idee bekommt einen Titel, eine optionale Beschreibung, einen Betrag und ein
              Bild. Gäste können einzelne Ideen reservieren.
            </p>
          </div>
          <button type="button" className="dash-btn" onClick={addItem}>
            <DashboardIcon name="plus" size={14} />
            <span>Idee hinzufügen</span>
          </button>
        </div>

        {items.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine Geschenk-Ideen. Klickt auf „Idee hinzufügen“, um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {items.map((item, idx) => (
            <GiftItemCard
              key={item.id}
              item={item}
              folder={folder}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
              isReserved={reservedItemIds.has(item.id)}
              onTextChange={(field, value) => updateItem(item.id, { [field]: value })}
              onImageChange={updateItemImage(item.id)}
              onMoveUp={() => moveItem(item.id, -1)}
              onMoveDown={() => moveItem(item.id, 1)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ====================================================================
// Item-Karte
// ====================================================================

function GiftItemCard({
  item,
  folder,
  isFirst,
  isLast,
  isReserved,
  onTextChange,
  onImageChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  item: GiftItemInput;
  folder: string;
  isFirst: boolean;
  isLast: boolean;
  isReserved: boolean;
  onTextChange: (field: keyof GiftItemInput, value: string) => void;
  onImageChange: (url: string | null) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`dash-milestone-card ${isReserved ? 'is-reserved' : ''}`}>
      <div className="dash-milestone-head">
        <span className="dash-milestone-when-preview">
          {item.amount || 'Kein Betrag'}
          {isReserved && <span className="dash-gb-badge is-warn" style={{ marginLeft: 8 }}>Reserviert</span>}
        </span>
        <div className="dash-milestone-actions">
          <button type="button" className="dash-icon-btn" onClick={onMoveUp} disabled={isFirst} title="Nach oben">↑</button>
          <button type="button" className="dash-icon-btn" onClick={onMoveDown} disabled={isLast} title="Nach unten">↓</button>
          <button type="button" className="dash-icon-btn is-danger" onClick={onDelete} title="Löschen">
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
            label="Bild"
            onUpload={onImageChange}
          />
        </div>

        <div className="dash-milestone-fields">
          <div className="dash-form-field">
            <label className="dash-form-label">Titel</label>
            <input
              className="dash-input"
              value={item.title}
              onChange={(e) => onTextChange('title', e.target.value)}
              placeholder="Honeymoon-Beitrag"
            />
          </div>
          <div className="dash-form-field">
            <label className="dash-form-label">Beschreibung (optional)</label>
            <textarea
              className="dash-input"
              rows={2}
              value={item.description}
              onChange={(e) => onTextChange('description', e.target.value)}
              placeholder="Ein paar Worte zum Geschenk …"
            />
          </div>
          <div className="dash-form-field">
            <label className="dash-form-label">Betrag (optional)</label>
            <input
              className="dash-input"
              value={item.amount}
              onChange={(e) => onTextChange('amount', e.target.value)}
              placeholder="z.B. 50 €"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
