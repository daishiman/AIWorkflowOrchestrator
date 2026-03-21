# Phase 1 受入条件一覧

## AC-1 Public IPC / Preload / Shared Contract

- `SKILL_CREATOR_PLAN` / `SKILL_CREATOR_EXECUTE_PLAN` / `SKILL_CREATOR_IMPROVE_SKILL` が定義されている
- `ALLOWED_INVOKE_CHANNELS` に 3 チャンネルが含まれている
- `planSkill` / `executePlan` / `improveSkillWithFeedback` が preload API に存在する
- runtime shared contract が `packages/shared/src/types/skillCreator.ts` に定義されている

## AC-2 Main Registration / DI

- `registerSkillCreatorHandlers(..., runtimeSkillCreatorService?)` が public entrypoint として機能する
- `ipc/index.ts` で `RuntimeSkillCreatorFacade` を組み立てられる
- runtime service 不在時も fixed failure message を返す

## AC-3 Security / Error Contract

- `validateIpcSender` が runtime public 3 ハンドラ全てに適用されている
- P42 準拠の 3 段バリデーションが適用されている
- `sanitizeErrorMessage` を通した error envelope を返す
- internal role 名を public payload に露出しない

## AC-4 Runtime Behavior

- `plan` / `improve` が `integrated_api` / `terminal_handoff` を維持する
- `api-key` mode で `apiKey` 未指定時は service fallback を使う
- `execute` が安定した success / error envelope を返す

## AC-5 Verification / Spec Sync

- runtime public handler / preload / integration tests が存在する
- `pnpm --filter @repo/desktop typecheck` が PASS する
- workflow 仕様書と aiworkflow 正本に drift が残っていない
