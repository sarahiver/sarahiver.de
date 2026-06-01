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

interface PersonInput {
  id: string;
  name: string;
  role: string;
  photo: string;
  phone: string;
  email: string;
  whatsapp: string;
  intro: string;
}

interface Props {
  slug: string;
  initial: {
    eyebrow: string;
    title: string;
    description: string;
    persons: PersonInput[];
  };
}

/**
 * Trauzeugen-Editor.
 *
 * Texte + Personen-Liste mit Foto (Cloudinary), Rolle, Kontaktdaten.
 * Kontaktdaten werden auf der Gäste-Seite anti-crawl-encoded ausgegeben.
 */

export default function WitnessesEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [text, setText] = useState({
    eyebrow: initial.eyebrow,
    title: initial.title,
    description: initial.description,
  });
  const [persons, setPersons] = useState<PersonInput[]>(initial.persons);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const folder = `sarahiver.de/${slug}/witnesses`;

  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  const saveContent = useCallback((patch: Record<string, unknown>) => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'witnesses',
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
  const savePersons = useCallback((next: PersonInput[]) => saveContent({ persons: next }), [saveContent]);

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

  const debouncePersonsRef = useRef<number | null>(null);
  const updatePerson = (id: string, patch: Partial<PersonInput>) => {
    const next = persons.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setPersons(next);
    if (debouncePersonsRef.current) window.clearTimeout(debouncePersonsRef.current);
    debouncePersonsRef.current = window.setTimeout(() => savePersons(next), 1500);
  };

  const updatePersonPhoto = (id: string) => (url: string | null) => {
    const next = persons.map((p) => (p.id === id ? { ...p, photo: url || '' } : p));
    setPersons(next);
    savePersons(next);
  };

  const addPerson = () => {
    const next: PersonInput[] = [
      ...persons,
      {
        id: `p-${Date.now()}-${persons.length}`,
        name: 'Neue Person',
        role: 'Trauzeug:in',
        photo: '',
        phone: '',
        email: '',
        whatsapp: '',
        intro: '',
      },
    ];
    setPersons(next);
    savePersons(next);
  };

  const deletePerson = (id: string) => {
    const person = persons.find((p) => p.id === id);
    if (!person) return;
    if (!window.confirm(`Person „${person.name}“ wirklich löschen?`)) return;
    const next = persons.filter((p) => p.id !== id);
    setPersons(next);
    savePersons(next);
  };

  const movePerson = (id: string, dir: -1 | 1) => {
    const idx = persons.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= persons.length) return;
    const next = [...persons];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setPersons(next);
    savePersons(next);
  };

  useEffect(() => () => {
    if (debouncePersonsRef.current) window.clearTimeout(debouncePersonsRef.current);
  }, []);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Texte</h3>

        <div className="dash-form-field">
          <label className="dash-form-label">Eyebrow</label>
          <input className="dash-input" value={text.eyebrow} onChange={onText('eyebrow')} placeholder="Für den großen Tag" />
        </div>

        <HighlightInput
          label="Titel"
          value={text.title}
          onChange={(v) => updateText({ title: v })}
          placeholder="Unsere [highlight]"
        />

        <div className="dash-form-field">
          <label className="dash-form-label">Beschreibung</label>
          <textarea className="dash-input" rows={3} value={text.description} onChange={onText('description')} placeholder="Ihr habt Fragen zur Überraschung oder zur Orga? Wendet euch jederzeit an unsere Trauzeugen …" />
        </div>
      </section>

      <section className="dash-form-section">
        <div className="dash-form-section-head">
          <div>
            <h3 className="dash-form-section-title">Personen ({persons.length})</h3>
            <p className="dash-form-section-desc">
              Kontaktdaten werden auf der Gäste-Seite verschlüsselt ausgegeben (Anti-Crawl) und
              sind nur per Klick sichtbar.
            </p>
          </div>
          <button type="button" className="dash-btn" onClick={addPerson}>
            <DashboardIcon name="plus" size={14} />
            <span>Person hinzufügen</span>
          </button>
        </div>

        {persons.length === 0 && (
          <div className="dash-empty-inline">
            <p>Noch keine Personen. Klickt auf „Person hinzufügen“, um zu starten.</p>
          </div>
        )}

        <div className="dash-milestones">
          {persons.map((person, idx) => (
            <div key={person.id} className="dash-milestone-card">
              <div className="dash-milestone-head">
                <span className="dash-milestone-when-preview">{person.role || 'Rolle'}</span>
                <div className="dash-milestone-actions">
                  <button type="button" className="dash-icon-btn" onClick={() => movePerson(person.id, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="dash-icon-btn" onClick={() => movePerson(person.id, 1)} disabled={idx === persons.length - 1}>↓</button>
                  <button type="button" className="dash-icon-btn is-danger" onClick={() => deletePerson(person.id)} title="Löschen">
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="dash-milestone-grid">
                <div className="dash-milestone-image">
                  <ImageUploader
                    image={person.photo || null}
                    folder={folder}
                    ratio="1/1"
                    maxHeight={180}
                    label="Foto"
                    onUpload={updatePersonPhoto(person.id)}
                  />
                </div>

                <div className="dash-milestone-fields">
                  <div className="dash-form-row">
                    <div className="dash-form-field">
                      <label className="dash-form-label">Name</label>
                      <input className="dash-input" value={person.name} onChange={(e) => updatePerson(person.id, { name: e.target.value })} placeholder="Anna Müller" />
                    </div>
                    <div className="dash-form-field">
                      <label className="dash-form-label">Rolle</label>
                      <input className="dash-input" value={person.role} onChange={(e) => updatePerson(person.id, { role: e.target.value })} placeholder="Trauzeugin von Sarah" />
                    </div>
                  </div>
                  <div className="dash-form-row">
                    <div className="dash-form-field">
                      <label className="dash-form-label">E-Mail</label>
                      <input type="email" className="dash-input" value={person.email} onChange={(e) => updatePerson(person.id, { email: e.target.value })} placeholder="anna@…" />
                    </div>
                    <div className="dash-form-field">
                      <label className="dash-form-label">Telefon</label>
                      <input type="tel" className="dash-input" value={person.phone} onChange={(e) => updatePerson(person.id, { phone: e.target.value })} placeholder="+49 …" />
                    </div>
                  </div>
                  <div className="dash-form-field">
                    <label className="dash-form-label">WhatsApp (optional, internationale Nummer ohne +)</label>
                    <input className="dash-input" value={person.whatsapp} onChange={(e) => updatePerson(person.id, { whatsapp: e.target.value })} placeholder="491701234567" />
                  </div>
                  <div className="dash-form-field">
                    <label className="dash-form-label">Vorstellung (nur Variante C)</label>
                    <textarea className="dash-input" rows={2} value={person.intro} onChange={(e) => updatePerson(person.id, { intro: e.target.value })} placeholder="Kennt uns seit dem Studium …" />
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
