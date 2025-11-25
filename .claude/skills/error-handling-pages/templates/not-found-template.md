# 404ページテンプレート

## シンプルな404

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold mt-4">ページが見つかりません</h2>
      <p className="text-gray-600 mt-2">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        ホームに戻る
      </Link>
    </div>
  )
}
```

## イラスト付き404

```typescript
// app/not-found.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Image
        src="/images/404-illustration.svg"
        alt="ページが見つかりません"
        width={400}
        height={300}
        priority
      />

      <h1 className="text-3xl font-bold mt-8 text-center">
        お探しのページが見つかりません
      </h1>

      <p className="text-gray-600 mt-4 text-center max-w-md">
        URLが間違っているか、ページが移動または削除された可能性があります。
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
        >
          ホームに戻る
        </Link>
        <Link
          href="/contact"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
        >
          お問い合わせ
        </Link>
      </div>
    </div>
  )
}
```

## 検索機能付き404

```typescript
// app/not-found.tsx
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-xl">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-bold mt-4">ページが見つかりません</h2>
        <p className="text-gray-600 mt-2">
          お探しのページは存在しないか、移動した可能性があります。
        </p>

        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="mt-8">
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="キーワードで検索..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              検索
            </button>
          </div>
        </form>

        {/* クイックリンク */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-4">よく見られるページ</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="text-blue-600 hover:underline">
              ホーム
            </Link>
            <Link href="/products" className="text-blue-600 hover:underline">
              商品一覧
            </Link>
            <Link href="/blog" className="text-blue-600 hover:underline">
              ブログ
            </Link>
            <Link href="/about" className="text-blue-600 hover:underline">
              会社概要
            </Link>
            <Link href="/contact" className="text-blue-600 hover:underline">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## ブログ専用404

```typescript
// app/blog/not-found.tsx
import Link from 'next/link'
import { getRecentPosts } from '@/lib/data'

export default async function BlogNotFound() {
  const recentPosts = await getRecentPosts(3)

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold">記事が見つかりません</h1>
        <p className="text-gray-600 mt-2">
          この記事は存在しないか、削除された可能性があります。
        </p>
      </div>

      {/* 最近の記事 */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">最近の記事</h2>
        <div className="grid gap-6">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block p-4 border rounded-lg hover:shadow-md transition"
            >
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="mt-12 flex justify-center gap-4">
        <Link
          href="/blog"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          記事一覧を見る
        </Link>
        <Link
          href="/"
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
```

## 商品専用404

```typescript
// app/products/not-found.tsx
import Link from 'next/link'
import Image from 'next/image'
import { getPopularProducts } from '@/lib/data'

export default async function ProductNotFound() {
  const popularProducts = await getPopularProducts(4)

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold">商品が見つかりません</h1>
        <p className="text-gray-600 mt-2">
          この商品は在庫切れか、販売終了している可能性があります。
        </p>
      </div>

      {/* 人気商品 */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">人気の商品</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {popularProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="mt-2 font-medium group-hover:text-blue-600">
                {product.name}
              </h3>
              <p className="text-gray-600">¥{product.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* カテゴリー */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">カテゴリーから探す</h2>
        <div className="flex flex-wrap gap-3">
          {['新着', 'セール', 'ランキング', 'カテゴリ1', 'カテゴリ2'].map(
            (category) => (
              <Link
                key={category}
                href={`/products?category=${category}`}
                className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                {category}
              </Link>
            )
          )}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="mt-12 flex justify-center gap-4">
        <Link
          href="/products"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          商品一覧を見る
        </Link>
        <Link
          href="/"
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
```

## 多言語対応404

```typescript
// app/[locale]/not-found.tsx
import Link from 'next/link'
import { getDictionary } from '@/lib/dictionaries'

const messages = {
  ja: {
    title: 'ページが見つかりません',
    description: 'お探しのページは存在しないか、移動した可能性があります。',
    home: 'ホームに戻る',
  },
  en: {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist or has been moved.',
    home: 'Go Home',
  },
}

export default function NotFound({
  params,
}: {
  params: { locale: string }
}) {
  const locale = params.locale || 'ja'
  const t = messages[locale as keyof typeof messages] || messages.ja

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold mt-4">{t.title}</h2>
      <p className="text-gray-600 mt-2">{t.description}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {t.home}
      </Link>
    </div>
  )
}
```

## 変数説明

| 変数 | 説明 | 例 |
|------|------|-----|
| `{{locale}}` | 言語コード | `ja`, `en` |
| `recentPosts` | 最近の投稿 | データベースから取得 |
| `popularProducts` | 人気商品 | データベースから取得 |
