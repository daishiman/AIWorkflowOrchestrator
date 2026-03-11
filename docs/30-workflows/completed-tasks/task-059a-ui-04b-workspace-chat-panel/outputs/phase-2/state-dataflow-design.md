# Phase 2 状態/データフロー設計

## 状態所有

| 状態                           | 所有                                     |
| ------------------------------ | ---------------------------------------- |
| layout mode / panel width      | `useWorkspaceLayout`                     |
| selected workspace file        | `workspaceSlice`                         |
| selected context files         | `fileSelectionSlice`                     |
| chat messages / stream / error | `useWorkspaceChatController` local state |
| provider/model selection       | `useAppStore` selector                   |

## 送信フロー

1. input trim → user message local append
2. `conversationAPI.create`（初回のみ）
3. `conversationAPI.addMessage`（user）
4. selectedFiles から context block 生成
5. `electronAPI.llm.streamChat`
6. chunk 受信で streamContent 更新
7. end 受信で assistant message append + `conversationAPI.addMessage`（assistant）

## エラーフロー

- file read 失敗: `workspace-chat-error` へ surfacing
- stream error: `AI応答に失敗しました: ...`
- conversation 保存失敗: alert 表示
