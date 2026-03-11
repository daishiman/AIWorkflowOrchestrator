import { Component, type ErrorInfo, type ReactNode } from "react";

interface PreviewErrorBoundaryProps {
  children: ReactNode;
}

interface PreviewErrorBoundaryState {
  hasError: boolean;
  message: string;
}

const initialState: PreviewErrorBoundaryState = {
  hasError: false,
  message: "",
};

export class PreviewErrorBoundary extends Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  constructor(props: PreviewErrorBoundaryProps) {
    super(props);
    this.state = initialState;
  }

  static getDerivedStateFromError(error: Error): PreviewErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[PreviewErrorBoundary]", error, errorInfo.componentStack);
  }

  private readonly handleReset = (): void => {
    this.setState(initialState);
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section
        className="flex h-full min-h-0 flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--status-error)] bg-[var(--bg-primary)] p-4"
        role="alert"
        data-testid="preview-error-boundary"
      >
        <p className="text-sm font-semibold text-[var(--status-error)]">
          プレビューの描画でエラーが発生しました
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          {this.state.message}
        </p>
        <button
          type="button"
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]"
          onClick={this.handleReset}
          data-testid="preview-error-boundary-reset"
        >
          リセット
        </button>
      </section>
    );
  }
}
