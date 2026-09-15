'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DOMAIN } from '@/lib/landing-v4';

/**
 * Wunschdomain-Eingabe.
 *
 * MVP: noch keine Registrar-API angebunden. Die Eingabe wird normalisiert und
 * als ?domain= an den Signup weitergereicht — die Verfügbarkeit klärt sich bei
 * der Einrichtung. Sobald eine Registrar-API steht (INWX/Netcup), wird hier
 * nur `handleSubmit` gegen einen echten Check getauscht.
 */
export default function DomainCheck() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [tld, setTld] = useState(DOMAIN.tlds[0]);
  const [hint, setHint] = useState('');

  function normalize(raw: string) {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^www\./, '')
      .replace(/\.(de|com|hochzeit)$/, '')
      .replace(/[^a-z0-9äöüß-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = normalize(value);

    if (!name) {
      setHint('Gebt einen Wunschnamen ein, z. B. lea-und-ben.');
      return;
    }
    if (name.length < 3) {
      setHint('Der Name braucht mindestens 3 Zeichen.');
      return;
    }

    setHint('');
    router.push(`${DOMAIN.target}?domain=${encodeURIComponent(name + tld)}`);
  }

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
            if (hint) setHint('');
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
          onChange={(e) => setTld(e.target.value)}
        >
          {DOMAIN.tlds.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button type="submit" className="sd-btn sd-btn--gold sd-btn--sm">
          {DOMAIN.cta}
        </button>
      </form>

      <p className="sd-domain-hint" role="status">
        {hint}
      </p>
    </>
  );
}
