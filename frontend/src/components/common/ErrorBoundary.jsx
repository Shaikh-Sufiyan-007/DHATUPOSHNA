import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('Unhandled UI exception in ErrorBoundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="w-16 h-16 rounded-2xl bg-ice/10 border border-ice/30 flex items-center justify-center text-ice mb-6 shadow-xl shadow-ice/5">
            <AlertTriangle className="w-8 h-8 text-ice" />
          </div>

          <span className="text-xs font-heading font-bold text-ice uppercase tracking-widest mb-2">
            System Notice • Render Interruption
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-heading mb-3">
            Something went wrong
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-8 leading-relaxed font-body">
            The Ayurvedic Knowledge interface encountered an unexpected state. You can reload the platform or return to the main dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-2 cursor-pointer font-heading"
            >
              <RotateCcw className="w-4 h-4 text-ice" />
              <span>Reload Page</span>
            </button>

            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-ice-bright to-silver-deep text-slate-950 hover:opacity-95 shadow transition flex items-center gap-2 cursor-pointer font-heading"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}