# Suspense/Streaming ガイド

## Streaming SSR の仕組み

```
1. サーバーがHTMLの生成を開始
2. 準備できた部分から順次クライアントに送信
3. クライアントは受信したHTMLを即座に表示
4. 非同期部分は後からストリーミングで到着

[Header: 即座に表示] → [Main: 即座に表示] → [Posts: 後からストリーミング]
```

## loading.tsx による自動Suspense

### 基本的な使い方

```
app/dashboard/
├── loading.tsx   # 自動的にSuspense境界を作成
├── page.tsx      # 非同期コンポーネント
└── layout.tsx
```

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}

// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchDashboardData() // 時間がかかる処理
  return <Dashboard data={data} />
}
```

### loading.tsxの特徴

- 自動的にSuspense境界を作成
- page.tsxと同じディレクトリに配置
- ナビゲーション中も表示される（インスタントナビゲーション）

## 手動Suspense境界

### 基本パターン

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      {/* 即座にレンダリング */}
      <Header />

      {/* 非同期コンポーネントをSuspenseでラップ */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>

      {/* 即座にレンダリング */}
      <Footer />
    </div>
  )
}
```

### 複数のSuspense境界

```typescript
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 各セクションが独立してストリーミング */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>

      <Suspense fallback={<RecentActivitySkeleton />}>
        <RecentActivity />
      </Suspense>

      <Suspense fallback={<NotificationsSkeleton />}>
        <Notifications />
      </Suspense>
    </div>
  )
}
```

### ネストされたSuspense

```typescript
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Header />
      <main>
        {/* 外側のSuspenseが解決された後、内側が表示 */}
        <Suspense fallback={<ContentSkeleton />}>
          <Content />
        </Suspense>
      </main>
    </Suspense>
  )
}
```

## Skeleton UI 設計

### 効果的なスケルトンの原則

1. **構造を反映**: 実際のコンテンツのレイアウトを模倣
2. **アニメーション**: パルスまたはシマーでロード中を明示
3. **サイズ一致**: CLSを防ぐため実際のサイズに近づける

### Skeleton コンポーネント例

```typescript
// components/skeletons/post-skeleton.tsx
export function PostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-lg mb-4" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  )
}

export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}
```

### Tailwind CSSスケルトン

```typescript
// シマーエフェクト
function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`
        relative overflow-hidden bg-gray-200 rounded
        before:absolute before:inset-0
        before:-translate-x-full
        before:animate-[shimmer_1.5s_infinite]
        before:bg-gradient-to-r
        before:from-transparent before:via-white/60 before:to-transparent
        ${className}
      `}
    />
  )
}
```

## Streaming の最適化

### 優先度ベースのストリーミング

```typescript
export default function ProductPage({ productId }: { productId: string }) {
  return (
    <div>
      {/* 高優先度: 商品情報は即座に必要 */}
      <Suspense fallback={<ProductInfoSkeleton />}>
        <ProductInfo id={productId} />
      </Suspense>

      {/* 中優先度: レビューは少し待てる */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={productId} />
      </Suspense>

      {/* 低優先度: 関連商品は最後でOK */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts productId={productId} />
      </Suspense>
    </div>
  )
}
```

### 条件付きSuspense

```typescript
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const params = await searchParams

  return (
    <div>
      <Header />

      {/* 条件に応じてSuspenseを切り替え */}
      {params.view === 'detailed' ? (
        <Suspense fallback={<DetailedViewSkeleton />}>
          <DetailedView />
        </Suspense>
      ) : (
        <Suspense fallback={<SimpleViewSkeleton />}>
          <SimpleView />
        </Suspense>
      )}
    </div>
  )
}
```

## エラーハンドリングとの統合

### error.tsx と loading.tsx の組み合わせ

```
app/dashboard/
├── layout.tsx
├── loading.tsx    # ローディング状態
├── error.tsx      # エラー状態
├── not-found.tsx  # 404状態
└── page.tsx
```

### Suspenseとエラー境界の順序

```typescript
// Suspenseはエラー境界の内側に配置
export default function Page() {
  return (
    <ErrorBoundary fallback={<ErrorUI />}>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## パフォーマンス考慮事項

### Suspense境界の粒度

```typescript
// ❌ 避けるべき: 粒度が粗すぎる
<Suspense fallback={<PageSkeleton />}>
  <EntirePage /> {/* 全体が遅い */}
</Suspense>

// ✅ 推奨: 適切な粒度
<>
  <Header /> {/* 即座に表示 */}
  <Suspense fallback={<MainSkeleton />}>
    <Main /> {/* ストリーミング */}
  </Suspense>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar /> {/* 独立してストリーミング */}
  </Suspense>
</>
```

### 並列Suspense vs 逐次Suspense

```typescript
// 並列: 独立して解決
<div className="flex">
  <Suspense fallback={<A_Skeleton />}>
    <ComponentA /> {/* 先に解決されれば先に表示 */}
  </Suspense>
  <Suspense fallback={<B_Skeleton />}>
    <ComponentB /> {/* 独立して解決 */}
  </Suspense>
</div>

// 逐次: 順番に解決
<Suspense fallback={<A_Skeleton />}>
  <ComponentA />
  <Suspense fallback={<B_Skeleton />}>
    <ComponentB /> {/* Aの後に表示 */}
  </Suspense>
</Suspense>
```

## チェックリスト

### Suspense設計時

- [ ] 重要なコンテンツは早くストリーミングされるか
- [ ] Suspense境界の粒度は適切か
- [ ] スケルトンUIが実際のコンテンツ構造を反映しているか
- [ ] CLSが発生しないサイズになっているか

### パフォーマンス

- [ ] 不要なSuspense境界がないか
- [ ] 並列化できるものは並列になっているか
- [ ] loading.tsxが適切に配置されているか
- [ ] エラー境界との統合が適切か
