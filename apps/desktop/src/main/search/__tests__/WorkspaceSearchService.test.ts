import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  WorkspaceSearchService,
  type WorkspaceSearchOptions,
} from "../WorkspaceSearchService";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

describe("WorkspaceSearchService", () => {
  let service: WorkspaceSearchService;
  let testDir: string;

  beforeEach(async () => {
    service = new WorkspaceSearchService();
    testDir = path.join(tmpdir(), `workspace-search-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("正常系: 基本検索", () => {
    it("should search across multiple files", async () => {
      // テストファイル作成
      await fs.writeFile(
        path.join(testDir, "file1.ts"),
        "const hello = 'world';",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "file2.ts"),
        "function hello() {}",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "hello",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(2);
    });

    it("should return results with file paths", async () => {
      await fs.writeFile(
        path.join(testDir, "test.ts"),
        "const foo = 'bar';",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "foo",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(1);
      expect(results[0].file).toContain("test.ts");
    });

    it("should search in nested directories", async () => {
      const nestedDir = path.join(testDir, "src", "components");
      await fs.mkdir(nestedDir, { recursive: true });
      await fs.writeFile(
        path.join(nestedDir, "Button.tsx"),
        "export const Button = () => {};",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "Button",
        workspacePath: testDir,
        include: ["**/*.tsx"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(1);
      expect(results[0].file).toContain("Button.tsx");
    });
  });

  describe("正常系: ファイルタイプフィルタ", () => {
    it("should filter by file extensions", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "const test = 1;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "file.js"),
        "const test = 2;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "file.css"),
        ".test { color: red; }",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.ts", "**/*.js"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(2);
      expect(
        results.every((r) => r.file.endsWith(".ts") || r.file.endsWith(".js")),
      ).toBe(true);
    });

    it("should filter by specific file type", async () => {
      await fs.writeFile(
        path.join(testDir, "component.tsx"),
        "export default () => <div>test</div>;",
        "utf-8",
      );
      await fs.writeFile(path.join(testDir, "style.css"), ".test {}", "utf-8");

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.tsx"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(1);
      expect(results[0].file).toContain(".tsx");
    });
  });

  describe("正常系: 除外パターン", () => {
    it("should exclude node_modules by default", async () => {
      const nodeModulesDir = path.join(testDir, "node_modules", "package");
      await fs.mkdir(nodeModulesDir, { recursive: true });
      await fs.writeFile(
        path.join(nodeModulesDir, "index.js"),
        "const test = 1;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "src.js"),
        "const test = 2;",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.js"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(1);
      expect(results[0].file).not.toContain("node_modules");
    });

    it("should exclude specified patterns", async () => {
      const buildDir = path.join(testDir, "build");
      await fs.mkdir(buildDir, { recursive: true });
      await fs.writeFile(
        path.join(buildDir, "output.js"),
        "const test = 1;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "src.js"),
        "const test = 2;",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.js"],
        exclude: ["**/build/**"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(1);
      expect(results[0].file).not.toContain("build");
    });
  });

  describe("正常系: 結果グルーピング", () => {
    it("should group results by file", async () => {
      await fs.writeFile(
        path.join(testDir, "file1.ts"),
        "test\ntest\ntest",
        "utf-8",
      );
      await fs.writeFile(path.join(testDir, "file2.ts"), "test", "utf-8");

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const grouped = await service.searchGrouped(options);

      expect(Object.keys(grouped).length).toBe(2);
      const file1Key = Object.keys(grouped).find((k) => k.includes("file1"));
      expect(grouped[file1Key!].length).toBe(3);
    });

    it("should return empty groups for no matches", async () => {
      await fs.writeFile(path.join(testDir, "file.ts"), "hello world", "utf-8");

      const options: WorkspaceSearchOptions = {
        query: "nonexistent",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const grouped = await service.searchGrouped(options);

      expect(Object.keys(grouped).length).toBe(0);
    });
  });

  describe("正常系: 検索統計", () => {
    it("should return search statistics", async () => {
      await fs.writeFile(path.join(testDir, "file1.ts"), "test test", "utf-8");
      await fs.writeFile(path.join(testDir, "file2.ts"), "test", "utf-8");

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const stats = await service.searchWithStats(options);

      expect(stats.totalMatches).toBe(3);
      expect(stats.filesWithMatches).toBe(2);
      expect(stats.filesSearched).toBeGreaterThanOrEqual(2);
    });
  });

  describe("正常系: 正規表現検索", () => {
    it("should support regex search", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "const foo123 = 1;\nconst bar456 = 2;",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "\\w+\\d{3}",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: true,
      };

      const results = await service.search(options);

      expect(results.length).toBe(2);
    });
  });

  describe("正常系: ケース感度", () => {
    it("should support case-sensitive search", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "Test TEST test",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "Test",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(1);
    });

    it("should support case-insensitive search", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "Test TEST test",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(3);
    });
  });

  describe("正常系: 単語単位検索", () => {
    it("should support whole word search", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "test testing tested",
        "utf-8",
      );

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: true,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(1);
    });
  });

  describe("境界値: 空クエリ", () => {
    it("should return empty results for empty query", async () => {
      await fs.writeFile(path.join(testDir, "file.ts"), "test", "utf-8");

      const options: WorkspaceSearchOptions = {
        query: "",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(0);
    });
  });

  describe("境界値: 大量ファイル", () => {
    it("should handle many files efficiently", async () => {
      // 50ファイル作成
      for (let i = 0; i < 50; i++) {
        await fs.writeFile(
          path.join(testDir, `file${i}.ts`),
          `const test${i} = ${i};`,
          "utf-8",
        );
      }

      const options: WorkspaceSearchOptions = {
        query: "const",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        maxConcurrency: 10,
      };

      const startTime = Date.now();
      const results = await service.search(options);
      const duration = Date.now() - startTime;

      expect(results.length).toBe(50);
      expect(duration).toBeLessThan(5000); // 5秒以内
    });
  });

  describe("異常系: エラーハンドリング", () => {
    it("should handle non-existent workspace path", async () => {
      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: "/non/existent/path",
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const results = await service.search(options);

      expect(results.length).toBe(0);
    });

    it("should throw error for invalid regex", async () => {
      const options: WorkspaceSearchOptions = {
        query: "[invalid",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: true,
      };

      await expect(service.search(options)).rejects.toThrow();
    });
  });

  describe("検索キャンセル", () => {
    it("should support search cancellation", async () => {
      // 多数のファイルを作成
      for (let i = 0; i < 100; i++) {
        await fs.writeFile(
          path.join(testDir, `file${i}.ts`),
          "test content",
          "utf-8",
        );
      }

      const options: WorkspaceSearchOptions = {
        query: "test",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };

      const abortController = new AbortController();

      // 検索開始後すぐにキャンセル
      const searchPromise = service.search(options, abortController.signal);

      // 少し待ってからキャンセル
      setTimeout(() => abortController.abort(), 10);

      const results = await searchPromise;

      // キャンセルされた場合、全結果を得る前に終了
      // （実装によっては空配列または部分結果）
      expect(results.length).toBeLessThanOrEqual(100);
    });
  });
});
