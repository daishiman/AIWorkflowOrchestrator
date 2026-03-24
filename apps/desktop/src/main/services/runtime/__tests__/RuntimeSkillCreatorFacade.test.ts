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

    it("integrated_api 判定時は plan 結果を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_000);
      const buildSpy = vi.spyOn(
        TerminalHandoffBuilder.prototype,
        "buildForSurface",
      );

      const result = await facade.plan("line-1\nline-2", "api-key", "sk-test");

      expect(buildSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        planId: "plan-1710000000000",
        skillSpec: "line-1\nline-2",
        estimatedSteps: 3,
        skillName: "",
        description: "",
        category: "standard",
        customizations: {},
        files: [],
        reasoning: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      });
    });

    it("apiKey 未指定の api-key モードでは authKeyService 経由の解決を使う", async () => {
      const resolveSpy = vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      const resolveWithServiceSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolveWithService")
        .mockResolvedValue({
          type: "integrated_api",
          apiKey: "stored-key",
          permissionMode: "default",
        });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_010);

      const result = await facade.plan("spec body", "api-key", null);

      expect(resolveSpy).not.toHaveBeenCalled();
      expect(resolveWithServiceSpy).toHaveBeenCalledWith("api-key");
      expect(result).toEqual({
        planId: "plan-1710000000010",
        skillSpec: "spec body",
        estimatedSteps: 3,
        skillName: "",
        description: "",
        category: "standard",
        customizations: {},
        files: [],
        reasoning: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      });
    });

    it("apiKey 未指定の api-key モードで stored key がない場合は terminal_handoff", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      const resolveWithServiceSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolveWithService")
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
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "buildForSurface")
        .mockReturnValue({
          terminalCommand: 'claude -p "spec"',
          contextSummary: "surface=skill skill=unknown",
          reason: "terminal_handoff",
        });

      const result = await facade.plan("spec", "api-key", null);

      expect(resolveWithServiceSpy).toHaveBeenCalledWith("api-key");
      expect(buildSpy).toHaveBeenCalled();
      expect(result).toHaveProperty("type", "terminal_handoff");
    });

    it("明示的 apiKey が渡された場合は resolveWithService を使わない", async () => {
      const resolveSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolve")
        .mockResolvedValue({
          type: "integrated_api",
          apiKey: "explicit-key",
          permissionMode: "default",
        });
      const resolveWithServiceSpy = vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      );
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_020);

      await facade.plan("spec", "api-key", "explicit-key");

      expect(resolveSpy).toHaveBeenCalledWith("api-key", "explicit-key");
      expect(resolveWithServiceSpy).not.toHaveBeenCalled();
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
      expect(result).toEqual({
        executeId: "exec-001",
        skillName: "my-skill",
        success: true,
        error: undefined,
      });
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

      expect(result).toEqual({
        executeId: "exec-002",
        skillName: longSkillName.substring(0, 50),
        success: false,
        error: "executor failed",
      });
    });

    it("terminal_handoff 判定時でも executor に委譲する（decision は将来使用予定）", async () => {
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

      expect(executeMock).toHaveBeenCalled();
      expect(result).toEqual({
        executeId: "exec-003",
        skillName: "my-skill",
        success: true,
        error: undefined,
      });
    });

    it("apiKey 未指定の api-key モードで resolveWithService が terminal_handoff を返しても executor に委譲する", async () => {
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

      expect(executeMock).toHaveBeenCalled();
      expect(result).toEqual({
        executeId: "exec-004",
        skillName: "spec",
        success: true,
        error: undefined,
      });
    });

    it("明示的 apiKey 指定で terminal_handoff 判定でも executor に委譲する", async () => {
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

      expect(executeMock).toHaveBeenCalled();
      expect(result).toEqual({
        executeId: "exec-005",
        skillName: "spec body",
        success: true,
        error: undefined,
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
      expect(result).toEqual({
        executeId: "exec-006",
        skillName: "spec body",
        success: true,
        error: undefined,
      });
    });

    it("apiKey 未指定の api-key モードで resolveWithService が terminal_handoff でも executor に委譲する", async () => {
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

      expect(executeMock).toHaveBeenCalled();
      expect(result).toEqual({
        executeId: "exec-007",
        skillName: "stored-spec",
        success: true,
        error: undefined,
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
      expect(executeMock).toHaveBeenCalled();
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

    it("integrated_api 判定時（graceful degradation: LLM 未注入）はスタブを返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_001);

      const result = await facade.improve(
        "skill-b",
        "need better validation",
        "api-key",
        "sk-test",
      );

      // llmAdapter/resourceLoader 未注入のため graceful degradation
      expect(result).toEqual({
        improveId: "improve-1710000000001",
        suggestions: [],
      });
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

    it("TC-2: setLLMAdapter() 未呼び出し時、plan() が graceful degradation を返す", async () => {
      const facadeNoLLM = new RuntimeSkillCreatorFacade({
        skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_100);

      const result = await facadeNoLLM.plan("test spec", "api-key", "sk-test");

      expect(result).toEqual({
        planId: "plan-1710000000100",
        skillSpec: "test spec",
        estimatedSteps: 3,
        skillName: "",
        description: "",
        category: "standard",
        customizations: {},
        files: [],
        reasoning: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
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

    it("TC-7: setLLMAdapter(undefined) で graceful degradation に戻る", async () => {
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
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_200);

      // undefined を注入すると graceful degradation に戻る
      facadeWithDI.setLLMAdapter(undefined as unknown as ILLMAdapter);
      const result = await facadeWithDI.plan("test spec", "api-key", "sk-test");

      expect(mockLLMAdapter.sendChat).not.toHaveBeenCalled();
      expect(result).toHaveProperty("skillName", "");
      expect(result).toHaveProperty("agents");
      expect((result as { agents: unknown[] }).agents).toEqual([]);
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
