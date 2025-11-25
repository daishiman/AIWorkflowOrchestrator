# Metadata API ガイド

## 概要

Next.js App RouterのMetadata APIは、型安全なメタデータ管理を提供します。
SEOとソーシャルシェアの最適化に必須の機能です。

## 静的メタデータ

### 基本設定

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'サイトタイトル',
  description: 'サイトの説明文（160文字以内推奨）',
}
```

### 完全な設定例

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // 基本メタデータ
  title: {
    default: 'サイト名',
    template: '%s | サイト名', // 子ページで使用されるテンプレート
  },
  description: 'サイトの説明文',
  keywords: ['キーワード1', 'キーワード2'],
  authors: [{ name: '作者名', url: 'https://example.com' }],
  creator: '作成者',
  publisher: '発行者',

  // アイコン
  icons: {
    icon: '/favicon.ico',
    shortcut: '/shortcut-icon.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },

  // マニフェスト
  manifest: '/manifest.json',

  // Open Graph
  openGraph: {
    title: 'OGタイトル',
    description: 'OG説明文',
    url: 'https://example.com',
    siteName: 'サイト名',
    images: [
      {
        url: 'https://example.com/og.png',
        width: 1200,
        height: 630,
        alt: 'OG画像の説明',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Twitterタイトル',
    description: 'Twitter説明文',
    creator: '@username',
    images: ['https://example.com/twitter.png'],
  },

  // 検索エンジン制御
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // 検証
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },

  // 代替言語
  alternates: {
    canonical: 'https://example.com',
    languages: {
      'en-US': 'https://example.com/en-US',
      'ja-JP': 'https://example.com/ja-JP',
    },
  },

  // カテゴリ
  category: 'technology',
}
```

## 動的メタデータ

### generateMetadata関数

```typescript
// app/posts/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params

  // データを取得
  const post = await getPost(slug)

  // 親のメタデータを取得（オプショナル）
  const previousImages = (await parent).openGraph?.images || []

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.ogImage, ...previousImages],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  return <article>{/* ... */}</article>
}
```

### 動的OGP画像

```typescript
// app/posts/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '投稿のサムネイル'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #1a1a2e, #16213e)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <h1 style={{ color: 'white', fontSize: 60, textAlign: 'center' }}>
          {post.title}
        </h1>
        <p style={{ color: '#8892b0', fontSize: 30 }}>{post.author}</p>
      </div>
    ),
    { ...size }
  )
}
```

## メタデータの継承

### 階層構造

```
app/
├── layout.tsx        # ベースメタデータ（title.template設定）
├── page.tsx          # ホームページメタデータ
└── blog/
    ├── layout.tsx    # ブログセクションのメタデータ
    └── [slug]/
        └── page.tsx  # 個別記事のメタデータ（動的）
```

### titleテンプレート

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'My Site',
    template: '%s | My Site',
  },
}

// app/blog/page.tsx
export const metadata: Metadata = {
  title: 'Blog', // → "Blog | My Site"
}

// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  return {
    title: post.title, // → "Post Title | My Site"
  }
}
```

### absoluteの使用

```typescript
// テンプレートを無視して絶対的なタイトルを設定
export const metadata: Metadata = {
  title: {
    absolute: 'Custom Title', // → "Custom Title"（テンプレートを無視）
  },
}
```

## ファイルベースのメタデータ

### 特殊ファイル

```
app/
├── favicon.ico           # ファビコン
├── icon.png              # アプリアイコン
├── icon.svg              # SVGアイコン
├── apple-icon.png        # Apple Touch Icon
├── opengraph-image.png   # デフォルトOGP画像
├── twitter-image.png     # デフォルトTwitter画像
├── sitemap.ts            # サイトマップ
├── robots.ts             # robots.txt
└── manifest.ts           # Web App Manifest
```

### 動的アイコン

```typescript
// app/icon.tsx
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
        }}
      >
        A
      </div>
    ),
    { ...size }
  )
}
```

## ベストプラクティス

### タイトル最適化

```typescript
// ✅ 良い例
export const metadata: Metadata = {
  title: '記事タイトル - サイト名', // 60文字以内
}

// ❌ 避けるべき例
export const metadata: Metadata = {
  title: 'ホーム', // 具体性がない
  title: 'とても長いタイトルで、検索結果では途中で切れてしまう可能性があるタイトル', // 長すぎる
}
```

### Description最適化

```typescript
// ✅ 良い例
export const metadata: Metadata = {
  description:
    'Next.js App RouterでのSEO最適化の完全ガイド。Metadata API、OGP設定、構造化データの実装方法を解説します。', // 120-160文字
}

// ❌ 避けるべき例
export const metadata: Metadata = {
  description: 'ブログです', // 短すぎる
  description: 'キーワード、キーワード、キーワード...', // キーワードスタッフィング
}
```

### 多言語対応

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/page',
    languages: {
      'en-US': 'https://example.com/en/page',
      'ja-JP': 'https://example.com/ja/page',
      'x-default': 'https://example.com/page',
    },
  },
}
```

## チェックリスト

- [ ] 各ページにユニークなtitleとdescriptionがある
- [ ] title.templateがRoot Layoutで設定されている
- [ ] OGP画像が1200x630pxで設定されている
- [ ] Twitter Cardが設定されている
- [ ] canonicalURLが設定されている
- [ ] 多言語サイトの場合、hreflangが設定されている
- [ ] favicon、apple-touch-iconが設定されている
