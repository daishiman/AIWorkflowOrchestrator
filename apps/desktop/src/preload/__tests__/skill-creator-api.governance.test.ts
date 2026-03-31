/**
 * TASK-SDK-07: Governance bundle テスト
 *
 * skill-creator-api.ts が shared approval/disclosure channel を再利用し、
 * Skill Creator 専用チャンネルを発明しないことを検証する。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ALLOWED_INVOKE_CHANNELS, IPC_CHANNELS } from "../channels";

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

import { skillCreatorAPI } from "../skill-creator-api";

describe("TASK-SDK-07: governance bundle - preload surface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC-4: approval と disclosure が別責務 ---

  describe("shared approval channel 再利用", () => {
    it("respondToApproval が shared approval:respond チャンネルを使う", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: { approved: true, token: "tok-1", approvedAt: Date.now() },
      });

      const result = await skillCreatorAPI.respondToApproval(
        "session-1",
        "op-1",
        "approve",
      );

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.APPROVAL_RESPOND, {
        sessionId: "session-1",
        operationId: "op-1",
        action: "approve",
      });
      expect(result.success).toBe(true);
    });

    it("respondToApproval が reject action も shared channel で処理する", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: { approved: false, reason: "rejected" },
      });

      await skillCreatorAPI.respondToApproval("session-1", "op-2", "reject");

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.APPROVAL_RESPOND, {
        sessionId: "session-1",
        operationId: "op-2",
        action: "reject",
      });
    });

    it("approval:respond が ALLOWED_INVOKE_CHANNELS に含まれている", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.APPROVAL_RESPOND);
    });
  });

  describe("shared disclosure channel 再利用", () => {
    it("getDisclosureInfo が shared execution:get-disclosure-info チャンネルを使う", async () => {
      const disclosureInfo = {
        aiServiceName: "Claude",
        modelName: "claude-sonnet-4-20250514",
        externalDestinations: ["api.anthropic.com"],
      };
      mockInvoke.mockResolvedValue({ success: true, data: disclosureInfo });

      const result = await skillCreatorAPI.getDisclosureInfo();

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(disclosureInfo);
    });

    it("execution:get-disclosure-info が ALLOWED_INVOKE_CHANNELS に含まれている", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
      );
    });

    it("disclosure fetch 失敗時もエラーを envelope で返す", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: { code: "DISCLOSURE_ERROR", message: "unavailable" },
      });

      const result = await skillCreatorAPI.getDisclosureInfo();

      expect(result.success).toBe(false);
    });
  });

  // --- MB-3: Skill Creator 専用 approval/disclosure channel を発明しない ---

  describe("shared contract 再利用の検証", () => {
    it("skill-creator:approval/disclosure のような専用チャンネルが存在しない", () => {
      const skillCreatorChannels = Object.entries(IPC_CHANNELS)
        .filter(
          ([, v]) => typeof v === "string" && v.startsWith("skill-creator:"),
        )
        .map(([, v]) => v);

      // TASK-P0-09: get-governance-state は正当な governance 状態取得チャンネル
      // approval/disclosure の専用チャンネルでないことを検証する
      const leakedChannels = skillCreatorChannels.filter(
        (ch) => ch.includes("approval") || ch.includes("disclosure"),
      );

      expect(leakedChannels).toEqual([]);
    });

    it("skill-creator:get-governance-state が ALLOWED_INVOKE_CHANNELS に含まれる (TASK-P0-09)", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE,
      );
    });
  });
});
