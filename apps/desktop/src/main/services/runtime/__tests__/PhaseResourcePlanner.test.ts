import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { PhaseResourcePlanner } from "../PhaseResourcePlanner";
import { SkillCreatorSourceResolver } from "../SkillCreatorSourceResolver";

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

describe("PhaseResourcePlanner", () => {
  const tempRoots: string[] = [];
  const originalEnv = process.env.AIWORKFLOW_SKILL_CREATOR_PATH;

  afterEach(async () => {
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = originalEnv;
    await Promise.all(
      tempRoots.map((rootPath) =>
        fs.rm(rootPath, { recursive: true, force: true }),
      ),
    );
    tempRoots.length = 0;
  });

  it("4 kind を解決しつつ duplicate root を source_conflict として記録する", async () => {
    const explicitRoot = await createSkillRoot("task03-plan-explicit-");
    const envRoot = await createSkillRoot("task03-plan-env-");
    tempRoots.push(explicitRoot, envRoot);
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = envRoot;

    await writeTextFile(
      explicitRoot,
      "agents/discover-problem.md",
      "explicit agent prompt",
    );
    await writeTextFile(
      envRoot,
      "agents/discover-problem.md",
      "env agent prompt",
    );
    await writeTextFile(
      explicitRoot,
      "references/overview.md",
      "reference overview",
    );
    await writeTextFile(
      explicitRoot,
      "schemas/runtime-config.json",
      '{"type":"object"}',
    );
    await writeTextFile(explicitRoot, "assets/agent-template.md", "asset");

    const resolver = new SkillCreatorSourceResolver();
    const resolution = await resolver.resolve({
      explicitRoot,
      requiredRelativePaths: ["agents/discover-problem.md"],
    });
    const planner = new PhaseResourcePlanner();
    const result = await planner.plan({
      operation: "plan",
      resolution,
      maxBytes: 10_000,
      requests: [
        {
          id: "discover-problem",
          kind: "agent",
          relativePath: "agents/discover-problem.md",
          tier: "required-core",
          required: true,
        },
        {
          id: "overview",
          kind: "reference",
          relativePath: "references/overview.md",
          tier: "required-context",
          required: true,
        },
        {
          id: "runtime-config",
          kind: "schema",
          relativePath: "schemas/runtime-config.json",
          tier: "optional-quality",
          required: false,
        },
        {
          id: "agent-template",
          kind: "asset",
          relativePath: "assets/agent-template.md",
          tier: "optional-deep-dive",
          required: false,
        },
      ],
    });

    expect(result.resources.map((resource) => resource.kind)).toEqual([
      "agent",
      "reference",
      "schema",
      "asset",
    ]);
    expect(result.degradeReasons).toContain("source_conflict");
    expect(result.resources[0]?.suppressedRoots).toContain(envRoot);
    expect(result.snapshot.selectedRoots).toContain(explicitRoot);
  });

  it("budget 超過時は lower tier の optional resource から drop する", async () => {
    const explicitRoot = await createSkillRoot("task03-plan-budget-");
    tempRoots.push(explicitRoot);

    await writeTextFile(
      explicitRoot,
      "agents/discover-problem.md",
      "required-core",
    );
    await writeTextFile(
      explicitRoot,
      "references/overview.md",
      "optional-quality-overview-optional-quality-overview",
    );
    await writeTextFile(
      explicitRoot,
      "assets/agent-template.md",
      "deep-dive-drop-target-deep-dive-drop-target",
    );

    const resolver = new SkillCreatorSourceResolver();
    const resolution = await resolver.resolve({
      explicitRoot,
      requiredRelativePaths: ["agents/discover-problem.md"],
    });
    const planner = new PhaseResourcePlanner();
    const result = await planner.plan({
      operation: "plan",
      resolution,
      maxBytes: 80,
      requests: [
        {
          id: "discover-problem",
          kind: "agent",
          relativePath: "agents/discover-problem.md",
          tier: "required-core",
          required: true,
        },
        {
          id: "overview",
          kind: "reference",
          relativePath: "references/overview.md",
          tier: "optional-quality",
          required: false,
        },
        {
          id: "agent-template",
          kind: "asset",
          relativePath: "assets/agent-template.md",
          tier: "optional-deep-dive",
          required: false,
        },
      ],
    });

    expect(result.degradeReasons).toContain("budget_overflow");
    expect(result.resources.map((resource) => resource.id)).toContain(
      "discover-problem",
    );
    expect(result.droppedResources).toContainEqual({
      id: "agent-template",
      tier: "optional-deep-dive",
      reason: "budget_overflow",
    });
  });

  it("required resource が見つからない場合は silent fallback せず失敗する", async () => {
    const explicitRoot = await createSkillRoot("task03-plan-missing-");
    tempRoots.push(explicitRoot);

    const resolver = new SkillCreatorSourceResolver();
    const resolution = await resolver.resolve({
      explicitRoot,
      requiredRelativePaths: [],
    });
    const planner = new PhaseResourcePlanner();

    await expect(
      planner.plan({
        operation: "verify",
        resolution,
        maxBytes: 1024,
        requests: [
          {
            id: "verify-rules",
            kind: "schema",
            relativePath: "schemas/verify-rules.json",
            tier: "required-context",
            required: true,
          },
        ],
      }),
    ).rejects.toThrow("required_resource_missing:verify:verify-rules");
  });
});
