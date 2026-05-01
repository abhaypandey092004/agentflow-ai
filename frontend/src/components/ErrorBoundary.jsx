import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend Crash Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] p-6 text-center">
          <div className="glass-card max-w-md rounded-[2.5rem] p-12 shadow-2xl border border-white/10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="mb-4 text-3xl font-black text-white tracking-tight">System Exception</h1>
            <p className="mb-8 text-slate-400 font-medium leading-relaxed">
              A neural link disruption occurred. The interface encountered an unexpected state and could not recover.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="group flex w-full items-center justify-center space-x-3 rounded-2xl bg-white/5 px-6 py-4 text-sm font-black text-white hover:bg-white/10 transition-all border border-white/10"
            >
              <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
              <span>Initialize Reset</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
