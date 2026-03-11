# Phase 4 統合テスト設計

## 接続境界

| 境界                       | 検証内容                                                                        |
| -------------------------- | ------------------------------------------------------------------------------- |
| Renderer View ↔ Store      | `loadWorkspace`, `setWorkspaceSelectedFile`, `addFiles` が UI 操作から呼ばれる  |
| Renderer Hook ↔ Preload    | `file.read`, `file.watchStart`, `file.watchStop`, `file.onChanged` の呼び出し順 |
| Main IPC ↔ Watcher Service | `FileWatcher` 生成、`file` event push、stop cleanup                             |
| 04A ↔ 04B/04C              | selected file と preview open state が placeholder 境界を壊さない               |

## 実装で固定した連携ケース

| ケース                          | 期待結果                                                        |
| ------------------------------- | --------------------------------------------------------------- |
| 初期 mount 後 `loadWorkspace()` | tree / zero state が workspace 内容に応じて切り替わる           |
| file node select                | selected path、preview、status bar、attach 導線が同時更新される |
| selected file change event      | 300ms debounce 後に `file.read()` を再実行する                  |
| unmount / file switch           | 旧 watch が stop される                                         |

## 監査ポイント

- Renderer 側は preload public contract のみを使い、Node API を直接触らない。
- Main 側は `event.sender.send(IPC_CHANNELS.FILE_CHANGED, ...)` で push し、Renderer を import しない。
- `workspaceSlice` / `fileSelectionSlice` の既存責務を壊さず、新規 slice は追加しない。
