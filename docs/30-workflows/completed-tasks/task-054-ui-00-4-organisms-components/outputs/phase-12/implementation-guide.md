# Phase 12 実装ガイド

- 対象: TASK-UI-00-ORGANISMS
- 構成: Part 1（初学者向け）/ Part 2（開発者向け）

## Part 1: 初学者向け（中学生レベル）

### 1. なぜこの仕組みが必要か

アプリの画面は「小さな部品」を組み合わせて作ります。
今回の Organisms は、

- カードを並べる
- 左右で一覧と詳細を見せる
- 検索としぼりこみをまとめる
  という「よく使うまとまり」を先に用意する仕事です。

これを先に作っておくと、新しい画面を作るときに毎回ゼロから作らなくてよくなります。

### 2. たとえ話

学校の文化祭で「展示コーナー」を作るとします。

- `CardGrid` は、作品を机にきれいに並べる係。
- `MasterDetailLayout` は、左に目次、右に説明パネルを置く係。
- `SearchFilterList` は、作品を探しやすくする受付係。

この3つを先に作っておけば、別の教室でも同じやり方をすぐ使えます。

### 3. 何をしたか

1. 3つのまとまり部品を実装した。
2. それぞれの動きをテストで確認した（合計 41 テスト）。
3. 実際の見た目を6枚のスクリーンショットで確認した。

### 4. どこを見ればよいか

- 実装: `apps/desktop/src/renderer/components/organisms/`
- 手動検証: `outputs/phase-11/`

---

## Part 2: 開発者向け（技術詳細）

### 1. 型定義（TypeScript）

```ts
export interface CardGridProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  minCardWidth?: number;
  gap?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  isLoading?: boolean;
  skeletonCount?: number;
}

export interface MasterDetailLayoutProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  isDetailOpen: boolean;
  masterWidth?: string;
  overlayOnMobile?: boolean;
}

export interface SearchFilterDefinition<T> {
  id: string;
  label: string;
  icon?: string;
  predicate: (item: T) => boolean;
}

export interface SearchFilterListProps<T> {
  items: T[];
  filters: SearchFilterDefinition<T>[];
  searchPredicate: (item: T, query: string) => boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
  renderCard?: (item: T, index: number) => React.ReactNode;
  viewMode?: "list" | "grid";
  searchPlaceholder?: string;
  emptyMessage?: string;
  sortFn?: (a: T, b: T) => number;
}
```

### 2. APIシグネチャと使用例

```tsx
<CardGrid<Item>
  items={items}
  renderCard={(item) => <ItemCard item={item} />}
  isLoading={isLoading}
/>

<MasterDetailLayout
  master={<MasterList />}
  detail={<DetailPanel />}
  isDetailOpen={isDetailOpen}
/>

<SearchFilterList<Item>
  items={items}
  filters={filters}
  searchPredicate={(item, q) => item.name.includes(q)}
  viewMode="grid"
  renderCard={(item) => <ItemCard item={item} />}
/>
```

### 3. エラーハンドリング / エッジケース

| 観点           | 実装方針                                          |
| -------------- | ------------------------------------------------- |
| 空データ       | `EmptyState` を表示し、ユーザーに次の行動を示す   |
| 読み込み中     | `SkeletonCard` を表示し、レイアウトジャンプを防止 |
| キーボード操作 | Arrow移動時に index を境界内へ clamp              |
| レスポンシブ   | `matchMedia` 監視で mobile/tablet/desktop を切替  |
| SSR互換        | `window` 未定義時は安全なデフォルトを返す         |

### 4. 設定値 / 定数

| 定数・既定値    | 値                                           | 役割                      |
| --------------- | -------------------------------------------- | ------------------------- |
| `MOBILE_QUERY`  | `(max-width: 767px)`                         | CardGrid モバイル判定     |
| `DESKTOP_QUERY` | `(min-width: 1024px)`                        | MasterDetail desktop 判定 |
| `TABLET_QUERY`  | `(min-width: 768px) and (max-width: 1023px)` | MasterDetail tablet 判定  |
| `minCardWidth`  | `280`                                        | CardGrid 最小カード幅     |
| `skeletonCount` | `6`                                          | loading時の骨組み数       |
| `viewMode`      | `list`                                       | SearchFilterList 既定表示 |

### 5. 検証コマンド

```bash
cd apps/desktop
pnpm typecheck
pnpm exec eslint src/renderer/components/organisms/CardGrid src/renderer/components/organisms/MasterDetailLayout src/renderer/components/organisms/SearchFilterList src/renderer/views/OrganismsShowcaseView src/renderer/App.tsx
pnpm exec vitest run src/renderer/components/organisms/CardGrid/CardGrid.test.tsx src/renderer/components/organisms/MasterDetailLayout/MasterDetailLayout.test.tsx src/renderer/components/organisms/SearchFilterList/SearchFilterList.test.tsx
pnpm run screenshot:organisms
```
