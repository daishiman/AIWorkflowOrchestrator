# エラーフォールバックUIテンプレート

## 基本フォールバック

```typescript
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

/**
 * 基本的なエラーフォールバック
 */
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div role="alert" className="error-fallback">
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      {resetErrorBoundary && (
        <button onClick={resetErrorBoundary}>再試行</button>
      )}
    </div>
  );
}
```

## ページレベルフォールバック

```typescript
interface PageErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export function PageErrorFallback({ error, resetErrorBoundary }: PageErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="page-error-fallback">
      <div className="error-content">
        <div className="error-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1>ページを表示できません</h1>
        <p className="error-message">
          申し訳ございません。予期しないエラーが発生しました。
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>技術的な詳細</summary>
            <pre>{error.message}</pre>
            <pre>{error.stack}</pre>
          </details>
        )}

        <div className="error-actions">
          {resetErrorBoundary && (
            <button onClick={resetErrorBoundary} className="btn-primary">
              再試行
            </button>
          )}
          <button onClick={() => navigate(-1)} className="btn-secondary">
            前のページに戻る
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
```

## セクションフォールバック

```typescript
interface SectionErrorFallbackProps {
  sectionName?: string;
  resetErrorBoundary?: () => void;
}

export function SectionErrorFallback({
  sectionName = 'このセクション',
  resetErrorBoundary,
}: SectionErrorFallbackProps) {
  return (
    <div className="section-error-fallback">
      <div className="error-icon">⚠️</div>
      <p>{sectionName}を読み込めませんでした</p>
      {resetErrorBoundary && (
        <button onClick={resetErrorBoundary} className="btn-small">
          再試行
        </button>
      )}
    </div>
  );
}
```

## カードフォールバック

```typescript
export function CardErrorFallback() {
  return (
    <div className="card card-error">
      <div className="card-error-content">
        <span className="error-icon">!</span>
        <span className="error-text">読み込みエラー</span>
      </div>
    </div>
  );
}
```

## ネットワークエラーフォールバック

```typescript
interface NetworkErrorFallbackProps {
  onRetry?: () => void;
}

export function NetworkErrorFallback({ onRetry }: NetworkErrorFallbackProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="network-error-fallback">
      <div className="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
        </svg>
      </div>

      <h2>接続できません</h2>
      <p>
        {isOnline
          ? 'サーバーに接続できません。しばらくしてから再試行してください。'
          : 'インターネットに接続されていません。接続を確認してください。'}
      </p>

      <div className="connection-status">
        <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
        <span>{isOnline ? 'オンライン' : 'オフライン'}</span>
      </div>

      {onRetry && (
        <button onClick={onRetry} disabled={!isOnline}>
          再試行
        </button>
      )}
    </div>
  );
}
```

## 認証エラーフォールバック

```typescript
export function AuthErrorFallback() {
  const navigate = useNavigate();

  return (
    <div className="auth-error-fallback">
      <div className="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2>セッションが切れました</h2>
      <p>再度ログインしてください。</p>

      <button onClick={() => navigate('/login')} className="btn-primary">
        ログインページへ
      </button>
    </div>
  );
}
```

## フィードバック付きフォールバック

```typescript
interface FeedbackFallbackProps {
  error: Error;
  eventId?: string;
  resetErrorBoundary?: () => void;
}

export function FeedbackFallback({
  error,
  eventId,
  resetErrorBoundary,
}: FeedbackFallbackProps) {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          error: error.message,
          eventId,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-fallback submitted">
        <div className="success-icon">✓</div>
        <h2>フィードバックありがとうございます</h2>
        <p>問題の解決に役立てさせていただきます。</p>
        {resetErrorBoundary && (
          <button onClick={resetErrorBoundary}>続ける</button>
        )}
      </div>
    );
  }

  return (
    <div className="feedback-fallback">
      <h2>問題が発生しました</h2>
      <p>何が起きたか教えていただけますか？</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="どのような操作をしていましたか？"
          rows={4}
        />

        <div className="actions">
          <button type="submit" disabled={isSubmitting || !feedback.trim()}>
            {isSubmitting ? '送信中...' : 'フィードバックを送信'}
          </button>

          {resetErrorBoundary && (
            <button type="button" onClick={resetErrorBoundary}>
              スキップして再試行
            </button>
          )}
        </div>
      </form>

      {process.env.NODE_ENV === 'development' && (
        <details className="error-details">
          <summary>エラー詳細</summary>
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
}
```

## 環境別フォールバック

```typescript
interface EnvAwareFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export function EnvAwareFallback({ error, resetErrorBoundary }: EnvAwareFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return (
      <div className="dev-error-fallback">
        <h2>🚨 開発環境エラー</h2>

        <div className="error-info">
          <h3>エラーメッセージ</h3>
          <pre className="error-message">{error.message}</pre>

          <h3>スタックトレース</h3>
          <pre className="error-stack">{error.stack}</pre>
        </div>

        <div className="actions">
          {resetErrorBoundary && (
            <button onClick={resetErrorBoundary}>再試行</button>
          )}
          <button onClick={() => window.location.reload()}>
            ページをリロード
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prod-error-fallback">
      <h2>問題が発生しました</h2>
      <p>ご不便をおかけして申し訳ございません。</p>

      <div className="actions">
        {resetErrorBoundary && (
          <button onClick={resetErrorBoundary} className="btn-primary">
            再試行
          </button>
        )}
        <a href="/" className="btn-secondary">
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
```

## CSS スタイル

```css
/* 共通スタイル */
.error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 200px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dc3545;
}

.error-fallback h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.error-fallback p {
  color: #666;
  margin-bottom: 1rem;
}

/* ボタン */
.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

/* 詳細 */
.error-details {
  margin-top: 1rem;
  text-align: left;
  width: 100%;
  max-width: 600px;
}

.error-details pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-size: 0.875rem;
}

/* ページエラー */
.page-error-fallback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

/* セクションエラー */
.section-error-fallback {
  padding: 1rem;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* カードエラー */
.card-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 開発環境エラー */
.dev-error-fallback {
  background-color: #fff3cd;
  border: 2px solid #ffc107;
  padding: 2rem;
  margin: 1rem;
  border-radius: 8px;
}

.dev-error-fallback pre {
  background-color: #333;
  color: #fff;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
}
```
