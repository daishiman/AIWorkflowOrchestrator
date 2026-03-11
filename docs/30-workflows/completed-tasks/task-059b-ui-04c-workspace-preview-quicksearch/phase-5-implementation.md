# Phase 5: 実装

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 5                                              |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-A / SubAgent-B                        |

## 目的

Phase 4 の Red テストを通す最小実装で、PreviewPanel と QuickFileSearch を `WorkspaceView` へ統合する。04A の基盤契約を維持しながら 04C の機能を追加する。

## 実行タスク

- PreviewPanel実装: Source/Preview と各プレビュー表示を実装する
- QuickFileSearch実装: Cmd+P モーダルと検索 hook を実装する
- 統合実装: `WorkspaceView` への結線を実装する
- セキュリティ実装: CSP/sanitize/fallback を実装する
- IPC連携実装: `file:read` と watcher 再読込を実装する
- フォールバック実装: timeout/retry と復帰導線を実装する

## 参照資料

| 参照資料     | パス                                                                                                        | 説明            |
| ------------ | ----------------------------------------------------------------------------------------------------------- | --------------- |
| Phase 2      | `phase-2-design.md`                                                                                         | 実装設計        |
| Phase 4      | `phase-4-test-creation.md`                                                                                  | テスト拘束条件  |
| 04A 実装仕様 | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/phase-5-implementation.md` | layout 基盤契約 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 本Phaseで使う理由                    |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| UI機能仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | component 階層整合                   |
| UIデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | QuickSearch モーダル視覚仕様整合     |
| state管理          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | local state 境界維持                 |
| IPC契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | 既存 channel 再利用                  |
| IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | watch cleanup 契約維持               |
| 入力検証           | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | DOM sanitize と URL 安全化の実装整合 |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P5/P31/P39/P40 再発防止整合          |
| エラー処理         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | timeout/failure 表示統一             |

## 実行手順

### ステップ1: PreviewPanel を実装

1. `PreviewPanel.tsx` と `PreviewToolbar.tsx` を作成する
2. `SourceView.tsx` / `HtmlPreview.tsx` / `MarkdownPreview.tsx` / `StructuredPreview.tsx` / `ImagePreview.tsx` を作成する
3. `SourceView` の read-only、40px 行番号ガター、ダブルクリック Editor 導線を実装する
4. `PreviewToolbar` の Refresh/Wrap 操作を含めて fileType 判定で表示分岐を実装する

### ステップ2: QuickFileSearch を実装

1. `useQuickFileSearch.ts` を作成する
2. `QuickFileSearch.tsx` を作成する
3. Cmd+P、Arrow、Enter、Escape を実装する

### ステップ3: WorkspaceView 統合

1. 04A レイアウトの preview スロットへ PreviewPanel を接続する
2. ルートレベルで QuickFileSearch モーダルを接続する
3. `setSelectedFilePath` と QuickSearch 確定処理を接続する

### ステップ4: セキュリティ実装

1. sanitize 関数を通した HTML のみ iframe へ渡す
2. iframe へ `sandbox` と `srcdoc` を適用し、CSP（`default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; script-src 'none'; object-src 'none'; frame-src 'none'`）を満たす
3. 失敗時 fallback UI を実装する

### ステップ5: watch/timeout フォールバック実装

1. watcher 通知からの再読込は 300ms デバウンスで処理する
2. `file:read` は 5 秒 timeout + 1 秒間隔 3 回 retry 方針で実装する
3. retry 上限到達時は復帰導線付きエラー表示へ遷移する
4. preview render error を ErrorBoundary で捕捉し reset で復帰可能にする
5. iframe crash が親UIへ波及しないことを確認する

## 統合テスト連携

| 観点           | Phase 6 へ引き継ぐ内容                                  |
| -------------- | ------------------------------------------------------- |
| UI連携         | 3-pane / overlay で preview が崩れないこと              |
| IPC連携        | `file:read` と watcher 更新の再描画整合                 |
| Editor導線     | SourceView ダブルクリックで Editor 遷移導線が維持される |
| ショートカット | Cmd+P のグローバル登録と解除整合                        |
| セキュリティ   | sanitize 後描画と script 非実行                         |
| フォールバック | timeout/retry とエラー復帰導線の整合                    |

## 成果物

| 成果物           | パス                                        | 説明                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 実装計画         | `outputs/phase-5/implementation-summary.md` | 変更点要約           |
| 変更ファイル計画 | `outputs/phase-5/changed-file-plan.md`      | 実装対象ファイル一覧 |
| 契約差分メモ     | `outputs/phase-5/contract-delta.md`         | 04A/04C 接続差分     |

## 完了条件

- [ ] PreviewPanel 系コンポーネントの実装計画を定義している
- [ ] QuickFileSearch 実装計画を定義している
- [ ] WorkspaceView 統合手順を定義している
- [ ] セキュリティ実装手順を定義している
- [ ] watcher デバウンスと timeout/retry 実装手順を定義している
- [ ] read-only/行番号/Editor遷移導線の実装手順を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. PreviewPanel 実装
2. QuickFileSearch 実装
3. WorkspaceView 統合
4. セキュリティ実装
5. watch/timeout フォールバック実装
6. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-5/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
