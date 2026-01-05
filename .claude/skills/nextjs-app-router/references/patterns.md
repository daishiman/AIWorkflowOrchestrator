# Next.js App Router - 実装パターン

## 概要

Next.js App Routerの実装パターン。
並列ルート、インターセプティングルート、エラーハンドリング、
パフォーマンス最適化を網羅する。

## 並列ルート

### @folder構文

```
app/dashboard/
├── layout.tsx          # 並列ルートを受け取る
├── page.tsx
├── @analytics/
│   ├── page.tsx        # 同時にレンダリング
│   └── loading.tsx     # 独立したローディング状態
├── @team/
│   └── page.tsx
└── @notifications/
    └── page.tsx
```

### Layout実装

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
  notifications,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
  notifications: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <main className="col-span-2">{children}</main>
      <aside>
        {analytics}
        {team}
        {notifications}
      </aside>
    </div>
  );
}
```

### デフォルトスロット

```typescript
// app/dashboard/@analytics/default.tsx
// 対応するルートがない場合に表示
export default function AnalyticsDefault() {
  return <div>Analytics not available</div>;
}
```

## インターセプティングルート

### モーダルパターン

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

### インターセプト構文

| 構文       | 説明                  |
| ---------- | --------------------- |
| `(.)`      | 同じレベルをマッチ    |
| `(..)`     | 1つ上のレベルをマッチ |
| `(..)(..)` | 2つ上のレベルをマッチ |
| `(...)`    | ルートからマッチ      |

### モーダル実装

```typescript
// app/@modal/(.)photo/[id]/page.tsx
import { Modal } from "@/components/modal";

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
    </Modal>
  );
}
```

## エラーハンドリング

### error.tsx

```typescript
// app/dashboard/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>再試行</button>
    </div>
  );
}
```

### not-found.tsx

```typescript
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2>ページが見つかりません</h2>
      <Link href="/">ホームに戻る</Link>
    </div>
  );
}
```

### 明示的なnotFound呼び出し

```typescript
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <article>{post.content}</article>;
}
```

## ローディング状態

### loading.tsx

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div className="animate-pulse">読み込み中...</div>;
}
```

### Suspense境界

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading analytics...</div>}>
        <Analytics />
      </Suspense>
      <Suspense fallback={<div>Loading users...</div>}>
        <Users />
      </Suspense>
    </div>
  );
}
```

## メタデータ

### 静的メタデータ

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard",
  openGraph: {
    title: "Dashboard",
    images: ["/og-image.png"],
  },
};
```

### 動的メタデータ

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.image],
    },
  };
}
```

## パフォーマンス最適化

### Partial Prerendering（PPR）

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: true,
  },
};

// 静的部分と動的部分の分離
export default async function Page() {
  return (
    <div>
      <StaticHeader /> {/* 静的 */}
      <Suspense fallback={<Skeleton />}>
        <DynamicContent /> {/* 動的 */}
      </Suspense>
    </div>
  );
}
```

### ストリーミング

```typescript
export default async function Page() {
  return (
    <main>
      <h1>Dashboard</h1>
      {/* 各セクションが独立してストリーミング */}
      <Suspense fallback={<ChartSkeleton />}>
        <Charts />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>
    </main>
  );
}
```

### prefetch

```typescript
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      {/* デフォルト: ビューポート内でプリフェッチ */}
      <Link href="/dashboard">Dashboard</Link>

      {/* プリフェッチ無効 */}
      <Link href="/settings" prefetch={false}>
        Settings
      </Link>
    </nav>
  );
}
```

## Route Handlers

### 基本パターン

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const posts = await getPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const post = await createPost(body);
  return NextResponse.json(post, { status: 201 });
}
```

### 動的Route Handler

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
```

## Private フォルダ

### \_folder（ルーティングから除外）

```
app/
├── _components/        # ルーティングに含まれない
│   ├── Button.tsx
│   └── Card.tsx
├── _lib/               # ルーティングに含まれない
│   └── utils.ts
└── dashboard/
    └── page.tsx
```

## アンチパターン

| パターン                   | 問題               | 解決策                     |
| -------------------------- | ------------------ | -------------------------- |
| Client Component過多       | バンドルサイズ増大 | Server Component優先       |
| useEffect内データフェッチ  | ウォーターフォール | Server Componentでフェッチ |
| 単一loading.tsx            | 粒度が粗い         | Suspense境界分割           |
| 動的ルート静的生成なし     | TTFB増加           | generateStaticParams使用   |
| layout.tsxでデータフェッチ | 全ページで実行     | 必要なページでのみフェッチ |

## チェックリスト

### 設計時

- [ ] ルーティング構造を定義したか
- [ ] Route Groupsの境界を決定したか
- [ ] Server/Client分離方針を決めたか
- [ ] レンダリング戦略を選択したか

### 実装時

- [ ] Root Layoutを作成したか
- [ ] メタデータを設定したか
- [ ] loading.tsxを配置したか
- [ ] error.tsxを配置したか
- [ ] not-found.tsxを配置したか

### テスト時

- [ ] ナビゲーションが正しく動作するか
- [ ] ローディング状態が表示されるか
- [ ] エラー状態が正しくハンドリングされるか
- [ ] SSG/ISRが期待通り動作するか
