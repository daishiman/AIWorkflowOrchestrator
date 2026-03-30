import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ManifestLoader } from "../ManifestLoader";
import {
  SKILL_CREATOR_MANIFEST_PATH,
  resolveDefaultManifestPath,
} from "../../skill/constants";

/**
 * TASK-P0-03: workflow-manifest.json 本番 manifest の統合テスト
 *
 * canonical (.claude/skills/skill-creator/) に配置された
 * workflow-manifest.json が ManifestLoader の全検証を通過し、
 * mirror (.agents/skills/skill-creator/) と parity が取れていることを確認する。
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** プロジェクトルート（apps/desktop/src/main/services/runtime/__tests__ → 7階層上） */
const projectRoot = path.resolve(__dirname, "../../../../../../..");

const canonicalManifestPath = path.join(
  projectRoot,
  ".claude/skills/skill-creator/workflow-manifest.json",
);
const mirrorManifestPath = path.join(
  projectRoot,
  ".agents/skills/skill-creator/workflow-manifest.json",
);

describe("TASK-P0-03: production workflow-manifest.json", () => {
  // TC-01: 本番 manifest を loadManifest() で読み込む (AC-1, AC-3)
  it("canonical manifest を loadManifest() でエラーなく読み込む", async () => {
    const loader = new ManifestLoader();

    const manifest = await loader.loadManifest(canonicalManifestPath);

    expect(manifest).toBeDefined();
    expect(manifest.workflowId).toBe("skill-creator");
    expect(manifest.manifestContentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  // TC-02: schemaVersion が 1 であることを検証する (AC-6)
  it("schemaVersion が 1 である", async () => {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(canonicalManifestPath);

    expect(manifest.schemaVersion).toBe(1);
  });

  // TC-03: 全 resource の path が実在ファイルを指す (AC-4)
  it("全 resource descriptor の path が実在ファイルを指す", async () => {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(canonicalManifestPath);

    for (const resource of manifest.resources) {
      const exists = await fs
        .access(resource.absolutePath)
        .then(() => true)
        .catch(() => false);
      expect(
        exists,
        `resource ${resource.id} の path が存在しない: ${resource.absolutePath}`,
      ).toBe(true);
    }
  });

  // TC-04: phases が 5 phase を含む (AC-5)
  it("phases が 5 phase を含む", async () => {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(canonicalManifestPath);

    expect(manifest.phases).toHaveLength(5);

    const phaseIds = manifest.phases.map((p) => p.id);
    expect(phaseIds).toEqual([
      "requirements-gathering",
      "plan",
      "execute",
      "verify",
      "improve",
    ]);
  });

  // TC-05: entry/exit hooks が定義されている (AC-7)
  it("entry/exit hooks が定義されている", async () => {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(canonicalManifestPath);

    expect(manifest.entry.length).toBeGreaterThan(0);
    expect(manifest.exit.length).toBeGreaterThan(0);

    for (const hook of manifest.entry) {
      expect(hook.id).toBeTruthy();
      expect(hook.command).toBeTruthy();
    }
    for (const hook of manifest.exit) {
      expect(hook.id).toBeTruthy();
      expect(hook.command).toBeTruthy();
    }
  });

  // TC-06: phase の entryHookId が entry[] に存在する (AC-7)
  it("全 phase の entryHookId が entry[] に存在する", async () => {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(canonicalManifestPath);

    const entryHookIds = new Set(manifest.entry.map((h) => h.id));

    for (const phase of manifest.phases) {
      expect(
        entryHookIds.has(phase.entryHookId),
        `phase ${phase.id} の entryHookId "${phase.entryHookId}" が entry[] にない`,
      ).toBe(true);
    }
  });

  // TC-07: phase の exitHookId が exit[] に存在する (AC-7)
  it("全 phase の exitHookId が exit[] に存在する", async () => {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(canonicalManifestPath);

    const exitHookIds = new Set(manifest.exit.map((h) => h.id));

    for (const phase of manifest.phases) {
      expect(
        exitHookIds.has(phase.exitHookId),
        `phase ${phase.id} の exitHookId "${phase.exitHookId}" が exit[] にない`,
      ).toBe(true);
    }
  });

  // AC-2: mirror parity 確認
  it("canonical と mirror の manifest が同一内容である", async () => {
    const [canonicalContent, mirrorContent] = await Promise.all([
      fs.readFile(canonicalManifestPath, "utf-8"),
      fs.readFile(mirrorManifestPath, "utf-8"),
    ]);

    expect(canonicalContent).toBe(mirrorContent);
  });

  // resource kind の検証
  it("全 resource の kind が agent/reference/schema/asset のいずれかである", async () => {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(canonicalManifestPath);

    const validKinds = new Set(["agent", "reference", "schema", "asset"]);
    for (const resource of manifest.resources) {
      expect(
        validKinds.has(resource.kind),
        `resource ${resource.id} の kind "${resource.kind}" が不正`,
      ).toBe(true);
    }
  });

  // phase dependsOn 検証
  it("phase の dependsOn が正しい依存順序を形成する", async () => {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(canonicalManifestPath);

    // 最初の phase は dependsOn なし
    expect(manifest.phases[0]?.dependsOn).toBeUndefined();

    // 2番目以降は直前の phase に依存
    for (let i = 1; i < manifest.phases.length; i++) {
      const phase = manifest.phases[i]!;
      expect(phase.dependsOn).toBeDefined();
      expect(phase.dependsOn).toContain(manifest.phases[i - 1]!.id);
    }
  });
});

/**
 * Phase 6: Edge case / regression テスト
 */
describe("TASK-P0-03: edge case & regression tests", () => {
  const cleanupDirs: string[] = [];

  async function createTempFromCanonical(): Promise<{
    manifestPath: string;
    tempDir: string;
  }> {
    const canonicalDir = path.join(projectRoot, ".claude/skills/skill-creator");
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "p0-03-edge-test-"),
    );
    await fs.cp(canonicalDir, tempDir, { recursive: true });
    return {
      manifestPath: path.join(tempDir, "workflow-manifest.json"),
      tempDir,
    };
  }

  afterEach(async () => {
    await Promise.all(
      cleanupDirs
        .splice(0)
        .map((dir) => fs.rm(dir, { recursive: true, force: true })),
    );
  });

  // EC-01: dependsOn に存在しない phase ID を指定
  it("dependsOn に存在しない phase ID を指定すると拒否される", async () => {
    const { manifestPath, tempDir } = await createTempFromCanonical();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      phases: Array<Record<string, unknown>>;
    };
    raw.phases[1]!.dependsOn = ["nonexistent-phase"];
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow(
      "dependsOn が未定義です",
    );
  });

  // EC-02: resource の kind を空文字にする
  it("resource の kind が空文字だと拒否される", async () => {
    const { manifestPath, tempDir } = await createTempFromCanonical();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      resources: Array<Record<string, unknown>>;
    };
    raw.resources[0]!.kind = "";
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow();
  });

  // EC-03: entry hook の command を空文字にする
  it("entry hook の command が空文字だと拒否される", async () => {
    const { manifestPath, tempDir } = await createTempFromCanonical();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      entry: Array<Record<string, unknown>>;
    };
    raw.entry[0]!.command = "";
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow();
  });

  // EC-04: phases を 1 つだけにする（最低 1 phase で検証通過）
  it("phases が 1 つでも検証は通過する", async () => {
    const { manifestPath, tempDir } = await createTempFromCanonical();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as {
      phases: Array<Record<string, unknown>>;
      resources: Array<Record<string, unknown>>;
    };
    // 最初の phase のみ残し、対応する resource も絞る
    raw.phases = [raw.phases[0]!];
    raw.resources = raw.resources.filter(
      (r) =>
        Array.isArray(r.phaseIds) &&
        (r.phaseIds as string[]).includes("requirements-gathering"),
    );
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(manifestPath);

    expect(manifest.phases).toHaveLength(1);
  });

  // RC-01: resource path のファイルが削除された場合
  it("resource path のファイル削除を検出する", async () => {
    const { manifestPath, tempDir } = await createTempFromCanonical();
    cleanupDirs.push(tempDir);
    await fs.rm(path.join(tempDir, "agents/analyze-request.md"));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow();
  });

  // RC-02: schemaVersion が変更された場合
  it("schemaVersion 変更を検出する", async () => {
    const { manifestPath, tempDir } = await createTempFromCanonical();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as Record<
      string,
      unknown
    >;
    raw.schemaVersion = 99;
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow(
      "schemaVersion は 1 のみ受理します",
    );
  });

  // RC-03: workflowId が空文字に変更された場合
  it("workflowId が空文字だと拒否される", async () => {
    const { manifestPath, tempDir } = await createTempFromCanonical();
    cleanupDirs.push(tempDir);
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as Record<
      string,
      unknown
    >;
    raw.workflowId = "";
    await fs.writeFile(manifestPath, JSON.stringify(raw, null, 2));

    const loader = new ManifestLoader();

    await expect(loader.loadManifest(manifestPath)).rejects.toThrow();
  });
});

/**
 * TASK-P0-04: ManifestLoader デフォルト起動パスのテスト
 *
 * デフォルト起動ロジックにより、explicitRoot 未指定でも
 * manifest が自動解決・読み込みされることを検証する。
 */
describe("TASK-P0-04: default manifest startup path", () => {
  const canonicalSkillCreatorRoot = path.join(
    projectRoot,
    ".claude",
    "skills",
    "skill-creator",
  );
  let savedEnv: string | undefined;

  beforeAll(() => {
    savedEnv = process.env.AIWORKFLOW_SKILL_CREATOR_PATH;
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH = canonicalSkillCreatorRoot;
  });

  afterAll(() => {
    if (savedEnv === undefined) {
      delete process.env.AIWORKFLOW_SKILL_CREATOR_PATH;
    } else {
      process.env.AIWORKFLOW_SKILL_CREATOR_PATH = savedEnv;
    }
  });

  // TC-10: デフォルト起動パス定数でファイル名が正しく解決される
  it("SKILL_CREATOR_MANIFEST_PATH を使って canonical manifest を読み込める", async () => {
    const loader = new ManifestLoader();
    const defaultManifestPath = path.join(
      projectRoot,
      ".claude",
      "skills",
      "skill-creator",
      SKILL_CREATOR_MANIFEST_PATH,
    );

    const manifest = await loader.loadManifest(defaultManifestPath);

    expect(manifest).toBeDefined();
    expect(manifest.workflowId).toBe("skill-creator");
  });

  // TC-11: resolveDefaultManifestPath() がプロジェクトルートベースで正しく解決する
  it("resolveDefaultManifestPath() が有効な絶対パスを返す", () => {
    const resolvedPath = resolveDefaultManifestPath();

    expect(path.isAbsolute(resolvedPath)).toBe(true);
    expect(resolvedPath).toContain(
      path.join(".claude", "skills", "skill-creator", "workflow-manifest.json"),
    );
  });

  // TC-12: resolveDefaultManifestPath() で解決したパスから manifest を読み込める
  it("resolveDefaultManifestPath() で解決したパスから manifest を読み込める", async () => {
    const loader = new ManifestLoader();
    const resolvedPath = resolveDefaultManifestPath();

    const manifest = await loader.loadManifest(resolvedPath);

    expect(manifest).toBeDefined();
    expect(manifest.workflowId).toBe("skill-creator");
    expect(manifest.schemaVersion).toBe(1);
  });

  // TC-13: SKILL_CREATOR_MANIFEST_PATH が空文字でない
  it("SKILL_CREATOR_MANIFEST_PATH が空文字でなく正しい値を持つ", () => {
    expect(SKILL_CREATOR_MANIFEST_PATH).toBeTruthy();
    expect(SKILL_CREATOR_MANIFEST_PATH.trim()).not.toBe("");
    expect(SKILL_CREATOR_MANIFEST_PATH).toBe("workflow-manifest.json");
  });

  // TC-14: explicitRoot 指定時はそのパスが優先される
  it("resolveDefaultManifestPath() は explicitRoot を優先する", () => {
    const customRoot = "/custom/skill-creator";
    const resolvedPath = resolveDefaultManifestPath(customRoot);

    expect(resolvedPath).toBe(
      path.join(customRoot, SKILL_CREATOR_MANIFEST_PATH),
    );
  });
});

/**
 * TASK-P0-04: デフォルト起動エラーパス & 回帰テスト
 */
describe("TASK-P0-04: default startup error paths", () => {
  // EC-10: 存在しないディレクトリを explicitRoot に指定した場合
  it("存在しないディレクトリを explicitRoot に指定すると正しいパスを返す", () => {
    const resolvedPath = resolveDefaultManifestPath("/nonexistent/path");
    expect(resolvedPath).toBe(
      path.join("/nonexistent/path", "workflow-manifest.json"),
    );
  });

  // EC-11: 引数なしで環境変数もなく、候補にmanifestがない場合エラー
  it("候補パスに manifest が存在しない場合エラーを throw する", () => {
    const saved = process.env.AIWORKFLOW_SKILL_CREATOR_PATH;
    process.env.AIWORKFLOW_SKILL_CREATOR_PATH =
      "/tmp/nonexistent-skill-creator";
    try {
      // Note: REPO_SKILL_CREATOR_PATH is already evaluated at module load time (apps/desktop/.claude/...)
      // and HOME path (~/.aiworkflow/...) likely doesn't have manifest either
      // So if env points to nonexistent, and other candidates don't have it, should throw
      expect(() => resolveDefaultManifestPath()).toThrow(
        "workflow-manifest.json が見つかりません",
      );
    } finally {
      if (saved === undefined) {
        delete process.env.AIWORKFLOW_SKILL_CREATOR_PATH;
      } else {
        process.env.AIWORKFLOW_SKILL_CREATOR_PATH = saved;
      }
    }
  });

  // EC-12: resolveDefaultManifestPath で解決したパスの manifest が壊れている場合
  it("解決したパスの manifest が破損している場合 ManifestLoader がエラーを throw する", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "p0-04-error-test-"),
    );
    try {
      await fs.writeFile(
        path.join(tempDir, "workflow-manifest.json"),
        "{ invalid json",
      );
      const resolvedPath = resolveDefaultManifestPath(tempDir);
      const loader = new ManifestLoader();

      await expect(loader.loadManifest(resolvedPath)).rejects.toThrow();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  // RC-04: TASK-P0-03 の既存テスト（TC-01〜TC-09）が引き続き通ることの確認
  // (このファイル内の既存 describe ブロックが全 Green であることで暗黙的に確認)
});
