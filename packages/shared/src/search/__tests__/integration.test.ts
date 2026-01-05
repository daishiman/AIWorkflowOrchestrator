/**
 * 検索エンジン 統合テスト
 *
 * 実際のファイルシステムを使用した統合テスト
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { SearchService, WorkspaceSearchEngine } from "../index";
import type { FileSearchResult } from "../types";

describe("WorkspaceSearchEngine Integration", () => {
  let testDir: string;
  let engine: WorkspaceSearchEngine;

  beforeAll(async () => {
    // テスト用の一時ディレクトリを作成
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "search-test-"));
    engine = new WorkspaceSearchEngine();

    // テストファイルを作成
    await fs.writeFile(
      path.join(testDir, "file1.ts"),
      `// File 1
const hello = "world";
function test() {
  return hello;
}`,
    );

    await fs.writeFile(
      path.join(testDir, "file2.ts"),
      `// File 2
const hello = "typescript";
const test = 123;`,
    );

    // サブディレクトリを作成
    await fs.mkdir(path.join(testDir, "subdir"));
    await fs.writeFile(
      path.join(testDir, "subdir", "file3.ts"),
      `// File 3 in subdir
function hello() {
  console.log("hello");
}`,
    );

    // 除外されるべきディレクトリを作成
    await fs.mkdir(path.join(testDir, "node_modules"));
    await fs.writeFile(
      path.join(testDir, "node_modules", "excluded.ts"),
      `// Should be excluded
const hello = "excluded";`,
    );
  });

  afterAll(async () => {
    // テストディレクトリをクリーンアップ
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("search", () => {
    it("should search across multiple files", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search(testDir, "hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      })) {
        results.push(result);
      }

      // node_modules以外のファイルからマッチを見つける
      expect(results.length).toBeGreaterThanOrEqual(2);

      // すべてのファイルにマッチがある
      for (const result of results) {
        expect(result.matches.length).toBeGreaterThan(0);
      }
    });

    it("should respect include patterns", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search(testDir, "hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        include: ["**/*.ts"],
      })) {
        results.push(result);
      }

      // すべての結果が.tsファイル
      for (const result of results) {
        expect(result.filePath).toMatch(/\.ts$/);
      }
    });

    it("should exclude node_modules by default", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search(testDir, "excluded", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      })) {
        results.push(result);
      }

      // node_modules内のファイルは含まれない
      for (const result of results) {
        expect(result.filePath).not.toContain("node_modules");
      }
    });

    it("should respect maxResults limit", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search(testDir, "hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        maxResults: 1,
      })) {
        results.push(result);
      }

      // 最大1ファイル分のマッチのみ（マッチ数がmaxResults以下）
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it("should be cancellable", async () => {
      const results: FileSearchResult[] = [];

      const generator = engine.search(testDir, "hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      // 最初の結果後にキャンセル
      for await (const result of generator) {
        results.push(result);
        engine.cancel();
        break;
      }

      // キャンセルされた
      expect(results.length).toBe(1);
    });

    it("should include context lines", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search(testDir, "function", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        contextLines: 1,
      })) {
        results.push(result);
      }

      // コンテキスト行が含まれている
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        for (const match of result.matches) {
          expect(match.context).toBeDefined();
        }
      }
    });

    it("should handle case-sensitive search", async () => {
      const resultsInsensitive: FileSearchResult[] = [];
      const resultsSensitive: FileSearchResult[] = [];

      for await (const result of engine.search(testDir, "Hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      })) {
        resultsInsensitive.push(result);
      }

      for await (const result of engine.search(testDir, "Hello", {
        caseSensitive: true,
        wholeWord: false,
        regex: false,
      })) {
        resultsSensitive.push(result);
      }

      // 大文字小文字を区別しない検索の方がマッチ数が多い
      const insensitiveMatchCount = resultsInsensitive.reduce(
        (sum, r) => sum + r.matches.length,
        0,
      );
      const sensitiveMatchCount = resultsSensitive.reduce(
        (sum, r) => sum + r.matches.length,
        0,
      );

      expect(insensitiveMatchCount).toBeGreaterThanOrEqual(sensitiveMatchCount);
    });

    it("should handle regex search", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search(testDir, "hello\\s*=", {
        caseSensitive: false,
        wholeWord: false,
        regex: true,
      })) {
        results.push(result);
      }

      // 正規表現でマッチ
      expect(results.length).toBeGreaterThan(0);
    });

    it("should handle whole word search", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search(testDir, "test", {
        caseSensitive: false,
        wholeWord: true,
        regex: false,
      })) {
        results.push(result);
      }

      // "test" という単語のみにマッチ（testingなどは除外）
      for (const result of results) {
        for (const match of result.matches) {
          // マッチしたテキストが正確に "test" であることを確認
          expect(match.text.toLowerCase()).toBe("test");
        }
      }
    });
  });
});

describe("SearchService Integration", () => {
  let testDir: string;
  let service: SearchService;

  beforeAll(async () => {
    // テスト用の一時ディレクトリを作成
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "search-service-test-"));
    service = new SearchService();

    // テストファイルを作成
    await fs.writeFile(
      path.join(testDir, "test1.ts"),
      `const oldName = "value";
function oldName() {
  return oldName;
}`,
    );

    await fs.writeFile(
      path.join(testDir, "test2.ts"),
      `import { oldName } from "./test1";
console.log(oldName);`,
    );
  });

  afterAll(async () => {
    // テストディレクトリをクリーンアップ
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("searchInFile", () => {
    it("should find matches in file content", () => {
      const content = "hello world hello";
      const matches = service.searchInFile(content, "hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      expect(matches).toHaveLength(2);
    });

    it("should apply search options correctly", () => {
      const content = "Hello HELLO hello";
      const matches = service.searchInFile(content, "Hello", {
        caseSensitive: true,
        wholeWord: false,
        regex: false,
      });

      expect(matches).toHaveLength(1);
    });
  });

  describe("replaceInFile", () => {
    it("should replace all occurrences", () => {
      const content = "oldName is oldName";
      const result = service.replaceInFile(content, "oldName", "newName", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      expect(result.content).toBe("newName is newName");
      expect(result.count).toBe(2);
    });

    it("should support regex replacement", () => {
      const content = "user123 user456";
      const result = service.replaceInFile(content, "user(\\d+)", "account$1", {
        caseSensitive: false,
        wholeWord: false,
        regex: true,
      });

      expect(result.content).toBe("account123 account456");
      expect(result.count).toBe(2);
    });
  });

  describe("searchInWorkspace", () => {
    it("should stream results from multiple files", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of service.searchInWorkspace("oldName", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        workspacePath: testDir,
      })) {
        results.push(result);
      }

      // 複数のファイルからマッチを見つける
      expect(results.length).toBe(2);
    });
  });

  describe("replaceInWorkspace", () => {
    it("should preview replacements without modifying files (dryRun)", async () => {
      const results = [];

      for await (const result of service.replaceInWorkspace(
        "oldName",
        "newName",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
          workspacePath: testDir,
          dryRun: true,
        },
      )) {
        results.push(result);
      }

      // 置換プレビュー結果が得られる
      expect(results.length).toBeGreaterThan(0);

      // ファイルは変更されていない
      const content1 = await fs.readFile(
        path.join(testDir, "test1.ts"),
        "utf-8",
      );
      expect(content1).toContain("oldName");
    });

    it("should show replacement count", async () => {
      const results = [];

      for await (const result of service.replaceInWorkspace(
        "oldName",
        "newName",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
          workspacePath: testDir,
          preview: true,
        },
      )) {
        results.push(result);
      }

      // 各ファイルの置換数が含まれる
      for (const result of results) {
        expect(result.count).toBeDefined();
        expect(typeof result.count).toBe("number");
      }
    });
  });

  describe("cancelSearch", () => {
    it("should cancel ongoing search", async () => {
      const results: FileSearchResult[] = [];

      const generator = service.searchInWorkspace("oldName", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        workspacePath: testDir,
      });

      // 最初の結果後にキャンセル
      for await (const result of generator) {
        results.push(result);
        service.cancelSearch();
        break;
      }

      // キャンセルされた
      expect(results.length).toBe(1);
    });
  });
});
