'use client';

import { useState, useCallback } from 'react';

/**
 * Buchungscode-Badge mit Copy-to-Clipboard.
 * Client Component (navigator.clipboard). SSR-safe: initialer Text
 * ist immer "Kopieren", erst nach Klick "Kopiert ✓".
 */
export function CopyCode({ code, id }: { code: string; id: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard nicht verfügbar — still ignorieren
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }, [code]);

  return (
    <button
      type="button"
      className={`acc-code ${copied ? 'copied' : ''}`}
      onClick={onCopy}
      aria-label={`Stichwort ${code} kopieren`}
    >
      <span className="lab">Stichwort</span>
      <span className="val" data-editable={`accommodations.items.${id}.booking_code`} data-edit-type="text">
        {code}
      </span>
      <span className="copy-hint">{copied ? 'Kopiert ✓' : 'Kopieren'}</span>
    </button>
  );
}
