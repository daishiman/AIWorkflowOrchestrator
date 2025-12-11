# レンダリング戦略ガイド

## 戦略一覧

| 戦略              | 生成タイミング         | 更新方法       | 適用ケース             |
| ----------------- | ---------------------- | -------------- | ---------------------- |
| Static Generation | ビルド時               | 再ビルド       | 静的コンテンツ、ブログ |
| ISR               | ビルド時 + 再検証      | revalidate間隔 | 定期更新コンテンツ     |
| Dynamic Rendering | リクエスト時           | 毎回           | ユーザー固有データ     |
| Streaming SSR     | リクエスト時（段階的） | 毎回           | 大量データ             |

## 判断フローチャート

```
このページは...
├─ 完全静的コンテンツ？（全ユーザーに同じ内容）
│  └─ Yes → Static Generation
├─ 定期更新が必要？（1時間毎、1日毎など）
│  └─ Yes → ISR（revalidate設定）
├─ リクエスト毎に変化？
│  └─ Yes → Dynamic Rendering
├─ ユーザー固有データ？（認証、cookies）
│  └─ Yes → Dynamic Rendering
└─ 大量データ？（段階的表示が有効）
   └─ Yes → Streaming SSR + Suspense
```

## Static Generation

### 設定方法

```typescript
// app/about/page.tsx
// デフォルトでStatic Generation（何も設定しない場合）

// 明示的に設定
export const dynamic = "force-static";
export const revalidate = false; // 再検証しない
```

### 動的パラメータの静的生成

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  return <article>{post.content}</article>
}
```

### 適用ケース

- マーケティングページ
- ブログ記事（更新頻度が低い）
- ドキュメンテーション
- 製品カタログ（在庫変動なし）

## ISR (Incremental Static Regeneration)

### 設定方法

```typescript
// 時間ベースの再検証
export const revalidate = 3600; // 1時間毎に再検証

// または fetch 単位で設定
const data = await fetch("https://api.example.com/data", {
  next: { revalidate: 3600 },
});
```

### On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const { path, tag, secret } = await request.json();

  // シークレットチェック
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  // パスベースの再検証
  if (path) {
    revalidatePath(path);
  }

  // タグベースの再検証
  if (tag) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true });
}
```

### 適用ケース

- ブログ（コメント付き）
- ECサイト（在庫は1時間毎に更新）
- ニュースサイト
- CMS駆動コンテンツ

## Dynamic Rendering

### 設定方法

```typescript
// 明示的にDynamic Rendering
export const dynamic = "force-dynamic";

// または動的関数の使用で自動的にDynamicになる
import { cookies, headers } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
  // この時点でDynamic Renderingになる
}
```

### 動的関数

以下を使用すると自動的にDynamic Renderingになる:

- `cookies()`
- `headers()`
- `searchParams` prop
- `unstable_noStore()`

### 適用ケース

- ダッシュボード（ユーザー固有）
- 設定ページ
- 検索結果（searchParams使用）
- 認証が必要なページ

## Streaming SSR

### loading.tsx による自動Suspense

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}

// app/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetchDashboardData() // 時間がかかる
  return <DashboardContent data={data} />
}
```

### 手動Suspense境界

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>ダッシュボード</h1>

      {/* 重要なコンテンツを先に表示 */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      {/* 時間がかかるコンテンツは後から */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <SlowTable />
      </Suspense>
    </div>
  )
}
```

### 適用ケース

- ダッシュボード（複数のデータソース）
- 分析ページ
- レポートページ
- 大量データの一覧表示

## キャッシュ設定まとめ

### Segment Config Options

```typescript
// 各ページ/レイアウトで設定可能
export const dynamic = 'auto' | 'force-dynamic' | 'error' | 'force-static'
export const revalidate = false | 0 | number
export const fetchCache = 'auto' | 'default-cache' | 'only-cache' | 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'
export const runtime = 'nodejs' | 'edge'
export const preferredRegion = 'auto' | 'global' | 'home' | string | string[]
```

### fetch オプション

```typescript
// キャッシュ設定
fetch(url, { cache: "force-cache" }); // デフォルト、キャッシュ使用
fetch(url, { cache: "no-store" }); // キャッシュ無効

// 再検証設定
fetch(url, { next: { revalidate: 3600 } }); // 時間ベース
fetch(url, { next: { tags: ["posts"] } }); // タグベース
```

## パフォーマンス比較

| 戦略      | TTFB         | TTI  | SEO  | サーバー負荷 |
| --------- | ------------ | ---- | ---- | ------------ |
| Static    | 最速         | 最速 | 最良 | 最小         |
| ISR       | 速い         | 速い | 良好 | 低           |
| Dynamic   | 遅い         | 普通 | 良好 | 高           |
| Streaming | 速い（部分） | 普通 | 良好 | 中           |
