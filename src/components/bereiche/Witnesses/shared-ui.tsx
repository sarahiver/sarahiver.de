'use client';

import { useState, useCallback, useRef } from 'react';
import {
  renderTitleWithEm,
  initialsOf,
  buildContacts,
  type Person,
  type ContactKind,
} from './shared';
import { IconPhone, IconMail, IconWhatsApp } from './icons';

export function WitHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="wit-head">
      {eyebrow && (
        <p className="wit-eyebrow" data-editable="witnesses.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="wit-title"
        data-editable="witnesses.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="wit-head-ornament" aria-hidden="true" />
      {description && (
        <p className="wit-desc" data-editable="witnesses.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

export function WitPhoto({ person, className = '' }: { person: Person; className?: string }) {
  return (
    <div className={`wit-photo ${className}`}>
      {person.photo ? (
        <img src={person.photo} alt="" />
      ) : (
        <div className="wit-photo-initials">{initialsOf(person.name)}</div>
      )}
    </div>
  );
}

/** Client-seitige base64-Dekodierung (UTF-8-safe), Gegenstück zu encodeContact. */
function decodeContact(encoded: string): string {
  if (!encoded) return '';
  try {
    const latin1 = atob(encoded);
    const bytes = new Uint8Array(latin1.length);
    for (let i = 0; i < latin1.length; i++) {
      bytes[i] = latin1.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

/**
 * Kontakt-Buttons mit Spam-Schutz.
 *
 * Im DOM steht nur der kodierte Wert (data-c). Erst beim Klick wird er
 * dekodiert und die Aktion ausgelöst (tel:/mailto:/wa.me). Kurzer Reveal-
 * Toast als Feedback. Keine tel:/mailto:-Links im Markup → crawl-sicher.
 */
export function WitContacts({
  person,
  className = '',
}: {
  person: Person;
  className?: string;
}) {
  const contacts = buildContacts(person);
  const [revealedKind, setRevealedKind] = useState<ContactKind | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleClick = useCallback((kind: ContactKind, encoded: string) => {
    const raw = decodeContact(encoded);
    if (raw) {
      let href = '';
      if (kind === 'tel') href = 'tel:' + raw.replace(/\s/g, '');
      else if (kind === 'mail') href = 'mailto:' + raw;
      else if (kind === 'wa') href = 'https://wa.me/' + raw.replace(/[^\d]/g, '');
      if (href) window.location.href = href;
    }
    // Kurzes visuelles Feedback
    setRevealedKind(kind);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setRevealedKind(null), 1400);
  }, []);

  if (contacts.length === 0) return null;

  return (
    <div className={`wit-contacts ${className}`}>
      {contacts.map((c) => (
        <button
          key={c.kind}
          type="button"
          className={`wit-btn ${revealedKind === c.kind ? 'is-revealed' : ''}`}
          data-kind={c.kind}
          data-c={c.encoded}
          data-reveal-label={c.revealLabel}
          aria-label={c.ariaLabel}
          onClick={() => handleClick(c.kind, c.encoded)}
        >
          {c.kind === 'tel' && <IconPhone />}
          {c.kind === 'mail' && <IconMail />}
          {c.kind === 'wa' && <IconWhatsApp />}
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}

export function WitEmpty() {
  return (
    <div className="wit-empty">
      <div className="wit-ornament" aria-hidden="true" />
      <span>Ansprechpartner folgen in Kürze.</span>
    </div>
  );
}
