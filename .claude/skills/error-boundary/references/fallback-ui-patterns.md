# フォールバックUIパターン

## 概要

エラー発生時のフォールバックUIは、ユーザー体験に大きな影響を与えます。
このドキュメントでは、様々なコンテキストに適したフォールバックUIパターンを解説します。

## 基本パターン

### シンプルエラー表示

```typescript
function SimpleErrorFallback() {
  return (
    <div className="error-container">
      <h2>問題が発生しました</h2>
      <p>ページを更新してもう一度お試しください。</p>
    </div>
  );
}
```

### 再試行ボタン付き

```typescript
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallbackWithRetry({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="error-container">
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>
        もう一度試す
      </button>
    </div>
  );
}
```

### 詳細情報付き（開発用）

```typescript
function DevelopmentErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-container development">
      <h2>🚨 開発エラー</h2>
      <details>
        <summary>エラー詳細</summary>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </details>
    </div>
  );
}
```

## コンテキスト別パターン

### ページレベル

```typescript
function PageErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="page-error">
      <div className="error-icon">⚠️</div>
      <h1>ページを表示できません</h1>
      <p>申し訳ございません。問題が発生しました。</p>

      <div className="error-actions">
        <button onClick={resetErrorBoundary}>
          再読み込み
        </button>
        <a href="/">
          ホームに戻る
        </a>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="error-details">
          <summary>技術的な詳細</summary>
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
}
```

### セクションレベル

```typescript
function SectionErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="section-error">
      <p>このセクションを読み込めませんでした</p>
      <button onClick={resetErrorBoundary} className="retry-button">
        再試行
      </button>
    </div>
  );
}
```

### カード/コンポーネントレベル

```typescript
function CardErrorFallback() {
  return (
    <div className="card card-error">
      <span className="error-icon">!</span>
      <span>読み込みエラー</span>
    </div>
  );
}
```

### ウィジェットレベル

```typescript
function WidgetErrorFallback({ widgetName }: { widgetName: string }) {
  return (
    <div className="widget-error">
      <span>{widgetName}を表示できません</span>
    </div>
  );
}
```

## エラータイプ別パターン

### ネットワークエラー

```typescript
function NetworkErrorFallback({ resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="network-error">
      <div className="error-icon">📡</div>
      <h2>接続できません</h2>
      <p>インターネット接続を確認してください。</p>
      <button onClick={resetErrorBoundary}>
        再接続
      </button>
    </div>
  );
}
```

### 認証エラー

```typescript
function AuthErrorFallback() {
  return (
    <div className="auth-error">
      <div className="error-icon">🔒</div>
      <h2>セッションが切れました</h2>
      <p>再度ログインしてください。</p>
      <a href="/login" className="login-button">
        ログイン
      </a>
    </div>
  );
}
```

### 権限エラー

```typescript
function PermissionErrorFallback() {
  return (
    <div className="permission-error">
      <div className="error-icon">🚫</div>
      <h2>アクセス権限がありません</h2>
      <p>このコンテンツを表示する権限がありません。</p>
      <a href="/">
        ホームに戻る
      </a>
    </div>
  );
}
```

### 404エラー

```typescript
function NotFoundFallback({ resourceType }: { resourceType: string }) {
  return (
    <div className="not-found-error">
      <div className="error-icon">🔍</div>
      <h2>{resourceType}が見つかりません</h2>
      <p>お探しの{resourceType}は存在しないか、削除された可能性があります。</p>
      <a href="/">
        ホームに戻る
      </a>
    </div>
  );
}
```

## インタラクティブパターン

### 折りたたみ可能な詳細

```typescript
function CollapsibleErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="error-container">
      <h2>問題が発生しました</h2>

      <button onClick={resetErrorBoundary}>
        再試行
      </button>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="details-toggle"
      >
        {showDetails ? '詳細を隠す' : '詳細を表示'}
      </button>

      {showDetails && (
        <div className="error-details">
          <p><strong>エラー:</strong> {error.message}</p>
          <pre>{error.stack}</pre>
        </div>
      )}
    </div>
  );
}
```

### フィードバック送信付き

```typescript
function FeedbackErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSendFeedback = async () => {
    await sendErrorFeedback({
      error: error.message,
      feedback,
      timestamp: new Date().toISOString(),
    });
    setFeedbackSent(true);
  };

  return (
    <div className="error-container">
      <h2>問題が発生しました</h2>

      {!feedbackSent ? (
        <>
          <p>何が起きたか教えていただけますか？</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="操作内容を教えてください..."
          />
          <div className="actions">
            <button onClick={handleSendFeedback}>
              フィードバックを送信
            </button>
            <button onClick={resetErrorBoundary}>
              再試行
            </button>
          </div>
        </>
      ) : (
        <>
          <p>フィードバックありがとうございます！</p>
          <button onClick={resetErrorBoundary}>
            続ける
          </button>
        </>
      )}
    </div>
  );
}
```

## スタイリングガイドライン

### 基本CSS

```css
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: #666;
  margin-bottom: 1rem;
}

.error-container button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-container button:hover {
  background-color: #0056b3;
}

.error-details {
  margin-top: 1rem;
  text-align: left;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
}

.error-details pre {
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
}
```

## ベストプラクティス

1. **ユーザーフレンドリー**: 技術的な詳細を隠し、わかりやすいメッセージを
2. **アクション提供**: 再試行やナビゲーションオプションを必ず含める
3. **コンテキスト適切**: エラーの発生場所に合ったサイズとスタイル
4. **ブランド一貫性**: アプリのデザインシステムに合わせる
5. **アクセシビリティ**: スクリーンリーダー対応、キーボード操作可能
