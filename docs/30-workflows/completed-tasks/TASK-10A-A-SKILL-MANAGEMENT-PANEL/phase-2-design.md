# Phase 2: 設計

## メタ情報

| 項目     | 値                    |
| -------- | --------------------- |
| Phase    | 2                     |
| 機能名   | SkillManagementPanel  |
| タスクID | TASK-10A-A            |
| 作成日   | 2026-03-02            |
| 前Phase  | Phase 1: 要件定義     |
| 次Phase  | Phase 3: 設計レビュー |

## 目的

Phase 1 で定義した要件を実現可能なコンポーネント構造に落とし込む。SkillManagementPanel のコンポーネント設計、状態管理設計、データフロー設計、スタイリング方針、アクセシビリティ設計を策定する。

## 実行タスク

- コンポーネント設計: Atomic Designベースのコンポーネント階層を定義
- 状態管理設計: ローカル状態とStore連携の境界を設計
- データフロー設計: ユーザー操作からUI更新までの流れを設計
- インターフェース設計: Props型定義とイベントハンドラ設計
- スタイリング方針: Tailwind CSS + CSS変数 + Apple HIGカラー
- アクセシビリティ設計: WAI-ARIA属性とキーボードナビゲーション

## 参照資料

| 資料名                | パス                                                           | 説明                 |
| --------------------- | -------------------------------------------------------------- | -------------------- |
| 要件定義書            | `phase-1-requirements.md`                                      | Phase 1成果物        |
| 状態管理ルール        | `.claude/rules/03-state-management.md`                         | Zustand設計原則      |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                           | P31/P39/P40/P47      |
| SkillEditor既存実装   | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`   | Props型参照          |
| SkillSelector既存実装 | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` | 個別セレクタパターン |
| AgentView既存実装     | `apps/desktop/src/renderer/views/AgentView/index.tsx`          | 操作パターン参照     |
| 共有型定義            | `packages/shared/src/types/skill.ts`                           | ImportedSkill型参照  |

## aiworkflow-requirements 仕様抽出結果（設計Phase）

| 設計観点           | 仕様書                                                                            | 設計で固定する内容                   |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------------ |
| UIコンポーネント   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | SkillManagementPanelの責務境界と構成 |
| UI機能仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 既存Featureとの導線と責務分離        |
| UI設計原則         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | HIG/WCAGに沿った情報設計             |
| UIデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | トークン/カラー/間隔の統一           |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | Atomic Design 層分割                 |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSlice利用方針とローカル状態境界 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill関連型契約（skillName中心）     |
| IPC API契約        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | skill系invoke契約と戻り値設計        |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Renderer-Preload-Main境界制約        |
| IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | sender検証と入力境界制御             |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時の通知/復旧方針                |
| ワークフロー規約   | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`       | Phase成果物・ゲート条件の整合        |

## 実行手順

### 1. コンポーネント設計

#### 1.1 コンポーネントツリー

```
SkillManagementPanel/                          # organisms（メインパネル）
├── index.tsx                                  # ビュー切り替えルーター
├── components/
│   ├── SkillManagementHeader.tsx              # molecules: ヘッダー（タイトル+件数+新規作成ボタン）
│   ├── SkillSearchBar.tsx                     # molecules: 検索フィールド+クリアボタン
│   ├── SkillCategoryFilter.tsx                # molecules: カテゴリタブ群（横スクロール）
│   ├── SkillManagementCard.tsx                # molecules: スキルカード（名前+説明+バッジ+操作ボタン）
│   ├── SkillCardActions.tsx                   # molecules: カード内操作ボタン群（編集/分析/削除）
│   ├── SkillDeleteDialog.tsx                  # molecules: 削除確認ダイアログ
│   ├── SkillManagementEmpty.tsx               # molecules: 空状態UI
│   ├── SkillManagementError.tsx               # molecules: エラー状態UI
│   └── SkillManagementSkeleton.tsx            # molecules: スケルトンUI
└── hooks/
    └── useSkillManagement.ts                  # カスタムフック: フィルタリング・操作ロジック
```

#### 1.2 Atomic Design レベル配置

| レベル    | コンポーネント                          | 配置先                                                                        |
| --------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| atoms     | Badge, Button, StatusIndicator          | `packages/shared/ui/atoms/`（既存）                                           |
| molecules | SkillManagementHeader, SkillSearchBar等 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel/components/` |
| organisms | SkillManagementPanel（index.tsx）       | `apps/desktop/src/renderer/components/skill/SkillManagementPanel/`            |

#### 1.3 各コンポーネント責務

##### SkillManagementPanel（index.tsx）

- 責務: `currentView` に基づくビュー切り替え（list / editor / analysis / create）
- `currentView === "list"` 時にリスト表示ビューを描画
- `currentView === "editor"` 時に SkillEditor を描画
- `currentView === "analysis"` 時に SkillAnalysisView（プレースホルダー）を描画
- `currentView === "create"` 時に新規作成画面（プレースホルダー）を描画

##### SkillManagementHeader

- 責務: タイトル「管理中のツール（N件）」と「新しいツールを作成」ボタンの表示
- N の値は filteredSkills.length を使用する

##### SkillSearchBar

- 責務: 検索テキスト入力、デバウンス（300ms）、クリアボタン
- `onChange` でデバウンス済み検索クエリを親に通知
- `aria-label="ツールを検索"` を付与

##### SkillCategoryFilter

- 責務: カテゴリタブの表示と選択
- 8タブ: 「すべて」+ 7カテゴリ（testing, design, development, documentation, security, performance, other）
- `role="tablist"` と `role="tab"` を使用
- ArrowLeft/ArrowRight でタブ間移動

##### SkillManagementCard

- 責務: 単一スキルの情報表示 + 操作ボタン群
- 表示項目: スキル名（`name`）、説明文（`description` 最大2行 `line-clamp-2`）、カテゴリバッジ
- SkillCardActions を内包

##### SkillCardActions

- 責務: 編集/分析/削除の3アイコンボタンをグルーピング
- 各ボタンに `aria-label`（例: "code-review を編集", "code-review を分析", "code-review を削除"）

##### SkillDeleteDialog

- 責務: 削除確認ダイアログ（モーダル）
- `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` を使用
- フォーカストラップ: ダイアログ内の「キャンセル」と「削除」ボタン間でループ
- Escape キーでダイアログを閉じる

##### SkillManagementEmpty

- 責務: 空状態UI
- テキスト「まだツールが追加されていません」
- SkillCenterView への誘導リンク

##### SkillManagementError

- 責務: エラー状態UI
- エラーメッセージ表示 + リトライボタン

##### SkillManagementSkeleton

- 責務: 3枚のスケルトンカード表示
- カード形状のプレースホルダーにshimmerアニメーション

### 2. 状態管理設計

#### 2.1 ローカル状態（useState）

| 状態変数           | 型                                             | 初期値   | 用途                           |
| ------------------ | ---------------------------------------------- | -------- | ------------------------------ |
| `currentView`      | `"list" \| "editor" \| "analysis" \| "create"` | `"list"` | 現在表示中のビュー             |
| `selectedSkill`    | `ImportedSkill \| null`                        | `null`   | 操作対象のスキル               |
| `searchQuery`      | `string`                                       | `""`     | 検索テキスト（デバウンス前）   |
| `debouncedQuery`   | `string`                                       | `""`     | 検索テキスト（デバウンス後）   |
| `selectedCategory` | `SkillCategory \| null`                        | `null`   | 選択中カテゴリ（null=すべて）  |
| `deleteTarget`     | `ImportedSkill \| null`                        | `null`   | 削除対象スキル（ダイアログ用） |
| `isDeleting`       | `boolean`                                      | `false`  | 削除処理中フラグ               |

#### 2.2 Store連携（個別セレクタ — P31対策）

```typescript
// 状態取得（個別セレクタ）
const importedSkills = useImportedSkills(); // ImportedSkill[]
const isLoadingSkills = useIsLoadingSkills(); // boolean
const skillError = useSkillError(); // string | null

// アクション取得（個別セレクタ）
const fetchSkills = useFetchSkills(); // () => Promise<void>
const removeSkill = useRemoveSkill(); // (skillName: SkillName) => Promise<void>
const showToast = useShowToast(); // (type, message) => void
```

#### 2.3 派生値（useMemo）

```typescript
const filteredSkills = useMemo(() => {
  let result = importedSkills;

  // カテゴリフィルタ
  if (selectedCategory !== null) {
    result = result.filter((skill) => skill.category === selectedCategory);
  }

  // テキスト検索
  if (debouncedQuery.trim() !== "") {
    const lowerQuery = debouncedQuery.toLowerCase();
    result = result.filter(
      (skill) =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery),
    );
  }

  return result;
}, [importedSkills, selectedCategory, debouncedQuery]);
```

### 3. データフロー設計

#### 3.1 初期化フロー

```
mount
  → useEffect(() => { fetchSkills(); }, [fetchSkills])
  → isLoadingSkills === true → SkillManagementSkeleton 表示
  → fetchSkills 完了 → importedSkills が更新
  → importedSkills.length === 0 → SkillManagementEmpty 表示
  → importedSkills.length > 0 → SkillManagementCard 群表示
```

#### 3.2 検索フロー

```
ユーザー入力
  → setSearchQuery(value) → 即座に入力フィールドに反映
  → 300ms デバウンス → setDebouncedQuery(value)
  → filteredSkills 再計算（useMemo）
  → filteredSkills.length === 0 → 「一致するツールが見つかりません」表示
```

#### 3.3 編集操作フロー

```
編集ボタン押下
  → setSelectedSkill(skill)
  → setCurrentView("editor")
  → SkillEditor 表示（props: { skill, onClose })
  → onClose コールバック
  → setCurrentView("list")
  → setSelectedSkill(null)
```

#### 3.4 分析操作フロー

```
分析ボタン押下
  → setSelectedSkill(skill)
  → setCurrentView("analysis")
  → SkillAnalysisView 表示（プレースホルダー）
  → onClose コールバック
  → setCurrentView("list")
  → setSelectedSkill(null)
```

#### 3.5 削除操作フロー

```
削除ボタン押下
  → setDeleteTarget(skill)        # 確認ダイアログ表示
  → SkillDeleteDialog 表示
  → 「キャンセル」→ setDeleteTarget(null)
  → 「削除」→ setIsDeleting(true)
              → removeSkill(skill.name)
              → 成功 → showToast("success", `"${skill.name}" を削除しました`)
              → 失敗 → showToast("error", `削除に失敗しました: ${error}`)
              → setIsDeleting(false)
              → setDeleteTarget(null)
```

#### 3.6 新規作成フロー

```
「新しいツールを作成」ボタン押下
  → setCurrentView("create")
  → 新規作成画面表示（プレースホルダー）
  → onClose コールバック
  → setCurrentView("list")
  → fetchSkills()
```

### 4. インターフェース設計

#### 4.1 SkillManagementPanel Props

```typescript
export interface SkillManagementPanelProps {
  className?: string;
}
```

#### 4.2 SkillManagementHeader Props

```typescript
interface SkillManagementHeaderProps {
  skillCount: number;
  onCreateNew: () => void;
}
```

#### 4.3 SkillSearchBar Props

```typescript
interface SkillSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}
```

#### 4.4 SkillCategoryFilter Props

```typescript
interface SkillCategoryFilterProps {
  selectedCategory: SkillCategory | null;
  onSelect: (category: SkillCategory | null) => void;
}
```

#### 4.5 SkillManagementCard Props

```typescript
interface SkillManagementCardProps {
  skill: ImportedSkill;
  onEdit: (skill: ImportedSkill) => void;
  onAnalyze: (skill: ImportedSkill) => void;
  onDelete: (skill: ImportedSkill) => void;
}
```

#### 4.6 SkillCardActions Props

```typescript
interface SkillCardActionsProps {
  skillName: string;
  onEdit: () => void;
  onAnalyze: () => void;
  onDelete: () => void;
}
```

#### 4.7 SkillDeleteDialog Props

```typescript
interface SkillDeleteDialogProps {
  skill: ImportedSkill;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

#### 4.8 SkillManagementError Props

```typescript
interface SkillManagementErrorProps {
  message: string;
  onRetry: () => void;
}
```

#### 4.9 useSkillManagement カスタムフック

```typescript
interface UseSkillManagementReturn {
  // 状態
  currentView: "list" | "editor" | "analysis" | "create";
  selectedSkill: ImportedSkill | null;
  searchQuery: string;
  selectedCategory: SkillCategory | null;
  filteredSkills: ImportedSkill[];
  deleteTarget: ImportedSkill | null;
  isDeleting: boolean;
  isLoadingSkills: boolean;
  skillError: string | null;

  // アクション
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: SkillCategory | null) => void;
  handleEdit: (skill: ImportedSkill) => void;
  handleAnalyze: (skill: ImportedSkill) => void;
  handleDelete: (skill: ImportedSkill) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleDeleteCancel: () => void;
  handleCreateNew: () => void;
  handleCloseSubView: () => void;
  handleRetry: () => void;
}

function useSkillManagement(): UseSkillManagementReturn;
```

### 5. スタイリング方針

#### 5.1 レイアウト

```
┌──────────────────────────────────────────────┐
│ SkillManagementHeader                         │
│ 管理中のツール（N件）    [新しいツールを作成]  │
├──────────────────────────────────────────────┤
│ SkillSearchBar                                │
│ [🔍 ツールを検索...                      ×]  │
├──────────────────────────────────────────────┤
│ SkillCategoryFilter                           │
│ [すべて][testing][design][development][...]   │
├──────────────────────────────────────────────┤
│ SkillManagementCard群（グリッド）             │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│ │ スキル名    │ │ スキル名    │ │ スキル名    │ │
│ │ 説明文...   │ │ 説明文...   │ │ 説明文...   │ │
│ │ [badge]     │ │ [badge]     │ │ [badge]     │ │
│ │ [✏️][📊][🗑]│ │ [✏️][📊][🗑]│ │ [✏️][📊][🗑]│ │
│ └────────────┘ └────────────┘ └────────────┘ │
└──────────────────────────────────────────────┘
```

#### 5.2 レスポンシブブレークポイント

| ブレークポイント | グリッド列数 | カード最小幅 |
| ---------------- | ------------ | ------------ |
| ≥ 1024px         | 3列          | 280px        |
| 768px〜1023px    | 2列          | 280px        |
| < 768px          | 1列          | 100%         |

#### 5.3 カラー（Apple HIG System Colors）

| 要素           | ライトモード                      | ダークモード                      |
| -------------- | --------------------------------- | --------------------------------- |
| パネル背景     | `var(--bg-primary)` (#FFFFFF)     | `var(--bg-primary)` (#000000)     |
| カード背景     | `var(--bg-secondary)` (#F2F2F7)   | `var(--bg-secondary)` (#1C1C1E)   |
| カードホバー   | `var(--bg-tertiary)` (#E5E5EA)    | `var(--bg-tertiary)` (#2C2C2E)    |
| テキスト（主） | `var(--text-primary)` (#000000)   | `var(--text-primary)` (#FFFFFF)   |
| テキスト（副） | `var(--text-secondary)`           | `var(--text-secondary)`           |
| 削除ボタン     | `var(--status-error)` (#FF3B30)   | `var(--status-error)` (#FF453A)   |
| 新規作成ボタン | `var(--accent-primary)` (#007AFF) | `var(--accent-primary)` (#0A84FF) |
| ボーダー       | `var(--border-primary)` (#C6C6C8) | `var(--border-primary)` (#38383A) |

#### 5.4 スペーシング（8pxグリッド）

| 要素間             | 値   | Tailwindクラス |
| ------------------ | ---- | -------------- |
| パネルパディング   | 24px | `p-6`          |
| セクション間       | 16px | `space-y-4`    |
| カード間           | 16px | `gap-4`        |
| カード内パディング | 16px | `p-4`          |
| ボタン間           | 8px  | `gap-2`        |

#### 5.5 角丸・影

| 要素       | 角丸 | 影                            |
| ---------- | ---- | ----------------------------- |
| カード     | 12px | `0 1px 3px rgba(0,0,0,0.04)`  |
| ボタン     | 8px  | なし                          |
| 検索バー   | 8px  | なし（ボーダーのみ）          |
| ダイアログ | 12px | `0 4px 12px rgba(0,0,0,0.15)` |

### 6. アクセシビリティ設計

#### 6.1 WAI-ARIA属性

| コンポーネント     | role          | 主要属性                                                     |
| ------------------ | ------------- | ------------------------------------------------------------ |
| 検索フィールド     | `searchbox`   | `aria-label="ツールを検索"`                                  |
| カテゴリタブ群     | `tablist`     | 各タブに `role="tab"`, `aria-selected`                       |
| スキルカード群     | `list`        | 各カードに `role="listitem"`                                 |
| 編集ボタン         | `button`      | `aria-label="${skillName} を編集"`                           |
| 分析ボタン         | `button`      | `aria-label="${skillName} を分析"`                           |
| 削除ボタン         | `button`      | `aria-label="${skillName} を削除"`                           |
| 削除確認ダイアログ | `alertdialog` | `aria-modal="true"`, `aria-labelledby="delete-dialog-title"` |
| 検索結果通知       | なし          | `aria-live="polite"`, `aria-atomic="true"`                   |

#### 6.2 キーボードナビゲーション

| キー        | コンテキスト   | 動作                                |
| ----------- | -------------- | ----------------------------------- |
| Tab         | パネル全体     | 検索→カテゴリ→新規作成→カード群の順 |
| Shift+Tab   | パネル全体     | 逆順フォーカス移動                  |
| ArrowDown   | カード群内     | 次のカードにフォーカス移動          |
| ArrowUp     | カード群内     | 前のカードにフォーカス移動          |
| ArrowLeft   | カテゴリタブ内 | 前のタブにフォーカス移動            |
| ArrowRight  | カテゴリタブ内 | 次のタブにフォーカス移動            |
| Enter/Space | ボタン/タブ    | 押下実行                            |
| Escape      | ダイアログ内   | ダイアログを閉じる                  |

#### 6.3 フォーカス管理

| イベント         | フォーカス移動先                           |
| ---------------- | ------------------------------------------ |
| ダイアログ開く   | 「キャンセル」ボタン（安全側をデフォルト） |
| ダイアログ閉じる | 削除ボタン（トリガー要素）                 |
| エディター閉じる | 編集ボタン（トリガー要素）                 |
| 分析ビュー閉じる | 分析ボタン（トリガー要素）                 |

### 7. エラーハンドリング設計

| エラーケース              | 検出方法               | UI表示                                     | リカバリ                       |
| ------------------------- | ---------------------- | ------------------------------------------ | ------------------------------ |
| スキル一覧取得失敗        | `skillError !== null`  | SkillManagementError + エラーメッセージ    | リトライボタン → fetchSkills() |
| 削除失敗                  | removeSkill() の catch | トースト「削除に失敗しました: メッセージ」 | ユーザーが再度削除ボタンを押下 |
| SkillEditor表示中のエラー | SkillEditor内部で処理  | SkillEditorの既存エラーUI                  | SkillEditor内部のリトライ      |

### 8. テスト設計方針

#### 8.1 data-testid 命名規則

| コンポーネント       | data-testid                            |
| -------------------- | -------------------------------------- |
| パネル全体           | `skill-management-panel`               |
| ヘッダー             | `skill-management-header`              |
| 件数表示             | `skill-management-count`               |
| 新規作成ボタン       | `skill-management-create-button`       |
| 検索フィールド       | `skill-management-search`              |
| カテゴリタブ群       | `skill-management-category-tabs`       |
| カテゴリタブ（個別） | `skill-management-category-tab-{name}` |
| カード群             | `skill-management-card-list`           |
| カード（個別）       | `skill-management-card-{name}`         |
| 編集ボタン           | `skill-management-edit-{name}`         |
| 分析ボタン           | `skill-management-analyze-{name}`      |
| 削除ボタン           | `skill-management-delete-{name}`       |
| 削除ダイアログ       | `skill-management-delete-dialog`       |
| 削除確認ボタン       | `skill-management-delete-confirm`      |
| 削除キャンセルボタン | `skill-management-delete-cancel`       |
| スケルトン           | `skill-management-skeleton`            |
| エラー表示           | `skill-management-error`               |
| リトライボタン       | `skill-management-retry`               |
| 空状態               | `skill-management-empty`               |

#### 8.2 テスト環境制約

| 制約    | 対策                                                               |
| ------- | ------------------------------------------------------------------ |
| P39対策 | `fireEvent` を使用し `userEvent` は使用しない                      |
| P40対策 | `cd apps/desktop && pnpm vitest run` でテスト実行                  |
| P47対策 | `variantStyles` を Record で export し、テスト側で import して検証 |
| P31対策 | Zustand個別セレクタのモックは `vi.mock` でモジュールレベルで定義   |

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物   | 配置先                            |
| -------- | --------------------------------- |
| 本設計書 | `phase-2-design.md`（本ファイル） |

## 完了条件

- [ ] コンポーネントツリーがAtomic Designレベルで定義されている
- [ ] 全コンポーネントのProps型が定義されている
- [ ] ローカル状態とStore連携の境界が明確
- [ ] 個別セレクタのみを使用する設計（P31対策）
- [ ] データフロー（初期化/検索/編集/分析/削除/新規作成）が全て定義されている
- [ ] WAI-ARIA属性とキーボードナビゲーションが設計されている
- [ ] Apple HIG準拠のカラー/スペーシング/角丸が定義されている
- [ ] data-testid命名規則が定義されている
- [ ] エラーハンドリング方針が定義されている

## 次Phase

Phase 3: 設計レビュー → `phase-3-design-review.md`
