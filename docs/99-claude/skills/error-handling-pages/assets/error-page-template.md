# エラーページテンプレート

## 基本エラーページ

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーログを送信
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          エラーが発生しました
        </h2>
        <p className="mt-2 text-gray-600">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          再試行
        </button>
      </div>
    </div>
  )
}
```

## フル機能エラーページ

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // 本番環境ではエラーログを送信
    if (!isDev) {
      logError(error)
    }
  }, [error, isDev])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        {/* アイコン */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* メッセージ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          問題が発生しました
        </h2>
        <p className="text-gray-600 mb-6">
          予期しないエラーが発生しました。
          お手数ですが、再度お試しください。
        </p>

        {/* 開発時のみエラー詳細 */}
        {isDev && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800">
              {error.name}: {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* アクション */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            再試行
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            前のページに戻る
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ホームに戻る
          </button>
        </div>

        {/* サポート */}
        <p className="mt-8 text-sm text-gray-500">
          問題が解決しない場合は
          <a href="/contact" className="text-blue-600 hover:underline">
            お問い合わせ
          </a>
          ください。
        </p>
      </div>
    </div>
  )
}

async function logError(error: Error & { digest?: string }) {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: error.name,
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch {
    console.error('Failed to log error')
  }
}
```

## グローバルエラーページ

```typescript
// app/global-error.tsx
'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // クリティカルエラーをログ
    reportCriticalError(error)
  }, [error])

  const handleReload = () => {
    window.location.reload()
  }

  const handleHome = () => {
    window.location.href = '/'
  }

  return (
    <html lang="ja">
      <head>
        <title>エラーが発生しました</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9fafb;
            padding: 1rem;
          }
          .container { text-align: center; max-width: 24rem; }
          .icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1.5rem;
            color: #dc2626;
          }
          h1 { font-size: 1.5rem; color: #111827; margin-bottom: 0.5rem; }
          p { color: #6b7280; margin-bottom: 1.5rem; }
          .buttons { display: flex; flex-direction: column; gap: 0.75rem; }
          button {
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.15s;
          }
          .primary {
            background: #2563eb;
            color: white;
            border: none;
          }
          .primary:hover { background: #1d4ed8; }
          .secondary {
            background: white;
            color: #374151;
            border: 1px solid #d1d5db;
          }
          .secondary:hover { background: #f9fafb; }
          @media (min-width: 640px) {
            .buttons { flex-direction: row; justify-content: center; }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <svg
            className="icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1>深刻なエラーが発生しました</h1>
          <p>
            アプリケーションに問題が発生しました。
            ご不便をおかけして申し訳ございません。
          </p>
          <div className="buttons">
            <button className="primary" onClick={() => reset()}>
              再試行
            </button>
            <button className="secondary" onClick={handleReload}>
              ページを再読み込み
            </button>
            <button className="secondary" onClick={handleHome}>
              ホームに戻る
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

async function reportCriticalError(error: Error & { digest?: string }) {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'critical',
        name: error.name,
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch {
    // ログ失敗は無視
  }
}
```

## エラータイプ別テンプレート

```typescript
// app/{{route}}/error.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// カスタムエラータイプ
type ErrorType = 'authentication' | 'authorization' | 'validation' | 'network' | 'unknown'

function getErrorType(error: Error): ErrorType {
  if (error.name === 'AuthenticationError') return 'authentication'
  if (error.name === 'AuthorizationError') return 'authorization'
  if (error.name === 'ValidationError') return 'validation'
  if (error.name === 'NetworkError' || error.message.includes('fetch')) return 'network'
  return 'unknown'
}

const errorConfig: Record<ErrorType, { title: string; message: string; action?: string }> = {
  authentication: {
    title: 'ログインが必要です',
    message: 'この機能を利用するにはログインが必要です。',
    action: 'login',
  },
  authorization: {
    title: 'アクセス権限がありません',
    message: 'このページにアクセスする権限がありません。',
  },
  validation: {
    title: '入力エラー',
    message: '入力内容に問題があります。確認して再度お試しください。',
  },
  network: {
    title: '接続エラー',
    message: 'サーバーに接続できませんでした。インターネット接続を確認してください。',
  },
  unknown: {
    title: 'エラーが発生しました',
    message: '予期しないエラーが発生しました。',
  },
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const errorType = getErrorType(error)
  const config = errorConfig[errorType]

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold mb-2">{config.title}</h2>
        <p className="text-gray-600 mb-6">{config.message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {config.action === 'login' ? (
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              ログイン
            </button>
          ) : (
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              再試行
            </button>
          )}
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 変数説明

| 変数            | 説明                     | 例                             |
| --------------- | ------------------------ | ------------------------------ |
| `{{route}}`     | ルートパス               | `dashboard`, `blog`            |
| `error.name`    | エラー名                 | `Error`, `AuthenticationError` |
| `error.message` | エラーメッセージ         | `Failed to fetch`              |
| `error.digest`  | サーバーエラーのハッシュ | `abc123`                       |
