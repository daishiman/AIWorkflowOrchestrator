# 動的インポートテンプレート

## 基本テンプレート

```typescript
// components/lazy-{{component}}.tsx
import dynamic from 'next/dynamic'

export const {{Component}} = dynamic(
  () => import('./{{component}}'),
  {
    loading: () => <{{Component}}Skeleton />,
    ssr: {{ssr}}, // true | false
  }
)
```

## モーダルコンポーネント

```typescript
// components/modal/lazy-modal.tsx
'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const Modal = dynamic(() => import('./modal'), {
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
    </div>
  ),
})

type LazyModalProps = {
  trigger: React.ReactNode
  title: string
  children: React.ReactNode
}

export function LazyModal({ trigger, title, children }: LazyModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      {isOpen && (
        <Modal
          title={title}
          onClose={() => setIsOpen(false)}
        >
          {children}
        </Modal>
      )}
    </>
  )
}
```

## ドロワーコンポーネント

```typescript
// components/drawer/lazy-drawer.tsx
'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const Drawer = dynamic(() => import('./drawer'), {
  loading: () => (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-lg animate-pulse">
      <div className="p-4">
        <div className="h-6 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  ),
})

type LazyDrawerProps = {
  trigger: React.ReactNode
  title: string
  children: React.ReactNode
}

export function LazyDrawer({ trigger, title, children }: LazyDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>{trigger}</button>
      {isOpen && (
        <Drawer
          title={title}
          onClose={() => setIsOpen(false)}
        >
          {children}
        </Drawer>
      )}
    </>
  )
}
```

## タブコンテンツ

```typescript
// components/tabs/lazy-tabs.tsx
'use client'

import dynamic from 'next/dynamic'
import { useState, type ComponentType } from 'react'

type TabConfig<T extends string> = {
  [K in T]: {
    label: string
    component: ComponentType<any>
  }
}

// タブコンテンツを動的インポート
const tabContents = {
  overview: {
    label: 'Overview',
    component: dynamic(() => import('./tabs/overview'), {
      loading: () => <TabSkeleton />,
    }),
  },
  details: {
    label: 'Details',
    component: dynamic(() => import('./tabs/details'), {
      loading: () => <TabSkeleton />,
    }),
  },
  reviews: {
    label: 'Reviews',
    component: dynamic(() => import('./tabs/reviews'), {
      loading: () => <TabSkeleton />,
    }),
  },
} satisfies TabConfig<'overview' | 'details' | 'reviews'>

function TabSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  )
}

export function LazyTabs() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabContents>('overview')

  const ActiveContent = tabContents[activeTab].component

  return (
    <div>
      <div className="flex border-b">
        {Object.entries(tabContents).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as keyof typeof tabContents)}
            className={`px-4 py-2 ${
              activeTab === key
                ? 'border-b-2 border-blue-500 font-medium'
                : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-4">
        <ActiveContent />
      </div>
    </div>
  )
}
```

## 外部ライブラリ

```typescript
// components/chart/lazy-chart.tsx
import dynamic from 'next/dynamic'

export const LazyChart = dynamic(
  () => import('./chart-component'),
  {
    ssr: false, // チャートライブラリはSSRで問題が発生することが多い
    loading: () => (
      <div className="h-64 w-full animate-pulse bg-gray-200 rounded-lg" />
    ),
  }
)

// components/chart/chart-component.tsx
'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

type ChartProps = {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
    }[]
  }
}

export default function ChartComponent({ data }: ChartProps) {
  return <Bar data={data} options={{ responsive: true }} />
}
```

## リッチテキストエディタ

```typescript
// components/editor/lazy-editor.tsx
import dynamic from 'next/dynamic'

export const LazyEditor = dynamic(
  () => import('./rich-text-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-full border rounded-lg animate-pulse bg-gray-100" />
    ),
  }
)

// components/editor/rich-text-editor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

type EditorProps = {
  content: string
  onChange: (content: string) => void
}

export default function RichTextEditor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border rounded-lg">
      <EditorContent editor={editor} />
    </div>
  )
}
```

## マップコンポーネント

```typescript
// components/map/lazy-map.tsx
import dynamic from 'next/dynamic'

export const LazyMap = dynamic(
  () => import('./map-component'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
)

// components/map/map-component.tsx
'use client'

import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type MapProps = {
  latitude: number
  longitude: number
  zoom?: number
}

export default function MapComponent({
  latitude,
  longitude,
  zoom = 14,
}: MapProps) {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        latitude,
        longitude,
        zoom,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      <Marker latitude={latitude} longitude={longitude} />
    </Map>
  )
}
```

## プリロード付きコンポーネント

```typescript
// components/preloadable/lazy-preloadable.tsx
'use client'

import dynamic from 'next/dynamic'
import { useCallback } from 'react'

const HeavyComponent = dynamic(() => import('./heavy-component'))

// プリロード関数をエクスポート
export const preloadHeavyComponent = () => {
  void import('./heavy-component')
}

type LazyPreloadableProps = {
  children: React.ReactNode
  onActivate: () => void
}

export function LazyPreloadable({ children, onActivate }: LazyPreloadableProps) {
  const handleMouseEnter = useCallback(() => {
    preloadHeavyComponent()
  }, [])

  return (
    <div onMouseEnter={handleMouseEnter}>
      <button onClick={onActivate}>{children}</button>
    </div>
  )
}
```

## 変数説明

| 変数 | 説明 | 例 |
|------|------|-----|
| `{{component}}` | コンポーネントファイル名 | `modal`, `drawer`, `chart` |
| `{{Component}}` | コンポーネント名（PascalCase） | `Modal`, `Drawer`, `Chart` |
| `{{ssr}}` | SSR設定 | `true`, `false` |
