'use client';

import { useState } from 'react';

export interface EmailTemplate {
  label: string;
  subject: string;
  body: string;
}

interface Props {
  template: EmailTemplate;
  recipientCount: number;
  recipientPreview: string; // "Anna, Max, Lisa..."
  onCancel: () => void;
  onSend: (subject: string, body: string) => void;
  pending: boolean;
}

/**
 * Email-Preview-Modal vor dem Versand.
 *
 * Subject und Body sind editierbar — das Brautpaar kann den Wortlaut der
 * Templates anpassen, bevor abgeschickt wird. [Name] wird beim echten
 * Versand pro Empfänger ersetzt (passiert serverseitig in Brevo später).
 */
export default function EmailPreviewModal({
  template,
  recipientCount,
  recipientPreview,
  onCancel,
  onSend,
  pending,
}: Props) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);

  return (
    <div className="dash-modal-backdrop" onClick={onCancel}>
      <div className="dash-modal dash-modal-wide" onClick={(e) => e.stopPropagation()}>
        <h3 className="dash-modal-title">{template.label} — Vorschau</h3>
        <p className="dash-modal-desc">
          Empfänger: <strong>{recipientCount} Gäste</strong>
          {recipientPreview && (
            <span style={{ color: 'var(--dash-muted)' }}> ({recipientPreview}…)</span>
          )}
          . Platzhalter <code>[Name]</code> wird beim Versand pro Empfänger ersetzt.
        </p>

        <div className="dash-form-field">
          <label className="dash-form-label">Betreff</label>
          <input
            type="text"
            className="dash-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="dash-form-field">
          <label className="dash-form-label">Nachricht</label>
          <textarea
            className="dash-input"
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={pending}
            style={{ fontFamily: 'inherit', lineHeight: 1.5 }}
          />
        </div>

        <div className="dash-form-hint" style={{ background: 'var(--dash-warning-soft)', padding: '8px 12px', borderRadius: 6, color: 'var(--dash-warning)' }}>
          ⚠ Der echte Email-Versand ist noch nicht aktiv (kommt mit Brevo-Anbindung). Aktuell
          werden die Empfänger als „erinnert" markiert, aber es geht noch keine echte Mail raus.
        </div>

        <div className="dash-modal-actions">
          <button type="button" className="dash-btn-out" onClick={onCancel} disabled={pending}>
            Abbrechen
          </button>
          <button type="button" className="dash-btn" onClick={() => onSend(subject, body)} disabled={pending}>
            {pending ? 'Wird vorbereitet…' : `An ${recipientCount} Gäste vorbereiten`}
          </button>
        </div>
      </div>
    </div>
  );
}
