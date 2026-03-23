/**
 * RuntimeSkillCreatorFacade.plan() LLM Integration Tests
 *
 * TASK-SC-03-PLAN-LLM-PROMPT
 * Phase 4: テストファースト（TDD Red phase）
 *
 * 既存テスト（RuntimeSkillCreatorFacade.test.ts）はスタブ実装のテスト。
 * 本ファイルは LLM 呼び出し統合後の plan() テストを担当する。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { TerminalHandoffBuilder } from "../TerminalHandoffBuilder";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";

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
  describe("Graceful degradation", () => {
    it("llmAdapter 未注入時はスタブレスポンスを返す", async () => {
      const facadeWithoutLLM = new RuntimeSkillCreatorFacade({
        skillExecutor: mockSkillExecutor,
        // llmAdapter 未指定
        // resourceLoader 未指定
      });
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_000);

      const result = await facadeWithoutLLM.plan(
        "テスト入力",
        "api-key",
        "sk-test",
      );

      // スタブレスポンス（LLM フィールドは空）
      expect(result).toHaveProperty("planId", "plan-1710000000000");
      expect(result).toHaveProperty("skillSpec", "テスト入力");
      expect(result).toHaveProperty("estimatedSteps", 3);
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
