import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { afterEach, describe, expect, it } from "vitest";
import { ManifestLoader } from "../ManifestLoader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.resolve(__dirname, "fixtures/workflow-manifest");
const sampleManifestPath = path.join(fixtureDir, "workflow-manifest.json");

async function createTempManifestFromFixture(): Promise<{
  manifestPath: string;
  tempDir: string;
}> {
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "manifest-loader-test-"),
  );
  await fs.cp(fixtureDir, tempDir, { recursive: true });
  return {
    manifestPath: path.join(tempDir, "workflow-manifest.json"),
    tempDir,
  };
}

describe("ManifestLoader", () => {
  const cleanupDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      cleanupDirs
        .splice(0)
        .map((dir) => fs.rm(dir, { recursive: true, force: true })),
    );
  });

  it("有効な manifest を読み込み、resource path を絶対パスへ正規化する", async () => {
    const loader = new ManifestLoader();

    const manifest = await loader.loadManifest(sampleManifestPath);

    expect(manifest.workflowId).toBe("task-sdk-01-foundation");
    expect(manifest.resources).toHaveLength(2);
    expect(manifest.resources[0]?.absolutePath).toBe(
      path.join(fixtureDir, "resources/manifest-overview.md"),
    );
    expect(manifest.phases[0]).toMatchObject({
      id: "phase-1",
      entryHookId: "load-manifest",
      exitHookId: "publish-scope",
    });
    expect(manifest.manifestContentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("未許可 top-level field を拒否する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as Record<
      string,
      unknown
    >;
    raw.authMode = "api-key";
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow(
      "workflow manifest に未許可フィールドがあります: authMode",
    );
  });

  it("schemaVersion 不一致を拒否する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as Record<
      string,
      unknown
    >;
    raw.schemaVersion = 2;
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow(
      "schemaVersion は 1 のみ受理します",
    );
  });

  it("entry hook 参照不正を拒否する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      phases: Array<Record<string, unknown>>;
    };
    raw.phases[0]!.entryHookId = "missing-entry";
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow(
      "phases[0].entryHookId が entry に存在しません",
    );
  });

  it("phase 順序不正を拒否する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      phases: Array<Record<string, unknown>>;
    };
    raw.phases = [raw.phases[1]!, raw.phases[0]!];
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow(
      "phase 順序が不正です",
    );
  });

  it("resource 欠落を検出する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const missingResourcePath = path.join(
      tempDir,
      "resources/manifest-overview.md",
    );
    await fs.rm(missingResourcePath);

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow();
  });

  it("resource.phaseIds の未定義 phase 参照を拒否する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      resources: Array<Record<string, unknown>>;
    };
    raw.resources[0]!.phaseIds = ["phase-9"];
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow(
      "resource manifest-overview の phaseId が未定義です: phase-9",
    );
  });

  it("phase.resourceIds と resources.phaseIds の不一致を拒否する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      resources: Array<Record<string, unknown>>;
    };
    raw.resources[0]!.phaseIds = ["phase-2"];
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow(
      "resource manifest-overview が phaseIds で参照する phase-2 が phases.resourceIds と一致しません",
    );
  });

  it("同一 cache key では同じ参照を返し、mtime 更新後は再読込する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const loader = new ManifestLoader();

    const first = await loader.loadManifest(manifestPath);
    const second = await loader.loadManifest(manifestPath);

    expect(second).toBe(first);

    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      resources: Array<Record<string, unknown>>;
    };
    raw.resources[1]!.path = "./resources/cache-target-v2.md";
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const third = await loader.loadManifest(manifestPath);

    expect(third).not.toBe(first);
    expect(third.resourceDescriptorHash).not.toBe(first.resourceDescriptorHash);
    expect(third.resources[1]?.absolutePath).toBe(
      path.join(tempDir, "resources/cache-target-v2.md"),
    );
  });

  it("manifest 内容が変わった場合は mtime が同じでも再読込する", async () => {
    const { manifestPath, tempDir } = await createTempManifestFromFixture();
    cleanupDirs.push(tempDir);
    const loader = new ManifestLoader();

    const first = await loader.loadManifest(manifestPath);
    const originalStat = await fs.stat(manifestPath);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      phases: Array<Record<string, unknown>>;
    };

    raw.phases[0]!.title = "manifest scope hardened";
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));
    await fs.utimes(manifestPath, originalStat.atime, originalStat.mtime);

    const second = await loader.loadManifest(manifestPath);

    expect(second).not.toBe(first);
    expect(second.manifestContentHash).not.toBe(first.manifestContentHash);
    expect(second.cacheKey).toBe(first.cacheKey);
    expect(second.phases[0]?.title).toBe("manifest scope hardened");
  });
});
