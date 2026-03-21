# skill feedback report: UT-SLIDE-UI-001

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | UT-SLIDE-UI-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 更新日   | 2026-03-21                   |

## テンプレート改善点

### 改善点 1: shared 型を正本として再照合する手順を明文化する

**観察内容**: `api-ipc-system-core.md` では `SyncStatus` が `idle` 系のまま残っていたが、実コードは `out-of-sync` を使っていた。実装者が shared 型ではなく過去の設計文書を参照すると、このズレを再生産しやすい。

**改善提案**: Phase 12 の system spec 更新で union 型を扱うときは、`packages/shared/src/...` の型定義を必ず一次ソースとして照合する手順を `spec-update-workflow.md` に追加する。

### 改善点 2: Phase 12 に「解消済み / pending」分離ルールを追加する

**観察内容**: 未タスク検出で「既に branch で直った項目」と「本当に残っている項目」が混ざると、Phase 12 文書がすぐ stale になる。

**改善提案**: `unassigned-task-detection.md` テンプレートに `pending` と `resolved in current branch` の2区分を固定する。

### 改善点 3: Phase 11 視覚検証に「button label truthfulness」チェックを追加する

**観察内容**: `TerminalLauncher` のラベルは「ターミナルを開く」だが、current branch ではネイティブ terminal IPC がなく copy fallback で動いていた。画面だけ見ると見逃しやすい。

**改善提案**: `manual-test-checklist.md` テンプレートに「ラベルどおりの副作用が起きるか」を確認する項目を追加する。

## ワークフロー改善点

### 改善点 4: UI follow-up 完了時の canonical 同期先を固定する

**観察内容**: `UT-SLIDE-UI-001` のような follow-up 実装では、current workflow だけ更新しても `.claude` 正本と task 台帳が stale のまま残る。

**改善提案**: UI follow-up の Phase 12 では少なくとも次の同期先を固定する。

1. `ui-ux-feature-components-details.md`
2. `task-workflow-completed.md`
3. `workflow-ai-runtime-authmode-unification.md`
4. 必要なら `arch-state-management-advanced.md` / `api-ipc-system-core.md`

## スクリプト改善点

今回は `validate-phase11-screenshot-coverage.js`、`validate-phase12-implementation-guide.js`、`verify-unassigned-links.js` 自体の不具合は見つからなかった。改善対象はスクリプト本体ではなく、入力文書に何を必須とするかの運用ルール側だった。

## まとめ

| 改善点                         | 優先度 | 対象                                        |
| ------------------------------ | ------ | ------------------------------------------- |
| shared 型の一次ソース照合      | 中     | `spec-update-workflow.md`                   |
| pending / resolved 分離        | 中     | `unassigned-task-detection.md` テンプレート |
| button label truthfulness 監査 | 中     | Phase 11 checklist テンプレート             |
| canonical 同期先固定           | 高     | Phase 12 ワークフロー全体                   |
