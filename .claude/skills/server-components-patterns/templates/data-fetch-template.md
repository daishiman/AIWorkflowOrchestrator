# データフェッチテンプレート

## 基本データフェッチ関数

```typescript
// lib/data/{{resource}}.ts
import { cache } from 'react'
import { db } from '@/lib/db'

// 単一アイテム取得（重複排除付き）
export const get{{Resource}} = cache(async (id: string) => {
  return db.{{resource}}.findUnique({
    where: { id },
    include: {
      // 必要なリレーション
    },
  })
})

// リスト取得
export const get{{Resources}} = cache(async () => {
  return db.{{resource}}.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
})

// プリロード関数
export const preload{{Resource}} = (id: string) => {
  void get{{Resource}}(id)
}
```

## fetch API を使用したデータ取得

```typescript
// lib/api/{{resource}}.ts
import { cache } from 'react'

const API_URL = process.env.API_URL

export const get{{Resource}} = cache(async (id: string) => {
  const res = await fetch(`${API_URL}/{{resources}}/${id}`, {
    next: {
      revalidate: 3600, // 1時間キャッシュ
      tags: ['{{resources}}', `{{resource}}-${id}`],
    },
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch {{resource}}')
  }

  return res.json()
})

export const get{{Resources}} = cache(async () => {
  const res = await fetch(`${API_URL}/{{resources}}`, {
    next: {
      revalidate: 3600,
      tags: ['{{resources}}'],
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch {{resources}}')
  }

  return res.json()
})
```

## 並列フェッチパターン

```typescript
// app/{{feature}}/page.tsx
import { get{{ResourceA}}, get{{ResourceB}}, get{{ResourceC}} } from '@/lib/data'

export default async function {{PageName}}Page() {
  // 並列でデータ取得
  const [{{resourceA}}, {{resourceB}}, {{resourceC}}] = await Promise.all([
    get{{ResourceA}}(),
    get{{ResourceB}}(),
    get{{ResourceC}}(),
  ])

  return (
    <div>
      <{{SectionA}} data={{{resourceA}}} />
      <{{SectionB}} data={{{resourceB}}} />
      <{{SectionC}} data={{{resourceC}}} />
    </div>
  )
}
```

## Suspense を使用した段階的レンダリング

```typescript
// app/{{feature}}/page.tsx
import { Suspense } from 'react'
import { {{SectionA}}, {{SectionB}} } from './components'
import { {{SectionA}}Skeleton, {{SectionB}}Skeleton } from './skeletons'

export default function {{PageName}}Page() {
  return (
    <div>
      {/* 高優先度コンテンツ */}
      <Suspense fallback={<{{SectionA}}Skeleton />}>
        <{{SectionA}} />
      </Suspense>

      {/* 低優先度コンテンツ */}
      <Suspense fallback={<{{SectionB}}Skeleton />}>
        <{{SectionB}} />
      </Suspense>
    </div>
  )
}

// components/{{section-a}}.tsx
async function {{SectionA}}() {
  const data = await get{{SectionA}}Data()
  return <div>{/* ... */}</div>
}
```

## 動的メタデータ付きページ

```typescript
// app/{{resource}}/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { get{{Resource}}, preload{{Resource}} } from '@/lib/data'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const {{resource}} = await get{{Resource}}(id)

  if (!{{resource}}) {
    return { title: 'Not Found' }
  }

  return {
    title: {{resource}}.title,
    description: {{resource}}.description,
  }
}

export default async function {{Resource}}Page({ params }: Props) {
  const { id } = await params

  // プリロード
  preload{{Resource}}(id)

  const {{resource}} = await get{{Resource}}(id)

  if (!{{resource}}) {
    notFound()
  }

  return (
    <article>
      <h1>{{{resource}}.title}</h1>
      {/* ... */}
    </article>
  )
}
```

## 変数説明

| 変数 | 説明 | 例 |
|------|------|-----|
| `{{resource}}` | リソース名（単数、camelCase） | `user`, `post`, `product` |
| `{{Resource}}` | リソース名（単数、PascalCase） | `User`, `Post`, `Product` |
| `{{resources}}` | リソース名（複数、camelCase） | `users`, `posts`, `products` |
| `{{Resources}}` | リソース名（複数、PascalCase） | `Users`, `Posts`, `Products` |
| `{{feature}}` | 機能名 | `dashboard`, `blog`, `shop` |
| `{{PageName}}` | ページコンポーネント名 | `Dashboard`, `UserProfile` |
| `{{SectionA}}` | セクションコンポーネント名 | `Stats`, `Posts`, `Activity` |
