import { describe, expect, it } from "vitest";
import {
  buildChatPlatformRequest,
  createChatReviveSnapshot,
  createWorkspaceChatHandoff,
  createWorkspaceContextAttachments,
  summarizeChatAttachments,
} from "./contracts";

describe("chat-platform contracts", () => {
  const selectedFiles = [
    {
      id: "file-1",
      path: "/workspace/app.ts",
      name: "app.ts",
      extension: ".ts",
      size: 128,
      mimeType: "text/typescript",
      lastModified: "2026-03-10T00:00:00.000Z",
      createdAt: "2026-03-10T00:00:00.000Z",
    },
    {
      id: "file-2",
      path: "/workspace/chat.ts",
      name: "chat.ts",
      extension: ".ts",
      size: 256,
      mimeType: "text/typescript",
      lastModified: "2026-03-10T00:00:00.000Z",
      createdAt: "2026-03-10T00:00:00.000Z",
    },
  ] as const;

  it("workspace selectedFiles を handoff attachment に変換する", () => {
    const attachments = createWorkspaceContextAttachments([...selectedFiles]);

    expect(attachments).toHaveLength(2);
    expect(attachments[0]).toMatchObject({
      kind: "file",
      label: "app.ts",
      path: "/workspace/app.ts",
    });
    expect(summarizeChatAttachments(attachments)).toContain("app.ts");
  });

  it("workspace handoff payload を共通 contract で生成する", () => {
    const handoff = createWorkspaceChatHandoff({
      request: " この差分を説明して ",
      selectedFiles: [...selectedFiles],
      selectedFilePath: "/workspace/app.ts",
      metadata: {
        origin: "workspace-panel",
      },
    });

    expect(handoff.mode).toBe("workspace");
    expect(handoff.sourceSurface).toBe("workspace-view");
    expect(handoff.targetSurface).toBe("chat-view");
    expect(handoff.request).toBe("この差分を説明して");
    expect(handoff.metadata.selectedFilePath).toBe("/workspace/app.ts");
    expect(handoff.summary).toContain("app.ts");
  });

  it("mode + context から stream request を組み立てる", () => {
    const request = buildChatPlatformRequest({
      mode: "workspace",
      input: "差分をレビューして",
      contextBlock: "### app.ts\n```ts\nconst value = 1;\n```",
      selectedModelId: null,
      selectedProviderId: "anthropic",
      systemPrompt: "あなたは厳密なレビュアーです",
    });

    expect(request.modelId).toBe("gpt-4o");
    expect(request.providerId).toBe("anthropic");
    expect(request.stream).toBe(true);
    expect(request.systemPrompt).toContain("レビュアー");
    expect(request.messages[0]?.content).toContain("ユーザーの依頼");
  });

  it("revive snapshot には非永続 streaming state を含めない", () => {
    const snapshot = createChatReviveSnapshot({
      mode: "workspace",
      conversationId: "conv-1",
      request: "差分をレビューして",
      attachments: createWorkspaceContextAttachments([...selectedFiles]),
      metadata: {
        requestId: "req-should-not-be-persisted",
      },
    });

    expect(snapshot).toEqual({
      mode: "workspace",
      conversationId: "conv-1",
      title: "Workspace: 差分をレビューして",
      draftInput: "差分をレビューして",
      systemPrompt: "",
      summary: "app.ts, chat.ts",
      attachments: expect.any(Array),
      metadata: {
        requestId: "req-should-not-be-persisted",
      },
    });
    expect("currentStreamId" in snapshot).toBe(false);
  });
});
