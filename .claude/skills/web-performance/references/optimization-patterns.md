# 最適化パターン

## 概要

Next.jsアプリケーションにおけるパフォーマンス最適化の実践パターン集。
各パターンはCore Web Vitalsの改善に直結する。

## 画像最適化パターン

### LCP画像の優先読み込み

```typescript
import Image from 'next/image'
import heroImage from '@/public/hero.jpg'

export function Hero() {
  return (
    <Image
      src={heroImage}
      alt="Hero"
      priority  // LCP画像は必ず指定
      placeholder="blur"
      sizes="100vw"
    />
  )
}
```

### レスポンシブ画像

```typescript
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

## コード分割パターン

### 動的インポート（基本）

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
})
```

### 条件付き読み込み

```typescript
const Modal = dynamic(() => import('./Modal'), {
  ssr: false,
})

export function Page() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
    </>
  )
}
```

### ライブラリの部分インポート

```typescript
// ❌ 避ける
import _ from "lodash";

// ✅ 推奨
import debounce from "lodash/debounce";
```

## フォント最適化パターン

### Google Fonts

```typescript
import { Inter, Noto_Sans_JP } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
  preload: true,
});
```

### ローカルフォント

```typescript
import localFont from "next/font/local";

const customFont = localFont({
  src: [
    { path: "./fonts/Custom-Regular.woff2", weight: "400" },
    { path: "./fonts/Custom-Bold.woff2", weight: "700" },
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
```

## CLS防止パターン

### アスペクト比予約

```css
.image-container {
  aspect-ratio: 16 / 9;
  position: relative;
}

.skeleton {
  aspect-ratio: 16 / 9;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### スケルトンUI

```typescript
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-lg" />
      <div className="space-y-2 mt-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}
```

## Server Components活用

### クライアントバンドル削減

```typescript
// Server Component (default)
async function ProductList() {
  const products = await fetchProducts()

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// Client Component (必要な部分のみ)
'use client'
function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => addToCart(productId))}
      disabled={isPending}
    >
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
```

## キャッシュ戦略

### ISR (Incremental Static Regeneration)

```typescript
// app/products/[id]/page.tsx
export const revalidate = 3600 // 1時間ごとに再検証

async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  return <ProductDetail product={product} />
}
```

### CDNキャッシュヘッダー

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```
