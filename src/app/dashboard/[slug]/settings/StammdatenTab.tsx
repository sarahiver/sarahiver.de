'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStammdaten } from './actions';

interface Props {
  slug: string;
  initial: {
    couple_name_1: string;
    couple_name_2: string;
    wedding_date_local: string; // "2026-11-15"
    wedding_time_local: string; // "14:00"
    wedding_location: string;
  };
}

/**
 * Stammdaten-Tab — Vornamen, Datum, Uhrzeit, Hauptlocation.
 *
 * Speichert über Server Action, zeigt Erfolgs/Fehler-Notiz, refresht
 * danach (Live-Vorschau aktualisiert sich via revalidatePath).
 */
export default function StammdatenTab({ slug, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [name1, setName1] = useState(initial.couple_name_1);
  const [name2, setName2] = useState(initial.couple_name_2);
  const [date, setDate] = useState(initial.wedding_date_local);
  const [time, setTime] = useState(initial.wedding_time_local);
  const [location, setLocation] = useState(initial.wedding_location);

  const dirty =
    name1 !== initial.couple_name_1 ||
    name2 !== initial.couple_name_2 ||
    date !== initial.wedding_date_local ||
    time !== initial.wedding_time_local ||
    location !== initial.wedding_location;

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateStammdaten({
        slug,
        couple_name_1: name1,
        couple_name_2: name2,
        wedding_date_local: date,
        wedding_time_local: time,
        wedding_location: location,
      });
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Stammdaten gespeichert.' });
        router.refresh();
      } else {
        setMsg({ type: 'err', text: res.error || 'Konnte nicht gespeichert werden.' });
      }
    });
  };

  return (
    <div className="dash-form">
      <div className="dash-form-row">
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="cn1">Partner 1 — Vorname</label>
          <input
            id="cn1"
            type="text"
            className="dash-input"
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            disabled={pending}
            placeholder="z.B. Sarah"
          />
        </div>
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="cn2">Partner 2 — Vorname</label>
          <input
            id="cn2"
            type="text"
            className="dash-input"
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            disabled={pending}
            placeholder="z.B. Iver"
          />
        </div>
      </div>

      <div className="dash-form-row">
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="wd">Datum</label>
          <input
            id="wd"
            type="date"
            className="dash-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="wt">Uhrzeit</label>
          <input
            id="wt"
            type="time"
            className="dash-input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div className="dash-form-field">
        <label className="dash-form-label" htmlFor="wl">Hauptlocation</label>
        <input
          id="wl"
          type="text"
          className="dash-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={pending}
          placeholder="z.B. Liberté Hamburg"
        />
        <p className="dash-form-hint">
          Kurze Bezeichnung — Adresse und Wegbeschreibung pflegt ihr im Anfahrt-Editor.
        </p>
      </div>

      {msg && (
        <div className={`dash-form-msg ${msg.type === 'ok' ? 'is-ok' : 'is-err'}`}>{msg.text}</div>
      )}

      <div className="dash-form-foot">
        <button
          type="button"
          className="dash-btn"
          onClick={save}
          disabled={!dirty || pending}
        >
          {pending ? 'Wird gespeichert …' : dirty ? 'Stammdaten speichern' : 'Gespeichert'}
        </button>
      </div>
    </div>
  );
}
