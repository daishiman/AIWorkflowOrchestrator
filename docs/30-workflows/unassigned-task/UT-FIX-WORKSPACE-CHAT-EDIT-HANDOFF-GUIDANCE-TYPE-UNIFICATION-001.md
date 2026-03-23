# UT-FIX-WORKSPACE-CHAT-EDIT-HANDOFF-GUIDANCE-TYPE-UNIFICATION-001

## メタ情報

| 項目        | 値                                                                    |
| ----------- | --------------------------------------------------------------------- |
| タスクID    | UT-FIX-WORKSPACE-CHAT-EDIT-HANDOFF-GUIDANCE-TYPE-UNIFICATION-001      |
| タスク名    | workspace-chat-edit/types の HandoffGuidance ローカル定義を正本に統一 |
| 優先度      | medium                                                                |
| 発生元      | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 Phase 10 MN-3               |
| 関連Pitfall | P23 (API二重定義の型管理複雑性)                                       |

## 目的

`apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` に残存する `HandoffGuidance` のローカル定義を `@repo/shared/types` の正本 import に置換する。

## 現状

`HandoffGuidance` が以下の2箇所で定義されている（P23 リスク）:

1. `packages/shared/src/types/handoff.ts` (正本)
2. `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` (ローカル定義)

`HandoffBlock.tsx` のローカル定義は UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 で解消済み。

## 対象ファイル

- `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` - ローカル HandoffGuidance 定義を削除し @repo/shared/types からの re-export に変更
- 影響範囲: このファイルから HandoffGuidance を import している全ファイル

## 備考

`agentSlice.ts` が `workspace-chat-edit/types` から `HandoffGuidance` を import しているため、import パスの変更が必要。
