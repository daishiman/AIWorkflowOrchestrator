# [#479] "[UT-WCE-001] Workspace Chat Edit UI Components"

## メタ情報

```yaml
task_id: UT-WCE-001
task_name: Workspace Chat Edit UI Components
category: 実装
target_feature: ワークスペースチャット編集機能
priority: 高
scale: 中〜大規模
status: 未実施
source_phase: Phase 11（ISSUE-001）
created_date: 2026-01-23
dependencies: なし（コアロジック実装済み）
spec_path: docs/30-workflows/unassigned-task/task-workspace-chat-edit-ui-components.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | 高         |
| 規模       | 中〜大規模 |
| ステータス | 未実施     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workspace-chat-edit機能のコアロジック（Renderer側）がPhase 1-12で実装完了した。Zustand Slice、Hooks、型定義が整備されており、UIコンポーネントを実装することで機能が利用可能になる。

### 1.2 問題点・課題

- ファイルコンテキストを表示・操作するUIが未実装
- 差分プレビュー機能が未実装
- 適用/却下ボタンが未実装
- ドラッグ&ドロップによるファイル添付が未実装

### 1.3 放置した場合の影響

- workspace-chat-edit機能がユーザーに提供できない
- AIによるコード編集支援機能が利用できない
- 既存チャット機能との差別化ができない

---

## 2. 何を達成するか（What）

### 2.1 目的

実装済みのchatEditSlice、useFileContext、useDiffApplyを活用し、UIコンポーネントを実装する。

### 2.2 最終ゴール

- DiffPreview.tsx - 差分プレビューパネル（Monaco Diff Editor統合）
- DiffEditor.tsx - Monaco Diff Editor統合コンポーネント
- ApplyControls.tsx - 適用/却下ボタン
- FileContextBadge.tsx - 添付ファイルバッジ
- FileContextDropZone.tsx - D&Dドロップゾーン
- EditCommandInput.tsx - 編集コマンド入力UI

### 2.3 スコープ

#### 含むもの

- 6種類のUIコンポーネント実装
- useFileContext、useDiffApplyとの統合
- Tailwind CSSによるスタイリング
- ローディング・エラー状態のハンドリング
- アクセシビリティ対応（WCAG 2.1 AA）
- ユニットテスト

#### 含まないもの

- Main Processサービス実装（別タスク）
- IPCハンドラ実装（別タスク）
- 部分適用機能（FR-011、将来タスク）

### 2.4 成果物

| 成果物                  | 配置先                                                                         |
| ----------------------- | ------------------------------------------------------------------------------ |
| DiffPreview.tsx         | `apps/desktop/src/renderer/features/workspace-chat-edit/components/`           |
| DiffEditor.tsx          | `apps/desktop/src/renderer/features/workspace-chat-edit/components/`           |
| ApplyControls.tsx       | `apps/desktop/src/renderer/features/workspace-chat-edit/components/`           |
| FileContextBadge.tsx    | `apps/desktop/src/renderer/features/workspace-chat-edit/components/`           |
| FileContextDropZone.tsx | `apps/desktop/src/renderer/features/workspace-chat-edit/components/`           |
| EditCommandInput.tsx    | `apps/desktop/src/renderer/features/workspace-chat-edit/components/`           |
| コンポーネントテスト    | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- workspace-chat-editコアロジックが実装済み
- chatEditSliceが利用可能
- useFileContext hookが利用可能
- useDiffApply hookが利用可能

### 3.2 依存タスク

| タスク                      | ステータス | 必要性 |
| --------------------------- | ---------- | ------ |
| workspace-chat-edit（コア） | 完了       | 必須   |

### 3.3 必要な知識

- React（Hooks, Context）
- TypeScript
- Tailwind CSS
- Monaco Editor（Diff Editor）
- React DnD（ドラッグ&ドロップ）
- アクセシビリティ（ARIA）

### 3.4 推奨アプローチ

1. 小さいコンポーネントから実装（FileContextBadge → ApplyControls）
2. ドロップゾーン実装（FileContextDropZone）
3. 差分プレビュー実装（DiffPreview + DiffEditor）
4. 編集コマンド入力実装（EditCommandInput）
5. 統合テスト

---

## 4. 実行手順

### Phase構成

| Phase | 名称               | 概要                             |
| ----- | ------------------ | -------------------------------- |
| 1     | 基本コンポーネント | FileContextBadge, ApplyControls  |
| 2     | ドロップゾーン     | FileContextDropZone              |
| 3     | 差分プレビュー     | DiffPreview, DiffEditor          |
| 4     | コマンド入力       | EditCommandInput                 |
| 5     | 統合・テスト       | 統合テスト・アクセシビリティ検証 |

---

### Phase 1: 基本コンポーネント

#### 目的

シンプルなコンポーネント（FileContextBadge, ApplyControls）を実装する。

#### 手順

1. FileContextBadge実装:

   ```tsx
   export function FileContextBadge({
     context,
     onRemove,
   }: FileContextBadgeProps) {
     const { removeFileContext } = useFileContext();

     return (
       <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
         <span className="text-sm">{context.fileName}</span>
         <button
           aria-label={`${context.fileName}を削除`}
           onClick={() => removeFileContext(context.id)}
         >
           <XIcon className="w-4 h-4" />
         </button>
       </div>
     );
   }
   ```

2. ApplyControls実装:

   ```tsx
   export function ApplyControls({
     resultId,
     onApplied,
     onRejected,
   }: ApplyControlsProps) {
     const { approveResult, rejectResult, isLoading } = useDiffApply();

     return (
       <div className="flex gap-2">
         <button
           disabled={isLoading}
           onClick={() => approveResult(resultId)}
           aria-label="変更を適用"
         >
           適用
         </button>
         <button
           disabled={isLoading}
           onClick={() => rejectResult(resultId)}
           aria-label="変更を却下"
         >
           却下
         </button>
       </div>
     );
   }
   ```

#### 成果物

- FileContextBadge.tsx + テスト
- ApplyControls.tsx + テスト

#### 完了条件

- コンポーネントが動作する
- テストがパスする
- アクセシビリティ属性が設定されている

---

### Phase 2: ドロップゾーン

#### 目的

ドラッグ&ドロップでファイルを添付できるUIを実装する。

#### 手順

1. FileContextDropZone実装（React DnD使用）
2. ドラッグ状態のビジュアルフィードバック
3. ファイルバリデーション（サイズ、数制限）

#### 成果物

- FileContextDropZone.tsx + テスト

#### 完了条件

- ファイルをD&Dで添付できる
- 制限超過時にエラー表示

---

### Phase 3: 差分プレビュー

#### 目的

Monaco Diff Editorを使用した差分プレビューを実装する。

#### 手順

1. DiffEditor実装（Monaco Diff Editor）
2. DiffPreview実装（パネルUI）
3. 行番号、シンタックスハイライト対応

#### 成果物

- DiffEditor.tsx + テスト
- DiffPreview.tsx + テスト

#### 完了条件

- 差分が視覚的に表示される
- 言語別シンタックスハイライト

---

### Phase 4: コマンド入力

#### 目的

編集コマンド入力UIを実装する。

#### 手順

1. EditCommandInput実装
2. コマンドタイプ選択（continue, refactor, generate-test, add-comment, custom）
3. カスタム指示入力フィールド

#### 成果物

- EditCommandInput.tsx + テスト

#### 完了条件

- コマンドタイプを選択できる
- カスタム指示を入力できる

---

### Phase 5: 統合・テスト

#### 目的

全コンポーネントの統合とアクセシビリティ検証を行う。

#### 手順

1. 統合テスト実行
2. アクセシビリティ検証（WCAG 2.1 AA）
3. キーボードナビゲーションテスト

#### 成果物

- 統合テスト
- アクセシビリティレポート

#### 完了条件

- Line Coverage ≥ 80%
- 全テストパス
- アクセシビリティ要件充足

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] FileContextBadgeが実装されている
- [ ] ApplyControlsが実装されている
- [ ] FileContextDropZoneが実装されている
- [ ] DiffPreviewが実装されている
- [ ] DiffEditorが実装されている
- [ ] EditCommandInputが実装されている

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### アクセシビリティ要件

- [ ] 全てのインタラクティブ要素にaria-labelがある
- [ ] キーボード操作が可能
- [ ] フォーカス管理が適切

---

## 6. 検証方法

### テストケース

| #   | テストケース             | 期待結果                     |
| --- | ------------------------ | ---------------------------- |
| 1   | ファイルバッジ表示       | ファイル名が表示される       |
| 2   | ファイルバッジ削除       | コンテキストが削除される     |
| 3   | ドロップゾーンD&D        | ファイルが添付される         |
| 4   | サイズ制限エラー         | エラーメッセージが表示される |
| 5   | 差分プレビュー表示       | 差分が視覚的に表示される     |
| 6   | 適用ボタン               | 変更が適用される             |
| 7   | 却下ボタン               | 変更が却下される             |
| 8   | コマンド選択             | コマンドタイプが選択できる   |
| 9   | キーボードナビゲーション | キーボードで操作できる       |

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                   |
| ------------------------- | ------ | -------- | ---------------------- |
| Monaco Editor統合の複雑さ | 中     | 中       | 既存実装パターンを参照 |
| D&Dライブラリ選定         | 中     | 低       | React DnD採用          |
| パフォーマンス問題        | 中     | 中       | 大きなファイルのmemo化 |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容                                       |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------------ |
| UI/UXコンポーネント     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計原則、アクセシビリティ   |
| アーキテクチャパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | chatEditSlice、Zustand Sliceパターン       |
| インターフェース（LLM） | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | FileContext、EditCommand型定義             |
| APIエンドポイント       | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | chat-edit IPC チャネル仕様                 |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ目標、アクセシビリティ基準 |

### 関連ドキュメント

| ドキュメント   | パス                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| 実装ガイド     | `docs/30-workflows/workspace-chat-edit/outputs/phase-12/implementation-guide.md` |
| 設計書         | `docs/30-workflows/workspace-chat-edit/outputs/phase-2/architecture-design.md`   |
| ドメインモデル | `docs/30-workflows/workspace-chat-edit/outputs/phase-2/domain-model.md`          |
| IPC API設計    | `docs/30-workflows/workspace-chat-edit/outputs/phase-2/ipc-api-design.md`        |

### 既存実装参照

| 実装           | パス                                                            |
| -------------- | --------------------------------------------------------------- |
| chatEditSlice  | `apps/desktop/src/renderer/features/workspace-chat-edit/store/` |
| useFileContext | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/` |
| useDiffApply   | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/` |
| 型定義         | `apps/desktop/src/renderer/features/workspace-chat-edit/types/` |

---

## 9. 備考

### 補足事項

- 本タスクはworkspace-chat-edit機能のUI部分を担当
- Main Processサービスは別タスク（UT-WCE-002）で対応
- 部分適用機能（FR-011）は将来タスクとして切り出し済み

---

**作成日**: 2026-01-23
**作成者**: Claude Code
**バージョン**: 1.0
