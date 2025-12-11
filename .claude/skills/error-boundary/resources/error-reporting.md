# エラー報告・監視

## 概要

プロダクション環境でのエラー監視は、アプリケーションの健全性を
維持するために不可欠です。このドキュメントでは、エラー報告の
実装パターンと主要なサービスの統合方法を解説します。

## 報告すべき情報

### 基本情報

```typescript
interface ErrorReport {
  // エラー情報
  message: string;
  stack: string;
  name: string;

  // Reactコンポーネント情報
  componentStack?: string;

  // コンテキスト情報
  url: string;
  userAgent: string;
  timestamp: string;

  // ユーザー情報（匿名化）
  userId?: string;
  sessionId?: string;

  // アプリケーション状態
  appVersion: string;
  environment: string;

  // 追加メタデータ
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}
```

### 収集の実装

```typescript
function collectErrorContext(error: Error, errorInfo?: ErrorInfo): ErrorReport {
  return {
    // エラー情報
    message: error.message,
    stack: error.stack ?? "",
    name: error.name,

    // Reactコンポーネント情報
    componentStack: errorInfo?.componentStack,

    // コンテキスト情報
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),

    // アプリケーション情報
    appVersion: process.env.REACT_APP_VERSION ?? "unknown",
    environment: process.env.NODE_ENV,
  };
}
```

## エラー報告サービスの統合

### Sentry

```typescript
// インストール
// pnpm install @sentry/react

import * as Sentry from '@sentry/react';

// 初期化
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.REACT_APP_VERSION,

  // パフォーマンス監視
  tracesSampleRate: 1.0,

  // エラーフィルタリング
  beforeSend(event) {
    // 特定のエラーを除外
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    return event;
  },
});

// Error Boundaryで使用
class SentryErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });
  }

  // ...
}

// または、Sentryの組み込みError Boundaryを使用
import { ErrorBoundary } from '@sentry/react';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MyApp />
    </ErrorBoundary>
  );
}
```

### Bugsnag

```typescript
// pnpm install @bugsnag/js @bugsnag/plugin-react

import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

Bugsnag.start({
  apiKey: process.env.REACT_APP_BUGSNAG_API_KEY!,
  plugins: [new BugsnagPluginReact()],
  appVersion: process.env.REACT_APP_VERSION,
  releaseStage: process.env.NODE_ENV,

  onError: (event) => {
    // カスタム処理
    event.addMetadata('app', {
      route: window.location.pathname,
    });
  },
});

// Error Boundary
const ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React);

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MyApp />
    </ErrorBoundary>
  );
}
```

### 自前のエラー報告

```typescript
// エラー報告サービス
class ErrorReporter {
  private endpoint: string;
  private queue: ErrorReport[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  report(error: Error, context?: Record<string, unknown>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack ?? "",
      name: error.name,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      appVersion: process.env.REACT_APP_VERSION ?? "unknown",
      environment: process.env.NODE_ENV,
      extra: context,
    };

    this.queue.push(report);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimeout) return;

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, 5000);
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const reports = [...this.queue];
    this.queue = [];
    this.flushTimeout = null;

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errors: reports }),
      });
    } catch (e) {
      // 送信失敗時はキューに戻す
      this.queue.unshift(...reports);
      console.error("Failed to send error reports:", e);
    }
  }
}

// グローバルインスタンス
export const errorReporter = new ErrorReporter("/api/errors");

// Error Boundaryで使用
class ReportingErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorReporter.report(error, {
      componentStack: errorInfo.componentStack,
    });
  }
}
```

## グローバルエラーハンドリング

### Unhandled Promise Rejection

```typescript
// 未処理のPromise拒否をキャッチ
window.addEventListener("unhandledrejection", (event) => {
  const error =
    event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

  errorReporter.report(error, {
    type: "unhandledrejection",
  });

  // 必要に応じてイベントを抑制
  // event.preventDefault();
});
```

### Global Error Handler

```typescript
// グローバルエラーをキャッチ
window.addEventListener("error", (event) => {
  // スクリプトエラー以外は無視
  if (event.error) {
    errorReporter.report(event.error, {
      type: "global",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }
});
```

### 統合的なセットアップ

```typescript
// エラーハンドリング初期化
function initializeErrorHandling() {
  // Sentryまたは他のサービスを初期化
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });

  // グローバルハンドラー
  window.addEventListener("unhandledrejection", (event) => {
    Sentry.captureException(event.reason);
  });

  window.addEventListener("error", (event) => {
    if (event.error) {
      Sentry.captureException(event.error);
    }
  });

  // コンソールエラーの追跡（オプション）
  const originalConsoleError = console.error;
  console.error = (...args) => {
    Sentry.addBreadcrumb({
      category: "console",
      message: args.join(" "),
      level: "error",
    });
    originalConsoleError.apply(console, args);
  };
}
```

## エラーのサニタイズ

### 機密情報の除去

```typescript
function sanitizeError(error: ErrorReport): ErrorReport {
  const sanitized = { ...error };

  // URLからクエリパラメータを除去
  const url = new URL(sanitized.url);
  url.search = "";
  sanitized.url = url.toString();

  // スタックトレースからファイルパスを正規化
  if (sanitized.stack) {
    sanitized.stack = sanitized.stack.replace(
      /\/Users\/[^/]+/g,
      "/Users/[redacted]",
    );
  }

  // 機密フィールドを除去
  if (sanitized.extra) {
    const { password, token, secret, ...safeExtra } = sanitized.extra as Record<
      string,
      unknown
    >;
    sanitized.extra = safeExtra;
  }

  return sanitized;
}
```

## ベストプラクティス

1. **環境分離**: 開発と本番でエラー報告を分ける
2. **サンプリング**: 大量のエラーはサンプリングで軽減
3. **機密情報保護**: パスワードやトークンを送信しない
4. **ノイズ除去**: 不要なエラー（ResizeObserverなど）をフィルタ
5. **アラート設定**: 重要なエラーは即座に通知
6. **ソースマップ**: 本番ビルドでもデバッグ可能に
