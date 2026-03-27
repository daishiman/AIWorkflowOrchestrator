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
import type { SkillFileManager } from "../../skill/SkillFileManager";

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

describe("RuntimeSkillCreatorFacade dynamic improve resource selection", () => {
  let mockLLMAdapter: ILLMAdapter;
  let mockSkillFileManager: SkillFileManager;
  let tempRoots: string[];

  beforeEach(() => {
    mockLLMAdapter = createMockLLMAdapter();
    mockSkillFileManager = createMockSkillFileManager();
    tempRoots = [];
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
  });

  afterEach(async () => {
    await Promise.all(
      tempRoots.map((rootPath) =>
        fs.rm(rootPath, { recursive: true, force: true }),
      ),
    );
    vi.restoreAllMocks();
  });

  it("improve で optional reference を system prompt に含める", async () => {
    const explicitRoot = await createSkillRoot("task03-improve-explicit-");
    tempRoots.push(explicitRoot);

    await writeTextFile(
      explicitRoot,
      "agents/improve-prompt.md",
      "IMPROVE_PROMPT_DYNAMIC",
    );
    await writeTextFile(
      explicitRoot,
      "references/feedback-loop.md",
      "FEEDBACK_LOOP_DYNAMIC",
    );
    (
      mockSkillFileManager.readFile as ReturnType<typeof vi.fn>
    ).mockResolvedValue("# Test Skill");
    (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: JSON.stringify({
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
      skillFileManager: mockSkillFileManager,
      sourceResolver: new SkillCreatorSourceResolver(),
      resourcePlanner: new PhaseResourcePlanner(),
      resolvedResourceReader: new ResolvedResourceReader(
        new ResourceLoader(explicitRoot),
      ),
    });

    await facade.improve(
      "test-skill",
      "feedback loop を強化する",
      "api-key",
      "sk-test",
    );

    const sendChatArgs = (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];
    expect(sendChatArgs.systemPrompt).toContain("IMPROVE_PROMPT_DYNAMIC");
    expect(sendChatArgs.systemPrompt).toContain("FEEDBACK_LOOP_DYNAMIC");
  });
});
