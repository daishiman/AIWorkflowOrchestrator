# Phase 11 Manual Test Checklist

## 対象

- `RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts`
- `RuntimeSkillCreatorFacade.test.ts`
- `RuntimeSkillCreatorFacade.executeAsync.test.ts`
- `outputs/phase-11/manual-test-record.md`

## NON_VISUAL 判定

- UI コンポーネントの変更はない
- 変更対象は `RuntimeSkillCreatorFacade.executeAsync()` の内部ロジックのみ
- 画面証跡は不要

## 実施項目

- [x] TC-01: `success:true` → `phase = complete`
- [x] TC-02: `success:false`（error なし）→ `phase = error`
- [x] TC-03: `ExecuteErrorResponse` → `error.message` 伝搬
- [x] TC-04: `terminal_handoff` → `phase = complete`
- [x] TC-05: 型レベル exhaustive check を `it.todo()` で維持
- [x] TC-06: `error.message` が `onWorkflowStateSnapshot` に渡る
- [x] TC-07: `error` フィールドなし → fallback
- [x] TC-08: `terminal_handoff` を `success` と誤判定しない
- [x] TC-09: `error: undefined` → fallback

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts

pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts

pnpm --filter @repo/desktop typecheck
pnpm exec eslint \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts
```
