# Phase 4: コマンド期待値

## テスト実行コマンド

```bash
pnpm --filter @repo/desktop test:run -- \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts
```

## Red 実行時の期待ログ（実装前）

```
FAIL  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts
  ● TC-03: runOrchestrateWorkflow() が abort 済み signal で即時失敗する
    Expected: { name: "AbortError" }
    Received: resolved (no error thrown)

  ● TC-04: runCreateWorkflow() が abort 済み signal で即時失敗する
    Expected: { name: "AbortError" }
    Received: resolved (no error thrown)
```

## Green 実行時の期待ログ（実装後）

```
PASS  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts
  ✓ TC-01: cancelCurrentOperation() メソッドが public で存在すること
  ✓ TC-02: cancelCurrentOperation() を 2 回呼んでもクラッシュしないこと
  ✓ TC-03: cancelCurrentOperation() 後に currentAbortController が null になること
  ✓ TC-04: createSkill() 完了後に currentAbortController が null にリセットされること
  ✓ TC-05: createSkill() が AbortSignal を渡し cancelCurrentOperation() で中断されること
  ✓ TC-AB-03: runOrchestrateWorkflow() が abort 済み signal で即時失敗する
  ✓ TC-AB-04: runCreateWorkflow() が abort 済み signal で即時失敗する
```
