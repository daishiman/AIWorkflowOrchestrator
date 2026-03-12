# Phase 2 アーキテクチャ設計

## 構造

- `WorkspaceView`
  - `WorkspaceChatPanel`（新規）
    - `WorkspaceSuggestionBubbles`
    - `WorkspaceChatMessageList`
    - `WorkspaceFileContextChips`
    - `WorkspaceChatInput`
      - `WorkspaceMentionDropdown`
  - `useWorkspaceChatController`（新規 hook）

## 境界

- Layout責務: `useWorkspaceLayout`（04A既存）
- Chat責務: `useWorkspaceChatController`（04B新規）
- Store: `workspaceSlice`, `fileSelectionSlice`, `llmSlice`（selectorのみ）
- IPC: preload 公開 API (`file`, `llm`, `conversationAPI`) のみ
