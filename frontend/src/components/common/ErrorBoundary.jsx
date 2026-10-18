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
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-xl shadow-amber-500/5">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>

          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-2">
            System Notice • Render Interruption
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-heading mb-3">
            Something went wrong
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
            The Ayurvedic Knowledge interface encountered an unexpected state. You can reload the platform or return to the main dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>

            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-95 shadow transition flex items-center gap-2"
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
