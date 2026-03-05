# Phase 6 回帰テスト結果

## 実行コマンドと結果

1. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts`

- 結果: PASS（14/14）

2. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.delegate.test.ts src/main/ipc/__tests__/skillHandlers.execute.test.ts`

- 結果: PASS（30/30）

3. `pnpm --filter @repo/desktop exec vitest run src/preload/__tests__/skill-api.contract.test.ts src/renderer/hooks/__tests__/useSkillExecution.test.ts`

- 結果: PASS（91/91）

## 総合

- 回帰なし
- DI修正による既存契約破壊なし
