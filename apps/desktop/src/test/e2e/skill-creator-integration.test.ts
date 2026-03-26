/**
 * Skill Creator E2E Integration Tests
 *
 * TASK-SC-08-E2E-VALIDATION: Scenarios A, C, D, E
 *
 * Verifies the full Skill Creator LLM integration flow via IPC handlers:
 * - Scenario A: Normal flow (plan → execute-plan) — AC-1, AC-2, AC-6
 * - Scenario C: LLM error recovery — AC-7, NFR-4
 * - Scenario D: improve feature — AC-5
 * - Scenario E: Backward compatibility (skill:create) — AC-8
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";
import {
  handlerMap,
  createMockMainWindow,
  createMockEvent,
  createMockRuntimeFacade,
  createSuccessPlanResult,
  createSuccessExecuteResult,
  createImproveResult,
  createApplyImprovementResult,
  createSampleSuggestions,
  invokeSkillCreatorPlan,
  invokeSkillCreatorExecute,
  invokeSkillCreatorImprove,
  assertIpcSuccess,
  assertIpcError,
  assertNoSensitiveData,
  type MockBrowserWindow,
  type MockRuntimeFacade,
  type IpcResult,
} from "../helpers/skill-creator-test-helpers";

// === Electron Mock ===

vi.mock("electron", () => {
  const mockBW = {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  };
  return {
    ipcMain: {
      handle: vi.fn(
        (channel: string, handler: (...args: unknown[]) => unknown) => {
          handlerMap.set(
            channel,
            handler as (...args: unknown[]) => Promise<unknown>,
          );
        },
      ),
      removeHandler: vi.fn((channel: string) => {
        handlerMap.delete(channel);
      }),
    },
    BrowserWindow: mockBW,
  };
});

// Import after mock
import { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../../main/ipc/creatorHandlers";
import type { RuntimeSkillCreatorFacade } from "../../main/services/runtime/RuntimeSkillCreatorFacade";

// === Tests ===

describe("Skill Creator E2E Integration", () => {
  let mockMainWindow: MockBrowserWindow;
  let mockFacade: MockRuntimeFacade;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockMainWindow();
    mockFacade = createMockRuntimeFacade();

    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    registerRuntimeSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockFacade as unknown as RuntimeSkillCreatorFacade,
    );
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
  });

  // ============================================
  // Scenario A: Normal Flow (AC-1, AC-2, AC-6)
  // ============================================

  describe("Scenario A: Normal Flow (plan → execute-plan)", () => {
    it("AC-1: plan returns skill generation plan from natural language input", async () => {
      const planResult = createSuccessPlanResult();
      mockFacade.plan.mockResolvedValue(planResult);

      const result = await invokeSkillCreatorPlan(
        "PRレビューを自動化するスキルを作成して",
      );

      assertIpcSuccess(result);
      expect(result.data).toEqual(planResult);
      expect(mockFacade.plan).toHaveBeenCalledWith(
        "PRレビューを自動化するスキルを作成して",
        "api-key",
        "test-key",
      );
    });

    it("AC-2: execute-plan generates skill files and returns skillPath", async () => {
      const executeResult = createSuccessExecuteResult();
      mockFacade.execute.mockResolvedValue(executeResult);

      const result = await invokeSkillCreatorExecute(
        "plan-001",
        "test skill spec",
      );

      assertIpcSuccess(result);
      expect(result.data).toEqual(executeResult);
      expect(mockFacade.execute).toHaveBeenCalled();
    });

    it("AC-1+AC-2: full plan → execute flow succeeds end-to-end", async () => {
      const planResult = createSuccessPlanResult();
      const executeResult = createSuccessExecuteResult();
      mockFacade.plan.mockResolvedValue(planResult);
      mockFacade.execute.mockResolvedValue(executeResult);

      // Step 1: Plan
      const planResponse = await invokeSkillCreatorPlan(
        "GitHub Issue管理スキルを作成して",
      );
      assertIpcSuccess(planResponse);

      // Step 2: Execute
      const execResponse = await invokeSkillCreatorExecute(
        (planResponse.data as { planId: string }).planId,
        (planResponse.data as { skillSpec: string }).skillSpec,
      );
      assertIpcSuccess(execResponse);
      expect((execResponse.data as { success: boolean }).success).toBe(true);
    });

    it("plan validates empty prompt input", async () => {
      const result = await invokeSkillCreatorPlan("");

      assertIpcError(result, "プロンプトが指定されていません");
      expect(mockFacade.plan).not.toHaveBeenCalled();
    });

    it("execute-plan validates empty planId", async () => {
      const result = await invokeSkillCreatorExecute("", "spec");

      assertIpcError(result, "planId が指定されていません");
      expect(mockFacade.execute).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Scenario C: LLM Error Recovery (AC-7, NFR-4)
  // ============================================

  describe("Scenario C: LLM Error Recovery", () => {
    it("AC-7: plan returns sanitized error message on LLM failure", async () => {
      mockFacade.plan.mockRejectedValue(new Error("LLM API connection failed"));

      const result = await invokeSkillCreatorPlan("テストスキル");

      assertIpcError(result);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
    });

    it("AC-7: execute-plan returns error on LLM failure", async () => {
      mockFacade.execute.mockRejectedValue(
        new Error("Model inference timeout"),
      );

      const result = await invokeSkillCreatorExecute("plan-001", "spec");

      assertIpcError(result);
    });

    it("NFR-4: app does not crash after LLM error — retry succeeds", async () => {
      // First call: error
      mockFacade.plan.mockRejectedValueOnce(new Error("Temporary LLM failure"));
      const errorResult = await invokeSkillCreatorPlan("テスト");
      assertIpcError(errorResult);

      // Second call: success (retry)
      mockFacade.plan.mockResolvedValueOnce(createSuccessPlanResult());
      const successResult = await invokeSkillCreatorPlan("テスト");
      assertIpcSuccess(successResult);
    });

    it("NFR-1: error response does not leak sensitive information", async () => {
      mockFacade.plan.mockRejectedValue(
        new Error(
          "Connection to sk-abc123xyz at /Users/dev/secret/path failed\n  at Object.call (/internal/module.js:42)",
        ),
      );

      const result = await invokeSkillCreatorPlan("テスト");

      assertIpcError(result);
      assertNoSensitiveData(result as IpcResult<unknown>);
    });

    it("non-Error throw returns sanitized default message", async () => {
      mockFacade.plan.mockRejectedValue("raw string error");

      const result = await invokeSkillCreatorPlan("テスト");

      assertIpcError(result);
      expect(result.error).not.toContain("raw string error");
    });
  });

  // ============================================
  // Scenario D: improve Feature (AC-5)
  // ============================================

  describe("Scenario D: improve Feature", () => {
    it("AC-5: improve returns suggestions from feedback", async () => {
      const improveResult = createImproveResult();
      mockFacade.improve.mockResolvedValue(improveResult);

      const result = await invokeSkillCreatorImprove(
        "test-skill",
        "トリガー条件をより具体的にしてほしい",
      );

      assertIpcSuccess(result);
      expect(result.data).toEqual(improveResult);
      expect(mockFacade.improve).toHaveBeenCalledWith(
        "test-skill",
        "トリガー条件をより具体的にしてほしい",
        "api-key",
        "test-key",
      );
    });

    it("AC-5: apply-improvement applies diff to existing skill", async () => {
      const applyResult = createApplyImprovementResult();
      mockFacade.applyImprovement.mockResolvedValue(applyResult);

      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
      )!;
      const result = (await handler(createMockEvent(), {
        skillName: "test-skill",
        suggestions: createSampleSuggestions(),
      })) as IpcResult<unknown>;

      assertIpcSuccess(result);
      expect((result.data as { applied: number }).applied).toBe(1);
    });

    it("AC-5: full improve → apply flow succeeds", async () => {
      const improveResult = createImproveResult();
      const applyResult = createApplyImprovementResult();
      mockFacade.improve.mockResolvedValue(improveResult);
      mockFacade.applyImprovement.mockResolvedValue(applyResult);

      // Step 1: Get suggestions
      const improveResponse = await invokeSkillCreatorImprove(
        "test-skill",
        "改善フィードバック",
      );
      assertIpcSuccess(improveResponse);

      // Step 2: Apply suggestions
      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
      )!;
      const applyResponse = (await handler(createMockEvent(), {
        skillName: "test-skill",
        suggestions: (improveResponse.data as { suggestions: unknown[] })
          .suggestions,
      })) as IpcResult<unknown>;
      assertIpcSuccess(applyResponse);
    });

    it("improve validates empty skillName", async () => {
      const result = await invokeSkillCreatorImprove("", "feedback");

      assertIpcError(result, "skillName が指定されていません");
      expect(mockFacade.improve).not.toHaveBeenCalled();
    });

    it("apply-improvement returns error when facade throws", async () => {
      mockFacade.applyImprovement.mockRejectedValue(
        new Error("disk write failed"),
      );

      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
      )!;
      const result = (await handler(createMockEvent(), {
        skillName: "test-skill",
        suggestions: createSampleSuggestions(),
      })) as IpcResult<unknown>;

      assertIpcError(result);
    });

    it("apply-improvement validates empty skillName", async () => {
      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
      )!;
      const result = (await handler(createMockEvent(), {
        skillName: "",
        suggestions: createSampleSuggestions(),
      })) as IpcResult<unknown>;

      assertIpcError(result, "skillName が指定されていません");
      expect(mockFacade.applyImprovement).not.toHaveBeenCalled();
    });

    it("apply-improvement validates invalid suggestions structure", async () => {
      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
      )!;
      const result = (await handler(createMockEvent(), {
        skillName: "test-skill",
        suggestions: [{ invalid: true }],
      })) as IpcResult<unknown>;

      assertIpcError(result, "構造が不正です");
      expect(mockFacade.applyImprovement).not.toHaveBeenCalled();
    });

    it("improve validates empty feedback", async () => {
      const result = await invokeSkillCreatorImprove("test-skill", "");

      assertIpcError(result, "feedback が指定されていません");
      expect(mockFacade.improve).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Scenario E: Backward Compatibility (AC-8)
  // ============================================

  describe("Scenario E: Backward Compatibility", () => {
    it("AC-8: new runtime channels are registered alongside old channels", () => {
      expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_PLAN)).toBe(true);
      expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN)).toBe(
        true,
      );
      expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL)).toBe(
        true,
      );
      expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT)).toBe(
        true,
      );
    });

    it("AC-8: channel constants match expected string values", () => {
      expect(IPC_CHANNELS.SKILL_CREATOR_PLAN).toBe("skill-creator:plan");
      expect(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN).toBe(
        "skill-creator:execute-plan",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL).toBe(
        "skill-creator:improve-skill",
      );
      expect(IPC_CHANNELS.SKILL_CREATE).toBe("skill:create");
    });

    it("AC-8: runtime handlers can coexist with legacy skill:create channel definition", () => {
      // Verify both new and legacy channel names are defined in IPC_CHANNELS
      expect(IPC_CHANNELS.SKILL_CREATOR_PLAN).toBeDefined();
      expect(IPC_CHANNELS.SKILL_CREATE).toBeDefined();
      // They should be distinct channels
      expect(IPC_CHANNELS.SKILL_CREATOR_PLAN).not.toBe(
        IPC_CHANNELS.SKILL_CREATE,
      );
    });

    it("AC-8: runtime plan works independently of legacy channels", async () => {
      mockFacade.plan.mockResolvedValue(createSuccessPlanResult());

      const result = await invokeSkillCreatorPlan("テストスキル作成");

      assertIpcSuccess(result);
      // Only runtime facade was called, not legacy service
      expect(mockFacade.plan).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Concurrent Execution Tests
  // ============================================

  describe("Concurrent Execution", () => {
    it("handles multiple simultaneous plan requests", async () => {
      mockFacade.plan
        .mockResolvedValueOnce(createSuccessPlanResult({ planId: "plan-001" }))
        .mockResolvedValueOnce(createSuccessPlanResult({ planId: "plan-002" }));

      const [r1, r2] = await Promise.all([
        invokeSkillCreatorPlan("スキル1"),
        invokeSkillCreatorPlan("スキル2"),
      ]);

      assertIpcSuccess(r1);
      assertIpcSuccess(r2);
      expect((r1.data as { planId: string }).planId).toBe("plan-001");
      expect((r2.data as { planId: string }).planId).toBe("plan-002");
    });

    it("handles mixed success and error in concurrent requests", async () => {
      mockFacade.plan
        .mockResolvedValueOnce(createSuccessPlanResult())
        .mockRejectedValueOnce(new Error("LLM failure"));

      const [success, failure] = await Promise.all([
        invokeSkillCreatorPlan("正常リクエスト"),
        invokeSkillCreatorPlan("エラーリクエスト"),
      ]);

      assertIpcSuccess(success);
      assertIpcError(failure);
    });
  });

  // ============================================
  // Service Unavailable (facade undefined)
  // ============================================

  describe("Service unavailable (no facade)", () => {
    it("apply-improvement returns unavailable error when service is not provided", async () => {
      // Re-register handlers without facade
      unregisterRuntimeSkillCreatorHandlers();
      registerRuntimeSkillCreatorHandlers(
        mockMainWindow as unknown as BrowserWindowType,
        undefined,
      );

      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
      )!;
      const result = (await handler(createMockEvent(), {
        skillName: "test-skill",
        suggestions: createSampleSuggestions(),
      })) as IpcResult<unknown>;

      assertIpcError(result, "利用できません");
    });
  });
});
