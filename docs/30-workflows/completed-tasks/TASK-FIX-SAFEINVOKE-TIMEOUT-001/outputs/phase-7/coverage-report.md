# Phase 7: カバレッジレポート

## TASK-FIX-SAFEINVOKE-TIMEOUT-001

**実行日**: 2026-03-10
**対象ファイル**: `apps/desktop/src/preload/ipc-utils.ts`
**テストファイル**: `apps/desktop/src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts`
**カバレッジプロバイダ**: v8

## カバレッジ結果

| 指標               | 計測値 | 最低基準 | 推奨基準 | 判定 |
| ------------------ | ------ | -------- | -------- | ---- |
| Line Coverage      | 100%   | 80%      | 90%      | PASS |
| Branch Coverage    | 100%   | 60%      | 70%      | PASS |
| Function Coverage  | 100%   | 80%      | 90%      | PASS |
| Statement Coverage | 100%   | -        | -        | PASS |

## 未カバー行

なし（全行カバー済み）

## 判定結果

**PASS** - 全カバレッジ指標が推奨基準を超過（100%達成）。Phase 8 へ進行可能。

## 計測コマンド

```bash
cd apps/desktop && pnpm vitest run --coverage src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts
```

## 計測出力（抜粋）

```
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
  ipc-utils.ts     |     100 |      100 |     100 |     100 |
```
