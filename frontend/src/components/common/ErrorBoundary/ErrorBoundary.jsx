import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Velvorax ErrorBoundary caught an exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <div className="max-w-lg w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-8 sm:p-10 text-center shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center text-3xl mx-auto mb-5 shadow-xs">
              ⚠️
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-2">
              Something went wrong
            </h2>

            <p className="text-[14px] text-[var(--text-secondary)] mb-6 leading-relaxed">
              An unexpected error occurred while rendering this section. Our engineering team has been notified.
            </p>

            {import.meta.env?.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-left overflow-x-auto text-xs font-mono text-rose-400">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer border border-[var(--button-primary)]"
              >
                🔄 Refresh Page
              </button>

              <button
                onClick={this.handleGoDashboard}
                className="w-full sm:w-auto px-6 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                📊 Go to Dashboard
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs transition-colors cursor-pointer"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
