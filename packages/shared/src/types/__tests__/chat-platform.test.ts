import { describe, expect, it } from "vitest";
import {
  CHAT_MODE_LABELS,
  CHAT_MODES,
  DEFAULT_CHAT_SESSION_TITLES,
  NON_PERSISTED_CHAT_OVERLAY_KEYS,
  createChatSessionTitle,
  createEmptyChatStreamOverlayState,
  isNonPersistedChatOverlayKey,
  type ChatHandoffPayload,
  type ChatReviveSnapshot,
} from "../chat-platform";

describe("chat-platform types", () => {
  it("T-01: 3つの chat mode を固定する", () => {
    expect(CHAT_MODES).toEqual(["general", "workspace", "skill-lifecycle"]);
    expect(CHAT_MODE_LABELS.workspace).toBe("Workspace Chat");
  });

  it("T-02: mode 別の session title を生成する", () => {
    expect(createChatSessionTitle("general", "  こんにちは  ")).toBe(
      "こんにちは",
    );
    const workspaceTitle = createChatSessionTitle(
      "workspace",
      "長めの説明を含むファイル文脈付きの依頼です",
      28,
    );
    expect(workspaceTitle.startsWith("Workspace: ")).toBe(true);
    expect(workspaceTitle.length).toBeLessThanOrEqual(28);
    expect(createChatSessionTitle("skill-lifecycle", "")).toBe(
      DEFAULT_CHAT_SESSION_TITLES["skill-lifecycle"],
    );
  });

  it("T-03: streaming overlay 初期値を revive 非対象として組み立てる", () => {
    expect(createEmptyChatStreamOverlayState()).toEqual({
      isStreaming: false,
      streamingContent: "",
      currentStreamId: null,
      streamingMessageId: null,
      streamingError: null,
    });

    expect(
      createEmptyChatStreamOverlayState({
        streamingError: {
          code: "ERR",
          message: "failed",
          retryable: true,
        },
      }).streamingError?.code,
    ).toBe("ERR");
  });

  it("T-04: 非永続 overlay key 判定を提供する", () => {
    expect(NON_PERSISTED_CHAT_OVERLAY_KEYS).toContain("currentStreamId");
    expect(isNonPersistedChatOverlayKey("streamingMessageId")).toBe(true);
    expect(isNonPersistedChatOverlayKey("conversationId")).toBe(false);
  });

  it("T-05: handoff / revive 契約を型として表現できる", () => {
    const handoff: ChatHandoffPayload = {
      mode: "workspace",
      sourceSurface: "workspace-view",
      targetSurface: "chat-view",
      request: "この差分を確認して",
      title: "Workspace: この差分を確認して",
      summary: "2ファイルの背景情報付き",
      attachments: [
        {
          id: "file:app.ts",
          kind: "file",
          label: "app.ts",
          path: "/workspace/app.ts",
        },
      ],
      metadata: {
        selectedFilePath: "/workspace/app.ts",
      },
      createdAt: "2026-03-12T00:00:00.000Z",
    };
    const snapshot: ChatReviveSnapshot = {
      mode: handoff.mode,
      conversationId: "conv-1",
      title: handoff.title,
      draftInput: "",
      systemPrompt: "",
      summary: handoff.summary,
      attachments: handoff.attachments,
      metadata: handoff.metadata,
    };

    expect(snapshot.attachments[0]?.label).toBe("app.ts");
    expect(snapshot.metadata.selectedFilePath).toBe("/workspace/app.ts");
  });
});
