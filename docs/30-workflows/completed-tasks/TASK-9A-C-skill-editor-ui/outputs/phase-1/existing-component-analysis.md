# 既存スキルコンポーネント分析

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| タスクID | TASK-9A-C                        |
| Phase    | 1 (要件定義)                     |
| Task     | 1 (既存スキルコンポーネント分析) |
| 作成日   | 2026-02-19                       |

---

## 1. SkillSelector 分析

**ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

### Props インターフェース

```typescript
export interface SkillSelectorProps {
  className?: string;
}
```

- 最小限の Props 設計（`className` のみ）
- スキルデータは Store 個別セレクタ経由で取得し、Props では渡さない

内部サブコンポーネント Props:

```typescript
interface SkillOptionProps {
  name: string | null;
  label?: string;
  description?: string;
  agentCount?: number;
  referenceCount?: number;
  isSelected: boolean;
  isFocused: boolean;
  index: number;
  onSelect: () => void;
}

interface SkillOptionUnimportedProps {
  name: string;
  description?: string;
  isSelected: boolean;
  isFocused: boolean;
  index: number;
  onSelect: () => void;
}
```

### Atomic Design 階層

- **organisms** レベル: 複数のサブコンポーネント（SkillOption, SkillOptionUnimported）を内部で合成
- ドロップダウン全体として1つの独立した機能を持つ
- サブコンポーネント（SkillOption, SkillOptionUnimported）は atoms/molecules レベルだが、ファイル内にインラインで定義されている（外部エクスポートなし）

### 状態管理パターン（Store 個別セレクタ）

使用している個別セレクタ（全6個）:

| セレクタ                       | 種別       | 取得する状態                   |
| ------------------------------ | ---------- | ------------------------------ |
| `useAvailableSkillsMetadata()` | 状態       | 利用可能なスキルメタデータ一覧 |
| `useImportedSkills()`          | 状態       | インポート済みスキル一覧       |
| `useSelectedSkillName()`       | 状態       | 選択中のスキル名               |
| `useIsScanningSkills()`        | 状態       | スキャン中フラグ               |
| `useSelectSkillByName()`       | アクション | スキル名で選択                 |
| `useRescanSkills()`            | アクション | スキル再スキャン               |

ローカル状態（`useState`）:

| 状態           | 型        | 用途                     |
| -------------- | --------- | ------------------------ |
| `isOpen`       | `boolean` | ドロップダウン開閉       |
| `focusedIndex` | `number`  | キーボードフォーカス位置 |

`useMemo` で算出:

- `importedNames`: インポート済みスキル名のSet
- `unimportedSkills`: 未インポートスキル一覧
- `allOptions`: キーボードナビゲーション用の全選択肢リスト（`{ type, name }[]`）

`useRef`:

- `containerRef`: 外部クリック検出用

### キーボードナビゲーション

`handleKeyDown` コールバック（`React.KeyboardEvent`）で以下を実装:

| キー              | 動作                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Enter` / `Space` | ドロップダウンが開いている場合: フォーカス中のアイテムを選択。閉じている場合: ドロップダウンを開く                      |
| `Escape`          | ドロップダウンを閉じる                                                                                                  |
| `ArrowDown`       | 閉じている場合: ドロップダウンを開いてインデックス0にフォーカス。開いている場合: フォーカスを下に移動（上限でクランプ） |
| `ArrowUp`         | フォーカスを上に移動（下限でクランプ）                                                                                  |
| `Home`            | 最初のアイテムにフォーカス                                                                                              |
| `End`             | 最後のアイテムにフォーカス                                                                                              |
| `Tab`             | ドロップダウンを閉じる（フォーカス移動を許可）                                                                          |

### アクセシビリティ実装

- **combobox パターン**: `role="combobox"` をトリガーボタンに設定
- **listbox**: ドロップダウンに `role="listbox"` を設定
- **option**: 各アイテムに `role="option"` と `aria-selected` を設定
- **aria-labelledby**: `skill-selector-label` で screen reader 用ラベルを関連付け
- **aria-expanded**: ドロップダウン開閉状態
- **aria-haspopup**: `"listbox"` を指定
- **aria-controls**: `"skill-listbox"` で制御対象を指定
- **aria-activedescendant**: フォーカス中のオプション ID を動的に設定
- **sr-only ラベル**: 「スキルを選択」をスクリーンリーダー用に非表示配置
- セクションヘッダーに `role="presentation"` と `aria-hidden="true"` を設定
- 再スキャンボタンに `aria-label="再スキャン"` を設定

---

## 2. SkillImportDialog 分析

**ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`

### Props インターフェース

```typescript
export interface SkillImportDialogProps {
  /** 表示するスキルのメタデータ */
  skill: SkillMetadata;
  /** ダイアログの開閉状態 */
  isOpen: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
}
```

- Props 駆動型: スキルデータ（`skill`）は親から Props で受け取る
- 開閉制御も外部（`isOpen`, `onClose`）
- `SkillMetadata` 型を `@repo/shared` からインポート

### Atomic Design 階層

- **organisms** レベル: ダイアログ全体として複合コンポーネント
- 内部サブコンポーネント:
  - `Section`（atoms レベル: 見出し + コンテンツのラッパー）
  - `ResourceList`（molecules レベル: サブリソース一覧）
- サブリソースセクション定義を `RESOURCE_SECTIONS` 定数で管理（データ駆動レンダリング）

### 状態管理パターン（Store 個別セレクタ）

**注意**: このコンポーネントは `useAppStore` インラインセレクタを使用（個別セレクタ非使用）

| セレクタ                                           | 種別       | 取得する状態           |
| -------------------------------------------------- | ---------- | ---------------------- |
| `useAppStore((state) => state.importSkill)`        | アクション | スキルインポート       |
| `useAppStore((state) => state.isImporting)`        | 状態       | インポート中フラグ     |
| `useAppStore((state) => state.importingSkillName)` | 状態       | インポート中のスキル名 |

ローカル状態:

- なし（全て Props と Store で管理）

`useRef`:

- `dialogRef`: フォーカストラップ用

### キーボードナビゲーション

| キー                | 動作                                                         |
| ------------------- | ------------------------------------------------------------ |
| `Escape`            | インポート中でなければダイアログを閉じる                     |
| `Tab` / `Shift+Tab` | フォーカストラップ: ダイアログ内のフォーカス可能要素間を循環 |

フォーカストラップ実装:

1. `isOpen` 時に `querySelectorAll` でフォーカス可能要素を検索
2. 最初の要素にフォーカスを当てる
3. Tab キーで最後→最初、Shift+Tab で最初→最後に循環

### アクセシビリティ実装

- **dialog パターン**: `role="dialog"` を設定
- **aria-modal**: `true` でモーダルダイアログであることを宣言
- **aria-labelledby**: `skill-import-dialog-title` でタイトルを関連付け
- オーバーレイに `role="presentation"` を設定
- 閉じるボタンに `aria-label="閉じる"` を設定
- インポート中はボタンを `disabled` で無効化
- **focus:ring** / **focus:outline-none**: 全ボタンにフォーカスリングを設定

---

## 3. SkillStreamingView 分析

**ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`

### Props インターフェース

```typescript
export interface SkillStreamingViewProps {
  /** 実行中のスキル名 */
  skillName: string;
  /** ストリーミングメッセージ一覧 */
  messages: SkillStreamMessage[];
  /** 実行ステータス */
  status: SkillExecutionStatus | null;
}
```

- Props 駆動型: メッセージとステータスを親から受け取る
- `SkillStreamMessage`, `SkillExecutionStatus` は `@repo/shared` からインポート

### Atomic Design 階層

- **organisms** レベル: ストリーミング表示領域全体
- 内部サブコンポーネント:
  - `StatusBadge`（atoms レベル: ステータスバッジ）
  - `StreamMessageItem`（molecules レベル: 個別メッセージ表示、型による分岐）
  - `ToolExecutionHistory`（molecules レベル: ツール実行履歴の折りたたみ）
- `STATUS_CONFIG` 定数で `Record<DisplayableStatus, { color, label }>` パターンを使用
- `React.memo` でメモ化

### 状態管理パターン（Store 個別セレクタ）

| セレクタ                               | 種別       | 取得する状態 |
| -------------------------------------- | ---------- | ------------ |
| `useAppStore((s) => s.abortExecution)` | アクション | 実行中断     |

- データは Props で受け取り、Store からはアクション（中断操作）のみ取得
- `React.memo` でパフォーマンス最適化

ローカル状態:

- なし

### キーボードナビゲーション

- 特段のキーボードナビゲーション実装なし
- 停止ボタンはデフォルトのフォーカス動作に依存

### アクセシビリティ実装

- **live region**: メッセージコンテナに `role="log"`, `aria-live="polite"`, `aria-label="スキル実行結果"` を設定
- **status badge**: `role="status"` を設定
- 停止ボタンに `aria-label="スキル実行を中止する"` を設定
- 部分メッセージカーソルに `aria-label="入力中"` を設定
- `data-testid` を各要素に設定（テスト用: `skill-streaming-view`, `status-badge`, `assistant-message`, `partial-cursor`, `tool-use-message`, `tool-result-success`, `tool-result-error`, `error-message`, `abort-button`, `message-container`, `tool-execution-history`, `skill-name`）
- `displayName` を設定（DevTools デバッグ用）

---

## 4. agentSlice スキル関連状態

**ファイルパス**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

### スキル関連の状態フィールド

#### レガシースキル状態（元の agentSlice）

| フィールド           | 型                                                        | 説明                                 |
| -------------------- | --------------------------------------------------------- | ------------------------------------ |
| `skills`             | `Skill[]`                                                 | スキル一覧（インポート済み）         |
| `availableSkills`    | `Skill[]`                                                 | 利用可能なスキル一覧（インポート用） |
| `importedSkillIds`   | `string[]`                                                | インポート済みスキルID一覧           |
| `selectedSkill`      | `Skill \| null`                                           | 選択中のスキル                       |
| `skillFilter`        | `string`                                                  | スキルフィルター文字列               |
| `skillCategory`      | `SkillCategory \| null`                                   | スキルカテゴリフィルター             |
| `isImportDialogOpen` | `boolean`                                                 | インポートダイアログ表示状態         |
| `toastMessage`       | `{ type: "success" \| "error"; message: string } \| null` | トーストメッセージ                   |

#### skillSlice から統合された状態（TASK-FIX-6-1）

| フィールド                | 型                               | 説明                                           |
| ------------------------- | -------------------------------- | ---------------------------------------------- |
| `availableSkillsMetadata` | `SkillMetadata[]`                | 利用可能なスキルメタデータ一覧（未インポート） |
| `importedSkills`          | `ImportedSkill[]`                | インポート済みスキル一覧                       |
| `selectedSkillName`       | `string \| null`                 | 選択中のスキル名（nullは未選択）               |
| `isExecuting`             | `boolean`                        | スキル実行中フラグ                             |
| `executionId`             | `string \| null`                 | 実行ID（nullは未実行）                         |
| `skillExecutionStatus`    | `SkillExecutionStatus \| null`   | スキル実行ステータス                           |
| `streamingMessages`       | `SkillStreamMessage[]`           | ストリーミングメッセージ一覧                   |
| `pendingPermission`       | `SkillPermissionRequest \| null` | 保留中の権限リクエスト                         |
| `skillError`              | `string \| null`                 | スキルエラー情報                               |
| `isLoadingSkills`         | `boolean`                        | スキル一覧読み込み中                           |
| `isScanning`              | `boolean`                        | スキャン中                                     |
| `isImporting`             | `boolean`                        | インポート中                                   |
| `importingSkillName`      | `string \| null`                 | インポート中のスキル名                         |

### スキル関連の個別セレクタ

**Store `index.ts` で定義**:

#### 状態セレクタ

| セレクタ名                   | 取得するフィールド        |
| ---------------------------- | ------------------------- |
| `useAvailableSkillsMetadata` | `availableSkillsMetadata` |
| `useImportedSkills`          | `importedSkills`          |
| `useSelectedSkillName`       | `selectedSkillName`       |
| `useIsSkillExecuting`        | `isExecuting`             |
| `useSkillExecutionId`        | `executionId`             |
| `useSkillExecutionStatus`    | `skillExecutionStatus`    |
| `useStreamingMessages`       | `streamingMessages`       |
| `usePendingSkillPermission`  | `pendingPermission`       |
| `useSkillError`              | `skillError`              |
| `useIsLoadingSkills`         | `isLoadingSkills`         |
| `useIsScanningSkills`        | `isScanning`              |
| `useIsImportingSkill`        | `isImporting`             |
| `useImportingSkillName`      | `importingSkillName`      |
| `useSkills`                  | `skills`                  |
| `useAvailableSkills`         | `availableSkills`         |
| `useImportedSkillIds`        | `importedSkillIds`        |
| `useSelectedSkill`           | `selectedSkill`           |
| `useSkillFilter`             | `skillFilter`             |
| `useSkillCategory`           | `skillCategory`           |
| `useIsImportDialogOpen`      | `isImportDialogOpen`      |
| `useToastMessage`            | `toastMessage`            |

#### アクションセレクタ

| セレクタ名                    | 対応するアクション         |
| ----------------------------- | -------------------------- |
| `useFetchSkills`              | `fetchSkills`              |
| `useRescanSkills`             | `rescanSkills`             |
| `useImportSkill`              | `importSkill`              |
| `useRemoveSkill`              | `removeSkill`              |
| `useSelectSkillByName`        | `selectSkillByName`        |
| `useExecuteSkill`             | `executeSkill`             |
| `useAbortSkillExecution`      | `abortExecution`           |
| `useRespondToSkillPermission` | `respondToSkillPermission` |
| `useClearSkillError`          | `clearSkillError`          |
| `useClearStreamingMessages`   | `clearStreamingMessages`   |
| `useSelectSkill`              | `selectSkill`              |
| `useSetSkillFilter`           | `setSkillFilter`           |
| `useSetSkillCategory`         | `setSkillCategory`         |
| `useOpenImportDialog`         | `openImportDialog`         |
| `useCloseImportDialog`        | `closeImportDialog`        |
| `useShowToast`                | `showToast`                |
| `useClearToast`               | `clearToast`               |

#### 合成 Hook（非推奨）

| Hook名            | 説明                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| `useSkillStore()` | スキル関連の状態とアクションを一括で返す（P31 無限ループのリスクあり） |

---

## 5. 型定義（ImportedSkill / SkillSubResource）

**ファイルパス**: `packages/shared/src/types/skill.ts`

### ImportedSkill 型

```typescript
export interface ImportedSkill extends SkillMetadata {
  /** インポート日時 */
  importedAt: Date;
  /** インポートステータス */
  status: "active" | "disabled";
  /** SKILL.md 本文（キャッシュ） */
  content?: string;
}
```

`SkillMetadata` を継承し、インポート固有の情報を追加:

- `importedAt`: インポート日時
- `status`: `"active"` | `"disabled"`
- `content`: SKILL.md 本文（オプション）

### SkillMetadata 型

```typescript
export interface SkillMetadata {
  name: string;
  description: string;
  allowedTools?: string[];
  path: string;
  updatedAt: Date;
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
  otherFiles: SkillOtherFile[];
}
```

### SkillSubResource 型

```typescript
export interface SkillSubResource {
  /** ファイル名 */
  filename: string;
  /** 相対パス */
  relativePath: string;
  /** 説明（ファイルから抽出、なければファイル名） */
  description?: string;
  /** ファイルサイズ（バイト） */
  size: number;
}
```

### SkillOtherFile 型

```typescript
export interface SkillOtherFile {
  /** ファイル名 */
  filename: string;
  /** ファイルタイプ */
  type: "evals" | "logs" | "package" | "other";
  /** ファイルサイズ（バイト） */
  size: number;
}
```

### 関連型（実行系）

| 型名                      | 説明                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| `SkillExecutionStatus`    | `"idle" \| "running" \| "permission_pending" \| "completed" \| "cancelled" \| "error"`                |
| `SkillStreamMessage`      | Discriminated Union（`assistant`, `tool_use`, `tool_result`, `status`, `error`）                      |
| `SkillPermissionRequest`  | 権限確認リクエスト（`executionId`, `requestId`, `toolName`, `args`, `reason?`）                       |
| `SkillPermissionResponse` | 権限確認レスポンス（`requestId`, `approved`, `rememberChoice?`, `rejectReason?`）                     |
| `SkillExecutionRequest`   | 実行リクエスト（`skillName`, `prompt`, `workingDirectory?`）                                          |
| `SkillExecutionResponse`  | 実行レスポンス（`executionId`, `success`, `error?`）                                                  |
| `Skill`                   | レガシースキル型（`id`, `name`, `slug`, `description`, `path`, `triggers`, `anchors` 等）             |
| `SkillCategory`           | `"testing" \| "design" \| "development" \| "documentation" \| "security" \| "performance" \| "other"` |

---

## 6. SkillEditor 設計への示唆

### 共通パターン

1. **ファイル構造パターン**: 全コンポーネントが以下の構造を採用
   - JSDoc コメント（`@file`, `@description`, `@feature`, `@see`）
   - `// ============================================` セパレータによるセクション分離
   - Types → Constants → Sub-components → Main Component の順序
   - `displayName` 設定

2. **状態管理パターン**: 2つのアプローチが共存
   - **個別セレクタ方式**（SkillSelector）: `useAvailableSkillsMetadata()`, `useImportedSkills()` 等の個別 Hook を使用。P31 対策として推奨
   - **インラインセレクタ方式**（SkillImportDialog, SkillStreamingView）: `useAppStore((state) => state.xxx)` を直接使用

3. **Props 設計パターン**: 2つのアプローチ
   - **Store 直接参照型**（SkillSelector）: Props 最小限、Store から直接データ取得
   - **Props 駆動型**（SkillImportDialog, SkillStreamingView）: データを Props で受け取り、Store からはアクションのみ取得

4. **キーボードナビゲーション**: `useCallback` でハンドラをメモ化し、`switch` 文で分岐

5. **サブコンポーネント**: ファイル内にインラインで定義（外部エクスポートなし）

6. **定数管理**: `STATUS_CONFIG`, `RESOURCE_SECTIONS` のように設定オブジェクトを定数として定義し、データ駆動レンダリング

### 推奨パターン（SkillEditor 設計用）

1. **状態管理**: 個別セレクタを使用する（P31 対策）。合成 Hook（`useSkillStore()`）は使用しない

2. **Props 設計**: SkillEditor は以下のハイブリッドアプローチを推奨
   - 編集対象のスキルデータは Props で受け取る（`skill: ImportedSkill`）
   - 保存・削除等のアクションは個別セレクタ経由で取得
   - コンポーネント固有の UI 状態（タブ選択、エディタ内容）は `useState` で管理

3. **アクセシビリティ**: 以下を必須実装
   - `role="dialog"` + `aria-modal="true"`（エディタがモーダル/パネルの場合）
   - `aria-labelledby` でタイトルを関連付け
   - Escape キーで閉じる
   - Tab フォーカストラップ（モーダルの場合）
   - 全操作ボタンに `aria-label`
   - `focus:ring` スタイル

4. **キーボードナビゲーション**: SkillImportDialog のフォーカストラップパターンを参考に、以下を実装
   - Escape: エディタを閉じる（未保存変更がある場合は確認）
   - Tab/Shift+Tab: フィールド間移動
   - Ctrl+S / Cmd+S: 保存ショートカット（エディタ固有）

5. **型定義**: `ImportedSkill` 型（`SkillMetadata` を継承）を基盤とし、エディタ固有の状態型を追加定義

6. **パフォーマンス**: `React.memo` をメインコンポーネントに適用（SkillStreamingView と同様）

7. **Tailwind CSS クラス**: 既存コンポーネントと一貫性を保つ
   - ボーダー: `border-gray-200` / `dark:border-gray-600`
   - 背景: `bg-white` / `dark:bg-gray-800`
   - テキスト: `text-gray-900` / `dark:text-gray-100`
   - フォーカス: `focus:outline-none focus:ring-2 focus:ring-blue-500`
   - ボタン: `rounded-lg px-4 py-2 text-sm font-medium`

8. **エラーメッセージ**: agentSlice の `SKILL_ERRORS` パターンに倣い、定数化して `formatErrorMessage` で整形

9. **data-testid**: テスト容易性のため、全主要要素に `data-testid` を付与（SkillStreamingView パターン）
