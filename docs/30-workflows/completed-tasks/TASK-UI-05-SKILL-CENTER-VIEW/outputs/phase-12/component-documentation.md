# コンポーネントドキュメント: SkillCenterView

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| タスクID   | TASK-UI-05-SKILL-CENTER-VIEW |
| 作成日     | 2026-03-01                   |
| Phase      | 12                           |
| バージョン | 1.0                          |

---

## 1. SkillCenterView

**パス**: `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`
**分類**: Template
**テスト**: `__tests__/SkillCenterView.test.tsx` (11テスト)

### Props

なし（ルートビューコンポーネント）

### 主要動作

- `useSkillCenter` フックでメインロジックを取得
- ローディング中: スピナーアイコン表示
- エラー時: エラーメッセージ表示
- 正常時: Header + SearchBar + FeaturedSection + CategoryTabs + CardGrid + SkillDetailPanel を構成
- フィルタリング中は FeaturedSection を非表示
- 検索結果 0 件で SkillEmptyState を表示

### Export

| 名前            | 型                       | 説明                                    |
| --------------- | ------------------------ | --------------------------------------- |
| viewStyles      | `Record<string, string>` | ビュー全体のスタイル定義（8プロパティ） |
| SkillCenterView | `React.FC`               | メインコンポーネント（memo化）          |
| default         | `React.FC`               | デフォルトエクスポート                  |

---

## 2. FeaturedSection

**パス**: `components/FeaturedSection/FeaturedSection.tsx`
**分類**: Organism
**テスト**: `__tests__/FeaturedSection.test.tsx` (13テスト)

### Props

```typescript
interface FeaturedSectionProps {
  skills: SkillMetadata[]; // おすすめスキル一覧
  importedSkillNames: string[]; // インポート済みスキル名の配列
  onAdd: (skillName: string) => void; // ツール追加ハンドラ
  onSelect: (skillName: string) => void; // ツール選択ハンドラ
}
```

### 主要動作

- `skills.length === 0` で `null` を返す（非表示）
- `importedSkillNames` から Set を生成し、各 FeaturedCard に `isAdded` を渡す
- 「おすすめツール」ヘッダーと「NEW」バッジを表示
- レスポンシブグリッド: 1列(default) / 2列(sm) / 3列(lg)

### Export

| 名前            | 型                               | 説明                                  |
| --------------- | -------------------------------- | ------------------------------------- |
| sectionStyles   | `Record<string, string>`         | セクションスタイル定義（4プロパティ） |
| FeaturedSection | `React.FC<FeaturedSectionProps>` | コンポーネント（memo化）              |

---

## 3. FeaturedCard

**パス**: `components/FeaturedSection/FeaturedCard.tsx`
**分類**: Molecule
**テスト**: FeaturedSection.test.tsx に含む

### Props

```typescript
interface FeaturedCardProps {
  skill: SkillMetadata; // スキルメタデータ
  isAdding: boolean; // 追加処理中フラグ
  isAdded: boolean; // 追加済みフラグ
  onAdd: (skillName: string) => void; // ツール追加ハンドラ
  onSelect: (skillName: string) => void; // ツール選択ハンドラ
  index: number; // stagger animation delay 用インデックス
}
```

### 主要動作

- h=160px の固定高さカード
- 56px アイコン（スキル名先頭文字を大文字表示）
- 5% グラデーション背景 (`from-[var(--status-primary)]/5 to-transparent`)
- stagger 出現アニメーション: `animationDelay = ${index * 100}ms`
- hover: scale(1.02) + shadow-md
- active: scale(0.97)
- `AddButton` を `size="featured"` で内包
- イベント伝搬: AddButton エリアは `stopPropagation` でカードクリックと分離

### Export

| 名前               | 型                            | 説明                              |
| ------------------ | ----------------------------- | --------------------------------- |
| featuredCardStyles | `Record<string, string>`      | カードスタイル定義（5プロパティ） |
| FeaturedCard       | `React.FC<FeaturedCardProps>` | コンポーネント（memo化）          |

---

## 4. SkillCard

**パス**: `components/SkillCard.tsx`
**分類**: Molecule
**テスト**: `__tests__/SkillCard.test.tsx` (12テスト)

### Props

```typescript
interface SkillCardProps {
  skill: SkillMetadata; // スキルメタデータ
  isAdded: boolean; // 追加済みフラグ
  isAdding?: boolean; // 追加処理中フラグ（デフォルト: false）
  onAdd: (skillName: string) => void; // ツール追加ハンドラ
  onSelect: (skillName: string) => void; // ツール選択ハンドラ
}
```

### 主要動作

- 48px アイコン（スキル名先頭文字を大文字表示）
- 説明文 1 行切り捨て (`line-clamp-1`)
- ファイル数表示 (agents + references + indexes + otherFiles)
- hover: scale(1.02) + shadow-md
- active: scale(0.97)
- `role="button"` + `tabIndex={0}` でキーボードアクセシブル
- Enter/Space キーで `onSelect` 呼び出し
- イベント伝搬: AddButton エリアは `stopPropagation` でカードクリックと分離

### Export

| 名前       | 型                         | 説明                              |
| ---------- | -------------------------- | --------------------------------- |
| cardStyles | `Record<string, string>`   | カードスタイル定義（6プロパティ） |
| SkillCard  | `React.FC<SkillCardProps>` | コンポーネント（memo化）          |

---

## 5. AddButton

**パス**: `components/AddButton.tsx`
**分類**: Atom
**テスト**: `__tests__/AddButton.test.tsx` (17テスト)

### Props

```typescript
type AddButtonState = "idle" | "processing" | "success";

interface AddButtonProps {
  status: AddButtonState; // ボタン状態
  isAdded: boolean; // 追加済みフラグ
  onAdd: () => void; // 追加ハンドラ
  size?: "default" | "featured"; // ボタンサイズ（デフォルト: "default"）
}
```

### 主要動作

- 3状態遷移のモーフィングアニメーション
  - idle: 「追加する」+ plus アイコン（青背景）
  - processing: 「追加中...」+ spinner アイコン（青背景 + spin）
  - success: 「追加済み!」+ check アイコン（緑背景）
- `isAdded && status !== "success"` の場合はグレー背景で「追加済み」表示
- `disabled` = `isAdded || status !== "idle"`
- `aria-busy={status === "processing"}` で処理中状態をスクリーンリーダーに通知
- `data-state` 属性でテスト用状態表示

### Export（P47 対策: モジュールスコープ定数）

| 名前            | 型                               | 説明                     |
| --------------- | -------------------------------- | ------------------------ |
| addButtonStyles | `Record<AddButtonState, string>` | 状態別スタイル定義       |
| addedStyle      | `string`                         | 追加済みスタイル         |
| AddButton       | `React.FC<AddButtonProps>`       | コンポーネント（memo化） |

---

## 6. CategoryTabs

**パス**: `components/CategoryTabs.tsx`
**分類**: Molecule
**テスト**: `__tests__/CategoryTabs.test.tsx` (6テスト)

### Props

```typescript
type CategoryId =
  | "all"
  | "dev"
  | "writing"
  | "analysis"
  | "automation"
  | "other";

interface CategoryTabsProps {
  selectedCategory: CategoryId | string | null; // 現在選択中のカテゴリ
  onCategoryChange: (category: CategoryId) => void; // カテゴリ変更ハンドラ
}
```

### 主要動作

- 6 カテゴリ（すべて / 開発ツール / 文書作成 / データ分析 / 自動化 / その他）
- `null` は `"all"` と同等として扱う
- `role="tablist"` / `role="tab"` / `aria-selected` でアクセシブル
- キーボードナビゲーション:
  - ArrowRight/ArrowDown: 次のタブ（循環）
  - ArrowLeft/ArrowUp: 前のタブ（循環）
  - Home: 最初のタブ
  - End: 最後のタブ
  - Enter/Space: 選択
- roving tabindex パターン（選択中のタブのみ `tabIndex={0}`）
- 選択中タブの下に青い下線インジケータ（200ms ease-out）
- 横スクロール対応 (`overflow-x-auto scrollbar-none`)

### Export

| 名前         | 型                            | 説明                            |
| ------------ | ----------------------------- | ------------------------------- |
| CATEGORIES   | `readonly CategoryDef[]`      | カテゴリ定義配列（6要素）       |
| tabStyles    | `Record<string, string>`      | タブスタイル定義（4プロパティ） |
| CategoryTabs | `React.FC<CategoryTabsProps>` | コンポーネント（memo化）        |

---

## 7. SkillDetailPanel

**パス**: `components/SkillDetailPanel/SkillDetailPanel.tsx`
**分類**: Organism
**テスト**: `__tests__/SkillDetailPanel.test.tsx` (37テスト)

### Props

```typescript
interface SkillDetailPanelProps {
  skillName: string | null; // 表示中のスキル名
  isOpen: boolean; // パネル開閉状態
  onClose: () => void; // 閉じるハンドラ
  onDelete: (skillName: string) => void; // 削除リクエストハンドラ
  isImported: boolean; // インポート済みフラグ
  skill?: SkillMetadata | ImportedSkill; // スキルデータ
}
```

### 主要動作

- `!isOpen || !skillName || !skill` で `null` を返す（非表示）
- デスクトップ: 右からスライドイン (450px, 250ms ease-out) `hidden md:block`
- モバイル: ボトムシート (max-h=85vh, 300ms ease-out) `md:hidden`
- オーバーレイ: `bg-black/20 backdrop-blur-sm`
- Escape キーで閉じる（`useEffect` でキーボードリスナー登録）
- オーバーレイクリック（`target === currentTarget`）で閉じる
- 権限バッジ: `PERMISSION_LABELS` でツール名を平易な日本語に変換
- サブリソース一覧: `ResourceList` 内部コンポーネントで agents/references/indexes/scripts を表示
- その他のファイル: `otherFiles` をファイルサイズ付きで表示
- 削除ゾーン: `isImported` 時のみ表示。赤い警告エリア + 削除ボタン

### 権限ラベルマッピング

| ツール名  | 日本語ラベル         | スタイル       |
| --------- | -------------------- | -------------- |
| Bash      | コマンドを実行       | warning-subtle |
| Read      | ファイルを読む       | info-subtle    |
| Write     | ファイルに書き込む   | warning-subtle |
| Edit      | ファイルを編集する   | warning-subtle |
| WebSearch | ウェブを検索する     | info-subtle    |
| WebFetch  | ウェブから情報を取得 | info-subtle    |

### Export

| 名前              | 型                                 | 説明                        |
| ----------------- | ---------------------------------- | --------------------------- |
| PERMISSION_LABELS | `Record<string, { label; color }>` | 権限ラベル/カラーマッピング |
| panelStyles       | `Record<string, string \| object>` | パネルスタイル定義          |
| SkillDetailPanel  | `React.FC<SkillDetailPanelProps>`  | コンポーネント（memo化）    |

### 内部コンポーネント

| 名前         | Props                                             | 役割                      |
| ------------ | ------------------------------------------------- | ------------------------- |
| PanelContent | skill, displayName, allowedTools, isImported, ... | デスクトップ/モバイル共用 |
| ResourceList | title, resources: SkillSubResource[]              | サブリソース一覧表示      |

### ユーティリティ関数

| 名前            | 引数                                  | 戻り値  | 説明         |
| --------------- | ------------------------------------- | ------- | ------------ |
| isSkillMetadata | skill: SkillMetadata \| ImportedSkill | boolean | タイプガード |
| formatFileSize  | bytes: number                         | string  | B/KB/MB 変換 |

---

## 8. SkillEmptyState

**パス**: `components/SkillEmptyState.tsx`
**分類**: Molecule
**テスト**: `__tests__/SkillEmptyState.test.tsx` (4テスト)

### Props

```typescript
interface SkillEmptyStateProps {
  variant: "no-skills" | "no-results"; // 表示バリアント
  keyword?: string; // 検索キーワード（no-results 時に使用）
  onClearFilter?: () => void; // フィルタクリアハンドラ
}
```

### 主要動作

- `no-skills`: 「ツールがまだありません」+ welcoming mood
- `no-results`: 「一致するツールが見つかりませんでした」+ encouraging mood
  - `keyword` 指定時: 「${keyword}に一致するツールが...」
  - `onClearFilter` 指定時: 「フィルタをクリア」ボタン表示
- 既存の `EmptyState` atom と `Button` atom を利用

---

## 9. useSkillCenter フック

**パス**: `hooks/useSkillCenter.ts`
**テスト**: `__tests__/useSkillCenter.test.ts` (10テスト)

### 引数

なし

### 戻り値

```typescript
interface UseSkillCenterReturn {
  // Store 状態
  availableSkills: SkillMetadata[];
  importedSkills: ImportedSkill[];
  isLoading: boolean;
  error: string | null;
  filter: string;
  category: string | null;

  // ローカル状態
  isDetailOpen: boolean;
  detailSkillName: string | null;
  isDeleteConfirmOpen: boolean;
  deleteTargetSkillName: string | null;
  addingSkills: Map<string, boolean>;

  // 計算値
  filteredSkills: SkillMetadata[];
  featuredSkills: SkillMetadata[];

  // ハンドラ
  handleAddSkill: (skillName: string) => Promise<void>;
  handleRemoveSkill: (skillName: string) => Promise<void>;
  handleOpenDetail: (skillName: string) => void;
  handleCloseDetail: () => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;
  handleRequestDelete: (skillName: string) => void;
  handleSetFilter: (value: string) => void;
  handleSetCategory: (categoryId: CategoryId) => void;
}
```

---

## 10. useFeaturedSkills フック

**パス**: `hooks/useFeaturedSkills.ts`
**テスト**: `__tests__/useFeaturedSkills.test.ts` (15テスト)

### 引数

```typescript
interface UseFeaturedSkillsParams {
  allSkills: SkillMetadata[]; // 利用可能な全スキルメタデータ
  importedSkillNames: string[]; // インポート済みスキル名の配列
  maxCount?: number; // 最大選定件数（デフォルト: 3）
}
```

### 戻り値

`SkillMetadata[]` -- 選定されたおすすめスキル配列（最大 maxCount 件）

### アルゴリズム

1. インポート済みスキルを除外
2. `computePopularity(skill)` でスコア計算（agents + references + indexes の合計）
3. スコア降順ソート
4. `ensureCategoryDiversity` でカテゴリ多様性確保（同カテゴリ最大2件）
5. 最大 maxCount 件を返却
