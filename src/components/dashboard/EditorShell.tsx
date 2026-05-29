'use client';

import { useEffect, useState, type ReactNode } from 'react';
import DashboardIcon from './DashboardIcon';

/**
 * Hülle für Editor-Seiten (Bereich-Editoren UND globale Editoren wie
 * Stammdaten/Stil/Navigation).
 *
 * Desktop ≥ 1280px: dreispaltig (Sidebar | Editor | Live-Vorschau-iframe).
 * Desktop 880-1279px: nur Editor, Topbar-"Vorschau"-Link öffnet im neuen Tab.
 * Mobile < 880px:
 *   - mobileBlock=true (Bereich-Editoren): zeigt "nur Desktop"-Hinweis
 *   - mobileBlock=false (Stammdaten/Stil/Navigation): rendert den Editor
 *     auch auf Mobile, ohne Vorschau (das ist auf Mobile eh sinnlos).
 *
 * Die iframe-Quelle ist /[slug]?preview=1 — wenn bereichKey angegeben ist,
 * scrollt sie zum entsprechenden Anker. Sonst zeigt sie die Seite von oben.
 */

interface Props {
  weddingSlug: string;
  /** Optional — wenn gesetzt, scrollt die Vorschau zu #bereich-{key}. */
  bereichKey?: string;
  /** Standard true (Bereich-Editoren). False für globale Settings. */
  mobileBlock?: boolean;
  editorTitle?: string;
  editorDescription?: string;
  reloadKey?: number;
  children: ReactNode;
}

export default function EditorShell({
  weddingSlug,
  bereichKey,
  mobileBlock = true,
  editorTitle,
  editorDescription,
  reloadKey = 0,
  children,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 880);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setPreviewKey((k) => k + 1);
  }, [reloadKey]);

  // Custom Event von Editor-Forms: nach erfolgreichem Save reloaden wir das
  // Vorschau-iframe. Die Forms feuern window.dispatchEvent(new Event(
  // 'dashboard:editor-saved')) bei Erfolg.
  useEffect(() => {
    const onSaved = () => setPreviewKey((k) => k + 1);
    window.addEventListener('dashboard:editor-saved', onSaved);
    return () => window.removeEventListener('dashboard:editor-saved', onSaved);
  }, []);

  if (isMobile && mobileBlock) {
    return <MobileBlock weddingSlug={weddingSlug} />;
  }

  const previewSrc = bereichKey
    ? `/${weddingSlug}?preview=1#bereich-${bereichKey}`
    : `/${weddingSlug}?preview=1`;
  const previewLinkSrc = bereichKey
    ? `/${weddingSlug}#bereich-${bereichKey}`
    : `/${weddingSlug}`;

  return (
    <div className="dash-editor-shell">
      <div className="dash-editor-pane">
        {editorTitle && (
          <header className="dash-editor-pane-head">
            <h2 className="dash-editor-pane-title">{editorTitle}</h2>
            {editorDescription && <p className="dash-editor-pane-desc">{editorDescription}</p>}
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
            href={previewLinkSrc}
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
