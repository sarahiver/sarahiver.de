'use client';

import React from 'react';

/**
 * Fängt Render-Fehler in Dashboard-Sections ab und zeigt einen freundlichen
 * Fallback statt der ganzen Seite zu crashen.
 *
 * Adaptiert aus der sarahiver.com-Admin-Vorlage. Class Component, weil
 * ErrorBoundary nur als Class funktioniert (React 18, keine Hook-Variante).
 */

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

export default class DashboardErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[Dashboard] section crashed:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="dash-error-box">
        <div className="dash-error-icon" aria-hidden="true">!</div>
        <h2 className="dash-error-title">Etwas ist schiefgelaufen</h2>
        <p className="dash-error-desc">
          Dieser Bereich konnte nicht geladen werden. Bitte versucht es erneut. Wenn das
          Problem bleibt, meldet euch unter{' '}
          <a href="mailto:hallo@sarahiver.de">hallo@sarahiver.de</a>.
        </p>
        <div className="dash-error-actions">
          <button type="button" className="dash-btn-out" onClick={this.reset}>
            Erneut versuchen
          </button>
        </div>
        {this.state.error && (
          <details className="dash-error-details">
            <summary>Fehlerdetails</summary>
            <pre>{this.state.error.toString()}</pre>
          </details>
        )}
      </div>
    );
  }
}
