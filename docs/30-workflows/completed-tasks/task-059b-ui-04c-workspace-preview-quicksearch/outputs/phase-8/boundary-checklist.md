# Phase 8 責務境界チェック

| 境界                                  | 判定 | 根拠                                   |
| ------------------------------------- | ---- | -------------------------------------- |
| UI component は描画責務のみ           | PASS | Preview component 群は props 受取のみ  |
| hook は状態遷移責務のみ               | PASS | `useQuickFileSearch`, `useFileWatcher` |
| `WorkspaceView` は orchestration のみ | PASS | file read / watch / selection 結線     |
| 04A 基盤を再実装していない            | PASS | Shell / layout / resize は 04A 再利用  |
| Main / preload を拡張していない       | PASS | existing `file:*` 契約再利用のみ       |
