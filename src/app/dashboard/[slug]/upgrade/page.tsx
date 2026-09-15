import { redirect } from 'next/navigation';

/**
 * /dashboard/[slug]/upgrade — stillgelegt.
 *
 * Seit der Umstellung auf Einmalzahlung gibt es keine Pakete, Upgrades oder
 * Downgrades mehr: alle 15 Bereiche sind enthalten. Die Route leitet nur noch
 * ins Dashboard zurück, damit alte Links und Lesezeichen nicht ins Leere laufen.
 *
 * UpgradeClient.tsx, DowngradeClient.tsx und actions.ts in diesem Ordner sind
 * ebenfalls tot und können beim nächsten Aufräumen gelöscht werden.
 */
export default async function UpgradePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/dashboard/${slug}`);
}
