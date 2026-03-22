# Phase 7: 統合ゲート

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 7                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 実装後に再実行すべきテストセット

| セット              | テスト一覧                 | 実行コマンド                                                                                        |
| ------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| guidance unit       | CT-01〜CT-07               | `cd apps/desktop && pnpm vitest run src/renderer/guidance/`                                         |
| GuidanceBlock       | 既存テスト + secondary CTA | `cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/components/`                   |
| surface integration | IS-01〜IS-05               | `cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/ src/renderer/views/WorkspaceView/` |
| regression          | RG-01〜RG-05, RE-01〜RE-10 | 全テスト実行                                                                                        |
| type check          | 型整合                     | `pnpm --filter @repo/desktop typecheck`                                                             |
| lint                | コード品質                 | `pnpm --filter @repo/desktop lint`                                                                  |

## 2. smoke test 最小セット

後続実装タスクで最初に実行すべき最小テストセット:

1. `blockedGuidanceConfig.test.ts` - mapping 定数の網羅性
2. `useBlockedGuidance.test.ts` - Hook の null safety
3. `guidanceActionDispatcher.test.ts` - action dispatch 完全性
