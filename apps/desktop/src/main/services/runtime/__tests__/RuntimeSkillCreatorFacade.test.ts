/**
 * RuntimeSkillCreatorFacade Unit Tests
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 * task-imp-runtime-skill-creator-facade-test-coverage-001 に対応
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { TerminalHandoffBuilder } from "../TerminalHandoffBuilder";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";

describe("RuntimeSkillCreatorFacade", () => {
  let executeMock: ReturnType<typeof vi.fn>;
  let facade: RuntimeSkillCreatorFacade;

  beforeEach(() => {
    executeMock = vi.fn();
    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: executeMock,
      } as unknown as SkillExecutor,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("plan", () => {
    it("terminal_handoff 判定時は buildForSurface の結果を返す", async () => {
      // adapter を設定して status = "ready" にする
      facade.setLLMAdapter({
        providerId: "anthropic",
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      } as unknown as ILLMAdapter);

      const resolveSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolve")
        .mockResolvedValue({
          type: "terminal_handoff",
          bundle: {
            launcher: "claude",
            promptBundle: "",
            cwd: "/tmp",
            suggestedCommand: 'claude -p "fallback"',
            manualRetryRule: "retry",
          },
        });
      const handoffGuidance = {
        terminalCommand: 'claude -p "Skill を作成してください: spec body"',
        contextSummary: "surface=skill skill=unknown",
        reason: "terminal_handoff",
      };
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "buildForSurface")
        .mockReturnValue(handoffGuidance);

      const result = await facade.plan("spec body", "subscription", null);

      expect(resolveSpy).toHaveBeenCalledWith("subscription", null);
      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          surfaceType: "runtime",
          runtimeType: "skill",
          prompt: "Skill を作成してください: spec body",
        }),
        "terminal_handoff",
      );
      expect(result).toEqual({
        type: "terminal_handoff",
        guidance: handoffGuidance,
      });
    });

    it("LLM 未注入（initializing）時は RT-01 ステータスチェックでエラーを返す", async () => {
      // facade は beforeEach で setLLMAdapter() 未呼び出し → status === "initializing"
      // RT-01 チェックが resolveDecision より先に実行される
      const result = await facade.plan("line-1\nline-2", "api-key", "sk-test");

      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLMAdapter の初期化中です。しばらくお待ちください",
        },
      });
    });

    it("apiKey 未指定でも initializing 時は resolveDecision に到達しない (TASK-RT-01)", async () => {
      const resolveSpy = vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      const resolveWithServiceSpy = vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      );

      const result = await facade.plan("spec body", "api-key", null);

      // TASK-RT-01: initializing ステータスが resolveDecision より先にチェックされる
      expect(resolveSpy).not.toHaveBeenCalled();
      expect(resolveWithServiceSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLMAdapter の初期化中です。しばらくお待ちください",
        },
      });
    });

    it("apiKey 未指定の api-key モードでも adapter initializing 時は terminal_handoff より先にエラーを返す", async () => {
      // facade は setLLMAdapter() 未呼び出しなので status === "initializing"
      // ステータスチェックが resolveDecision より先に実行される
      const result = await facade.plan("spec", "api-key", null);

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error.code", "llm_adapter_unavailable");
    });

    it("明示的 apiKey が渡されても adapter initializing 時はエラーレスポンスを返す", async () => {
      // facade は setLLMAdapter() 未呼び出しなので status === "initializing"
      const result = await facade.plan("spec", "api-key", "explicit-key");

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error.code", "llm_adapter_unavailable");
    });
  });

  describe("execute", () => {
    it("SkillExecutor に request と metadata を委譲し、成功結果を返す", async () => {
      const resolveSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolve")
        .mockResolvedValue({
          type: "integrated_api",
          apiKey: "sk-test",
          permissionMode: "default",
        });
      executeMock.mockResolvedValue({
        executionId: "exec-001",
        success: true,
      });

      const result = await facade.execute(
        {
          planId: "plan-001",
          skillSpec: "my-skill\nbody",
          estimatedSteps: 3,
        },
        "api-key",
        "sk-test",
      );

      expect(resolveSpy).toHaveBeenCalledWith("api-key", "sk-test");
      expect(executeMock).toHaveBeenCalledWith(
        {
          prompt: "my-skill\nbody",
          skillId: "creator-plan-001",
        },
        expect.objectContaining({
          id: "creator-plan-001",
          name: "skill-creator-executor",
          slug: "skill-creator-executor",
          content: "my-skill\nbody",
          allowedTools: ["Read", "Edit", "Write"],
        }),
      );
      expect(result).toMatchObject({
        executeId: "exec-001",
        skillName: "my-skill",
        success: true,
        error: undefined,
      });
      expect(result).toHaveProperty("sdkEvents");
      expect(result).toHaveProperty("sourceProvenance");
    });

    it("SkillExecutor のエラーを message に変換し、skillName を 50 文字に切り詰める", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      executeMock.mockResolvedValue({
        executionId: "exec-002",
        success: false,
        error: {
          code: "EXECUTION_FAILED",
          message: "executor failed",
        },
      });
      const longSkillName =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-suffix";

      const result = await facade.execute(
        {
          planId: "plan-002",
          skillSpec: `${longSkillName}\nbody`,
          estimatedSteps: 3,
        },
        "api-key",
        "sk-test",
      );

      expect(result).toMatchObject({
        executeId: "exec-002",
        skillName: longSkillName.substring(0, 50),
        success: false,
        error: "executor failed",
      });
    });

    it("terminal_handoff 判定時は executor を呼ばず bundle を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
      executeMock.mockResolvedValue({
        executionId: "exec-003",
        success: true,
      });

      const result = await facade.execute(
        {
          planId: "plan-003",
          skillSpec: "my-skill\nbody",
          estimatedSteps: 3,
        },
        "subscription",
        null,
      );

      expect(executeMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
    });

    it("apiKey 未指定の api-key モードで resolveWithService が terminal_handoff を返すと bundle を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      ).mockResolvedValue({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
      executeMock.mockResolvedValue({
        executionId: "exec-004",
        success: true,
      });

      const result = await facade.execute(
        {
          planId: "plan-004",
          skillSpec: "spec",
          estimatedSteps: 3,
        },
        "api-key",
        null,
      );

      expect(executeMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
    });

    it("明示的 apiKey 指定で terminal_handoff 判定なら executor を呼ばない", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
      executeMock.mockResolvedValue({
        executionId: "exec-005",
        success: true,
      });

      const result = await facade.execute(
        {
          planId: "plan-005",
          skillSpec: "spec body",
          estimatedSteps: 3,
        },
        "api-key",
        "explicit-key",
      );

      expect(executeMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
    });

    it("apiKey 未指定の api-key モードで resolveWithService が integrated_api を返す場合は executor に委譲する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      ).mockResolvedValue({
        type: "integrated_api",
        apiKey: "stored-key",
        permissionMode: "default",
      });
      executeMock.mockResolvedValue({
        executionId: "exec-006",
        success: true,
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_006);

      const result = await facade.execute(
        {
          planId: "plan-006",
          skillSpec: "spec body",
          estimatedSteps: 3,
        },
        "api-key",
        null,
      );

      expect(executeMock).toHaveBeenCalled();
      expect(result).toMatchObject({
        executeId: "exec-006",
        skillName: "spec body",
        success: true,
        error: undefined,
      });
      expect(result).toHaveProperty("sdkEvents");
    });

    it("apiKey 未指定の api-key モードで resolveWithService が terminal_handoff なら bundle を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      ).mockResolvedValue({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
      executeMock.mockResolvedValue({
        executionId: "exec-007",
        success: true,
      });

      const result = await facade.execute(
        {
          planId: "plan-007",
          skillSpec: "stored-spec",
          estimatedSteps: 3,
        },
        "api-key",
        null,
      );

      expect(executeMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
    });

    it("明示的 apiKey が渡された場合は resolveWithService を使わない", async () => {
      const resolveSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolve")
        .mockResolvedValue({
          type: "terminal_handoff",
          bundle: {
            launcher: "claude",
            promptBundle: "",
            cwd: "/tmp",
            suggestedCommand: 'claude -p "fallback"',
            manualRetryRule: "retry",
          },
        });
      const resolveWithServiceSpy = vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      );
      executeMock.mockResolvedValue({
        executionId: "exec-008",
        success: true,
      });

      await facade.execute(
        {
          planId: "plan-008",
          skillSpec: "spec",
          estimatedSteps: 3,
        },
        "api-key",
        "explicit-key",
      );

      expect(resolveSpy).toHaveBeenCalledWith("api-key", "explicit-key");
      expect(resolveWithServiceSpy).not.toHaveBeenCalled();
      expect(executeMock).not.toHaveBeenCalled();
    });
  });

  describe("improve", () => {
    it("terminal_handoff 判定時は改善 prompt を guidance 化する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
      const handoffGuidance = {
        terminalCommand:
          'claude -p "スキル \\"skill-a\\" を改善してください: feedback"',
        contextSummary: "surface=skill skill=skill-a",
        reason: "terminal_handoff",
      };
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "buildForSurface")
        .mockReturnValue(handoffGuidance);

      const result = await facade.improve(
        "skill-a",
        "feedback",
        "subscription",
        null,
      );

      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          surfaceType: "runtime",
          runtimeType: "skill",
          prompt: 'スキル "skill-a" を改善してください: feedback',
          workingDirectory: process.cwd(),
        }),
        "terminal_handoff",
      );
      expect(result).toEqual({
        type: "terminal_handoff",
        guidance: handoffGuidance,
      });
    });

    it("integrated_api 判定時（LLM 未注入）は explicit error を返す (TASK-RT-02)", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      const result = await facade.improve(
        "skill-b",
        "need better validation",
        "api-key",
        "sk-test",
      );

      // TASK-RT-02: llmAdapter 未注入時は explicit error
      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLM アダプタが利用できません。設定を確認してください。",
        },
      });
    });
  });

  // ------------------------------------------------------------------
  // TASK-P0-02: verifyAndImproveLoop tests
  // ------------------------------------------------------------------
  describe("verifyAndImproveLoop", () => {
    it("初回 verify で全チェック PASS → 正常終了", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn().mockReturnValue({
          currentPhase: "verify",
          verifyResult: { status: "pass", nextAction: "handoff" },
        }),
        recordImproveAttempt: vi.fn(),
        recordVerifyFailure: vi.fn(),
        getWorkflowState: vi.fn(),
        getImproveAttemptCount: vi.fn().mockReturnValue(0),
      };
      const mockVerificationEngine = {
        verify: vi
          .fn()
          .mockResolvedValue([
            { id: "L1-001", layer: "layer1", severity: "info", summary: "OK" },
          ]),
      };
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
      });

      const result = await facadeWithLoop.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
      );

      expect(result.finalStatus).toBe("pass");
      expect(result.totalAttempts).toBe(0);
      expect(result.loopExhausted).toBe(false);
      expect(mockWorkflowEngine.recordVerifyPass).toHaveBeenCalled();
    });

    it("1回目 fail → improve → 2回目 PASS → 正常終了", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn().mockReturnValue({
          currentPhase: "verify",
          verifyResult: { status: "pass", nextAction: "handoff" },
        }),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail", improveAttemptCount: 1 },
        }),
        recordVerifyFailure: vi.fn(),
        getWorkflowState: vi.fn(),
        getImproveAttemptCount: vi.fn().mockReturnValue(0),
      };
      const failChecks = [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "error" as const,
          summary: "SKILL.md missing",
        },
      ];
      const passChecks = [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "info" as const,
          summary: "OK",
        },
      ];
      const mockVerificationEngine = {
        verify: vi
          .fn()
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(passChecks),
      };
      const mockLLMAdapter = {
        providerId: "anthropic",
        sendChat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            improvements: [
              {
                section: "SKILL.md",
                before: "old",
                after: "new",
                reason: "fix",
              },
            ],
          }),
          model: "claude-sonnet-4-20250514",
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        }),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      };
      const mockSkillFileManager = {
        readFile: vi.fn().mockResolvedValue("old content"),
        writeFile: vi.fn().mockResolvedValue(undefined),
        getSkillDir: vi.fn().mockReturnValue("/tmp/skill"),
      };
      const mockResourceLoader = {
        loadAgent: vi.fn().mockResolvedValue("improve agent prompt"),
        getBasePath: vi.fn().mockReturnValue("/tmp/skill-creator"),
      };
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
        llmAdapter: mockLLMAdapter as never,
        skillFileManager: mockSkillFileManager as never,
        resourceLoader: mockResourceLoader as never,
      });

      const result = await facadeWithLoop.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
        "sk-test",
      );

      expect(result.finalStatus).toBe("pass");
      expect(result.totalAttempts).toBe(1);
      expect(mockVerificationEngine.verify).toHaveBeenCalledTimes(2);
    });

    it("2回目の improve では前回の改善要約を feedback に含める", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn().mockReturnValue({
          currentPhase: "verify",
          verifyResult: { status: "pass", nextAction: "handoff" },
        }),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail", improveAttemptCount: 1 },
        }),
        recordVerifyFailure: vi.fn(),
        getWorkflowState: vi.fn(),
        getImproveAttemptCount: vi.fn().mockReturnValue(0),
      };
      const failChecks = [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "error" as const,
          summary: "SKILL.md missing",
        },
        {
          id: "L1-002",
          layer: "layer1" as const,
          severity: "info" as const,
          summary: "OK",
        },
      ];
      const passChecks = [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "info" as const,
          summary: "OK",
        },
      ];
      const sendChat = vi
        .fn()
        .mockResolvedValueOnce({
          content: JSON.stringify({
            improvements: [
              {
                section: "4. 実行仕様",
                issue: "最初の修正が必要",
                pattern: "Clarity",
                before: "old content",
                after: "updated content 1",
              },
            ],
          }),
          model: "claude-sonnet-4-20250514",
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        })
        .mockResolvedValueOnce({
          content: JSON.stringify({
            improvements: [
              {
                section: "1. 概要",
                issue: "前回の修正を踏まえて補足",
                pattern: "Iteration",
                before: "old content",
                after: "updated content 2",
              },
            ],
          }),
          model: "claude-sonnet-4-20250514",
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        });
      const mockVerificationEngine = {
        verify: vi
          .fn()
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(passChecks),
      };
      const mockLLMAdapter = {
        providerId: "anthropic",
        sendChat,
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      };
      const mockSkillFileManager = {
        readFile: vi.fn().mockResolvedValue("old content"),
        writeFile: vi.fn().mockResolvedValue(undefined),
        getSkillDir: vi.fn().mockReturnValue("/tmp/skill"),
      };
      const mockResourceLoader = {
        loadAgent: vi.fn().mockResolvedValue("improve agent prompt"),
        getBasePath: vi.fn().mockReturnValue("/tmp/skill-creator"),
      };
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
        llmAdapter: mockLLMAdapter as never,
        skillFileManager: mockSkillFileManager as never,
        resourceLoader: mockResourceLoader as never,
      });

      const result = await facadeWithLoop.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
        "sk-test",
      );

      expect(result.finalStatus).toBe("pass");
      expect(result.totalAttempts).toBe(2);
      expect(sendChat).toHaveBeenCalledTimes(2);

      const firstFeedback = sendChat.mock.calls[0][0].messages[0]
        .content as string;
      const secondFeedback = sendChat.mock.calls[1][0].messages[0]
        .content as string;

      expect(firstFeedback).toContain("SKILL.md missing");
      expect(firstFeedback).not.toContain("L1-002");
      expect(secondFeedback).toContain("前回の改善要約");
      expect(secondFeedback).toContain("4. 実行仕様");
      expect(secondFeedback).toContain("最初の修正が必要");

      expect(mockWorkflowEngine.recordImproveAttempt).toHaveBeenCalledTimes(2);
      expect(mockWorkflowEngine.recordImproveAttempt).toHaveBeenNthCalledWith(
        1,
        "plan-001",
        [
          {
            id: "L1-001",
            layer: "layer1",
            severity: "error",
            summary: "SKILL.md missing",
          },
        ],
      );
    });

    it("maxImproveRetry 回失敗 → loopExhausted", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn(),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail" },
        }),
        recordVerifyFailure: vi.fn().mockReturnValue({
          currentPhase: "review",
          verifyResult: { status: "fail" },
        }),
        getWorkflowState: vi.fn(),
        getImproveAttemptCount: vi.fn().mockReturnValue(0),
      };
      const failChecks = [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "error" as const,
          summary: "SKILL.md missing",
        },
      ];
      const mockVerificationEngine = {
        verify: vi.fn().mockResolvedValue(failChecks),
      };
      const mockLLMAdapter = {
        providerId: "anthropic",
        sendChat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            improvements: [
              {
                section: "SKILL.md",
                before: "old",
                after: "new",
                reason: "fix",
              },
            ],
          }),
          model: "claude-sonnet-4-20250514",
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        }),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      };
      const mockSkillFileManager = {
        readFile: vi.fn().mockResolvedValue("old content"),
        writeFile: vi.fn().mockResolvedValue(undefined),
        getSkillDir: vi.fn().mockReturnValue("/tmp/skill"),
      };
      const mockResourceLoader = {
        loadAgent: vi.fn().mockResolvedValue("improve agent prompt"),
        getBasePath: vi.fn().mockReturnValue("/tmp/skill-creator"),
      };
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
        llmAdapter: mockLLMAdapter as never,
        skillFileManager: mockSkillFileManager as never,
        resourceLoader: mockResourceLoader as never,
        maxImproveRetry: 3,
      });

      const result = await facadeWithLoop.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
        "sk-test",
      );

      expect(result.finalStatus).toBe("fail");
      expect(result.totalAttempts).toBe(3);
      expect(result.loopExhausted).toBe(true);
    });

    it("improve 中の LLM エラーでループ停止", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn(),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail" },
        }),
        recordVerifyFailure: vi.fn().mockReturnValue({
          currentPhase: "review",
          verifyResult: { status: "fail" },
        }),
        getWorkflowState: vi.fn(),
        getImproveAttemptCount: vi.fn().mockReturnValue(0),
      };
      const failChecks = [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "error" as const,
          summary: "SKILL.md missing",
        },
      ];
      const mockVerificationEngine = {
        verify: vi.fn().mockResolvedValue(failChecks),
      };
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
      });

      const result = await facadeWithLoop.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
      );

      expect(result.finalStatus).toBe("error");
      expect(result.loopExhausted).toBe(false);
      expect(result.errorMessage).toBeTruthy();
    });

    it("improve 結果の suggestions が空でループ停止", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn(),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail" },
        }),
        recordVerifyFailure: vi.fn().mockReturnValue({
          currentPhase: "review",
          verifyResult: { status: "fail" },
        }),
        getWorkflowState: vi.fn(),
        getImproveAttemptCount: vi.fn().mockReturnValue(0),
      };
      const failChecks = [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "error" as const,
          summary: "SKILL.md missing",
        },
      ];
      const mockVerificationEngine = {
        verify: vi.fn().mockResolvedValue(failChecks),
      };
      const mockLLMAdapter = {
        providerId: "anthropic",
        sendChat: vi.fn().mockResolvedValue({
          content: JSON.stringify({ improvements: [] }),
          model: "claude-sonnet-4-20250514",
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        }),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      };
      const mockSkillFileManager = {
        readFile: vi.fn().mockResolvedValue("content"),
        getSkillDir: vi.fn().mockReturnValue("/tmp/skill"),
      };
      const mockResourceLoader = {
        loadAgent: vi.fn().mockResolvedValue("improve agent prompt"),
        getBasePath: vi.fn().mockReturnValue("/tmp/skill-creator"),
      };
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
        llmAdapter: mockLLMAdapter as never,
        skillFileManager: mockSkillFileManager as never,
        resourceLoader: mockResourceLoader as never,
      });

      const result = await facadeWithLoop.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
        "sk-test",
      );

      expect(result.finalStatus).toBe("fail");
      expect(result.errorMessage).toContain("改善提案なし");
    });

    it("applyImprovement の applied が 0 でループ停止", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn(),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail" },
        }),
        recordVerifyFailure: vi.fn().mockReturnValue({
          currentPhase: "review",
          verifyResult: { status: "fail" },
        }),
        getWorkflowState: vi.fn(),
        getImproveAttemptCount: vi.fn().mockReturnValue(0),
      };
      const failChecks = [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "error" as const,
          summary: "SKILL.md missing",
        },
      ];
      const mockVerificationEngine = {
        verify: vi.fn().mockResolvedValue(failChecks),
      };
      const mockLLMAdapter = {
        providerId: "anthropic",
        sendChat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            improvements: [
              {
                section: "SKILL.md",
                before: "nonexistent",
                after: "new",
                reason: "fix",
              },
            ],
          }),
          model: "claude-sonnet-4-20250514",
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        }),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      };
      const mockSkillFileManager = {
        readFile: vi.fn().mockResolvedValue("content without the search text"),
        writeFile: vi.fn(),
        getSkillDir: vi.fn().mockReturnValue("/tmp/skill"),
      };
      const mockResourceLoader = {
        loadAgent: vi.fn().mockResolvedValue("improve agent prompt"),
        getBasePath: vi.fn().mockReturnValue("/tmp/skill-creator"),
      };
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
        llmAdapter: mockLLMAdapter as never,
        skillFileManager: mockSkillFileManager as never,
        resourceLoader: mockResourceLoader as never,
      });

      const result = await facadeWithLoop.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
        "sk-test",
      );

      expect(result.finalStatus).toBe("fail");
      expect(result.errorMessage).toContain("改善適用失敗");
    });

    it("verificationEngine 未DI 時に全 PASS 扱いになる", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn().mockReturnValue({
          currentPhase: "verify",
          verifyResult: { status: "pass", nextAction: "handoff" },
        }),
        recordImproveAttempt: vi.fn(),
        recordVerifyFailure: vi.fn(),
        getWorkflowState: vi.fn(),
        getImproveAttemptCount: vi.fn().mockReturnValue(0),
      };
      const facadeNoEngine = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
      });

      const result = await facadeNoEngine.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
      );

      expect(result.finalStatus).toBe("pass");
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  // ------------------------------------------------------------------
  // setLLMAdapter DI wiring tests (UT-SC-03-003 Phase 4)
  // ------------------------------------------------------------------
  describe("setLLMAdapter DI wiring", () => {
    function createMockLLMAdapter(
      overrides: Partial<ILLMAdapter> = {},
    ): ILLMAdapter {
      return {
        providerId: "anthropic" as ILLMAdapter["providerId"],
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
        ...overrides,
      } as ILLMAdapter;
    }

    function createMockResourceLoader() {
      return {
        loadAgent: vi.fn(),
      };
    }

    function validPlanResponseJson() {
      return JSON.stringify({
        skillName: "test-skill",
        description: "A test skill",
        agents: [{ name: "agent-1", role: "Tester" }],
        scripts: [{ name: "test.js", purpose: "Run tests" }],
        triggers: ["on test"],
        anchors: ["test-anchor"],
      });
    }

    it("TC-1: setLLMAdapter() 注入後、plan() が LLM を使用する", async () => {
      const mockResourceLoader = createMockResourceLoader();
      const mockLLMAdapter = createMockLLMAdapter();
      const facadeWithDI = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        resourceLoader: mockResourceLoader as never,
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent-content-1")
        .mockResolvedValueOnce("agent-content-2")
        .mockResolvedValueOnce("agent-content-3");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      facadeWithDI.setLLMAdapter(mockLLMAdapter);
      const result = await facadeWithDI.plan("test spec", "api-key", "sk-test");

      expect(mockLLMAdapter.sendChat).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("skillName", "test-skill");
    });

    it("TC-2: setLLMAdapter() 未呼び出し時、plan() が initializing エラーを返す (TASK-RT-01)", async () => {
      const facadeNoLLM = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
      });

      // RT-01: initializing ステータスチェックが resolveDecision より先に実行
      const result = await facadeNoLLM.plan("test spec", "api-key", "sk-test");

      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLMAdapter の初期化中です。しばらくお待ちください",
        },
      });
    });

    it("TC-3: setLLMAdapter() の冪等性（複数回呼び出し）", async () => {
      const mockResourceLoader = createMockResourceLoader();
      const adapterA = createMockLLMAdapter();
      const adapterB = createMockLLMAdapter();
      const facadeWithDI = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        resourceLoader: mockResourceLoader as never,
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("agent-content");
      (adapterB.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      facadeWithDI.setLLMAdapter(adapterA);
      facadeWithDI.setLLMAdapter(adapterB);
      await facadeWithDI.plan("test spec", "api-key", "sk-test");

      expect(adapterA.sendChat).not.toHaveBeenCalled();
      expect(adapterB.sendChat).toHaveBeenCalledTimes(1);
    });

    it("TC-4: ResourceLoader がコンストラクタで正しく注入される", async () => {
      const mockResourceLoader = createMockResourceLoader();
      const mockLLMAdapter = createMockLLMAdapter();
      const facadeWithDI = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        llmAdapter: mockLLMAdapter,
        resourceLoader: mockResourceLoader as never,
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("discover-content")
        .mockResolvedValueOnce("design-content")
        .mockResolvedValueOnce("plan-content");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      await facadeWithDI.plan("test spec", "api-key", "sk-test");

      expect(mockResourceLoader.loadAgent).toHaveBeenCalledTimes(3);
      expect(mockResourceLoader.loadAgent).toHaveBeenCalledWith(
        "discover-problem",
      );
      expect(mockResourceLoader.loadAgent).toHaveBeenCalledWith(
        "design-workflow",
      );
      expect(mockResourceLoader.loadAgent).toHaveBeenCalledWith(
        "plan-structure",
      );
    });

    it("TC-7: setLLMAdapter(undefined) で explicit error に戻る (TASK-RT-02)", async () => {
      const mockResourceLoader = createMockResourceLoader();
      const mockLLMAdapter = createMockLLMAdapter();
      const facadeWithDI = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        llmAdapter: mockLLMAdapter,
        resourceLoader: mockResourceLoader as never,
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      // undefined を注入すると explicit error になる
      facadeWithDI.setLLMAdapter(undefined as unknown as ILLMAdapter);

      // status check は通過するが !this.llmAdapter で degradation に到達
      const result = await facadeWithDI.plan("test spec", "api-key", "sk-test");

      expect(mockLLMAdapter.sendChat).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLM アダプタが利用できません。設定を確認してください。",
        },
      });
    });

    it("TC-8: plan() 実行中に setLLMAdapter() が呼ばれても当該リクエストには影響しない", async () => {
      const mockResourceLoader = createMockResourceLoader();
      const adapterA = createMockLLMAdapter();
      const adapterB = createMockLLMAdapter();
      const facadeWithDI = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        resourceLoader: mockResourceLoader as never,
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("agent-content");

      // adapterA の sendChat を遅延 resolve にする
      let resolveChat!: (value: unknown) => void;
      (adapterA.sendChat as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise((resolve) => {
          resolveChat = resolve;
        }),
      );

      facadeWithDI.setLLMAdapter(adapterA);
      const planPromise = facadeWithDI.plan("test spec", "api-key", "sk-test");

      // microtask をフラッシュして plan() が sendChat まで到達するのを待つ
      // (resolveDecision + 3 x loadAgent = 4 await)
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }

      // adapterA.sendChat が呼ばれていることを確認
      expect(adapterA.sendChat).toHaveBeenCalledTimes(1);

      // sendChat の await 中に adapterB に差し替え
      facadeWithDI.setLLMAdapter(adapterB);

      // adapterA の sendChat を解決
      resolveChat({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      const result = await planPromise;

      // adapterA で開始した sendChat の結果が返る
      expect(adapterA.sendChat).toHaveBeenCalledTimes(1);
      expect(adapterB.sendChat).not.toHaveBeenCalled();
      expect(result).toHaveProperty("skillName", "test-skill");
    });

    it("TC-9: ResourceLoader の不正パスで plan() がエラーを伝播する", async () => {
      const badResourceLoader = {
        loadAgent: vi
          .fn()
          .mockRejectedValue(new Error("ENOENT: no such file or directory")),
      };
      const mockLLMAdapter = createMockLLMAdapter();
      const facadeWithBadPath = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        llmAdapter: mockLLMAdapter,
        resourceLoader: badResourceLoader as never,
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      await expect(
        facadeWithBadPath.plan("test spec", "api-key", "sk-test"),
      ).rejects.toThrow("ENOENT");
    });
  });
});
