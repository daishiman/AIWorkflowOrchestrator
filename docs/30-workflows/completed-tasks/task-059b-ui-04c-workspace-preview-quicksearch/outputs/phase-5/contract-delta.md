# Phase 5 契約差分メモ

## 04A からの差分

| 項目          | 04A               | 04C                             |
| ------------- | ----------------- | ------------------------------- |
| preview panel | placeholder       | 実 preview renderer を統合      |
| search        | なし              | Cmd/Ctrl+P quick search を追加  |
| file read     | 直接 read のみ    | timeout 5 秒 + retry 3 回を追加 |
| watch         | debounce 基盤あり | preview refresh へ接続          |

## 契約を変えていない点

- `file:read` / `file:watch-*` channel 名
- `workspaceSlice` / `fileSelectionSlice` の責務
- `WorkspaceShell` / `PanelToggleBar` / `WorkspaceStatusBar` の 04A 契約

## 判定

- 04C は既存境界を拡張しただけで、下位互換を破っていない
