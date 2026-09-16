'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { GATE_COPY } from '@/lib/launch';
import { subscribeToLaunch } from '@/app/launch/actions';

type View = 'form' | 'sent' | 'already-confirmed';

/**
 * Anmeldung zur Launch-Liste.
 *
 * Nach dem Absenden wird nicht neu geladen, sondern der Zustand im Modal
 * getauscht — „Fast geschafft." mit dem Hinweis auf die Bestätigungsmail.
 * Die Checkbox ist bewusst leer vorbelegt.
 */
export default function LaunchSignupForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('form');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await subscribeToLaunch({ email, consent });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setView(res.state === 'already-confirmed' ? 'already-confirmed' : 'sent');
    });
  }

  if (view === 'sent') {
    return (
      <div className="sdlg-done" role="status">
        <h3>{GATE_COPY.sent.title}</h3>
        <p>{GATE_COPY.sent.text}</p>
        <p className="sdlg-fine">{GATE_COPY.sent.hint}</p>
      </div>
    );
  }

  if (view === 'already-confirmed') {
    return (
      <div className="sdlg-done" role="status">
        <h3>{GATE_COPY.already.title}</h3>
        <p>{GATE_COPY.already.text}</p>
      </div>
    );
  }

  return (
    <form className="sdlg-form" onSubmit={handleSubmit} noValidate>
      <label className="sdlg-label" htmlFor="sdlg-email">
        {GATE_COPY.formLabel}
      </label>

      <div className="sdlg-row">
        <input
          id="sdlg-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder={GATE_COPY.formPlaceholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'sdlg-error' : undefined}
        />
        <button type="submit" className="sdlg-btn sdlg-btn--primary" disabled={pending}>
          {pending ? GATE_COPY.submitting : GATE_COPY.submit}
        </button>
      </div>

      <label className="sdlg-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (error) setError(null);
          }}
        />
        <span>
          {GATE_COPY.consent}{' '}
          {GATE_COPY.privacyPrefix}{' '}
          <a href={GATE_COPY.privacyHref} target="_blank" rel="noreferrer noopener">
            {GATE_COPY.privacyLabel}
          </a>
          .
        </span>
      </label>

      {error && (
        <p className="sdlg-error" id="sdlg-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
