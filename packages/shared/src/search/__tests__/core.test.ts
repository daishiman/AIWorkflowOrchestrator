/**
 * 検索エンジン コアテスト
 * PatternMatcher, FileSearchEngine, ReplaceEngine のテスト
 */

import { describe, it, expect } from "vitest";
import { PatternMatcher } from "../PatternMatcher";
import { FileSearchEngine } from "../FileSearchEngine";
import { ReplaceEngine } from "../ReplaceEngine";

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
});

describe("FileSearchEngine", () => {
  const engine = new FileSearchEngine();

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

describe("ReplaceEngine", () => {
  const engine = new ReplaceEngine();

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
    });
  });
});
