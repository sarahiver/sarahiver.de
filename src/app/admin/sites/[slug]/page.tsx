import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/admin';
import { loadAdminSite } from '@/lib/admin-data';
import AdminSiteActions from './AdminSiteActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ops — Seite', robots: { index: false, follow: false } };

const de = (iso: string | null) => (iso ? new Date(iso).toLocaleString('de-DE') : '—');
const LEVEL: Record<string, string> = { ok: '#1f7a45', info: '#2c5bb5', warn: '#9a6510', error: '#a62828' };

export default async function AdminSiteDetail({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage();
  const { slug } = await params;
  const s = await loadAdminSite(slug);
  if (!s) notFound();

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'sarahiver.de';
  const stripeUrl = s.stripeCustomerId ? `https://dashboard.stripe.com/customers/${s.stripeCustomerId}` : null;

  return (
    <main style={wrap}>
      <Link href="/admin" style={{ fontSize: 12, color: '#6b6259' }}>
        ← Übersicht
      </Link>

      <h1 style={{ fontSize: 22, margin: '10px 0 4px', fontWeight: 600 }}>{s.couple}</h1>
      <p style={{ color: '#6b6259', fontSize: 13, margin: 0 }}>
        {s.slug} · {s.style ?? 'kein Stil'} · angelegt {de(s.createdAt)}
      </p>

      <section style={{ ...card, borderLeft: `4px solid ${LEVEL[s.diagnosis.level]}`, marginTop: 20 }}>
        <h2 style={{ ...h2, color: LEVEL[s.diagnosis.level] }}>{s.diagnosis.headline}</h2>
        {s.diagnosis.notes.length > 0 ? (
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
            {s.diagnosis.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: '8px 0 0' }}>Keine Auffälligkeiten.</p>
        )}
      </section>

      <div style={grid}>
        <Card title="Kunde">
          <Line k="E-Mail" v={s.ownerEmail ?? '—'} />
          <Line k="User ID" v={s.ownerUserId ?? '—'} />
          <Line k="Account angelegt" v={de(s.accountCreatedAt)} />
          <Line k="Letzter Login" v={s.accountLastSignIn ? de(s.accountLastSignIn) : 'nie'} />
        </Card>

        <Card title="Hochzeitsseite">
          <Line k="Status" v={s.status ?? '—'} />
          <Line k="Veröffentlicht" v={de(s.publishedAt)} />
          <Line k="Hochzeitsdatum" v={s.weddingDate ? new Date(s.weddingDate).toLocaleDateString('de-DE') : '—'} />
          <Line k="Bereiche" v={String(s.bereicheCount)} />
        </Card>

        <Card title="Zahlung">
          <Line k="Status" v={s.purchaseStatus ?? '—'} />
          <Line k="Bezahlt am" v={de(s.paidAt)} />
          <Line k="Laufzeit bis" v={de(s.accessUntil)} />
          <Line k="Betrag" v="69 € einmalig" />
          <Line k="Stripe-Kunde" v={s.stripeCustomerId ?? '—'} />
          <Line k="Checkout-Session" v={s.stripeSessionId ?? '—'} />
        </Card>

        <Card title="Provisionierung">
          <Line k="Site angelegt" v="ja" />
          <Line k="Bereiche angelegt" v={s.bereicheCount > 0 ? `ja (${s.bereicheCount})` : 'NEIN'} />
          <Line k="Käufe eingetragen" v={s.purchasesCount > 0 ? `ja (${s.purchasesCount})` : 'NEIN'} />
          <Line k="Account" v={s.ownerUserId ? 'ja' : 'NEIN'} />
        </Card>

        <Card title="Gästedaten">
          <Line k="RSVPs" v={String(s.rsvpCount)} />
          <Line k="Gästebuch (offen/gesamt)" v={`${s.guestbookPending} / ${s.guestbookTotal}`} />
          <Line k="Musikwünsche" v={String(s.musicCount)} />
          <Line k="Geschenk-Reservierungen" v={String(s.giftReservations)} />
          <Line k="Foto-Uploads" v={String(s.photoCount)} />
        </Card>

        <Card title="E-Mails">
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Der Versandstatus wird nicht gespeichert. Ob Login- und Vertragsmail angekommen sind, ist
            hier <b>unbekannt</b>. Hinweis: Ein Login am {s.accountLastSignIn ? de(s.accountLastSignIn) : '—'}{' '}
            spricht dafür, dass die Login-Mail angekommen ist. Fehlversuche stehen im Server-Log und
            lösen eine Alarm-Mail aus.
          </p>
        </Card>
      </div>

      <section style={{ ...card, marginTop: 4 }}>
        <h2 style={h2}>Aktionen</h2>
        <AdminSiteActions slug={s.slug} canResendContract={s.purchaseStatus === 'paid'} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          <a style={linkBtn} href={`https://${s.slug}.${appDomain}`} target="_blank" rel="noopener noreferrer">
            Öffentliche Seite
          </a>
          <a style={linkBtn} href={`/dashboard/${s.slug}`} target="_blank" rel="noopener noreferrer">
            Kunden-Dashboard
          </a>
          {stripeUrl && (
            <a style={linkBtn} href={stripeUrl} target="_blank" rel="noopener noreferrer">
              In Stripe öffnen
            </a>
          )}
        </div>
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={card}>
      <h2 style={h2}>{title}</h2>
      <div style={{ marginTop: 8 }}>{children}</div>
    </section>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '3px 0', fontSize: 13 }}>
      <span style={{ color: '#6b6259', minWidth: 170 }}>{k}</span>
      <span style={{ wordBreak: 'break-all' }}>{v}</span>
    </div>
  );
}

const wrap: React.CSSProperties = {
  padding: '28px 28px 64px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#1a1714',
  maxWidth: 1100,
  margin: '0 auto',
};
const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 14,
  margin: '14px 0',
};
const card: React.CSSProperties = { padding: '14px 16px', border: '1px solid #e7e2da', borderRadius: 8, background: '#fff' };
const h2: React.CSSProperties = { fontSize: 13, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' };
const linkBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 38,
  padding: '0 14px',
  border: '1px solid #cfc7bb',
  borderRadius: 6,
  fontSize: 13,
  color: '#1a1714',
  textDecoration: 'none',
};
