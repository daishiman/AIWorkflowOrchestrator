/**
 * RuntimeSkillCreatorFacade.plan() LLM Integration Tests
 *
 * TASK-SC-03-PLAN-LLM-PROMPT
 * Phase 4: テストファースト（TDD Red phase）
 *
 * 既存テスト（RuntimeSkillCreatorFacade.test.ts）はスタブ実装のテスト。
 * 本ファイルは LLM 呼び出し統合後の plan() テストを担当する。
 */

import fs from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LoadedWorkflowManifest } from "@repo/shared/types";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { ManifestLoader } from "../ManifestLoader";
import { TerminalHandoffBuilder } from "../TerminalHandoffBuilder";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import {
  PLAN_PROMPT_CONSTANTS,
  PLAN_RESOURCE_REQUESTS,
} from "../planPromptConstants";

// --- Mock factories ---

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
    getBasePath: () => "/tmp/skill-creator",
    loadAgent: vi.fn(),
  };
}

function createMockSkillExecutor(): SkillExecutor {
  return {
    execute: vi.fn(),
  } as unknown as SkillExecutor;
}

/** 有効な LLM レスポンス JSON を生成する */
function validPlanResponseJson() {
  return JSON.stringify({
    skillName: "github-issue-classifier",
    description: "GitHubのIssueを自動分類するスキル",
    agents: [
      { name: "classify-issues", role: "Issueの内容を分析して分類する" },
    ],
    scripts: [
      { name: "validate-labels.js", purpose: "ラベルの妥当性を検証する" },
    ],
    triggers: ["GitHub Issue作成時"],
    anchors: ["GitHub API v4"],
  });
}

function createDynamicManifest(
  overrides: Partial<LoadedWorkflowManifest> = {},
): LoadedWorkflowManifest {
  return {
    schemaVersion: 1 as const,
    workflowId: "skill-creator",
    sourcePath: "/tmp/skill-creator/workflow-manifest.json",
    manifestDir: "/tmp/skill-creator",
    manifestMtimeMs: 1,
    resourceDescriptorHash: "manifest-hash",
    cacheKey: "manifest-cache-key",
    phases: [
      {
        id: "plan",
        title: "Plan Phase",
        resourceIds: ["plan-agent", "plan-reference"],
        entryHookId: "plan-entry",
        exitHookId: "plan-exit",
      },
      {
        id: "improve",
        title: "Improve Phase",
        resourceIds: ["improve-agent"],
        entryHookId: "improve-entry",
        exitHookId: "improve-exit",
      },
    ],
    resources: [
      {
        id: "plan-agent",
        kind: "agent",
        path: "./agents/plan-agent.md",
        absolutePath: "/tmp/skill-creator/agents/plan-agent.md",
      },
      {
        id: "plan-reference",
        kind: "reference",
        path: "./references/plan-reference.md",
        absolutePath: "/tmp/skill-creator/references/plan-reference.md",
      },
      {
        id: "improve-agent",
        kind: "agent",
        path: "./agents/improve-agent.md",
        absolutePath: "/tmp/skill-creator/agents/improve-agent.md",
      },
    ],
    entry: [],
    exit: [],
    ...overrides,
  };
}

function createEmptyPlanningResult() {
  return {
    resources: [],
    droppedResources: [],
    degradeReasons: [],
    snapshot: {
      candidateRoots: [],
      selectedResourceIds: [],
      droppedResourceIds: [],
      selectedRoots: [],
      degradeReasons: [],
    },
  };
}

describe("RuntimeSkillCreatorFacade.plan() LLM Integration", () => {
  let mockLLMAdapter: ILLMAdapter;
  let mockResourceLoader: ReturnType<typeof createMockResourceLoader>;
  let mockSkillExecutor: SkillExecutor;
  let facade: RuntimeSkillCreatorFacade;

  beforeEach(() => {
    mockLLMAdapter = createMockLLMAdapter();
    mockResourceLoader = createMockResourceLoader();
    mockSkillExecutor = createMockSkillExecutor();

    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      llmAdapter: mockLLMAdapter,
      resourceLoader: mockResourceLoader as never,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------------
  // 1. LLM 呼び出し検証テスト
  // ------------------------------------------------------------------
  describe("LLM 呼び出し検証", () => {
    it("integrated_api 判定時、ResourceLoader で3つの agent 仕様書を読み込む", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("discover-problem content")
        .mockResolvedValueOnce("design-workflow content")
        .mockResolvedValueOnce("plan-structure content");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      await facade.plan(
        "GitHubのIssueを自動分類するスキルを作りたい",
        "api-key",
        "sk-test",
      );

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

    it("system プロンプトに agent 仕様書3ファイルの内容が含まれる", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("DISCOVER_CONTENT")
        .mockResolvedValueOnce("DESIGN_CONTENT")
        .mockResolvedValueOnce("PLAN_CONTENT");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      await facade.plan("テスト入力", "api-key", "sk-test");

      const sendChatCall = (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>)
        .mock.calls[0][0];
      expect(sendChatCall.systemPrompt).toContain("DISCOVER_CONTENT");
      expect(sendChatCall.systemPrompt).toContain("DESIGN_CONTENT");
      expect(sendChatCall.systemPrompt).toContain("PLAN_CONTENT");
    });

    it("user プロンプトに入力テキストが含まれる", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent1")
        .mockResolvedValueOnce("agent2")
        .mockResolvedValueOnce("agent3");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      const inputText = "Slackメッセージを要約してNotionに保存するスキル";
      await facade.plan(inputText, "api-key", "sk-test");

      const sendChatCall = (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>)
        .mock.calls[0][0];
      expect(sendChatCall.messages[0].content).toBe(inputText);
    });
  });

  // ------------------------------------------------------------------
  // 2. JSON スキーマ準拠テスト
  // ------------------------------------------------------------------
  describe("JSON スキーマ準拠", () => {
    it("有効な JSON レスポンスを RuntimeSkillCreatorPlanResult にパースする", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent1")
        .mockResolvedValueOnce("agent2")
        .mockResolvedValueOnce("agent3");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_000);

      const result = await facade.plan("テスト入力", "api-key", "sk-test");

      // terminal_handoff ではないことを確認
      expect(result).not.toHaveProperty("type", "terminal_handoff");

      // 必須フィールドの存在確認
      const planResult = result as {
        planId: string;
        skillSpec: string;
        estimatedSteps: number;
        skillName: string;
        description: string;
        agents: Array<{ name: string; role: string }>;
        scripts: Array<{ name: string; purpose: string }>;
        triggers: string[];
        anchors: string[];
      };

      expect(planResult.planId).toBe("plan-1710000000000");
      expect(planResult.skillSpec).toBe("テスト入力");
      expect(planResult.skillName).toBe("github-issue-classifier");
      expect(planResult.description).toBe("GitHubのIssueを自動分類するスキル");
      expect(planResult.agents).toEqual([
        { name: "classify-issues", role: "Issueの内容を分析して分類する" },
      ]);
      expect(planResult.scripts).toEqual([
        {
          name: "validate-labels.js",
          purpose: "ラベルの妥当性を検証する",
        },
      ]);
      expect(planResult.triggers).toEqual(["GitHub Issue作成時"]);
      expect(planResult.anchors).toEqual(["GitHub API v4"]);
      // estimatedSteps = agents.length + scripts.length
      expect(planResult.estimatedSteps).toBe(2);
    });
  });

  // ------------------------------------------------------------------
  // 3. terminal_handoff 経路の非破壊テスト
  // ------------------------------------------------------------------
  describe("terminal_handoff 経路の非破壊", () => {
    it("terminal_handoff 判定時、LLM 呼び出しが行われない", async () => {
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
        terminalCommand: 'claude -p "Skill を作成してください: spec"',
        contextSummary: "surface=skill skill=unknown",
        reason: "terminal_handoff",
      };
      vi.spyOn(
        TerminalHandoffBuilder.prototype,
        "buildForSurface",
      ).mockReturnValue(handoffGuidance);

      const result = await facade.plan("spec", "subscription", null);

      // LLM は呼ばれない
      expect(mockLLMAdapter.sendChat).not.toHaveBeenCalled();
      // ResourceLoader も呼ばれない
      expect(mockResourceLoader.loadAgent).not.toHaveBeenCalled();
      // terminal_handoff が返る
      expect(result).toEqual({
        type: "terminal_handoff",
        guidance: handoffGuidance,
      });
    });

    it("terminal_handoff のレスポンス構造が guidance 形式", async () => {
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
      const expectedGuidance = {
        terminalCommand: 'claude -p "Skill を作成してください: my-spec"',
        contextSummary: "surface=skill skill=unknown",
        reason: "terminal_handoff",
      };
      vi.spyOn(
        TerminalHandoffBuilder.prototype,
        "buildForSurface",
      ).mockReturnValue(expectedGuidance);

      const result = await facade.plan("my-spec", "subscription", null);

      expect(result).toHaveProperty("type", "terminal_handoff");
      expect(result).toHaveProperty("guidance");
      const guidance = (
        result as { type: string; guidance: typeof expectedGuidance }
      ).guidance;
      expect(guidance).toHaveProperty("terminalCommand");
      expect(guidance).toHaveProperty("contextSummary");
      expect(guidance).toHaveProperty("reason", "terminal_handoff");
    });
  });

  // ------------------------------------------------------------------
  // 4. Graceful degradation テスト
  // ------------------------------------------------------------------
  describe("Graceful degradation → explicit error (TASK-RT-02)", () => {
    it("llmAdapter 未注入時は initializing エラーを返す (TASK-RT-01)", async () => {
      const facadeWithoutLLM = new RuntimeSkillCreatorFacade({
        skillExecutor: mockSkillExecutor,
        // llmAdapter 未指定 → status === "initializing"
      });

      const result = await facadeWithoutLLM.plan(
        "テスト入力",
        "api-key",
        "sk-test",
      );

      // TASK-RT-01: initializing ステータスチェックが resolveDecision より先に実行
      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLMAdapter の初期化中です。しばらくお待ちください",
        },
      });
    });

    it("resourceLoader 未注入時は resource_loader_unavailable を返す", async () => {
      const facadeWithLLMOnly = new RuntimeSkillCreatorFacade({
        skillExecutor: mockSkillExecutor,
        llmAdapter: mockLLMAdapter,
        // resourceLoader 未指定
      });
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      const result = await facadeWithLLMOnly.plan(
        "テスト入力",
        "api-key",
        "sk-test",
      );

      expect(result).toEqual({
        success: false,
        error: {
          code: "resource_loader_unavailable",
          message: "リソースローダーが利用できません。設定を確認してください。",
        },
      });
    });
  });

  // ------------------------------------------------------------------
  // 5. エラーハンドリングテスト（Phase 6 拡充）
  // ------------------------------------------------------------------
  describe("エラーハンドリング", () => {
    beforeEach(() => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent1")
        .mockResolvedValueOnce("agent2")
        .mockResolvedValueOnce("agent3");
    });

    it("LLM が空文字列を返した場合、パースエラーがスローされる", async () => {
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: "",
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 0, totalTokens: 100 },
      });

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow();
    });

    it("LLM が JSON でない文字列を返した場合、パースエラーがスローされる", async () => {
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: "This is not JSON, just plain text.",
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 10, totalTokens: 110 },
      });

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow();
    });

    it("LLM が部分的 JSON（skillName 欠如）を返した場合、バリデーションエラーがスローされる", async () => {
      const partialJson = JSON.stringify({
        description: "テスト",
        agents: [{ name: "a", role: "r" }],
        scripts: [],
        triggers: [],
        anchors: [],
        // skillName が欠如
      });
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: partialJson,
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 20, totalTokens: 120 },
      });

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow("LLM response does not match expected plan schema");
    });

    it("LLM が agents 空配列を返した場合、バリデーションエラーがスローされる", async () => {
      const emptyAgents = JSON.stringify({
        skillName: "test-skill",
        description: "テスト",
        agents: [], // 1件以上必要
        scripts: [],
        triggers: [],
        anchors: [],
      });
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: emptyAgents,
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 20, totalTokens: 120 },
      });

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow("LLM response does not match expected plan schema");
    });

    it("LLM API がタイムアウトした場合、エラーが伝播する", async () => {
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Request timeout after 30000ms"),
      );

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow("Request timeout after 30000ms");
    });

    it("LLM がMarkdownコードブロック付きJSONを返した場合、正常にパースされる", async () => {
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: "```json\n" + validPlanResponseJson() + "\n```",
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      const result = await facade.plan("テスト入力", "api-key", "sk-test");
      expect(result).not.toHaveProperty("type", "terminal_handoff");
      expect(result).toHaveProperty("skillName", "github-issue-classifier");
    });
  });

  // ------------------------------------------------------------------
  // TASK-P0-07: agent 名導出テスト（T-P7-02, T-P7-04）
  // ------------------------------------------------------------------
  describe("TASK-P0-07: PLAN_RESOURCE_REQUESTS からの agent 名導出", () => {
    it("T-P7-02: PLAN_RESOURCE_REQUESTS に reference エントリがあっても agent 名導出に混ざらない", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      // discover-problem, design-workflow, plan-structure のみ loadAgent が呼ばれることを確認
      // overview（reference エントリ）は呼ばれない
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("discover-problem content")
        .mockResolvedValueOnce("design-workflow content")
        .mockResolvedValueOnce("plan-structure content");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      await facade.plan("テスト入力", "api-key", "sk-test");

      // agent エントリ 3 件のみ呼ばれ、reference（overview）は呼ばれない
      expect(mockResourceLoader.loadAgent).toHaveBeenCalledTimes(3);
      expect(mockResourceLoader.loadAgent).not.toHaveBeenCalledWith("overview");
    });

    it("T-P7-04: AGENT_NAMES の残留参照が runtime services にない（PLAN_RESOURCE_REQUESTS が唯一の source of truth）", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent1")
        .mockResolvedValueOnce("agent2")
        .mockResolvedValueOnce("agent3");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      await facade.plan("テスト入力", "api-key", "sk-test");

      // PLAN_RESOURCE_REQUESTS の agent エントリの id（discover-problem / design-workflow / plan-structure）が
      // AGENT_NAMES を介さずに loadAgent に渡されている
      const calls = (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mock.calls.map((call) => call[0] as string);
      expect(calls).toEqual([
        "discover-problem",
        "design-workflow",
        "plan-structure",
      ]);
    });
  });

  // ------------------------------------------------------------------
  // TASK-P0-07: manifest 動的解決
  // ------------------------------------------------------------------
  describe("TASK-P0-07: manifest 動的解決", () => {
    it("T-P7-05: plan() の dynamic pipeline で manifest 由来の resourceIds が resourcePlanner に渡る", async () => {
      const manifest = createDynamicManifest();
      vi.spyOn(ManifestLoader.prototype, "loadManifest").mockResolvedValue(
        manifest,
      );
      vi.spyOn(fs, "access").mockResolvedValue(undefined);
      const mockSourceResolverResolve = vi.fn().mockResolvedValue({
        candidateRoots: [],
        manifestResources: new Map(),
        rejectedRoots: [],
        degradeReasons: [],
      });
      const mockResourcePlannerPlan = vi
        .fn()
        .mockResolvedValue(createEmptyPlanningResult());
      const dynamicResourceLoader = {
        getBasePath: () => "/tmp/skill-creator",
        loadAgent: vi.fn(),
      };

      const dynamicFacade = new RuntimeSkillCreatorFacade({
        skillExecutor: mockSkillExecutor,
        llmAdapter: mockLLMAdapter,
        resourceLoader: dynamicResourceLoader as never,
        sourceResolver: {
          resolve: mockSourceResolverResolve,
        } as never,
        resourcePlanner: {
          plan: mockResourcePlannerPlan,
        } as never,
        resolvedResourceReader: {
          readText: vi.fn(),
        } as never,
      });

      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      await dynamicFacade.plan("テスト入力", "api-key", "sk-test");

      const planCall = mockResourcePlannerPlan.mock.calls[0][0];
      const sourceResolverCall = mockSourceResolverResolve.mock.calls[0][0];

      expect(planCall.operation).toBe("plan");
      expect(planCall.maxBytes).toBe(
        PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
      );
      expect(planCall.requests).toEqual([
        {
          id: "plan-agent",
          kind: "agent",
          relativePath: "agents/plan-agent.md",
          tier: "required-core",
          required: true,
        },
        {
          id: "plan-reference",
          kind: "reference",
          relativePath: "references/plan-reference.md",
          tier: "optional-quality",
          required: false,
        },
      ]);
      expect(sourceResolverCall.requiredRelativePaths).toEqual([
        "agents/plan-agent.md",
      ]);
      expect(dynamicResourceLoader.loadAgent).not.toHaveBeenCalled();
    });

    it.each([
      {
        caseName: "plan フェーズが存在しない",
        manifest: createDynamicManifest({
          phases: [
            {
              id: "improve",
              title: "Improve Phase",
              resourceIds: ["improve-agent"],
              entryHookId: "improve-entry",
              exitHookId: "improve-exit",
            },
          ],
        }),
      },
      {
        caseName: "plan フェーズの resourceIds が空",
        manifest: createDynamicManifest({
          phases: [
            {
              id: "plan",
              title: "Plan Phase",
              resourceIds: [],
              entryHookId: "plan-entry",
              exitHookId: "plan-exit",
            },
          ],
        }),
      },
    ])(
      "T-P7-06/T-P7-07: $caseName の場合は PLAN_RESOURCE_REQUESTS にフォールバックする",
      async ({ manifest }) => {
        vi.spyOn(ManifestLoader.prototype, "loadManifest").mockResolvedValue(
          manifest,
        );
        vi.spyOn(fs, "access").mockResolvedValue(undefined);
        const mockSourceResolverResolve = vi.fn().mockResolvedValue({
          candidateRoots: [],
          manifestResources: new Map(),
          rejectedRoots: [],
          degradeReasons: [],
        });
        const resourcePlannerPlan = vi
          .fn()
          .mockResolvedValue(createEmptyPlanningResult());
        const dynamicResourceLoader = {
          getBasePath: () => "/tmp/skill-creator",
          loadAgent: vi.fn(),
        };

        const dynamicFacade = new RuntimeSkillCreatorFacade({
          skillExecutor: mockSkillExecutor,
          llmAdapter: mockLLMAdapter,
          resourceLoader: dynamicResourceLoader as never,
          sourceResolver: {
            resolve: mockSourceResolverResolve,
          } as never,
          resourcePlanner: {
            plan: resourcePlannerPlan,
          } as never,
          resolvedResourceReader: {
            readText: vi.fn(),
          } as never,
        });

        (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue(
          {
            content: validPlanResponseJson(),
            model: "claude-sonnet-4-20250514",
            usage: {
              promptTokens: 100,
              completionTokens: 50,
              totalTokens: 150,
            },
          },
        );

        await dynamicFacade.plan("テスト入力", "api-key", "sk-test");

        expect(resourcePlannerPlan).toHaveBeenCalledTimes(1);
        expect(resourcePlannerPlan.mock.calls[0][0].operation).toBe("plan");
        expect(resourcePlannerPlan.mock.calls[0][0].requests).toEqual([
          ...PLAN_RESOURCE_REQUESTS,
        ]);
        expect(
          mockSourceResolverResolve.mock.calls[0][0].requiredRelativePaths,
        ).toEqual([
          "agents/discover-problem.md",
          "agents/design-workflow.md",
          "agents/plan-structure.md",
        ]);
        expect(dynamicResourceLoader.loadAgent).not.toHaveBeenCalled();
      },
    );
  });

  // ------------------------------------------------------------------
  // 6. ResourceLoader 失敗テスト
  // ------------------------------------------------------------------
  describe("ResourceLoader 失敗", () => {
    it("1ファイルの読み込みに失敗した場合、エラーが伝播する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent1-content")
        .mockRejectedValueOnce(new Error("ENOENT: file not found"));

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow("ENOENT: file not found");
    });

    it("全ファイルの読み込みに失敗した場合、最初のエラーが伝播する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("EACCES: permission denied"));

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow("EACCES: permission denied");
    });
  });

  // ------------------------------------------------------------------
  // 7. 入力バリデーションテスト（Phase 6 拡充）
  // ------------------------------------------------------------------
  describe("入力バリデーション", () => {
    it("空文字列の入力テキストで plan() を呼んだ場合、バリデーションエラーがスローされる", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      await expect(facade.plan("", "api-key", "sk-test")).rejects.toThrow(
        "skillSpec must be a non-empty string",
      );
    });

    it("スペースのみの入力テキストで plan() を呼んだ場合、バリデーションエラーがスローされる", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      await expect(facade.plan("   ", "api-key", "sk-test")).rejects.toThrow(
        "skillSpec must be a non-empty string",
      );
    });

    it("空文字列入力時も terminal_handoff 経路は正常に動作する", async () => {
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
      vi.spyOn(TerminalHandoffBuilder.prototype, "build").mockReturnValue({
        launcher: "claude",
        promptBundle: "Skill を作成してください: ",
        cwd: process.cwd(),
        suggestedCommand: 'claude -p ""',
        manualRetryRule: "retry",
      });

      // terminal_handoff ではバリデーションスキップ（handoff側が処理）
      const result = await facade.plan("", "subscription", null);
      expect(result).toHaveProperty("type", "terminal_handoff");
    });
  });

  // ------------------------------------------------------------------
  // 8. skillName 空文字列バリデーションテスト（Phase 6 拡充）
  // ------------------------------------------------------------------
  describe("LLM レスポンス skillName バリデーション", () => {
    it("LLM が skillName 空文字列を返した場合、バリデーションエラーがスローされる", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent1")
        .mockResolvedValueOnce("agent2")
        .mockResolvedValueOnce("agent3");

      const emptySkillName = JSON.stringify({
        skillName: "",
        description: "テスト",
        agents: [{ name: "a", role: "r" }],
        scripts: [],
        triggers: [],
        anchors: [],
      });
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: emptySkillName,
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 20, totalTokens: 120 },
      });

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow("LLM response does not match expected plan schema");
    });

    it("LLM が agent の name が空文字列のエントリを返した場合、バリデーションエラーがスローされる", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent1")
        .mockResolvedValueOnce("agent2")
        .mockResolvedValueOnce("agent3");

      const emptyAgentName = JSON.stringify({
        skillName: "test-skill",
        description: "テスト",
        agents: [{ name: "", role: "some role" }],
        scripts: [],
        triggers: [],
        anchors: [],
      });
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: emptyAgentName,
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 20, totalTokens: 120 },
      });

      await expect(
        facade.plan("テスト入力", "api-key", "sk-test"),
      ).rejects.toThrow("LLM response does not match expected plan schema");
    });
  });
});
