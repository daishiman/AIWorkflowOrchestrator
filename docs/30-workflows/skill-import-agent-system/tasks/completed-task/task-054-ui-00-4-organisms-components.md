# TASK-UI-00-ORGANISMS: Organisms共通コンポーネント実装（CardGrid・MasterDetailLayout・SearchFilterList）

## 1. メタ情報

| 項目         | 値                                                                                |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-00-ORGANISMS                                                              |
| タスク名     | Organisms共通コンポーネント実装（CardGrid・MasterDetailLayout・SearchFilterList） |
| 優先度       | 高（画面仕様02〜09の前提条件）                                                    |
| 複雑度       | high                                                                              |
| 依存タスク   | TASK-UI-00-ATOMS, TASK-UI-00-MOLECULES                                            |
| ブロック対象 | 02〜09の全画面タスク                                                              |

## 2. 目的

AtomsとMoleculesを組み合わせた高次UIコンポーネント（Organisms）を実装する。グリッドレイアウト、マスター/ディテール分割、検索フィルタリングの3コンポーネントを作成し、複数の画面仕様で共通利用できるようにする。

## 3. Why（なぜ必要か）

1. **重複排除**: CardGrid、MasterDetailLayoutは複数画面（SkillCenter、Dashboard、HistorySearch等）で使用される。画面ごとに独自実装すると、挙動・デザインの不統一が発生する
2. **レスポンシブ一元管理**: desktop/tablet/mobileでの表示切替ロジックを1箇所で管理し、全画面で一貫したレスポンシブ体験を実現する
3. **ジェネリクスによる柔軟性**: TypeScriptジェネリクスで型安全なデータバインディングを実現し、スキル、履歴、統計等の異なるデータ型に対応する

## 4. 実行タスク

### Task 1: CardGrid\<T\>（新規作成）

#### 1.1 インターフェース定義

```typescript
interface CardGridProps<T> {
  /** データ配列 */
  items: T[];
  /** カード描画関数 */
  renderCard: (item: T, index: number) => React.ReactNode;
  /** グリッドの最小カード幅（デフォルト: 280px） */
  minCardWidth?: number;
  /** ギャップ（デフォルト: --spacing-4） */
  gap?: string;
  /** 空状態メッセージ */
  emptyMessage?: string;
  /** 空状態アイコン */
  emptyIcon?: string;
  /** ローディング状態 */
  isLoading?: boolean;
  /** スケルトンカード数（ローディング時） */
  skeletonCount?: number;
}
```

#### 1.2 レイアウト仕様

- **CSS Grid**: `display: grid; grid-template-columns: repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`
- **ギャップ**: デフォルト `var(--spacing-4)`（16px）
- **レスポンシブ**:
  - desktop（≥1024px）: `minCardWidth` に基づく自動列数
  - tablet（768-1023px）: `minCardWidth` に基づく自動列数（280px推奨）
  - mobile（<768px）: 1カラム（`grid-template-columns: 1fr`）

#### 1.3 状態表示

- **空状態**: `items.length === 0 && !isLoading` の場合、EmptyState コンポーネントを使用（`emptyIcon` + `emptyMessage` をセンター表示）
- **ローディング**: `isLoading === true` の場合、SkeletonCard コンポーネントを `skeletonCount` 個表示（デフォルト: 6個）。パルスアニメーション付き

#### 1.4 マイクロインタラクション

- **カード出現**: `opacity: 0 → 1` + `translateY(8px → 0)` 200ms `var(--ease-out)`（staggered、各カード50ms遅延）
- **カードホバー**: `scale(var(--scale-hover))` + `shadow-md`
- **カードアクティブ**: `scale(var(--scale-active))`

#### 1.5 アクセシビリティ

- `role="grid"` をグリッドコンテナに付与
- 各カードに `role="gridcell"` を付与
- キーボード: 矢印キーでカード間移動（↑↓←→）、`tabIndex` 管理
- フォーカス状態: `--status-primary` のアウトライン（2px offset）

#### 1.6 Atoms/Molecules 依存

| 依存コンポーネント | レイヤー | 用途                             |
| ------------------ | -------- | -------------------------------- |
| SkeletonCard       | Atom     | ローディング時のプレースホルダー |
| EmptyState         | Atom     | 空状態メッセージ表示             |

#### 1.7 使用画面

- SkillCenter（スキルカード一覧）
- Dashboard（統計カード）

---

### Task 2: MasterDetailLayout（新規作成）

#### 2.1 インターフェース定義

```typescript
interface MasterDetailLayoutProps {
  /** マスターパネル（リスト/グリッド） */
  master: React.ReactNode;
  /** ディテールパネル */
  detail: React.ReactNode;
  /** ディテールパネルの表示状態 */
  isDetailOpen: boolean;
  /** マスターパネル幅（デフォルト: "380px"） */
  masterWidth?: string;
  /** レスポンシブ時にディテールをオーバーレイ表示 */
  overlayOnMobile?: boolean;
}
```

#### 2.2 レイアウト仕様

| ブレークポイント     | マスターパネル                           | ディテールパネル                | 遷移方式                              |
| -------------------- | ---------------------------------------- | ------------------------------- | ------------------------------------- |
| desktop（≥1024px）   | 固定幅（`masterWidth`、デフォルト380px） | `flex: 1`（残り幅）             | 常に表示（`isDetailOpen` で内容切替） |
| tablet（768-1023px） | 全幅表示                                 | SlideInPanel としてオーバーレイ | スライドイン                          |
| mobile（<768px）     | 全幅表示                                 | フルスクリーンオーバーレイ      | フルスクリーン遷移                    |

- **Flexレイアウト**: `display: flex; height: 100%`
- **ボーダー**: マスターとディテールの間に `var(--border-default)` の縦線（1px solid）
- **ディテールパネル遷移**:
  - desktop: 常に表示。`isDetailOpen` でコンテンツの有無を制御
  - tablet/mobile: SlideInPanel（Molecule）を使用してスライドイン。`overlayOnMobile` が `true`（デフォルト）の場合、背面にオーバーレイ表示

#### 2.3 アクセシビリティ

- マスターパネル: `role="navigation"` + `aria-label="一覧"`
- ディテールパネル: `role="main"` + `aria-label="詳細"`
- tablet/mobile でディテールを閉じるボタンにフォーカス自動移動

#### 2.4 Atoms/Molecules 依存

| 依存コンポーネント | レイヤー | 用途                             |
| ------------------ | -------- | -------------------------------- |
| SlideInPanel       | Molecule | tablet/mobile でのディテール表示 |

#### 2.5 使用画面

- SkillCenter（スキルリスト + 詳細パネル）
- Workspace（ファイルツリー + エディタ）

---

### Task 3: SearchFilterList\<T\>（新規作成）

#### 3.1 インターフェース定義

```typescript
interface SearchFilterListProps<T> {
  /** 全データ配列 */
  items: T[];
  /** フィルターチップの定義 */
  filters: Array<{
    id: string;
    label: string;
    icon?: string;
    predicate: (item: T) => boolean;
  }>;
  /** 検索関数（テキストマッチ） */
  searchPredicate: (item: T, query: string) => boolean;
  /** アイテム描画（リスト形式） */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** アイテム描画（グリッド形式） */
  renderCard?: (item: T, index: number) => React.ReactNode;
  /** 表示モード */
  viewMode?: "list" | "grid";
  /** 検索プレースホルダー */
  searchPlaceholder?: string;
  /** 空状態メッセージ */
  emptyMessage?: string;
  /** ソート関数 */
  sortFn?: (a: T, b: T) => number;
}
```

#### 3.2 構成

```
┌──────────────────────────────────────┐
│  SearchBar（Molecule）                │
├──────────────────────────────────────┤
│  [FilterChip] [FilterChip] [Chip…]  │  ← 横スクロール可能
├──────────────────────────────────────┤
│  「3件 / 全12件」                     │  ← 結果カウント
├──────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐               │
│  │Card│ │Card│ │Card│  or List...   │  ← list/grid モード切替
│  └────┘ └────┘ └────┘               │
│  ─── or EmptyState ───              │
└──────────────────────────────────────┘
```

#### 3.3 フィルタリングロジック

1. **検索クエリ適用**: `searchPredicate(item, query)` で全アイテムをフィルター
2. **フィルターチップ適用**: アクティブなフィルターの `predicate(item)` で AND 条件フィルター
3. **ソート適用**: `sortFn` が指定されている場合、フィルター後のリストをソート
4. **結果**: 検索クエリ AND アクティブフィルターの**積集合**

```typescript
// フィルタリングの擬似コード
const filtered = useMemo(() => {
  let result = items;

  // 検索クエリ適用
  if (query.trim()) {
    result = result.filter((item) => searchPredicate(item, query));
  }

  // アクティブフィルター適用（AND条件）
  for (const filterId of activeFilterIds) {
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      result = result.filter(filter.predicate);
    }
  }

  // ソート適用
  if (sortFn) {
    result = [...result].sort(sortFn);
  }

  return result;
}, [items, query, activeFilterIds, filters, searchPredicate, sortFn]);
```

#### 3.4 結果カウント表示

- フォーマット: `「${filtered.length}件 / 全${items.length}件」`
- フィルター未適用時: `「全${items.length}件」`
- スタイル: `--text-sm`、`--text-secondary`

#### 3.5 フィルターチップ横スクロール

- コンテナ: `display: flex; overflow-x: auto; gap: var(--spacing-2)`
- スクロールバー: 非表示（`-webkit-scrollbar: none`、`scrollbar-width: none`）
- 左右フェード: フェードグラデーションで「スクロール可能」を示唆（CSS `mask-image`）

#### 3.6 状態管理

- **検索クエリ**: `useState<string>("")` でローカル管理
- **アクティブフィルターIDs**: `useState<Set<string>>(new Set())` でローカル管理
- **props駆動**: Zustand Store を直接参照しない（P31対策）。親コンポーネントが `items` を props で渡す

#### 3.7 パフォーマンス

- `useMemo` でフィルタリング結果をメモ化（依存: `items`, `query`, `activeFilterIds`, `filters`, `searchPredicate`, `sortFn`）
- SearchBar のデバウンスは SearchBar Molecule 側で処理（`onDebouncedChange` 経由）

#### 3.8 空状態

- EmptyState コンポーネントを使用
- 検索結果なしの場合: `mood="encouraging"`（「検索条件を変えてみてください」）
- データ自体が空の場合: `mood="welcoming"`（「まだデータがありません」）

#### 3.9 list/grid 表示モード切替

- `viewMode="list"`: `renderItem` コールバックで各アイテムを描画。`display: flex; flex-direction: column; gap: var(--spacing-2)`
- `viewMode="grid"`: `renderCard` コールバック + CardGrid コンポーネントで描画
- デフォルト: `"list"`
- `viewMode="grid"` 指定時に `renderCard` が未定義の場合、`renderItem` にフォールバック

#### 3.10 アクセシビリティ

- SearchBar: `role="search"`（SearchBar Molecule 側で実装済み）
- フィルターチップ: `role="group"` + `aria-label="フィルター"`
- 結果リスト: `role="list"`（list モード）/ `role="grid"`（grid モード）
- 結果カウント: `aria-live="polite"` でフィルター結果変更をスクリーンリーダーに通知

#### 3.11 Atoms/Molecules 依存

| 依存コンポーネント | レイヤー | 用途                       |
| ------------------ | -------- | -------------------------- |
| SearchBar          | Molecule | 検索入力（デバウンス付き） |
| FilterChip         | Atom     | フィルターチップ           |
| EmptyState         | Atom     | 空状態・検索結果なし表示   |
| CardGrid           | Organism | grid モード時のカード表示  |

#### 3.12 使用画面

- HistorySearch（履歴検索 + 期間/種別フィルター）
- SkillCenter（スキル検索 + カテゴリフィルター）

---

### Task 4: 共通仕様（全コンポーネントに適用）

#### 4.1 ジェネリクス型設計

CardGrid\<T\> と SearchFilterList\<T\> はジェネリクスを使用する。呼び出し側でデータ型を指定し、`renderCard`/`renderItem` のコールバックで型安全にアクセスできる。

```typescript
// 使用例: SkillCenter
<CardGrid<SkillItem>
  items={skills}
  renderCard={(skill) => <SkillCard name={skill.name} version={skill.version} />}
/>

// 使用例: HistorySearch
<SearchFilterList<HistoryEntry>
  items={historyEntries}
  filters={[
    { id: "today", label: "今日", predicate: (e) => isToday(e.timestamp) },
    { id: "week", label: "今週", predicate: (e) => isThisWeek(e.timestamp) },
  ]}
  searchPredicate={(entry, query) => entry.title.includes(query)}
  renderItem={(entry) => <HistoryItem {...entry} />}
/>
```

#### 4.2 Atoms/Molecules 依存関係サマリー

| Organism           | 依存する Atom            | 依存する Molecule |
| ------------------ | ------------------------ | ----------------- |
| CardGrid           | SkeletonCard, EmptyState | -                 |
| MasterDetailLayout | -                        | SlideInPanel      |
| SearchFilterList   | FilterChip, EmptyState   | SearchBar         |

#### 4.3 アクセシビリティ（WCAG 2.1 AA）

- コントラスト比 4.5:1 以上（通常テキスト）、3:1 以上（大テキスト / UI部品）
- キーボード操作で全機能にアクセス可能（グリッド: ↑↓←→、リスト: ↑↓）
- ARIA 属性を仕様通りに付与
- フォーカス管理: フォーカスリング `2px solid var(--status-primary)` + `offset 2px`

#### 4.4 レスポンシブ対応サマリー

| コンポーネント     | desktop（≥1024px） | tablet（768-1023px）          | mobile（<768px）              |
| ------------------ | ------------------ | ----------------------------- | ----------------------------- |
| CardGrid           | minWidth自動列数   | minWidth自動列数（280px推奨） | 1カラム（100%幅）             |
| MasterDetailLayout | 左右分割（flex）   | マスターのみ + オーバーレイ   | マスターのみ + フルスクリーン |
| SearchFilterList   | フル幅             | フル幅                        | フル幅                        |

#### 4.5 テーマテスト

各コンポーネントについて、全3テーマ（`kanagawa-dragon` + `light` + `dark`）でレンダリングテストを実施する。テスト内でテーマ切替には `document.documentElement.setAttribute("data-theme", themeName)` を使用。

---

### Task 5: テスト実装

#### 5.1 CardGrid テスト

| テストケース             | 検証内容                                                         |
| ------------------------ | ---------------------------------------------------------------- |
| アイテム描画             | `renderCard` で全アイテムが描画されることを確認                  |
| 空状態表示               | `items=[]` + `isLoading=false` で EmptyState が表示される        |
| ローディングスケルトン   | `isLoading=true` で SkeletonCard が `skeletonCount` 個表示される |
| グリッドレイアウト       | CSS Grid の `grid-template-columns` が仕様通りに適用される       |
| キーボードナビゲーション | 矢印キーでカード間フォーカス移動                                 |
| 3テーマレンダリング      | kanagawa-dragon / light / dark で正常レンダリング                |

#### 5.2 MasterDetailLayout テスト

| テストケース           | 検証内容                                                     |
| ---------------------- | ------------------------------------------------------------ |
| 左右分割レンダリング   | master と detail が横並びで表示される                        |
| masterWidth 指定       | マスターパネルが指定幅で表示される                           |
| ディテール非表示       | `isDetailOpen=false` でディテール内容が空になる              |
| ARIA属性               | `role="navigation"` / `role="main"` が正しく付与される       |
| レスポンシブモード切替 | `window.matchMedia` モックでブレークポイント変更時の動作確認 |
| 3テーマレンダリング    | kanagawa-dragon / light / dark で正常レンダリング            |

#### 5.3 SearchFilterList テスト

| テストケース           | 検証内容                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| 検索フィルタリング     | 検索クエリ入力で `searchPredicate` に基づくフィルター動作            |
| フィルターチップ連動   | チップ選択で該当フィルターの `predicate` が適用される                |
| AND条件フィルター      | 検索 + フィルターチップの積集合結果が正しい                          |
| 結果カウント表示       | `「N件 / 全M件」` が正しく表示される                                 |
| 空状態（データなし）   | 初期データが空の場合 `mood="welcoming"` の EmptyState                |
| 空状態（検索結果なし） | フィルター適用後の結果が0件の場合 `mood="encouraging"` の EmptyState |
| list/grid モード切替   | `viewMode` に応じた描画切替が動作する                                |
| ソート適用             | `sortFn` 指定時にソート結果が反映される                              |
| 3テーマレンダリング    | kanagawa-dragon / light / dark で正常レンダリング                    |
| aria-live通知          | フィルター結果変更時に `aria-live="polite"` 要素が更新される         |

#### 5.4 テスト環境ルール

- **fireEvent 使用**: happy-dom環境で `userEvent` は使用禁止（P39対策）
- **実行ディレクトリ**: `cd apps/desktop && pnpm vitest run` で実行（P40対策）
- **状態リセット**: `beforeEach` でDOM/storeリセット（P9対策）
- **タイマーテスト**: SearchFilterListのデバウンス（SearchBar経由）は `vi.useFakeTimers()` + `vi.advanceTimersByTime()` で1ステップずつ進める（P13対策）
- **ジェネリクステスト用型**: テスト内で具体的な型（`TestItem` 等）を定義して使用
- **レスポンシブテスト**: happy-domでは `window.matchMedia` をモック必須。`matchMedia.matches` を動的に変更してテスト

```typescript
// テスト用型定義の例
interface TestItem {
  id: string;
  name: string;
  category: string;
  createdAt: string;
}

const mockItems: TestItem[] = [
  { id: "1", name: "Alpha", category: "A", createdAt: "2026-01-01" },
  { id: "2", name: "Beta", category: "B", createdAt: "2026-01-02" },
  { id: "3", name: "Gamma", category: "A", createdAt: "2026-01-03" },
];
```

```typescript
// matchMedia モックの例
const createMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

// desktop mode
window.matchMedia = createMatchMedia(true);
// mobile mode
window.matchMedia = createMatchMedia(false);
```

## 5. 成果物

| #   | 成果物                    | パス                                                                                            |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | CardGrid コンポーネント   | `apps/desktop/src/renderer/components/organisms/CardGrid/index.tsx`                             |
| 2   | CardGrid テスト           | `apps/desktop/src/renderer/components/organisms/CardGrid/CardGrid.test.tsx`                     |
| 3   | MasterDetailLayout        | `apps/desktop/src/renderer/components/organisms/MasterDetailLayout/index.tsx`                   |
| 4   | MasterDetailLayout テスト | `apps/desktop/src/renderer/components/organisms/MasterDetailLayout/MasterDetailLayout.test.tsx` |
| 5   | SearchFilterList          | `apps/desktop/src/renderer/components/organisms/SearchFilterList/index.tsx`                     |
| 6   | SearchFilterList テスト   | `apps/desktop/src/renderer/components/organisms/SearchFilterList/SearchFilterList.test.tsx`     |

## 6. 完了条件

- [ ] CardGrid がジェネリクス型でアイテムを正しく描画する
- [ ] CardGrid の空状態（EmptyState）が `items=[]` かつ `isLoading=false` で表示される
- [ ] CardGrid のローディング状態（SkeletonCard）が `isLoading=true` で `skeletonCount` 個表示される
- [ ] CardGrid のカード出現アニメーション（staggered、各カード50ms遅延）が動作する
- [ ] CardGrid の矢印キーナビゲーション（↑↓←→）が動作する
- [ ] MasterDetailLayout の左右分割がデスクトップ（≥1024px）で正しく動作する
- [ ] MasterDetailLayout の `masterWidth` 指定が反映される
- [ ] MasterDetailLayout がタブレット以下で SlideInPanel/フルスクリーンに切り替わる
- [ ] MasterDetailLayout の ARIA 属性（`role="navigation"` / `role="main"`）が正しく設定される
- [ ] SearchFilterList の検索クエリフィルタリングが `searchPredicate` に基づいて動作する
- [ ] SearchFilterList のフィルターチップ選択が AND 条件で正しく適用される
- [ ] SearchFilterList の結果カウント表示（「N件 / 全M件」）が正しい
- [ ] SearchFilterList の list/grid 表示モード切替が動作する
- [ ] SearchFilterList の `sortFn` 指定時にソート結果が反映される
- [ ] SearchFilterList の空状態が mood に応じて正しく表示される（welcoming / encouraging）
- [ ] SearchFilterList の `aria-live="polite"` でフィルター結果変更がスクリーンリーダーに通知される
- [ ] 全コンポーネントが3テーマ（kanagawa-dragon / light / dark）でレンダリングテスト PASS
- [ ] 全コンポーネントの ARIA 属性が仕様通りに設定されている
- [ ] レスポンシブ動作が3ブレークポイント（desktop / tablet / mobile）で確認されている
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが PASS

## 7. 既知の落とし穴・教訓

| Pitfall ID | 内容                                   | 対策                                                                                                                |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| P31        | Zustand合成Hook無限ループ              | 共通コンポーネントはprops駆動。store直接参照しない。SearchFilterListの状態は `useState` でローカル管理              |
| P39        | happy-dom環境でuserEvent非互換         | `fireEvent` を使用。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む                        |
| P40        | テスト実行ディレクトリ依存（モノレポ） | `cd apps/desktop && pnpm vitest run` で実行。プロジェクトルートから実行しない                                       |
| P9         | モジュールスコープ変数のテスト間リーク | `beforeEach` で状態リセット                                                                                         |
| P13        | タイマーテストの無限ループ             | SearchFilterListのデバウンス（SearchBar経由）は `vi.advanceTimersByTime()` で1ステップずつ進める                    |
| 新規       | ジェネリクス型コンポーネントのテスト   | テスト用に具体的な型（`TestItem` 等）を定義してテスト。型パラメータを明示的に指定する                               |
| 新規       | レスポンシブテストの制約               | happy-domでは `window.matchMedia` をモック必須。`matchMedia.matches` を動的に変更してブレークポイントをシミュレート |
| 新規       | CardGrid staggeredアニメーション       | CSSの `transition-delay` を `index * 50ms` で計算。テストでは `getComputedStyle` でdelay値を検証                    |

## 8. 実行手順（task-specification-creator準拠）

| Step | 内容                                                                                                                                       | 実行方式 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 1    | 依存仕様（`00-1` / `00-2` / `00-3`）を確認し、Organismsが利用するAtoms/Molecules契約を固定する                                             | 直列     |
| 2    | CardGrid / MasterDetailLayout / SearchFilterList 本体を実装する                                                                            | 並列     |
| 3    | テスト実装（Task 5）でフィルタリング、レスポンシブ、a11y、テーマ横断を検証する                                                             | 並列     |
| 4    | 統合テスト連携: SearchBar + FilterChip + EmptyState + SlideInPanel の連携シナリオを実行し、`cd apps/desktop && pnpm vitest run` を実施する | 直列     |
| 5    | 完了条件チェックリストと成果物パスを照合し、P31対策（Store直接参照禁止）を最終確認する                                                     | 直列     |

## 9. システム仕様（aiworkflow-requirements）

| 参照仕様                                                                          | 今回抽出した必須要件                                     | 本仕様への反映                                 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | Organisms責務（Moleculesを束ねる画面単位コンポーネント） | Task 1〜3の設計方針                            |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG、WCAG、キーボード操作、フォーカス管理          | a11y仕様、完了条件                             |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | レスポンシブブレークポイントとトークン利用原則           | レイアウト仕様、レスポンシブ要件               |
| `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | Organisms/Molecules/Atomsの構成境界、ARIA設計            | 依存関係、アクセシビリティ設計                 |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom前提のUIテスト実装パターン                      | Task 5、テスト環境ルール                       |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | aria-live/role/フォーカストラップ検証                    | SearchFilterList、MasterDetailLayoutのa11y要件 |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31対策（Props駆動、局所状態管理）                       | 既知の落とし穴（P31）                          |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | Vitest/RTL品質ゲート                                     | 完了条件（Vitest PASS）                        |

## 10. 参照資料

- [00-ui-design-foundation.md](./task-050-ui-00-ui-design-foundation.md) — 親仕様書（Organisms セクション: Task 2.3）
- [00-1-design-tokens.md](../completed-task/00-1-design-tokens.md) — デザイントークン仕様（CSS変数定義）
- [00-2-atoms-components.md](../completed-task/00-2-atoms-components.md) — Atoms仕様（SkeletonCard, EmptyState, FilterChip）
- [00-3-molecules-components.md](./task-053-ui-00-3-molecules-components.md) — Molecules仕様（SearchBar, SlideInPanel）
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` — Organisms責務定義
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` — Apple HIG/WCAG設計原則
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` — レスポンシブ/トークン基準
- `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md` — UIアーキテクチャ
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` — コンポーネントテストパターン
- `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` — a11yテスト基準
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — P31対策
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` — テスト品質要件
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-055-ui-00-foundation-reflection-audit.md` — 分割反映トレーサビリティ監査
- [.claude/rules/01-architecture.md](../../../../../.claude/rules/01-architecture.md) — Apple HIG準拠、Atomic Design、レスポンシブ戦略
- [.claude/rules/06-known-pitfalls.md](../../../../../.claude/rules/06-known-pitfalls.md) — P9, P13, P31, P39, P40
- `apps/desktop/src/renderer/store/slices/uiSlice.ts` — ResponsiveMode 定義（desktop / tablet / mobile）
