'use client';

import { useState, type FormEvent } from 'react';
import { DOMAIN } from '@/lib/landing-v4';
import { IconArrowRight, IconCheck } from './icons';

type Status = 'idle' | 'checking' | 'free' | 'taken' | 'unknown' | 'invalid';

/**
 * Wunschdomain prüfen.
 *
 * Fragt /api/domain/check (RDAP) und zeigt das Ergebnis direkt hier an —
 * der Klick landet NICHT mehr blind im Funnel. Weiter geht das Paar erst über
 * den Button unter dem Ergebnis, dann mit der geprüften Domain im Signup
 * vorbelegt (?domain=…).
 */
export default function DomainCheck() {
  const [value, setValue] = useState('');
  const [tld, setTld] = useState(DOMAIN.tlds[0]);
  const [status, setStatus] = useState<Status>('idle');
  const [checked, setChecked] = useState('');

  function normalize(raw: string) {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\.[a-z]{2,20}$/, '')
      .replace(/[^a-z0-9äöüß-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = normalize(value);

    if (name.length < 3) {
      setStatus('invalid');
      setChecked('');
      return;
    }

    const domain = `${name}${tld}`;
    setChecked(domain);
    setStatus('checking');

    try {
      const res = await fetch(`/api/domain/check?domain=${encodeURIComponent(domain)}`);
      const data = (await res.json()) as { ok?: boolean; status?: string };
      if (data?.ok && (data.status === 'free' || data.status === 'taken')) {
        setStatus(data.status);
      } else {
        setStatus('unknown');
      }
    } catch {
      setStatus('unknown');
    }
  }

  const r = DOMAIN.results;

  return (
    <>
      <form className="sd-domain-form" onSubmit={handleSubmit}>
        <span className="sd-domain-pfx" aria-hidden>
          {DOMAIN.prefix}
        </span>

        <label className="sr-only" htmlFor="sd-domain-input">
          Wunschdomain
        </label>
        <input
          id="sd-domain-input"
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder={DOMAIN.placeholder}
          autoComplete="off"
          spellCheck={false}
        />

        <label className="sr-only" htmlFor="sd-domain-tld">
          Endung
        </label>
        <select
          id="sd-domain-tld"
          className="sd-domain-tld"
          value={tld}
          onChange={(e) => {
            setTld(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
        >
          {DOMAIN.tlds.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="sd-btn sd-btn--gold sd-btn--sm"
          disabled={status === 'checking'}
        >
          {status === 'checking' ? DOMAIN.checking : DOMAIN.cta}
        </button>
      </form>

      <div className="sd-domain-result" role="status" aria-live="polite">
        {status === 'invalid' && (
          <p className="sd-domain-msg">Gebt einen Wunschnamen mit mindestens 3 Zeichen ein.</p>
        )}

        {status === 'free' && (
          <div className="sd-domain-ok">
            <p className="sd-domain-msg">
              <IconCheck size={15} />
              <b>{checked}</b> {r.free}
            </p>
            <a
              className="sd-btn sd-btn--gold sd-btn--sm"
              href={`${DOMAIN.target}?domain=${encodeURIComponent(checked)}`}
            >
              {r.freeCta}
              <IconArrowRight size={14} />
            </a>
            <span className="sd-domain-fine">{r.priceHint}</span>
          </div>
        )}

        {status === 'taken' && (
          <p className="sd-domain-msg">
            <b>{checked}</b> {r.taken} {r.takenHint}
          </p>
        )}

        {status === 'unknown' && (
          <p className="sd-domain-msg">
            <b>{checked}</b> {r.unknown}
          </p>
        )}
      </div>
    </>
  );
}
