# Phase 5 実装ログ

## 実装概要

`AUTH_*` の `ipcMain.handle` 重複登録式を宣言的登録へ一元化した。

## 実装内容

1. `authHandlers.ts`

- `registerValidatedAuthHandler` を追加
- `AUTH_LOGIN/LOGOUT/GET_SESSION/REFRESH/CHECK_ONLINE` の5件を同ヘルパー経由で登録
- `withValidation` 適用は保持（契約・セキュリティ互換）

2. `index.ts`（fallback）

- `fallbackAuthHandlers` 配列を追加
- fallback `AUTH_*` 5件をループ登録へ変更

3. テスト

- `ipc-double-registration.test.ts` に fallback 3ケースを追加
  - 5チャネル登録確認
  - `AUTH_GET_SESSION` の `data:null` 応答
  - `AUTH_CHECK_ONLINE` の online 応答

## 検証結果

- 回帰テスト: 62/62 PASS
- 型チェック: PASS
- 対象ファイルLint: PASS

## 監査コマンド結果

```bash
rg -n "ipcMain\.handle\(\s*IPC_CHANNELS\.AUTH_" \
  apps/desktop/src/main/ipc/authHandlers.ts apps/desktop/src/main/ipc/index.ts
```

- 結果: 0件（重複式5件の一元化完了）
