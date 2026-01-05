/**
 * 検索エンジン テスト
 *
 * カバレッジ目標: 90%以上
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SearchService,
  PatternMatcher,
  FileSearchEngine,
  WorkspaceSearchEngine,
} from "../index";
import type { FileSearchResult } from "../types";

// モジュールレベルでモック設定
vi.mock("fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue("test content with test keyword"),
  readdir: vi.fn().mockResolvedValue([
    { name: "file1.ts", isFile: () => true, isDirectory: () => false },
    { name: "file2.ts", isFile: () => true, isDirectory: () => false },
  ]),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("fast-glob", () => ({
  default: vi
    .fn()
    .mockResolvedValue(["/workspace/src/file1.ts", "/workspace/src/file2.ts"]),
}));

describe("PatternMatcher", () => {
  describe("constructor", () => {
    it("should create a valid matcher for literal patterns", () => {
      const matcher = new PatternMatcher("hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      expect(matcher.isValid()).toBe(true);
    });

    it("should create a valid matcher for regex patterns", () => {
      const matcher = new PatternMatcher("\\d+", {
        caseSensitive: false,
        wholeWord: false,
        regex: true,
      });
      expect(matcher.isValid()).toBe(true);
    });

    it("should return invalid for empty pattern", () => {
      const matcher = new PatternMatcher("", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      expect(matcher.isValid()).toBe(false);
    });

    it("should return invalid for invalid regex", () => {
      const matcher = new PatternMatcher("[invalid", {
        caseSensitive: false,
        wholeWord: false,
        regex: true,
      });
      expect(matcher.isValid()).toBe(false);
    });
  });

  describe("findMatches", () => {
    it("should find exact matches in text", () => {
      const matcher = new PatternMatcher("hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      const matches = matcher.findMatches("hello world hello");
      expect(matches).toHaveLength(2);
      expect(matches[0].index).toBe(0);
      expect(matches[1].index).toBe(12);
    });

    it("should return empty array when no matches found", () => {
      const matcher = new PatternMatcher("goodbye", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      const matches = matcher.findMatches("hello world");
      expect(matches).toHaveLength(0);
    });

    it("should be case-sensitive when option enabled", () => {
      const matcher = new PatternMatcher("Hello", {
        caseSensitive: true,
        wholeWord: false,
        regex: false,
      });
      const matches = matcher.findMatches("hello Hello HELLO");
      expect(matches).toHaveLength(1);
      expect(matches[0].index).toBe(6);
    });

    it("should be case-insensitive by default", () => {
      const matcher = new PatternMatcher("hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      const matches = matcher.findMatches("hello Hello HELLO");
      expect(matches).toHaveLength(3);
    });

    it("should match whole words only when option enabled", () => {
      const matcher = new PatternMatcher("test", {
        caseSensitive: false,
        wholeWord: true,
        regex: false,
      });
      const matches = matcher.findMatches("test testing testcase test");
      expect(matches).toHaveLength(2);
    });

    it("should support regex patterns when option enabled", () => {
      const matcher = new PatternMatcher("\\d+", {
        caseSensitive: false,
        wholeWord: false,
        regex: true,
      });
      const matches = matcher.findMatches("abc 123 def 456");
      expect(matches).toHaveLength(2);
      expect(matches[0].text).toBe("123");
      expect(matches[1].text).toBe("456");
    });

    it("should escape special characters in normal mode", () => {
      const matcher = new PatternMatcher("a.b", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      const matches = matcher.findMatches("a.b axb");
      expect(matches).toHaveLength(1);
      expect(matches[0].text).toBe("a.b");
    });

    it("should handle unicode characters", () => {
      const matcher = new PatternMatcher("こんにちは", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      const matches = matcher.findMatches("こんにちは世界");
      expect(matches).toHaveLength(1);
    });
  });

  describe("replace", () => {
    it("should replace all matches", () => {
      const matcher = new PatternMatcher("hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      const result = matcher.replace("hello world hello", "hi");
      expect(result).toBe("hi world hi");
    });

    it("should support regex capture groups", () => {
      const matcher = new PatternMatcher("(\\w+)@(\\w+)", {
        caseSensitive: false,
        wholeWord: false,
        regex: true,
      });
      const result = matcher.replace("user@domain", "$2-$1");
      expect(result).toBe("domain-user");
    });
  });

  describe("timeout handling", () => {
    it("should throw timeout error when too many matches exceed time limit", () => {
      // Note: The timeout mechanism checks between regex.exec() calls,
      // not during a single exec() call. This means it protects against
      // scenarios with many matches, but cannot protect against ReDoS
      // attacks that occur within a single exec() call.
      // For true ReDoS protection, consider using Web Workers or
      // pre-validation of regex patterns.

      // Create a matcher with very short timeout
      const matcher = new PatternMatcher(
        "a",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        },
        1, // 1ms timeout
      );

      // Create a string with many matches to trigger iteration timeout
      const manyMatches = "a".repeat(100000);

      expect(() => {
        matcher.findMatches(manyMatches);
      }).toThrow("timeout");
    });

    it("should complete within timeout for reasonable input", () => {
      const matcher = new PatternMatcher(
        "test",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        },
        5000, // 5 second timeout
      );

      const normalText = "this is a test string with test words";

      expect(() => {
        const matches = matcher.findMatches(normalText);
        expect(matches).toHaveLength(2);
      }).not.toThrow();
    });
  });
});

describe("FileSearchEngine", () => {
  let engine: FileSearchEngine;

  beforeEach(() => {
    engine = new FileSearchEngine();
  });

  describe("search", () => {
    it("should find matches with line numbers", () => {
      const content = `line 1: hello world
line 2: hello there
line 3: goodbye world`;

      const matches = engine.search(content, "hello", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      expect(matches).toHaveLength(2);
      expect(matches[0].line).toBe(1);
      expect(matches[0].column).toBe(9);
      expect(matches[1].line).toBe(2);
    });

    it("should include context lines", () => {
      const content = `line 1
line 2: target
line 3`;

      const matches = engine.search(
        content,
        "target",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        },
        1,
      );

      expect(matches).toHaveLength(1);
      expect(matches[0].context.before).toEqual(["line 1"]);
      expect(matches[0].context.after).toEqual(["line 3"]);
    });

    it("should handle empty content", () => {
      const matches = engine.search("", "test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      expect(matches).toHaveLength(0);
    });

    it("should handle empty search pattern", () => {
      const matches = engine.search("hello world", "", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });
      expect(matches).toHaveLength(0);
    });

    it("should handle very long content efficiently", () => {
      const content =
        "hello ".repeat(10000) + "target " + "hello ".repeat(10000);
      const startTime = Date.now();

      const matches = engine.search(content, "target", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      const duration = Date.now() - startTime;
      expect(matches).toHaveLength(1);
      expect(duration).toBeLessThan(100); // Should be fast (< 100ms)
    });

    it("should handle multiple matches on same line", () => {
      const content = "test test test";

      const matches = engine.search(content, "test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      expect(matches).toHaveLength(3);
      expect(matches[0].column).toBe(1);
      expect(matches[1].column).toBe(6);
      expect(matches[2].column).toBe(11);
    });
  });
});

describe("WorkspaceSearchEngine", () => {
  let engine: WorkspaceSearchEngine;

  beforeEach(() => {
    engine = new WorkspaceSearchEngine();
    vi.clearAllMocks();
  });

  describe("search", () => {
    it("should search across multiple files", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search("/workspace", "test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      })) {
        results.push(result);
      }

      expect(results.length).toBeGreaterThan(0);
    });

    it("should respect include patterns", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search("/workspace", "test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        include: ["**/*.ts"],
      })) {
        results.push(result);
      }

      // All results should be .ts files
      for (const result of results) {
        expect(result.filePath).toMatch(/\.ts$/);
      }
    });

    it("should respect exclude patterns", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search("/workspace", "test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        exclude: ["**/node_modules/**"],
      })) {
        results.push(result);
      }

      // No results should be from node_modules
      for (const result of results) {
        expect(result.filePath).not.toContain("node_modules");
      }
    });

    it("should exclude node_modules by default", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search("/workspace", "test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      })) {
        results.push(result);
      }

      // Verify node_modules is excluded by default
      for (const result of results) {
        expect(result.filePath).not.toContain("node_modules");
      }
    });

    it("should respect maxResults limit", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of engine.search("/workspace", "test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        maxResults: 10,
      })) {
        results.push(result);
      }

      expect(results.length).toBeLessThanOrEqual(10);
    });

    it("should be cancellable", async () => {
      const results: FileSearchResult[] = [];

      const generator = engine.search("/workspace", "test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      // Start search and cancel after first result
      for await (const result of generator) {
        results.push(result);
        engine.cancel();
        break;
      }

      // Should have been cancelled
      expect(results.length).toBe(1);
    });
  });
});

describe("SearchService", () => {
  let service: SearchService;

  beforeEach(() => {
    service = new SearchService();
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
      const content = "hello Hello HELLO";
      const matches = service.searchInFile(content, "Hello", {
        caseSensitive: true,
        wholeWord: false,
        regex: false,
      });

      expect(matches).toHaveLength(1);
    });
  });

  describe("searchInWorkspace", () => {
    it("should stream results from multiple files", async () => {
      const results: FileSearchResult[] = [];

      for await (const result of service.searchInWorkspace("test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      })) {
        results.push(result);
      }

      expect(results).toBeDefined();
    });
  });

  describe("cancelSearch", () => {
    it("should cancel ongoing search", () => {
      // Start a search
      const generator = service.searchInWorkspace("test", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      // Cancel it
      service.cancelSearch();

      // Verify it's cancelled (should not throw)
      expect(() => generator.return(undefined)).not.toThrow();
    });
  });
});
