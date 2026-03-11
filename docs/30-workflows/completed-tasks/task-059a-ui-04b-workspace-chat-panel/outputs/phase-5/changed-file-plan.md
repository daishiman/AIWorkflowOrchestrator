# Phase 5 変更ファイル計画/実績

| ファイル                                                                            | 種別 | 内容                           |
| ----------------------------------------------------------------------------------- | ---- | ------------------------------ |
| `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                           | 変更 | chat統合、attach/preview共通化 |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | 新規 | 送信/stream/mention/controller |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | 新規 | chat panel 統合                |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx`              | 新規 | composer UI                    |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatMessageList.tsx`        | 新規 | message表示                    |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceFileContextChips.tsx`       | 新規 | context chips                  |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceMentionDropdown.tsx`        | 新規 | mention候補                    |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceSuggestionBubbles.tsx`      | 新規 | zero state                     |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceMentionQuery.ts`   | 新規 | mention抽出/候補               |
| `apps/desktop/src/renderer/views/WorkspaceView/workspaceFileSelection.ts`           | 新規 | SelectedFile生成               |
