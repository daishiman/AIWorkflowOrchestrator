# UIコンポーネントパターン（Desktop Renderer）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-patterns.md](./architecture-patterns.md)

---

## Monaco Diff Editor統合パターン

### 概要

Monaco Diff Editorは`@monaco-editor/react`を使用してサイドバイサイドの差分表示を提供する。React Lazy Loadingによる遅延読み込みとアクセシビリティ対応を実装。

**実装場所**: `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffEditor.tsx`

### コンポーネント構成

| 階層 | コンポーネント | 分類 | 説明 |
|------|----------------|------|------|
| 1 | DiffPreview | organisms | モーダルコンテナ |
| 1-1 | DiffEditor | molecules | Monaco Diff表示 |
| 1-1-1 | DiffEditor (外部) | - | @monaco-editor/reactからインポート |
| 1-2 | ApplyControls | molecules | 操作ボタン群 |
| 1-2-1 | ApplyButton | atoms | 適用ボタン |
| 1-2-2 | RejectButton | atoms | 却下ボタン |

### 実装パターン

#### Lazy Loading（バンドルサイズ最適化）

**実装ファイル**: DiffEditor.tsx

**インポート**: `lazy`, `Suspense` を `react` からインポート

**遅延読み込み定義**:
- `MonacoDiffEditor` を `lazy()` で定義
- `@monaco-editor/react` から動的インポートし、`mod.DiffEditor` を default としてエクスポート

**DiffEditorコンポーネント仕様**:

| 要素 | 説明 |
|------|------|
| コンポーネント型 | `React.FC<Props>` |
| ラッパー | `Suspense` でラップ、fallbackに `LoadingSpinner` |
| 内部コンポーネント | `MonacoDiffEditor` |

**MonacoDiffEditorへ渡すProps**:

| Prop | 値 |
|------|------|
| original | Props.original |
| modified | Props.modified |
| language | Props.language（未指定時 "plaintext"） |
| height | Props.height（未指定時 "400px"） |
| theme | "vs-dark" |
| options | EDITOR_OPTIONS定数 |

#### Editor Options（推奨設定）

**定数名**: `EDITOR_OPTIONS`

**型**: `monaco.editor.IDiffEditorOptions`

| オプション | 値 | 説明 |
|------------|------|------|
| readOnly | true | 読み取り専用モード |
| renderSideBySide | true | サイドバイサイド表示 |
| minimap.enabled | false | ミニマップ非表示 |
| scrollBeyondLastLine | false | 最終行以降のスクロール無効 |
| wordWrap | "on" | 自動折り返し有効 |
| lineNumbers | "on" | 行番号表示 |
| folding | false | コード折りたたみ無効 |
| automaticLayout | true | 自動レイアウト調整 |
| scrollbar.vertical | "auto" | 縦スクロールバー自動表示 |
| scrollbar.horizontal | "auto" | 横スクロールバー自動表示 |

### Props定義

| Prop       | 型                    | 必須 | 説明                    |
| ---------- | --------------------- | ---- | ----------------------- |
| `original` | `string`              | ✅   | 変更前コード            |
| `modified` | `string`              | ✅   | 変更後コード            |
| `language` | `string \| undefined` |      | 言語（自動検出）        |
| `height`   | `string \| number`    |      | 高さ（デフォルト400px） |

### 言語自動検出パターン

**関数名**: `detectLanguage`

**シグネチャ**: `(fileName: string) => string`

**処理フロー**:
1. ファイル名を `.` で分割し、最後の要素（拡張子）を取得
2. 拡張子を小文字に変換
3. 言語マッピングテーブルから対応するMonaco言語IDを返却
4. マッチしない場合は "plaintext" を返却

**言語マッピングテーブル**:

| 拡張子 | Monaco言語ID |
|--------|--------------|
| ts | typescript |
| tsx | typescript |
| js | javascript |
| jsx | javascript |
| json | json |
| md | markdown |
| css | css |
| html | html |
| py | python |
| rs | rust |
| go | go |
| (その他) | plaintext |

### アクセシビリティ対応

| 要件               | 実装                                       |
| ------------------ | ------------------------------------------ |
| キーボード操作     | Monaco内蔵（Ctrl+G ジャンプ、Ctrl+F 検索） |
| フォーカス管理     | モーダル開閉時にフォーカストラップ         |
| スクリーンリーダー | aria-label="差分エディタ"                  |
| 色コントラスト     | vs-darkテーマ（WCAG 2.1 AA準拠）           |

### モーダル統合パターン（DiffPreview）

**実装ファイル**: DiffPreview.tsx

**インポート**: `useEffect`, `useRef` を `react` からインポート

**コンポーネント型**: `React.FC<Props>`

**Props一覧**:

| Prop | 用途 |
|------|------|
| original | 変更前コード |
| modified | 変更後コード |
| fileName | 表示ファイル名 |
| language | 言語指定 |
| resultId | 結果識別子 |
| onClose | 閉じるコールバック |
| onApplied | 適用完了コールバック |

**内部状態**:
- `dialogRef`: `useRef<HTMLDivElement>(null)` でダイアログ要素を参照

**フォーカストラップ（useEffect）**:
- Escapeキー押下時: `onClose()` を実行
- Tabキー押下時: フォーカストラップ処理
- クリーンアップ: イベントリスナー解除
- 依存配列: `[onClose]`

**レンダリング構造**:

| 要素 | 属性/Props |
|------|------------|
| ルートdiv | `ref={dialogRef}`, `role="dialog"`, `aria-modal="true"`, `aria-labelledby="diff-preview-title"`, `className="fixed inset-0 z-50 flex items-center justify-center"` |
| コンテナdiv | `className="bg-background rounded-lg shadow-lg w-full max-w-4xl"` |
| h2 | `id="diff-preview-title"`, 内容: fileName |
| 閉じるボタン | `onClick={onClose}`, `aria-label="閉じる"`, 内容: × |
| DiffEditor | `original`, `modified`, `language`, `height="60vh"` |
| ApplyControls | `resultId`, `onApplied`, `onRejected={onClose}` |

### テストパターン

**実装ファイル**: DiffEditor.test.tsx

**インポート**: `render`, `screen` を `@testing-library/react` からインポート

**モック設定**:
- `vi.mock("@monaco-editor/react")` でMonaco Editorをモック化
- モックコンポーネントは `data-testid` 属性付きのdiv要素を返却

**モックコンポーネント構造**:

| data-testid | 内容 |
|-------------|------|
| mock-diff-editor | ルートコンテナ |
| original | Props.original |
| modified | Props.modified |
| language | Props.language |

**テストケース**:

| describe | it | 検証内容 |
|----------|----|----|
| DiffEditor | renders with original and modified content | `original="before"`, `modified="after"` でレンダリングし、各要素のテキスト内容を検証 |

**検証方法**:
- `render()` でコンポーネントをレンダリング
- `screen.getByTestId()` で要素取得
- `toHaveTextContent()` でテキスト内容を検証

### 品質メトリクス

- 329テストケース全PASS（workspace-chat-edit-ui全体）
- WCAG 2.1 AA準拠
- Lazy Loading によるバンドルサイズ最適化

### 関連タスク

- **Issue #468**: workspace-chat-edit-ui（2026-01-25完了）

---

## SkillSelector コンポーネントパターン

### 概要

SkillSelectorはスキル選択用ドロップダウンコンポーネント。WAI-ARIA Listboxパターンに準拠し、キーボードナビゲーション・ダークモード対応を実装。

**実装場所**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

### コンポーネント構成

| 階層 | コンポーネント        | 分類      | 説明                           |
|------|-----------------------|-----------|--------------------------------|
| 1    | SkillSelector         | molecules | メインコンポーネント           |
| 1-1  | SkillOption           | atoms     | インポート済みスキルオプション |
| 1-2  | SkillOptionUnimported | atoms     | 未インポートスキルオプション   |

### Props/Types定義

#### SkillSelectorProps

| Prop        | 型       | 必須 | デフォルト | 説明                   |
|-------------|----------|------|------------|------------------------|
| `className` | `string` | -    | `""`       | カスタムCSSクラス追加  |

#### SkillOptionProps（内部）

| Prop           | 型                 | 必須 | 説明                     |
|----------------|--------------------|------|--------------------------|
| `name`         | `string \| null`   | ✅   | スキル名（nullで「なし」） |
| `label`        | `string`           | -    | 表示ラベル               |
| `description`  | `string`           | -    | スキル説明               |
| `agentCount`   | `number`           | -    | サブエージェント数       |
| `referenceCount`| `number`          | -    | 参照資料数               |
| `isSelected`   | `boolean`          | ✅   | 選択状態                 |
| `isFocused`    | `boolean`          | ✅   | キーボードフォーカス状態 |
| `index`        | `number`           | ✅   | オプションインデックス   |
| `onSelect`     | `() => void`       | ✅   | 選択コールバック         |

#### SkillOptionUnimportedProps（内部）

| Prop           | 型                 | 必須 | 説明                     |
|----------------|--------------------|------|--------------------------|
| `name`         | `string`           | ✅   | スキル名                 |
| `description`  | `string`           | -    | スキル説明               |
| `isSelected`   | `boolean`          | ✅   | 選択状態（常にfalse）    |
| `isFocused`    | `boolean`          | ✅   | キーボードフォーカス状態 |
| `index`        | `number`           | ✅   | オプションインデックス   |
| `onSelect`     | `() => void`       | ✅   | 選択コールバック         |

### 状態管理連携

#### useSkillStore()セレクター

`useSkillStore()` Hook 経由で skillSlice にアクセス。

| プロパティ          | 型                   | 説明                 |
|---------------------|----------------------|----------------------|
| `availableSkills`   | `SkillMetadata[]`    | 利用可能スキル一覧   |
| `importedSkills`    | `ImportedSkill[]`    | インポート済み一覧   |
| `selectedSkillName` | `string \| null`     | 選択中スキル名       |
| `isScanning`        | `boolean`            | スキャン中フラグ     |
| `selectSkill`       | `(name) => void`     | 選択アクション       |
| `rescanSkills`      | `() => Promise<void>`| 再スキャンアクション |

#### 内部状態（useState）

| 状態           | 型        | 初期値 | 説明                     |
|----------------|-----------|--------|--------------------------|
| `isOpen`       | `boolean` | false  | ドロップダウン開閉状態   |
| `focusedIndex` | `number`  | -1     | フォーカス中オプション   |

### 実装パターン

#### 計算済みデータ（useMemo）

| 変数名            | 計算内容                                | 依存配列             |
|-------------------|----------------------------------------|----------------------|
| `importedNames`   | インポート済みスキル名のSet             | `[importedSkills]`   |
| `unimportedSkills`| 利用可能だが未インポートのスキル配列    | `[availableSkills, importedNames]` |
| `allOptions`      | 全選択肢（none + imported + available） | `[importedSkills, unimportedSkills]` |

#### コールバック（useCallback）

| 関数名        | 引数                        | 責務                       |
|---------------|-----------------------------|---------------------------|
| `handleToggle`| -                           | ドロップダウン開閉         |
| `handleSelect`| `name: string \| null`      | スキル選択・閉じる         |
| `handleKeyDown`| `event: KeyboardEvent`     | キーボードナビゲーション   |
| `handleRescan`| -                           | 再スキャン実行             |

#### 外部クリック検知（useEffect）

- `mousedown`イベントリスナーを登録
- `containerRef`の外側クリックで`setIsOpen(false)`
- クリーンアップでリスナー解除

### ARIA属性パターン

| 要素             | role     | 主要属性                                              |
|------------------|----------|-------------------------------------------------------|
| トリガーボタン   | combobox | aria-expanded, aria-haspopup, aria-controls, aria-activedescendant |
| ドロップダウン   | listbox  | aria-labelledby                                       |
| 各オプション     | option   | aria-selected                                         |
| セクションヘッダー | presentation | aria-hidden="true"                              |
| スクリーンリーダーラベル | - | `<label id="skill-selector-label" className="sr-only">` |

### キーボードナビゲーション

| キー       | 動作                                       |
|------------|-------------------------------------------|
| Enter/Space | ドロップダウン開閉・オプション選択        |
| ArrowDown/Up | オプション間フォーカス移動              |
| Home/End   | 最初/最後のオプションへ移動               |
| Escape     | ドロップダウンを閉じる                    |
| Tab        | ドロップダウンを閉じてフォーカス移動      |

### スタイリングパターン

#### Tailwind CSS クラス構成

| 要素           | 基本クラス                                           | 状態クラス                     |
|----------------|-----------------------------------------------------|--------------------------------|
| トリガーボタン | `rounded-md border border-gray-300 bg-white`        | `focus:ring-2 focus:ring-blue-500` |
| ドロップダウン | `absolute z-50 mt-1 shadow-lg rounded-md`           | `max-h-60 overflow-auto`       |
| オプション     | `px-3 py-2 cursor-pointer text-sm`                  | `hover:bg-gray-50`, 選択時: `bg-blue-50` |

#### ダークモード対応

| 要素           | ライトモード        | ダークモード                |
|----------------|--------------------|-----------------------------|
| 背景           | `bg-white`         | `dark:bg-gray-800`          |
| ボーダー       | `border-gray-300`  | `dark:border-gray-600`      |
| テキスト       | `text-gray-900`    | `dark:text-gray-100`        |
| サブテキスト   | `text-gray-500`    | `dark:text-gray-400`        |

### ヘルパー関数

#### getArrayLength

**シグネチャ**: `(obj: Record<string, unknown>, key: string) => number | undefined`

**責務**: オプショナルな配列プロパティの長さを安全に取得

| 入力     | 出力                                  |
|----------|---------------------------------------|
| 配列     | `array.length`                        |
| 非配列   | `undefined`                           |

### 品質メトリクス

- 28テストケース全PASS
- Line Coverage: 100%, Branch Coverage: 93.15%, Function Coverage: 87.5%
- WAI-ARIA Listbox パターン完全準拠
- TypeScript strict: PASS, ESLint: 0エラー

### 関連タスク

- **TASK-7A**: SkillSelector実装（2026-01-30完了）

### 完了タスク

| タスクID | 内容                             | 完了日     |
|----------|----------------------------------|------------|
| TASK-7A  | SkillSelector コンポーネント実装 | 2026-01-30 |
| TASK-7D  | ChatPanel統合パターン             | 2026-01-30 |
| TASK-8B  | コンポーネントテスト（全4コンポーネント） | 2026-02-02 |

#### タスク: TASK-8B コンポーネントテスト（2026-02-02完了）

| 項目               | 内容                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| タスクID           | TASK-8B                                                                |
| 完了日             | 2026-02-02                                                             |
| ステータス         | **完了**                                                               |
| テスト数           | 280（自動） + 19（手動）                                               |
| カバレッジ         | Line 99.71%, Branch 95.85%, Function 97.61%                            |
| 対象コンポーネント | SkillSelector, SkillImportDialog, PermissionDialog, SkillStreamingView |

#### テスト結果サマリー（TASK-8B）

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 仕様定義テスト     | 55       | 55   | 0    |
| 追加テスト         | 225      | 225  | 0    |
| 手動テスト         | 19       | 19   | 0    |

#### 成果物（TASK-8B）

| 成果物             | パス                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/TASK-8B-component-tests/outputs/phase-11/manual-test-result.md`                             |
| 実装ガイド         | `docs/30-workflows/TASK-8B-component-tests/outputs/phase-12/implementation-guide.md`                           |

#### テスト品質（TASK-8B）

| テスト対象             | テスト数 | Line    | Branch  | Function |
| ---------------------- | -------- | ------- | ------- | -------- |
| PermissionDialog.tsx   | 57+19+19 | 100%    | 95.34%  | 100%     |
| SkillImportDialog.tsx  | 31       | 100%    | 100%    | 100%     |
| SkillSelector.tsx      | 28       | 100%    | 93.15%  | 87.5%    |
| SkillStreamingView.tsx | 33       | 99.31%  | 93.75%  | 100%     |
| permissionDescriptions | 34       | 97.75%  | 97.91%  | 100%     |
| toolMetadata           | 37       | 100%    | 100%    | 100%     |
| permissionHistory      | 22       | 100%    | 100%    | 100%     |

#### タスク: SkillSelector コンポーネント実装（2026-01-30完了）

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-7A                                                           |
| 完了日       | 2026-01-30                                                        |
| ステータス   | **完了**                                                          |
| テスト数     | 28（自動テスト）+ 17（手動テスト項目）                           |
| 発見課題     | 0件                                                               |
| ドキュメント | `docs/30-workflows/TASK-7A-skill-selector/`                       |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 機能テスト         | 13       | 13   | 0    |
| エラーハンドリング | 3        | 3    | 0    |
| アクセシビリティ   | 8        | 8    | 0    |
| 統合テスト連携     | 4        | 4    | 0    |

#### 成果物

| 成果物             | パス                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/TASK-7A-skill-selector/outputs/phase-11/manual-test-result.md`  |
| 実装ガイド         | `docs/30-workflows/TASK-7A-skill-selector/outputs/phase-12/implementation-guide.md`|

---

## ChatPanel統合パターン（TASK-7D）

### 概要

ChatPanelは、既存のチャット画面にスキル関連コンポーネントを統合する統括コンポーネントである。forwardRef + useImperativeHandle パターンで外部からスキルインポートを制御可能。

### コンポーネント構成

| コンポーネント       | レベル    | 統合方式             | 条件                              |
| -------------------- | --------- | -------------------- | --------------------------------- |
| SkillSelector        | organisms | 直接レンダー         | 常時表示（ヘッダー内）            |
| SkillStreamingView   | organisms | 条件付きレンダー     | `isExecuting && selectedSkillName` |
| SkillImportDialog    | organisms | ローカルstate制御    | `importDialogSkill !== null`      |
| PermissionDialog     | organisms | Store-directパターン | 常時マウント                      |

### レイアウト構成

| エリア         | data-testid         | 内容                                     |
| -------------- | ------------------- | ---------------------------------------- |
| ヘッダー       | `chat-header`       | ModelSelector slot + SkillSelector       |
| メッセージ     | `message-area`      | MessageList slot + SkillStreamingView    |
| 入力           | `input-area`        | ChatInput slot                           |
| ダイアログ     | -                   | SkillImportDialog + PermissionDialog     |

### Store接続パターン

個別セレクタパターンを採用（不要な再レンダー防止）。

| セレクタ                  | 型                               |
| ------------------------- | -------------------------------- |
| `selectedSkillName`       | `string \| null`                 |
| `streamingMessages`       | `SkillStreamMessage[]`           |
| `isExecuting`             | `boolean`                        |
| `skillExecutionStatus`    | `SkillExecutionStatus \| null`   |
| `fetchSkills`             | `() => Promise<void>`            |

### テスト品質（TASK-7D）

| テスト対象             | テスト数 | Line    | Branch  | Function |
| ---------------------- | -------- | ------- | ------- | -------- |
| ChatPanel.tsx          | 15       | 100%    | 100%    | 100%     |
| SkillStreamingView.tsx | 33       | 99.3%   | 93.75%  | 100%     |

#### 成果物

| 成果物             | パス                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/TASK-7D-chat-panel-integration/outputs/phase-12/implementation-guide-part2.md` |

---

## SkillCenterView アーキテクチャパターン（TASK-UI-05）

### 概要

SkillCenterView は、Renderer の「ツール探索・追加・詳細表示」に責務を限定した View である。
AgentView の実行責務と分離し、`agentSlice` の既存セレクタ/アクションを再利用して実装する。

### レイヤー構成

| レイヤー | 主要要素 | 役割 |
| --- | --- | --- |
| View | `SkillCenterView/index.tsx` | 画面統合、ローディング/エラー/通常状態の切替 |
| Components | `FeaturedSection`, `SkillCard`, `CategoryTabs`, `SkillDetailPanel`, `AddButton`, `SkillEmptyState` | 探索・追加・詳細表示のUI |
| Hooks | `useSkillCenter`, `useFeaturedSkills` | フィルタリング、選択状態、推奨ロジック |
| Store Bridge | `useFetchSkills`, `useImportSkill`, `useRemoveSkill` | Storeアクション経由のIPC呼び出し |

### データフロー

| 操作 | 経路 | 説明 |
| --- | --- | --- |
| 初期ロード | mount → `fetchSkills()` | 利用可能ツール/追加済みツールを同期 |
| 追加 | `AddButton` → `handleAddSkill` → `useImportSkill` | 追加中状態を保持しつつインポート実行 |
| 削除 | `SkillDetailPanel` → `handleRequestDelete` → `useRemoveSkill` | 詳細パネル起点で削除要求を実行 |
| 検索/カテゴリ | search + tabs → `filteredSkills` 再計算 | キーワードとカテゴリの複合フィルタ |

### 状態管理パターン

| 状態カテゴリ | 管理場所 | 備考 |
| --- | --- | --- |
| 永続データ | Zustand (`agentSlice`) | 既存個別セレクタを使用（P31準拠） |
| 一時UI状態 | `useState`（`useSkillCenter`） | 詳細開閉、削除対象、追加中状態 |
| 派生値 | `useMemo` | `filteredSkills` / `featuredSkills` / `detailSkill` |

### IPC境界

| チャネル | 利用経路 | 変更有無 |
| --- | --- | --- |
| `skill:list` | `useFetchSkills` | 既存再利用 |
| `skill:import` | `useImportSkill` | 既存再利用 |
| `skill:remove` | `useRemoveSkill` | 既存再利用 |

### 品質指標（TASK-UI-05）

| 指標 | 値 |
| --- | --- |
| コンポーネント実装ファイル | 7 |
| Hook実装ファイル | 2 |
| テストファイル | 9 |
| テストケース数 | 125 |
| 未解決未タスク | 6（UT-UI-05-001〜006） |

---

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 1.6.0   | 2026-03-01 | TASK-UI-05反映: SkillCenterViewアーキテクチャパターン（レイヤー構成、データフロー、状態管理、IPC境界、品質指標）を追加 |
| 1.5.0   | 2026-02-02 | TASK-8Bコンポーネントテスト完了記録・テスト品質メトリクス追加 |
| 1.4.0   | 2026-01-30 | ChatPanel統合パターン追加（TASK-7D） |
| 1.3.0   | 2026-01-30 | SkillSelector詳細実装パターン追加（Props/Types/Hooks/スタイリング） |
| 1.2.0   | 2026-01-30 | SkillSelectorコンポーネントパターン追加（TASK-7A） |
| 1.1.0   | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式/文章形式に変換 |
| 1.0.0   | 2026-01-25 | Monaco Diff Editor統合パターン追加 |

---

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [状態管理パターン](./arch-state-management.md)
- [SkillSelector実装ガイド](../../../docs/30-workflows/TASK-7A-skill-selector/outputs/phase-12/implementation-guide.md)
- [TASK-8Bコンポーネントテスト実装ガイド](../../../docs/30-workflows/TASK-8B-component-tests/outputs/phase-12/implementation-guide.md)
- [TASK-UI-05 SkillCenterView 実装ガイド](../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/implementation-guide.md)
