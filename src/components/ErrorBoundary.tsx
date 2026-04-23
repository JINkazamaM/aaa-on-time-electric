import { Component, ErrorInfo, ReactNode } from 'react';

declare global {
  interface Window {
    lastError?: { error: Error; errorInfo: ErrorInfo };
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.sectionName || 'section'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="card-surface p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-black uppercase mb-2">Section Unavailable</h3>
              <p className="text-text-muted mb-4">
                This section encountered an error. The rest of the page is still functional.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    // Log to console for debugging
    if (typeof window !== 'undefined') {
      window.lastError = { error, errorInfo };
    }
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base p-6">
          <div className="max-w-md w-full card-surface p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black uppercase mb-4">Something Went Wrong</h2>
            <p className="text-text-muted mb-6">
              We apologize for the inconvenience. Please refresh the page or contact us directly.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
              <a href="tel:+17862951748" className="btn-primary">
                Call Us
              </a>
            </div>
            <div className="mt-6 p-4 bg-red-500/10 rounded text-left overflow-auto">
              <p className="text-xs text-red-500 font-mono">Error: {errorMessage}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}