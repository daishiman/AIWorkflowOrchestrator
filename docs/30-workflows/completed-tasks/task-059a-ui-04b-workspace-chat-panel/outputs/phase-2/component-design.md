# Phase 2 コンポーネント設計

| コンポーネント               | 役割                           | 主要 props / 依存                          |
| ---------------------------- | ------------------------------ | ------------------------------------------ |
| `WorkspaceChatPanel`         | chat領域統合                   | `controller`                               |
| `WorkspaceChatInput`         | 入力・送信・mention・error表示 | `controller`                               |
| `WorkspaceChatMessageList`   | user/assistant/stream の表示   | `messages`, `streamContent`, `isStreaming` |
| `WorkspaceFileContextChips`  | 添付ファイル表示・削除         | `selectedFiles`, `onRemove`                |
| `WorkspaceMentionDropdown`   | mention 候補表示               | `options`, `activeIndex`, `onSelect`       |
| `WorkspaceSuggestionBubbles` | ゼロステート提案               | `suggestions`, `onSelect`                  |
