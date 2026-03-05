# Phase 7 カバレッジ計画

## 計測対象

- `src/main/ipc/authKeyHandlers.ts`
- `src/main/ipc/__tests__/authKeyHandlers.test.ts`
- `src/main/ipc/__tests__/ipc-double-registration.test.ts`

## 計測コマンド

- 実行コマンド（対象限定）:
  - `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts src/main/ipc/__tests__/authKeyHandlers.test.ts --coverage --coverage.thresholds.lines=0 --coverage.thresholds.functions=0 --coverage.thresholds.branches=0 --coverage.thresholds.statements=0 --coverage.reporter=json-summary --coverage.reportsDirectory=coverage-authkey-target`

## 計測結果（主要）

- `authKeyHandlers.ts`
  - Lines: **85.95%**
  - Statements: **85.95%**
  - Functions: **100%**
  - Branches: **85.71%**

## 補足

- `src/main/ipc/index.ts` は `vitest.config.ts` の `coverage.exclude` に `**/index.ts` が含まれるためカバレッジ対象外。
