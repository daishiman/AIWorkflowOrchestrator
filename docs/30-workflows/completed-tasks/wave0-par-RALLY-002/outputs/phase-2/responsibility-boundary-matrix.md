# Phase 2 責務境界マトリクス

## RALLY-002 の責務範囲

| 責務                         | 対象                        | 含む                                                | 含まない                 |
| ---------------------------- | --------------------------- | --------------------------------------------------- | ------------------------ |
| comment semantics            | ConversationalInterview.tsx | `pendingRequest` 合成式・clear useEffect のコメント | SkillLifecyclePanel, IPC |
| clear condition verification | ConversationalInterview.tsx | requestId 変化でのクリアを targeted test で確認     | UI 描画テスト            |
| downstream handoff           | 仕様書                      | RALLY-010 以降が参照できる contract の明文化        | RALLY-010 の実装         |

## 他タスクとの境界

| タスク    | 担当ファイル                                | RALLY-002 との境界           |
| --------- | ------------------------------------------- | ---------------------------- |
| RALLY-001 | SkillLifecyclePanel.tsx                     | 完全に独立                   |
| RALLY-004 | packages/shared/src/types/skillCreator.ts   | 完全に独立                   |
| RALLY-005 | SkillLifecyclePanel.tsx, creatorHandlers.ts | 完全に独立                   |
| RALLY-010 | ConversationalInterview.tsx                 | RALLY-002 完了後に直列で実行 |
| RALLY-011 | ConversationalInterview.tsx                 | RALLY-010 完了後に直列で実行 |
| RALLY-012 | ConversationalInterview.tsx                 | RALLY-011 完了後に直列で実行 |
| RALLY-013 | ConversationalInterview.tsx                 | RALLY-012 完了後に直列で実行 |

## ファイル変更境界

RALLY-002 が変更するファイル:

- `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`（コメント追加のみ）
- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`（新規作成）
