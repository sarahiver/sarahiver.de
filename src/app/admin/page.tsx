import Link from 'next/link';
import { requireAdminPage } from '@/lib/admin';
import { loadAdminSites, filterRows, type AdminSiteRow } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ops — sarahiver.de', robots: { index: false, follow: false } };

const de = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('de-DE') : '—');

const LEVEL: Record<string, string> = { ok: '#1f7a45', info: '#2c5bb5', warn: '#9a6510', error: '#a62828' };

const FILTERS = [
  ['', 'Alle'],
  ['customers', 'Echte Kunden'],
  ['problem', 'Probleme'],
  ['unpublished', 'Nicht veröffentlicht'],
  ['unpaid', 'Nicht bezahlt'],
  ['expired', 'Abgelaufen'],
  ['refunded', 'Erstattet'],
  ['legacy', 'Altbestand / Tests'],
  ['published', 'Veröffentlicht'],
] as const;

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  // Admin-Prüfung VOR jedem Datenzugriff.
  await requireAdminPage();
  const sp = await searchParams;
  const data = await loadAdminSites();

  if (!data) {
    return (
      <main style={wrap}>
        <h1 style={h1}>Ops</h1>
        <p>Service-Role-Client nicht verfügbar — Environment prüfen.</p>
      </main>
    );
  }

  const rows = filterRows(data.rows, sp?.q, sp?.filter);

  return (
    <main style={wrap}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={h1}>Ops</h1>
        <span style={muted}>
          {rows.length} von {data.total} Seiten
        </span>
      </div>

      <form style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        <input
          name="q"
          defaultValue={sp?.q ?? ''}
          placeholder="E-Mail, Slug oder Paarname"
          style={{ ...input, minWidth: 260 }}
        />
        <select name="filter" defaultValue={sp?.filter ?? ''} style={input}>
          {FILTERS.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" style={btn}>
          Filtern
        </button>
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table style={table}>
          <thead>
            <tr>
              {['Paar / Slug', 'Kunde', 'Stil', 'Kauf', 'Live', 'Läuft bis', 'Account', 'Gästedaten', 'Diagnose'].map(
                (h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Row key={r.id} r={r} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td style={td} colSpan={9}>
                  Keine Treffer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Row({ r }: { r: AdminSiteRow }) {
  return (
    <tr>
      <td style={td}>
        <Link href={`/admin/sites/${r.slug}`} style={{ fontWeight: 600, color: '#111' }}>
          {r.couple}
        </Link>
        <div style={muted}>{r.slug}</div>
      </td>
      <td style={td}>{r.ownerEmail ?? <span style={{ color: LEVEL.error }}>kein Account</span>}</td>
      <td style={td}>{r.style ?? '—'}</td>
      <td style={td}>{r.purchaseStatus ?? '—'}</td>
      <td style={td}>{r.status === 'published' ? 'ja' : 'nein'}</td>
      <td style={td}>{de(r.accessUntil)}</td>
      <td style={td}>{r.accountLastSignIn ? `Login ${de(r.accountLastSignIn)}` : r.ownerEmail ? 'nie' : '—'}</td>
      <td style={td}>
        {r.rsvpCount} RSVP · {r.guestbookPending}/{r.guestbookTotal} Gästebuch · {r.photoCount} Fotos
      </td>
      <td style={{ ...td, color: LEVEL[r.diagnosis.level], fontWeight: 600 }}>{r.diagnosis.headline}</td>
    </tr>
  );
}

const wrap: React.CSSProperties = {
  padding: '32px 28px 64px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#1a1714',
  maxWidth: 1400,
  margin: '0 auto',
};
const h1: React.CSSProperties = { fontSize: 22, margin: 0, fontWeight: 600 };
const muted: React.CSSProperties = { color: '#6b6259', fontSize: 12 };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '2px solid #1a1714',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = { padding: '10px', borderBottom: '1px solid #e7e2da', verticalAlign: 'top' };
const input: React.CSSProperties = {
  minHeight: 38,
  padding: '0 10px',
  border: '1px solid #cfc7bb',
  borderRadius: 6,
  fontSize: 14,
  background: '#fff',
};
const btn: React.CSSProperties = {
  minHeight: 38,
  padding: '0 16px',
  border: 0,
  borderRadius: 6,
  background: '#1a1714',
  color: '#fff',
  fontSize: 14,
  cursor: 'pointer',
};
