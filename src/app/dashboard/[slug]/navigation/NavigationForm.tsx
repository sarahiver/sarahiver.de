'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateNavigation } from '../settings/actions';

type NavVariant = 'a' | 'b' | 'c' | 'none';

const VARIANTS: Array<{ id: NavVariant; label: string; desc: string }> = [
  { id: 'a', label: 'Variante A', desc: 'Klassisch — zentrale Menüleiste mit Markennamen mittig.' },
  { id: 'b', label: 'Variante B', desc: 'Minimalistisch — kleine Anker-Links, links ausgerichtet.' },
  { id: 'c', label: 'Variante C', desc: 'Dezent — nur ein kleines Burger-Menü oben rechts.' },
  { id: 'none', label: 'Keine Navigation', desc: 'Gäste scrollen einfach durch die Seite.' },
];

export default function NavigationForm({
  slug,
  initialVariant,
}: {
  slug: string;
  initialVariant: NavVariant;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [variant, setVariant] = useState<NavVariant>(initialVariant);

  const dirty = variant !== initialVariant;

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateNavigation({ slug, nav_variant: variant });
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Navigation gespeichert.' });
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
      } else {
        setMsg({ type: 'err', text: res.error || 'Konnte nicht gespeichert werden.' });
      }
    });
  };

  return (
    <div className="dash-form">
      <div className="dash-nav-variant-grid">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`dash-nav-variant-card ${variant === v.id ? 'is-active' : ''}`}
            onClick={() => setVariant(v.id)}
            disabled={pending}
          >
            <span className="dash-nav-variant-label">{v.label}</span>
            <span className="dash-nav-variant-desc">{v.desc}</span>
          </button>
        ))}
      </div>

      {msg && (
        <div className={`dash-form-msg ${msg.type === 'ok' ? 'is-ok' : 'is-err'}`}>{msg.text}</div>
      )}

      <div className="dash-form-foot">
        <button type="button" className="dash-btn" onClick={save} disabled={!dirty || pending}>
          {pending ? 'Wird gespeichert …' : dirty ? 'Navigation speichern' : 'Gespeichert'}
        </button>
      </div>
    </div>
  );
}
