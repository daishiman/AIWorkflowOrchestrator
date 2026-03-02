# Phase 2 設計 成果物

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | TASK-10A-A           |
| 機能名   | SkillManagementPanel |
| Phase    | 2                    |
| 完了日   | 2026-03-02           |
| 判定     | PASS                 |

## コンポーネントツリー

```
SkillManagementPanel/                          # organisms
├── index.tsx                                  # ビュー切り替えルーター
├── components/
│   ├── SkillManagementHeader.tsx              # molecules: タイトル+件数+新規作成ボタン
│   ├── SkillSearchBar.tsx                     # molecules: 検索+デバウンス(300ms)+クリア
│   ├── SkillCategoryFilter.tsx                # molecules: 8タブ(すべて+7カテゴリ)
│   ├── SkillManagementCard.tsx                # molecules: カード(名前+説明+バッジ+操作)
│   ├── SkillCardActions.tsx                   # molecules: 編集/分析/削除ボタン群
│   ├── SkillDeleteDialog.tsx                  # molecules: 削除確認ダイアログ
│   ├── SkillManagementEmpty.tsx               # molecules: 空状態UI
│   ├── SkillManagementError.tsx               # molecules: エラー状態UI
│   └── SkillManagementSkeleton.tsx            # molecules: スケルトンUI
└── hooks/
    └── useSkillManagement.ts                  # カスタムフック: フィルタリング・操作ロジック
```

## Atomic Design レベル配置

| レベル    | コンポーネント                           | 配置先                                                                        |
| --------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| atoms     | Badge, Button, StatusIndicator           | `packages/shared/ui/atoms/`（既存）                                           |
| molecules | SkillManagementHeader, SkillSearchBar 等 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel/components/` |
| organisms | SkillManagementPanel（index.tsx）        | `apps/desktop/src/renderer/components/skill/SkillManagementPanel/`            |

## 状態管理設計

### ローカル状態（useState）

| 状態変数           | 型                                             | 初期値   | 用途                         |
| ------------------ | ---------------------------------------------- | -------- | ---------------------------- |
| `currentView`      | `"list" \| "editor" \| "analysis" \| "create"` | `"list"` | 表示中ビュー                 |
| `selectedSkill`    | `ImportedSkill \| null`                        | `null`   | 操作対象スキル               |
| `searchQuery`      | `string`                                       | `""`     | 検索テキスト（デバウンス前） |
| `debouncedQuery`   | `string`                                       | `""`     | 検索テキスト（デバウンス後） |
| `selectedCategory` | `SkillCategory \| null`                        | `null`   | 選択カテゴリ（null=すべて）  |
| `deleteTarget`     | `ImportedSkill \| null`                        | `null`   | 削除対象（ダイアログ用）     |
| `isDeleting`       | `boolean`                                      | `false`  | 削除処理中フラグ             |

### Store 連携（個別セレクタ — P31 対策）

```typescript
// 状態取得
const importedSkills = useImportedSkills(); // ImportedSkill[]
const isLoadingSkills = useIsLoadingSkills(); // boolean
const skillError = useSkillError(); // string | null

// アクション取得
const fetchSkills = useFetchSkills(); // () => Promise<void>
const removeSkill = useRemoveSkill(); // (skillName: string) => Promise<void>
const showToast = useShowToast(); // (type, message) => void
```

### 派生値（useMemo）

- `filteredSkills`: importedSkills をカテゴリ + テキスト検索で AND フィルタリング
- 依存配列: `[importedSkills, selectedCategory, debouncedQuery]`

## データフロー設計サマリ

| フロー       | トリガー             | 主要処理                                                | 終了状態                 |
| ------------ | -------------------- | ------------------------------------------------------- | ------------------------ |
| 初期化       | mount                | fetchSkills() → Loading/Empty/List 表示                 | カード群 or 空状態       |
| 検索         | テキスト入力         | setSearchQuery → 300ms debounce → filteredSkills 再計算 | フィルタ結果表示         |
| 編集         | 編集ボタン押下       | setSelectedSkill + setCurrentView("editor")             | SkillEditor 表示         |
| 分析         | 分析ボタン押下       | setSelectedSkill + setCurrentView("analysis")           | SkillAnalysisView 表示   |
| 削除         | 削除ボタン押下       | 確認ダイアログ → removeSkill(skill.name) → トースト     | カード消失 or エラー通知 |
| 新規作成     | 新規作成ボタン押下   | setCurrentView("create")                                | 作成画面表示             |
| サブビュー閉 | onClose コールバック | setCurrentView("list") + setSelectedSkill(null)         | リスト表示復帰           |

## インターフェース設計サマリ

### 主要 Props 型

| コンポーネント        | 主要 Props                                                  |
| --------------------- | ----------------------------------------------------------- |
| SkillManagementPanel  | `className?: string`                                        |
| SkillManagementHeader | `skillCount: number`, `onCreateNew: () => void`             |
| SkillSearchBar        | `value: string`, `onChange: (v: string) => void`, `onClear` |
| SkillCategoryFilter   | `selectedCategory`, `onSelect: (cat) => void`               |
| SkillManagementCard   | `skill`, `onEdit`, `onAnalyze`, `onDelete`                  |
| SkillCardActions      | `skillName`, `onEdit`, `onAnalyze`, `onDelete`              |
| SkillDeleteDialog     | `skill`, `isDeleting`, `onConfirm`, `onCancel`              |
| SkillManagementError  | `message: string`, `onRetry: () => void`                    |

### useSkillManagement カスタムフック

- 戻り値: currentView, selectedSkill, searchQuery, selectedCategory, filteredSkills, deleteTarget, isDeleting, isLoadingSkills, skillError + 全操作ハンドラ
- UI とロジックの分離を実現

## スタイリング方針

- **カラー**: Apple HIG System Colors（ライト/ダーク両対応、CSS 変数使用）
- **スペーシング**: 8px グリッド（パネル p-6、カード間 gap-4、カード内 p-4）
- **角丸**: カード 12px、ボタン/検索バー 8px、ダイアログ 12px
- **影**: カード `0 1px 3px rgba(0,0,0,0.04)`、ダイアログ `0 4px 12px rgba(0,0,0,0.15)`
- **グリッド**: 3 列（≥1024px）/ 2 列（768-1023px）/ 1 列（<768px）

## アクセシビリティ設計

- 検索フィールド: `role="searchbox"`, `aria-label="ツールを検索"`
- カテゴリタブ: `role="tablist"` + `role="tab"` + `aria-selected`
- カード群: `role="list"` + `role="listitem"`
- 全操作ボタン: `aria-label="${skillName} を {編集/分析/削除}"`
- 削除ダイアログ: `role="alertdialog"`, `aria-modal="true"`, フォーカストラップ
- 動的更新: `aria-live="polite"`, `aria-atomic="true"`
- キーボード: Tab/Shift+Tab（全体）、ArrowUp/Down（カード群）、ArrowLeft/Right（タブ）、Escape（ダイアログ閉）

## data-testid 命名規則

| 要素           | data-testid                       |
| -------------- | --------------------------------- |
| パネル全体     | `skill-management-panel`          |
| 件数表示       | `skill-management-count`          |
| 新規作成ボタン | `skill-management-create-button`  |
| 検索フィールド | `skill-management-search`         |
| カテゴリタブ群 | `skill-management-category-tabs`  |
| カード（個別） | `skill-management-card-{name}`    |
| 編集ボタン     | `skill-management-edit-{name}`    |
| 分析ボタン     | `skill-management-analyze-{name}` |
| 削除ボタン     | `skill-management-delete-{name}`  |
| 削除ダイアログ | `skill-management-delete-dialog`  |
| スケルトン     | `skill-management-skeleton`       |
| エラー表示     | `skill-management-error`          |
| リトライボタン | `skill-management-retry`          |
| 空状態         | `skill-management-empty`          |

## 完了条件チェック

- [x] コンポーネントツリーが Atomic Design レベルで定義されている
- [x] 全コンポーネントの Props 型が定義されている
- [x] ローカル状態と Store 連携の境界が明確
- [x] 個別セレクタのみを使用する設計（P31 対策）
- [x] データフロー（初期化/検索/編集/分析/削除/新規作成）が全て定義されている
- [x] WAI-ARIA 属性とキーボードナビゲーションが設計されている
- [x] Apple HIG 準拠のカラー/スペーシング/角丸が定義されている
- [x] data-testid 命名規則が定義されている
- [x] エラーハンドリング方針が定義されている
