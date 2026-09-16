import { PRELAUNCH_SIGNUP_COPY, GATE_COPY } from '@/lib/launch';
import LaunchSignupForm from './LaunchSignupForm';

/**
 * Prelaunch-Zustand von /signup.
 *
 * Ersetzt vor dem 15.10.2026 den kompletten Kauf-Funnel. Die eigentliche
 * Sperre sitzt in der Server Action (startCheckout) — diese Seite ist die
 * sichtbare Hälfte davon, nicht der Schutz.
 */
export default function PrelaunchNotice() {
  return (
    <main className="sdlg-page">
      <div className="sdlg-page-in">
        <p className="sdlg-eyebrow">{PRELAUNCH_SIGNUP_COPY.eyebrow}</p>
        <h1 className="sdlg-title">{PRELAUNCH_SIGNUP_COPY.title}</h1>
        <p className="sdlg-text">{PRELAUNCH_SIGNUP_COPY.text}</p>

        <div className="sdlg-page-form">
          <LaunchSignupForm />
        </div>

        <div className="sdlg-explore">
          <p className="sdlg-explore-lead">{GATE_COPY.exploreLead}</p>
          <div className="sdlg-explore-actions sdlg-page-actions">
            <a className="sdlg-btn sdlg-btn--ghost" href={GATE_COPY.exploreDemos.href}>
              {GATE_COPY.exploreDemos.label}
            </a>
            <a className="sdlg-btn sdlg-btn--ghost" href={GATE_COPY.exploreDashboard.href}>
              {GATE_COPY.exploreDashboard.label}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
