# Phase 6 拡張テスト結果

## 追加した回帰観点

- fallback環境でのAUTH 5チャネル登録確認
- fallback `AUTH_GET_SESSION` の `success:true,data:null` 互換確認
- fallback `AUTH_CHECK_ONLINE` の online応答互換確認

## 実行結果

実行コマンド:

```bash
cd apps/desktop
./node_modules/.bin/vitest run \
  src/main/ipc/authHandlers.test.ts \
  src/main/ipc/__tests__/ipc-double-registration.test.ts
```

結果:

- Test Files: 2 passed
- Tests: 62 passed / 0 failed

## 判定

- 境界値ケース: PASS
- 異常系ケース: PASS
- 再発検出ケース: PASS
