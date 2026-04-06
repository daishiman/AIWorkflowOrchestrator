import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { SkillCreatorSourceResolver } from "../SkillCreatorSourceResolver";
import { PhaseResourcePlanner } from "../PhaseResourcePlanner";
import { ResolvedResourceReader } from "../ResolvedResourceReader";
import { ResourceLoader } from "../../skill/ResourceLoader";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";

async function writeTextFile(
  rootPath: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const targetPath = path.join(rootPath, relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf-8");
}

async function createSkillRoot(prefix: string): Promise<string> {
  const rootPath = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  await writeTextFile(rootPath, "SKILL.md", "# skill-creator\n");
  await writeTextFile(
    rootPath,
    "scripts/init_skill.js",
    "console.log('init');",
  );
  return rootPath;
}

function createMockLLMAdapter(): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn(),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
  } as ILLMAdapter;
}

describe("RuntimeSkillCreatorFacade dynamic plan resource selection", () => {
  let mockLLMAdapter: ILLMAdapter;
  let tempRoots: string[];
  const originalEnv = process.env.AIWORKFLOW_SKILL_CREATOR_PATH;

  beforeEach(() => {
    mockLLMAdapter = createMockLLMAdapter();
    tempRoots = [];
  });

  afterEach(async () => {
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = originalEnv;
    await Promise.all(
      tempRoots.map((rootPath) =>
        fs.rm(rootPath, { recursive: true, force: true }),
      ),
    );
    vi.restoreAllMocks();
  });

  it("dynamic pipeline 経由で agent/reference を読み、public contract を維持する", async () => {
    const explicitRoot = await createSkillRoot("task03-facade-explicit-");
    const envRoot = await createSkillRoot("task03-facade-env-");
    tempRoots.push(explicitRoot, envRoot);
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = envRoot;

    await writeTextFile(
      explicitRoot,
      "agents/discover-problem.md",
      "DISCOVER_DYNAMIC",
    );
    await writeTextFile(
      explicitRoot,
      "agents/design-workflow.md",
      "DESIGN_DYNAMIC",
    );
    await writeTextFile(
      explicitRoot,
      "agents/plan-structure.md",
      "PLAN_DYNAMIC",
    );
    await writeTextFile(
      explicitRoot,
      "references/overview.md",
      "OVERVIEW_DYNAMIC",
    );
    await writeTextFile(
      explicitRoot,
      "workflow-manifest.json",
      JSON.stringify(
        {
          schemaVersion: 1,
          workflowId: "task-sdk-03-plan-selection",
          phases: [
            {
              id: "plan",
              title: "plan",
              resourceIds: [
                "discover-problem",
                "design-workflow",
                "plan-structure",
                "overview",
              ],
              entryHookId: "plan-entry",
              exitHookId: "plan-exit",
            },
          ],
          resources: [
            {
              id: "discover-problem",
              kind: "agent",
              path: "./agents/discover-problem.md",
              phaseIds: ["plan"],
            },
            {
              id: "design-workflow",
              kind: "agent",
              path: "./agents/design-workflow.md",
              phaseIds: ["plan"],
            },
            {
              id: "plan-structure",
              kind: "agent",
              path: "./agents/plan-structure.md",
              phaseIds: ["plan"],
            },
            {
              id: "overview",
              kind: "reference",
              path: "./references/overview.md",
              phaseIds: ["plan"],
            },
          ],
          entry: [{ id: "plan-entry", command: "prepare plan" }],
          exit: [{ id: "plan-exit", command: "publish plan" }],
        },
        null,
        2,
      ),
    );
    await writeTextFile(envRoot, "agents/discover-problem.md", "DISCOVER_ENV");
    await writeTextFile(envRoot, "agents/design-workflow.md", "DESIGN_ENV");
    await writeTextFile(envRoot, "agents/plan-structure.md", "PLAN_ENV");
    await writeTextFile(envRoot, "references/overview.md", "OVERVIEW_ENV");

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_321);
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: JSON.stringify({
        skillName: "dynamic-skill",
        description: "dynamic description",
        agents: [{ name: "writer", role: "write files" }],
        scripts: [],
        triggers: ["manual"],
        anchors: ["overview"],
      }),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: vi.fn(),
      } as unknown as SkillExecutor,
      llmAdapter: mockLLMAdapter,
      resourceLoader: new ResourceLoader(explicitRoot),
      sourceResolver: new SkillCreatorSourceResolver(),
      resourcePlanner: new PhaseResourcePlanner(),
      resolvedResourceReader: new ResolvedResourceReader(
        new ResourceLoader(explicitRoot),
      ),
    });

    const result = await facade.plan("dynamic spec", "api-key", "sk-test");

    expect(result).toMatchObject({
      planId: "plan-1710000000321",
      skillSpec: "dynamic spec",
      skillName: "dynamic-skill",
      description: "dynamic description",
    });

    const sendChatArgs = (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];
    expect(sendChatArgs.systemPrompt).toContain("DISCOVER_DYNAMIC");
    expect(sendChatArgs.systemPrompt).toContain("DESIGN_DYNAMIC");
    expect(sendChatArgs.systemPrompt).toContain("PLAN_DYNAMIC");
    expect(sendChatArgs.systemPrompt).toContain("OVERVIEW_DYNAMIC");

    const snapshot = facade.getWorkflowStateSnapshot("plan-1710000000321");
    expect(snapshot?.sourceProvenance).toMatchObject({
      resolvedSkillCreatorRoot: explicitRoot,
      manifestPath: path.join(explicitRoot, "workflow-manifest.json"),
      manifestCacheKey: expect.any(String),
      resourceDescriptorHash: expect.any(String),
      candidateRoots: expect.arrayContaining([explicitRoot, envRoot]),
      selectedResourceIds: expect.arrayContaining([
        "discover-problem",
        "design-workflow",
        "plan-structure",
      ]),
    });
    // explicitRoot と envRoot には required な agents が存在するが、
    // home/repo のデフォルト候補には存在しないため structure_mismatch が発生しうる
    // degradeReasons の内容は環境依存（home/repo パスの有無）のため型のみ検証
    expect(Array.isArray(snapshot?.sourceProvenance?.degradeReasons)).toBe(
      true,
    );
  });

  it("manifest の custom resource ids でも plan の system prompt に反映される", async () => {
    const explicitRoot = await createSkillRoot("task03-facade-custom-");
    const envRoot = await createSkillRoot("task03-facade-custom-env-");
    tempRoots.push(explicitRoot, envRoot);
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = envRoot;

    await writeTextFile(
      explicitRoot,
      "agents/custom-discover.md",
      "DISCOVER_CUSTOM_MANIFEST",
    );
    await writeTextFile(
      explicitRoot,
      "agents/custom-design.md",
      "DESIGN_CUSTOM_MANIFEST",
    );
    await writeTextFile(
      explicitRoot,
      "agents/custom-plan.md",
      "PLAN_CUSTOM_MANIFEST",
    );
    await writeTextFile(
      explicitRoot,
      "references/custom-overview.md",
      "OVERVIEW_CUSTOM_MANIFEST",
    );
    await writeTextFile(
      envRoot,
      "agents/custom-discover.md",
      "DISCOVER_CUSTOM_ENV",
    );
    await writeTextFile(
      envRoot,
      "agents/custom-design.md",
      "DESIGN_CUSTOM_ENV",
    );
    await writeTextFile(envRoot, "agents/custom-plan.md", "PLAN_CUSTOM_ENV");
    await writeTextFile(
      envRoot,
      "references/custom-overview.md",
      "OVERVIEW_CUSTOM_ENV",
    );
    await writeTextFile(
      explicitRoot,
      "workflow-manifest.json",
      JSON.stringify(
        {
          schemaVersion: 1,
          workflowId: "task-sdk-03-custom-plan-selection",
          phases: [
            {
              id: "plan",
              title: "plan",
              resourceIds: [
                "custom-discover",
                "custom-design",
                "custom-plan",
                "custom-overview",
              ],
              entryHookId: "plan-entry",
              exitHookId: "plan-exit",
            },
          ],
          resources: [
            {
              id: "custom-discover",
              kind: "agent",
              path: "./agents/custom-discover.md",
              phaseIds: ["plan"],
            },
            {
              id: "custom-design",
              kind: "agent",
              path: "./agents/custom-design.md",
              phaseIds: ["plan"],
            },
            {
              id: "custom-plan",
              kind: "agent",
              path: "./agents/custom-plan.md",
              phaseIds: ["plan"],
            },
            {
              id: "custom-overview",
              kind: "reference",
              path: "./references/custom-overview.md",
              phaseIds: ["plan"],
            },
          ],
          entry: [{ id: "plan-entry", command: "prepare custom plan" }],
          exit: [{ id: "plan-exit", command: "publish custom plan" }],
        },
        null,
        2,
      ),
    );

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    vi.spyOn(Date, "now").mockReturnValue(1_710_000_001_234);
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: JSON.stringify({
        skillName: "custom-dynamic-skill",
        description: "custom dynamic description",
        agents: [{ name: "writer", role: "write files" }],
        scripts: [],
        triggers: ["manual"],
        anchors: ["custom-overview"],
      }),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: vi.fn(),
      } as unknown as SkillExecutor,
      llmAdapter: mockLLMAdapter,
      resourceLoader: new ResourceLoader(explicitRoot),
      sourceResolver: new SkillCreatorSourceResolver(),
      resourcePlanner: new PhaseResourcePlanner(),
      resolvedResourceReader: new ResolvedResourceReader(
        new ResourceLoader(explicitRoot),
      ),
    });

    const result = await facade.plan(
      "custom dynamic spec",
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      planId: "plan-1710000001234",
      skillSpec: "custom dynamic spec",
      skillName: "custom-dynamic-skill",
      description: "custom dynamic description",
    });

    const sendChatArgs = (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];
    expect(sendChatArgs.systemPrompt).toContain("DISCOVER_CUSTOM_MANIFEST");
    expect(sendChatArgs.systemPrompt).toContain("DESIGN_CUSTOM_MANIFEST");
    expect(sendChatArgs.systemPrompt).toContain("PLAN_CUSTOM_MANIFEST");
    expect(sendChatArgs.systemPrompt).toContain("OVERVIEW_CUSTOM_MANIFEST");
    expect(sendChatArgs.systemPrompt).not.toContain("DISCOVER_CUSTOM_ENV");

    const snapshot = facade.getWorkflowStateSnapshot("plan-1710000001234");
    expect(snapshot?.sourceProvenance).toMatchObject({
      resolvedSkillCreatorRoot: explicitRoot,
      manifestPath: path.join(explicitRoot, "workflow-manifest.json"),
      selectedResourceIds: [
        "custom-discover",
        "custom-design",
        "custom-plan",
        "custom-overview",
      ],
    });
  });

  it("manifest がなくても fallback で explicit root を使って plan を生成する", async () => {
    const explicitRoot = await createSkillRoot("task03-facade-fallback-");
    const envRoot = await createSkillRoot("task03-facade-fallback-env-");
    tempRoots.push(explicitRoot, envRoot);
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = envRoot;

    await writeTextFile(
      explicitRoot,
      "agents/discover-problem.md",
      "DISCOVER_FALLBACK",
    );
    await writeTextFile(
      explicitRoot,
      "agents/design-workflow.md",
      "DESIGN_FALLBACK",
    );
    await writeTextFile(
      explicitRoot,
      "agents/plan-structure.md",
      "PLAN_FALLBACK",
    );
    await writeTextFile(
      explicitRoot,
      "references/overview.md",
      "OVERVIEW_FALLBACK",
    );
    await writeTextFile(envRoot, "agents/discover-problem.md", "DISCOVER_ENV");
    await writeTextFile(envRoot, "agents/design-workflow.md", "DESIGN_ENV");
    await writeTextFile(envRoot, "agents/plan-structure.md", "PLAN_ENV");
    await writeTextFile(envRoot, "references/overview.md", "OVERVIEW_ENV");

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_987);
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: JSON.stringify({
        skillName: "fallback-skill",
        description: "fallback description",
        agents: [{ name: "writer", role: "write files" }],
        scripts: [],
        triggers: ["manual"],
        anchors: ["overview"],
      }),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: vi.fn(),
      } as unknown as SkillExecutor,
      llmAdapter: mockLLMAdapter,
      resourceLoader: new ResourceLoader(explicitRoot),
      sourceResolver: new SkillCreatorSourceResolver(),
      resourcePlanner: new PhaseResourcePlanner(),
      resolvedResourceReader: new ResolvedResourceReader(
        new ResourceLoader(explicitRoot),
      ),
    });

    const result = await facade.plan("fallback spec", "api-key", "sk-test");

    expect(result).toMatchObject({
      planId: "plan-1710000000987",
      skillSpec: "fallback spec",
      skillName: "fallback-skill",
      description: "fallback description",
    });

    const sendChatArgs = (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];
    expect(sendChatArgs.systemPrompt).toContain("DISCOVER_FALLBACK");
    expect(sendChatArgs.systemPrompt).toContain("DESIGN_FALLBACK");
    expect(sendChatArgs.systemPrompt).toContain("PLAN_FALLBACK");
    expect(sendChatArgs.systemPrompt).toContain("OVERVIEW_FALLBACK");
    expect(sendChatArgs.systemPrompt).not.toContain("DISCOVER_ENV");

    const snapshot = facade.getWorkflowStateSnapshot("plan-1710000000987");
    expect(snapshot?.sourceProvenance?.manifestPath).toBeUndefined();
    expect(snapshot?.sourceProvenance?.resolvedSkillCreatorRoot).toBe(
      explicitRoot,
    );
  });

  it("workflow-manifest.json が壊れている場合は VALIDATION_ERROR を返して fallback しない", async () => {
    const explicitRoot = await createSkillRoot(
      "task03-facade-invalid-manifest-",
    );
    tempRoots.push(explicitRoot);

    await writeTextFile(
      explicitRoot,
      "workflow-manifest.json",
      "{ this is not valid json",
    );

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: JSON.stringify({
        skillName: "invalid-manifest-skill",
        description: "should not reach llm",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      }),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: vi.fn(),
      } as unknown as SkillExecutor,
      llmAdapter: mockLLMAdapter,
      resourceLoader: new ResourceLoader(explicitRoot),
      sourceResolver: new SkillCreatorSourceResolver(),
      resourcePlanner: new PhaseResourcePlanner(),
      resolvedResourceReader: new ResolvedResourceReader(
        new ResourceLoader(explicitRoot),
      ),
    });

    const result = await facade.plan(
      "invalid manifest spec",
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
      },
    });
    if ("error" in result) {
      expect(result.error.message).toContain("workflow-manifest.json");
    }
    expect(mockLLMAdapter.sendChat).not.toHaveBeenCalled();
  });

  it("plan phase が manifest に存在しない場合は VALIDATION_ERROR を返して fallback しない", async () => {
    const explicitRoot = await createSkillRoot(
      "task03-facade-missing-plan-phase-",
    );
    tempRoots.push(explicitRoot);

    await writeTextFile(
      explicitRoot,
      "workflow-manifest.json",
      JSON.stringify(
        {
          schemaVersion: 1,
          workflowId: "task-sdk-03-missing-plan-phase",
          phases: [
            {
              id: "improve",
              title: "improve",
              resourceIds: ["custom-improve"],
              entryHookId: "improve-entry",
              exitHookId: "improve-exit",
            },
          ],
          resources: [
            {
              id: "custom-improve",
              kind: "agent",
              path: "./agents/custom-improve.md",
              phaseIds: ["improve"],
            },
          ],
          entry: [{ id: "improve-entry", command: "prepare improve" }],
          exit: [{ id: "improve-exit", command: "publish improve" }],
        },
        null,
        2,
      ),
    );
    await writeTextFile(
      explicitRoot,
      "agents/custom-improve.md",
      "IMPROVE_ONLY_MANIFEST",
    );

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: JSON.stringify({
        skillName: "missing-plan-phase-skill",
        description: "should not reach llm",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      }),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: vi.fn(),
      } as unknown as SkillExecutor,
      llmAdapter: mockLLMAdapter,
      resourceLoader: new ResourceLoader(explicitRoot),
      sourceResolver: new SkillCreatorSourceResolver(),
      resourcePlanner: new PhaseResourcePlanner(),
      resolvedResourceReader: new ResolvedResourceReader(
        new ResourceLoader(explicitRoot),
      ),
    });

    const result = await facade.plan(
      "missing plan phase spec",
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
      },
    });
    if ("error" in result) {
      expect(result.error.message).toContain('phase "plan"');
    }
    expect(mockLLMAdapter.sendChat).not.toHaveBeenCalled();
  });
});
