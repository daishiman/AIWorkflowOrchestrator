# 画像コンポーネントテンプレート

## レスポンシブ画像コンポーネント

```typescript
// components/responsive-image.tsx
import Image from 'next/image'

type AspectRatio = '16/9' | '4/3' | '1/1' | '3/4' | '9/16'

type ResponsiveImageProps = {
  src: string
  alt: string
  aspectRatio?: AspectRatio
  priority?: boolean
  className?: string
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
  '9/16': 'aspect-[9/16]',
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = '16/9',
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = true,
  width,
  height,
}: ResponsiveImageProps) {
  if (fill) {
    return (
      <div className={`relative ${aspectRatioClasses[aspectRatio]} ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={`w-full h-auto ${className}`}
      priority={priority}
    />
  )
}
```

## アバターコンポーネント

```typescript
// components/avatar.tsx
import Image from 'next/image'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type AvatarProps = {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

const sizeMap: Record<AvatarSize, { dimension: number; fontSize: string }> = {
  xs: { dimension: 24, fontSize: 'text-xs' },
  sm: { dimension: 32, fontSize: 'text-sm' },
  md: { dimension: 40, fontSize: 'text-base' },
  lg: { dimension: 56, fontSize: 'text-lg' },
  xl: { dimension: 80, fontSize: 'text-2xl' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const { dimension, fontSize } = sizeMap[size]

  if (!src) {
    const bgColor = getColorFromName(name)
    return (
      <div
        className={`rounded-full flex items-center justify-center text-white font-medium ${bgColor} ${fontSize} ${className}`}
        style={{ width: dimension, height: dimension }}
      >
        {getInitials(name)}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={name}
      width={dimension}
      height={dimension}
      className={`rounded-full object-cover ${className}`}
    />
  )
}
```

## ヒーロー画像コンポーネント

```typescript
// components/hero-image.tsx
import Image from 'next/image'

type HeroImageProps = {
  src: string
  alt: string
  title?: string
  subtitle?: string
  overlay?: boolean
  overlayOpacity?: number
}

export function HeroImage({
  src,
  alt,
  title,
  subtitle,
  overlay = true,
  overlayOpacity = 0.4,
}: HeroImageProps) {
  return (
    <div className="relative h-[60vh] min-h-[400px] w-full">
      <Image
        src={src}
        alt={alt}
        fill
        priority // ヒーロー画像は常にpriority
        sizes="100vw"
        className="object-cover"
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {(title || subtitle) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          {title && (
            <h1 className="text-4xl md:text-6xl font-bold text-center px-4">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-4 text-xl md:text-2xl text-center px-4 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
```

## カードサムネイルコンポーネント

```typescript
// components/card-thumbnail.tsx
import Image from 'next/image'
import Link from 'next/link'

type CardThumbnailProps = {
  href: string
  src: string
  alt: string
  title: string
  description?: string
  badge?: string
}

export function CardThumbnail({
  href,
  src,
  alt,
  title,
  description,
  badge,
}: CardThumbnailProps) {
  return (
    <Link href={href} className="group block">
      <article className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-video">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
          {badge && (
            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600">
            {title}
          </h3>
          {description && (
            <p className="mt-2 text-gray-600 text-sm line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
```

## 画像ギャラリーコンポーネント

```typescript
// components/image-gallery.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

type GalleryImage = {
  src: string
  alt: string
}

type ImageGalleryProps = {
  images: GalleryImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <div className="space-y-4">
      {/* メイン画像 */}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-contain bg-gray-100"
          priority={selectedIndex === 0}
        />
      </div>

      {/* サムネイル */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition ${
                selectedIndex === index
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 遅延画像（Intersection Observer）

```typescript
// components/lazy-image.tsx
'use client'

import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'

type LazyImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // 200px手前で読み込み開始
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`bg-gray-200 ${className}`}
      style={{ width, height }}
    >
      {isVisible && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      )}
    </div>
  )
}
```

## OGP画像コンポーネント

```typescript
// components/og-image.tsx
import Image from 'next/image'

type OgImageProps = {
  src: string
  alt: string
  title?: string
}

export function OgImage({ src, alt, title }: OgImageProps) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1200/630' }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-cover rounded-lg"
      />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white font-medium text-lg">{title}</p>
        </div>
      )}
    </div>
  )
}
```

## 変数説明

| 変数          | 説明               | 例                               |
| ------------- | ------------------ | -------------------------------- |
| `src`         | 画像ソースURL      | `/images/hero.jpg`               |
| `alt`         | 代替テキスト       | `商品のサムネイル`               |
| `aspectRatio` | アスペクト比       | `16/9`, `4/3`, `1/1`             |
| `sizes`       | レスポンシブサイズ | `(max-width: 768px) 100vw, 50vw` |
| `priority`    | プリロード設定     | `true`, `false`                  |
