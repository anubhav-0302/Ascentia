import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-96 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6 text-red-400 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-400 text-sm mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            <button
              onClick={this.handleReset}
              className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all duration-200 active:scale-95"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-gray-400 text-sm cursor-pointer hover:text-white transition-colors">
                  Error Details
                </summary>
                <pre className="mt-2 p-4 bg-slate-800 rounded-lg text-xs text-red-400 overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
