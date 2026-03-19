# Phase 12: 未タスク検出レポート

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 12                                           |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## 検出ソース

| #   | ソース                  | 確認項目                      | 結果 |
| --- | ----------------------- | ----------------------------- | ---- |
| 1   | Phase 3 レビュー結果    | MINOR 判定の指摘事項          | 0件  |
| 2   | Phase 10 レビュー結果   | MINOR 判定の指摘事項          | 3件  |
| 3   | Phase 11 手動テスト結果 | スコープ外の発見事項          | 0件  |
| 4   | 各 Phase 成果物         | 「将来対応」「TODO」「FIXME」 | 0件  |
| 5   | コードベース            | TODO/FIXME/HACK/XXX コメント  | 0件  |

## 検出結果サマリ

| 検出件数 | 3件 |
| -------- | --- |

## 検出された未タスク一覧

### 1. UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001

| 項目   | 内容                                                                                       |
| ------ | ------------------------------------------------------------------------------------------ |
| 検出元 | Phase 10 MINOR-01 (FR-02)                                                                  |
| 優先度 | Medium                                                                                     |
| 概要   | controller 640行（目標 300行以下未達）。hook 抽出リファクタリング                          |
| 指示書 | `docs/30-workflows/unassigned-task/task-ut-refactor-workspace-chat-controller-hook-001.md` |

**P3 3ステップ完了状況**:

- [x] Step 1: 指示書作成 (`docs/30-workflows/unassigned-task/`)
- [x] Step 2: task-workflow.md 残課題テーブル登録（Task 12-2 で実施）
- [x] Step 3: 関連仕様書リンク追加（Task 12-2 で実施）

### 2. UT-INTEGRATE-COMPACT-LAYOUT-WORKSPACE-CHAT-001

| 項目   | 内容                                                                                       |
| ------ | ------------------------------------------------------------------------------------------ |
| 検出元 | Phase 10 MINOR-02 (FR-08)                                                                  |
| 優先度 | Low                                                                                        |
| 概要   | CompactLayout の WorkspaceChatPanel 統合が未完了                                           |
| 指示書 | `docs/30-workflows/unassigned-task/task-ut-integrate-compact-layout-workspace-chat-001.md` |

**P3 3ステップ完了状況**:

- [x] Step 1: 指示書作成 (`docs/30-workflows/unassigned-task/`)
- [x] Step 2: task-workflow.md 残課題テーブル登録（Task 12-2 で実施）
- [x] Step 3: 関連仕様書リンク追加（Task 12-2 で実施）

### 3. UT-INTEGRATE-ACCESS-CAPABILITY-RESOLVER-WORKSPACE-001

| 項目   | 内容                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------- |
| 検出元 | Phase 10 MINOR-03 (FR-10)                                                                         |
| 優先度 | High                                                                                              |
| 概要   | AccessCapabilityResolver 統合未完了（local 判定の代替使用）                                       |
| 依存   | Task01 (AccessCapabilityResolver 実装完了)                                                        |
| 指示書 | `docs/30-workflows/unassigned-task/task-ut-integrate-access-capability-resolver-workspace-001.md` |

**P3 3ステップ完了状況**:

- [x] Step 1: 指示書作成 (`docs/30-workflows/unassigned-task/`)
- [x] Step 2: task-workflow.md 残課題テーブル登録（Task 12-2 で実施）
- [x] Step 3: 関連仕様書リンク追加（Task 12-2 で実施）

## コードベーススキャン結果

```bash
# TODO/FIXME/HACK/XXX スキャン
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/views/WorkspaceView/*.{ts,tsx} \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/*.ts \
  apps/desktop/src/renderer/views/WorkspaceView/components/*.tsx
# 結果: 0件
```
