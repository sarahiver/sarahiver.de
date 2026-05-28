'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NavItem } from './nav-config';

/**
 * Inline-SVG-Icons für die Mobile-Tab-Bar (Variante C).
 * Schlanke Outline-Icons, keine externe Library nötig.
 * Key = der icon-String aus nav-config (ti-* Name, hier gemappt).
 */
function NavIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'ti-home':
      return <svg {...common}><path d="M5 12l-2 0 9-9 9 9-2 0" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /><path d="M9 21v-6h6v6" /></svg>;
    case 'ti-clock':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'ti-heart':
      return <svg {...common}><path d="M12 20l-7-7a4 4 0 0 1 6-5 4 4 0 0 1 6 5z" /></svg>;
    case 'ti-calendar-event':
      return <svg {...common}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M16 3v4M8 3v4M4 11h16" /><circle cx="12" cy="15" r="1.5" /></svg>;
    case 'ti-photo':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="M21 16l-5-5L5 19" /></svg>;
    case 'ti-mail':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
    case 'ti-gift':
      return <svg {...common}><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12M12 8C12 5 9 4 8 6s2 2 4 2zM12 8c0-3 3-4 4-2s-2 2-4 2z" /></svg>;
    case 'ti-bed':
      return <svg {...common}><path d="M3 7v11M3 13h18v5M21 18v-5a2 2 0 0 0-2-2H9v4" /><circle cx="6" cy="10" r="1.5" /></svg>;
    case 'ti-help-circle':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" /><circle cx="12" cy="17" r="0.5" /></svg>;
    case 'ti-users':
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5M21 20a6 6 0 0 0-3-5" /></svg>;
    case 'ti-music':
      return <svg {...common}><circle cx="6" cy="18" r="2.5" /><circle cx="17" cy="16" r="2.5" /><path d="M8.5 18V6l11-2v12" /></svg>;
    case 'ti-book':
      return <svg {...common}><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M5 16h13" /></svg>;
    case 'ti-camera-up':
      return <svg {...common}><path d="M5 7h3l1.5-2h5L16 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3" /></svg>;
    case 'ti-list':
      return <svg {...common}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>;
    case 'ti-map-pin':
      return <svg {...common}><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="2" /></svg>;
  }
}

/**
 * SiteNav — Site-weite Navigation in drei Varianten:
 *   a → Floating Pill (sticky, zentriert oben; Mobile: Dot-Reihe unten)
 *   b → Top-Bar mit Monogramm (Mobile: Hamburger → Fullscreen-Overlay)
 *   c → Vertikale Dots rechts (Mobile: Bottom-Tab-Bar mit Icons)
 *
 * Gemeinsam:
 *   - Scroll-Spy via IntersectionObserver (aktiver Bereich)
 *   - Smooth-Scroll zu #bereich-{key}
 *   - SSR-safe: initial active = erstes Item, post-Hydration aktualisiert
 */

interface Props {
  variant: 'a' | 'b' | 'c';
  items: NavItem[];
  coupleShort: string;
}

export function SiteNav({ variant, items, coupleShort }: Props) {
  const [activeKey, setActiveKey] = useState<string>(items[0]?.key ?? '');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll-Spy: beobachtet alle Bereich-Sections
  useEffect(() => {
    const sections = items
      .map((it) => document.getElementById(it.anchor))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Nimm den obersten sichtbaren Bereich
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          const item = items.find((it) => it.anchor === id);
          if (item) setActiveKey(item.key);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  // Scroll-Zustand (für Top-Bar Hintergrund)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body-Scroll-Lock wenn Mobile-Overlay offen
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const handleNav = useCallback((anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }, []);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  }, []);

  if (items.length === 0) return null;

  // ============ VARIANTE A — Floating Pill ============
  if (variant === 'a') {
    return (
      <>
        <nav className="snav snavA" aria-label="Seiten-Navigation">
          <div className="snavA-pill">
            <button
              type="button"
              className="snavA-home"
              onClick={scrollTop}
              aria-label="Zum Seitenanfang"
            >
              <NavIcon name="ti-home" />
            </button>
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                className={`snavA-link ${activeKey === it.key ? 'is-active' : ''}`}
                onClick={() => handleNav(it.anchor)}
              >
                {it.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile: Dot-Reihe unten */}
        <nav className="snav snavA-mobile" aria-label="Seiten-Navigation">
          <div className="snavA-dots">
            <button
              type="button"
              className="snavA-home-dot"
              onClick={scrollTop}
              aria-label="Zum Seitenanfang"
            >
              <NavIcon name="ti-home" />
            </button>
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                className={`snavA-dot ${activeKey === it.key ? 'is-active' : ''}`}
                onClick={() => handleNav(it.anchor)}
                aria-label={it.label}
              />
            ))}
          </div>
        </nav>
      </>
    );
  }

  // ============ VARIANTE B — Top-Bar mit Monogramm ============
  if (variant === 'b') {
    return (
      <nav
        className={`snav snavB ${scrolled ? 'is-scrolled' : ''}`}
        aria-label="Seiten-Navigation"
      >
        <div className="snavB-inner">
          <button type="button" className="snavB-logo" onClick={scrollTop}>
            {coupleShort}
          </button>

          <div className="snavB-links">
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                className={`snavB-link ${activeKey === it.key ? 'is-active' : ''}`}
                onClick={() => handleNav(it.anchor)}
              >
                {it.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="snavB-burger"
            onClick={() => setMobileOpen(true)}
            aria-label="Menü öffnen"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile Fullscreen-Overlay */}
        <div className={`snavB-overlay ${mobileOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            className="snavB-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Menü schließen"
          >
            ✕
          </button>
          <div className="snavB-overlay-links">
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                className={`snavB-overlay-link ${activeKey === it.key ? 'is-active' : ''}`}
                onClick={() => handleNav(it.anchor)}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  // ============ VARIANTE C — Vertikale Dots / Bottom-Tabs ============
  return (
    <>
      {/* Desktop: vertikale Dots rechts */}
      <nav className="snav snavC" aria-label="Seiten-Navigation">
        <div className="snavC-rail">
          <button
            type="button"
            className="snavC-item snavC-home"
            onClick={scrollTop}
            aria-label="Zum Seitenanfang"
          >
            <span className="snavC-label">Start</span>
            <span className="snavC-dot snavC-home-dot">
              <NavIcon name="ti-home" />
            </span>
          </button>
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              className={`snavC-item ${activeKey === it.key ? 'is-active' : ''}`}
              onClick={() => handleNav(it.anchor)}
              aria-label={it.label}
            >
              <span className="snavC-label">{it.label}</span>
              <span className="snavC-dot" />
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile: Bottom-Tab-Bar mit Icons */}
      <nav className="snav snavC-mobile" aria-label="Seiten-Navigation">
        <div className="snavC-tabs">
          <button
            type="button"
            className="snavC-tab snavC-tab-home"
            onClick={scrollTop}
            aria-label="Zum Seitenanfang"
          >
            <NavIcon name="ti-home" />
          </button>
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              className={`snavC-tab ${activeKey === it.key ? 'is-active' : ''}`}
              onClick={() => handleNav(it.anchor)}
              aria-label={it.label}
            >
              <NavIcon name={it.icon} />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
