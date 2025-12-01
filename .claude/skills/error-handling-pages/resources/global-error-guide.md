# global-error.tsx ガイド

## 概要

`global-error.tsx`はRoot Layoutを含むアプリケーション全体のエラーを
捕捉する最終的なフォールバックです。error.tsxでは捕捉できない
Root Layoutのエラーもここで処理できます。

## 基本構造

```typescript
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    // global-errorはRoot Layoutを置き換えるため、
    // html と body タグを含める必要がある
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">深刻なエラーが発生しました</h2>
          <p className="text-gray-600 mt-2">
            アプリケーションに問題が発生しました。
          </p>
          <button
            onClick={() => reset()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  )
}
```

## 重要な注意点

### 1. html/bodyタグが必須

```typescript
// ❌ 不完全
export default function GlobalError({ error, reset }) {
  return (
    <div>エラーが発生しました</div>
  )
}

// ✅ 正しい
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div>エラーが発生しました</div>
      </body>
    </html>
  )
}
```

### 2. Client Componentが必須

```typescript
'use client' // 必須

export default function GlobalError({ error, reset }) {
  // ...
}
```

### 3. 本番環境でのみ有効

```
開発環境: Next.jsのエラーオーバーレイが表示される
本番環境: global-error.tsx が表示される
```

## error.tsxとの違い

| 特性 | error.tsx | global-error.tsx |
|------|-----------|-----------------|
| Root Layoutのエラー | ❌ 捕捉不可 | ✅ 捕捉可能 |
| html/bodyタグ | 不要 | 必須 |
| 階層配置 | 任意のルートセグメント | app/のみ |
| Layout継承 | 親Layoutを使用 | 独自のhtml/body |
| 主な用途 | 特定ルートのエラー | 最終フォールバック |

## エラーハンドリングの階層

```
┌─────────────────────────────────────────┐
│           global-error.tsx              │ ← Root Layout含む全エラー
│  ┌───────────────────────────────────┐  │
│  │         app/error.tsx             │  │ ← Root Layout以外のエラー
│  │  ┌─────────────────────────────┐  │  │
│  │  │    app/blog/error.tsx       │  │  │ ← /blog以下のエラー
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Component Error      │  │  │  │ ← 個別コンポーネント
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 実装パターン

### 最小限の実装

```typescript
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>エラーが発生しました</h2>
        <button onClick={() => reset()}>再試行</button>
      </body>
    </html>
  )
}
```

### フル機能実装

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
    // エラーレポーティングサービスに送信
    reportError(error)
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
      </head>
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {/* エラーアイコン */}
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            ⚠️
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            問題が発生しました
          </h1>

          <p style={{ color: '#666', marginBottom: '2rem' }}>
            アプリケーションに予期しないエラーが発生しました。
            <br />
            ご不便をおかけして申し訳ございません。
          </p>

          {/* デバッグ情報（開発時のみ） */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              background: '#fff0f0',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}>
              <strong>{error.name}:</strong> {error.message}
              {error.digest && (
                <div style={{ marginTop: '0.5rem', color: '#666' }}>
                  Digest: {error.digest}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              再試行
            </button>

            <button
              onClick={handleReload}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ページを再読み込み
            </button>

            <button
              onClick={handleHome}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

async function reportError(error: Error & { digest?: string }) {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'global-error',
        name: error.name,
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch {
    // ログ送信の失敗は無視
    console.error('Failed to report error')
  }
}
```

## スタイリングの注意点

### インラインスタイルを使用する理由

```typescript
// global-errorではCSSファイルやTailwindが読み込まれない可能性がある
// そのためインラインスタイルを使用することを推奨

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ /* インラインスタイル */ }}>
        {/* ... */}
      </body>
    </html>
  )
}
```

### 最小限のリセットCSS

```typescript
<html>
  <head>
    <style>
      {`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; }
      `}
    </style>
  </head>
  <body>
    {/* ... */}
  </body>
</html>
```

## テスト方法

### 開発環境でのテスト

```typescript
// app/layout.tsx にエラーを発生させる
export default function RootLayout({ children }) {
  // 本番環境でのみテスト
  if (process.env.TEST_GLOBAL_ERROR === 'true') {
    throw new Error('Test global error')
  }

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### 本番ビルドでのテスト

```bash
pnpm run build
pnpm run start
# 別ターミナルでエラーを発生させるリクエストを送信
```

## チェックリスト

- [ ] 'use client'ディレクティブがある
- [ ] html と body タグを含んでいる
- [ ] reset関数を提供している
- [ ] インラインスタイルまたは最小限のCSSを使用
- [ ] エラーログ送信を設定
- [ ] 複数の復帰オプションを提供
- [ ] 本番環境でテスト済み
