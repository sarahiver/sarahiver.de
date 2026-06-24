import DashboardSection from '@/components/dashboard/DashboardSection';
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import { loadDashboardData } from '@/lib/dashboard-data';
import { COMPONENT_CATALOG } from '@/lib/component-catalog';
import { ADDON_KEYS, STANDARD_KEYS, TIERS, tierForCount, BEREICH_LABEL, type Tier } from '@/lib/funnel';
import type { BereichKey } from '@/types/supabase';
import { notFound } from 'next/navigation';
import UpgradeClient, { type AddableItem } from './UpgradeClient';
import DowngradeClient, { type DowngradeAddon } from './DowngradeClient';

/**
 * /dashboard/[slug]/upgrade
 *
 * Pakete verwalten: gebuchte Bereiche, Hochbuchen (Tier-Upgrade über Stripe)
 * und Runterbuchen (Downgrade zum Periodenende). Ist ein Downgrade geplant,
 * wird nur dieser Hinweis + „Aufheben" gezeigt.
 */

export const dynamic = 'force-dynamic';

export default async function UpgradePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const purchased = new Set<BereichKey>(data.purchasedKeys);

  const purchasedItems = [...STANDARD_KEYS, ...ADDON_KEYS]
    .filter((k) => purchased.has(k as BereichKey))
    .map((k) => COMPONENT_CATALOG[k as BereichKey]);

  const addable: AddableItem[] = ADDON_KEYS.filter((k) => !purchased.has(k)).map((k) => ({
    key: k,
    label: BEREICH_LABEL[k] || COMPONENT_CATALOG[k].label,
    desc: COMPONENT_CATALOG[k].desc,
    icon: COMPONENT_CATALOG[k].icon,
  }));

  const currentAddonKeys = ADDON_KEYS.filter((k) => purchased.has(k));
  const currentAddons: DowngradeAddon[] = currentAddonKeys.map((k) => ({
    key: k,
    label: BEREICH_LABEL[k] || COMPONENT_CATALOG[k].label,
  }));
  const currentAddonCount = currentAddonKeys.length;
  const currentTier: Tier = (data.site.subscription_tier as Tier) || tierForCount(currentAddonCount);
  const isTrialing = data.site.subscription_status === 'trialing';

  const pending =
    data.site.pending_tier
      ? {
          tier: data.site.pending_tier as Tier,
          effectiveAt: data.site.pending_downgrade_at ?? null,
          keepKeys: data.site.pending_keep_keys ?? [],
        }
      : null;

  return (
    <DashboardSection title="Pakete & Upgrades" description="Was ihr habt — dazubuchen oder reduzieren.">
      {/* Aktuelle Stufe */}
      <div style={tierBar}>
        <div>
          <span style={tierEyebrow}>Euer Paket</span>
          <div style={tierName}>
            {TIERS[currentTier].label} · {TIERS[currentTier].monthly} €/Monat
          </div>
        </div>
        <span style={tierCount}>{currentAddonCount} von 11 Zusatz-Bereichen</span>
      </div>

      {/* Gebucht */}
      <div className="dash-upgrade-block">
        <div className="dash-upgrade-block-head">
          <h2 className="dash-h2">Gebuchte Komponenten</h2>
          <span className="dash-upgrade-count">{purchasedItems.length} aktiv</span>
        </div>
        <div className="dash-upgrade-grid">
          {purchasedItems.map((c) => (
            <div key={c.key} className="dash-upgrade-card is-purchased">
              <div className="dash-upgrade-card-head">
                <span className="dash-upgrade-card-icon">
                  <DashboardIcon name={c.icon} size={16} />
                </span>
                <span className="dash-upgrade-card-title">{c.label}</span>
                <span className="dash-upgrade-card-badge">
                  <DashboardIcon name="check" size={11} />
                  enthalten
                </span>
              </div>
              <p className="dash-upgrade-card-desc">{c.desc}</p>
              <div className="dash-upgrade-card-foot">
                <a href={`/dashboard/${slug}/bereiche/${c.key}`} className="dash-upgrade-card-link">
                  Inhalte pflegen →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pending ? (
        /* Geplanter Wechsel — nur Hinweis + Aufheben */
        <div className="dash-upgrade-block">
          <div className="dash-upgrade-block-head">
            <h2 className="dash-h2">Geplanter Wechsel</h2>
          </div>
          <DowngradeClient slug={slug} addons={currentAddons} currentTier={currentTier} pending={pending} />
        </div>
      ) : (
        <>
          {/* Nachbuchen */}
          <div className="dash-upgrade-block">
            <div className="dash-upgrade-block-head">
              <h2 className="dash-h2">Bereiche dazubuchen</h2>
              <span className="dash-upgrade-count">{addable.length} verfügbar</span>
            </div>
            <p className="dash-help-text">
              Wählt aus, was ihr ergänzen möchtet — wir zeigen euch sofort, ob und wie sich der Preis ändert.
            </p>
            <UpgradeClient
              slug={slug}
              addable={addable}
              currentAddonCount={currentAddonCount}
              currentTier={currentTier}
              isTrialing={isTrialing}
            />
          </div>

          {/* Reduzieren */}
          {currentAddons.length > 0 && (
            <div className="dash-upgrade-block">
              <div className="dash-upgrade-block-head">
                <h2 className="dash-h2">Stufe reduzieren</h2>
              </div>
              <DowngradeClient slug={slug} addons={currentAddons} currentTier={currentTier} pending={null} />
            </div>
          )}
        </>
      )}
    </DashboardSection>
  );
}

const tierBar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  padding: '16px 18px',
  background: '#0F0E0C',
  color: '#FFFFFF',
  borderRadius: 12,
  marginBottom: 24,
};
const tierEyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  opacity: 0.6,
};
const tierName: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginTop: 2 };
const tierCount: React.CSSProperties = { fontSize: 13, opacity: 0.75 };
