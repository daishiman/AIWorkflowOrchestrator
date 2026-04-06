/**
 * RuntimeSkillCreatorFacade.improve() LLM Integration Tests
 *
 * TASK-SC-05-IMPROVE-LLM
 * Phase 4: テストファースト（TDD Red phase）
 *
 * テストケース:
 * - I-1: 正常系 LLM 呼び出し
 * - I-2: JSON Schema 検証（section/before/after/reason）
 * - I-3: SKILL.md 読み込みが user プロンプトに含まれる
 * - I-4: 不正 JSON エラーハンドリング（P60: IPC wrapper 形式）
 * - I-5: system プロンプト確認（MINOR-2: IMPROVE_RESPONSE_SCHEMA_INSTRUCTION）
 * - A-1: applyImprovement 正常適用
 * - A-2: applyImprovement before 不一致スキップ
 *
 * Phase 6 テスト拡充:
 * - E-1〜E-5: エラー系テスト
 * - E-6〜E-7: 境界値テスト
 * - E-8: before 不一致スキップ（複数件）
 * - E-9: ReadonlySkillError
 * - E-10〜E-11: graceful degradation
 * - E-12: terminal_handoff 分岐
 * - E-13〜E-14: skillName バリデーション
 * - E-15: buildImproveUserPrompt 単体テスト
 */

import fs from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LoadedWorkflowManifest } from "@repo/shared/types";
import {
  RuntimeSkillCreatorFacade,
  buildImproveUserPrompt,
} from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { ManifestLoader } from "../ManifestLoader";
import { TerminalHandoffBuilder } from "../TerminalHandoffBuilder";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import type { SkillFileManager } from "../../skill/SkillFileManager";
import { IMPROVE_PROMPT_CONSTANTS } from "../improvePromptConstants";

// --- Mock factories (P63: plan.test.ts のインポートパターンに準拠) ---

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

function createMockSkillFileManager(): SkillFileManager {
  return {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    createFile: vi.fn(),
    deleteFile: vi.fn(),
    listBackups: vi.fn(),
    restoreBackup: vi.fn(),
  } as unknown as SkillFileManager;
}

/** 有効な LLM 改善提案レスポンス JSON を生成する */
function validImproveResponseJson() {
  return JSON.stringify({
    skillName: "test-skill",
    targetAgent: "agents/main.md",
    analysisResults: {
      structureScore: 4,
      clarityScore: 3,
      reproducibilityScore: 4,
      efficiencyScore: 3,
    },
    improvements: [
      {
        section: "4. 実行仕様",
        issue: "エラーハンドリングが不足している",
        pattern: "Defensive Programming",
        before: "実行時にエラーが発生した場合",
        after: "実行時にエラーが発生した場合、エラーコードとメッセージを返す",
      },
    ],
    improvedContent: "# 改善後の SKILL.md 全文",
  });
}

/** 複数提案のレスポンス JSON */
function multipleImprovementsJson() {
  return JSON.stringify({
    skillName: "test-skill",
    targetAgent: "agents/main.md",
    analysisResults: {
      structureScore: 3,
      clarityScore: 3,
      reproducibilityScore: 3,
      efficiencyScore: 3,
    },
    improvements: [
      {
        section: "1. 概要",
        issue: "説明が曖昧",
        pattern: "Clarity",
        before: "このスキルは処理を行います",
        after: "このスキルはGitHub Issueを自動分類します",
      },
      {
        section: "4. 実行仕様",
        issue: "手順が不明確",
        pattern: "Step-by-Step",
        before: "手順に従って実行",
        after: "1. Issue取得 2. 分類 3. ラベル付与",
      },
    ],
    improvedContent: "# 改善後全文",
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
        resourceIds: ["plan-agent"],
        entryHookId: "plan-entry",
        exitHookId: "plan-exit",
      },
      {
        id: "improve",
        title: "Improve Phase",
        resourceIds: ["improve-agent", "improve-reference"],
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
        id: "improve-agent",
        kind: "agent",
        path: "./agents/improve-agent.md",
        absolutePath: "/tmp/skill-creator/agents/improve-agent.md",
      },
      {
        id: "improve-reference",
        kind: "reference",
        path: "./references/improve-reference.md",
        absolutePath: "/tmp/skill-creator/references/improve-reference.md",
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

describe("RuntimeSkillCreatorFacade.improve() LLM Integration", () => {
  let mockLLMAdapter: ILLMAdapter;
  let mockResourceLoader: ReturnType<typeof createMockResourceLoader>;
  let mockSkillExecutor: SkillExecutor;
  let mockSkillFileManager: SkillFileManager;
  let facade: RuntimeSkillCreatorFacade;

  beforeEach(() => {
    mockLLMAdapter = createMockLLMAdapter();
    mockResourceLoader = createMockResourceLoader();
    mockSkillExecutor = createMockSkillExecutor();
    mockSkillFileManager = createMockSkillFileManager();

    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      llmAdapter: mockLLMAdapter,
      resourceLoader: mockResourceLoader as never,
      skillFileManager: mockSkillFileManager,
    });

    // デフォルト: integrated_api 判定
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------------
  // I-1: 正常系 LLM 呼び出し
  // ------------------------------------------------------------------
  describe("I-1: 正常系 LLM 呼び出し", () => {
    it("フィードバックと SKILL.md を渡すと LLM が呼ばれ改善提案が返る", async () => {
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test Skill\n\n## 概要\nテスト用スキル");
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("improve-prompt content");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validImproveResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
      });

      const result = await facade.improve(
        "test-skill",
        "エラーハンドリングを強化してください",
        "api-key",
        "sk-test",
      );

      // terminal_handoff ではない
      expect(result).not.toHaveProperty("type", "terminal_handoff");
      // LLM が呼ばれた
      expect(mockLLMAdapter.sendChat).toHaveBeenCalledTimes(1);
      // SkillFileManager.readFile が呼ばれた
      expect(mockSkillFileManager.readFile).toHaveBeenCalledWith(
        "test-skill",
        "SKILL.md",
      );
      // ResourceLoader.loadAgent が呼ばれた
      expect(mockResourceLoader.loadAgent).toHaveBeenCalledWith(
        "improve-prompt",
      );
      // suggestions が返る
      const improveResult = result as {
        improveId: string;
        suggestions: unknown[];
      };
      expect(improveResult.suggestions).toBeDefined();
      expect(improveResult.suggestions.length).toBeGreaterThan(0);
    });
  });

  // ------------------------------------------------------------------
  // I-2: JSON Schema 検証
  // ------------------------------------------------------------------
  describe("I-2: JSON Schema 検証", () => {
    it("改善提案 JSON が section/before/after/reason を含む", async () => {
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test Skill");
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("improve-prompt content");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validImproveResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
      });

      const result = await facade.improve(
        "test-skill",
        "改善してください",
        "api-key",
        "sk-test",
      );

      const improveResult = result as {
        suggestions: Array<{
          section: string;
          before: string;
          after: string;
          reason: string;
        }>;
      };
      expect(improveResult.suggestions[0]).toHaveProperty("section");
      expect(improveResult.suggestions[0]).toHaveProperty("before");
      expect(improveResult.suggestions[0]).toHaveProperty("after");
      expect(improveResult.suggestions[0]).toHaveProperty("reason");
      expect(improveResult.suggestions[0].section).toBe("4. 実行仕様");
      expect(improveResult.suggestions[0].before).toBe(
        "実行時にエラーが発生した場合",
      );
      expect(improveResult.suggestions[0].after).toBe(
        "実行時にエラーが発生した場合、エラーコードとメッセージを返す",
      );
      // reason は issue + pattern の統合
      expect(improveResult.suggestions[0].reason).toContain(
        "エラーハンドリングが不足している",
      );
      expect(improveResult.suggestions[0].reason).toContain(
        "Defensive Programming",
      );
    });
  });

  // ------------------------------------------------------------------
  // I-3: SKILL.md 読み込み確認
  // ------------------------------------------------------------------
  describe("I-3: SKILL.md 読み込み確認", () => {
    it("SKILL.md が正常に読み込まれ user プロンプトに含まれる", async () => {
      const skillContent = "# My Skill\n\n## 概要\nこれはテスト用スキルです";
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(skillContent);
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("improve-prompt content");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validImproveResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
      });

      await facade.improve(
        "test-skill",
        "改善してください",
        "api-key",
        "sk-test",
      );

      const sendChatCall = (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>)
        .mock.calls[0][0];
      // user プロンプトに SKILL.md 内容が含まれる
      expect(sendChatCall.messages[0].content).toContain(skillContent);
      // user プロンプトにフィードバックが含まれる
      expect(sendChatCall.messages[0].content).toContain("改善してください");
    });
  });

  // ------------------------------------------------------------------
  // I-4: 不正 JSON エラーハンドリング（P60: IPC wrapper 形式）
  // ------------------------------------------------------------------
  describe("I-4: 不正 JSON エラーハンドリング", () => {
    it("LLM が不正 JSON を返した場合は PARSE_ERROR を返す", async () => {
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test Skill");
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("improve-prompt content");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: "This is not valid JSON at all!",
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 200, completionTokens: 10, totalTokens: 210 },
      });

      const result = await facade.improve(
        "test-skill",
        "改善してください",
        "api-key",
        "sk-test",
      );

      // IPC wrapper 形式で PARSE_ERROR を返す（P60 対策）
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      const errorResult = result as {
        success: false;
        error: { code: string; message: string };
      };
      expect(errorResult.error.code).toBe("PARSE_ERROR");
    });
  });

  // ------------------------------------------------------------------
  // I-5: system プロンプト確認（MINOR-2 反映）
  // ------------------------------------------------------------------
  describe("I-5: system プロンプト確認", () => {
    it("improve-prompt.md の内容と IMPROVE_RESPONSE_SCHEMA_INSTRUCTION が system プロンプトに含まれる", async () => {
      const promptContent = "You are a skill improvement expert...";
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test Skill");
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue(promptContent);
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validImproveResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
      });

      await facade.improve(
        "test-skill",
        "改善してください",
        "api-key",
        "sk-test",
      );

      const sendChatCall = (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>)
        .mock.calls[0][0];
      // system プロンプトに improve-prompt.md の内容が含まれる
      expect(sendChatCall.systemPrompt).toContain(promptContent);
      // system プロンプトに IMPROVE_RESPONSE_SCHEMA_INSTRUCTION マーカーが含まれる
      expect(sendChatCall.systemPrompt).toContain(
        IMPROVE_PROMPT_CONSTANTS.RESPONSE_FORMAT_START,
      );
    });
  });

  // ------------------------------------------------------------------
  // A-1: applyImprovement 正常適用
  // ------------------------------------------------------------------
  describe("A-1: applyImprovement 正常適用", () => {
    it("before テキストが SKILL.md に存在し after に置換される", async () => {
      const originalContent =
        "# Test Skill\n\n実行時にエラーが発生した場合\n\n## 詳細";
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(originalContent);
      (
        mockSkillFileManager.writeFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);

      const result = await facade.applyImprovement("test-skill", [
        {
          section: "4. 実行仕様",
          before: "実行時にエラーが発生した場合",
          after: "実行時にエラーが発生した場合、エラーコードとメッセージを返す",
          reason: "エラーハンドリングが不足している",
        },
      ]);

      expect(result.applied).toBe(1);
      expect(result.skipped).toBe(0);
      // writeFile が呼ばれたことを確認
      expect(mockSkillFileManager.writeFile).toHaveBeenCalledWith(
        "test-skill",
        "SKILL.md",
        expect.stringContaining(
          "実行時にエラーが発生した場合、エラーコードとメッセージを返す",
        ),
      );
    });
  });

  // ------------------------------------------------------------------
  // A-2: applyImprovement before 不一致スキップ
  // ------------------------------------------------------------------
  describe("A-2: applyImprovement before 不一致スキップ", () => {
    it("before テキストが SKILL.md に存在しない場合はスキップされる", async () => {
      const originalContent = "# Test Skill\n\n## 概要\nテスト用スキル";
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(originalContent);

      const result = await facade.applyImprovement("test-skill", [
        {
          section: "1. 概要",
          before: "存在しないテキスト",
          after: "新しいテキスト",
          reason: "テスト",
        },
      ]);

      expect(result.applied).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.skippedDetails).toHaveLength(1);
      expect(result.skippedDetails[0].section).toBe("1. 概要");
      // writeFile は呼ばれない（変更なし）
      expect(mockSkillFileManager.writeFile).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // TASK-P0-07: manifest 動的解決
  // ------------------------------------------------------------------
  describe("TASK-P0-07: manifest 動的解決", () => {
    it("T-P7-08: improve() の dynamic pipeline で manifest 由来の resourceIds が resourcePlanner に渡る", async () => {
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
        skillFileManager: mockSkillFileManager,
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

      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test Skill\n\n## 概要\nテスト用スキル");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validImproveResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
      });

      await dynamicFacade.improve(
        "test-skill",
        "改善してください",
        "api-key",
        "sk-test",
      );

      expect(mockResourcePlannerPlan).toHaveBeenCalledTimes(1);
      expect(mockResourcePlannerPlan.mock.calls[0][0].operation).toBe(
        "improve",
      );
      expect(mockResourcePlannerPlan.mock.calls[0][0].maxBytes).toBe(
        IMPROVE_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
      );
      expect(mockResourcePlannerPlan.mock.calls[0][0].requests).toEqual([
        {
          id: "improve-agent",
          kind: "agent",
          relativePath: "agents/improve-agent.md",
          tier: "required-core",
          required: true,
        },
        {
          id: "improve-reference",
          kind: "reference",
          relativePath: "references/improve-reference.md",
          tier: "optional-quality",
          required: false,
        },
      ]);
      expect(
        mockSourceResolverResolve.mock.calls[0][0].requiredRelativePaths,
      ).toEqual(["agents/improve-agent.md"]);
      expect(dynamicResourceLoader.loadAgent).not.toHaveBeenCalled();
    });

    it("T-P7-08b: improve フェーズが存在しない場合は VALIDATION_ERROR を返して fallback しない", async () => {
      const manifest = createDynamicManifest({
        phases: [
          {
            id: "plan",
            title: "Plan Phase",
            resourceIds: ["plan-agent"],
            entryHookId: "plan-entry",
            exitHookId: "plan-exit",
          },
        ],
      });
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
        skillFileManager: mockSkillFileManager,
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

      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test Skill\n\n## 概要\nテスト用スキル");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validImproveResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
      });

      const result = await dynamicFacade.improve(
        "test-skill",
        "改善してください",
        "api-key",
        "sk-test",
      );

      expect(result).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });
      expect(mockResourcePlannerPlan).not.toHaveBeenCalled();
      expect(mockLLMAdapter.sendChat).not.toHaveBeenCalled();
    });
  });

  // ==================================================================
  // Phase 6: テスト拡充
  // ==================================================================

  // E-1: 存在しないスキル名
  describe("E-1: 存在しないスキル名", () => {
    it("SkillNotFoundError 時に SKILL_NOT_FOUND を返す", async () => {
      const err = new Error("Skill not found: non-existent");
      Object.defineProperty(err, "constructor", {
        value: { name: "SkillNotFoundError" },
      });
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockRejectedValue(err);
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("prompt");

      const result = await facade.improve(
        "non-existent",
        "改善して",
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", false);
      const errResult = result as {
        success: false;
        error: { code: string };
      };
      expect(errResult.error.code).toBe("SKILL_NOT_FOUND");
    });
  });

  // E-2: SKILL.md 読み込み失敗
  describe("E-2: SKILL.md 読み込み失敗", () => {
    it("FileNotFoundError 時に READ_ERROR を返す", async () => {
      const err = new Error("File not found: SKILL.md");
      Object.defineProperty(err, "constructor", {
        value: { name: "FileNotFoundError" },
      });
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockRejectedValue(err);
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("prompt");

      const result = await facade.improve(
        "test-skill",
        "改善して",
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", false);
      const errResult = result as {
        success: false;
        error: { code: string };
      };
      expect(errResult.error.code).toBe("READ_ERROR");
    });
  });

  // E-3: 空文字フィードバック
  describe("E-3: 空文字フィードバック", () => {
    it("空文字フィードバック時に VALIDATION_ERROR を返す", async () => {
      const result = await facade.improve(
        "test-skill",
        "",
        "api-key",
        "sk-test",
      );
      expect(result).toHaveProperty("success", false);
      const errResult = result as {
        success: false;
        error: { code: string };
      };
      expect(errResult.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // E-4: スペースのみフィードバック
  describe("E-4: スペースのみフィードバック", () => {
    it("スペースのみフィードバック時に VALIDATION_ERROR を返す", async () => {
      const result = await facade.improve(
        "test-skill",
        "   ",
        "api-key",
        "sk-test",
      );
      expect(result).toHaveProperty("success", false);
      const errResult = result as {
        success: false;
        error: { code: string };
      };
      expect(errResult.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // E-5: LLM タイムアウト
  describe("E-5: LLM タイムアウト", () => {
    it("LLM タイムアウト時に LLM_ERROR を返す", async () => {
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test");
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("prompt");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Request timeout after 30000ms"),
      );

      const result = await facade.improve(
        "test-skill",
        "改善して",
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", false);
      const errResult = result as {
        success: false;
        error: { code: string };
      };
      expect(errResult.error.code).toBe("LLM_ERROR");
    });
  });

  // E-6: 改善提案0件
  describe("E-6: 改善提案0件", () => {
    it("improvements が空配列の場合は正常終了（suggestions: []）", async () => {
      const emptyResponse = JSON.stringify({
        skillName: "test-skill",
        improvements: [],
        improvedContent: "# 変更なし",
      });
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test");
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("prompt");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: emptyResponse,
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 20, totalTokens: 120 },
      });

      const result = await facade.improve(
        "test-skill",
        "改善して",
        "api-key",
        "sk-test",
      );

      const r = result as { improveId: string; suggestions: unknown[] };
      expect(r.suggestions).toEqual([]);
    });
  });

  // E-7: 改善提案複数件
  describe("E-7: 改善提案複数件", () => {
    it("複数の改善提案が全件返される", async () => {
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue("# Test");
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("prompt");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: multipleImprovementsJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
      });

      const result = await facade.improve(
        "test-skill",
        "改善して",
        "api-key",
        "sk-test",
      );

      const r = result as {
        suggestions: Array<{ section: string }>;
      };
      expect(r.suggestions).toHaveLength(2);
      expect(r.suggestions[0].section).toBe("1. 概要");
      expect(r.suggestions[1].section).toBe("4. 実行仕様");
    });
  });

  // E-8: before 不一致（applyImprovement 複数件）
  describe("E-8: applyImprovement 複数件の混合", () => {
    it("一部適用・一部スキップの正確なカウント", async () => {
      const content =
        "# Test\n\nこのスキルは処理を行います\n\n存在する文章です";
      (
        mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(content);
      (
        mockSkillFileManager.writeFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);

      const result = await facade.applyImprovement("test-skill", [
        {
          section: "1. 概要",
          before: "このスキルは処理を行います",
          after: "このスキルはGitHub Issueを分類します",
          reason: "明確化",
        },
        {
          section: "2. 詳細",
          before: "存在しないテキスト",
          after: "新しいテキスト",
          reason: "テスト",
        },
      ]);

      expect(result.applied).toBe(1);
      expect(result.skipped).toBe(1);
    });
  });

  // E-10: llmAdapter 未注入時の explicit error (TASK-RT-02)
  describe("E-10: llmAdapter 未注入時の explicit error", () => {
    it("llmAdapter 未注入時は llm_adapter_unavailable エラーを返す", async () => {
      const facadeWithoutLLM = new RuntimeSkillCreatorFacade({
        skillExecutor: mockSkillExecutor,
        skillFileManager: mockSkillFileManager,
      });
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      const result = await facadeWithoutLLM.improve(
        "test-skill",
        "改善して",
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

    it("governance audit に session_start / session_end が記録される", async () => {
      const facadeWithoutLLM = new RuntimeSkillCreatorFacade({
        skillExecutor: mockSkillExecutor,
        skillFileManager: mockSkillFileManager,
      });
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      await facadeWithoutLLM.improve(
        "test-skill",
        "改善して",
        "api-key",
        "sk-test",
      );

      const auditSink = (
        facadeWithoutLLM as unknown as {
          auditSink: { getEvents: () => Array<{ eventType: string }> };
        }
      ).auditSink;
      expect(auditSink.getEvents().map((event) => event.eventType)).toEqual([
        "session_start",
        "session_end",
      ]);
    });
  });

  // E-11: resourceLoader 未注入時の explicit error (TASK-RT-02)
  describe("E-11: resourceLoader 未注入時の explicit error", () => {
    it("resourceLoader 未注入時は resource_loader_unavailable エラーを返す", async () => {
      const facadeWithoutRL = new RuntimeSkillCreatorFacade({
        skillExecutor: mockSkillExecutor,
        llmAdapter: mockLLMAdapter,
        skillFileManager: mockSkillFileManager,
      });
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      const result = await facadeWithoutRL.improve(
        "test-skill",
        "改善して",
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

      const auditSink = (
        facadeWithoutRL as unknown as {
          auditSink: { getEvents: () => Array<{ eventType: string }> };
        }
      ).auditSink;
      expect(auditSink.getEvents().map((event) => event.eventType)).toEqual([
        "session_start",
        "session_end",
      ]);
    });
  });

  // E-12: terminal_handoff 分岐
  describe("E-12: terminal_handoff 分岐", () => {
    it("terminal_handoff 判定時、LLM と SkillFileManager が呼ばれない", async () => {
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
        promptBundle: 'スキル "test-skill" を改善してください: fb',
        cwd: process.cwd(),
        suggestedCommand: 'claude -p "test"',
        manualRetryRule: "retry",
      });

      const result = await facade.improve(
        "test-skill",
        "fb",
        "subscription",
        null,
      );

      expect(mockLLMAdapter.sendChat).not.toHaveBeenCalled();
      expect(mockSkillFileManager.readFile).not.toHaveBeenCalled();
      expect(result).toHaveProperty("type", "terminal_handoff");
    });
  });

  // E-13: skillName 空文字
  describe("E-13: skillName 空文字", () => {
    it("skillName 空文字時に VALIDATION_ERROR を返す", async () => {
      const result = await facade.improve("", "改善して", "api-key", "sk-test");
      expect(result).toHaveProperty("success", false);
      const errResult = result as {
        success: false;
        error: { code: string };
      };
      expect(errResult.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // E-14: skillName スペースのみ
  describe("E-14: skillName スペースのみ", () => {
    it("skillName スペースのみ時に VALIDATION_ERROR を返す", async () => {
      const result = await facade.improve(
        "   ",
        "改善して",
        "api-key",
        "sk-test",
      );
      expect(result).toHaveProperty("success", false);
      const errResult = result as {
        success: false;
        error: { code: string };
      };
      expect(errResult.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // E-15: buildImproveUserPrompt 単体テスト
  describe("E-15: buildImproveUserPrompt", () => {
    it("フィードバックと SKILL.md 内容を正しくテンプレートに埋め込む", () => {
      const result = buildImproveUserPrompt(
        "エラーハンドリングを強化",
        "# Test Skill\n## 概要\nテスト",
      );
      expect(result).toContain("エラーハンドリングを強化");
      expect(result).toContain("# Test Skill");
      expect(result).toContain("## フィードバック");
      expect(result).toContain("## 現在のSKILL.md");
    });
  });
});
