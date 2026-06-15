'use client';

import { useState, useTransition } from 'react';
import { requestPasswordReset } from '../login/actions';
import { auStyles } from '../login/LoginForm';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      await requestPasswordReset(email);
      setSent(true);
    });
  };

  return (
    <div className="au-wrap">
      <style>{auStyles}</style>
      <h1 className="au-title">Passwort zurücksetzen</h1>
      <p className="au-lede">Wir schicken euch einen Link, über den ihr ein neues Passwort setzt.</p>

      {sent ? (
        <div className="au-ok">
          Falls ein Account zu dieser E-Mail existiert, ist der Link unterwegs. Schaut in euer Postfach.
        </div>
      ) : (
        <div className="au-card">
          <label className="au-l">E-Mail</label>
          <input className="au-i" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihr@email.de" />
          <button className="au-btn" type="button" onClick={submit} disabled={pending || !email}>
            {pending ? 'Senden …' : 'Reset-Link senden'}
          </button>
          <a className="au-link" href="/login">Zurück zum Login</a>
        </div>
      )}
    </div>
  );
}
