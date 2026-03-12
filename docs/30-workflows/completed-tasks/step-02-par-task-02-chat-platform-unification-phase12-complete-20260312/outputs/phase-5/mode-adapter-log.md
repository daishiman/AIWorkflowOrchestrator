# Mode Adapter Log

## adapter 導入の理由

- Workspace 固有 file context と Skill Lifecycle 固有 skill metadata を、`ChatView` 側へ持ち込みたくなかったため。

## 実装

| mode            | adapter                                                                | 生成物                                 |
| --------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| workspace       | `createWorkspaceContextAttachments()` / `createWorkspaceChatHandoff()` | file attachments, summary, title       |
| skill-lifecycle | `createSkillLifecycleChatHandoff()`                                    | skill attachment, source surface guard |
| general         | `createChatSessionTitle()`                                             | title only                             |

## dedicated harness

`phase11-chat-platform.tsx` では adapter の結果が視覚的に見えるよう、Workspace / Lifecycle / Revive / Stream reset を scenario 別に描画した。
