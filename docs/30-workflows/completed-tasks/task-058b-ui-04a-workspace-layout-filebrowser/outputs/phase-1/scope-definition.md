# Phase 1 スコープ定義

## In Scope

- `WorkspaceView` の 4 レイアウトモード
- file panel / preview panel の toggle bar
- file tree、zero state、status bar
- 3-pane resize と persist
- selected file の view 内 state と store 連携
- watcher の start / stop / changed 連携
- mobile overlay と keyboard navigation

## Out Of Scope

- chat panel 本体 UI
- preview renderer 本体 UI
- quick search 本体 UI
- editor への完全遷移導線設計の拡張
- watcher を使った folder tree 全体の自動再構築

## 実装前提

| 前提  | 内容                                                                 |
| ----- | -------------------------------------------------------------------- |
| P50   | 既存 store / component / preload 契約を再利用する混在タスク          |
| Store | `workspaceSlice` / `fileSelectionSlice` / `chatEditSlice` を流用する |
| IPC   | preload 契約は既存流用、Main は watcher handler を補完実装する       |
| UI    | `AppLayout` 配下で動くため view 内は `h-full` / `min-h-0` 基準にする |

## リスク

| リスク                                                             | 対応                                                             |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `file:watch-*` Main 未実装                                         | Phase 4 で Red test、Phase 5 で handler 実装                     |
| `chatEditSlice.error` と `fileSelectionSlice.error` が衝突しやすい | 04A 側では local error を優先し、既存 store error は上書きしない |
| tree keyboard nav を既存 `WorkspaceSidebar` だけで満たせない       | 04A 専用 wrapper / node 実装で補う                               |
