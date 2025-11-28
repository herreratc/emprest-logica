import { Component, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Dashboard render error", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="text-lg font-semibold">Algo deu errado ao carregar esta seção.</p>
          <p className="mt-2 text-sm">{this.state.error?.message ?? "Erro inesperado."}</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 rounded-full bg-logica-purple px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-logica-deep-purple"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
