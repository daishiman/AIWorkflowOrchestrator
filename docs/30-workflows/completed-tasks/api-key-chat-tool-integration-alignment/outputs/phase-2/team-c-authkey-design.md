# Team-C 設計（AuthKey導線）

## 対象

- `apps/desktop/src/main/ipc/authKeyHandlers.ts`
- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`

## 設計

- `auth-key:exists` に `source` を返却（`saved` / `env-fallback` / `not-set`）
- `auth-mode=api-key` 時だけ AuthKey セクション表示
- UIは `source` 優先でバッジ表示
