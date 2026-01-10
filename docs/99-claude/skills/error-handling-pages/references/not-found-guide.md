# not-found.tsx ガイド

## 概要

`not-found.tsx`は存在しないルートやリソースにアクセスした際に
表示されるページです。404エラーをカスタマイズし、
ユーザーフレンドリーな体験を提供します。

## 基本構造

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold mt-4">ページが見つかりません</h2>
      <p className="text-gray-600 mt-2">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ホームに戻る
      </Link>
    </div>
  )
}
```

## トリガー方法

### 1. 存在しないルートへのアクセス

```
/this-page-does-not-exist → app/not-found.tsx が表示される
```

### 2. notFound() 関数

```typescript
// app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation'

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound() // 最も近い not-found.tsx を表示
  }

  return <article>{post.content}</article>
}
```

### 3. データフェッチでの使用

```typescript
// lib/data.ts
import { notFound } from "next/navigation";

export async function getPost(slug: string) {
  const post = await db.post.findUnique({ where: { slug } });

  if (!post) {
    notFound();
  }

  return post;
}
```

## スコープと配置

### 階層構造

```
app/
├── not-found.tsx        # グローバル404
├── page.tsx
├── blog/
│   ├── not-found.tsx    # /blog/* 専用404
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx     # notFound()で blog/not-found.tsx を使用
└── products/
    ├── page.tsx
    └── [id]/
        └── page.tsx     # notFound()で app/not-found.tsx を使用
```

### 優先順位

1. 同じディレクトリのnot-found.tsx
2. 親ディレクトリのnot-found.tsx（再帰的に検索）
3. app/not-found.tsx

## ルート別のカスタマイズ

### ブログ用404

```typescript
// app/blog/not-found.tsx
import Link from 'next/link'

export default function BlogNotFound() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <h2 className="text-2xl font-bold">記事が見つかりません</h2>
      <p className="text-gray-600 mt-2">
        この記事は存在しないか、削除された可能性があります。
      </p>
      <div className="mt-8 space-y-4">
        <Link
          href="/blog"
          className="block text-blue-600 hover:underline"
        >
          ブログ一覧を見る
        </Link>
        <Link
          href="/blog/popular"
          className="block text-blue-600 hover:underline"
        >
          人気の記事を見る
        </Link>
      </div>
    </div>
  )
}
```

### 商品用404

```typescript
// app/products/not-found.tsx
import Link from 'next/link'
import { getPopularProducts } from '@/lib/data'

export default async function ProductNotFound() {
  const popularProducts = await getPopularProducts(4)

  return (
    <div className="max-w-4xl mx-auto py-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold">商品が見つかりません</h2>
        <p className="text-gray-600 mt-2">
          この商品は在庫切れか、販売終了している可能性があります。
        </p>
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">人気の商品</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block border rounded p-4 hover:shadow"
            >
              <img src={product.image} alt={product.name} />
              <p className="mt-2 font-medium">{product.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## 動的コンテンツの404

### サーバーコンポーネントでの使用

```typescript
// app/users/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getUser } from '@/lib/data'

export default async function UserPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  return <UserProfile user={user} />
}
```

### メタデータとの組み合わせ

```typescript
// app/posts/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost } from '@/lib/data'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: '記事が見つかりません',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return <article>{/* ... */}</article>
}
```

## デザインパターン

### シンプルな404

```typescript
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <p className="text-xl mt-4">ページが見つかりません</p>
        <Link href="/" className="mt-8 inline-block text-blue-600">
          ホームに戻る →
        </Link>
      </div>
    </div>
  )
}
```

### イラスト付き404

```typescript
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Image
        src="/images/404-illustration.svg"
        alt="ページが見つかりません"
        width={400}
        height={300}
      />
      <h2 className="text-2xl font-bold mt-8">お探しのページが見つかりません</h2>
      <p className="text-gray-600 mt-2 max-w-md text-center">
        URLが間違っているか、ページが移動・削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        ホームに戻る
      </Link>
    </div>
  )
}
```

### 検索機能付き404

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotFound() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold">ページが見つかりません</h1>
      <p className="text-gray-600 mt-4 text-center">
        お探しのページは存在しないか、移動した可能性があります。
      </p>

      <form onSubmit={handleSearch} className="mt-8 w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードで検索..."
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            検索
          </button>
        </div>
      </form>

      <div className="mt-8 flex gap-4">
        <Link href="/" className="text-blue-600 hover:underline">
          ホーム
        </Link>
        <Link href="/sitemap" className="text-blue-600 hover:underline">
          サイトマップ
        </Link>
        <Link href="/contact" className="text-blue-600 hover:underline">
          お問い合わせ
        </Link>
      </div>
    </div>
  )
}
```

## HTTPステータスコード

### デフォルトの動作

```typescript
// not-found.tsxは自動的に404ステータスを返す
export default function NotFound() {
  // Response status: 404
  return <div>Not Found</div>
}
```

### メタデータでの確認

```typescript
// generateMetadataでnotFound()を使用しても404が返される
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Not Found",
    };
  }

  return { title: post.title };
}
```

## チェックリスト

- [ ] app/not-found.tsx が作成されている
- [ ] 動的ルートで notFound() を使用している
- [ ] ユーザーフレンドリーなメッセージを表示
- [ ] ホームへのリンクがある
- [ ] ブランドに合ったデザイン
- [ ] 必要に応じてルート別のnot-found.tsxがある
- [ ] 検索やナビゲーションオプションを提供（オプション）
