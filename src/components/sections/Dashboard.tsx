'use client';

import { useState } from 'react';
import { DASHBOARD } from '@/lib/content';
import { DASH_STYLES } from '@/lib/dashboard-options';

export default function Dashboard() {
  const [style, setStyle] = useState('editorial');
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeStyle = DASH_STYLES.find((s) => s.id === style) ?? DASH_STYLES[0];
  const liveUrl = `https://julia-tom.sarahiver.de?style=${style}`;

  return (
    <section id="try" className="dash section rule-top">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{DASHBOARD.eyebrow}</span>
            <h2 className="display-large">
              {DASHBOARD.h_pre} <em>{DASHBOARD.h_em}</em>{DASHBOARD.h_post}
            </h2>
          </div>
          <div>
            <p className="lede">{DASHBOARD.lede}</p>
          </div>
        </div>

        <div className="dash__body">
          {/* === LEFT: Style Picker === */}
          <div className="dash__controls">
            <div className="dash__group">
              <div className="dash__group-label">{DASHBOARD.styleLabel}</div>
              <div className="dash__opts dash__opts-style">
                {DASH_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`dash__opt${style === s.id ? ' is-active' : ''}`}
                    aria-pressed={style === s.id}
                  >
                    <span className="dash__opt-label">{s.label}</span>
                    <span className="dash__opt-hint">{s.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="dash__tagline">
              <span className="dash__tagline-num">
                {String(DASH_STYLES.findIndex((s) => s.id === style) + 1).padStart(2, '0')}
              </span>
              <p>{activeStyle.tagline}</p>
            </div>

            <a href="#config" className="dash__cta">
              <span>{DASHBOARD.cta}</span>
              <span className="dash__cta-sub">{DASHBOARD.ctaSub}</span>
            </a>
          </div>

          {/* === RIGHT: Live Preview === */}
          <div className="dash__preview-wrap">
            <button
              type="button"
              className="dash__preview-toggle"
              onClick={() => setPreviewOpen(true)}
            >
              <span>Vorschau ansehen</span>
              <span>↗</span>
            </button>

            <div className={`dash__frame${previewOpen ? ' is-open-mobile' : ''}`}>
              <button
                type="button"
                className="dash__frame-close"
                onClick={() => setPreviewOpen(false)}
                aria-label="Vorschau schließen"
              >
                ×
              </button>
              <div className="dash__bar">
                <span className="dash__bar-dot" />
                <span className="dash__bar-dot" />
                <span className="dash__bar-dot" />
                <span className="dash__bar-url">julia-tom.sarahiver.de</span>
              </div>
              <div className="dash-preview" data-style={style}>
                <DashPreviewContent />
              </div>
            </div>

            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dash__live-link"
            >
              <span>{DASHBOARD.liveLinkLabel}</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashPreviewContent() {
  const p = DASHBOARD.preview;
  return (
    <>
      <div className="dp-hero">
        <span className="dp-eye">{p.heroEye}</span>
        <h3 className="dp-couple">
          <span>{p.coupleA}</span>
          <span className="dp-amp">&amp;</span>
          <span>{p.coupleB}</span>
        </h3>
        <div className="dp-meta">{p.date}</div>
        <div className="dp-rule" />
        <div className="dp-loc">{p.location}</div>
        <div className="dp-decor" aria-hidden="true" />
      </div>

      <div className="dp-countdown">
        <div className="dp-section-eye">{p.countdownEye}</div>
        <div className="dp-countdown-nums">
          <div className="dp-cd-block"><b>{p.countdownDays}</b><span>Tage</span></div>
          <div className="dp-cd-sep">:</div>
          <div className="dp-cd-block"><b>{p.countdownHours}</b><span>Std</span></div>
          <div className="dp-cd-sep">:</div>
          <div className="dp-cd-block"><b>{p.countdownMins}</b><span>Min</span></div>
        </div>
      </div>

      <div className="dp-rsvp">
        <div className="dp-section-eye">{p.rsvpEye}</div>
        <h4 className="dp-h4">{p.rsvpHead}</h4>
        <div className="dp-rsvp-deadline">{p.rsvpDeadline}</div>
        <div className="dp-rsvp-btns">
          <button type="button" className="dp-btn dp-btn-yes">{p.rsvpYes}</button>
          <button type="button" className="dp-btn dp-btn-no">{p.rsvpNo}</button>
        </div>
      </div>

      <div className="dp-lovestory">
        <div className="dp-section-eye">{p.lovestoryEye}</div>
        <h4 className="dp-h4">{p.lovestoryHead}</h4>
        <p className="dp-lovestory-text">{p.lovestoryText}</p>
      </div>
    </>
  );
}
