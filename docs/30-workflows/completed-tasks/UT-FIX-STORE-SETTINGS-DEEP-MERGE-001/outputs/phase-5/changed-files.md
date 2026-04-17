# 変更ファイル一覧

## apps/desktop/src/main/ipc/storeHandlers.ts

- **追加**: `deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T` 関数
- **追加**: `isPlainObject` / `cloneSafePlainObject` / `deepMergePlainObjects` の安全化補助関数
- **変更**: `settings:update` ハンドラの `{ ...current, ...updates }` → `deepMerge(current, updates)`
- **位置**: `USER_SETTINGS_STORE_KEY` 定数直後（`registerUserSettingsHandlers` 前）
- **変更**: 非 plain object の payload を validation error で拒否する入力検証を追加

## apps/desktop/src/main/ipc/storeHandlers.test.ts

- **追加**: `describe("registerUserSettingsHandlers", ...)` ブロック
- **追加**: TC-01〜TC-12 テストケース + ハンドラ登録確認 + エラーハンドリングテスト
- **追加**: `registerUserSettingsHandlers` の import
