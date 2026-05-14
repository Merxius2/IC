import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches errors from child components and displays a fallback UI
 * Prevents entire app from crashing on component-level errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle size={48} className="text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                Something went wrong
              </h1>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left bg-white dark:bg-gray-800 rounded p-3 text-xs max-h-40 overflow-y-auto">
                  <summary className="cursor-pointer font-mono text-red-600 dark:text-red-400 mb-2">
                    Error details (development only)
                  </summary>
                  <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {'\n\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <button
                onClick={this.resetError}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Try again
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
