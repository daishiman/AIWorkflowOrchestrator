# UIコンポーネントパターン（Desktop Renderer） / detail specification

> 親仕様書: [arch-ui-components.md](arch-ui-components.md)
> 役割: detail specification

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

## Skill Advanced Views アーキテクチャパターン（TASK-UI-05B / completed）

> ステータス: **completed**（実装・テスト・導線同期完了）

TASK-UI-05B は SkillCenterView（TASK-UI-05）の拡張として、4つの高度管理ビューを定義する。各ビューは独立した organisms として実装し、SkillCenterView からナビゲーション経由でアクセスする。

### コンポーネント構成

| ビュー | Atomic Design層 | コンポーネント数 | バックエンド依存 |
| --- | --- | --- | --- |
| 3A SkillChainBuilder | organisms | 7 | TASK-9D（`skill:chain:*`） |
| 3B ScheduleManager | organisms | 8 | TASK-9G（`skill:schedule:*`） |
| 3C DebugPanel | organisms | 10 | TASK-9H（`skill:debug:*`） |
| 3D AnalyticsDashboard | organisms | 8 | TASK-9J（`skill:analytics:*`） |

### 状態管理方針

4ビューは互いに状態を共有しないため、新規 Zustand Slice は作成しない。各ビューのカスタム Hook 内で `useState` を使用し、IPC 経由でデータを取得する。既存の `agentSlice` からスキル一覧を取得する場合のみ個別セレクタを使用する（P31対策）。

| カスタムHook | 対象ビュー | 管理対象 |
| --- | --- | --- |
| useChainList / useChainEditor | 3A SkillChainBuilder | チェーン一覧・編集状態 |
| useScheduleList / useScheduleEditor | 3B ScheduleManager | スケジュール一覧・編集状態 |
| useDebugSession / useBreakpoints | 3C DebugPanel | デバッグセッション・ブレークポイント |
| useAnalyticsSummary / useUsageTrend | 3D AnalyticsDashboard | 統計サマリー・トレンドデータ |

### ファイル配置

| ディレクトリ | 対象ビュー |
| --- | --- |
| `apps/desktop/src/renderer/views/SkillChainBuilder/` | 3A |
| `apps/desktop/src/renderer/views/ScheduleManager/` | 3B |
| `apps/desktop/src/renderer/views/DebugPanel/` | 3C |
| `apps/desktop/src/renderer/views/AnalyticsDashboard/` | 3D |

### 仕様同期時の苦戦箇所（SubAgent-C）

| 苦戦箇所 | 原因 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| 構造仕様は完了だが warning が残る | `phase-12-documentation.md` の依存成果物参照不足でアーキ情報の根拠が弱かった | Phase 2/5/6/7/8/9/10 成果物参照を補完し、構造仕様の根拠を固定 | UI構造同期時は「仕様本文 + 依存成果物参照」をセットで更新する |
| 画面証跡と構造仕様の更新タイミング不一致 | 既存スクリーンショットを流用し、最新導線との差分確認が遅れる | スクリーンショットを再撮影して、構造仕様の完了判定を同日証跡で固定 | UI構造仕様の完了判定には再撮影証跡を必須化する |

### 参照

- [TASK-UI-05B ワークフロー仕様](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/index.md)
- [Phase 2 設計仕様](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/phase-2-design.md)

---

