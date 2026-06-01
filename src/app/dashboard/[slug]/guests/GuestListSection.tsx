'use client';

import { useMemo, useState, useTransition, type ChangeEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { GuestListEntry } from '@/lib/guest-list-data';
import type { RsvpRecord } from '@/lib/rsvp-data';
import { parseCsv, parseXlsx, isXlsxFile, type ParsedGuest } from './parsers';
import {
  uploadGuestList,
  deleteGuestEntry,
  clearGuestList,
  sendReminders,
  type ReminderType,
} from './actions';
import EmailPreviewModal, { type EmailTemplate } from './EmailPreviewModal';
import DashboardIcon from '@/components/dashboard/DashboardIcon';

/**
 * Gästeliste-Section im Dashboard.
 *
 * Funktionen:
 *  - Status-Cards (Total / Confirmed / Declined / Pending / Reminded)
 *  - CSV/XLSX-Upload mit Duplikat-Erkennung
 *  - Tabelle mit Status pro Gast (Abgleich gegen wedding_rsvps via Email)
 *  - Erinnerungs-Mail-Versand an pending Gäste (mit Preview, Stub bis Brevo)
 *  - Danke-Mail an confirmed Gäste (Stub)
 *  - Foto-Erinnerungs-Mail an confirmed Gäste (Stub)
 */

interface Props {
  slug: string;
  coupleNames: string;
  weddingDateIso: string | null;
  hasPhotoUpload: boolean;
  guestList: GuestListEntry[];
  rsvps: RsvpRecord[];
}

interface EnrichedGuest extends GuestListEntry {
  status: 'pending' | 'confirmed' | 'declined';
}

function enrich(guests: GuestListEntry[], rsvps: RsvpRecord[]): EnrichedGuest[] {
  // E-Mail → RSVP-Eintrag-Map für O(1)-Lookup
  const rsvpByEmail = new Map<string, RsvpRecord>();
  for (const r of rsvps) {
    if (r.email) rsvpByEmail.set(r.email.toLowerCase(), r);
  }

  return guests.map((g) => {
    const match = rsvpByEmail.get(g.email.toLowerCase());
    let status: EnrichedGuest['status'] = 'pending';
    if (match) status = match.attending ? 'confirmed' : 'declined';
    return { ...g, status };
  });
}

export default function GuestListSection({
  slug,
  coupleNames,
  weddingDateIso,
  hasPhotoUpload,
  guestList,
  rsvps,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{
    type: ReminderType;
    template: EmailTemplate;
    recipients: EnrichedGuest[];
  } | null>(null);

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2800);
  };

  /**
   * Lädt eine Beispiel-CSV herunter, die User in Excel öffnen, befüllen
   * und wieder hochladen können. UTF-8 mit BOM + Semikolon = Excel-DE-
   * kompatibel.
   */
  const downloadExampleCsv = () => {
    const lines = [
      'Name;Email;Gruppe',
      'Anna Müller;anna.mueller@example.de;Familie',
      'Max Schmidt;max.schmidt@example.de;Freunde',
      'Lisa Weber;lisa.weber@example.de;Kollegen',
      'Thomas & Julia Schäfer;schaefer@example.de;Familie',
    ];
    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gaesteliste-vorlage.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const enriched = useMemo(() => enrich(guestList, rsvps), [guestList, rsvps]);

  const stats = useMemo(() => {
    const total = enriched.length;
    const confirmed = enriched.filter((g) => g.status === 'confirmed').length;
    const declined = enriched.filter((g) => g.status === 'declined').length;
    const pending = enriched.filter((g) => g.status === 'pending').length;
    const reminded = enriched.filter((g) => g.reminder_sent_at).length;
    return { total, confirmed, declined, pending, reminded };
  }, [enriched]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return enriched;
    return enriched.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.email.toLowerCase().includes(term) ||
        g.group_name.toLowerCase().includes(term),
    );
  }, [enriched, searchTerm]);

  const pendingGuests = useMemo(() => enriched.filter((g) => g.status === 'pending'), [enriched]);
  const confirmedGuests = useMemo(
    () => enriched.filter((g) => g.status === 'confirmed'),
    [enriched],
  );

  // ====================================================================
  // Upload
  // ====================================================================
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      let parsed: ParsedGuest[] | null;
      if (isXlsxFile(file.name)) {
        const buffer = await file.arrayBuffer();
        parsed = await parseXlsx(buffer);
      } else {
        const text = await file.text();
        parsed = parseCsv(text);
      }

      if (parsed === null) {
        notify('err', 'Ungültiges Format. Die Datei braucht mindestens die Spalten "Name" und "Email".');
        return;
      }
      if (parsed.length === 0) {
        notify('err', 'Keine gültigen Einträge gefunden.');
        return;
      }

      const res = await uploadGuestList(slug, parsed);
      if (res.ok) {
        notify('ok', `${res.count ?? parsed.length} Gäste importiert.`);
        setShowUpload(false);
        router.refresh();
      } else {
        notify('err', res.error || 'Upload fehlgeschlagen.');
      }
    } catch (err) {
      console.error(err);
      notify('err', 'Fehler beim Lesen der Datei.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset, damit dieselbe Datei nochmal hochgeladen werden kann
    }
  };

  // ====================================================================
  // Delete / Clear
  // ====================================================================
  const handleDelete = (id: string) => {
    if (!window.confirm('Gast aus der Liste entfernen?')) return;
    startTransition(async () => {
      const res = await deleteGuestEntry(slug, id);
      if (res.ok) {
        notify('ok', 'Gast entfernt.');
        router.refresh();
      } else {
        notify('err', res.error || 'Konnte nicht entfernt werden.');
      }
    });
  };

  const handleClear = () => {
    startTransition(async () => {
      const res = await clearGuestList(slug);
      if (res.ok) {
        notify('ok', 'Gästeliste geleert.');
        setShowConfirmClear(false);
        router.refresh();
      } else {
        notify('err', res.error || 'Konnte nicht geleert werden.');
      }
    });
  };

  // ====================================================================
  // Email-Templates + Versand-Stub
  // ====================================================================
  const weddingDate = weddingDateIso
    ? new Date(weddingDateIso).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const TEMPLATES: Record<ReminderType, EmailTemplate> = {
    rsvp_reminder: {
      label: 'RSVP-Erinnerung',
      subject: `💌 ${coupleNames} – Bitte gebt eure Rückmeldung`,
      body: `Liebe/r [Name],\n\nwir freuen uns riesig auf unsere Hochzeit${
        weddingDate ? ` am ${weddingDate}` : ''
      } und würden euch so gerne dabei haben! Wir haben gesehen, dass ihr noch nicht zugesagt habt – könntet ihr uns eine kurze Rückmeldung geben?\n\nVielen Dank!\n${coupleNames}`,
    },
    thank_you: {
      label: 'Danke-Mail',
      subject: `💛 ${coupleNames} – Danke, von ganzem Herzen`,
      body: `Liebe/r [Name],\n\nwir sitzen hier und blättern durch die Erinnerungen — und müssen einfach lächeln. Unser Hochzeitstag${
        weddingDate ? ` am ${weddingDate}` : ''
      } war der schönste Tag unseres Lebens, und das wäre er ohne euch nicht gewesen.\n\nDanke, dass ihr dabei wart. 💛\n\nIn Liebe,\n${coupleNames}`,
    },
    photo_reminder: {
      label: 'Foto-Erinnerung',
      subject: `📸 ${coupleNames} – Habt ihr noch Fotos von unserem Tag?`,
      body: `Liebe/r [Name],\n\nwisst ihr, was das Schönste an unserer Hochzeit ist? Dass jeder von euch den Tag aus seiner eigenen Perspektive erlebt hat — und bestimmt habt ihr dabei Momente eingefangen, die wir gar nicht mitbekommen haben.\n\nLadet eure Fotos einfach direkt auf unserer Website hoch. Wir freuen uns über jedes einzelne!\n\nDanke!\n${coupleNames}`,
    },
  };

  const openPreview = (type: ReminderType, recipients: EnrichedGuest[]) => {
    if (recipients.length === 0) return;
    setEmailPreview({ type, template: TEMPLATES[type], recipients });
  };

  const handleSend = (customSubject: string, customBody: string) => {
    if (!emailPreview) return;
    const { type, recipients } = emailPreview;
    startTransition(async () => {
      const res = await sendReminders({
        slug,
        guestIds: recipients.map((r) => r.id),
        type,
        customSubject,
        customBody,
      });
      if (res.ok) {
        notify('ok', `${res.count ?? recipients.length} ${TEMPLATES[type].label}(s) vorbereitet (Versand kommt mit Brevo).`);
        setEmailPreview(null);
        router.refresh();
      } else {
        notify('err', res.error || 'Konnte nicht versendet werden.');
      }
    });
  };

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="dash-guests">
      {/* Stats */}
      <div className="dash-rsvp-stats">
        <StatCard label="Gäste gesamt" value={stats.total} />
        <StatCard label="Zusagen" value={stats.confirmed} accent="success" />
        <StatCard label="Absagen" value={stats.declined} />
        <StatCard label="Offen" value={stats.pending} accent="warning" highlight />
        <StatCard label="Erinnert" value={stats.reminded} />
      </div>

      {/* Status-Erklärung */}
      {stats.total > 0 && (
        <p className="dash-guests-status-hint">
          <DashboardIcon name="external" size={12} />
          <span>
            Der Status pro Gast wird automatisch durch <strong>Abgleich der Email-Adressen</strong> mit
            den eingegangenen RSVPs berechnet. Hat ein Gast unter einer anderen Email-Adresse
            geantwortet, wird er weiter als „offen" angezeigt.
          </span>
        </p>
      )}

      {/* Action Bar */}
      <div className="dash-guests-actions">
        <button
          type="button"
          className="dash-btn"
          onClick={() => openPreview('rsvp_reminder', pendingGuests)}
          disabled={pending || stats.pending === 0}
        >
          <DashboardIcon name="envelope" size={14} />
          <span>RSVP-Erinnerung senden ({stats.pending})</span>
        </button>
        <button
          type="button"
          className="dash-btn-out"
          onClick={() => openPreview('thank_you', confirmedGuests)}
          disabled={pending || stats.confirmed === 0}
        >
          <DashboardIcon name="envelope" size={14} />
          <span>Danke-Mail ({stats.confirmed})</span>
        </button>
        {hasPhotoUpload && (
          <button
            type="button"
            className="dash-btn-out"
            onClick={() => openPreview('photo_reminder', confirmedGuests)}
            disabled={pending || stats.confirmed === 0}
          >
            <DashboardIcon name="camera" size={14} />
            <span>Foto-Erinnerung ({stats.confirmed})</span>
          </button>
        )}
        <div className="dash-guests-actions-spacer" />
        <button
          type="button"
          className="dash-btn-out"
          onClick={() => setShowUpload((v) => !v)}
          disabled={pending}
        >
          <DashboardIcon name="plus" size={14} />
          <span>Liste importieren</span>
        </button>
        {stats.total > 0 && (
          <button
            type="button"
            className="dash-btn-out"
            onClick={() => setShowConfirmClear(true)}
            disabled={pending}
            title="Komplette Liste löschen"
          >
            <DashboardIcon name="trash" size={14} />
          </button>
        )}
      </div>

      {/* Upload */}
      {showUpload && (
        <div className="dash-rsvp-add-form">
          <h3 className="dash-rsvp-add-title">Gästeliste importieren</h3>
          <p className="dash-form-hint">
            Ladet eine CSV- oder Excel-Datei hoch. Mindestens die Spalten <strong>Name</strong> und{' '}
            <strong>Email</strong> sind nötig (optional: <strong>Gruppe</strong>). Duplikate werden
            übersprungen.
          </p>

          <div className="dash-guests-template-row">
            <button type="button" className="dash-btn-out" onClick={downloadExampleCsv}>
              <DashboardIcon name="download" size={14} />
              <span>Vorlage als CSV herunterladen</span>
            </button>
            <span className="dash-form-hint" style={{ margin: 0 }}>
              Öffnet sich direkt in Excel — Spalten füllen und wieder hochladen.
            </span>
          </div>

          <div className="dash-guests-csv-example">
            <code>
              Name;Email;Gruppe
              <br />
              Anna Müller;anna@example.de;Familie
              <br />
              Max Schmidt;max@example.de;Freunde
            </code>
          </div>
          <input
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="dash-input"
          />
          {uploading && <p className="dash-form-hint">⏳ Importiere…</p>}
        </div>
      )}

      {/* Empty State */}
      {stats.total === 0 && !showUpload && (
        <div className="dash-guests-empty">
          <div className="dash-guests-empty-head">
            <h3>Noch keine Gästeliste hochgeladen</h3>
            <p>
              Mit der Gästeliste behaltet ihr den Überblick, wer schon zugesagt hat — und könnt
              gezielt an offene Gäste Erinnerungen schicken.
            </p>
          </div>

          {/* 3-Step-Anleitung */}
          <div className="dash-guests-steps">
            <Step number={1} title="Datei vorbereiten" desc="Excel oder CSV mit den Spalten „Name“, „Email“ und optional „Gruppe“.">
              <StepIconSpreadsheet />
            </Step>
            <StepArrow />
            <Step number={2} title="Hochladen" desc="Datei hier importieren. Duplikate werden automatisch erkannt und übersprungen.">
              <StepIconUpload />
            </Step>
            <StepArrow />
            <Step number={3} title="Erinnern & danken" desc="Status seht ihr live, sobald RSVPs reinkommen. Per Klick Erinnerungen verschicken.">
              <StepIconMail />
            </Step>
          </div>

          {/* CTA */}
          <div className="dash-guests-empty-actions">
            <button type="button" className="dash-btn" onClick={() => setShowUpload(true)}>
              <DashboardIcon name="plus" size={14} />
              <span>Liste importieren</span>
            </button>
            <button type="button" className="dash-btn-out" onClick={downloadExampleCsv}>
              <DashboardIcon name="download" size={14} />
              <span>Vorlage herunterladen</span>
            </button>
          </div>

          {/* Was machen die Mail-Buttons? */}
          <div className="dash-guests-mail-explainer">
            <h4>Was passiert, wenn ich eine Mail verschicke?</h4>
            <div className="dash-guests-mail-grid">
              <MailExplainCard
                icon={<MailIconReminder />}
                title="RSVP-Erinnerung"
                desc="Geht an alle, die noch nicht geantwortet haben. Sanfter Reminder, dass eure Gäste sich zurückmelden mögen."
                when="Vor der Hochzeit, wenn die Frist näher rückt."
              />
              <MailExplainCard
                icon={<MailIconThanks />}
                title="Danke-Mail"
                desc="Geht an alle, die zugesagt und gefeiert haben. Persönliche Danksagung — den genauen Wortlaut könnt ihr selbst anpassen."
                when="Nach der Hochzeit."
              />
              <MailExplainCard
                icon={<MailIconPhoto />}
                title="Foto-Erinnerung"
                desc="Geht an alle Zusager. Bittet sie, ihre Schnappschüsse vom Tag auf eurer Seite hochzuladen."
                when="In den Tagen/Wochen nach der Hochzeit."
                onlyWith="Nur sichtbar, wenn der Foto-Upload-Bereich gebucht ist."
              />
            </div>
            <p className="dash-guests-mail-note">
              <strong>Vorab seht ihr immer eine Vorschau</strong> mit Betreff und Text — die ihr
              vor dem Versand frei anpassen könnt. Es geht nichts raus, ohne dass ihr es freigegeben
              habt.
            </p>
          </div>
        </div>
      )}

      {/* Tabelle */}
      {stats.total > 0 && (
        <>
          <div className="dash-guests-search">
            <input
              type="search"
              className="dash-input"
              placeholder="Suche Name, Email oder Gruppe…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dash-rsvp-table-wrap">
            <table className="dash-rsvp-table dash-guests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>E-Mail</th>
                  <th>Gruppe</th>
                  <th>Status</th>
                  <th>Erinnerung</th>
                  <th style={{ width: 44 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="dash-rsvp-empty">
                      Keine Treffer für "{searchTerm}".
                    </td>
                  </tr>
                )}
                {filtered.map((g) => (
                  <tr key={g.id} className="dash-rsvp-row">
                    <td>
                      <strong>{g.name}</strong>
                    </td>
                    <td>{g.email}</td>
                    <td className="dash-rsvp-muted">{g.group_name || '–'}</td>
                    <td>
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="dash-rsvp-date">
                      {g.reminder_sent_at
                        ? `📧 ${new Date(g.reminder_sent_at).toLocaleDateString('de-DE')}`
                        : '–'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dash-icon-btn is-danger"
                        title="Entfernen"
                        onClick={() => handleDelete(g.id)}
                      >
                        <DashboardIcon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Confirm Clear */}
      {showConfirmClear && (
        <div className="dash-modal-backdrop" onClick={() => setShowConfirmClear(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="dash-modal-title">Komplette Gästeliste löschen?</h3>
            <p className="dash-modal-desc">
              Alle {stats.total} Einträge werden entfernt. RSVPs bleiben erhalten (die liegen in
              einer separaten Tabelle). Diese Aktion lässt sich nicht rückgängig machen.
            </p>
            <div className="dash-modal-actions">
              <button
                type="button"
                className="dash-btn-out"
                onClick={() => setShowConfirmClear(false)}
              >
                Abbrechen
              </button>
              <button type="button" className="dash-btn dash-btn-danger" onClick={handleClear}>
                Ja, alles löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview */}
      {emailPreview && (
        <EmailPreviewModal
          template={emailPreview.template}
          recipientCount={emailPreview.recipients.length}
          recipientPreview={emailPreview.recipients.slice(0, 5).map((g) => g.name).join(', ')}
          onCancel={() => setEmailPreview(null)}
          onSend={handleSend}
          pending={pending}
        />
      )}

      {toast && <div className={`dash-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}>{toast.text}</div>}
    </div>
  );
}

// ====================================================================
// Sub-Komponenten
// ====================================================================

function StatCard({
  label,
  value,
  highlight,
  accent,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  accent?: 'success' | 'warning';
}) {
  return (
    <div className={`dash-rsvp-stat ${highlight ? 'is-highlight' : ''} ${accent ? `is-${accent}` : ''}`}>
      <div className="dash-rsvp-stat-value">{value}</div>
      <div className="dash-rsvp-stat-label">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: EnrichedGuest['status'] }) {
  const label = status === 'confirmed' ? 'Zusage' : status === 'declined' ? 'Absage' : 'Offen';
  return <span className={`dash-rsvp-badge is-${status}`}>{label}</span>;
}

// ====================================================================
// 3-Step-Anleitung
// ====================================================================

function Step({
  number,
  title,
  desc,
  children,
}: {
  number: number;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="dash-step">
      <div className="dash-step-illu" aria-hidden="true">
        {children}
        <span className="dash-step-badge">{number}</span>
      </div>
      <h4 className="dash-step-title">{title}</h4>
      <p className="dash-step-desc">{desc}</p>
    </div>
  );
}

function StepArrow() {
  return (
    <div className="dash-step-arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

/* Schritt-Illustrationen — eigene kleine SVGs, kein externes Bild */

function StepIconSpreadsheet() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
      {/* Blatt */}
      <rect x="10" y="8" width="44" height="48" rx="3" fill="var(--dash-surface)" stroke="var(--dash-ink-soft)" strokeWidth="1.5" />
      {/* Header */}
      <rect x="10" y="8" width="44" height="9" rx="3" fill="var(--dash-accent-soft)" stroke="var(--dash-ink-soft)" strokeWidth="1.5" />
      {/* Vertikale Trennlinien */}
      <line x1="25" y1="8" x2="25" y2="56" stroke="var(--dash-border)" strokeWidth="1" />
      <line x1="40" y1="8" x2="40" y2="56" stroke="var(--dash-border)" strokeWidth="1" />
      {/* Horizontale Reihen */}
      <line x1="10" y1="26" x2="54" y2="26" stroke="var(--dash-border)" strokeWidth="1" />
      <line x1="10" y1="35" x2="54" y2="35" stroke="var(--dash-border)" strokeWidth="1" />
      <line x1="10" y1="44" x2="54" y2="44" stroke="var(--dash-border)" strokeWidth="1" />
      {/* Header-Beschriftung — kleine Linien als "Spaltentitel" */}
      <rect x="13" y="11" width="9" height="3" rx="1" fill="var(--dash-accent)" />
      <rect x="28" y="11" width="9" height="3" rx="1" fill="var(--dash-accent)" />
      <rect x="43" y="11" width="8" height="3" rx="1" fill="var(--dash-accent)" />
    </svg>
  );
}

function StepIconUpload() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
      {/* Cloud */}
      <path
        d="M16 42c-4 0-7-3-7-7s3-7 7-7c1 0 2 .2 2.8.6C20 23 24.5 19 30 19c6 0 11 5 11 11 4 0 7 3 7 7s-3 7-7 7H16z"
        fill="var(--dash-accent-soft)"
        stroke="var(--dash-ink-soft)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Pfeil rauf */}
      <path d="M32 48V31M26 37l6-6 6 6" stroke="var(--dash-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepIconMail() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
      {/* Briefumschlag */}
      <rect x="10" y="18" width="44" height="30" rx="3" fill="var(--dash-surface)" stroke="var(--dash-ink-soft)" strokeWidth="1.5" />
      <path d="M10 22l22 16 22-16" stroke="var(--dash-ink-soft)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Klingel/Glocke vorm Brief — Erinnerungs-Symbolik */}
      <circle cx="48" cy="20" r="8" fill="var(--dash-accent)" />
      <text x="48" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">!</text>
    </svg>
  );
}

// ====================================================================
// Mail-Buttons-Erklärung
// ====================================================================

function MailExplainCard({
  icon,
  title,
  desc,
  when,
  onlyWith,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  when: string;
  onlyWith?: string;
}) {
  return (
    <div className="dash-mail-card">
      <div className="dash-mail-card-icon" aria-hidden="true">{icon}</div>
      <h5 className="dash-mail-card-title">{title}</h5>
      <p className="dash-mail-card-desc">{desc}</p>
      <p className="dash-mail-card-when">
        <span className="dash-mail-card-when-label">Wann?</span> {when}
      </p>
      {onlyWith && <p className="dash-mail-card-only">{onlyWith}</p>}
    </div>
  );
}

function MailIconReminder() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="26" height="18" rx="2" fill="var(--dash-warning-soft)" stroke="var(--dash-warning)" strokeWidth="1.4" />
      <path d="M3 10l13 9 13-9" stroke="var(--dash-warning)" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function MailIconThanks() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true">
      {/* Herz */}
      <path
        d="M16 27s-9-5.5-9-12.5C7 11 9.5 8 13 8c1.8 0 3 1 3 1s1.2-1 3-1c3.5 0 6 3 6 6.5 0 7-9 12.5-9 12.5z"
        fill="var(--dash-success-soft)"
        stroke="var(--dash-success)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIconPhoto() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="26" height="18" rx="2" fill="var(--dash-accent-soft)" stroke="var(--dash-accent)" strokeWidth="1.4" />
      <circle cx="16" cy="17" r="4.5" fill="none" stroke="var(--dash-accent)" strokeWidth="1.4" />
      <rect x="12" y="5" width="8" height="4" rx="1" fill="var(--dash-accent)" />
    </svg>
  );
}
