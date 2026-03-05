# Phase 2 コンポーネント設計書

## 1. 設計方針

- Atomic DesignのOrganismsとして、Atoms/Moleculesを束ねる。
- データ取得責務は持たず、全て props 入力。
- a11y（role/aria/keyboard）をコンポーネント責務として内包。

## 2. SubAgent 分担結果

| SubAgent                 | 担当                       | 結果                    |
| ------------------------ | -------------------------- | ----------------------- |
| SubAgent-DESIGN-CardGrid | CardGrid責務設計           | 完了                    |
| SubAgent-DESIGN-Layout   | MasterDetailLayout責務設計 | 完了                    |
| SubAgent-DESIGN-Search   | SearchFilterList責務設計   | 完了                    |
| SubAgent-DESIGN-State    | 状態管理設計               | `state-design.md`へ分離 |

## 3. CardGrid<T>

### 責務

- ジェネリクス型カード描画
- loading / empty / populated の状態切替
- grid keyboard navigation（↑↓←→）
- responsive列制御（desktop/tablet: auto-fill、mobile: 1列）

### 依存

- Atom: `SkeletonCard`, `EmptyState`

### レイアウト

- desktop/tablet: `repeat(auto-fill, minmax(minCardWidth, 1fr))`
- mobile: `1fr`
- gap: props `gap`（既定 `var(--spacing-4)`）

## 4. MasterDetailLayout

### 責務

- master/detail の分割表示
- desktopで常時2カラム
- tablet/mobileでdetailを `SlideInPanel` 化

### 依存

- Molecule: `SlideInPanel`

### レイアウト

- desktop: `display:flex`, master固定幅+detail可変
- tablet: master全幅 + detail overlay
- mobile: master全幅 + detail full-screen overlay

## 5. SearchFilterList<T>

### 責務

- 検索クエリ管理
- フィルター複合（AND）
- sort適用
- list/grid描画切替
- 結果件数ライブ通知

### 依存

- Molecule: `SearchBar`
- Atom: `FilterChip`, `EmptyState`
- Organism: `CardGrid`（grid mode）

### レンダリング構造

1. 検索入力領域（role=search）
2. フィルター領域（role=group）
3. 件数表示（aria-live=polite）
4. 結果表示（list or grid）

## 6. レスポンシブ仕様確定

| コンポーネント     | desktop (>=1024) | tablet (768-1023)     | mobile (<768)             |
| ------------------ | ---------------- | --------------------- | ------------------------- |
| CardGrid           | auto-fill列      | auto-fill列           | 1列                       |
| MasterDetailLayout | 2カラム固定      | master+overlay detail | master+full-screen detail |
| SearchFilterList   | 横幅100%         | 横幅100%              | 横幅100%                  |
