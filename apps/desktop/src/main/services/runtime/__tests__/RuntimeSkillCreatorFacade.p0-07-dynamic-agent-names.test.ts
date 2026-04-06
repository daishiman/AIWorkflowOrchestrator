/**
 * TASK-P0-07: hardcoded-agent-names-dynamic-resolution
 *
 * improve() fallback path が IMPROVE_RESOURCE_REQUESTS を source of truth として
 * 動的にエージェント名を解決することを検証する。
 *
 * AC-1: AGENT_NAMES ハードコード参照が削除されていること
 * AC-3: fallback path で IMPROVE_RESOURCE_REQUESTS が使われること
 * AC-6: 全パターン（fallback/manifest）がユニットテストで網羅されること
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { IMPROVE_RESOURCE_REQUESTS } from "../improvePromptConstants";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import type { SkillFileManager } from "../../skill/SkillFileManager";

function createMockLLMAdapter(): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn(),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
  } as ILLMAdapter;
}

function createMockResourceLoader() {
  return { loadAgent: vi.fn() };
}

function createMockSkillExecutor(): SkillExecutor {
  return { execute: vi.fn() } as unknown as SkillExecutor;
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

function validImproveResponseJson() {
  return JSON.stringify({
    skillName: "test-skill",
    targetAgent: "agents/main.md",
    analysisResults: {
      structureScore: 4,
      clarityScore: 4,
      reproducibilityScore: 4,
      efficiencyScore: 4,
    },
    improvements: [],
    improvedContent: "# revised",
  });
}

describe("TASK-P0-07: improve() fallback path dynamic agent name resolution", () => {
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

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TC-1 / AC-1: IMPROVE_RESOURCE_REQUESTS の agent id が loadAgent に渡される（ハードコード文字列ではなく）
  it("TC-1: fallback path で IMPROVE_RESOURCE_REQUESTS の agent id が loadAgent に渡される", async () => {
    (
      mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
    ).mockResolvedValue("# Test Skill");
    (
      mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
    ).mockResolvedValue("improve-prompt content");
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: validImproveResponseJson(),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });

    await facade.improve("test-skill", "feedback", "api-key", "sk-test");

    // IMPROVE_RESOURCE_REQUESTS の agent エントリ id と完全一致する引数で呼ばれること
    const agentRequests = IMPROVE_RESOURCE_REQUESTS.filter(
      (r) => r.kind === "agent",
    );
    const calls = (
      mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
    ).mock.calls.map((call) => call[0] as string);

    expect(calls).toEqual(agentRequests.map((r) => r.id));
  });

  // TC-2 / AC-3: fallback path で reference は loadAgent に含まれない
  it("TC-2: fallback path で reference kind のエントリは loadAgent に渡されない", async () => {
    (
      mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
    ).mockResolvedValue("# Test Skill");
    (
      mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
    ).mockResolvedValue("agent content");
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: validImproveResponseJson(),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });

    await facade.improve("test-skill", "feedback", "api-key", "sk-test");

    const referenceIds = IMPROVE_RESOURCE_REQUESTS.filter(
      (r) => r.kind === "reference",
    ).map((r) => r.id);

    const calls = (
      mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
    ).mock.calls.map((call) => call[0] as string);

    for (const refId of referenceIds) {
      expect(calls).not.toContain(refId);
    }
  });

  // TC-5 / AC-6: IMPROVE_RESOURCE_REQUESTS が source of truth — agentエントリ数と呼び出し回数が一致
  it("TC-5: loadAgent の呼び出し回数が IMPROVE_RESOURCE_REQUESTS の agent エントリ数と一致する", async () => {
    (
      mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
    ).mockResolvedValue("# Test Skill");
    (
      mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
    ).mockResolvedValue("agent content");
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: validImproveResponseJson(),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });

    await facade.improve("test-skill", "feedback", "api-key", "sk-test");

    const expectedAgentCount = IMPROVE_RESOURCE_REQUESTS.filter(
      (r) => r.kind === "agent",
    ).length;

    expect(mockResourceLoader.loadAgent).toHaveBeenCalledTimes(
      expectedAgentCount,
    );
  });

  // AC-1 確認: IMPROVE_PROMPT_CONSTANTS に AGENT_NAME が存在しない（型レベル検証）
  it("AC-1: IMPROVE_PROMPT_CONSTANTS に AGENT_NAME フィールドが存在しない", async () => {
    const { IMPROVE_PROMPT_CONSTANTS } =
      await import("../improvePromptConstants");
    expect(IMPROVE_PROMPT_CONSTANTS).not.toHaveProperty("AGENT_NAME");
  });
});
