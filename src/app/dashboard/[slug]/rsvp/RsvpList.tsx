'use client';

import { useMemo, useState, useTransition, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { RsvpRecord, RsvpGuest } from '@/lib/rsvp-data';
import { updateRsvp, deleteRsvp, addRsvp } from './actions';
import DashboardIcon from '@/components/dashboard/DashboardIcon';

/**
 * Dashboard-Ansicht für RSVPs einer Hochzeit.
 *
 * Logik 1:1 aus sarahiver.com:
 *   - Flat-Rows: 1 Zeile pro Person (Hauptperson + Begleitpersonen separat)
 *   - Begleitpersonen werden eingerückt unter der Hauptperson dargestellt
 *   - Hauptperson zeigt "+N" wenn _groupSize > 1
 *   - Filter: Suche (Name/Email) + Dietary-Dropdown
 *   - Edit/Delete pro Eintrag (Edit nur für Hauptperson)
 *   - "Manuell hinzufügen"-Form für Telefon-Zusagen
 *   - CSV-Export mit BOM + Semikolon (Excel-DE-kompatibel)
 */

interface Props {
  slug: string;
  initialRsvps: RsvpRecord[];
}

interface FlatRow {
  _rsvpId: string;
  _isMain: boolean;
  _groupSize: number; // persons-Anzahl bei Hauptperson, 0 bei Begleitern
  _rawEntry: RsvpRecord;
  name: string;
  email: string;
  persons: number | '';
  attending: boolean;
  dietary: string;
  allergies: string;
  custom_answer: string;
  message: string;
  created_at: string;
}

function parseGuests(r: RsvpRecord): RsvpGuest[] {
  if (Array.isArray(r.guests)) return r.guests;
  return [];
}

function flatten(rsvps: RsvpRecord[]): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const r of rsvps) {
    const guests = parseGuests(r);

    rows.push({
      _rsvpId: r.id,
      _isMain: true,
      _groupSize: r.persons || 1,
      _rawEntry: r,
      name: r.name || '',
      email: r.email || '',
      persons: r.persons || 1,
      attending: r.attending,
      dietary: r.dietary || '',
      allergies: r.allergies || '',
      custom_answer: r.custom_answer || '',
      message: r.message || '',
      created_at: r.created_at,
    });

    // Begleitpersonen ab Index 1 (Index 0 ist die Hauptperson, schon oben)
    if (guests.length > 1) {
      for (let i = 1; i < guests.length; i++) {
        const g = guests[i];
        if (g.name || g.dietary || g.allergies) {
          rows.push({
            _rsvpId: r.id,
            _isMain: false,
            _groupSize: 0,
            _rawEntry: r,
            name: g.name || '',
            email: r.email || '',
            persons: '',
            attending: r.attending,
            dietary: g.dietary || '',
            allergies: g.allergies || '',
            custom_answer: '',
            message: '',
            created_at: r.created_at,
          });
        }
      }
    }
  }
  return rows;
}

// ====================================================================

export default function RsvpList({ slug, initialRsvps }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<AddForm>({
    name: '',
    email: '',
    persons: 1,
    attending: true,
    dietary: '',
    allergies: '',
    message: '',
    custom_answer: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDietary, setFilterDietary] = useState('');

  const flatRows = useMemo(() => flatten(initialRsvps), [initialRsvps]);

  const filteredRows = useMemo(() => {
    return flatRows.filter((row) => {
      const matchesSearch =
        !searchTerm ||
        row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDietary =
        !filterDietary || row.dietary?.toLowerCase().includes(filterDietary.toLowerCase());

      return matchesSearch && matchesDietary;
    });
  }, [flatRows, searchTerm, filterDietary]);

  const dietaryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of flatRows) {
      if (row.dietary) {
        for (const d of row.dietary.split(',')) {
          const trimmed = d.trim().toLowerCase();
          if (trimmed) set.add(trimmed);
        }
      }
    }
    return Array.from(set).sort();
  }, [flatRows]);

  // === Statistik
  const stats = useMemo(() => {
    let confirmed = 0;
    let declined = 0;
    let totalPersons = 0;
    for (const r of initialRsvps) {
      if (r.attending) {
        confirmed += 1;
        totalPersons += r.persons || 1;
      } else {
        declined += 1;
      }
    }
    return { confirmed, declined, totalPersons, totalRsvps: initialRsvps.length };
  }, [initialRsvps]);

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2400);
  };

  // ====================================================================
  // CSV Export
  // ====================================================================
  const exportCsv = () => {
    const headers = [
      'Name',
      'E-Mail',
      'Personen',
      'Status',
      'Ernährung',
      'Allergien',
      'Custom Antwort',
      'Nachricht',
      'Datum',
    ];

    const exportRows = flatRows.map((row) => [
      row.name,
      row.email,
      row._isMain ? String(row.persons || 1) : '',
      row.attending ? 'Zusage' : 'Absage',
      row.dietary,
      row.allergies,
      row._isMain ? row.custom_answer || '' : '',
      row._isMain ? row.message || '' : '',
      row._isMain ? new Date(row.created_at).toLocaleDateString('de-DE') : '',
    ]);

    // BOM + Semikolon = Excel-DE-Standard
    const csvContent =
      '\uFEFF' +
      [headers, ...exportRows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RSVP_${slug}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('ok', 'CSV-Export erstellt.');
  };

  // ====================================================================
  // Edit / Delete / Add
  // ====================================================================
  const startEdit = (r: RsvpRecord) => {
    setEditingId(r.id);
    setEditForm({
      name: r.name || '',
      email: r.email || '',
      persons: r.persons || 1,
      attending: r.attending,
      dietary: r.dietary || '',
      allergies: r.allergies || '',
      message: r.message || '',
      custom_answer: r.custom_answer || '',
      guests: r.guests || [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = (id: string) => {
    if (!editForm) return;
    startTransition(async () => {
      const res = await updateRsvp({
        slug,
        id,
        name: editForm.name,
        email: editForm.email,
        persons: editForm.persons,
        attending: editForm.attending,
        dietary: editForm.dietary,
        allergies: editForm.allergies,
        message: editForm.message,
        custom_answer: editForm.custom_answer,
        guests: editForm.guests,
      });
      if (res.ok) {
        notify('ok', 'RSVP gespeichert.');
        cancelEdit();
        router.refresh();
      } else {
        notify('err', res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('RSVP wirklich löschen? (inkl. aller Begleitpersonen)')) return;
    startTransition(async () => {
      const res = await deleteRsvp(slug, id);
      if (res.ok) {
        notify('ok', 'RSVP gelöscht.');
        router.refresh();
      } else {
        notify('err', res.error || 'Konnte nicht gelöscht werden.');
      }
    });
  };

  const handleAdd = () => {
    if (!newEntry.name.trim()) {
      notify('err', 'Name ist erforderlich.');
      return;
    }
    startTransition(async () => {
      const res = await addRsvp({ slug, ...newEntry });
      if (res.ok) {
        notify('ok', 'RSVP manuell hinzugefügt.');
        setShowAddForm(false);
        setNewEntry({
          name: '',
          email: '',
          persons: 1,
          attending: true,
          dietary: '',
          allergies: '',
          message: '',
          custom_answer: '',
        });
        router.refresh();
      } else {
        notify('err', res.error || 'Konnte nicht hinzugefügt werden.');
      }
    });
  };

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="dash-rsvp">
      {/* Statistik */}
      <div className="dash-rsvp-stats">
        <StatCard label="Zusagen" value={stats.confirmed} />
        <StatCard label="Absagen" value={stats.declined} />
        <StatCard label="Personen gesamt" value={stats.totalPersons} highlight />
        <StatCard label="Antworten gesamt" value={stats.totalRsvps} />
      </div>

      {/* Toolbar */}
      <div className="dash-rsvp-toolbar">
        <div className="dash-rsvp-toolbar-search">
          <input
            type="search"
            className="dash-input"
            placeholder="Suche Name oder Email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {dietaryOptions.length > 0 && (
            <select
              className="dash-input"
              value={filterDietary}
              onChange={(e) => setFilterDietary(e.target.value)}
              style={{ minWidth: 180 }}
            >
              <option value="">Alle Ernährungen</option>
              {dietaryOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="dash-rsvp-toolbar-actions">
          <button type="button" className="dash-btn-out" onClick={() => setShowAddForm((v) => !v)}>
            <DashboardIcon name="plus" size={14} />
            <span>Manuell hinzufügen</span>
          </button>
          <button type="button" className="dash-btn-out" onClick={exportCsv}>
            <DashboardIcon name="download" size={14} />
            <span>CSV-Export</span>
          </button>
        </div>
      </div>

      {/* Add-Form */}
      {showAddForm && (
        <AddRsvpForm
          entry={newEntry}
          onChange={setNewEntry}
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          pending={pending}
        />
      )}

      {/* Tabelle */}
      <div className="dash-rsvp-table-wrap">
        <table className="dash-rsvp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Pers.</th>
              <th>Status</th>
              <th>Ernährung</th>
              <th>Allergien</th>
              <th>Custom Antwort</th>
              <th>Nachricht</th>
              <th>Datum</th>
              <th style={{ width: 90 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={10} className="dash-rsvp-empty">
                  Keine RSVPs gefunden.
                </td>
              </tr>
            )}
            {filteredRows.map((row, idx) => {
              // Edit-Modus (nur Hauptperson)
              if (row._isMain && editingId === row._rsvpId && editForm) {
                return (
                  <EditRow
                    key={`edit-${row._rsvpId}`}
                    form={editForm}
                    setForm={setEditForm}
                    onSave={() => saveEdit(row._rsvpId)}
                    onCancel={cancelEdit}
                    pending={pending}
                    createdAt={row.created_at}
                  />
                );
              }

              // Begleitperson-Zeile
              if (!row._isMain) {
                return (
                  <tr key={`comp-${row._rsvpId}-${idx}`} className="dash-rsvp-row is-companion">
                    <td className="dash-rsvp-name-comp">↳ {row.name || 'Begleitung'}</td>
                    <td className="dash-rsvp-muted">{row.email}</td>
                    <td></td>
                    <td>
                      <StatusBadge attending={row.attending} />
                    </td>
                    <td>{row.dietary || '–'}</td>
                    <td>{row.allergies || '–'}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                );
              }

              // Hauptperson-Zeile (Read-Modus)
              return (
                <tr key={`main-${row._rsvpId}`} className="dash-rsvp-row">
                  <td>
                    <strong>{row.name}</strong>
                    {row._groupSize > 1 && (
                      <span className="dash-rsvp-pill-plus">+{row._groupSize - 1}</span>
                    )}
                  </td>
                  <td>{row.email || '–'}</td>
                  <td>{row.persons || 1}</td>
                  <td>
                    <StatusBadge attending={row.attending} />
                  </td>
                  <td>{row.dietary || '–'}</td>
                  <td>{row.allergies || '–'}</td>
                  <td className="dash-rsvp-trunc">{row.custom_answer || '–'}</td>
                  <td className="dash-rsvp-trunc">{row.message || '–'}</td>
                  <td className="dash-rsvp-date">
                    {new Date(row.created_at).toLocaleDateString('de-DE')}
                  </td>
                  <td>
                    <div className="dash-rsvp-actions">
                      <button
                        type="button"
                        className="dash-icon-btn"
                        title="Bearbeiten"
                        onClick={() => startEdit(row._rawEntry)}
                      >
                        <DashboardIcon name="pencil" size={14} />
                      </button>
                      <button
                        type="button"
                        className="dash-icon-btn is-danger"
                        title="Löschen"
                        onClick={() => handleDelete(row._rsvpId)}
                      >
                        <DashboardIcon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {toast && <div className={`dash-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}>{toast.text}</div>}
    </div>
  );
}

// ====================================================================
// Sub-Komponenten
// ====================================================================

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`dash-rsvp-stat ${highlight ? 'is-highlight' : ''}`}>
      <div className="dash-rsvp-stat-value">{value}</div>
      <div className="dash-rsvp-stat-label">{label}</div>
    </div>
  );
}

function StatusBadge({ attending }: { attending: boolean }) {
  return (
    <span className={`dash-rsvp-badge ${attending ? 'is-yes' : 'is-no'}`}>
      {attending ? 'Zusage' : 'Absage'}
    </span>
  );
}

interface EditForm {
  name: string;
  email: string;
  persons: number;
  attending: boolean;
  dietary: string;
  allergies: string;
  message: string;
  custom_answer: string;
  guests: RsvpGuest[];
}

interface AddForm {
  name: string;
  email: string;
  persons: number;
  attending: boolean;
  dietary: string;
  allergies: string;
  message: string;
  custom_answer: string;
}

function EditRow({
  form,
  setForm,
  onSave,
  onCancel,
  pending,
  createdAt,
}: {
  form: EditForm;
  setForm: (f: EditForm) => void;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
  createdAt: string;
}) {
  const u = (k: keyof EditForm, v: EditForm[keyof EditForm]) => setForm({ ...form, [k]: v });
  return (
    <tr className="dash-rsvp-row is-editing">
      <td>
        <input className="dash-input dash-input-sm" value={form.name} onChange={(e) => u('name', e.target.value)} />
      </td>
      <td>
        <input className="dash-input dash-input-sm" value={form.email} onChange={(e) => u('email', e.target.value)} />
      </td>
      <td>
        <input
          type="number"
          className="dash-input dash-input-sm"
          style={{ width: 60 }}
          value={form.persons}
          onChange={(e) => u('persons', parseInt(e.target.value) || 1)}
          min={1}
          max={20}
        />
      </td>
      <td>
        <select
          className="dash-input dash-input-sm"
          value={form.attending ? 'yes' : 'no'}
          onChange={(e) => u('attending', e.target.value === 'yes')}
        >
          <option value="yes">Zusage</option>
          <option value="no">Absage</option>
        </select>
      </td>
      <td>
        <input className="dash-input dash-input-sm" value={form.dietary} onChange={(e) => u('dietary', e.target.value)} />
      </td>
      <td>
        <input className="dash-input dash-input-sm" value={form.allergies} onChange={(e) => u('allergies', e.target.value)} />
      </td>
      <td>
        <input
          className="dash-input dash-input-sm"
          value={form.custom_answer}
          onChange={(e) => u('custom_answer', e.target.value)}
        />
      </td>
      <td>
        <input className="dash-input dash-input-sm" value={form.message} onChange={(e) => u('message', e.target.value)} />
      </td>
      <td className="dash-rsvp-date">{new Date(createdAt).toLocaleDateString('de-DE')}</td>
      <td>
        <div className="dash-rsvp-actions">
          <button type="button" className="dash-icon-btn is-ok" onClick={onSave} disabled={pending} title="Speichern">
            ✓
          </button>
          <button type="button" className="dash-icon-btn" onClick={onCancel} disabled={pending} title="Abbrechen">
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddRsvpForm({
  entry,
  onChange,
  onSubmit,
  onCancel,
  pending,
}: {
  entry: AddForm;
  onChange: (a: AddForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const u = (k: keyof AddForm, v: AddForm[keyof AddForm]) => onChange({ ...entry, [k]: v });
  const h =
    (k: keyof AddForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      u(k, e.target.value);

  return (
    <div className="dash-rsvp-add-form">
      <h3 className="dash-rsvp-add-title">Neuen RSVP manuell hinzufügen</h3>
      <p className="dash-form-hint">
        Für telefonische Zusagen oder andere RSVPs außerhalb der Website.
      </p>

      <div className="dash-form-row">
        <div className="dash-form-field">
          <label className="dash-form-label">Name *</label>
          <input className="dash-input" value={entry.name} onChange={h('name')} placeholder="z.B. Tante Erika" />
        </div>
        <div className="dash-form-field">
          <label className="dash-form-label">E-Mail</label>
          <input className="dash-input" value={entry.email} onChange={h('email')} placeholder="erika@example.de" />
        </div>
        <div className="dash-form-field">
          <label className="dash-form-label">Personen</label>
          <input
            className="dash-input"
            type="number"
            min={1}
            max={20}
            value={entry.persons}
            onChange={(e) => u('persons', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="dash-form-row">
        <div className="dash-form-field">
          <label className="dash-form-label">Status</label>
          <select
            className="dash-input"
            value={entry.attending ? 'yes' : 'no'}
            onChange={(e) => u('attending', e.target.value === 'yes')}
          >
            <option value="yes">Zusage</option>
            <option value="no">Absage</option>
          </select>
        </div>
        <div className="dash-form-field">
          <label className="dash-form-label">Ernährung</label>
          <input className="dash-input" value={entry.dietary} onChange={h('dietary')} placeholder="vegetarisch, vegan…" />
        </div>
        <div className="dash-form-field">
          <label className="dash-form-label">Allergien</label>
          <input className="dash-input" value={entry.allergies} onChange={h('allergies')} placeholder="Nüsse, Laktose…" />
        </div>
      </div>

      <div className="dash-form-field">
        <label className="dash-form-label">Nachricht</label>
        <textarea
          className="dash-input"
          rows={2}
          value={entry.message}
          onChange={h('message')}
          placeholder="Optionale Nachricht (z.B. Anreise)"
        />
      </div>

      <div className="dash-form-foot">
        <button type="button" className="dash-btn-out" onClick={onCancel} disabled={pending}>
          Abbrechen
        </button>
        <button type="button" className="dash-btn" onClick={onSubmit} disabled={pending}>
          {pending ? 'Wird gespeichert…' : 'RSVP hinzufügen'}
        </button>
      </div>
    </div>
  );
}
