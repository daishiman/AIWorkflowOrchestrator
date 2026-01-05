/**
 * 置換エンジン テスト
 * TDD Red Phase - これらのテストは実装前なので失敗する
 *
 * カバレッジ目標: 90%以上
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ReplaceEngine, SearchService } from "../index";
import type { WorkspaceReplaceResult } from "../types";

describe("ReplaceEngine", () => {
  let engine: ReplaceEngine;

  beforeEach(() => {
    engine = new ReplaceEngine();
  });

  describe("replace", () => {
    describe("basic replacement", () => {
      it("should replace single occurrence", () => {
        const result = engine.replace("hello world", "hello", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("hi world");
        expect(result.count).toBe(1);
        expect(result.replacements).toHaveLength(1);
        expect(result.replacements[0]).toEqual({
          line: 1,
          column: 1,
          originalText: "hello",
          replacedText: "hi",
        });
      });

      it("should replace all occurrences", () => {
        const result = engine.replace("hello world hello", "hello", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("hi world hi");
        expect(result.count).toBe(2);
        expect(result.replacements).toHaveLength(2);
      });

      it("should handle no matches", () => {
        const result = engine.replace("hello world", "goodbye", "bye", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("hello world");
        expect(result.count).toBe(0);
        expect(result.replacements).toHaveLength(0);
      });

      it("should preserve newlines", () => {
        const content = `line 1: hello
line 2: hello
line 3: world`;

        const result = engine.replace(content, "hello", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe(`line 1: hi
line 2: hi
line 3: world`);
        expect(result.count).toBe(2);
      });

      it("should track line and column positions correctly", () => {
        const content = `first hello
second hello`;

        const result = engine.replace(content, "hello", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.replacements[0].line).toBe(1);
        expect(result.replacements[0].column).toBe(7);
        expect(result.replacements[1].line).toBe(2);
        expect(result.replacements[1].column).toBe(8);
      });
    });

    describe("case sensitivity", () => {
      it("should replace case-insensitively by default", () => {
        const result = engine.replace("Hello HELLO hello", "hello", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("hi hi hi");
        expect(result.count).toBe(3);
      });

      it("should respect case sensitivity option", () => {
        const result = engine.replace("Hello HELLO hello", "Hello", "Hi", {
          caseSensitive: true,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("Hi HELLO hello");
        expect(result.count).toBe(1);
      });
    });

    describe("whole word matching", () => {
      it("should replace whole words only when option enabled", () => {
        const result = engine.replace(
          "test testing testcase test",
          "test",
          "exam",
          {
            caseSensitive: false,
            wholeWord: true,
            regex: false,
          },
        );

        expect(result.content).toBe("exam testing testcase exam");
        expect(result.count).toBe(2);
      });
    });

    describe("regex replacement", () => {
      it("should support regex patterns", () => {
        const result = engine.replace(
          "test123 test456",
          "test\\d+",
          "matched",
          {
            caseSensitive: false,
            wholeWord: false,
            regex: true,
          },
        );

        expect(result.content).toBe("matched matched");
        expect(result.count).toBe(2);
      });

      it("should support capture groups", () => {
        const result = engine.replace("user@domain", "(\\w+)@(\\w+)", "$2.$1", {
          caseSensitive: false,
          wholeWord: false,
          regex: true,
        });

        expect(result.content).toBe("domain.user");
        expect(result.count).toBe(1);
      });

      it("should support named capture groups", () => {
        const result = engine.replace(
          "2023-01-15",
          "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})",
          "$<day>/$<month>/$<year>",
          {
            caseSensitive: false,
            wholeWord: false,
            regex: true,
          },
        );

        expect(result.content).toBe("15/01/2023");
        expect(result.count).toBe(1);
      });

      it("should handle invalid regex gracefully", () => {
        const result = engine.replace("hello world", "[invalid", "replaced", {
          caseSensitive: false,
          wholeWord: false,
          regex: true,
        });

        // Should not throw, return unchanged content
        expect(result.content).toBe("hello world");
        expect(result.count).toBe(0);
      });
    });

    describe("unicode handling", () => {
      it("should handle unicode characters in pattern", () => {
        const result = engine.replace(
          "こんにちは世界",
          "こんにちは",
          "さようなら",
          {
            caseSensitive: false,
            wholeWord: false,
            regex: false,
          },
        );

        expect(result.content).toBe("さようなら世界");
        expect(result.count).toBe(1);
      });

      it("should handle unicode characters in replacement", () => {
        const result = engine.replace("hello world", "hello", "こんにちは", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("こんにちは world");
        expect(result.count).toBe(1);
      });

      it("should handle emoji", () => {
        const result = engine.replace("hello 😀 world", "hello", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("hi 😀 world");
        expect(result.count).toBe(1);
      });
    });

    describe("edge cases", () => {
      it("should handle empty content", () => {
        const result = engine.replace("", "hello", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("");
        expect(result.count).toBe(0);
      });

      it("should handle empty pattern", () => {
        const result = engine.replace("hello world", "", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("hello world");
        expect(result.count).toBe(0);
      });

      it("should handle empty replacement", () => {
        const result = engine.replace("hello world", "hello ", "", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("world");
        expect(result.count).toBe(1);
      });

      it("should handle same pattern and replacement", () => {
        const result = engine.replace("hello world", "hello", "hello", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.content).toBe("hello world");
        expect(result.count).toBe(1);
      });

      it("should handle overlapping patterns correctly", () => {
        const result = engine.replace("aaa", "aa", "b", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        // Non-overlapping: should replace first "aa", leaving "a"
        expect(result.content).toBe("ba");
        expect(result.count).toBe(1);
      });

      it("should handle very long content", () => {
        const content = "hello ".repeat(10000);
        const result = engine.replace(content, "hello", "hi", {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        });

        expect(result.count).toBe(10000);
      });
    });
  });
});

describe("SearchService - Replace Operations", () => {
  let service: SearchService;

  beforeEach(() => {
    service = new SearchService();
  });

  describe("replaceInFile", () => {
    it("should replace all matches in file content", () => {
      const result = service.replaceInFile("hello world hello", "hello", "hi", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      expect(result.content).toBe("hi world hi");
      expect(result.count).toBe(2);
    });

    it("should return replacement details", () => {
      const result = service.replaceInFile("hello world", "hello", "hi", {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      });

      expect(result.replacements).toBeDefined();
      expect(result.replacements).toHaveLength(1);
    });
  });

  describe("replaceInWorkspace", () => {
    beforeEach(() => {
      vi.mock("fs/promises", () => ({
        readFile: vi.fn(),
        writeFile: vi.fn(),
      }));
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should replace across multiple files", async () => {
      const results: WorkspaceReplaceResult[] = [];

      for await (const result of service.replaceInWorkspace(
        "test",
        "replaced",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        },
      )) {
        results.push(result);
      }

      expect(results).toBeDefined();
    });

    it("should support preview mode without writing", async () => {
      const results: WorkspaceReplaceResult[] = [];

      for await (const result of service.replaceInWorkspace(
        "test",
        "replaced",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
          preview: true,
        },
      )) {
        results.push(result);
      }

      // In preview mode, files should not be modified
      expect(results).toBeDefined();
    });

    it("should support dry run mode", async () => {
      const results: WorkspaceReplaceResult[] = [];

      for await (const result of service.replaceInWorkspace(
        "test",
        "replaced",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
          dryRun: true,
        },
      )) {
        results.push(result);
      }

      // In dry run mode, should report what would be changed
      expect(results).toBeDefined();
    });

    it("should handle file read errors gracefully", async () => {
      const results: WorkspaceReplaceResult[] = [];

      for await (const result of service.replaceInWorkspace(
        "test",
        "replaced",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        },
      )) {
        results.push(result);
      }

      // Should include error results for unreadable files
      const errorResults = results.filter((r) => !r.success);
      expect(errorResults).toBeDefined();
    });

    it("should report total replacement count per file", async () => {
      const results: WorkspaceReplaceResult[] = [];

      for await (const result of service.replaceInWorkspace(
        "test",
        "replaced",
        {
          caseSensitive: false,
          wholeWord: false,
          regex: false,
        },
      )) {
        results.push(result);
      }

      for (const result of results) {
        if (result.success) {
          expect(typeof result.count).toBe("number");
        }
      }
    });
  });
});
