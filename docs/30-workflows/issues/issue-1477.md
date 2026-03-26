# [#1477] [UT-FIX-WORKSPACE-CHAT-EDIT-HANDOFF-GUIDANCE-TYPE-UNIFICATION-001] workspace-chat-edit/types HandoffGuidance 型統一

## メタ情報

| 項目        | 値                                                               |
| ----------- | ---------------------------------------------------------------- |
| タスクID    | UT-FIX-WORKSPACE-CHAT-EDIT-HANDOFF-GUIDANCE-TYPE-UNIFICATION-001 |
| 優先度      | medium                                                           |
| 発生元      | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 Phase 10 MN-3          |
| 関連Pitfall | P23 (API二重定義の型管理複雑性)                                  |

## 目的

`apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` に残存する `HandoffGuidance` のローカル定義を `@repo/shared/types` の正本 import に置換する。

## 現状

`HandoffGuidance` が2箇所で定義（P23 リスク）:

1. `packages/shared/src/types/handoff.ts` (正本)
2. `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` (ローカル)

`HandoffBlock.tsx` のローカル定義は #1457 で解消済み。

## 仕様書

`docs/30-workflows/unassigned-task/UT-FIX-WORKSPACE-CHAT-EDIT-HANDOFF-GUIDANCE-TYPE-UNIFICATION-001.md`
