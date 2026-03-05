# Phase 4 Red結果

## 実行結果

- 実行日時: 2026-03-05
- コマンド: `pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/ipc-double-registration.test.ts`
- 結果: **FAIL（2件）**

## 失敗ケース

1. `registerAllIpcHandlers が registerAuthKeyHandlers を呼び出す`

- 期待: called 1 times
- 実際: called 0 times

2. `unregisterAllIpcHandlers が unregisterAuthKeyHandlers を呼び出す`

- 期待: called 1 times
- 実際: called 0 times

## 抜粋ログ

```text
FAIL ... registerAllIpcHandlers が registerAuthKeyHandlers を呼び出す
AssertionError: expected "spy" to be called 1 times, but got 0 times

FAIL ... unregisterAllIpcHandlers が unregisterAuthKeyHandlers を呼び出す
AssertionError: expected "spy" to be called 1 times, but got 0 times
```

## 補足

- 初回実行時に `@rollup/rollup-darwin-x64` 欠落が発生したため `pnpm install` で依存を再解決し、テスト実行可能化を完了。
