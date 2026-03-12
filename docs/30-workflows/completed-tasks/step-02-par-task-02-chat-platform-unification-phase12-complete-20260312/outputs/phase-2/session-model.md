# Session Model

## 共有型

```ts
type ChatMode = "general" | "workspace" | "skill-lifecycle";

interface ChatHandoffPayload {
  mode: ChatMode;
  sourceSurface:
    | "chat-view"
    | "workspace-view"
    | "skill-center"
    | "skill-creator"
    | "task03";
  targetSurface: "chat-view";
  request: string;
  title: string;
  summary: string;
  attachments: ChatContextAttachment[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface ChatReviveSnapshot {
  mode: ChatMode;
  conversationId: string | null;
  title: string;
  draftInput: string;
  systemPrompt: string;
  summary: string;
  attachments: ChatContextAttachment[];
  metadata: Record<string, unknown>;
}
```

## 生成規則

| 規則                      | 実装                                  |
| ------------------------- | ------------------------------------- |
| title 生成                | `createChatSessionTitle()`            |
| Workspace attachment 生成 | `createWorkspaceContextAttachments()` |
| summary 生成              | `summarizeChatAttachments()`          |
| revive snapshot 生成      | `createChatReviveSnapshot()`          |

## current 適用

- Workspace 側は request と attachments を shared helper で作ってから `conversationAPI` へ渡す。
- Skill Lifecycle 側は selected skill 情報を attachment に詰めて `ChatView` へ handoff する。
- general chat は mode contract を共有しつつ transport は legacy のまま残す。
