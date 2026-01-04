# OGP / Twitter Card 設定

## Open Graph Protocol (OGP)

### 基本概念

OGPは、Webページがソーシャルメディアでシェアされる際の表示を制御します。
Facebook、LINE、Slack、Discordなど多くのプラットフォームが対応しています。

### 必須プロパティ

```typescript
export const metadata: Metadata = {
  openGraph: {
    title: "ページタイトル", // og:title
    description: "説明文", // og:description
    url: "https://example.com", // og:url
    type: "website", // og:type
    images: [
      {
        url: "https://example.com/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};
```

### OGタイプ別設定

#### website（デフォルト）

```typescript
openGraph: {
  type: 'website',
  siteName: 'サイト名',
  locale: 'ja_JP',
}
```

#### article（ブログ記事）

```typescript
openGraph: {
  type: 'article',
  publishedTime: '2024-01-15T00:00:00.000Z',
  modifiedTime: '2024-01-20T00:00:00.000Z',
  authors: ['https://example.com/authors/john'],
  tags: ['Next.js', 'SEO', 'React'],
}
```

#### profile（プロフィール）

```typescript
openGraph: {
  type: 'profile',
  firstName: '太郎',
  lastName: '山田',
  username: 'yamada_taro',
}
```

#### book（書籍）

```typescript
openGraph: {
  type: 'book',
  isbn: '978-4-xxx-xxxxx-x',
  authors: ['著者名'],
  releaseDate: '2024-01-01',
}
```

## Twitter Card

### カードタイプ

#### summary_large_image（推奨）

```typescript
twitter: {
  card: 'summary_large_image',
  title: 'タイトル',
  description: '説明文',
  images: ['https://example.com/twitter.png'],
  creator: '@username',
}
```

画像サイズ: 1200x630px（最小 300x157px）

#### summary

```typescript
twitter: {
  card: 'summary',
  title: 'タイトル',
  description: '説明文',
  images: ['https://example.com/twitter-square.png'],
}
```

画像サイズ: 144x144px〜4096x4096px（1:1推奨）

#### player（動画）

```typescript
twitter: {
  card: 'player',
  title: '動画タイトル',
  description: '説明文',
  players: [
    {
      playerUrl: 'https://example.com/player',
      streamUrl: 'https://example.com/video.mp4',
      width: 1280,
      height: 720,
    },
  ],
}
```

#### app（アプリ）

```typescript
twitter: {
  card: 'app',
  app: {
    id: {
      iphone: '123456789',
      ipad: '123456789',
      googleplay: 'com.example.app',
    },
    name: 'アプリ名',
    url: {
      iphone: 'https://example.com/iphone',
      ipad: 'https://example.com/ipad',
      googleplay: 'https://example.com/android',
    },
  },
}
```

## 画像最適化

### 推奨仕様

| プラットフォーム | サイズ     | アスペクト比 | フォーマット  |
| ---------------- | ---------- | ------------ | ------------- |
| OGP              | 1200x630px | 1.91:1       | PNG, JPG      |
| Twitter Large    | 1200x630px | 1.91:1       | PNG, JPG, GIF |
| Twitter Summary  | 144x144px  | 1:1          | PNG, JPG, GIF |
| LINE             | 1200x630px | 1.91:1       | PNG, JPG      |

### 動的OGP画像生成

```typescript
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ブログ記事のサムネイル'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  // カスタムフォントの読み込み（オプション）
  const notoSansJP = await fetch(
    new URL('./NotoSansJP-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: 60,
        }}
      >
        {/* カテゴリバッジ */}
        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: 20,
            color: 'white',
            fontSize: 20,
          }}
        >
          {post.category}
        </div>

        {/* タイトル */}
        <h1
          style={{
            color: 'white',
            fontSize: 56,
            fontWeight: 'bold',
            lineHeight: 1.3,
            maxWidth: '90%',
          }}
        >
          {post.title}
        </h1>

        {/* フッター */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <img
            src={post.author.avatar}
            width={48}
            height={48}
            style={{ borderRadius: '50%' }}
          />
          <span style={{ color: 'white', fontSize: 24 }}>
            {post.author.name}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }}>
            {post.date}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: notoSansJP,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
```

### Twitter画像も同時生成

```typescript
// app/blog/[slug]/twitter-image.tsx
export { default, alt, size, contentType } from "./opengraph-image";
```

## プレビュー・デバッグツール

### Facebook

- [Sharing Debugger](https://developers.facebook.com/tools/debug/)
- キャッシュクリア機能あり

### Twitter

- [Card Validator](https://cards-dev.twitter.com/validator)
- プレビュー確認可能

### LINE

- [LINE Social Plugins](https://developers.line.biz/ja/docs/line-social-plugins/)
- シェア時の表示確認

### 汎用ツール

- [OGP確認ツール](https://ogp.me/)
- [Meta Tags Analyzer](https://metatags.io/)

## 完全な実装例

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  const ogImage = {
    url: `https://example.com/api/og?title=${encodeURIComponent(post.title)}`,
    width: 1200,
    height: 630,
    alt: post.title,
  };

  return {
    title: post.title,
    description: post.excerpt,

    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${slug}`,
      siteName: "My Blog",
      images: [ogImage],
      locale: "ja_JP",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage.url],
      creator: `@${post.author.twitter}`,
    },
  };
}
```

## チェックリスト

### OGP

- [ ] og:title が設定されている
- [ ] og:description が設定されている
- [ ] og:image が1200x630pxで設定されている
- [ ] og:url が正しいURLになっている
- [ ] og:type が適切に設定されている
- [ ] og:site_name が設定されている
- [ ] og:locale が設定されている

### Twitter Card

- [ ] twitter:card が設定されている
- [ ] twitter:title が設定されている
- [ ] twitter:description が設定されている
- [ ] twitter:image が設定されている
- [ ] twitter:creator が設定されている（オプション）

### 画像

- [ ] 画像サイズが推奨仕様を満たしている
- [ ] 画像がHTTPSでアクセス可能
- [ ] 画像の alt テキストが設定されている
- [ ] 動的ページでは動的OGP画像を生成している
