'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateNavigation } from '../settings/actions';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

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
  const [, startTransition] = useTransition();
  const [variant, setVariant] = useState<NavVariant>(initialVariant);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleSelect = (v: NavVariant) => {
    if (v === variant) return;
    setVariant(v);
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateNavigation({ slug, nav_variant: v });
      if (res.ok) {
        setStatus('ok');
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
      } else {
        setStatus('err');
        setErrText(res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  };

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <div className="dash-nav-variant-grid">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`dash-nav-variant-card ${variant === v.id ? 'is-active' : ''}`}
            onClick={() => handleSelect(v.id)}
            disabled={status === 'saving'}
          >
            <span className="dash-nav-variant-label">{v.label}</span>
            <span className="dash-nav-variant-desc">{v.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
