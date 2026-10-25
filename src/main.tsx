import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('24/7 AI Terminal caught error:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center p-6 text-center font-mono">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-2xl mb-4 animate-pulse">
            ⚠️
          </div>
          <h1 className="text-xl font-bold mb-2">24/7 AI Engine Self-Healing Active</h1>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            An unexpected error occurred: {this.state.error?.message || 'Recovering state buffer'}. The system is ready to resume.
          </p>
          <button
            onClick={this.handleRestart}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer"
          >
            Resume 24/7 Session
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
