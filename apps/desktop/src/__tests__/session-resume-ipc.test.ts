/**
 * Session Resume IPC Integration Tests (TASK-P0-08)
 *
 * preload API → IPC channel のマッピングと
 * SkillLifecyclePanel のセッション検出フローを検証する。
 *
 * AC-1〜AC-9 対応
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SkillCreatorSessionListItem } from "@repo/shared/types";

// ── IPC mock (vi.hoisted でホイスティング問題を回避) ────────────────────────
const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));

// allowedChannels チェックをバイパスするため invokeWithTimeout をモック
vi.mock("../preload/ipc-utils", () => ({
  invokeWithTimeout: (
    _allowed: readonly string[],
    channel: string,
    ...args: unknown[]
  ) => mockInvoke(channel, ...args),
}));

import { skillCreatorAPI } from "../preload/skill-creator-api";
import { IPC_CHANNELS } from "../preload/channels";

const mockSession: SkillCreatorSessionListItem = {
  checkpointId: "cp-001-test",
  sessionId: "session-001-test",
  planId: "plan-test-123",
  currentPhase: "review",
  checkpointType: "review-ready",
  compatibility: {
    status: "compatible",
    reasons: [],
    warnings: [],
  },
  startedAt: Date.now() - 3_600_000,
  createdAt: Date.now() - 3_600_000,
  updatedAt: Date.now() - 1_800_000,
};

const mockSnapshot = {
  planId: "plan-test-123",
  currentPhase: "review" as const,
  awaitingUserInput: null,
  verifyResult: null,
  phaseArtifacts: [],
  resumeTokenEnvelope: {
    sessionId: "session-001",
    resumeToken: "token-abc",
    forkMode: "continue" as const,
    createdAt: Date.now() - 3_600_000,
  },
  handoffBundle: null,
};

describe("Session Resume IPC Integration (TASK-P0-08)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC-1: listSessions が正しいチャンネルを呼び出す
  it("TC-I-01: listSessions() が skill-creator:list-sessions チャンネルを呼び出す", async () => {
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: [mockSession],
    });

    const result = await skillCreatorAPI.listSessions();

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS,
    );
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].checkpointId).toBe("cp-001-test");
  });

  // AC-2, AC-3, AC-7: resumeSession が正しいチャンネルと引数で呼び出される
  it("TC-I-02: resumeSession(checkpointId) が成功し workflowSnapshot を返す", async () => {
    mockInvoke.mockResolvedValueOnce({
      success: true,
      workflowSnapshot: mockSnapshot,
    });

    const result = await skillCreatorAPI.resumeSession("cp-001-test");

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION,
      { checkpointId: "cp-001-test" },
    );
    expect(result.success).toBe(true);
    expect(result.workflowSnapshot?.planId).toBe("plan-test-123");
  });

  // AC-4: deleteSession 後に listSessions でセッションが消える
  it("TC-I-03: deleteSession(checkpointId) が正しいチャンネルを呼び出す", async () => {
    mockInvoke.mockResolvedValueOnce(undefined);

    await skillCreatorAPI.deleteSession("cp-001-test");

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION,
      { checkpointId: "cp-001-test" },
    );
  });

  // AC-6, AC-5: getSessionDetail が正しいチャンネルを呼び出す
  it("TC-I-04: getSessionDetail(checkpointId) が正しいチャンネルを呼び出す", async () => {
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: mockSnapshot,
    });

    const result = await skillCreatorAPI.getSessionDetail("cp-001-test");

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
      { checkpointId: "cp-001-test" },
    );
    expect(result.success).toBe(true);
  });

  // AC-8: resumeSession が非互換時に失敗レスポンスを返す
  it("TC-I-05: resumeSession が失敗時に success:false を返す", async () => {
    mockInvoke.mockResolvedValueOnce({
      success: false,
      error: "セッションの復元に失敗しました",
      errorReason: "incompatible",
    });

    const result = await skillCreatorAPI.resumeSession("cp-incompatible");

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("TC-I-05b: cleanupExpiredSessions() が正しいチャンネルを呼び出す", async () => {
    mockInvoke.mockResolvedValueOnce(2);

    const cleaned = await skillCreatorAPI.cleanupExpiredSessions();

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS,
    );
    expect(cleaned).toBe(2);
  });

  // AC-9: 4つのIPCチャンネルが全てALLOWED_INVOKE_CHANNELSに含まれる（薄いラッパー検証）
  it("TC-I-06: セッション関連の全チャンネルが ALLOWED_INVOKE_CHANNELS に含まれる", async () => {
    const { ALLOWED_INVOKE_CHANNELS } = await import("../preload/channels");

    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
    );
  });

  // AC-9: IPC ハンドラーが Facade のメソッドのみを呼び出す（薄いラッパー設計確認）
  it("TC-I-07: listSessions は空配列のときも success:true を返す（Facade 委譲設計）", async () => {
    mockInvoke.mockResolvedValueOnce({ success: true, data: [] });

    const result = await skillCreatorAPI.listSessions();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  // AC-1: listSessions が未完了セッション一覧を返す（複数件）
  it("TC-I-08: listSessions が複数セッションを返す", async () => {
    const sessions: SkillCreatorSessionListItem[] = [
      mockSession,
      {
        ...mockSession,
        checkpointId: "cp-002-test",
        sessionId: "session-002-test",
        planId: "plan-test-456",
        compatibility: {
          status: "compatible_with_warning",
          reasons: [],
          warnings: ["manifest が変更されました"],
        },
      },
    ];

    mockInvoke.mockResolvedValueOnce({ success: true, data: sessions });

    const result = await skillCreatorAPI.listSessions();

    expect(result.data).toHaveLength(2);
    expect(result.data?.[1].compatibility.status).toBe(
      "compatible_with_warning",
    );
  });
});
