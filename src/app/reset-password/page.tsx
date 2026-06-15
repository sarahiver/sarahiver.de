'use client';

import { useState, useTransition } from 'react';
import { setNewPassword } from '../login/actions';
import { auStyles } from '../login/LoginForm';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    setMsg(null);
    if (password !== confirm) {
      setMsg('Die Passwörter stimmen nicht überein.');
      return;
    }
    start(async () => {
      const r = await setNewPassword(password);
      if (r?.error) setMsg(r.error);
      // bei Erfolg leitet die Action aufs Dashboard weiter
    });
  };

  return (
    <div className="au-wrap">
      <style>{auStyles}</style>
      <h1 className="au-title">Neues Passwort</h1>
      <p className="au-lede">Wählt ein Passwort für euren Account.</p>

      <div className="au-card">
        <label className="au-l">Neues Passwort</label>
        <input className="au-i" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mind. 8 Zeichen" />
        <label className="au-l">Wiederholen</label>
        <input className="au-i" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
        {msg && <div className="au-err">{msg}</div>}
        <button className="au-btn" type="button" onClick={submit} disabled={pending || !password || !confirm}>
          {pending ? 'Speichern …' : 'Passwort speichern'}
        </button>
      </div>
    </div>
  );
}
