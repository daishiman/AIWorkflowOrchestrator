# 画像最適化

## 概要

next/imageは自動的な画像最適化を提供します。
適切なサイズ、フォーマット、遅延読み込みでLCPとCLSを改善します。

## 基本的な使い方

### ローカル画像

```typescript
import Image from 'next/image'
import heroImage from '@/public/hero.jpg'

export function Hero() {
  return (
    <Image
      src={heroImage}
      alt="ヒーロー画像"
      placeholder="blur" // 自動的にblurDataURLが生成
      priority // LCP画像の場合
    />
  )
}
```

### リモート画像

```typescript
import Image from 'next/image'

export function RemoteImage() {
  return (
    <Image
      src="https://example.com/image.jpg"
      alt="リモート画像"
      width={800}
      height={600}
    />
  )
}
```

### next.config.jsの設定

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
    // 画像フォーマット
    formats: ['image/avif', 'image/webp'],
    // デバイスサイズ
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // 画像サイズ
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

## レイアウトパターン

### fill（親要素にフィット）

```typescript
<div className="relative w-full h-64">
  <Image
    src="/image.jpg"
    alt="説明"
    fill
    className="object-cover"
  />
</div>
```

### 固定サイズ

```typescript
<Image
  src="/avatar.jpg"
  alt="アバター"
  width={48}
  height={48}
  className="rounded-full"
/>
```

### レスポンシブ

```typescript
<Image
  src="/hero.jpg"
  alt="ヒーロー"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="w-full h-auto"
/>
```

## sizes属性の最適化

### 基本的なサイズ指定

```typescript
// フルワイドス画像
<Image
  src="/hero.jpg"
  alt="ヒーロー"
  width={1920}
  height={1080}
  sizes="100vw"
/>

// 2カラムレイアウト
<Image
  src="/product.jpg"
  alt="商品"
  width={600}
  height={400}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// 3カラムグリッド
<Image
  src="/card.jpg"
  alt="カード"
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### コンテナベースのサイズ

```typescript
// サイドバーがある場合
<Image
  src="/content.jpg"
  alt="コンテンツ"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, calc(100vw - 300px)"
/>
```

## 優先度とプリロード

### priority属性

```typescript
// LCP（Largest Contentful Paint）に影響する画像
<Image
  src="/hero.jpg"
  alt="ヒーロー"
  width={1200}
  height={600}
  priority // <link rel="preload"> が追加される
/>
```

### priority を使うべきケース

1. Above the Fold（ファーストビュー）の画像
2. LCPの候補となる画像
3. スライダーの最初の画像

```typescript
// スライダーの例
{slides.map((slide, index) => (
  <Image
    key={slide.id}
    src={slide.image}
    alt={slide.alt}
    width={1200}
    height={600}
    priority={index === 0} // 最初の画像のみ priority
  />
))}
```

## Placeholder

### blur（ローカル画像）

```typescript
import heroImage from '@/public/hero.jpg'

<Image
  src={heroImage}
  alt="ヒーロー"
  placeholder="blur" // 自動生成
/>
```

### blurDataURL（リモート画像）

```typescript
// 小さなBase64画像をプレースホルダーとして使用
<Image
  src="https://example.com/image.jpg"
  alt="画像"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
/>
```

### プレースホルダー生成ユーティリティ

```typescript
// lib/placeholder.ts
import { getPlaiceholder } from 'plaiceholder'

export async function getBlurDataURL(src: string) {
  const { base64 } = await getPlaiceholder(src)
  return base64
}

// 使用例
const blurDataURL = await getBlurDataURL('/path/to/image.jpg')
```

### カスタムプレースホルダー

```typescript
// グラデーションプレースホルダー
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect fill="url(#g)" width="${w}" height="${h}" />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

<Image
  src="/image.jpg"
  alt="画像"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
/>
```

## 遅延読み込み

### デフォルトの動作

```typescript
// loading="lazy" がデフォルト
<Image src="/image.jpg" alt="画像" width={800} height={600} />
```

### Eager loading

```typescript
// ファーストビューの画像
<Image
  src="/hero.jpg"
  alt="ヒーロー"
  width={1200}
  height={600}
  loading="eager"
  priority
/>
```

## 画像コンポーネントパターン

### レスポンシブ画像コンポーネント

```typescript
// components/responsive-image.tsx
import Image from 'next/image'

type ResponsiveImageProps = {
  src: string
  alt: string
  aspectRatio?: '16/9' | '4/3' | '1/1'
  priority?: boolean
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = '16/9',
  priority = false,
}: ResponsiveImageProps) {
  const aspectRatioClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
  }

  return (
    <div className={`relative ${aspectRatioClasses[aspectRatio]}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        priority={priority}
      />
    </div>
  )
}
```

### アバターコンポーネント

```typescript
// components/avatar.tsx
import Image from 'next/image'

type AvatarProps = {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 32,
  md: 48,
  lg: 64,
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const dimension = sizes[size]

  if (!src) {
    return (
      <div
        className="rounded-full bg-gray-200 flex items-center justify-center"
        style={{ width: dimension, height: dimension }}
      >
        {name[0].toUpperCase()}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={name}
      width={dimension}
      height={dimension}
      className="rounded-full"
    />
  )
}
```

## 外部画像サービス

### Cloudinary

```javascript
// next.config.js
module.exports = {
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/your-cloud-name/image/upload/',
  },
}
```

### カスタムローダー

```typescript
// lib/image-loader.ts
const imageLoader = ({ src, width, quality }) => {
  return `https://example.com/image?url=${src}&w=${width}&q=${quality || 75}`
}

// 使用
<Image
  loader={imageLoader}
  src="/path/to/image.jpg"
  alt="画像"
  width={800}
  height={600}
/>
```

## チェックリスト

- [ ] LCP画像にはpriorityを設定
- [ ] sizes属性を適切に設定
- [ ] リモート画像のドメインをremotePatternsに追加
- [ ] プレースホルダーを設定してCLSを防止
- [ ] 適切なアスペクト比を維持
- [ ] alt属性を適切に設定
- [ ] 不要に大きな画像を使用していない
