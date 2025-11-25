# リカバリー戦略

## 概要

エラーが発生した後、ユーザーにどのような回復手段を提供するかは
ユーザー体験に大きく影響します。このドキュメントでは、
様々なリカバリー戦略とその実装パターンを解説します。

## リカバリー戦略の種類

### 1. 再試行（Retry）

**適用ケース**: 一時的なエラー、ネットワークエラー

```typescript
interface RetryableErrorBoundaryProps {
  children: ReactNode;
  maxRetries?: number;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class RetryableErrorBoundary extends Component<RetryableErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null, retryCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  handleRetry = () => {
    const { maxRetries = 3, onRetry } = this.props;

    if (this.state.retryCount < maxRetries) {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
      }));
      onRetry?.();
    }
  };

  render() {
    const { maxRetries = 3 } = this.props;

    if (this.state.hasError) {
      const canRetry = this.state.retryCount < maxRetries;

      return (
        <div className="error-fallback">
          <h2>問題が発生しました</h2>
          <p>{this.state.error?.message}</p>

          {canRetry ? (
            <button onClick={this.handleRetry}>
              再試行 ({this.state.retryCount}/{maxRetries})
            </button>
          ) : (
            <p>再試行の上限に達しました。しばらく経ってからお試しください。</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. リセット（Reset）

**適用ケース**: 状態の破損、初期状態への復帰が有効な場合

```typescript
interface ResetableErrorBoundaryProps {
  children: ReactNode;
  resetKeys?: unknown[];
  onReset?: () => void;
  fallbackRender: (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode;
}

class ResetableErrorBoundary extends Component<ResetableErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  // resetKeysが変わったらリセット
  componentDidUpdate(prevProps: ResetableErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetKeys) {
      const changed = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (changed) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallbackRender({
        error: this.state.error!,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }

    return this.props.children;
  }
}

// 使用例
function ProductPage({ productId }: { productId: string }) {
  return (
    <ResetableErrorBoundary
      resetKeys={[productId]}  // productIdが変わったらリセット
      onReset={() => console.log('Boundary reset')}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <p>商品を読み込めませんでした</p>
          <button onClick={resetErrorBoundary}>リセット</button>
        </div>
      )}
    >
      <ProductDetails productId={productId} />
    </ResetableErrorBoundary>
  );
}
```

### 3. フォールバック機能（Fallback Feature）

**適用ケース**: 代替機能が提供できる場合

```typescript
function FeatureWithFallback() {
  const [useNewFeature, setUseNewFeature] = useState(true);

  if (!useNewFeature) {
    // フォールバック機能
    return <LegacyFeature />;
  }

  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          <p>新機能でエラーが発生しました</p>
          <button onClick={() => setUseNewFeature(false)}>
            従来の機能を使用
          </button>
          <button onClick={resetErrorBoundary}>
            再試行
          </button>
        </div>
      )}
    >
      <NewFeature />
    </ErrorBoundary>
  );
}
```

### 4. ナビゲーション（Navigation）

**適用ケース**: 現在のページから離れることが適切な場合

```typescript
function NavigableErrorFallback({ error }: { error: Error }) {
  const navigate = useNavigate();

  return (
    <div className="error-fallback">
      <h2>ページを表示できません</h2>
      <p>{error.message}</p>

      <div className="actions">
        <button onClick={() => navigate(-1)}>
          前のページに戻る
        </button>
        <button onClick={() => navigate('/')}>
          ホームに戻る
        </button>
        <button onClick={() => window.location.reload()}>
          ページを再読み込み
        </button>
      </div>
    </div>
  );
}
```

### 5. 部分的復旧（Partial Recovery）

**適用ケース**: 一部の機能だけが失敗した場合

```typescript
function DashboardWithPartialRecovery() {
  return (
    <div className="dashboard">
      <ErrorBoundary fallback={<HeaderFallback />}>
        <Header />
      </ErrorBoundary>

      <div className="main-content">
        <ErrorBoundary fallback={<ChartFallback />}>
          <Chart />
        </ErrorBoundary>

        <ErrorBoundary fallback={<TableFallback />}>
          <DataTable />
        </ErrorBoundary>

        {/* エラーが発生しても他のウィジェットは動作 */}
        <ErrorBoundary fallback={<WidgetFallback name="Activity" />}>
          <ActivityWidget />
        </ErrorBoundary>
      </div>

      <ErrorBoundary fallback={<SidebarFallback />}>
        <Sidebar />
      </ErrorBoundary>
    </div>
  );
}
```

## 自動リカバリー

### 自動再試行

```typescript
interface AutoRetryProps {
  children: ReactNode;
  delay?: number;
  maxAttempts?: number;
}

class AutoRetryErrorBoundary extends Component<AutoRetryProps, State & { attempt: number }> {
  private retryTimer: NodeJS.Timeout | null = null;

  state = { hasError: false, error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch() {
    const { delay = 3000, maxAttempts = 3 } = this.props;

    if (this.state.attempt < maxAttempts) {
      this.retryTimer = setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          attempt: prev.attempt + 1,
        }));
      }, delay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  render() {
    const { maxAttempts = 3 } = this.props;

    if (this.state.hasError) {
      if (this.state.attempt < maxAttempts) {
        return (
          <div className="auto-retry">
            <p>問題が発生しました。自動的に再試行します...</p>
            <p>試行 {this.state.attempt + 1}/{maxAttempts}</p>
          </div>
        );
      }

      return (
        <div className="error-fallback">
          <p>自動復旧に失敗しました</p>
          <button onClick={() => window.location.reload()}>
            ページを再読み込み
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 接続復旧時の自動リセット

```typescript
function OnlineAwareErrorBoundary({ children }: { children: ReactNode }) {
  const [key, setKey] = useState(0);
  const wasOffline = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      if (wasOffline.current) {
        // オフラインからオンラインに復帰したらリセット
        setKey((k) => k + 1);
        wasOffline.current = false;
      }
    };

    const handleOffline = () => {
      wasOffline.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary key={key} fallback={<NetworkErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}
```

## リカバリー戦略の選択

| エラータイプ | 推奨戦略 |
|-------------|---------|
| ネットワークエラー | 再試行 + 自動復旧 |
| 状態の破損 | リセット |
| 認証エラー | ナビゲーション（ログイン） |
| 権限エラー | ナビゲーション（ホーム） |
| 一時的なバグ | 再試行 |
| 致命的なエラー | フォールバック機能 |
| UI部分のエラー | 部分的復旧 |

## ベストプラクティス

1. **ユーザーに選択肢を**: 複数のリカバリーオプションを提供
2. **自動と手動の組み合わせ**: 自動再試行後に手動オプション
3. **進捗の表示**: リカバリー中の状態をユーザーに伝える
4. **フィードバック収集**: リカバリー失敗時にフィードバックを求める
5. **ログ記録**: リカバリーの成功/失敗を記録して分析
