# Page コンポーネントテンプレート

## 基本的な Server Component Page

```typescript
// app/[feature]/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{{PageTitle}}',
  description: '{{PageDescription}}',
}

export default async function {{PageName}}Page() {
  // Server Component: データフェッチ可能
  const data = await fetchData()

  return (
    <main>
      <h1>{{PageTitle}}</h1>
      {/* コンテンツ */}
    </main>
  )
}
```

## 動的ルート Page

```typescript
// app/{{resource}}/[{{param}}]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ {{param}}: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { {{param}} } = await params
  const item = await getItem({{param}})

  if (!item) {
    return { title: 'Not Found' }
  }

  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      images: [item.image],
    },
  }
}

export async function generateStaticParams() {
  const items = await getAllItems()
  return items.map((item) => ({
    {{param}}: item.{{param}},
  }))
}

export default async function {{PageName}}Page({ params }: Props) {
  const { {{param}} } = await params
  const item = await getItem({{param}})

  if (!item) {
    notFound()
  }

  return (
    <article>
      <h1>{item.title}</h1>
      {/* コンテンツ */}
    </article>
  )
}
```

## Client Component を含む Page

```typescript
// app/{{feature}}/page.tsx
import { Suspense } from 'react'
import { InteractiveSection } from './interactive-section'
import { DataSkeleton } from './data-skeleton'

export default async function {{PageName}}Page() {
  // Server側でデータ取得
  const initialData = await fetchInitialData()

  return (
    <main>
      <h1>{{PageTitle}}</h1>

      {/* 静的コンテンツ (Server Component) */}
      <section>
        <StaticContent data={initialData} />
      </section>

      {/* インタラクティブ部分 (Client Component) */}
      <Suspense fallback={<DataSkeleton />}>
        <InteractiveSection initialData={initialData} />
      </Suspense>
    </main>
  )
}
```

## ISR 設定付き Page

```typescript
// app/{{feature}}/page.tsx

// ISR: 1時間毎に再検証
export const revalidate = 3600

export default async function {{PageName}}Page() {
  const data = await fetch('{{apiUrl}}', {
    next: { revalidate: 3600 },
  }).then(res => res.json())

  return (
    <main>
      <h1>{{PageTitle}}</h1>
      <p>Last updated: {new Date().toISOString()}</p>
      {/* コンテンツ */}
    </main>
  )
}
```

## Dynamic Rendering Page

```typescript
// app/{{feature}}/page.tsx
import { cookies, headers } from 'next/headers'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function {{PageName}}Page() {
  const cookieStore = await cookies()
  const headersList = await headers()

  const userPreference = cookieStore.get('preference')?.value
  const userAgent = headersList.get('user-agent')

  return (
    <main>
      <h1>{{PageTitle}}</h1>
      {/* ユーザー固有のコンテンツ */}
    </main>
  )
}
```

## searchParams を使用する Page

```typescript
// app/{{feature}}/page.tsx
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function {{PageName}}Page({ searchParams }: Props) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1

  const results = await search(query, page)

  return (
    <main>
      <h1>Search Results for "{query}"</h1>
      <SearchResults results={results} />
      <Pagination currentPage={page} />
    </main>
  )
}
```

## 変数説明

| 変数                  | 説明                                | 例                                   |
| --------------------- | ----------------------------------- | ------------------------------------ |
| `{{PageName}}`        | Page コンポーネント名（PascalCase） | `BlogPost`, `UserProfile`            |
| `{{PageTitle}}`       | ページタイトル                      | `ブログ記事`, `ユーザープロフィール` |
| `{{PageDescription}}` | メタディスクリプション              | `最新のブログ記事一覧`               |
| `{{feature}}`         | 機能名（kebab-case）                | `blog`, `user-profile`               |
| `{{resource}}`        | リソース名（複数形）                | `posts`, `users`                     |
| `{{param}}`           | 動的パラメータ名                    | `slug`, `id`, `username`             |
| `{{apiUrl}}`          | データフェッチURL                   | `https://api.example.com/data`       |
