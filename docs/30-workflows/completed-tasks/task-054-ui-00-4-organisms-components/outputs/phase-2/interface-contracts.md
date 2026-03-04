# Phase 2 型定義仕様（Interface Contracts）

## 1. CardGridProps<T>

```ts
interface CardGridProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  minCardWidth?: number; // default: 280
  gap?: string; // default: var(--spacing-4)
  emptyMessage?: string; // default: "表示するデータがありません"
  emptyIcon?: string; // default: "inbox"
  isLoading?: boolean; // default: false
  skeletonCount?: number; // default: 6
}
```

## 2. MasterDetailLayoutProps

```ts
interface MasterDetailLayoutProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  isDetailOpen: boolean;
  masterWidth?: string; // default: "380px"
  overlayOnMobile?: boolean; // default: true
}
```

## 3. SearchFilterListProps<T>

```ts
interface SearchFilterListProps<T> {
  items: T[];
  filters: Array<{
    id: string;
    label: string;
    icon?: string;
    predicate: (item: T) => boolean;
  }>;
  searchPredicate: (item: T, query: string) => boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
  renderCard?: (item: T, index: number) => React.ReactNode;
  viewMode?: "list" | "grid"; // default: "list"
  searchPlaceholder?: string; // default: "検索..."
  emptyMessage?: string; // default: "該当するデータがありません"
  sortFn?: (a: T, b: T) => number;
}
```

## 4. 互換性・境界

- 依存コンポーネントAPIは変更しない。
- `renderItem` と `renderCard` は片方未指定時にフォールバックを許可する。
- 文字列iconは既存Icon名を想定し、不正値でもクラッシュしない設計とする。
