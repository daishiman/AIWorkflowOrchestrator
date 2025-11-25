# ルーティングパターン詳細

## 基本ルーティング

### フォルダ構造とURL対応

```
app/
├── page.tsx           → /
├── about/
│   └── page.tsx       → /about
├── blog/
│   ├── page.tsx       → /blog
│   └── [slug]/
│       └── page.tsx   → /blog/hello-world
└── shop/
    └── [...slug]/
        └── page.tsx   → /shop/a/b/c
```

### 特殊ファイル優先順位

```
app/dashboard/
├── layout.tsx     # 1. 最初にラップ
├── template.tsx   # 2. layout内でラップ
├── loading.tsx    # 3. Suspense境界
├── error.tsx      # 4. ErrorBoundary
├── not-found.tsx  # 5. 404 UI
└── page.tsx       # 6. 実際のページコンテンツ
```

## 動的ルート

### 単一動的セグメント [slug]

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <article>{/* slug を使用 */}</article>
}

// 静的パス生成（オプション）
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}
```

### Catch-all セグメント [...slug]

```typescript
// app/docs/[...slug]/page.tsx
// /docs/a → { slug: ['a'] }
// /docs/a/b → { slug: ['a', 'b'] }
// /docs/a/b/c → { slug: ['a', 'b', 'c'] }
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  return <div>{slug.join('/')}</div>
}
```

### Optional Catch-all [[...slug]]

```typescript
// app/shop/[[...slug]]/page.tsx
// /shop → { slug: undefined }
// /shop/a → { slug: ['a'] }
// /shop/a/b → { slug: ['a', 'b'] }
```

## Route Groups

### 論理グルーピング（URLに影響しない）

```
app/
├── (marketing)/
│   ├── layout.tsx     # マーケティング用レイアウト
│   ├── page.tsx       → /
│   └── about/
│       └── page.tsx   → /about
├── (shop)/
│   ├── layout.tsx     # ショップ用レイアウト
│   └── products/
│       └── page.tsx   → /products
└── (dashboard)/
    ├── layout.tsx     # ダッシュボード用レイアウト（認証必須）
    └── settings/
        └── page.tsx   → /settings
```

### 認証境界の実装例

```
app/
├── (public)/           # 認証不要
│   ├── layout.tsx
│   ├── page.tsx        → /
│   └── login/
│       └── page.tsx    → /login
└── (protected)/        # 認証必須
    ├── layout.tsx      # AuthGuard を含む
    ├── dashboard/
    │   └── page.tsx    → /dashboard
    └── settings/
        └── page.tsx    → /settings
```

## 並列ルート

### @folder構文

```
app/dashboard/
├── layout.tsx          # 並列ルートを受け取る
├── page.tsx
├── @analytics/
│   └── page.tsx        # 同時にレンダリング
├── @team/
│   └── page.tsx        # 同時にレンダリング
└── @notifications/
    ├── page.tsx
    └── loading.tsx     # 独立したローディング状態
```

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
  notifications,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
  notifications: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-3">
      <div>{children}</div>
      <div>{analytics}</div>
      <div>{team}</div>
      <div>{notifications}</div>
    </div>
  )
}
```

## インターセプティングルート

### (..) 構文

```
app/
├── feed/
│   └── page.tsx            → /feed
├── photo/
│   └── [id]/
│       └── page.tsx        → /photo/123（直接アクセス）
└── @modal/
    └── (.)photo/
        └── [id]/
            └── page.tsx    → モーダルでインターセプト
```

### インターセプト構文一覧

| 構文 | 説明 |
|------|------|
| `(.)` | 同じレベルをマッチ |
| `(..)` | 1つ上のレベルをマッチ |
| `(..)(..)` | 2つ上のレベルをマッチ |
| `(...)` | ルートからマッチ |

## Private フォルダ

### _folder（ルーティングから除外）

```
app/
├── _components/        # ルーティングに含まれない
│   └── Button.tsx
├── _lib/               # ルーティングに含まれない
│   └── utils.ts
└── dashboard/
    └── page.tsx
```

## プロジェクト固有構造例

```
app/
├── api/                        # RESTful API Endpoints
│   ├── webhook/
│   │   └── generic/
│   │       └── route.ts       # POST /api/webhook/generic
│   ├── agent/
│   │   ├── upload/
│   │   │   └── route.ts       # POST /api/agent/upload
│   │   └── poll/
│   │       └── route.ts       # GET /api/agent/poll
│   └── health/
│       └── route.ts           # GET /api/health
├── (public)/
│   ├── layout.tsx
│   └── page.tsx               # ダッシュボード（/）
└── (dashboard)/
    ├── layout.tsx             # 認証必須レイアウト
    └── settings/
        └── page.tsx           # /settings
```
