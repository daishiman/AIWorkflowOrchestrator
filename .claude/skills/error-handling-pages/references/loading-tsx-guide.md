# loading.tsx ガイド

## 概要

`loading.tsx`はReact Suspenseを活用して、ページやセグメントの
読み込み中に表示されるUIを定義します。サーバーコンポーネントの
データフェッチ中にユーザーにフィードバックを提供します。

## 基本構造

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}
```

## 仕組み

### 内部的な動作

```typescript
// loading.tsxは内部的に以下のようにSuspenseでラップされる
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

### ファイル配置

```
app/
├── layout.tsx
├── loading.tsx      # 全ページのローディング
├── page.tsx
└── dashboard/
    ├── loading.tsx  # /dashboard専用ローディング
    ├── page.tsx
    └── settings/
        └── page.tsx # dashboard/loading.tsx を使用
```

## デザインパターン

### スピナー

```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )
}
```

### スケルトン

```typescript
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}
```

### カードスケルトン

```typescript
export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-t-lg" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### テーブルスケルトン

```typescript
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* ヘッダー */}
      <div className="flex border-b p-4 gap-4">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
      {/* 行 */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex border-b p-4 gap-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  )
}
```

## ルート別のローディング

### ダッシュボード

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>

      {/* チャート */}
      <div className="animate-pulse bg-white p-4 rounded-lg shadow">
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
```

### 記事一覧

```typescript
// app/blog/loading.tsx
export default function BlogLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="animate-pulse mb-8">
        <div className="h-10 bg-gray-200 rounded w-48" />
      </div>

      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <article key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </article>
        ))}
      </div>
    </div>
  )
}
```

### 商品詳細

```typescript
// app/products/[id]/loading.tsx
export default function ProductLoading() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 画像 */}
        <div className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="flex gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* 詳細 */}
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>
          <div className="h-12 bg-gray-200 rounded w-full" />
        </div>
      </div>
    </div>
  )
}
```

## Suspenseとの組み合わせ

### 部分的なローディング

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1>ダッシュボード</h1>

      {/* 統計は早く表示 */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      {/* チャートは後から */}
      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>

      {/* 最新アクティビティは最後 */}
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}
```

### スケルトンコンポーネントの分離

```typescript
// components/skeletons/stats-skeleton.tsx
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white p-4 rounded shadow">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  )
}

// components/skeletons/chart-skeleton.tsx
export function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-white p-4 rounded shadow">
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  )
}
```

## 即時ローディング状態

### useTransitionとの違い

```typescript
// loading.tsx: ナビゲーション時に自動で表示
// useTransition: プログラム的なトランジション

'use client'

import { useTransition } from 'react'

export function FilterButton({ category }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(() => {
      // フィルター適用
    })
  }

  return (
    <button disabled={isPending}>
      {isPending ? 'Loading...' : category}
    </button>
  )
}
```

## パフォーマンス考慮事項

### CLSの防止

```typescript
// スケルトンは実際のコンテンツと同じサイズにする
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* 実際のコンテンツと同じ高さを確保 */}
      <div className="h-[200px] bg-gray-200 rounded" />
    </div>
  )
}
```

### アニメーションの最適化

```typescript
// GPU加速を使用
<div className="animate-pulse transform-gpu">
  {/* ... */}
</div>
```

## アクセシビリティ

### スクリーンリーダー対応

```typescript
export default function Loading() {
  return (
    <div
      className="flex items-center justify-center p-8"
      role="status"
      aria-label="読み込み中"
    >
      <div className="animate-spin h-8 w-8 border-b-2 border-blue-600" />
      <span className="sr-only">読み込み中...</span>
    </div>
  )
}
```

### 読み込み完了の通知

```typescript
// aria-liveでコンテンツ更新を通知
<div aria-live="polite">
  {isLoading ? <Loading /> : <Content />}
</div>
```

## チェックリスト

- [ ] loading.tsxが適切な場所に配置されている
- [ ] スケルトンが実際のコンテンツと同じレイアウト
- [ ] アニメーションがスムーズ
- [ ] CLSを引き起こさない
- [ ] アクセシビリティ対応（role、aria-label）
- [ ] 複雑なページはSuspenseで部分的にローディング
