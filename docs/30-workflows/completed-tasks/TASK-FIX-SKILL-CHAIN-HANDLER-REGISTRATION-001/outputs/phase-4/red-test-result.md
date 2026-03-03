# Phase 4: Red テスト結果

## 実行日時

2026-03-03

## 実行コマンド

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts
```

## テスト結果: Red (1 failed / 10 passed)

### 失敗テスト

```
FAIL  src/main/ipc/__tests__/ipc-double-registration.test.ts
  > IPC Handler Double Registration Prevention
    > skill:chain handlers registration
      > registerAllIpcHandlers が registerSkillChainHandlers を呼び出す

AssertionError: expected "spy" to be called 1 times, but got 0 times
```

### 失敗の原因

`registerAllIpcHandlers()` 内で `registerSkillChainHandlers()` が呼び出されていないため、
モック spy の呼び出し回数が 0 となり、期待値の 1 と不一致。

### 既存テスト（全 PASS）

- unregisterAllIpcHandlers() > 全チャンネルに対して ipcMain.removeHandler() を呼び出す
- unregisterAllIpcHandlers() > 全チャンネルに対して ipcMain.removeAllListeners() を呼び出す
- unregisterAllIpcHandlers() > ハンドラが未登録の状態でも例外を投げない
- registerAllIpcHandlers() after unregister > unregister後の再登録がエラーにならない
- activate フローシミュレーション > register -> unregister -> register が例外なく完了
- activate フローシミュレーション > 複数回のサイクルでも安定動作
- auth fallback handlers > Supabase未設定時にAUTH 5チャネルをfallback登録する
- auth fallback handlers > fallbackのAUTH_GET_SESSIONはnullセッションを返す
- auth fallback handlers > fallbackのAUTH_CHECK_ONLINEはonline状態を返す
- setupThemeWatcher unsubscribe > 再登録時に前回の unsubscribe が呼ばれる

## 結論

テストは正しく Red 状態を示している。Phase 5 で実装を修正して Green 化する。
