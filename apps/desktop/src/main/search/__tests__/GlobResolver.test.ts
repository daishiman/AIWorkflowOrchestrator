import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GlobResolver } from "../GlobResolver";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

describe("GlobResolver", () => {
  let resolver: GlobResolver;
  let testDir: string;

  beforeEach(async () => {
    resolver = new GlobResolver();
    testDir = path.join(tmpdir(), `globResolver-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create test directory structure
    await fs.mkdir(path.join(testDir, "src"), { recursive: true });
    await fs.mkdir(path.join(testDir, "src/components"), { recursive: true });
    await fs.mkdir(path.join(testDir, "tests"), { recursive: true });
    await fs.mkdir(path.join(testDir, "node_modules"), { recursive: true });

    // Create test files
    await fs.writeFile(path.join(testDir, "src/index.ts"), "export {}");
    await fs.writeFile(path.join(testDir, "src/utils.ts"), "export {}");
    await fs.writeFile(
      path.join(testDir, "src/components/Button.tsx"),
      "export {}",
    );
    await fs.writeFile(path.join(testDir, "tests/index.test.ts"), "test");
    await fs.writeFile(path.join(testDir, "README.md"), "# README");
    await fs.writeFile(path.join(testDir, "package.json"), "{}");
    await fs.writeFile(path.join(testDir, "node_modules/lib.js"), "");
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("正常系: 基本パターン", () => {
    it("should resolve wildcard pattern *.ts", async () => {
      const files = await resolver.resolve(path.join(testDir, "src/*.ts"));

      expect(files).toHaveLength(2);
      expect(files.some((f) => f.endsWith("index.ts"))).toBe(true);
      expect(files.some((f) => f.endsWith("utils.ts"))).toBe(true);
    });

    it("should resolve double wildcard **/*.ts", async () => {
      const files = await resolver.resolve(path.join(testDir, "**/*.ts"));

      expect(files.length).toBeGreaterThanOrEqual(2);
      expect(files.some((f) => f.endsWith("index.ts"))).toBe(true);
      expect(files.some((f) => f.endsWith("utils.ts"))).toBe(true);
    });

    it("should resolve specific directory pattern", async () => {
      const files = await resolver.resolve(
        path.join(testDir, "src/components/*.tsx"),
      );

      expect(files).toHaveLength(1);
      expect(files[0]).toContain("Button.tsx");
    });
  });

  describe("正常系: 複数パターン", () => {
    it("should resolve multiple patterns", async () => {
      const files = await resolver.resolveMultiple([
        path.join(testDir, "**/*.ts"),
        path.join(testDir, "**/*.tsx"),
      ]);

      expect(files.length).toBeGreaterThanOrEqual(3);
      expect(files.some((f) => f.endsWith(".ts"))).toBe(true);
      expect(files.some((f) => f.endsWith(".tsx"))).toBe(true);
    });

    it("should deduplicate files from overlapping patterns", async () => {
      const files = await resolver.resolveMultiple([
        path.join(testDir, "src/**/*.ts"),
        path.join(testDir, "**/*.ts"),
      ]);

      const uniqueFiles = new Set(files);
      expect(files.length).toBe(uniqueFiles.size);
    });
  });

  describe("正常系: 除外パターン", () => {
    it("should exclude node_modules by default", async () => {
      const files = await resolver.resolve(path.join(testDir, "**/*.js"));

      expect(files.every((f) => !f.includes("node_modules"))).toBe(true);
    });

    it("should exclude test files when specified", async () => {
      const files = await resolver.resolve(path.join(testDir, "**/*.ts"), {
        exclude: ["**/*.test.ts"],
      });

      expect(files.every((f) => !f.includes(".test.ts"))).toBe(true);
    });

    it("should exclude multiple patterns", async () => {
      const files = await resolver.resolve(path.join(testDir, "**/*"), {
        exclude: ["**/node_modules/**", "**/*.test.ts", "**/*.md"],
      });

      expect(files.every((f) => !f.includes("node_modules"))).toBe(true);
      expect(files.every((f) => !f.endsWith(".test.ts"))).toBe(true);
      expect(files.every((f) => !f.endsWith(".md"))).toBe(true);
    });
  });

  describe("正常系: .gitignore連携", () => {
    it("should respect .gitignore patterns", async () => {
      const gitignoreContent = "node_modules/\n*.log\n.env";
      await fs.writeFile(path.join(testDir, ".gitignore"), gitignoreContent);
      await fs.writeFile(path.join(testDir, "debug.log"), "log");
      await fs.writeFile(path.join(testDir, ".env"), "SECRET=key");

      const files = await resolver.resolve(path.join(testDir, "**/*"), {
        useGitignore: true,
      });

      expect(files.every((f) => !f.endsWith(".log"))).toBe(true);
      expect(files.every((f) => !f.endsWith(".env"))).toBe(true);
    });
  });

  describe("境界値: 空結果", () => {
    it("should return empty array when no files match", async () => {
      const files = await resolver.resolve(path.join(testDir, "**/*.xyz"));

      expect(files).toEqual([]);
    });

    it("should handle pattern with no wildcards", async () => {
      const files = await resolver.resolve(path.join(testDir, "README.md"));

      expect(files).toHaveLength(1);
      expect(files[0]).toContain("README.md");
    });
  });

  describe("境界値: 深いネスト", () => {
    it("should handle deeply nested directories", async () => {
      const deepPath = path.join(testDir, "a/b/c/d/e/f");
      await fs.mkdir(deepPath, { recursive: true });
      await fs.writeFile(path.join(deepPath, "deep.ts"), "export {}");

      const files = await resolver.resolve(path.join(testDir, "**/*.ts"));

      expect(files.some((f) => f.includes("deep.ts"))).toBe(true);
    });
  });

  describe("異常系: 無効なパターン", () => {
    it("should handle invalid glob pattern gracefully", async () => {
      const files = await resolver.resolve("[invalid");

      expect(files).toEqual([]);
    });
  });

  describe("異常系: 存在しないディレクトリ", () => {
    it("should return empty array for non-existent directory", async () => {
      const files = await resolver.resolve("/non/existent/path/**/*.ts");

      expect(files).toEqual([]);
    });
  });

  describe("境界値: シンボリックリンク", () => {
    it("should follow symbolic links by default", async () => {
      const targetFile = path.join(testDir, "target.ts");
      const linkFile = path.join(testDir, "link.ts");

      await fs.writeFile(targetFile, "export {}");
      await fs.symlink(targetFile, linkFile);

      const files = await resolver.resolve(path.join(testDir, "*.ts"));

      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe("パフォーマンス: 大量ファイル", () => {
    it("should handle directory with many files efficiently", async () => {
      const manyFilesDir = path.join(testDir, "many");
      await fs.mkdir(manyFilesDir);

      // Create 100 files
      const promises = Array.from({ length: 100 }, (_, i) =>
        fs.writeFile(path.join(manyFilesDir, `file${i}.ts`), "export {}"),
      );
      await Promise.all(promises);

      const startTime = Date.now();
      const files = await resolver.resolve(path.join(manyFilesDir, "*.ts"));
      const duration = Date.now() - startTime;

      expect(files).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should complete in <1s
    });
  });
});
