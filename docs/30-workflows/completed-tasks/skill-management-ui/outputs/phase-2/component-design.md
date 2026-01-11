# コンポーネント設計書 - スキル管理UI（AGENT-002）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | AGENT-002  |
| Phase    | 2          |
| 作成日   | 2026-01-11 |

---

## 1. 概要

Atomic Design原則に従ったスキル管理UIのコンポーネント構造を設計する。既存のUIコンポーネント仕様（`ui-ux-components.md`）との整合性を確保しつつ、再利用性と保守性を重視した設計を行う。

---

## 2. コンポーネント階層構造

```
AgentView (view)
├── SkillManagementSection (organism)
│   ├── SkillToolbar (organism)
│   │   ├── SkillSearchBar (molecule)
│   │   │   ├── SearchIcon (atom)
│   │   │   ├── Input (atom)
│   │   │   └── ClearButton (atom)
│   │   ├── SkillCategoryFilter (molecule)
│   │   │   └── Select (atom)
│   │   └── ImportButton (atom)
│   │       └── Button (atom)
│   │
│   ├── SkillList (organism)
│   │   ├── SkillCard[] (molecule)
│   │   │   ├── SkillCardHeader (atom)
│   │   │   ├── SkillCardDescription (atom)
│   │   │   └── SkillCardTags (molecule)
│   │   │       └── Badge[] (atom)
│   │   ├── SkillListSkeleton (molecule)
│   │   ├── SkillListEmptyState (molecule)
│   │   └── SkillListError (molecule)
│   │
│   └── SkillDetailPanel (organism)
│       ├── PanelHeader (molecule)
│       │   ├── SkillTitle (atom)
│       │   └── CloseButton (atom)
│       ├── SkillDescription (atom)
│       ├── SkillTriggerList (molecule)
│       │   └── TriggerBadge[] (atom)
│       ├── SkillAnchorList (molecule)
│       │   └── AnchorItem[] (molecule)
│       └── SkillActions (molecule)
│           ├── ExecuteButton (atom)
│           └── DeleteButton (atom)
│
└── SkillImportDialog (organism)
    ├── DialogHeader (molecule)
    │   ├── DialogTitle (atom)
    │   └── CloseButton (atom)
    ├── DialogSearchBar (molecule)
    │   └── SkillSearchBar (再利用)
    ├── AvailableSkillList (organism)
    │   └── SkillCheckboxItem[] (molecule)
    │       ├── Checkbox (atom)
    │       ├── SkillName (atom)
    │       └── SkillDescription (atom)
    └── DialogActions (molecule)
        ├── CancelButton (atom)
        └── ImportButton (atom)
```

---

## 3. Organisms（有機体）

### 3.1 SkillManagementSection

**責務**: スキル管理機能全体を統括するコンテナコンポーネント

**ファイルパス**: `components/organisms/SkillManagementSection/index.tsx`

```typescript
interface SkillManagementSectionProps {
  /** クラス名 */
  className?: string;
}
```

**機能**:

- スキル一覧の表示
- 検索・フィルタリング機能の提供
- 詳細パネルの表示/非表示制御
- インポートダイアログの表示制御

**Zustand接続**:

- `useSkillStore()` フックでスキル状態を取得

---

### 3.2 SkillToolbar

**責務**: 検索バー、カテゴリフィルター、インポートボタンを横並びに配置

**ファイルパス**: `components/organisms/SkillToolbar/index.tsx`

```typescript
interface SkillToolbarProps {
  /** 検索値 */
  searchValue: string;
  /** 検索値変更ハンドラ */
  onSearchChange: (value: string) => void;
  /** 選択中カテゴリ */
  selectedCategory: SkillCategory | null;
  /** カテゴリ変更ハンドラ */
  onCategoryChange: (category: SkillCategory | null) => void;
  /** 利用可能カテゴリ */
  categories: SkillCategory[];
  /** インポートボタンクリックハンドラ */
  onImportClick: () => void;
  /** クラス名 */
  className?: string;
}
```

**レイアウト**:

```
┌──────────────────────────────────────────────────────────────┐
│ [🔍 スキルを検索...           ] [カテゴリ ▼] [+ インポート]  │
│ ← flex-1                       → ← w-40    → ← w-32        → │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.3 SkillList

**責務**: スキルカードのグリッド表示、空状態・ローディング・エラー表示

**ファイルパス**: `components/organisms/SkillList/index.tsx`

```typescript
interface SkillListProps {
  /** スキル一覧 */
  skills: Skill[];
  /** 選択中スキルID */
  selectedSkillId: string | null;
  /** スキル選択ハンドラ */
  onSkillSelect: (skill: Skill) => void;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error?: string | null;
  /** 再試行ハンドラ */
  onRetry?: () => void;
  /** クラス名 */
  className?: string;
}
```

**状態別レンダリング**:

| 状態    | 表示コンポーネント     |
| ------- | ---------------------- |
| loading | SkillListSkeleton      |
| error   | SkillListError         |
| empty   | SkillListEmptyState    |
| success | SkillCard[] (グリッド) |

**グリッドレイアウト**:

```css
.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px; /* spacing-4 */
}
```

---

### 3.4 SkillDetailPanel

**責務**: 選択スキルの詳細情報表示、実行・削除アクション

**ファイルパス**: `components/organisms/SkillDetailPanel/index.tsx`

```typescript
interface SkillDetailPanelProps {
  /** 選択中スキル */
  skill: Skill | null;
  /** パネル表示状態 */
  isOpen: boolean;
  /** 実行ハンドラ */
  onExecute: (skill: Skill) => void;
  /** 削除ハンドラ */
  onDelete: (skill: Skill) => void;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** クラス名 */
  className?: string;
}
```

**アクセシビリティ**:

```tsx
<aside
  role="complementary"
  aria-label="スキル詳細"
  aria-hidden={!isOpen}
  tabIndex={isOpen ? 0 : -1}
>
```

**キーボード操作**:

| キー   | 動作           |
| ------ | -------------- |
| Escape | パネルを閉じる |
| Tab    | パネル内要素間 |

---

### 3.5 SkillImportDialog

**責務**: 利用可能スキルの選択とインポート

**ファイルパス**: `components/organisms/SkillImportDialog/index.tsx`

```typescript
interface SkillImportDialogProps {
  /** ダイアログ表示状態 */
  isOpen: boolean;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** 利用可能スキル一覧 */
  availableSkills: Skill[];
  /** インポート済みスキルID一覧 */
  importedSkillIds: string[];
  /** インポートハンドラ */
  onImport: (skillIds: string[]) => Promise<void>;
  /** ローディング状態 */
  isLoading?: boolean;
}
```

**アクセシビリティ**:

```tsx
<dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="import-dialog-title"
>
```

**フォーカス管理**:

1. 開く時: 検索バーにフォーカス
2. 閉じる時: トリガー要素（インポートボタン）にフォーカスを戻す

---

## 4. Molecules（分子）

### 4.1 SkillCard

**責務**: 単一スキルの概要表示

**ファイルパス**: `components/molecules/SkillCard/index.tsx`

```typescript
interface SkillCardProps {
  /** スキルデータ */
  skill: Skill;
  /** 選択状態 */
  isSelected: boolean;
  /** クリックハンドラ */
  onClick: () => void;
  /** キーボードフォーカス */
  onFocus?: () => void;
}
```

**表示内容**:

| 要素     | 表示内容                   | スタイル              |
| -------- | -------------------------- | --------------------- |
| ヘッダー | スキル名                   | text-lg, font-medium  |
| 説明     | 説明文（2行で切り詰め）    | text-sm, line-clamp-2 |
| タグ     | カテゴリ + Trigger (最大3) | Badge, gap-2          |

**インタラクション**:

| 状態     | スタイル                                     |
| -------- | -------------------------------------------- |
| default  | glass-bg, border-glass                       |
| hover    | scale(1.02), shadow-lg, border-primary       |
| selected | ring-2, ring-primary, bg-primary/10          |
| focus    | outline-2, outline-primary, outline-offset-2 |

---

### 4.2 SkillSearchBar

**責務**: スキル検索入力

**ファイルパス**: `components/molecules/SkillSearchBar/index.tsx`

```typescript
interface SkillSearchBarProps {
  /** 現在値 */
  value: string;
  /** 変更ハンドラ */
  onChange: (value: string) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** 自動フォーカス */
  autoFocus?: boolean;
  /** aria-label */
  "aria-label"?: string;
}
```

**構成**:

```
┌─────────────────────────────────────┐
│ 🔍 │ スキルを検索...           │ ✕ │
│ ←──→ ←───────────────────────→ ←─→ │
│ icon        input              clear│
└─────────────────────────────────────┘
```

**デバウンス**: 200ms

---

### 4.3 SkillCategoryFilter

**責務**: カテゴリによるフィルタリング

**ファイルパス**: `components/molecules/SkillCategoryFilter/index.tsx`

```typescript
interface SkillCategoryFilterProps {
  /** 選択中カテゴリ */
  value: SkillCategory | null;
  /** 変更ハンドラ */
  onChange: (category: SkillCategory | null) => void;
  /** 利用可能カテゴリ */
  categories: SkillCategory[];
  /** 無効状態 */
  disabled?: boolean;
}
```

**オプション**:

```tsx
<option value="">すべて</option>;
{
  categories.map((cat) => (
    <option key={cat} value={cat}>
      {SKILL_CATEGORIES[cat].label}
    </option>
  ));
}
```

---

### 4.4 SkillCheckboxItem

**責務**: インポートダイアログ内のスキル選択行

**ファイルパス**: `components/molecules/SkillCheckboxItem/index.tsx`

```typescript
interface SkillCheckboxItemProps {
  /** スキルデータ */
  skill: Skill;
  /** チェック状態 */
  checked: boolean;
  /** 変更ハンドラ */
  onChange: (checked: boolean) => void;
  /** 無効状態（既にインポート済み） */
  disabled?: boolean;
}
```

**レイアウト**:

```
┌──────────────────────────────────────────────┐
│ ☑ │ skill-name              │ Short desc... │
│ ←→ ←────────────────────────→ ←────────────→ │
└──────────────────────────────────────────────┘
```

---

### 4.5 SkillListSkeleton

**責務**: ローディング中のスケルトン表示

**ファイルパス**: `components/molecules/SkillListSkeleton/index.tsx`

```typescript
interface SkillListSkeletonProps {
  /** スケルトンカード数 */
  count?: number;
}
```

**実装**:

```tsx
const SkillListSkeleton: React.FC<SkillListSkeletonProps> = ({ count = 6 }) => (
  <div className="skill-grid" aria-busy="true" aria-label="読み込み中">
    {Array.from({ length: count }).map((_, i) => (
      <SkillCardSkeleton key={i} />
    ))}
  </div>
);
```

---

### 4.6 SkillListEmptyState

**責務**: スキル0件時の空状態表示

**ファイルパス**: `components/molecules/SkillListEmptyState/index.tsx`

```typescript
interface SkillListEmptyStateProps {
  /** インポートボタンクリックハンドラ */
  onImportClick?: () => void;
  /** 検索結果が0件の場合 */
  isSearchResult?: boolean;
  /** 検索クリアハンドラ */
  onClearSearch?: () => void;
}
```

**表示パターン**:

| パターン    | メッセージ                       | アクション         |
| ----------- | -------------------------------- | ------------------ |
| 初期状態    | スキルがインポートされていません | インポートボタン   |
| 検索結果0件 | 該当するスキルがありません       | 検索をクリアリンク |

---

### 4.7 SkillListError

**責務**: エラー状態の表示

**ファイルパス**: `components/molecules/SkillListError/index.tsx`

```typescript
interface SkillListErrorProps {
  /** エラーメッセージ */
  message: string;
  /** 再試行ハンドラ */
  onRetry?: () => void;
}
```

**アクセシビリティ**:

```tsx
<div role="alert" aria-live="polite">
  <p>{message}</p>
  <button onClick={onRetry}>再試行</button>
</div>
```

---

## 5. Atoms（原子）

既存のUIコンポーネントライブラリから再利用:

| Atom       | 用途               | 元パス                        |
| ---------- | ------------------ | ----------------------------- |
| Button     | アクションボタン   | `components/atoms/Button`     |
| Input      | テキスト入力       | `components/atoms/Input`      |
| Select     | ドロップダウン     | `components/atoms/Select`     |
| Checkbox   | チェックボックス   | `components/atoms/Checkbox`   |
| Badge      | タグ表示           | `components/atoms/Badge`      |
| Dialog     | モーダルダイアログ | `components/atoms/Dialog`     |
| Skeleton   | スケルトンUI       | `components/atoms/Skeleton`   |
| GlassPanel | ガラスパネル       | `components/atoms/GlassPanel` |
| IconButton | アイコンボタン     | `components/atoms/IconButton` |

---

## 6. フォルダ構成

```
apps/desktop/src/renderer/
├── components/
│   ├── atoms/
│   │   └── (既存コンポーネント)
│   ├── molecules/
│   │   ├── SkillCard/
│   │   │   ├── index.tsx
│   │   │   ├── SkillCard.test.tsx
│   │   │   └── SkillCard.stories.tsx
│   │   ├── SkillSearchBar/
│   │   │   ├── index.tsx
│   │   │   └── SkillSearchBar.test.tsx
│   │   ├── SkillCategoryFilter/
│   │   │   ├── index.tsx
│   │   │   └── SkillCategoryFilter.test.tsx
│   │   ├── SkillCheckboxItem/
│   │   │   ├── index.tsx
│   │   │   └── SkillCheckboxItem.test.tsx
│   │   ├── SkillListSkeleton/
│   │   │   ├── index.tsx
│   │   │   └── SkillListSkeleton.test.tsx
│   │   ├── SkillListEmptyState/
│   │   │   ├── index.tsx
│   │   │   └── SkillListEmptyState.test.tsx
│   │   └── SkillListError/
│   │       ├── index.tsx
│   │       └── SkillListError.test.tsx
│   └── organisms/
│       ├── SkillManagementSection/
│       │   ├── index.tsx
│       │   └── SkillManagementSection.test.tsx
│       ├── SkillToolbar/
│       │   ├── index.tsx
│       │   └── SkillToolbar.test.tsx
│       ├── SkillList/
│       │   ├── index.tsx
│       │   └── SkillList.test.tsx
│       ├── SkillDetailPanel/
│       │   ├── index.tsx
│       │   └── SkillDetailPanel.test.tsx
│       └── SkillImportDialog/
│           ├── index.tsx
│           └── SkillImportDialog.test.tsx
└── views/
    └── AgentView/
        └── index.tsx (既存ビューを拡張)
```

---

## 7. コンポーネント間データフロー

```
┌─────────────────────────────────────────────────────────────────┐
│                         AgentView                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  SkillManagementSection                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                    SkillToolbar                      │  │  │
│  │  │  searchValue ──→ SkillSearchBar ──→ onSearchChange   │  │  │
│  │  │  category ────→ SkillCategoryFilter ─→ onCategoryChange│  │
│  │  │                 ImportButton ──→ openImportDialog    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                           ↓                               │  │
│  │  ┌────────────────────────────────┬────────────────────┐  │  │
│  │  │          SkillList             │  SkillDetailPanel  │  │  │
│  │  │                                │                    │  │  │
│  │  │  filteredSkills ──→ SkillCard[]│  selectedSkill ──→ │  │  │
│  │  │  onSkillSelect ←── onClick     │  ←── skill detail  │  │  │
│  │  │                                │  onExecute ──→     │  │  │
│  │  │                                │  onDelete ──→      │  │  │
│  │  │                                │  onClose ──→       │  │  │
│  │  └────────────────────────────────┴────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  SkillImportDialog                        │  │
│  │  availableSkills ──→ SkillCheckboxItem[]                  │  │
│  │  selectedIds ←── onChange                                 │  │
│  │  onImport ──→ importSkills()                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    ┌───────────────────┐
                    │   Zustand Store   │
                    │   (agentSlice)    │
                    └───────────────────┘
                              ↕
                    ┌───────────────────┐
                    │     IPC API       │
                    │  (window.skillAPI)│
                    └───────────────────┘
```

---

## 8. 確認済み

- [x] Atomic Design階層構造が定義されている
- [x] 各コンポーネントのProps型が定義されている
- [x] フォルダ構成が定義されている
- [x] データフローが明確化されている
- [x] アクセシビリティ要件が組み込まれている
