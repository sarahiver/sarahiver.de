'use client';

import { useCallback, useEffect, useRef, useState, useTransition, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateStammdaten, setAccountPassword } from './actions';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

interface Props {
  slug: string;
  initial: {
    couple_name_1: string;
    couple_name_2: string;
    wedding_date_local: string;
    wedding_time_local: string;
    wedding_location: string;
  };
}

/**
 * Stammdaten-Tab mit Auto-Save:
 *  - Text-Inputs: debounced 1500ms nach letzter Eingabe
 *  - Datum/Zeit: debounced 500ms (Picker liefert einen Final-Wert beim Schließen)
 *
 * Kein Speichern-Button. Status-Indikator oben.
 */
export default function StammdatenTab({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [name1, setName1] = useState(initial.couple_name_1);
  const [name2, setName2] = useState(initial.couple_name_2);
  const [date, setDate] = useState(initial.wedding_date_local);
  const [time, setTime] = useState(initial.wedding_time_local);
  const [location, setLocation] = useState(initial.wedding_location);

  // Passwort-Abschnitt — bewusste Aktion mit Button, KEIN Auto-Save.
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const savePassword = useCallback(() => {
    setPwMsg(null);
    if (pw1.length < 8) {
      setPwMsg({ ok: false, text: 'Passwort muss mindestens 8 Zeichen haben.' });
      return;
    }
    if (pw1 !== pw2) {
      setPwMsg({ ok: false, text: 'Die beiden Passwörter stimmen nicht überein.' });
      return;
    }
    setPwBusy(true);
    startTransition(async () => {
      const res = await setAccountPassword(pw1);
      setPwBusy(false);
      if (res.ok) {
        setPw1('');
        setPw2('');
        setPwMsg({ ok: true, text: 'Passwort gespeichert. Ihr könnt euch ab jetzt auch mit Passwort einloggen.' });
      } else {
        setPwMsg({ ok: false, text: res.error || 'Passwort konnte nicht gesetzt werden.' });
      }
    });
  }, [pw1, pw2]);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const latestRef = useRef({ name1, name2, date, time, location });
  latestRef.current = { name1, name2, date, time, location };

  const doSave = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    const v = latestRef.current;
    startTransition(async () => {
      const res = await updateStammdaten({
        slug,
        couple_name_1: v.name1,
        couple_name_2: v.name2,
        wedding_date_local: v.date,
        wedding_time_local: v.time,
        wedding_location: v.location,
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

  // Debouncer pro Feld-Gruppe
  const textDebounceRef = useRef<number | null>(null);
  const triggerTextSave = useCallback(() => {
    if (textDebounceRef.current) window.clearTimeout(textDebounceRef.current);
    textDebounceRef.current = window.setTimeout(() => doSave(), 1500);
  }, [doSave]);

  const dateDebounceRef = useRef<number | null>(null);
  const triggerDateSave = useCallback(() => {
    if (dateDebounceRef.current) window.clearTimeout(dateDebounceRef.current);
    dateDebounceRef.current = window.setTimeout(() => doSave(), 500);
  }, [doSave]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (textDebounceRef.current) window.clearTimeout(textDebounceRef.current);
      if (dateDebounceRef.current) window.clearTimeout(dateDebounceRef.current);
    };
  }, []);

  const handleText = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    triggerTextSave();
  };
  const handleDateTime = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    triggerDateSave();
  };

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <div className="dash-form-row">
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="cn1">Partner 1 — Vorname</label>
          <input id="cn1" type="text" className="dash-input" value={name1} onChange={handleText(setName1)} placeholder="z.B. Sarah" />
        </div>
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="cn2">Partner 2 — Vorname</label>
          <input id="cn2" type="text" className="dash-input" value={name2} onChange={handleText(setName2)} placeholder="z.B. Iver" />
        </div>
      </div>

      <div className="dash-form-row">
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="wd">Datum</label>
          <input id="wd" type="date" className="dash-input" value={date} onChange={handleDateTime(setDate)} />
        </div>
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="wt">Uhrzeit</label>
          <input id="wt" type="time" className="dash-input" value={time} onChange={handleDateTime(setTime)} />
        </div>
      </div>

      <div className="dash-form-field">
        <label className="dash-form-label" htmlFor="wl">Hauptlocation</label>
        <input id="wl" type="text" className="dash-input" value={location} onChange={handleText(setLocation)} placeholder="z.B. Liberté Hamburg" />
        <p className="dash-form-hint">
          Kurze Bezeichnung — Adresse und Wegbeschreibung pflegt ihr im Anfahrt-Editor.
        </p>
      </div>

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Passwort</h3>
        <p className="dash-form-section-desc">
          Optional: Legt ein Passwort fest, um euch künftig auch ohne Magic-Link einzuloggen.
          Der Login per Magic-Link funktioniert weiterhin.
        </p>

        <div className="dash-form-row">
          <div className="dash-form-field">
            <label className="dash-form-label" htmlFor="pw1">Neues Passwort</label>
            <input
              id="pw1"
              type="password"
              className="dash-input"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              autoComplete="new-password"
            />
          </div>
          <div className="dash-form-field">
            <label className="dash-form-label" htmlFor="pw2">Wiederholen</label>
            <input
              id="pw2"
              type="password"
              className="dash-input"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {pwMsg && (
          <p className={`dash-form-msg ${pwMsg.ok ? 'is-ok' : 'is-err'}`}>{pwMsg.text}</p>
        )}

        <button type="button" className="dash-btn" onClick={savePassword} disabled={pwBusy}>
          {pwBusy ? 'Wird gespeichert …' : 'Passwort festlegen'}
        </button>
      </section>
    </div>
  );
}
