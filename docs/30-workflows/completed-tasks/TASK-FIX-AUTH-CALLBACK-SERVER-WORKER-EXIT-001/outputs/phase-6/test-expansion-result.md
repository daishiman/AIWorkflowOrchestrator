# Phase 6 テスト結果

- 実行コマンド:
  - `pnpm --filter @repo/desktop exec vitest run src/main/auth/__tests__/authCallbackServer.test.ts`
- 結果: **1 file passed / 13 tests passed**
- 補足: MSW の unhandled request 警告は発生するが失敗はなし（既存挙動）。
