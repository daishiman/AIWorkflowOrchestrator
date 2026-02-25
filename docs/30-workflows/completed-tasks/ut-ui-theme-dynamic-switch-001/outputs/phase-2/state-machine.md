# Phase 2 状態遷移定義

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 担当: SubAgent-A

## 状態

- `themeMode`: `kanagawa-dragon | light | dark | system`
- `resolvedTheme`: `kanagawa-dragon | light | dark`

## イベント

- `EV_SET_MODE(mode)`
- `EV_INIT_FROM_STORE(mode)`
- `EV_SYSTEM_UPDATED(isDark)`
- `EV_IPC_ERROR`
- `EV_INVALID_VALUE`

## 遷移

- `EV_SET_MODE(kanagawa-dragon)` -> `themeMode=kanagawa-dragon, resolvedTheme=kanagawa-dragon`
- `EV_SET_MODE(light)` -> `themeMode=light, resolvedTheme=light`
- `EV_SET_MODE(dark)` -> `themeMode=dark, resolvedTheme=dark`
- `EV_SET_MODE(system)` -> `themeMode=system, resolvedTheme=light|dark`
- `EV_SYSTEM_UPDATED` は `themeMode=system` のときのみ `resolvedTheme` を更新
- `EV_INVALID_VALUE` / `EV_IPC_ERROR` -> `kanagawa-dragon` へフォールバック

## 不変条件

- `themeMode !== system` のとき、`resolvedTheme === themeMode`
- `resolvedTheme` に `system` は入らない
- DOM `data-theme` は `resolvedTheme` と常に一致
