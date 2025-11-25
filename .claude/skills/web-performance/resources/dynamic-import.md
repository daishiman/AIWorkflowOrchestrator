# 動的インポート

## 概要

動的インポートは、必要な時に必要なコードだけを読み込む技術です。
初期バンドルサイズを削減し、ページの読み込み速度を向上させます。

## next/dynamic

### 基本的な使い方

```typescript
import dynamic from 'next/dynamic'

// 基本的な動的インポート
const DynamicComponent = dynamic(() => import('./HeavyComponent'))

// ローディング状態付き
const DynamicWithLoading = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})

// SSR無効化
const DynamicNoSSR = dynamic(() => import('./ClientOnlyComponent'), {
  ssr: false,
})
```

### Named Exports の動的インポート

```typescript
// Named exportをインポートする場合
const DynamicHello = dynamic(() =>
  import('./components').then((mod) => mod.Hello)
)

// または
const DynamicHello = dynamic(
  () => import('./components').then((mod) => ({ default: mod.Hello }))
)
```

### 複雑なローディングUI

```typescript
const DynamicChart = dynamic(() => import('./Chart'), {
  loading: () => (
    <div className="w-full h-64 animate-pulse bg-gray-200 rounded-lg" />
  ),
  ssr: false,
})
```

## React.lazy（Client Components）

### 基本的な使い方

```typescript
'use client'

import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./LazyComponent'))

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```

### エラーバウンダリとの組み合わせ

```typescript
'use client'

import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const LazyComponent = lazy(() => import('./LazyComponent'))

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>エラーが発生しました: {error.message}</p>
      <button onClick={resetErrorBoundary}>再試行</button>
    </div>
  )
}

export default function Page() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## 使用パターン

### モーダル/ダイアログ

```typescript
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const Modal = dynamic(() => import('./Modal'), {
  loading: () => <div className="fixed inset-0 bg-black/50" />,
})

export function ModalTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>モーダルを開く</button>
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
    </>
  )
}
```

### タブコンテンツ

```typescript
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const TabContent = {
  overview: dynamic(() => import('./tabs/Overview')),
  details: dynamic(() => import('./tabs/Details')),
  reviews: dynamic(() => import('./tabs/Reviews')),
}

export function Tabs() {
  const [activeTab, setActiveTab] = useState<keyof typeof TabContent>('overview')

  const ActiveContent = TabContent[activeTab]

  return (
    <div>
      <div className="flex gap-4">
        {Object.keys(TabContent).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as keyof typeof TabContent)}
            className={activeTab === tab ? 'font-bold' : ''}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <ActiveContent />
      </div>
    </div>
  )
}
```

### 条件付きコンポーネント

```typescript
import dynamic from 'next/dynamic'

// 管理者のみに表示されるダッシュボード
const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  ssr: false,
})

export function Dashboard({ user }) {
  if (!user.isAdmin) {
    return <UserDashboard />
  }

  return <AdminDashboard />
}
```

### 外部ライブラリ

```typescript
import dynamic from 'next/dynamic'

// 重い外部ライブラリを遅延読み込み
const Chart = dynamic(() => import('chart.js').then((mod) => {
  // 必要なコンポーネントのみを登録
  mod.Chart.register(
    mod.CategoryScale,
    mod.LinearScale,
    mod.BarElement
  )
  return import('./ChartComponent')
}), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-gray-200" />,
})

// マップライブラリ
const Map = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-gray-200" />,
})

// リッチテキストエディタ
const Editor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-48 border rounded" />,
})
```

## SSR制御

### SSR無効化が必要なケース

```typescript
// window/document を使用するコンポーネント
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false,
})

// ブラウザ固有のAPI
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false, // Geolocation API使用
})

// Web Storage
const StorageComponent = dynamic(() => import('./StorageComponent'), {
  ssr: false, // localStorage/sessionStorage使用
})

// Canvas/WebGL
const CanvasComponent = dynamic(() => import('./CanvasComponent'), {
  ssr: false,
})
```

### useEffect の代替としての ssr: false

```typescript
// ❌ useEffectで囲む必要がある
function Component() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <ClientOnlyContent />
}

// ✅ dynamic import の方がクリーン
const ClientOnlyContent = dynamic(() => import('./ClientOnlyContent'), {
  ssr: false,
})
```

## パフォーマンス考慮事項

### プリロード

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'))

// マウスオーバー時にプリロード
function Button() {
  const preload = () => {
    import('./HeavyComponent')
  }

  return (
    <button onMouseEnter={preload}>
      Open Heavy Component
    </button>
  )
}
```

### バンドル分析との組み合わせ

```bash
# バンドルサイズの分析
npx @next/bundle-analyzer
```

## アンチパターン

### 過度な分割

```typescript
// ❌ 小さなコンポーネントを分割しても効果薄
const Button = dynamic(() => import('./Button'))
const Icon = dynamic(() => import('./Icon'))

// ✅ 大きなコンポーネントのみ分割
const Dashboard = dynamic(() => import('./Dashboard'))
const DataTable = dynamic(() => import('./DataTable'))
```

### ファーストビューでの動的インポート

```typescript
// ❌ LCPに影響するコンポーネントを遅延読み込み
const Hero = dynamic(() => import('./Hero'))

// ✅ ファーストビューは通常のインポート
import Hero from './Hero'
```

## チェックリスト

- [ ] モーダル、ドロワーなどの条件付きUIは動的インポートを使用
- [ ] 重い外部ライブラリは動的インポートで分割
- [ ] ブラウザ固有のAPIを使用するコンポーネントはssr: falseを設定
- [ ] ファーストビューのコンポーネントは通常のインポートを使用
- [ ] 適切なローディングUIを提供
- [ ] プリロードが有効な場合は実装
