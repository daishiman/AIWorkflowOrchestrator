# [#1937] [TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001] executeAsync() adapter エラーの onWorkflowStateSnapshot 伝搬統一

## メタ情報

```yaml
issue_number: 1937
title: [TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001] executeAsync() adapter エラーの onWorkflowStateSnapshot 伝搬統一
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-04-06
updated_date: 2026-04-06
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1937
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

`executeAsync()` が adapter エラー（`llm_adapter_unavailable` 等）を返した際、`onWorkflowStateSnapshot` コールバックへのエラーメッセージ伝搬の通知文言が未定義のまま残っている。`execute()` 同期フローと `executeAsync()` 非同期フローの通知体験を統一する。

## 背景

- 親タスク: TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001（Issue #1896、Phase 12 MINOR 指摘）
- `execute()` / `improve()` 単体ガードおよび `verifyAndImproveLoop()` の adapter エラー通知は整備済み
- `executeAsync()` 経由の非同期フローでの `onWorkflowStateSnapshot` を通じたエラー伝搬が formalize されていない

## 受入基準

| ID   | 基準                                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `executeAsync()` で adapter エラーが発生した場合、`onWorkflowStateSnapshot` が `errorCode` を含むスナップショットで呼び出される |
| AC-2 | スナップショット内の `errorMessage` 文言が `execute()` 単体ガードの通知文言と同水準である                                       |
| AC-3 | `executeAsync()` の通常フロー（成功ケース）に影響がない                                                                         |
| AC-4 | 既存の `executeAsync()` テストがリグレッションなし                                                                              |

## 仕様書

`docs/30-workflows/unassigned-task/TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001.md`

## 優先度・見積もり

- **優先度**: Low
- **規模**: Medium（型定義変更 + 実装変更 + テスト）
- **種別**: 改善（feature/design）
- **注意**: Phase 1 で `WorkflowStateSnapshot` 型定義ファイルの特定が必要
