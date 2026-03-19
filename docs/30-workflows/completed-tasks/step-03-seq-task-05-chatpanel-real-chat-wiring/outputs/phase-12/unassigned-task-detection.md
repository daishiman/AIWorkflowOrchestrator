# Phase 12 Task 4: 未タスク検出レポート

## タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001

## 検出日: 2026-03-18

## 検出件数: 6件

## 検出源

| 検出源                   | 件数 |
| ------------------------ | ---- |
| Phase 7 カバレッジ       | 4件  |
| Phase 8 リファクタリング | 1件  |
| Phase 10 最終レビュー    | 1件  |

## 未タスク一覧

| #   | タスクID                  | タスク名                                      | 優先度 | 分類             | 発見元           | 指示書パス                                                                                       |
| --- | ------------------------- | --------------------------------------------- | ------ | ---------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| 1   | UT-CHATPANEL-COV-001      | ChatPanel handleNavigateToSettings テスト追加 | 低     | テスト補完       | Phase 7 GAP-1    | `docs/30-workflows/unassigned-task/task-chatpanel-function-coverage-handlenavigatetosettings.md` |
| 2   | UT-CHATPANEL-COV-002      | chatSlice streaming系アクション直接テスト追加 | 中     | テスト補完       | Phase 7/10       | `docs/30-workflows/unassigned-task/task-chatslice-streaming-actions-test.md`                     |
| 3   | UT-CHATPANEL-COV-003      | useStreamingChat 専用テストファイル作成       | 高     | テスト補完       | Phase 7 GAP-3    | `docs/30-workflows/unassigned-task/task-usestreamingchat-test-creation.md`                       |
| 4   | UT-CHATPANEL-STUB-001     | ChatPanel スタブコンポーネント本格実装        | 低     | 機能実装         | Phase 7 STUB     | `docs/30-workflows/unassigned-task/task-chatpanel-stub-components-implementation.md`             |
| 5   | UT-CHATPANEL-REFACTOR-001 | パルスカーソル表示ロジック共通化              | 低     | リファクタリング | Phase 8 8-3      | `docs/30-workflows/unassigned-task/task-streaming-pulse-cursor-commonization.md`                 |
| 6   | UT-CHATPANEL-GUARD-001    | handleSendMessage ストリーミング中ガード追加  | 低     | バグ修正         | Phase 10 MINOR-1 | `docs/30-workflows/unassigned-task/task-chatpanel-streaming-guard.md`                            |

## P3 準拠 3 ステップ完了状況

| #   | タスクID                  | Step 1: 指示書作成 | Step 2: task-workflow登録                             | Step 3: 関連仕様書リンク                                                                     |
| --- | ------------------------- | ------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | UT-CHATPANEL-COV-001      | 完了               | 完了（task-workflow-backlog.md L12-17 に6件登録済み） | 完了（ui-ux-feature-components-core.md, interfaces-llm.md 等の関連仕様書にタスクID記録済み） |
| 2   | UT-CHATPANEL-COV-002      | 完了               | 完了（task-workflow-backlog.md L12-17 に6件登録済み） | 完了（ui-ux-feature-components-core.md, interfaces-llm.md 等の関連仕様書にタスクID記録済み） |
| 3   | UT-CHATPANEL-COV-003      | 完了               | 完了（task-workflow-backlog.md L12-17 に6件登録済み） | 完了（ui-ux-feature-components-core.md, interfaces-llm.md 等の関連仕様書にタスクID記録済み） |
| 4   | UT-CHATPANEL-STUB-001     | 完了               | 完了（task-workflow-backlog.md L12-17 に6件登録済み） | 完了（ui-ux-feature-components-core.md, interfaces-llm.md 等の関連仕様書にタスクID記録済み） |
| 5   | UT-CHATPANEL-REFACTOR-001 | 完了               | 完了（task-workflow-backlog.md L12-17 に6件登録済み） | 完了（ui-ux-feature-components-core.md, interfaces-llm.md 等の関連仕様書にタスクID記録済み） |
| 6   | UT-CHATPANEL-GUARD-001    | 完了               | 完了（task-workflow-backlog.md L12-17 に6件登録済み） | 完了（ui-ux-feature-components-core.md, interfaces-llm.md 等の関連仕様書にタスクID記録済み） |

## 優先度別サマリ

| 優先度 | 件数 | タスクID                                                |
| ------ | ---- | ------------------------------------------------------- |
| 高     | 1    | UT-CHATPANEL-COV-003                                    |
| 中     | 1    | UT-CHATPANEL-COV-002                                    |
| 低     | 4    | UT-CHATPANEL-COV-001, STUB-001, REFACTOR-001, GUARD-001 |

## ステータス: completed

## ソース4: コードベース TODO/FIXME/HACK/XXX

```bash
$ grep -rn "TODO\|FIXME\|HACK\|XXX" \
  apps/desktop/src/renderer/components/chat/ \
  apps/desktop/src/renderer/hooks/useStreamingChat.ts
# → 0件
```

検出: **0件**

## 備考

- Step 2（task-workflow.md 残課題テーブル登録）と Step 3（関連仕様書リンク追加）は Phase 12 Task 2 エージェントが担当
- 全 6 件の指示書は `docs/30-workflows/unassigned-task/` に配置済み（P38/P58 準拠）
- ソース1（スコープ外）: 全項目が既存タスクに割当済みまたは変更不要、新規 0件
- ソース4（TODO/FIXME/HACK/XXX）: 0件
