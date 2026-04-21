# 検証導線

## タスクID: TASK-SW-CANCEL-004

## IPC E2E 確認順序（トップダウン）

| Step   | 対象                     | 確認内容                                                                    | 判定    |
| ------ | ------------------------ | --------------------------------------------------------------------------- | ------- |
| Step 1 | `useCancelGeneration.ts` | `cancelGeneration()` に `skillCreatorAPI?.cancelGeneration?.()` があるか    | ✅ PASS |
| Step 2 | `preload/channels.ts`    | `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` にあるか                | ✅ PASS |
| Step 3 | `preload/index.ts`       | `skillCreatorAPI` が `contextBridge.exposeInMainWorld` で公開されているか   | ✅ PASS |
| Step 4 | `SkillCreateWizard.tsx`  | キャンセルボタン onClick が `handleCancelGeneration` にバインドされているか | ✅ PASS |
| Step 5 | `SkillCreateWizard.tsx`  | `startGeneration()` が呼ばれ AbortSignal が consumer に渡されているか       | ❌ FAIL |

## Phase 5 修正後の検証導線（目標状態）

| Step   | 対象                    | 確認内容                                                 | 目標    |
| ------ | ----------------------- | -------------------------------------------------------- | ------- |
| Step 5 | `SkillCreateWizard.tsx` | `handleGenerate()` 冒頭で `startGeneration()` が呼ばれる | ✅ PASS |

## コマンド確認

```bash
# targeted test
pnpm --filter @repo/desktop test -- useCancelGeneration

# E2E test（Phase 4 で作成後）
pnpm --filter @repo/desktop test -- useCancelGeneration.e2e

# typecheck
pnpm --filter @repo/desktop typecheck
```
