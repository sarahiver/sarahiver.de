'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import DashboardIcon from './DashboardIcon';

/**
 * Hülle für Editor-Seiten (Bereich-Editoren UND globale Editoren wie
 * Stammdaten/Stil/Navigation).
 *
 * Desktop ≥ 1280px: dreispaltig (Sidebar | Editor | Live-Vorschau-iframe).
 *   Preview ist sticky, bleibt beim Editor-Scrollen immer im Viewport.
 * Desktop 880-1279px: nur Editor, Topbar-"Vorschau"-Link öffnet im neuen Tab.
 * Mobile < 880px:
 *   - mobileBlock=true (Bereich-Editoren): zeigt "nur Desktop"-Hinweis
 *   - mobileBlock=false (Stammdaten/Stil/Navigation): nur Editor, ohne
 *     Vorschau (auf Mobile eh sinnlos)
 *
 * Reload-Verhalten: bei jedem Save-Event wird das iframe per src-Trick
 * (?t=timestamp) neu geladen. Nach dem Load scrollen wir programmatisch
 * zum Top des iframe-Dokuments — verhindert dass die Vorschau mitten in
 * der Seite landet.
 */

interface Props {
  weddingSlug: string;
  /** Optional — wenn gesetzt, scrollt die Vorschau zu #bereich-{key}. */
  bereichKey?: string;
  /** Standard true (Bereich-Editoren). False für globale Settings. */
  mobileBlock?: boolean;
  /** Optional zusätzlicher Query-String für die Vorschau, z.B. "&phase=std". */
  previewQuery?: string;
  editorTitle?: string;
  editorDescription?: string;
  reloadKey?: number;
  children: ReactNode;
}

export default function EditorShell({
  weddingSlug,
  bereichKey,
  mobileBlock = true,
  previewQuery = '',
  editorTitle,
  editorDescription,
  reloadKey = 0,
  children,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [previewBust, setPreviewBust] = useState(0);
  const [previewMode, setPreviewMode] = useState<'draft' | 'published'>('draft');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 880);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Externe Trigger-Quellen: reloadKey-Prop oder Custom-Event "dashboard:editor-saved"
  useEffect(() => {
    setPreviewBust((k) => k + 1);
  }, [reloadKey]);

  useEffect(() => {
    const onSaved = () => setPreviewBust((k) => k + 1);
    window.addEventListener('dashboard:editor-saved', onSaved);
    return () => window.removeEventListener('dashboard:editor-saved', onSaved);
  }, []);

  if (isMobile && mobileBlock) {
    return <MobileBlock weddingSlug={weddingSlug} />;
  }

  // src mit Cache-Bust-Param. Im Draft-Mode zeigen wir den Bearbeitungszustand,
  // im Live-Mode den von Gästen sichtbaren Stand.
  const bustSuffix = previewBust > 0 ? `&t=${previewBust}` : '';
  const anchor = bereichKey ? `#bereich-${bereichKey}` : '';
  const previewParam = previewMode === 'draft' ? '?preview=draft' : '?preview=1';
  const previewSrc = `/${weddingSlug}${previewParam}${previewQuery}${bustSuffix}${anchor}`;
  const previewLinkSrc = `/${weddingSlug}${anchor}`;

  // Nach jedem iframe-Load: zum Top des iframe-Dokuments scrollen. Das löst
  // das Problem, dass Reload manchmal in der Mitte/unten der Seite landet.
  // Geht nur, wenn Same-Origin — und das ist hier der Fall.
  const handleLoad = () => {
    try {
      const win = iframeRef.current?.contentWindow;
      if (win) {
        // wenn ein Anker da war, zum Anker scrollen, sonst zum Top
        if (bereichKey) {
          const el = win.document.getElementById(`bereich-${bereichKey}`);
          if (el) {
            el.scrollIntoView({ block: 'start', behavior: 'auto' });
            return;
          }
        }
        win.scrollTo(0, 0);
      }
    } catch {
      // Cross-Origin würde hier werfen — sollte aber nicht passieren
    }
  };

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
          <div className="dash-preview-toggle" role="tablist" aria-label="Vorschau-Modus">
            <button
              type="button"
              role="tab"
              aria-selected={previewMode === 'draft'}
              className={`dash-preview-toggle-btn ${previewMode === 'draft' ? 'is-active' : ''}`}
              onClick={() => {
                setPreviewMode('draft');
                setPreviewBust((k) => k + 1);
              }}
            >
              Bearbeitung
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={previewMode === 'published'}
              className={`dash-preview-toggle-btn ${previewMode === 'published' ? 'is-active' : ''}`}
              onClick={() => {
                setPreviewMode('published');
                setPreviewBust((k) => k + 1);
              }}
            >
              Live
            </button>
          </div>
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
            ref={iframeRef}
            src={previewSrc}
            title="Vorschau der Gäste-Seite"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={handleLoad}
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
