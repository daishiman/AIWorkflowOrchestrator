# error.tsx ガイド

## 概要

`error.tsx`はReact Error Boundaryをラップし、ルートセグメント内の
エラーを捕捉します。エラーを局所化し、アプリの他の部分は正常に
動作し続けることができます。

## 基本構造

```typescript
// app/error.tsx
'use client' // Error componentsはClient Componentでなければならない

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログサービスに送信
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-6">
        申し訳ございません。予期しないエラーが発生しました。
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        再試行
      </button>
    </div>
  )
}
```

## 重要なポイント

### 1. Client Componentが必須

```typescript
'use client' // 必須！Error BoundaryはClient Componentでのみ機能する

export default function Error({ error, reset }) {
  // ...
}
```

### 2. errorオブジェクト

```typescript
type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

// digestはサーバーエラーの安全なハッシュ
// クライアントに詳細を漏らさずにエラーを追跡できる
```

### 3. reset関数

```typescript
// reset()はエラー境界内のコンポーネントを再レンダリングする
<button onClick={() => reset()}>
  再試行
</button>

// または条件付きリセット
const handleReset = () => {
  // 状態をクリアしてからリセット
  clearCache()
  reset()
}
```

## スコープと配置

### 階層構造

```
app/
├── layout.tsx        # error.tsxでは捕捉されない
├── error.tsx         # page.tsx, 子ルートのエラーを捕捉
├── page.tsx
└── dashboard/
    ├── layout.tsx    # 親のerror.tsxで捕捉される
    ├── error.tsx     # このルート以下のエラーを捕捉
    ├── page.tsx
    └── settings/
        └── page.tsx  # 親のerror.tsxで捕捉される
```

### 捕捉されるエラー

| ソース | error.tsx で捕捉 |
|--------|------------------|
| page.tsx 内のエラー | ✅ |
| 子ルートのエラー | ✅ |
| Server Component エラー | ✅ |
| 同階層の layout.tsx | ❌ |
| 親の layout.tsx | ❌ |
| Root Layout | ❌（global-error.tsx必要）|

## エラーの種類別処理

### カスタムエラークラス

```typescript
// lib/errors.ts
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Validation failed') {
    super(message)
    this.name = 'ValidationError'
  }
}
```

### 種類別のUI

```typescript
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

  useEffect(() => {
    // エラーログ送信
    logError(error)
  }, [error])

  // 認証エラー
  if (error.name === 'AuthenticationError') {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-4">ログインが必要です</h2>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ログインページへ
        </button>
      </div>
    )
  }

  // バリデーションエラー
  if (error.name === 'ValidationError') {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-4">入力エラー</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button onClick={() => reset()} className="text-blue-600">
          やり直す
        </button>
      </div>
    )
  }

  // デフォルト
  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-4">
        予期しないエラーが発生しました。
      </p>
      <div className="space-x-4">
        <button onClick={() => reset()} className="text-blue-600">
          再試行
        </button>
        <button onClick={() => router.push('/')} className="text-gray-600">
          ホームに戻る
        </button>
      </div>
    </div>
  )
}
```

## エラーログ統合

### Sentry統合

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Sentryにエラーを送信
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={() => reset()}>再試行</button>
      <button onClick={() => Sentry.showReportDialog()}>
        フィードバックを送る
      </button>
    </div>
  )
}
```

### カスタムログサービス

```typescript
// lib/error-logging.ts
export async function logError(error: Error & { digest?: string }) {
  await fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: error.name,
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }),
  })
}
```

## 開発時のデバッグ

### 開発モードでの詳細表示

```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>

      {isDev && (
        <div className="bg-red-100 p-4 rounded mb-4 text-sm">
          <p className="font-mono">{error.name}: {error.message}</p>
          {error.stack && (
            <pre className="mt-2 overflow-auto max-h-48 text-xs">
              {error.stack}
            </pre>
          )}
          {error.digest && (
            <p className="mt-2 text-gray-600">Digest: {error.digest}</p>
          )}
        </div>
      )}

      <button onClick={() => reset()} className="text-blue-600">
        再試行
      </button>
    </div>
  )
}
```

## ベストプラクティス

### 1. ユーザーフレンドリーなメッセージ

```typescript
// ❌ 技術的すぎる
<p>Error: ECONNREFUSED 127.0.0.1:3000</p>

// ✅ ユーザー向け
<p>サーバーに接続できませんでした。しばらくしてから再度お試しください。</p>
```

### 2. 復帰オプションの提供

```typescript
<div className="space-y-4">
  <button onClick={() => reset()}>再試行</button>
  <button onClick={() => router.back()}>前のページに戻る</button>
  <button onClick={() => router.push('/')}>ホームに戻る</button>
  <a href="mailto:support@example.com">サポートに連絡</a>
</div>
```

### 3. 視覚的なフィードバック

```typescript
<div className="flex flex-col items-center">
  {/* エラーアイコン */}
  <svg className="w-16 h-16 text-red-500 mb-4" /* ... */ />

  {/* メッセージ */}
  <h2 className="text-xl font-bold">問題が発生しました</h2>

  {/* アクション */}
  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
    再試行
  </button>
</div>
```

## チェックリスト

- [ ] 'use client'ディレクティブがある
- [ ] reset関数が提供されている
- [ ] エラーログが設定されている
- [ ] ユーザーフレンドリーなメッセージを表示
- [ ] 復帰オプションを提供
- [ ] 開発モードでのデバッグ情報を表示（オプション）
