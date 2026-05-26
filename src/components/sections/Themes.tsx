import { THEMES } from '@/lib/content';
import Section from '@/components/ui/Section';

/**
 * Themes-Section: 7 Themes als visuelle Karten.
 * Hintergrundfarben spiegeln den Theme-Stil wider.
 */
const THEME_STYLES: Record<string, { bg: string; text: string; muted: string }> = {
  'theme-editorial': { bg: '#f8f4ec', text: '#0e0d0b', muted: '#6b6557' },
  'theme-botanical': { bg: 'linear-gradient(180deg, #eef0e7 0%, #e2e6d6 100%)', text: '#1f2a1c', muted: '#5a6354' },
  'theme-contemporary': { bg: '#ffffff', text: '#0e0d0b', muted: '#6b6557' },
  'theme-luxe': { bg: 'linear-gradient(180deg, #1a1815 0%, #2a2520 100%)', text: '#f6f3ec', muted: '#a8a297' },
  'theme-neon': { bg: '#0f0f12', text: '#ffffff', muted: '#888' },
  'theme-video': { bg: 'linear-gradient(180deg, #2a3140 0%, #1a1f2b 100%)', text: '#ffffff', muted: '#aaa' },
  'theme-parallax': { bg: 'linear-gradient(180deg, #d4ccb8 0%, #c4baa0 100%)', text: '#2a2520', muted: '#6b6557' },
};

export default function Themes() {
  return (
    <Section id="themes" eyebrow={THEMES.eyebrow} eyebrowNumber="03">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 mb-16 items-end">
        <h2 className="h2-editorial">
          {THEMES.title}
          <br />
          <em>{THEMES.titleEmphasis}</em>
        </h2>
        <p className="lede">{THEMES.lede}</p>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEMES.list.map((theme, i) => {
          const style = THEME_STYLES[theme.className] || THEME_STYLES['theme-editorial'];
          return (
            <div
              key={theme.name}
              className="rounded-xl overflow-hidden border border-rule-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: style.bg, color: style.text }}
            >
              {/* Theme Preview Mock */}
              <div className="aspect-[4/3] p-7 flex flex-col justify-between">
                <div
                  className="font-mono text-[9px] tracking-[0.3em] uppercase"
                  style={{ color: style.muted }}
                >
                  {theme.name} · No. {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div
                    className="text-3xl font-light leading-tight"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Brautpaar
                    <br />
                    <em>&</em> Name
                  </div>
                  <div
                    className="font-mono text-[10px] tracking-[0.18em] uppercase mt-3"
                    style={{ color: style.muted }}
                  >
                    Datum · Ort
                  </div>
                </div>
              </div>
              {/* Theme Name Footer */}
              <div className="px-7 py-4 border-t border-current/10 flex items-center justify-between">
                <span className="text-sm font-medium">{theme.name}</span>
                <span
                  className="font-mono text-[10px] tracking-[0.12em] uppercase"
                  style={{ color: style.muted }}
                >
                  {theme.tone}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
