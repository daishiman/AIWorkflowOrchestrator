# 依存整合マトリクス

## 変更による影響範囲

| 影響先           | 影響の種類 | 影響内容                                    | 対処     |
| ---------------- | ---------- | ------------------------------------------- | -------- |
| `handleUndo()`   | なし       | コメント追加のみ、ロジック不変              | 対処不要 |
| `submitAnswer()` | なし       | コメント追加のみ、ロジック不変              | 対処不要 |
| 既存テスト       | なし       | 動作変更なし、既存テストはそのまま通過      | 対処不要 |
| RALLY-010 以降   | なし       | ConversationalInterview.tsx の API 変更なし | 対処不要 |

## pendingRequest状態遷移の整合性確認

```
初期状態:
  restoredPendingRequest = null
  workflowSnapshot.awaitingUserInput = req1

→ pendingRequest = req1（通常フロー）

undo操作後:
  restoredPendingRequest = prevReq（handleUndo でセット）
  workflowSnapshot.awaitingUserInput = req2（変わらない）

→ pendingRequest = prevReq（restoredPendingRequest優先）

サーバーからreq3が届いた後:
  useEffect実行（requestId: req2.id → req3.id）
  restoredPendingRequest = null（クリア）
  workflowSnapshot.awaitingUserInput = req3

→ pendingRequest = req3（通常フローに復帰）
```

## Wave 1整合性

| タスク                | 対象ファイル                | 依存状況                  |
| --------------------- | --------------------------- | ------------------------- |
| RALLY-002（本タスク） | ConversationalInterview.tsx | コメント追加のみ          |
| RALLY-010             | ConversationalInterview.tsx | RALLY-002完了後に直列実行 |
| RALLY-011〜013        | ConversationalInterview.tsx | RALLY-010完了後に直列実行 |

本タスクの変更（コメントのみ）は後続タスクのコード変更と衝突しない。
