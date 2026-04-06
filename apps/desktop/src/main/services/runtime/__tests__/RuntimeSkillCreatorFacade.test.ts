/**
 * RuntimeSkillCreatorFacade Unit Tests
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 * task-imp-runtime-skill-creator-facade-test-coverage-001 に対応
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";
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
    // TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001:
    // execute() に _llmAdapterStatus ガードが追加されたため、
    // execute テストでは beforeEach で setLLMAdapter() を呼ぶ
    beforeEach(() => {
      facade.setLLMAdapter({
        providerId: "anthropic",
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      } as unknown as ILLMAdapter);
    });

    it("SkillExecutor に request と metadata を委譲し、成功結果を返す", async () => {
      // TASK-RT-02: llmAdapter を注入して execute guard を通過させる
      facade.setLLMAdapter({
        providerId: "anthropic",
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      } as unknown as ILLMAdapter);
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
        expect.objectContaining({
          prompt: "my-skill\nbody",
          skillId: "creator-plan-001",
        }),
        expect.objectContaining({
          id: "creator-plan-001",
          name: "skill-creator-executor",
          slug: "skill-creator-executor",
          content: "my-skill\nbody",
          allowedTools: [
            "Read",
            "Glob",
            "Grep",
            "Bash",
            "Agent",
            "Write",
            "Edit",
          ],
          permissionMode: "acceptEdits",
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
      // TASK-RT-02: llmAdapter を注入して execute guard を通過させる
      facade.setLLMAdapter({
        providerId: "anthropic",
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      } as unknown as ILLMAdapter);
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
      // TASK-RT-02: llmAdapter を注入して execute guard を通過させる
      facade.setLLMAdapter({
        providerId: "anthropic",
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      } as unknown as ILLMAdapter);
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
      // TASK-UT-RT-01: _llmAdapterStatus ガードを通過させるため
      facade.setLLMAdapter({
        providerId: "anthropic",
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      } as unknown as ILLMAdapter);
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

      // TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001:
      // _llmAdapterStatus === "initializing" ガードが !this.llmAdapter より先に発火する
      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLMAdapter の初期化中です。しばらくお待ちください",
        },
      });
    });
  });

  // ------------------------------------------------------------------
  // TASK-P0-02: verifyAndImproveLoop tests
  // ------------------------------------------------------------------
  describe("verifyAndImproveLoop", () => {
    function createSeededWorkflowEngine() {
      const workflowEngine = new SkillCreatorWorkflowEngine();
      const planResult = {
        planId: "plan-001",
        skillSpec: "seed skill spec",
        estimatedSteps: 1,
        skillName: "test-skill",
        description: "seed workflow for verify loop",
        agents: [{ name: "agent-1", role: "Tester" }],
        scripts: [],
        triggers: [],
        anchors: [],
      };
      const decision = {
        type: "integrated_api" as const,
        apiKey: "sk-test",
        permissionMode: "default" as const,
      };
      workflowEngine.recordPlanResult(planResult, decision);
      workflowEngine.recordExecuteStart(planResult, decision);
      workflowEngine.recordExecuteResult("plan-001", {
        executeId: "exec-001",
        skillName: "test-skill",
        success: true,
      });
      return workflowEngine;
    }

    function createImproveDependencies() {
      return {
        llmAdapter: {
          providerId: "anthropic" as const,
          sendChat: vi.fn().mockResolvedValue({
            content: JSON.stringify({
              improvements: [
                {
                  section: "SKILL.md",
                  before: "missing schema",
                  after: "schema added",
                },
              ],
            }),
            model: "claude-sonnet-4-20250514",
            usage: {
              promptTokens: 100,
              completionTokens: 50,
              totalTokens: 150,
            },
          }),
          streamChat: vi.fn(),
          checkHealth: vi.fn(),
        } as ILLMAdapter,
        skillFileManager: {
          readFile: vi.fn().mockResolvedValue("missing schema"),
          writeFile: vi.fn().mockResolvedValue(undefined),
          getSkillDir: vi.fn().mockReturnValue("/tmp/skill"),
        },
        resourceLoader: {
          loadAgent: vi.fn().mockResolvedValue("improve agent prompt"),
          getBasePath: vi.fn().mockReturnValue("/tmp/skill-creator"),
        },
      };
    }

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

    it("RT-03: warning のみの verify でも improve に回して reverify で PASS になる", async () => {
      const workflowEngine = createSeededWorkflowEngine();
      const warningChecks = [
        {
          id: "L3-001",
          layer: "layer3" as const,
          severity: "warning" as const,
          summary: "$schema missing",
        },
      ];
      const passChecks = [
        {
          id: "L3-001",
          layer: "layer3" as const,
          severity: "info" as const,
          summary: "schema present",
        },
      ];
      const mockVerificationEngine = {
        verify: vi
          .fn()
          .mockResolvedValueOnce(warningChecks)
          .mockResolvedValueOnce(passChecks),
      };
      const dependencies = createImproveDependencies();
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: workflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
        llmAdapter: dependencies.llmAdapter as never,
        skillFileManager: dependencies.skillFileManager as never,
        resourceLoader: dependencies.resourceLoader as never,
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
      expect(result.workflowSnapshot.currentPhase).toBe("verify");
      expect(result.workflowSnapshot.verifyResult?.status).toBe("pass");
      expect(result.workflowSnapshot.verifyResult?.nextAction).toBe("handoff");
      expect(result.workflowSnapshot.verifyResult?.improveAttemptCount).toBe(1);
      expect(
        result.workflowSnapshot.verifyResult?.failedChecksSummary,
      ).toContain("$schema missing");
    });

    it("warning と error が混在しても improve 側に落ちる", async () => {
      const workflowEngine = createSeededWorkflowEngine();
      const warningAndErrorChecks = [
        {
          id: "L3-001",
          layer: "layer3" as const,
          severity: "warning" as const,
          summary: "$schema missing",
        },
        {
          id: "L4-001",
          layer: "layer4" as const,
          severity: "error" as const,
          summary: "Anchors missing",
        },
      ];
      const passChecks = [
        {
          id: "L3-001",
          layer: "layer3" as const,
          severity: "info" as const,
          summary: "schema present",
        },
      ];
      const mockVerificationEngine = {
        verify: vi
          .fn()
          .mockResolvedValueOnce(warningAndErrorChecks)
          .mockResolvedValueOnce(passChecks),
      };
      const dependencies = createImproveDependencies();
      const facadeWithLoop = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: workflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
        llmAdapter: dependencies.llmAdapter as never,
        skillFileManager: dependencies.skillFileManager as never,
        resourceLoader: dependencies.resourceLoader as never,
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
      expect(
        result.workflowSnapshot.verifyResult?.failedChecksSummary,
      ).toContain("$schema missing");
      expect(
        result.workflowSnapshot.verifyResult?.failedChecksSummary,
      ).toContain("Anchors missing");
      expect(result.workflowSnapshot.verifyResult?.improveAttemptCount).toBe(1);
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
      expect(secondFeedback).toContain("過去の改善試行履歴");
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
        recordImproveFailure: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail", nextAction: "improve" },
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
        recordImproveFailure: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail", nextAction: "improve" },
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

    it("improve が adapter guard で失敗した場合は errorCode を保持する", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn(),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail", improveAttemptCount: 1 },
        }),
        recordImproveFailure: vi.fn().mockReturnValue({
          planId: "plan-001",
          currentPhase: "improve",
          awaitingUserInput: null,
          verifyResult: {
            status: "fail",
            nextAction: "improve",
            message:
              "improve が llm_adapter_unavailable で失敗しました: Connection refused",
          },
          resumeTokenEnvelope: {
            version: "task-sdk-02-v1" as const,
            planId: "plan-001",
            currentPhase: "improve",
            artifactCount: 3,
            updatedAt: "2026-04-04T00:00:00.000Z",
          },
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
      facadeWithLoop.setLLMAdapterFailed("Connection refused");

      const result = await facadeWithLoop.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
      );

      expect(result.finalStatus).toBe("error");
      expect(result.errorCode).toBe("llm_adapter_unavailable");
      expect(result.errorMessage).toBe("Connection refused");
      expect(result.workflowSnapshot.currentPhase).toBe("improve");
      expect(result.workflowSnapshot.verifyResult?.status).toBe("fail");
      expect(result.workflowSnapshot.verifyResult?.nextAction).toBe("improve");
      expect(result.workflowSnapshot.verifyResult?.message).toContain(
        "llm_adapter_unavailable",
      );
      expect(result.workflowSnapshot.verifyResult?.message).toContain(
        "Connection refused",
      );
      expect(mockWorkflowEngine.recordImproveFailure).toHaveBeenCalledWith(
        "plan-001",
        "improve が llm_adapter_unavailable で失敗しました: Connection refused",
      );
    });

    it("improve() が structured error を返した場合に notificationService.notify() が呼ばれる (TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001)", async () => {
      const notifySpy = vi.fn();
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn(),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail", improveAttemptCount: 1 },
        }),
        recordImproveFailure: vi.fn().mockReturnValue({
          planId: "plan-001",
          currentPhase: "improve",
          awaitingUserInput: null,
          verifyResult: {
            status: "fail",
            nextAction: "improve",
            message:
              "improve が LLM_ADAPTER_NOT_READY で失敗しました: API key not configured",
          },
          resumeTokenEnvelope: {
            version: "task-sdk-02-v1" as const,
            planId: "plan-001",
            currentPhase: "improve",
            artifactCount: 3,
            updatedAt: "2026-04-04T00:00:00.000Z",
          },
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
      const facadeWithNotify = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: mockVerificationEngine as never,
        notificationService: { notify: notifySpy },
      });
      // LLM adapter は ready（improve() まで到達させる）
      facadeWithNotify.setLLMAdapter({
        providerId: "anthropic" as ILLMAdapter["providerId"],
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      } as unknown as ILLMAdapter);
      // improve() が structured error を返すようにモック
      vi.spyOn(facadeWithNotify as never, "improve").mockResolvedValue({
        success: false,
        error: {
          code: "LLM_ADAPTER_NOT_READY",
          message: "API key not configured",
        },
      } as never);

      const result = await facadeWithNotify.verifyAndImproveLoop(
        "plan-001",
        "/tmp/skill",
        "test-skill",
        "api-key",
      );

      expect(result.finalStatus).toBe("error");
      expect(result.errorCode).toBe("LLM_ADAPTER_NOT_READY");
      expect(result.errorMessage).toBe("API key not configured");
      expect(notifySpy).toHaveBeenCalledWith(
        "スキル作成失敗",
        "API key not configured",
      );
    });

    it("improve 結果の suggestions が空でループ停止", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn(),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail" },
        }),
        recordImproveFailure: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail", nextAction: "improve" },
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

    it("EC-03: applyImprovement の applied が 0 でループ停止", async () => {
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn(),
        recordImproveAttempt: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail" },
        }),
        recordImproveFailure: vi.fn().mockReturnValue({
          currentPhase: "improve",
          verifyResult: { status: "fail", nextAction: "improve" },
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

    // ================================================================
    // feedback history accumulation tests
    // task-ut-p0-02-001-repeat-feedback-memory Phase 4
    // ================================================================
    describe("feedback history accumulation", () => {
      function createLoopMocks(overrides: {
        sendChat: ReturnType<typeof vi.fn>;
        verify: ReturnType<typeof vi.fn>;
        maxImproveRetry?: number;
      }) {
        const mockWorkflowEngine = {
          recordVerifyPass: vi.fn().mockReturnValue({
            currentPhase: "verify",
            verifyResult: { status: "pass", nextAction: "handoff" },
          }),
          recordImproveAttempt: vi.fn().mockReturnValue({
            currentPhase: "improve",
            verifyResult: { status: "fail", improveAttemptCount: 1 },
          }),
          recordVerifyFailure: vi.fn().mockReturnValue({
            currentPhase: "review",
            verifyResult: { status: "fail" },
          }),
          getWorkflowState: vi.fn(),
          getImproveAttemptCount: vi.fn().mockReturnValue(0),
        };
        const mockLLMAdapter = {
          providerId: "anthropic",
          sendChat: overrides.sendChat,
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
        return new RuntimeSkillCreatorFacade({
          skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
          workflowEngine: mockWorkflowEngine as never,
          verificationEngine: {
            verify: overrides.verify,
          } as never,
          llmAdapter: mockLLMAdapter as never,
          skillFileManager: mockSkillFileManager as never,
          resourceLoader: mockResourceLoader as never,
          maxImproveRetry: overrides.maxImproveRetry ?? 3,
        });
      }

      function makeImproveResponse(section: string, reason: string) {
        return {
          content: JSON.stringify({
            improvements: [
              {
                section,
                issue: reason,
                pattern: "Fix",
                before: "old content",
                after: "updated content",
              },
            ],
          }),
          model: "claude-sonnet-4-20250514",
          usage: {
            promptTokens: 100,
            completionTokens: 50,
            totalTokens: 150,
          },
        };
      }

      // TC-01: 初回 improve で履歴なしの feedback
      it("TC-01: 初回 improve では過去の改善試行履歴セクションを含まない", async () => {
        const failChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "error" as const,
            summary: "SKILL.md に必須セクションが不足",
          },
        ];
        const passChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "info" as const,
            summary: "OK",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(
            makeImproveResponse("SKILL.md", "セクション追加"),
          );
        const verify = vi
          .fn()
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(passChecks);

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        const result = await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        expect(result.finalStatus).toBe("pass");
        expect(result.totalAttempts).toBe(1);

        const firstFeedback = sendChat.mock.calls[0][0].messages[0]
          .content as string;
        expect(firstFeedback).toContain("SKILL.md に必須セクションが不足");
        expect(firstFeedback).not.toContain("過去の改善試行履歴");
      });

      // TC-02: 2回目の improve で1件の履歴が含まれる
      it("TC-02: 2回目の improve で1件の試行履歴が feedback に含まれる", async () => {
        const failChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "error" as const,
            summary: "SKILL.md に必須セクションが不足",
          },
        ];
        const passChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "info" as const,
            summary: "OK",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(
            makeImproveResponse("SKILL.md", "セクション追加"),
          )
          .mockResolvedValueOnce(
            makeImproveResponse("SKILL.md", "フォーマット修正"),
          );
        const verify = vi
          .fn()
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(passChecks);

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        const result = await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        expect(result.finalStatus).toBe("pass");
        expect(result.totalAttempts).toBe(2);

        const secondFeedback = sendChat.mock.calls[1][0].messages[0]
          .content as string;
        expect(secondFeedback).toContain("過去の改善試行履歴");
        expect(secondFeedback).toContain("試行 1");
        expect(secondFeedback).toContain("L2-SECTION");
        expect(secondFeedback).toContain("セクション追加");
      });

      // TC-03: 3回目の improve で試行1・2の両方の情報が含まれる
      it("TC-03: 3回目の improve で試行1・2の履歴が feedback に含まれる", async () => {
        const failChecksA = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "error" as const,
            summary: "SKILL.md に必須セクションが不足",
          },
          {
            id: "L3-AGENT",
            layer: "layer3" as const,
            severity: "error" as const,
            summary: "agents/ のフォーマット不正",
          },
        ];
        const failChecksB = [
          {
            id: "L3-AGENT",
            layer: "layer3" as const,
            severity: "error" as const,
            summary: "agents/ のフォーマット不正",
          },
        ];
        const passChecks = [
          {
            id: "L3-AGENT",
            layer: "layer3" as const,
            severity: "info" as const,
            summary: "OK",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(
            makeImproveResponse("SKILL.md", "セクション追加"),
          )
          .mockResolvedValueOnce(
            makeImproveResponse("agents/", "テーブルフォーマット修正"),
          )
          .mockResolvedValueOnce(
            makeImproveResponse("agents/", "根本的にアプローチ変更"),
          );
        const verify = vi
          .fn()
          .mockResolvedValueOnce(failChecksA)
          .mockResolvedValueOnce(failChecksB)
          .mockResolvedValueOnce(failChecksB)
          .mockResolvedValueOnce(passChecks);

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        const result = await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        expect(result.finalStatus).toBe("pass");
        expect(result.totalAttempts).toBe(3);

        const thirdFeedback = sendChat.mock.calls[2][0].messages[0]
          .content as string;
        // 試行1と試行2の両方の情報が含まれていること
        expect(thirdFeedback).toContain("過去の改善試行履歴");
        expect(thirdFeedback).toContain("試行 1");
        expect(thirdFeedback).toContain("試行 2");
        expect(thirdFeedback).toContain("セクション追加");
        expect(thirdFeedback).toContain("テーブルフォーマット修正");
        // 繰り返し失敗チェックの警告
        expect(thirdFeedback).toContain("L3-AGENT");
      });

      // TC-04: maxImproveRetry 到達時の feedbackHistory 件数
      it("TC-04: maxImproveRetry 到達時に全試行の履歴が蓄積されている", async () => {
        const failChecks = [
          {
            id: "L1-001",
            layer: "layer1" as const,
            severity: "error" as const,
            summary: "SKILL.md missing",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValue(makeImproveResponse("SKILL.md", "修正試行"));
        const verify = vi.fn().mockResolvedValue(failChecks);

        const facadeWithLoop = createLoopMocks({
          sendChat,
          verify,
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
        expect(sendChat).toHaveBeenCalledTimes(3);

        // 3回目のfeedbackに試行1・2の情報が含まれていること
        const thirdFeedback = sendChat.mock.calls[2][0].messages[0]
          .content as string;
        expect(thirdFeedback).toContain("過去の改善試行履歴");
        expect(thirdFeedback).toContain("試行 1");
        expect(thirdFeedback).toContain("試行 2");
      });

      // TC-05: buildImproveFeedback に空履歴 → チェック結果のみ（後方互換性）
      it("TC-05: 初回呼び出し時は履歴セクションなしでチェック結果のみ返す", async () => {
        const failChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "error" as const,
            summary: "セクション不足",
          },
        ];
        const passChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "info" as const,
            summary: "OK",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(makeImproveResponse("SKILL.md", "修正"));
        const verify = vi
          .fn()
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(passChecks);

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        const firstFeedback = sendChat.mock.calls[0][0].messages[0]
          .content as string;
        expect(firstFeedback).toContain("セクション不足");
        expect(firstFeedback).not.toContain("過去の改善試行履歴");
        expect(firstFeedback).not.toContain("前回の改善要約");
      });

      // TC-06: 複数履歴で「過去の改善試行履歴」セクションが正しく構造化される
      it("TC-06: 複数試行後の feedback に「異なる戦略を提案」の指示文が含まれる", async () => {
        const failChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "error" as const,
            summary: "SKILL.md に必須セクションが不足",
          },
        ];
        const passChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "info" as const,
            summary: "OK",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(makeImproveResponse("SKILL.md", "修正A"))
          .mockResolvedValueOnce(makeImproveResponse("SKILL.md", "修正B"));
        const verify = vi
          .fn()
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(passChecks);

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        const secondFeedback = sendChat.mock.calls[1][0].messages[0]
          .content as string;
        expect(secondFeedback).toContain("過去の改善試行履歴");
        expect(secondFeedback).toContain("異なる戦略を提案");
      });

      // ================================================================
      // Phase 6: エッジケーステスト
      // ================================================================

      // EC-01: maxImproveRetry=1 の場合（履歴蓄積なしで loopExhausted）
      it("EC-01: maxImproveRetry=1 では履歴なしの feedback で1回 improve 後に loopExhausted", async () => {
        const failChecks = [
          {
            id: "L1-001",
            layer: "layer1" as const,
            severity: "error" as const,
            summary: "SKILL.md missing",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(makeImproveResponse("SKILL.md", "修正試行"));
        const verify = vi.fn().mockResolvedValue(failChecks);

        const facadeWithLoop = createLoopMocks({
          sendChat,
          verify,
          maxImproveRetry: 1,
        });
        const result = await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        expect(result.finalStatus).toBe("fail");
        expect(result.totalAttempts).toBe(1);
        expect(result.loopExhausted).toBe(true);
        expect(sendChat).toHaveBeenCalledTimes(1);

        // 初回なので履歴セクションなし
        const firstFeedback = sendChat.mock.calls[0][0].messages[0]
          .content as string;
        expect(firstFeedback).not.toContain("過去の改善試行履歴");
      });

      // EC-02: improve が suggestions 空を返した場合
      it("EC-02: suggestions 空の場合は improveSummary が空文字でもループ停止する", async () => {
        const failChecks = [
          {
            id: "L1-001",
            layer: "layer1" as const,
            severity: "error" as const,
            summary: "SKILL.md missing",
          },
        ];
        const sendChat = vi.fn().mockResolvedValue({
          content: JSON.stringify({ improvements: [] }),
          model: "claude-sonnet-4-20250514",
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        });
        const verify = vi.fn().mockResolvedValue(failChecks);
        const mockSkillFileManager = {
          readFile: vi.fn().mockResolvedValue("content"),
          getSkillDir: vi.fn().mockReturnValue("/tmp/skill"),
        };
        const mockResourceLoader = {
          loadAgent: vi.fn().mockResolvedValue("improve agent prompt"),
          getBasePath: vi.fn().mockReturnValue("/tmp/skill-creator"),
        };
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
        const facadeWithLoop = new RuntimeSkillCreatorFacade({
          skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
          workflowEngine: mockWorkflowEngine as never,
          verificationEngine: { verify } as never,
          llmAdapter: {
            providerId: "anthropic",
            sendChat,
            streamChat: vi.fn(),
            checkHealth: vi.fn(),
          } as never,
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

        // suggestions 空でループ停止（"改善提案なし"）
        expect(result.finalStatus).toBe("fail");
        expect(result.errorMessage).toContain("改善提案なし");
      });

      // EC-04: verifySkill が例外を投げた場合
      it("EC-04: verifySkill 例外時に feedbackHistory が破壊されずエラー返却", async () => {
        const verify = vi
          .fn()
          .mockRejectedValueOnce(new Error("verify network error"));
        const sendChat = vi.fn();

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        const result = await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        expect(result.finalStatus).toBe("error");
        expect(result.errorMessage).toContain("verify network error");
        expect(sendChat).not.toHaveBeenCalled();
      });

      // ================================================================
      // Phase 6: buildImproveFeedback 単体テスト（統合パス経由）
      // ================================================================

      // BF-01: 空配列 → チェック結果のみ（TC-05と同等だが明示的に検証）
      it("BF-01: 履歴なしの場合は「過去の改善試行履歴」セクションが生成されない", async () => {
        const failChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "error" as const,
            summary: "セクション不足",
          },
        ];
        const passChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "info" as const,
            summary: "OK",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(makeImproveResponse("SKILL.md", "修正"));
        const verify = vi
          .fn()
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(passChecks);

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        const feedback = sendChat.mock.calls[0][0].messages[0]
          .content as string;
        expect(feedback).toContain("セクション不足");
        expect(feedback).not.toContain("過去の改善試行履歴");
        expect(feedback).not.toContain("試行 1");
      });

      // BF-02: 1件履歴 → 試行1の情報が出力
      it("BF-02: 1件履歴で試行1の失敗チェックと改善要約が出力される", async () => {
        const failChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "error" as const,
            summary: "必須セクション不足",
          },
        ];
        const passChecks = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "info" as const,
            summary: "OK",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(
            makeImproveResponse("SKILL.md", "セクション追加"),
          )
          .mockResolvedValueOnce(makeImproveResponse("SKILL.md", "再修正"));
        const verify = vi
          .fn()
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(failChecks)
          .mockResolvedValueOnce(passChecks);

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        const secondFeedback = sendChat.mock.calls[1][0].messages[0]
          .content as string;
        expect(secondFeedback).toContain("過去の改善試行履歴（1回試行済み）");
        expect(secondFeedback).toContain("試行 1/2");
        expect(secondFeedback).toContain("L2-SECTION");
        expect(secondFeedback).toContain("セクション追加");
      });

      // BF-03: 3件履歴 → 全試行が番号付きで出力
      it("BF-03: 3件履歴で全試行が番号付きで出力される", async () => {
        const failChecks = [
          {
            id: "L1-001",
            layer: "layer1" as const,
            severity: "error" as const,
            summary: "SKILL.md missing",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValue(makeImproveResponse("SKILL.md", "修正"));
        const verify = vi.fn().mockResolvedValue(failChecks);

        const facadeWithLoop = createLoopMocks({
          sendChat,
          verify,
          maxImproveRetry: 4,
        });
        const result = await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        expect(result.totalAttempts).toBe(4);
        expect(sendChat).toHaveBeenCalledTimes(4);

        // 4回目のfeedbackに試行1〜3の情報が含まれていること
        const fourthFeedback = sendChat.mock.calls[3][0].messages[0]
          .content as string;
        expect(fourthFeedback).toContain("過去の改善試行履歴（3回試行済み）");
        expect(fourthFeedback).toContain("試行 1/4");
        expect(fourthFeedback).toContain("試行 2/4");
        expect(fourthFeedback).toContain("試行 3/4");
      });

      // BF-04: failedChecks が異なるパターンで構造が壊れない
      it("BF-04: 異なるfailedChecksパターンでも構造が壊れない", async () => {
        const failChecksA = [
          {
            id: "L2-SECTION",
            layer: "layer2" as const,
            severity: "error" as const,
            summary: "SKILL.md に必須セクションが不足",
          },
          {
            id: "L3-AGENT",
            layer: "layer3" as const,
            severity: "warning" as const,
            summary: "agents/ のフォーマット不正",
          },
        ];
        const failChecksB = [
          {
            id: "L3-AGENT",
            layer: "layer3" as const,
            severity: "error" as const,
            summary: "agents/ のフォーマット不正",
          },
        ];
        const passChecks = [
          {
            id: "L3-AGENT",
            layer: "layer3" as const,
            severity: "info" as const,
            summary: "OK",
          },
        ];
        const sendChat = vi
          .fn()
          .mockResolvedValueOnce(
            makeImproveResponse("SKILL.md", "セクション修正"),
          )
          .mockResolvedValueOnce(
            makeImproveResponse("agents/", "エージェント修正"),
          );
        const verify = vi
          .fn()
          .mockResolvedValueOnce(failChecksA)
          .mockResolvedValueOnce(failChecksB)
          .mockResolvedValueOnce(passChecks);

        const facadeWithLoop = createLoopMocks({ sendChat, verify });
        const result = await facadeWithLoop.verifyAndImproveLoop(
          "plan-001",
          "/tmp/skill",
          "test-skill",
          "api-key",
          "sk-test",
        );

        expect(result.finalStatus).toBe("pass");
        expect(result.totalAttempts).toBe(2);

        const secondFeedback = sendChat.mock.calls[1][0].messages[0]
          .content as string;
        // 試行1のfailedChecksが正しく記録されている
        expect(secondFeedback).toContain("L2-SECTION");
        expect(secondFeedback).toContain("L3-AGENT");
        // 繰り返し失敗チェック（L3-AGENTが両方に含まれる）
        expect(secondFeedback).toContain("繰り返し失敗中のチェック");
        expect(secondFeedback).toContain("L3-AGENT");
      });
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
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_123);

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

      const auditSink = (
        facadeWithDI as unknown as {
          auditSink: {
            getEventsBySession: (
              sessionId: string,
            ) => Array<{ eventType: string }>;
          };
        }
      ).auditSink;
      const events = auditSink.getEventsBySession("plan-1710000000123");
      expect(events.map((event) => event.eventType)).toEqual([
        "session_start",
        "session_end",
      ]);
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
