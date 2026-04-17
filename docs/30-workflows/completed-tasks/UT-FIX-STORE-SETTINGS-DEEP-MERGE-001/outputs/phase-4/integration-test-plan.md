# 統合テスト計画

## 統合対象

- `settings:update` ハンドラ（deepMerge 適用）
- `settings:get` ハンドラ（変更なし・回帰確認）

## 既存テストとの干渉確認

- `registerStoreHandlers` テスト（14件）: スコープ独立のため干渉なし
- `registerUserSettingsHandlers` テスト（12件）: 新規追加のため競合なし

## 実行コマンド

```bash
cd apps/desktop && npx vitest run --reporter=verbose src/main/ipc/storeHandlers.test.ts
```

## 結果: 干渉なし（全 26 件 PASS）
