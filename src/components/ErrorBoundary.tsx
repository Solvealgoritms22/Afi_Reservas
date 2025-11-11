import React from "react";

type ErrorBoundaryProps = {
  fallback?: React.ReactNode;
  onReset?: () => void;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log simple para observabilidad, sin servicios externos
    console.error("ErrorBoundary atrapó un error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 text-slate-200">
            <div className="mb-2 text-lg font-semibold">Algo salió mal</div>
            <div className="text-sm text-slate-400">
              Intenta recargar o volver a esta sección.
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={this.handleReset}
                className="rounded bg-slate-200 px-3 py-1.5 text-slate-900 hover:bg-white"
              >
                Reintentar
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;