# Phase 4 Main IPC Red テスト

## 追加 / 更新するテスト名

1. `auth-mode:get returns { mode } payload instead of raw string`
2. `auth-mode:status returns transport status dto with message and lastCheckedAt`
3. `auth-mode:validate returns the same dto shape as auth-mode:status`
4. `auth-mode:set emits changed event with previousMode mode status changedAt`
5. `invalid sender is rejected before mode validation`
6. `validate(mode?) keeps the same dto shape for explicit mode and current mode`

## 現状 fail 理由

- `get` は raw string を返している。
- `status` は `isAuthenticated` / `details` 中心で UI DTO ではない。
- `validate` は `status` と別 shape。
- `changed` は `currentMode` と `isAuthenticated` しか持たない。
