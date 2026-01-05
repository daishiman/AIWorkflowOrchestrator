# メタデータテンプレート

## Root Layout メタデータ

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  // 基本設定
  metadataBase: new URL('https://{{domain}}'),
  title: {
    default: '{{site_name}}',
    template: '%s | {{site_name}}',
  },
  description: '{{site_description}}',
  keywords: ['{{keyword1}}', '{{keyword2}}', '{{keyword3}}'],

  // 著者情報
  authors: [{ name: '{{author_name}}', url: 'https://{{author_url}}' }],
  creator: '{{creator}}',
  publisher: '{{publisher}}',

  // アイコン
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://{{domain}}',
    siteName: '{{site_name}}',
    title: '{{site_name}}',
    description: '{{site_description}}',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '{{site_name}}',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: '{{site_name}}',
    description: '{{site_description}}',
    creator: '@{{twitter_handle}}',
    images: ['/twitter-image.png'],
  },

  // 検索エンジン設定
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
    google: '{{google_verification}}',
  },

  // 代替言語（多言語サイトの場合）
  alternates: {
    canonical: 'https://{{domain}}',
    languages: {
      'ja-JP': 'https://{{domain}}/ja',
      'en-US': 'https://{{domain}}/en',
    },
  },

  // カテゴリ
  category: '{{category}}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
```

## 静的ページメタデータ

```typescript
// app/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{{page_title}}',
  description: '{{page_description}}',
  openGraph: {
    title: '{{page_title}}',
    description: '{{page_description}}',
    url: '/about',
  },
}

export default function AboutPage() {
  return <main>{/* コンテンツ */}</main>
}
```

## 動的ページメタデータ

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const {{resource}} = await get{{Resource}}(slug)

  if (!{{resource}}) {
    return { title: 'Not Found' }
  }

  // 親のOGP画像を継承（オプション）
  const previousImages = (await parent).openGraph?.images || []

  return {
    title: {{resource}}.title,
    description: {{resource}}.excerpt,
    authors: [{ name: {{resource}}.author.name }],

    openGraph: {
      title: {{resource}}.title,
      description: {{resource}}.excerpt,
      url: `/blog/${slug}`,
      type: 'article',
      publishedTime: {{resource}}.publishedAt,
      modifiedTime: {{resource}}.updatedAt,
      authors: [{{resource}}.author.name],
      tags: {{resource}}.tags,
      images: [
        {
          url: {{resource}}.ogImage || '/og-default.png',
          width: 1200,
          height: 630,
          alt: {{resource}}.title,
        },
        ...previousImages,
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: {{resource}}.title,
      description: {{resource}}.excerpt,
      images: [{{resource}}.ogImage || '/twitter-default.png'],
    },

    alternates: {
      canonical: `/blog/${slug}`,
    },
  }
}

export default async function {{Resource}}Page({ params }: Props) {
  const { slug } = await params
  const {{resource}} = await get{{Resource}}(slug)

  if (!{{resource}}) {
    notFound()
  }

  return <article>{/* コンテンツ */}</article>
}
```

## 動的OGP画像生成

```typescript
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '{{alt_text}}'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: { slug: string }
}) {
  const {{resource}} = await get{{Resource}}(params.slug)

  if (!{{resource}}) {
    return new ImageResponse(
      <div style={{ background: '#f0f0f0', width: '100%', height: '100%' }}>
        Not Found
      </div>,
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '{{background_gradient}}',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: 60,
          fontFamily: 'sans-serif',
        }}
      >
        {/* カテゴリバッジ */}
        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 20px',
            borderRadius: 24,
            color: 'white',
            fontSize: 18,
          }}
        >
          {{{resource}}.category}
        </div>

        {/* タイトル */}
        <h1
          style={{
            color: 'white',
            fontSize: 52,
            fontWeight: 'bold',
            lineHeight: 1.2,
            maxWidth: '90%',
            margin: 0,
          }}
        >
          {{{resource}}.title}
        </h1>

        {/* フッター */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ color: 'white', fontSize: 20 }}>
            {{{resource}}.author.name}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>
            •
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>
            {new Date({{resource}}.publishedAt).toLocaleDateString('ja-JP')}
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
```

## Twitter画像（OGP画像を再利用）

```typescript
// app/blog/[slug]/twitter-image.tsx
export { default, alt, size, contentType } from "./opengraph-image";
```

## 変数説明

| 変数                      | 説明                     | 例                                                  |
| ------------------------- | ------------------------ | --------------------------------------------------- |
| `{{domain}}`              | サイトドメイン           | `example.com`                                       |
| `{{site_name}}`           | サイト名                 | `My Blog`                                           |
| `{{site_description}}`    | サイト説明               | `技術ブログです`                                    |
| `{{author_name}}`         | 著者名                   | `山田太郎`                                          |
| `{{twitter_handle}}`      | Twitterハンドル          | `yamada_taro`                                       |
| `{{resource}}`            | リソース名（camelCase）  | `post`, `product`                                   |
| `{{Resource}}`            | リソース名（PascalCase） | `Post`, `Product`                                   |
| `{{background_gradient}}` | 背景グラデーション       | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` |
