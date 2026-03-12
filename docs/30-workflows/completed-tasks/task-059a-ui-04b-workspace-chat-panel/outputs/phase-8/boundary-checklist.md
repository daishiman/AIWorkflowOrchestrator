# Phase 8 責務境界チェック

| 観点               | 判定 | 根拠                                                        |
| ------------------ | ---- | ----------------------------------------------------------- |
| LayoutとChatの分離 | PASS | `useWorkspaceLayout` と `useWorkspaceChatController` を分離 |
| Store責務          | PASS | `workspaceSlice` / `fileSelectionSlice` 再利用              |
| IPC境界            | PASS | preload API のみ利用                                        |
| Component責務      | PASS | chat input/log/chips/mention を分離                         |
| テスト責務         | PASS | hook/util/component を分離                                  |
