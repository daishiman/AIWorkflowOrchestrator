import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SearchService } from "../SearchService";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

describe("SearchService", () => {
  let service: SearchService;
  let testDir: string;

  beforeEach(async () => {
    service = new SearchService();
    testDir = path.join(tmpdir(), `searchService-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create test files
    await fs.mkdir(path.join(testDir, "src"), { recursive: true });

    await fs.writeFile(
      path.join(testDir, "src/index.ts"),
      'const hello = "world";\nconsole.log(hello);\n',
    );

    await fs.writeFile(
      path.join(testDir, "src/utils.ts"),
      'export function hello() {\n  return "Hello World";\n}\n',
    );

    await fs.writeFile(
      path.join(testDir, "README.md"),
      "# Hello Project\n\nThis is a hello world project.\n",
    );
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("統合テスト: ファイル内検索", () => {
    it("should search across multiple files", async () => {
      const results = await service.search({
        query: "hello",
        include: [path.join(testDir, "**/*.{ts,md}")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.file.endsWith("index.ts"))).toBe(true);
      expect(results.some((r) => r.file.endsWith("utils.ts"))).toBe(true);
      expect(results.some((r) => r.file.endsWith("README.md"))).toBe(true);
    });

    it("should return correct line and column numbers", async () => {
      const results = await service.search({
        query: "hello",
        include: [path.join(testDir, "src/index.ts")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(results).toHaveLength(2); // "hello" appears twice

      const firstMatch = results[0];
      expect(firstMatch.line).toBe(0); // Line 1 (0-indexed)
      expect(firstMatch.column).toBeGreaterThanOrEqual(0);
      expect(firstMatch.match).toBe("hello");
    });

    it("should include context lines", async () => {
      const results = await service.search({
        query: "console",
        include: [path.join(testDir, "src/index.ts")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        contextLines: 1,
      });

      expect(results[0].contextBefore).toBeDefined();
      expect(results[0].contextAfter).toBeDefined();
    });
  });

  describe("統合テスト: 正規表現検索", () => {
    it("should search using regex pattern", async () => {
      const results = await service.search({
        query: "function\\s+\\w+",
        include: [path.join(testDir, "src/utils.ts")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: true,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].match).toMatch(/function\s+\w+/);
    });

    it("should handle complex regex with groups", async () => {
      const results = await service.search({
        query: '"(.*?)"',
        include: [path.join(testDir, "src/**/*.ts")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: true,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((r) => r.match.startsWith('"') && r.match.endsWith('"')),
      ).toBe(true);
    });
  });

  describe("統合テスト: フィルタリング", () => {
    it("should exclude specific patterns", async () => {
      const results = await service.search({
        query: "hello",
        include: [path.join(testDir, "**/*")],
        exclude: ["**/*.md"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(results.every((r) => !r.file.endsWith(".md"))).toBe(true);
    });

    it("should respect max file size limit", async () => {
      // Create large file
      const largeFile = path.join(testDir, "large.txt");
      await fs.writeFile(largeFile, "x".repeat(11 * 1024 * 1024)); // 11MB

      const results = await service.search({
        query: "x",
        include: [path.join(testDir, "**/*")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
      });

      expect(results.every((r) => !r.file.endsWith("large.txt"))).toBe(true);
    });

    it("should skip binary files", async () => {
      const binaryFile = path.join(testDir, "image.png");
      await fs.writeFile(binaryFile, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

      const results = await service.search({
        query: "hello",
        include: [path.join(testDir, "**/*")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(results.every((r) => !r.file.endsWith(".png"))).toBe(true);
    });
  });

  describe("統合テスト: パフォーマンス", () => {
    it("should complete search within reasonable time", async () => {
      const startTime = Date.now();

      await service.search({
        query: "hello",
        include: [path.join(testDir, "**/*")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete in <1s for small dataset
    });

    it("should handle concurrent searches", async () => {
      const searches = Array.from({ length: 5 }, () =>
        service.search({
          query: "hello",
          include: [path.join(testDir, "**/*")],
          caseSensitive: false,
          wholeWord: false,
          useRegex: false,
        }),
      );

      const results = await Promise.all(searches);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe("統合テスト: エラーハンドリング", () => {
    it("should handle search in non-existent directory", async () => {
      const results = await service.search({
        query: "hello",
        include: ["/non/existent/path/**/*"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(results).toEqual([]);
    });

    it("should handle invalid regex pattern", async () => {
      await expect(async () => {
        await service.search({
          query: "[invalid",
          include: [path.join(testDir, "**/*")],
          caseSensitive: false,
          wholeWord: false,
          useRegex: true,
        });
      }).rejects.toThrow();
    });

    it("should skip files with read errors", async () => {
      const restrictedFile = path.join(testDir, "restricted.txt");
      await fs.writeFile(restrictedFile, "hello");
      await fs.chmod(restrictedFile, 0o000); // Remove all permissions

      const results = await service.search({
        query: "hello",
        include: [path.join(testDir, "**/*")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      // Should continue with other files
      expect(results.some((r) => r.file.endsWith("index.ts"))).toBe(true);

      // Cleanup
      await fs.chmod(restrictedFile, 0o644);
    });
  });

  describe("統合テスト: 大文字小文字区別", () => {
    it("should respect case sensitivity setting", async () => {
      const caseSensitiveResults = await service.search({
        query: "Hello",
        include: [path.join(testDir, "**/*")],
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      });

      const caseInsensitiveResults = await service.search({
        query: "Hello",
        include: [path.join(testDir, "**/*")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(caseInsensitiveResults.length).toBeGreaterThanOrEqual(
        caseSensitiveResults.length,
      );
    });
  });

  describe("統合テスト: 単語単位検索", () => {
    it("should match whole words only", async () => {
      const wholeWordResults = await service.search({
        query: "hello",
        include: [path.join(testDir, "**/*")],
        caseSensitive: false,
        wholeWord: true,
        useRegex: false,
      });

      wholeWordResults.forEach((result) => {
        // Verify word boundaries
        const beforeChar =
          result.column > 0 ? result.lineText[result.column - 1] : " ";
        const afterChar = result.lineText[result.column + result.match.length];

        expect(/\W|^/.test(beforeChar)).toBe(true);
        expect(/\W|$/.test(afterChar ?? " ")).toBe(true);
      });
    });
  });

  describe("統合テスト: 結果の正確性", () => {
    it("should return exact match positions", async () => {
      await fs.writeFile(
        path.join(testDir, "precise.ts"),
        "const x = 123;\nconst y = 456;\nconst z = 123;\n",
      );

      const results = await service.search({
        query: "123",
        include: [path.join(testDir, "precise.ts")],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(results).toHaveLength(2);

      // First occurrence
      expect(results[0].line).toBe(0);
      expect(results[0].lineText).toContain("const x = 123");

      // Second occurrence
      expect(results[1].line).toBe(2);
      expect(results[1].lineText).toContain("const z = 123");
    });
  });
});
