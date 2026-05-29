import DashboardSection from '@/components/dashboard/DashboardSection';
import EditorShell from '@/components/dashboard/EditorShell';
import SettingsTabs from '@/components/dashboard/SettingsTabs';
import StammdatenTab from './StammdatenTab';
import StilTab from './StilTab';
import { loadDashboardData } from '@/lib/dashboard-data';
import { loadAllPresets } from '@/lib/presets';
import { notFound } from 'next/navigation';

/**
 * /dashboard/[slug]/settings
 *
 * Zwei Tabs: Stammdaten + Stil. Navigation lebt als eigene Sidebar-Section
 * (/dashboard/[slug]/navigation).
 *
 * Dreispaltig: Sidebar | Editor | Live-Vorschau. Auf Mobile fällt die
 * Vorschau weg (Stammdaten/Stil sind dort weiter bearbeitbar).
 */

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [data, presets] = await Promise.all([loadDashboardData(slug), loadAllPresets()]);
  if (!data) notFound();

  const { dateStr, timeStr } = splitToBerlin(data.site.wedding_date);

  return (
    <DashboardSection
      title="Stil & Stammdaten"
      description="Die Identität eurer Hochzeitsseite — Namen, Datum, Look."
    >
      <EditorShell weddingSlug={slug} mobileBlock={false}>
        <SettingsTabs
          tabs={[
            {
              id: 'stammdaten',
              label: 'Stammdaten',
              content: (
                <StammdatenTab
                  slug={slug}
                  initial={{
                    couple_name_1: data.site.couple_name_1 || '',
                    couple_name_2: data.site.couple_name_2 || '',
                    wedding_date_local: dateStr,
                    wedding_time_local: timeStr,
                    wedding_location: data.site.wedding_location || '',
                  }}
                />
              ),
            },
            {
              id: 'stil',
              label: 'Stil',
              content: (
                <StilTab
                  slug={slug}
                  initial={{
                    start_style_id: data.site.start_style_id || 'klassisch',
                    palette_preset_id: data.site.palette_preset_id,
                    font_preset_id: data.site.font_preset_id,
                    custom_bg: data.site.palette_custom_bg,
                    custom_bg_soft: data.site.palette_custom_bg_soft,
                    custom_accent: data.site.palette_custom_accent,
                    custom_accent_deep: data.site.palette_custom_accent_deep,
                    custom_ink: data.site.palette_custom_ink,
                  }}
                  styles={presets.styles}
                  palettes={presets.palettes}
                  fonts={presets.fonts}
                />
              ),
            },
          ]}
        />
      </EditorShell>
    </DashboardSection>
  );
}

/**
 * UTC-ISO → lokale Berlin-Datum/Uhrzeit-Strings ("YYYY-MM-DD", "HH:MM").
 * Für die `<input type="date">` und `<input type="time">`-Felder.
 */
function splitToBerlin(iso: string): { dateStr: string; timeStr: string } {
  if (!iso) return { dateStr: '', timeStr: '' };
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const dateStr = `${get('year')}-${get('month')}-${get('day')}`;
  const timeStr = `${get('hour')}:${get('minute')}`;
  return { dateStr, timeStr };
}
