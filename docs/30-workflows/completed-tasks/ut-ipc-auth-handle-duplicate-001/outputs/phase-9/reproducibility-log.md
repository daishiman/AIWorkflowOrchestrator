# Phase 9 再現ログ

## Run #1

- コマンド:
  `vitest run src/main/ipc/authHandlers.test.ts src/main/ipc/__tests__/ipc-double-registration.test.ts`
- 結果:
  2 files PASS / 62 tests PASS

## Run #2

- コマンド:
  `vitest run src/main/ipc/authHandlers.test.ts src/main/ipc/__tests__/ipc-double-registration.test.ts`
- 結果:
  2 files PASS / 62 tests PASS

## 再現性判定

- 同一コマンド・同一結果を確認
- 再現性: PASS
