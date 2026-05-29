'use client';

import { useEffect, useState, type ReactNode } from 'react';
import DashboardIcon from './DashboardIcon';

/**
 * Hülle für Bereich-Editoren.
 *
 * Desktop ≥ 1280px: dreispaltig
 *   ├─ (Sidebar liegt schon im Layout darüber)
 *   ├─ Editor-Felder (Mitte, ~480-560px)
 *   └─ Live-Vorschau rechts (iframe auf /[slug], scrollt zum Bereich)
 *
 * Desktop 880-1279px: nur Editor-Felder + Topbar-"Vorschau"-Link.
 * Mobile < 880px: Mobile-Block ("Editor nur am Desktop").
 *
 * Die Live-Vorschau lädt /[slug]?preview=1#bereich-{bereichKey} und scrollt
 * dorthin. Nach einem Save kannst du via reloadKey ein refresh erzwingen.
 */

interface Props {
  bereichKey: string;
  weddingSlug: string;
  editorTitle?: string;
  editorDescription?: string;
  reloadKey?: number; // bei Änderung wird die Vorschau neu geladen
  children: ReactNode;
}

export default function EditorShell({
  bereichKey,
  weddingSlug,
  editorTitle,
  editorDescription,
  reloadKey = 0,
  children,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Mobile-Detection nur clientseitig (SSR sieht "nicht-mobile", Fix nach Mount)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 880);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // iframe-Reload, wenn der Editor speichert (reloadKey ändert sich)
  useEffect(() => {
    setPreviewKey((k) => k + 1);
  }, [reloadKey]);

  if (isMobile) {
    return <MobileBlock weddingSlug={weddingSlug} />;
  }

  const previewSrc = `/${weddingSlug}?preview=1#bereich-${bereichKey}`;

  return (
    <div className="dash-editor-shell">
      <div className="dash-editor-pane">
        {editorTitle && (
          <header className="dash-editor-pane-head">
            <h2 className="dash-editor-pane-title">{editorTitle}</h2>
            {editorDescription && (
              <p className="dash-editor-pane-desc">{editorDescription}</p>
            )}
          </header>
        )}
        <div className="dash-editor-pane-body">{children}</div>
      </div>

      <div className="dash-preview-pane">
        <div className="dash-preview-pane-bar">
          <span className="dash-preview-pane-label">
            <DashboardIcon name="external" size={12} />
            <span>Live-Vorschau</span>
          </span>
          <a
            href={`/${weddingSlug}#bereich-${bereichKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-preview-pane-open"
          >
            In neuem Tab öffnen
          </a>
        </div>
        <div className="dash-preview-pane-frame">
          <iframe
            key={previewKey}
            src={previewSrc}
            title="Vorschau der Gäste-Seite"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  );
}

function MobileBlock({ weddingSlug }: { weddingSlug: string }) {
  return (
    <div className="dash-mobile-block">
      <div className="dash-mobile-block-icon" aria-hidden="true">
        <DashboardIcon name="sliders" size={28} />
      </div>
      <h2 className="dash-mobile-block-title">Inhalte am Desktop bearbeiten</h2>
      <p className="dash-mobile-block-desc">
        Die Editor-Ansicht mit Live-Vorschau funktioniert am besten am Laptop oder Desktop. Bitte
        meldet euch dort an, um Inhalte zu bearbeiten.
      </p>
      <a
        href={`/${weddingSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="dash-btn-out dash-mobile-block-cta"
      >
        <DashboardIcon name="external" size={14} />
        <span>Eure Seite ansehen</span>
      </a>
      <p className="dash-mobile-block-hint">
        Dashboard-Übersicht, RSVPs, Gästebuch und Stammdaten könnt ihr auch am Handy pflegen.
      </p>
    </div>
  );
}
