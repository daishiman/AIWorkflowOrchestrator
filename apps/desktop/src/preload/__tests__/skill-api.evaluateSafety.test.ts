/**
 * Skill API - evaluateSafety Preload Tests
 *
 * UT-06-003-PRELOAD-API-IMPL Phase 4
 *
 * Tests for the evaluateSafety method added to the SkillAPI Preload layer.
 * Verifies: channel constant usage, argument passing, response transparency,
 * allowlist inclusion, interface existence, and error propagation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock ipc-utils before importing skill-api
vi.mock("../ipc-utils", () => ({
  invokeWithTimeout: vi.fn(),
}));

vi.mock("../channels", async () => {
  const actual =
    await vi.importActual<typeof import("../channels")>("../channels");
  return {
    ...actual,
  };
});

import { invokeWithTimeout } from "../ipc-utils";
import { IPC_CHANNELS, ALLOWED_INVOKE_CHANNELS } from "../channels";
import { skillAPI } from "../skill-api";

const mockInvokeWithTimeout = vi.mocked(invokeWithTimeout);

describe("skillAPI.evaluateSafety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T-1: evaluateSafety が SKILL_EVALUATE_SAFETY チャンネルで呼ばれる
  it("T-1: should call invokeWithTimeout with SKILL_EVALUATE_SAFETY channel", async () => {
    mockInvokeWithTimeout.mockResolvedValue({
      success: true,
      data: {
        skillName: "test-skill",
        evaluatedAt: Date.now(),
        overallGrade: "SAFE",
        details: [],
      },
    });

    await skillAPI.evaluateSafety("test-skill");

    expect(mockInvokeWithTimeout).toHaveBeenCalledWith(
      expect.any(Array),
      IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
      "test-skill",
    );
  });

  // T-2: skillName 引数が正しく渡される
  it("T-2: should pass skillName argument correctly to safeInvoke", async () => {
    mockInvokeWithTimeout.mockResolvedValue({ success: true, data: {} });

    await skillAPI.evaluateSafety("my-custom-skill");

    const callArgs = mockInvokeWithTimeout.mock.calls[0];
    expect(callArgs[2]).toBe("my-custom-skill");
  });

  // T-3: safeInvoke の戻り値がそのまま返される（ラップ形式透過）
  it("T-3: should return safeInvoke response as-is (wrap format transparency)", async () => {
    const mockResponse = {
      success: true,
      data: {
        skillName: "test-skill",
        evaluatedAt: 1234567890,
        overallGrade: "SAFE" as const,
        details: [],
      },
    };
    mockInvokeWithTimeout.mockResolvedValue(mockResponse);

    const result = await skillAPI.evaluateSafety("test-skill");

    expect(result).toEqual(mockResponse);
  });

  // T-4: SKILL_EVALUATE_SAFETY がホワイトリストに含まれる
  it("T-4: should have SKILL_EVALUATE_SAFETY in ALLOWED_INVOKE_CHANNELS", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
    );
  });

  // T-5: evaluateSafety が skillAPI オブジェクトに存在する
  it("T-5: should have evaluateSafety as a function on skillAPI", () => {
    expect(typeof skillAPI.evaluateSafety).toBe("function");
  });

  // T-6: invokeWithTimeout のエラーが伝搬する
  it("T-6: should propagate errors from invokeWithTimeout", async () => {
    const testError = new Error("IPC communication failed");
    mockInvokeWithTimeout.mockRejectedValue(testError);

    await expect(skillAPI.evaluateSafety("test-skill")).rejects.toThrow(
      "IPC communication failed",
    );
  });
});
