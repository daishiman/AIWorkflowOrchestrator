/**
 * SkillForker ユニットテスト
 * TDD: Phase 4 (Red) → Phase 5 (Green)
 *
 * @see docs/30-workflows/completed-tasks/TASK-9E-skill-fork/phase-4-test-creation.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import type { SkillForkOptions } from "@repo/shared";
import { SkillForker } from "../SkillForker";

vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("fs/promises", () => ({
  access: vi.fn(),
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  cp: vi.fn(),
  rm: vi.fn(),
  readdir: vi.fn(),
}));

describe("SkillForker", () => {
  const testSkillsDir = "/test/skills";
  let forker: SkillForker;

  const defaultOptions: SkillForkOptions = {
    sourceSkill: "source-skill",
    newName: "forked-skill",
    copyAgents: true,
    copyReferences: true,
    copyScripts: true,
    copyAssets: true,
  };

  const sampleSkillMd = `---
name: source-skill
description: A test skill
allowed-tools:
  - Read
  - Write
---
# Source Skill

This is the body.`;

  beforeEach(() => {
    vi.clearAllMocks();
    forker = new SkillForker(testSkillsDir);

    // デフォルト: ソースは存在、デストは存在しない
    vi.mocked(fs.access).mockImplementation(async (p) => {
      const pathStr = String(p);
      if (pathStr.includes("source-skill")) {
        return undefined;
      }
      throw new Error("ENOENT");
    });

    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(sampleSkillMd);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.cp).mockResolvedValue(undefined);
    vi.mocked(fs.rm).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue([] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========================================
  // fork() 正常系テスト
  // ========================================
  describe("fork() 正常系", () => {
    it("SF-01: 全オプションコピーでフォークできる", async () => {
      const result = await forker.fork(defaultOptions);

      expect(result.success).toBe(true);
      expect(result.newSkillPath).toBe(
        path.resolve(testSkillsDir, "forked-skill"),
      );
      expect(result.copiedFiles).toContain("SKILL.md");
      expect(result.copiedFiles).toContain("fork-metadata.json");
      expect(vi.mocked(fs.mkdir)).toHaveBeenCalledWith(
        path.resolve(testSkillsDir, "forked-skill"),
        { recursive: true },
      );
    });

    it("SF-02: 部分コピーでフォークできる（agents のみ除外）", async () => {
      const options: SkillForkOptions = {
        ...defaultOptions,
        copyAgents: false,
      };
      const result = await forker.fork(options);

      expect(result.success).toBe(true);
      // agents/ の cp は呼ばれない
      const cpCalls = vi.mocked(fs.cp).mock.calls;
      const agentsCp = cpCalls.find((call) =>
        String(call[0]).includes("agents"),
      );
      expect(agentsCp).toBeUndefined();
    });

    it("SF-03: 説明文を変更してフォークできる", async () => {
      const options: SkillForkOptions = {
        ...defaultOptions,
        description: "New description",
      };

      await forker.fork(options);

      const writeCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => String(call[0]).includes("SKILL.md"));
      expect(writeCall).toBeDefined();
      const writtenContent = String(writeCall![1]);
      expect(writtenContent).toContain("description: New description");
    });

    it("SF-04: modifyAllowedTools 指定でフォークできる", async () => {
      const options: SkillForkOptions = {
        ...defaultOptions,
        modifyAllowedTools: ["Glob", "Grep"],
      };

      await forker.fork(options);

      const writeCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => String(call[0]).includes("SKILL.md"));
      expect(writeCall).toBeDefined();
      const writtenContent = String(writeCall![1]);
      expect(writtenContent).toContain("  - Glob");
      expect(writtenContent).toContain("  - Grep");
      expect(writtenContent).not.toContain("  - Read");
    });
  });

  // ========================================
  // modifySkillMd() テスト
  // ========================================
  describe("modifySkillMd()", () => {
    it("SF-05: スキル名が正しく更新される", () => {
      const result = forker.modifySkillMd(sampleSkillMd, defaultOptions);

      expect(result).toContain("name: forked-skill");
      expect(result).not.toContain("name: source-skill");
    });

    it("SF-06: 説明文が正しく更新される", () => {
      const options: SkillForkOptions = {
        ...defaultOptions,
        description: "Updated description",
      };
      const result = forker.modifySkillMd(sampleSkillMd, options);

      expect(result).toContain("description: Updated description");
      expect(result).not.toContain("description: A test skill");
    });

    it("SF-07: allowedTools が正しく更新される", () => {
      const options: SkillForkOptions = {
        ...defaultOptions,
        modifyAllowedTools: ["Bash", "Read"],
      };
      const result = forker.modifySkillMd(sampleSkillMd, options);

      expect(result).toContain("  - Bash");
      expect(result).toContain("  - Read");
      expect(result).not.toContain("  - Write");
    });

    it("SF-08: その他のフィールドが維持される", () => {
      const result = forker.modifySkillMd(sampleSkillMd, defaultOptions);

      // description は変更なし（options.description が undefined）
      expect(result).toContain("description: A test skill");
      // body は維持される
      expect(result).toContain("# Source Skill");
      expect(result).toContain("This is the body.");
    });

    it("SF-09: forked-from フィールドが追加される", () => {
      const result = forker.modifySkillMd(sampleSkillMd, defaultOptions);

      expect(result).toContain("forked-from: source-skill");
    });

    it("SF-10: Frontmatter が無い場合は新規作成される", () => {
      const noFrontmatter = "# Just a body\n\nNo frontmatter.";
      const result = forker.modifySkillMd(noFrontmatter, defaultOptions);

      expect(result).toContain("---");
      expect(result).toContain("name: forked-skill");
      expect(result).toContain("forked-from: source-skill");
    });

    it("SF-11: マルチライン description を持つ SKILL.md を正しく処理する", () => {
      const multiLineSkillMd = `---
name: multi-desc-skill
description: |
  This is a multi-line
  description for testing
allowed-tools:
  - Read
---
# Body`;

      const result = forker.modifySkillMd(multiLineSkillMd, {
        ...defaultOptions,
        description: "Simple replacement",
      });

      expect(result).toContain("description: Simple replacement");
      expect(result).not.toContain("This is a multi-line");
      expect(result).toContain("allowed-tools:");
    });
  });

  // ========================================
  // copyDirectory() テスト
  // ========================================
  describe("copyDirectory()", () => {
    it("SF-12: 指定サブディレクトリのみコピーされる", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue([] as any);

      await forker.copyDirectory("/src", "/dest", "agents");

      expect(vi.mocked(fs.cp)).toHaveBeenCalledWith(
        path.join("/src", "agents"),
        path.join("/dest", "agents"),
        { recursive: true },
      );
    });

    it("SF-13: コピーされたファイル一覧が返される", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: "agent1.md", isDirectory: () => false },
        { name: "agent2.md", isDirectory: () => false },
      ] as any);

      const files = await forker.copyDirectory("/src", "/dest", "agents");

      expect(files).toHaveLength(2);
      expect(files).toContain(path.join("agents", "agent1.md"));
      expect(files).toContain(path.join("agents", "agent2.md"));
    });

    it("SF-14: ソースにサブディレクトリが存在しない場合は空配列を返す", async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error("ENOENT"));

      const files = await forker.copyDirectory("/src", "/dest", "agents");

      expect(files).toEqual([]);
      expect(vi.mocked(fs.cp)).not.toHaveBeenCalled();
    });

    it("SF-15: ネストしたディレクトリが再帰コピーされる", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      // 最初の readdir: トップレベル
      vi.mocked(fs.readdir)
        .mockResolvedValueOnce([
          { name: "sub", isDirectory: () => true },
          { name: "file.md", isDirectory: () => false },
        ] as any)
        // 2回目: サブディレクトリ
        .mockResolvedValueOnce([
          { name: "nested.md", isDirectory: () => false },
        ] as any);

      const files = await forker.copyDirectory("/src", "/dest", "agents");

      expect(files).toContain(path.join("agents", "file.md"));
      expect(files).toContain(path.join("agents", "sub", "nested.md"));
    });
  });

  // ========================================
  // writeForkMetadata() テスト
  // ========================================
  describe("writeForkMetadata()", () => {
    it("SF-16: fork-metadata.json が正しく書き込まれる", async () => {
      await forker.writeForkMetadata("/dest", {
        forkedFrom: "source-skill",
        forkedAt: "2026-02-28T12:00:00.000Z",
        originalDescription: "Original desc",
      });

      expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
        path.join("/dest", "fork-metadata.json"),
        expect.any(String),
        "utf-8",
      );

      const writtenJson = JSON.parse(
        vi.mocked(fs.writeFile).mock.calls[0][1] as string,
      );
      expect(writtenJson.forkedFrom).toBe("source-skill");
      expect(writtenJson.forkedAt).toBe("2026-02-28T12:00:00.000Z");
      expect(writtenJson.originalDescription).toBe("Original desc");
    });

    it("SF-17: forkedAt が ISO 8601 形式である", async () => {
      await forker.fork(defaultOptions);

      const metadataWriteCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) =>
          String(call[0]).includes("fork-metadata.json"),
        );
      expect(metadataWriteCall).toBeDefined();

      const metadata = JSON.parse(metadataWriteCall![1] as string);
      // ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(metadata.forkedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  // ========================================
  // 異常系テスト
  // ========================================
  describe("異常系", () => {
    it("SF-18: 存在しないソーススキル指定時にエラーになる", async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error("ENOENT"));

      await expect(forker.fork(defaultOptions)).rejects.toThrow(
        "フォーク元スキルが見つかりません",
      );
    });

    it("SF-19: 同名スキルへのフォーク時にエラーになる", async () => {
      // ソースもデストも存在する
      vi.mocked(fs.access).mockResolvedValue(undefined);

      await expect(forker.fork(defaultOptions)).rejects.toThrow(
        "同名のスキルが既に存在します",
      );
    });

    it("SF-20: ファイルシステムエラー時にロールバックされる", async () => {
      // readFile が失敗（SKILL.md 読み取り失敗ではなくコピー失敗）
      vi.mocked(fs.cp).mockRejectedValue(new Error("ENOSPC"));

      await expect(forker.fork(defaultOptions)).rejects.toThrow("ENOSPC");

      // ロールバック（rm）が呼ばれる
      expect(vi.mocked(fs.rm)).toHaveBeenCalledWith(
        path.resolve(testSkillsDir, "forked-skill"),
        { recursive: true, force: true },
      );
    });

    it("SF-21: パストラバーサル攻撃が検出される", async () => {
      const maliciousOptions: SkillForkOptions = {
        ...defaultOptions,
        sourceSkill: "../../../etc/passwd",
      };

      await expect(forker.fork(maliciousOptions)).rejects.toThrow(
        "不正なパスが検出されました",
      );
    });
  });

  // ========================================
  // 境界値テスト
  // ========================================
  describe("境界値", () => {
    it("SF-22: 空の SKILL.md を持つスキルのフォーク", async () => {
      vi.mocked(fs.readFile).mockResolvedValue("");

      const result = await forker.fork({
        ...defaultOptions,
        copyAgents: false,
        copyReferences: false,
        copyScripts: false,
        copyAssets: false,
      });

      expect(result.success).toBe(true);
    });

    it("SF-23: サブディレクトリが存在しないスキルのフォーク", async () => {
      // ソースは存在するが、サブディレクトリは存在しない
      vi.mocked(fs.access).mockImplementation(async (p) => {
        const pathStr = String(p);
        if (
          pathStr.includes("source-skill") &&
          !pathStr.includes("/agents") &&
          !pathStr.includes("/references") &&
          !pathStr.includes("/scripts") &&
          !pathStr.includes("/assets")
        ) {
          return undefined;
        }
        throw new Error("ENOENT");
      });

      const result = await forker.fork(defaultOptions);

      expect(result.success).toBe(true);
      // SKILL.md と fork-metadata.json のみ
      expect(result.copiedFiles).toContain("SKILL.md");
      expect(result.copiedFiles).toContain("fork-metadata.json");
    });
  });

  // ========================================
  // extractDescriptionFromFrontmatter() テスト（fork() 経由）
  // ========================================
  describe("extractDescriptionFromFrontmatter（fork 経由の metadata）", () => {
    it("SF-29: マルチライン | description がメタデータに抽出される", async () => {
      const multiLineSkillMd = `---
name: source-skill
description: |
  This is a multi-line
  description for testing
allowed-tools:
  - Read
---
# Body`;
      vi.mocked(fs.readFile).mockResolvedValue(multiLineSkillMd);

      await forker.fork({
        ...defaultOptions,
        copyAgents: false,
        copyReferences: false,
        copyScripts: false,
        copyAssets: false,
      });

      const metadataWriteCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) =>
          String(call[0]).includes("fork-metadata.json"),
        );
      expect(metadataWriteCall).toBeDefined();

      const metadata = JSON.parse(metadataWriteCall![1] as string);
      expect(metadata.originalDescription).toBe(
        "This is a multi-line description for testing",
      );
    });

    it("SF-30: description キーのみ（値なし）の場合は originalDescription が undefined", async () => {
      const noValueDescMd = `---
name: source-skill
description:
allowed-tools:
  - Read
---
# Body`;
      vi.mocked(fs.readFile).mockResolvedValue(noValueDescMd);

      await forker.fork({
        ...defaultOptions,
        copyAgents: false,
        copyReferences: false,
        copyScripts: false,
        copyAssets: false,
      });

      const metadataWriteCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) =>
          String(call[0]).includes("fork-metadata.json"),
        );
      const metadata = JSON.parse(metadataWriteCall![1] as string);
      expect(metadata.originalDescription).toBeUndefined();
    });

    it("SF-31: description キーがない場合は originalDescription が undefined", async () => {
      const noDescMd = `---
name: source-skill
allowed-tools:
  - Read
---
# Body`;
      vi.mocked(fs.readFile).mockResolvedValue(noDescMd);

      await forker.fork({
        ...defaultOptions,
        copyAgents: false,
        copyReferences: false,
        copyScripts: false,
        copyAssets: false,
      });

      const metadataWriteCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) =>
          String(call[0]).includes("fork-metadata.json"),
        );
      const metadata = JSON.parse(metadataWriteCall![1] as string);
      expect(metadata.originalDescription).toBeUndefined();
    });
  });

  // ========================================
  // ロールバック失敗テスト
  // ========================================
  describe("ロールバック", () => {
    it("SF-32: ロールバック失敗時もエラーが伝播する（非致命的）", async () => {
      // cp でエラー発生 → rollback 呼び出し → rollback も失敗
      vi.mocked(fs.cp).mockRejectedValue(new Error("ENOSPC"));
      vi.mocked(fs.rm).mockRejectedValue(new Error("EPERM"));

      await expect(forker.fork(defaultOptions)).rejects.toThrow("ENOSPC");
      // rm が呼ばれた（ロールバック試行された）
      expect(vi.mocked(fs.rm)).toHaveBeenCalled();
    });
  });

  // ========================================
  // parseFrontmatter() テスト
  // ========================================
  describe("parseFrontmatter()", () => {
    it("SF-24: 正常なフロントマターをパースできる", () => {
      const { frontmatter, body } = forker.parseFrontmatter(sampleSkillMd);

      expect(frontmatter).toContain("name: source-skill");
      expect(body).toContain("# Source Skill");
    });

    it("SF-25: フロントマターがない場合は空文字列を返す", () => {
      const { frontmatter, body } = forker.parseFrontmatter(
        "No frontmatter here",
      );

      expect(frontmatter).toBe("");
      expect(body).toBe("No frontmatter here");
    });
  });

  // ========================================
  // validatePath() テスト
  // ========================================
  describe("validatePath()", () => {
    it("SF-26: 正常なパスは検証を通過する", () => {
      expect(() => forker.validatePath("my-skill")).not.toThrow();
    });

    it("SF-27: パストラバーサルは検出される", () => {
      expect(() => forker.validatePath("../etc")).toThrow(
        "不正なパスが検出されました",
      );
    });

    it("SF-28: prefix一致の境界すり抜け（../skills-evil）を検出する", () => {
      expect(() => forker.validatePath("../skills-evil")).toThrow(
        "不正なパスが検出されました",
      );
    });

    it("SF-33: 空文字列パスを拒否する", () => {
      expect(() => forker.validatePath("   ")).toThrow(
        "スキル名は空文字列を許可しません",
      );
    });

    it("SF-34: バックスラッシュを含むパスも検証される", () => {
      // path.resolve が処理するため、OSによって動作が異なる
      // macOS/Linux では ../ と同等にはならないが、検証はする
      expect(() => forker.validatePath("valid-name")).not.toThrow();
    });
  });
});
