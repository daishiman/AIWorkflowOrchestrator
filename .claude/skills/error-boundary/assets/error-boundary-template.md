# Error Boundaryテンプレート

## 基本的なError Boundary

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 基本的なError Boundary
 *
 * @example
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div>Something went wrong.</div>
      );
    }

    return this.props.children;
  }
}
```

## リセット機能付きError Boundary

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface Props {
  children: ReactNode;
  fallbackRender?: (props: FallbackProps) => ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * リセット機能付きError Boundary
 *
 * @example
 * <ErrorBoundaryWithReset
 *   fallbackRender={({ error, resetErrorBoundary }) => (
 *     <div>
 *       <p>{error.message}</p>
 *       <button onClick={resetErrorBoundary}>再試行</button>
 *     </div>
 *   )}
 *   onError={(error) => logError(error)}
 *   onReset={() => console.log('Reset')}
 *   resetKeys={[userId]}
 * >
 *   <MyComponent />
 * </ErrorBoundaryWithReset>
 */
export class ErrorBoundaryWithReset extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // resetKeysが変更されたらリセット
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys
    ) {
      const hasChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      );

      if (hasChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, fallbackRender } = this.props;

    if (hasError && error) {
      if (fallbackRender) {
        return fallbackRender({
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      return fallback ?? <div>Something went wrong.</div>;
    }

    return children;
  }
}
```

## エラー報告統合Error Boundary

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

/**
 * Sentry統合Error Boundary
 */
export class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({
        componentStack: errorInfo.componentStack,
      });

      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div>
            <h2>エラーが発生しました</h2>
            {this.state.eventId && (
              <button
                onClick={() =>
                  Sentry.showReportDialog({ eventId: this.state.eventId! })
                }
              >
                フィードバックを送信
              </button>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## 階層化Error Boundary

```typescript
import { Component, ErrorInfo, ReactNode, createContext, useContext } from 'react';

// エラーコンテキスト
interface ErrorContextType {
  error: Error | null;
  resetError: () => void;
  reportError: (error: Error) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export function useErrorBoundary() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorBoundary must be used within ErrorBoundaryProvider');
  }
  return context;
}

interface Props {
  children: ReactNode;
  level: 'app' | 'page' | 'section' | 'component';
  fallback?: (error: Error, level: string) => ReactNode;
  onError?: (error: Error, level: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 階層化Error Boundary
 *
 * @example
 * <HierarchicalErrorBoundary level="app">
 *   <HierarchicalErrorBoundary level="page">
 *     <HierarchicalErrorBoundary level="section">
 *       <MyComponent />
 *     </HierarchicalErrorBoundary>
 *   </HierarchicalErrorBoundary>
 * </HierarchicalErrorBoundary>
 */
export class HierarchicalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, this.props.level);

    console.error(`[${this.props.level}] Error caught:`, error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  reportError = (error: Error) => {
    this.setState({ hasError: true, error });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, level, fallback } = this.props;

    const contextValue: ErrorContextType = {
      error,
      resetError: this.resetError,
      reportError: this.reportError,
    };

    if (hasError && error) {
      if (fallback) {
        return (
          <ErrorContext.Provider value={contextValue}>
            {fallback(error, level)}
          </ErrorContext.Provider>
        );
      }

      return (
        <ErrorContext.Provider value={contextValue}>
          <DefaultFallback level={level} error={error} onReset={this.resetError} />
        </ErrorContext.Provider>
      );
    }

    return (
      <ErrorContext.Provider value={contextValue}>
        {children}
      </ErrorContext.Provider>
    );
  }
}

function DefaultFallback({
  level,
  error,
  onReset,
}: {
  level: string;
  error: Error;
  onReset: () => void;
}) {
  const messages = {
    app: 'アプリケーションでエラーが発生しました',
    page: 'ページを表示できません',
    section: 'このセクションを読み込めません',
    component: 'コンポーネントでエラーが発生しました',
  };

  return (
    <div className={`error-fallback error-fallback-${level}`}>
      <h2>{messages[level as keyof typeof messages]}</h2>
      <p>{error.message}</p>
      <button onClick={onReset}>再試行</button>
    </div>
  );
}
```

## 関数コンポーネント用ラッパー

```typescript
import { Component, ErrorInfo, ReactNode, ComponentType } from 'react';

interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * HOCとしてのError Boundary
 *
 * @example
 * const SafeComponent = withErrorBoundary(MyComponent, {
 *   fallback: <div>エラー</div>,
 *   onError: (error) => logError(error),
 * });
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  class WithErrorBoundary extends Component<P, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      options.onError?.(error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return options.fallback ?? <div>Something went wrong.</div>;
      }

      return <WrappedComponent {...this.props} />;
    }
  }

  WithErrorBoundary.displayName = `WithErrorBoundary(${
    WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'
  })`;

  return WithErrorBoundary;
}

interface State {
  hasError: boolean;
  error: Error | null;
}
```

## 使用例

```typescript
// App.tsx
import { ErrorBoundaryWithReset } from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundaryWithReset
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="app-error">
          <h1>アプリケーションエラー</h1>
          <p>{error.message}</p>
          <button onClick={resetErrorBoundary}>再試行</button>
          <button onClick={() => window.location.reload()}>
            ページを再読み込み
          </button>
        </div>
      )}
      onError={(error, errorInfo) => {
        // エラー報告
        console.error('App error:', error, errorInfo);
      }}
    >
      <Router>
        <Routes />
      </Router>
    </ErrorBoundaryWithReset>
  );
}
```
