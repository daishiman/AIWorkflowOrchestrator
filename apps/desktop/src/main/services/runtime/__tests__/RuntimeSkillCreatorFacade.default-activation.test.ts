/**
 * RuntimeSkillCreatorFacade default activation tests
 *
 * TASK-P0-04: ManifestLoader default activation
 *
 * AC-1〜AC-7 を検証する fail-first テスト群。
 * Phase 5 実装後に全テストが通過することを確認する。
 */

import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { SkillCreatorSourceResolver } from "../SkillCreatorSourceResolver";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function createMockLLMAdapter(
  overrides: Partial<ILLMAdapter> = {},
): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn().mockResolvedValue({
      content: JSON.stringify({
        skillName: "test-skill",
        description: "test description",
        agents: [{ name: "agent1", role: "role1" }],
        scripts: [],
        triggers: ["manual"],
        anchors: [],
      }),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    }),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
    ...overrides,
  } as ILLMAdapter;
}

function createMockSkillExecutor(): SkillExecutor {
  return { execute: vi.fn() } as unknown as SkillExecutor;
}

async function writeTextFile(
  rootPath: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const targetPath = path.join(rootPath, relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf-8");
}

function makeIntegratedApiDecision() {
  return {
    type: "integrated_api" as const,
    apiKey: "sk-test",
    permissionMode: "default" as const,
  };
}

// ────────────────────────────────────────────────────────────────────
// Test suite
// ────────────────────────────────────────────────────────────────────

describe("RuntimeSkillCreatorFacade default activation (TASK-P0-04)", () => {
  const originalEnv = process.env.AIWORKFLOW_SKILL_CREATOR_PATH;
  let tempRoots: string[] = [];

  beforeEach(() => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue(
      makeIntegratedApiDecision(),
    );
  });

  afterEach(async () => {
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = originalEnv;
    await Promise.all(
      tempRoots.map((r) => fs.rm(r, { recursive: true, force: true })),
    );
    tempRoots = [];
    vi.restoreAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────
  // TC-01: AC-1/2/3/4 — 注入なしでも dynamic pipeline が有効
  // ──────────────────────────────────────────────────────────────────
  it("TC-01: 3コンポーネント注入なしで Facade を生成した場合、dynamic pipeline が有効化される (AC-1/2/3/4)", async () => {
    // 環境変数をクリアして余計な candidates が出ないようにする
    delete process.env.AIWORKFLOW_SKILL_CREATOR_PATH;

    const resolveSpy = vi
      .spyOn(SkillCreatorSourceResolver.prototype, "resolve")
      .mockResolvedValue({
        foundationSnapshot: undefined,
        manifestResources: new Map(),
        candidateRoots: [],
        rejectedRoots: [],
        degradeReasons: [],
      });

    const loadAgentMock = vi.fn().mockResolvedValue("discover-content");
    const mockResourceLoader = {
      loadAgent: loadAgentMock,
      getBasePath: vi.fn().mockReturnValue(undefined),
    };
    const llmAdapter = createMockLLMAdapter();
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      llmAdapter,
      resourceLoader: mockResourceLoader as never,
    });

    await facade.plan("test spec", "api-key", "sk-test");

    // dynamic pipeline が有効なら sourceResolver.resolve が呼ばれる
    expect(resolveSpy).toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────────
  // TC-02: 外部注入 sourceResolver が自動インスタンスより優先される (AC-1/2/3)
  // ──────────────────────────────────────────────────────────────────
  it("TC-02: 外部から注入した sourceResolver が自動インスタンスより優先される (AC-1/2/3)", async () => {
    delete process.env.AIWORKFLOW_SKILL_CREATOR_PATH;

    const customSourceResolver = new SkillCreatorSourceResolver();
    const customResolveSpy = vi
      .spyOn(customSourceResolver, "resolve")
      .mockResolvedValue({
        foundationSnapshot: undefined,
        manifestResources: new Map(),
        candidateRoots: [],
        rejectedRoots: [],
        degradeReasons: [],
      });
    // prototype spy は別の resolver に影響しない
    const protoResolveSpy = vi.spyOn(
      SkillCreatorSourceResolver.prototype,
      "resolve",
    );

    const llmAdapter = createMockLLMAdapter();
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      llmAdapter,
      sourceResolver: customSourceResolver,
    });

    await facade.plan("test spec", "api-key", "sk-test");

    // 注入した custom resolver が呼ばれる
    expect(customResolveSpy).toHaveBeenCalled();
    // prototype spy（自動インスタンス化されたもの）は呼ばれない
    expect(protoResolveSpy).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────────
  // TC-03: AC-5 — explicitRoot なしでも candidates から manifest を自動発見
  // ──────────────────────────────────────────────────────────────────
  it("TC-03: explicitRoot なしでも candidates から workflow-manifest.json を自動発見して dynamic pipeline を活性化する (AC-5)", async () => {
    // temp directory に skill creator root を作成
    const skillRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "p0-04-manifest-auto-"),
    );
    tempRoots.push(skillRoot);

    // SKILL.md + agents + workflow-manifest.json を作成
    await writeTextFile(skillRoot, "SKILL.md", "# test-skill\n");
    await writeTextFile(
      skillRoot,
      "agents/discover-problem.md",
      "DISCOVER_AUTO_MANIFEST",
    );
    await writeTextFile(
      skillRoot,
      "agents/design-workflow.md",
      "DESIGN_AUTO_MANIFEST",
    );
    await writeTextFile(
      skillRoot,
      "agents/plan-structure.md",
      "PLAN_AUTO_MANIFEST",
    );
    await writeTextFile(
      skillRoot,
      "workflow-manifest.json",
      JSON.stringify({
        schemaVersion: 1,
        workflowId: "test-p0-04",
        phases: [
          {
            id: "phase-plan",
            title: "plan",
            resourceIds: [
              "discover-problem",
              "design-workflow",
              "plan-structure",
            ],
            entryHookId: "entry",
            exitHookId: "exit",
          },
        ],
        resources: [
          {
            id: "discover-problem",
            kind: "agent",
            path: "./agents/discover-problem.md",
            phaseIds: ["phase-plan"],
          },
          {
            id: "design-workflow",
            kind: "agent",
            path: "./agents/design-workflow.md",
            phaseIds: ["phase-plan"],
          },
          {
            id: "plan-structure",
            kind: "agent",
            path: "./agents/plan-structure.md",
            phaseIds: ["phase-plan"],
          },
        ],
        entry: [{ id: "entry", command: "prepare" }],
        exit: [{ id: "exit", command: "publish" }],
      }),
    );

    // AIWORKFLOW_SKILL_CREATOR_PATH で temp root を指定
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = skillRoot;

    const llmAdapter = createMockLLMAdapter();
    // resourceLoader なし（explicitRoot なし）+ 3コンポーネント自動インスタンス化
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      llmAdapter,
    });

    await facade.plan("test spec", "api-key", "sk-test");

    const sendChatCall = (llmAdapter.sendChat as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    // manifest で指定されたエージェントの内容が system prompt に含まれる
    expect(sendChatCall.systemPrompt).toContain("DISCOVER_AUTO_MANIFEST");
    expect(sendChatCall.systemPrompt).toContain("DESIGN_AUTO_MANIFEST");
    expect(sendChatCall.systemPrompt).toContain("PLAN_AUTO_MANIFEST");
  });

  // ──────────────────────────────────────────────────────────────────
  // TC-04: AC-6 — manifest 未発見時は resourceLoader.loadAgent で static fallback
  // ──────────────────────────────────────────────────────────────────
  it("TC-04: manifest が見つからない場合は resourceLoader.loadAgent で static fallback する (AC-6)", async () => {
    // manifest が存在しないように環境変数をクリア
    delete process.env.AIWORKFLOW_SKILL_CREATOR_PATH;

    // sourceResolver を mock して候補を空に（manifest 未発見）
    vi.spyOn(SkillCreatorSourceResolver.prototype, "resolve").mockResolvedValue(
      {
        foundationSnapshot: undefined,
        manifestResources: new Map(),
        candidateRoots: [],
        rejectedRoots: [],
        degradeReasons: [],
      },
    );

    const loadAgentMock = vi
      .fn()
      .mockResolvedValueOnce("discover-content")
      .mockResolvedValueOnce("design-content")
      .mockResolvedValueOnce("plan-content");
    const mockResourceLoader = {
      loadAgent: loadAgentMock,
      getBasePath: vi.fn().mockReturnValue(undefined),
    };

    const llmAdapter = createMockLLMAdapter();
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      llmAdapter,
      resourceLoader: mockResourceLoader as never,
    });

    await facade.plan("test spec", "api-key", "sk-test");

    // static loader fallback として loadAgent が3回呼ばれる
    expect(loadAgentMock).toHaveBeenCalledTimes(3);
    expect(loadAgentMock).toHaveBeenCalledWith("discover-problem");
    expect(loadAgentMock).toHaveBeenCalledWith("design-workflow");
    expect(loadAgentMock).toHaveBeenCalledWith("plan-structure");
  });

  // ──────────────────────────────────────────────────────────────────
  // TC-06: resourceLoader も manifest もない場合は degraded error
  // ──────────────────────────────────────────────────────────────────
  it("TC-06: resourceLoader も manifest もない場合は resource_loader_unavailable を返す (AC-6)", async () => {
    delete process.env.AIWORKFLOW_SKILL_CREATOR_PATH;

    // sourceResolver を mock して候補を空にする（manifest 未発見）
    vi.spyOn(SkillCreatorSourceResolver.prototype, "resolve").mockResolvedValue(
      {
        foundationSnapshot: undefined,
        manifestResources: new Map(),
        candidateRoots: [],
        rejectedRoots: [],
        degradeReasons: [],
      },
    );

    const llmAdapter = createMockLLMAdapter();
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      llmAdapter,
      // resourceLoader なし
    });

    const result = await facade.plan("test spec", "api-key", "sk-test");

    expect(result).toEqual({
      success: false,
      error: {
        code: "resource_loader_unavailable",
        message: "リソースローダーが利用できません。設定を確認してください。",
      },
    });
    expect(llmAdapter.sendChat).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────────
  // TC-07: Phase 6 — corrupted manifest は無視して static loader fallback
  // ──────────────────────────────────────────────────────────────────
  it("TC-07: manifest JSON が不正な場合は無視して static loader fallback する (Phase 6 境界ケース)", async () => {
    // temp directory に壊れた manifest を作成
    const skillRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "p0-04-corrupt-manifest-"),
    );
    tempRoots.push(skillRoot);

    await writeTextFile(skillRoot, "SKILL.md", "# test-skill\n");
    // 不正な JSON を書き込む
    await writeTextFile(
      skillRoot,
      "workflow-manifest.json",
      "{ invalid json }",
    );

    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = skillRoot;
    // REPO_SKILL_CREATOR_PATH など常時候補に含まれるパスが dynamic 成功させないよう mock
    vi.spyOn(SkillCreatorSourceResolver.prototype, "resolve").mockResolvedValue(
      {
        foundationSnapshot: undefined,
        manifestResources: new Map(),
        candidateRoots: [],
        rejectedRoots: [],
        degradeReasons: [],
      },
    );

    const loadAgentMock = vi
      .fn()
      .mockResolvedValueOnce("discover-content")
      .mockResolvedValueOnce("design-content")
      .mockResolvedValueOnce("plan-content");
    const mockResourceLoader = {
      loadAgent: loadAgentMock,
      getBasePath: vi.fn().mockReturnValue(undefined),
    };

    const llmAdapter = createMockLLMAdapter();
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      llmAdapter,
      resourceLoader: mockResourceLoader as never,
    });

    await facade.plan("test spec", "api-key", "sk-test");

    // corrupt manifest は silently 無視され、static loader fallback が動く
    expect(loadAgentMock).toHaveBeenCalledTimes(3);
  });

  // ──────────────────────────────────────────────────────────────────
  // TC-08: Phase 6 — concurrent plan() 呼び出しは独立して完了する
  // ──────────────────────────────────────────────────────────────────
  it("TC-08: 複数の plan() 呼び出しが同時に行われても互いに独立して完了する (Phase 6 concurrent)", async () => {
    delete process.env.AIWORKFLOW_SKILL_CREATOR_PATH;

    vi.spyOn(SkillCreatorSourceResolver.prototype, "resolve").mockResolvedValue(
      {
        foundationSnapshot: undefined,
        manifestResources: new Map(),
        candidateRoots: [],
        rejectedRoots: [],
        degradeReasons: [],
      },
    );

    const loadAgentMock = vi.fn().mockResolvedValue("shared-agent-content");
    const mockResourceLoader = {
      loadAgent: loadAgentMock,
      getBasePath: vi.fn().mockReturnValue(undefined),
    };
    const llmAdapter = createMockLLMAdapter();
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      llmAdapter,
      resourceLoader: mockResourceLoader as never,
    });

    // 2つの plan() を同時に起動
    const [result1, result2] = await Promise.all([
      facade.plan("spec A", "api-key", "sk-test"),
      facade.plan("spec B", "api-key", "sk-test"),
    ]);

    // 両方とも LLM 呼び出しが完了し、結果が返される
    expect(result1).not.toHaveProperty("success", false);
    expect(result2).not.toHaveProperty("success", false);
    // LLM が2回呼ばれた（各呼び出しが独立）
    expect(llmAdapter.sendChat).toHaveBeenCalledTimes(2);
    expect(loadAgentMock).toHaveBeenCalledTimes(6);
  });
});
