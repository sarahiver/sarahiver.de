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
import ImageUploader from '@/components/dashboard/ImageUploader';
import HighlightInput from '@/components/dashboard/HighlightInput';
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

/**
 * Lovestory-Editor.
 *
 * Zwei Schemas je nach Variante:
 *   A: Single-Moment mit bis zu 3 Bildern, Eyebrow, Titel, When, Moment-
 *      Title, Description, Signature
 *   B+C: Eyebrow, Titel, Intro, Liste von Milestones (when, title,
 *      description, image_url, optional image_alt)
 *
 * Auto-Save: Bild-Uploads sofort, Text-Felder debounced 1500ms.
 * Listen-Operationen (Add/Delete/Sort) speichern sofort.
 */

interface MilestoneInput {
  id: string;
  when: string;
  title: string;
  description: string;
  image_url: string;
  image_alt?: string;
}

interface PropsA {
  slug: string;
  variant: 'a';
  initial: {
    eyebrow: string;
    title: string;
    when: string;
    moment_title: string;
    description: string;
    signature: string;
    images: string[]; // 0..3
  };
}

interface PropsBC {
  slug: string;
  variant: 'b' | 'c';
  initial: {
    eyebrow: string;
    title: string;
    intro: string;
    entries: MilestoneInput[];
  };
}

export default function LovestoryEditor(props: PropsA | PropsBC) {
  if (props.variant === 'a') return <LovestoryEditorA {...props} />;
  return <LovestoryEditorBC {...props} />;
}

// ====================================================================
// Variante A — Single Moment
// ====================================================================

function LovestoryEditorA({ slug, initial }: PropsA) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    when: initial.when,
    moment_title: initial.moment_title,
    description: initial.description,
    signature: initial.signature,
  });
  const [images, setImages] = useState<string[]>(initial.images.slice(0, 3));

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const folder = `sarahiver.de/${slug}/lovestory`;

  // ====================================================================
  // Save-Helpers
  // ====================================================================

  const saveText = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'lovestory',
        contentPatch: text,
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
  }, [slug, text, router]);

  const saveImages = useCallback(
    (next: string[], cleanupUrls: string[]) => {
      setStatus('saving');
      setErrText(null);
      startTransition(async () => {
        const res = await updateBereichContent({
          slug,
          bereich_key: 'lovestory',
          contentPatch: { images: next },
          cleanupUrls,
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
    },
    [slug, router],
  );

  // Debounced Text-Save
  const debounceRef = useRef<number | null>(null);
  const updateText = (field: keyof typeof text, value: string) => {
    setText((t) => ({ ...t, [field]: value }));
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(saveText, 1500);
  };
  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  // Image-Slot ändern
  const handleImageSlot = (idx: number) => (url: string | null) => {
    const prev = images[idx] || null;
    const next = [...images];
    if (url) {
      next[idx] = url;
    } else {
      next.splice(idx, 1);
    }
    setImages(next);
    saveImages(next, prev && prev !== url ? [prev] : []);
  };

  const onChange = (field: keyof typeof text) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateText(field, e.target.value);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-row">
          <div className="dash-form-field">
            <label className="dash-form-label">Eyebrow</label>
            <input
              className="dash-input"
              value={text.eyebrow}
              onChange={onChange('eyebrow')}
              placeholder="Wie alles anfing"
            />
          </div>
          <div className="dash-form-field">
            <label className="dash-form-label">Wann</label>
            <input
              className="dash-input"
              value={text.when}
              onChange={onChange('when')}
              placeholder="September 2019"
            />
          </div>
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText('title', v)}
          placeholder="Ein Donnerstagabend, [highlight]."
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Moment-Titel</label>
          <input
            className="dash-input"
            value={text.moment_title}
            onChange={onChange('moment_title')}
            placeholder="Das erste Treffen"
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea
            className="dash-input"
            rows={4}
            value={text.description}
            onChange={onChange('description')}
            placeholder="1-3 Sätze über euren Moment …"
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Signatur</label>
          <input
            className="dash-input"
            value={text.signature}
            onChange={onChange('signature')}
            placeholder="— Sarah & Iver"
          />
        </div>
      </section>

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Bilder (1 – 3)</h3>
        <p className="dash-form-section-desc">
          Drei Slots für eure Moment-Bilder. Schon ein Bild reicht — die anderen sind optional,
          machen das Layout aber lebendiger.
        </p>

        <div className="dash-form-row">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="dash-form-field">
              <ImageUploader
                image={images[idx] || null}
                folder={folder}
                ratio="4/5"
                maxHeight={220}
                label={`Bild ${idx + 1}${idx === 0 ? ' *' : ''}`}
                onUpload={handleImageSlot(idx)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ====================================================================
// Varianten B + C — Milestone-Liste
// ====================================================================

function LovestoryEditorBC({ slug, initial }: PropsBC) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    intro: initial.intro,
  });
  const [entries, setEntries] = useState<MilestoneInput[]>(initial.entries);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const folder = `sarahiver.de/${slug}/lovestory`;

  // ====================================================================
  // Save-Helpers
  // ====================================================================

  const saveText = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'lovestory',
        contentPatch: text,
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
  }, [slug, text, router]);

  const saveEntries = useCallback(
    (next: MilestoneInput[], cleanupUrls: string[] = []) => {
      setStatus('saving');
      setErrText(null);
      startTransition(async () => {
        const res = await updateBereichContent({
          slug,
          bereich_key: 'lovestory',
          contentPatch: { entries: next },
          cleanupUrls,
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
    },
    [slug, router],
  );

  // Debounced Text-Save
  const textDebounceRef = useRef<number | null>(null);
  const updateText = (field: keyof typeof text, value: string) => {
    setText((t) => ({ ...t, [field]: value }));
    if (textDebounceRef.current) window.clearTimeout(textDebounceRef.current);
    textDebounceRef.current = window.setTimeout(saveText, 1500);
  };
  useEffect(() => () => {
    if (textDebounceRef.current) window.clearTimeout(textDebounceRef.current);
  }, []);

  const onChange = (field: keyof typeof text) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateText(field, e.target.value);

  // ====================================================================
  // Milestone-Operationen
  // ====================================================================

  const debounceEntryRef = useRef<number | null>(null);
  const updateEntry = (id: string, field: keyof MilestoneInput, value: string) => {
    const next = entries.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setEntries(next);
    if (debounceEntryRef.current) window.clearTimeout(debounceEntryRef.current);
    debounceEntryRef.current = window.setTimeout(() => {
      saveEntries(next);
    }, 1500);
  };

  const updateEntryImage = (id: string) => (url: string | null) => {
    const target = entries.find((e) => e.id === id);
    const prev = target?.image_url || null;
    const next = entries.map((e) =>
      e.id === id ? { ...e, image_url: url || '' } : e,
    );
    setEntries(next);
    saveEntries(next, prev && prev !== url ? [prev] : []);
  };

  const addEntry = () => {
    const next: MilestoneInput[] = [
      ...entries,
      {
        id: `m-${Date.now()}-${entries.length}`,
        when: '',
        title: 'Neuer Meilenstein',
        description: '',
        image_url: '',
      },
    ];
    setEntries(next);
    saveEntries(next);
  };

  const deleteEntry = (id: string) => {
    if (!window.confirm('Diesen Meilenstein wirklich löschen?')) return;
    const target = entries.find((e) => e.id === id);
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveEntries(next, target?.image_url ? [target.image_url] : []);
  };

  const moveEntry = (id: string, direction: -1 | 1) => {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= entries.length) return;
    const next = [...entries];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setEntries(next);
    saveEntries(next);
  };

  useEffect(() => () => {
    if (debounceEntryRef.current) window.clearTimeout(debounceEntryRef.current);
  }, []);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-field">
          <label className="dash-form-label">Eyebrow</label>
          <input
            className="dash-input"
            value={text.eyebrow}
            onChange={onChange('eyebrow')}
            placeholder="Unsere Geschichte"
          />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText('title', v)}
          placeholder="Sieben Jahre [highlight] ein Tag."
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Intro</label>
          <textarea
            className="dash-input"
            rows={2}
            value={text.intro}
            onChange={onChange('intro')}
            placeholder="Wie aus einem Donnerstagabend in Hamburg ein langer Tisch geworden ist …"
          />
        </div>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Meilensteine ({entries.length})</h3>
            <p className="dash-form-section-desc">
              Jeder Meilenstein bekommt einen Zeitraum, Titel, Beschreibung und ein Bild.
              Verschiebt sie mit den Pfeilen — die Reihenfolge zeigt sich live auf eurer Seite.
            </p>
          </div>
          <button type="button" className="dash-btn" onClick={addEntry}>
            <DashboardIcon name="plus" size={14} />
            <span>Meilenstein hinzufügen</span>
          </button>
        </div>

        {entries.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine Meilensteine. Klickt auf „Meilenstein hinzufügen", um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {entries.map((e, idx) => (
            <MilestoneCard
              key={e.id}
              entry={e}
              folder={folder}
              isFirst={idx === 0}
              isLast={idx === entries.length - 1}
              onTextChange={(field, value) => updateEntry(e.id, field, value)}
              onImageChange={updateEntryImage(e.id)}
              onMoveUp={() => moveEntry(e.id, -1)}
              onMoveDown={() => moveEntry(e.id, 1)}
              onDelete={() => deleteEntry(e.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ====================================================================
// Milestone-Karte
// ====================================================================

function MilestoneCard({
  entry,
  folder,
  isFirst,
  isLast,
  onTextChange,
  onImageChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  entry: MilestoneInput;
  folder: string;
  isFirst: boolean;
  isLast: boolean;
  onTextChange: (field: keyof MilestoneInput, value: string) => void;
  onImageChange: (url: string | null) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="dash-milestone-card">
      <div className="dash-milestone-head">
        <span className="dash-milestone-when-preview">{entry.when || 'Wann?'}</span>
        <div className="dash-milestone-actions">
          <button
            type="button"
            className="dash-icon-btn"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Nach oben"
          >
            ↑
          </button>
          <button
            type="button"
            className="dash-icon-btn"
            onClick={onMoveDown}
            disabled={isLast}
            title="Nach unten"
          >
            ↓
          </button>
          <button
            type="button"
            className="dash-icon-btn is-danger"
            onClick={onDelete}
            title="Löschen"
          >
            <DashboardIcon name="trash" size={14} />
          </button>
        </div>
      </div>

      <div className="dash-milestone-grid">
        <div className="dash-milestone-image">
          <ImageUploader
            image={entry.image_url || null}
            folder={folder}
            ratio="4/3"
            maxHeight={180}
            label="Bild"
            onUpload={onImageChange}
          />
        </div>

        <div className="dash-milestone-fields">
          <div className="dash-form-field">
            <label className="dash-form-label">Wann</label>
            <input
              className="dash-input"
              value={entry.when}
              onChange={(e) => onTextChange('when', e.target.value)}
              placeholder="September 2019"
            />
          </div>
          <div className="dash-form-field">
            <label className="dash-form-label">Titel</label>
            <input
              className="dash-input"
              value={entry.title}
              onChange={(e) => onTextChange('title', e.target.value)}
              placeholder="Das erste Treffen"
            />
          </div>
          <div className="dash-form-field">
            <label className="dash-form-label">Beschreibung</label>
            <textarea
              className="dash-input"
              rows={2}
              value={entry.description}
              onChange={(e) => onTextChange('description', e.target.value)}
              placeholder="1-2 Sätze über diesen Moment …"
            />
          </div>
          <div className="dash-form-field">
            <label className="dash-form-label">Bild-Beschreibung (Alt-Text, optional)</label>
            <input
              className="dash-input"
              value={entry.image_alt || ''}
              onChange={(e) => onTextChange('image_alt', e.target.value)}
              placeholder="z.B. Sarah und Iver in einem Café"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
