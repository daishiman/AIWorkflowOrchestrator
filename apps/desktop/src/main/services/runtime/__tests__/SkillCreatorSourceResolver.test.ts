import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import type { LoadedWorkflowManifest } from "@repo/shared/types";
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
  await writeTextFile(
    rootPath,
    "agents/discover-problem.md",
    "discover-problem prompt",
  );
  return rootPath;
}

describe("SkillCreatorSourceResolver", () => {
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

  it("explicit root を env root より優先順で列挙する", async () => {
    const explicitRoot = await createSkillRoot("task03-explicit-");
    const envRoot = await createSkillRoot("task03-env-");
    tempRoots.push(explicitRoot, envRoot);
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = envRoot;

    const resolver = new SkillCreatorSourceResolver();
    const result = await resolver.resolve({
      explicitRoot,
      requiredRelativePaths: ["agents/discover-problem.md"],
    });

    expect(result.candidateRoots[0]).toMatchObject({
      source: "explicit",
      rootPath: explicitRoot,
      missingRequiredPaths: [],
    });
    expect(result.candidateRoots[1]).toMatchObject({
      source: "env",
      rootPath: envRoot,
      missingRequiredPaths: [],
    });
  });

  it("required path が欠けた root を structure_mismatch として reject する", async () => {
    const explicitRoot = await createSkillRoot("task03-explicit-missing-");
    const envRoot = await createSkillRoot("task03-env-valid-");
    tempRoots.push(explicitRoot, envRoot);
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = envRoot;
    await fs.rm(path.join(explicitRoot, "agents"), {
      recursive: true,
      force: true,
    });

    const resolver = new SkillCreatorSourceResolver();
    const result = await resolver.resolve({
      explicitRoot,
      requiredRelativePaths: ["agents/discover-problem.md"],
    });

    expect(result.degradeReasons).toContain("structure_mismatch");
    expect(result.rejectedRoots).toContainEqual(
      expect.objectContaining({
        source: "explicit",
        rootPath: explicitRoot,
        reason: "structure_mismatch",
      }),
    );
  });

  it("manifest foundation snapshot をそのまま provenance 用に返す", async () => {
    const manifestRoot = await createSkillRoot("task03-manifest-");
    tempRoots.push(manifestRoot);
    const manifest: LoadedWorkflowManifest = {
      schemaVersion: 1,
      workflowId: "task-sdk-03-test",
      phases: [],
      resources: [
        {
          id: "discover-problem",
          kind: "agent",
          path: "./agents/discover-problem.md",
          absolutePath: path.join(manifestRoot, "agents/discover-problem.md"),
        },
      ],
      entry: [],
      exit: [],
      sourcePath: path.join(manifestRoot, "workflow-manifest.json"),
      manifestDir: manifestRoot,
      manifestMtimeMs: 1234,
      manifestContentHash: "manifest-hash",
      resourceDescriptorHash: "resource-hash",
      cacheKey: "cache-key",
    };

    const resolver = new SkillCreatorSourceResolver();
    const result = await resolver.resolve({
      manifest,
      requiredRelativePaths: ["agents/discover-problem.md"],
    });

    expect(result.foundationSnapshot).toEqual({
      sourcePath: manifest.sourcePath,
      manifestDir: manifest.manifestDir,
      manifestMtimeMs: manifest.manifestMtimeMs,
      resourceDescriptorHash: manifest.resourceDescriptorHash,
      cacheKey: manifest.cacheKey,
    });
    expect(result.candidateRoots[0]).toMatchObject({
      source: "manifest",
      rootPath: manifestRoot,
    });
  });

  it("manifest と explicit/env が同一 root の場合は 1 件に dedupe される", async () => {
    const explicitRoot = await createSkillRoot("task03-manifest-explicit-");
    tempRoots.push(explicitRoot);
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = explicitRoot;

    const manifest: LoadedWorkflowManifest = {
      schemaVersion: 1,
      workflowId: "task-sdk-03-dedupe",
      phases: [],
      resources: [
        {
          id: "discover-problem",
          kind: "agent",
          path: "./agents/discover-problem.md",
          absolutePath: path.join(explicitRoot, "agents/discover-problem.md"),
        },
      ],
      entry: [],
      exit: [],
      sourcePath: path.join(explicitRoot, "workflow-manifest.json"),
      manifestDir: explicitRoot,
      manifestMtimeMs: 1234,
      manifestContentHash: "manifest-hash",
      resourceDescriptorHash: "resource-hash",
      cacheKey: "cache-key",
    };

    const resolver = new SkillCreatorSourceResolver();
    const result = await resolver.resolve({
      explicitRoot,
      manifest,
      requiredRelativePaths: ["agents/discover-problem.md"],
    });

    const sameRootCandidates = result.candidateRoots.filter(
      (candidate) => candidate.rootPath === explicitRoot,
    );
    expect(sameRootCandidates).toHaveLength(1);
    expect(sameRootCandidates[0]).toMatchObject({
      source: "manifest",
      rootPath: explicitRoot,
      missingRequiredPaths: [],
    });
  });

  it("explicit と env が同一 root の場合は explicit が優先される", async () => {
    const explicitRoot = await createSkillRoot("task03-explicit-env-");
    tempRoots.push(explicitRoot);
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = explicitRoot;

    const resolver = new SkillCreatorSourceResolver();
    const result = await resolver.resolve({
      explicitRoot,
      requiredRelativePaths: ["agents/discover-problem.md"],
    });

    const sameRootCandidates = result.candidateRoots.filter(
      (candidate) => candidate.rootPath === explicitRoot,
    );
    expect(sameRootCandidates).toHaveLength(1);
    expect(sameRootCandidates[0]).toMatchObject({
      source: "explicit",
      rootPath: explicitRoot,
      missingRequiredPaths: [],
    });
  });
});
