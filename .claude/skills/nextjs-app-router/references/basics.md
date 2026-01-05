# Next.js App Router - 基礎概念

## 概要

Next.js App Routerはディレクトリベースのルーティングシステム。
Server-First設計、React Server Components、ストリーミングを統合した
モダンなWebアプリケーション構築基盤を提供する。

## 核心概念

### ディレクトリ構造とURL対応

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

### 特殊ファイル

| ファイル        | 役割                       | 優先順位 |
| --------------- | -------------------------- | -------- |
| `layout.tsx`    | 共有レイアウト（状態保持） | 1        |
| `template.tsx`  | 再レンダリングテンプレート | 2        |
| `loading.tsx`   | Suspense境界               | 3        |
| `error.tsx`     | ErrorBoundary              | 4        |
| `not-found.tsx` | 404 UI                     | 5        |
| `page.tsx`      | ページコンテンツ           | 6        |

### Server Components vs Client Components

```
┌─────────────────────────────────────────────────────┐
│                    判断フロー                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  インタラクティブ性が必要？                          │
│  （onClick, useState, useEffect）                   │
│      │                                              │
│      ├── YES → Client Component ("use client")      │
│      │                                              │
│      └── NO → ブラウザAPIが必要？                   │
│              （localStorage, window）               │
│                  │                                  │
│                  ├── YES → Client Component         │
│                  │                                  │
│                  └── NO → Server Component（デフォルト）│
│                                                     │
└─────────────────────────────────────────────────────┘
```

## レイアウト

### Root Layout（必須）

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "App description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

### Nested Layout

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <nav>Dashboard Nav</nav>
      <main>{children}</main>
    </div>
  );
}
```

### Layout vs Template

| 特性           | Layout                 | Template                     |
| -------------- | ---------------------- | ---------------------------- |
| 状態保持       | ナビゲーション間で保持 | 毎回リセット                 |
| 再レンダリング | 子のみ                 | 全体                         |
| 用途           | 共通UI                 | アニメーション、状態リセット |

## 動的ルート

### 単一パラメータ [slug]

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return <article>{post.content}</article>;
}

// 静的生成
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

### Catch-all [...slug]

```typescript
// app/docs/[...slug]/page.tsx
// /docs/a → { slug: ['a'] }
// /docs/a/b/c → { slug: ['a', 'b', 'c'] }
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <div>{slug.join("/")}</div>;
}
```

### Optional Catch-all [[...slug]]

```typescript
// app/shop/[[...slug]]/page.tsx
// /shop → { slug: undefined }
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
    ├── layout.tsx     # 認証必須レイアウト
    └── settings/
        └── page.tsx   → /settings
```

### 認証境界の例

```typescript
// app/(protected)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
```

## レンダリング戦略

### 静的レンダリング（デフォルト）

```typescript
// ビルド時に生成
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    cache: "force-cache",
  });
  return <div>{data}</div>;
}
```

### 動的レンダリング

```typescript
// リクエストごとに生成
export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    cache: "no-store",
  });
  return <div>{data}</div>;
}
```

### ISR（Incremental Static Regeneration）

```typescript
export const revalidate = 3600; // 1時間ごとに再検証

export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 },
  });
  return <div>{data}</div>;
}
```

## データフェッチ

### Server Componentでのフェッチ

```typescript
async function getData() {
  const res = await fetch("https://api.example.com/data");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <main>{JSON.stringify(data)}</main>;
}
```

### 並列データフェッチ

```typescript
export default async function Page() {
  // 並列実行
  const [posts, users] = await Promise.all([getPosts(), getUsers()]);

  return (
    <div>
      <PostList posts={posts} />
      <UserList users={users} />
    </div>
  );
}
```

## 判断基準

### スキル適用タイミング

- Next.js App Routerのルーティング構造設計時
- Server/Client Components使い分け判断時
- 動的ルートやRoute Groups実装時
- レンダリング戦略（SSG/ISR/Dynamic）選択時
- Layout階層設計時

### 前提条件

- Next.js 13.4以上（App Router）
- React 18以上
- Node.js 18以上
