# Error Boundary 基礎

## 概要

Error Boundaryは、子コンポーネントツリーで発生したJavaScriptエラーを
キャッチし、クラッシュしたUIの代わりにフォールバックUIを表示する
Reactコンポーネントです。

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

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // エラー発生時に状態を更新
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // エラー情報をログ
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## キャッチできるエラー

### ✅ キャッチされる

```typescript
// 1. レンダリング中のエラー
function BuggyComponent() {
  throw new Error('Render error');  // ✅ キャッチされる
  return <div>Content</div>;
}

// 2. ライフサイクルメソッド内のエラー（クラスコンポーネント）
class BuggyClass extends Component {
  componentDidMount() {
    throw new Error('Lifecycle error');  // ✅ キャッチされる
  }
}

// 3. useEffect内の同期エラー
function BuggyHook() {
  useEffect(() => {
    throw new Error('Effect error');  // ✅ キャッチされる
  }, []);
  return <div>Content</div>;
}

// 4. コンストラクタ内のエラー
class BuggyConstructor extends Component {
  constructor(props) {
    super(props);
    throw new Error('Constructor error');  // ✅ キャッチされる
  }
}
```

### ❌ キャッチされない

```typescript
// 1. イベントハンドラ内のエラー
function BuggyButton() {
  const handleClick = () => {
    throw new Error('Event handler error');  // ❌ キャッチされない
  };
  return <button onClick={handleClick}>Click</button>;
}

// 2. 非同期コード
function BuggyAsync() {
  useEffect(() => {
    setTimeout(() => {
      throw new Error('Timeout error');  // ❌ キャッチされない
    }, 1000);
  }, []);
  return <div>Content</div>;
}

// 3. Promise内のエラー
function BuggyPromise() {
  useEffect(() => {
    Promise.resolve().then(() => {
      throw new Error('Promise error');  // ❌ キャッチされない
    });
  }, []);
  return <div>Content</div>;
}

// 4. サーバーサイドレンダリング
// SSR中のエラーはError Boundaryでキャッチされない

// 5. Error Boundary自身のエラー
class BuggyBoundary extends Component {
  static getDerivedStateFromError() {
    throw new Error('Boundary error');  // ❌ 親のBoundaryが必要
    return { hasError: true };
  }
}
```

## キャッチされないエラーの処理

### イベントハンドラのエラー

```typescript
function SafeButton() {
  const [error, setError] = useState<Error | null>(null);

  const handleClick = () => {
    try {
      riskyOperation();
    } catch (err) {
      setError(err as Error);
      // または、エラー報告サービスに送信
      reportError(err);
    }
  };

  if (error) {
    return <div>エラーが発生しました: {error.message}</div>;
  }

  return <button onClick={handleClick}>Click</button>;
}
```

### 非同期エラー

```typescript
function AsyncComponent() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch('/api/data');
        if (!data.ok) {
          throw new Error('Fetch failed');
        }
        // 処理
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return <div>Content</div>;
}
```

## Error Boundaryの配置戦略

### 多層構造

```typescript
function App() {
  return (
    // レベル1: アプリ全体
    <ErrorBoundary fallback={<AppCrashFallback />}>
      <Router>
        {/* レベル2: ページレベル */}
        <ErrorBoundary fallback={<PageErrorFallback />}>
          <Routes>
            <Route path="/" element={
              {/* レベル3: セクションレベル */}
              <ErrorBoundary fallback={<SectionErrorFallback />}>
                <HomePage />
              </ErrorBoundary>
            } />
          </Routes>
        </ErrorBoundary>
      </Router>
    </ErrorBoundary>
  );
}
```

### 重要度による配置

```
アプリケーション
├── Error Boundary (クリティカル)
│   └── ヘッダー、ナビゲーション
│
├── Error Boundary (重要)
│   └── メインコンテンツ
│
└── Error Boundary (低優先度)
    └── サイドバー、広告
```

## ライフサイクルメソッド

### getDerivedStateFromError

- **タイミング**: エラー発生直後、レンダリング前
- **目的**: フォールバックUIをレンダリングするために状態を更新
- **注意**: 副作用を持たせない（静的メソッド）

```typescript
static getDerivedStateFromError(error: Error): State {
  // 次のレンダリングでフォールバックUIを表示
  return { hasError: true, error };
}
```

### componentDidCatch

- **タイミング**: エラー発生後、コミットフェーズ
- **目的**: エラー情報のログ、エラー報告サービスへの送信
- **注意**: 副作用を実行可能

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // エラーを報告サービスに送信
  logErrorToService(error, errorInfo.componentStack);
}
```

## ベストプラクティス

1. **適切な粒度**: 細かすぎず、大きすぎない配置
2. **意味のあるフォールバック**: エラーの種類に応じたUI
3. **リカバリーオプション**: 再試行やナビゲーションを提供
4. **エラー報告**: 本番環境ではエラーを追跡
5. **開発時の詳細表示**: デバッグしやすい情報を表示
