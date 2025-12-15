import { describe, it, expect, beforeEach, vi } from "vitest";
import { PatternMatcher } from "../PatternMatcher";

describe("PatternMatcher", () => {
  let matcher: PatternMatcher;

  beforeEach(() => {
    matcher = new PatternMatcher();
  });

  describe("正常系: 通常の検索", () => {
    it("should match exact string in text", () => {
      const result = matcher.match("Hello World", "World", {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        start: 6,
        end: 11,
        match: "World",
      });
    });

    it("should match multiple occurrences", () => {
      const result = matcher.match("test test test", "test", {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toHaveLength(3);
      expect(result[0].start).toBe(0);
      expect(result[1].start).toBe(5);
      expect(result[2].start).toBe(10);
    });
  });

  describe("正常系: 大文字/小文字区別", () => {
    it("should match case-insensitive when caseSensitive is false", () => {
      const result = matcher.match("Hello HELLO hello", "hello", {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toHaveLength(3);
    });

    it("should not match different case when caseSensitive is true", () => {
      const result = matcher.match("Hello HELLO hello", "hello", {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].match).toBe("hello");
    });
  });

  describe("正常系: 単語単位検索", () => {
    it("should match whole words only when wholeWord is true", () => {
      const result = matcher.match("test testing tester", "test", {
        caseSensitive: false,
        wholeWord: true,
        useRegex: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].match).toBe("test");
      expect(result[0].start).toBe(0);
    });

    it("should match word at end of text", () => {
      const result = matcher.match("this is a test", "test", {
        caseSensitive: false,
        wholeWord: true,
        useRegex: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].start).toBe(10);
    });
  });

  describe("正常系: 正規表現検索", () => {
    it("should match using regex pattern", () => {
      const result = matcher.match("test123 test456", "test\\d+", {
        caseSensitive: false,
        wholeWord: false,
        useRegex: true,
      });

      expect(result).toHaveLength(2);
      expect(result[0].match).toBe("test123");
      expect(result[1].match).toBe("test456");
    });

    it("should support regex groups", () => {
      const result = matcher.match("2024-01-15", "(\\d{4})-(\\d{2})-(\\d{2})", {
        caseSensitive: false,
        wholeWord: false,
        useRegex: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].match).toBe("2024-01-15");
    });
  });

  describe("境界値: クエリサイズ", () => {
    it("should handle empty query by returning empty array", () => {
      const result = matcher.match("test", "", {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toEqual([]);
    });

    it("should handle single character query", () => {
      const result = matcher.match("a b c", "a", {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].match).toBe("a");
    });

    it("should handle very long query (1000 characters)", () => {
      const longQuery = "a".repeat(1000);
      const text = `${longQuery} test`;

      const result = matcher.match(text, longQuery, {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].match).toBe(longQuery);
    });
  });

  describe("境界値: 特殊文字", () => {
    it("should escape special regex characters in literal search", () => {
      const specialChars = ".*+?^${}()[]|\\";
      const text = `test ${specialChars} test`;

      const result = matcher.match(text, specialChars, {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].match).toBe(specialChars);
    });

    it("should handle backslash in search query", () => {
      const result = matcher.match("C:\\Users\\test", "C:\\Users", {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toHaveLength(1);
    });
  });

  describe("異常系: 無効な正規表現", () => {
    it("should throw error for invalid regex pattern", () => {
      expect(() => {
        matcher.match("test", "[invalid", {
          caseSensitive: false,
          wholeWord: false,
          useRegex: true,
        });
      }).toThrow(/invalid.*regex/i);
    });

    it("should throw error for unclosed group", () => {
      expect(() => {
        matcher.match("test", "(unclosed", {
          caseSensitive: false,
          wholeWord: false,
          useRegex: true,
        });
      }).toThrow();
    });
  });

  describe("セキュリティ: ReDoS対策", () => {
    it("should detect and reject catastrophic backtracking pattern (a+)+b", () => {
      expect(() => {
        matcher.match("aaaaaaaaaaaaaaaaaaaaaaaaaaaa!", "(a+)+b", {
          caseSensitive: false,
          wholeWord: false,
          useRegex: true,
        });
      }).toThrow(/redos|catastrophic|unsafe/i);
    });

    it("should detect nested quantifiers", () => {
      expect(() => {
        matcher.match("test", "(x+)*", {
          caseSensitive: false,
          wholeWord: false,
          useRegex: true,
        });
      }).toThrow(/redos|catastrophic|unsafe/i);
    });

    it("should timeout on slow regex (>100ms)", () => {
      vi.useFakeTimers();

      const slowPattern = "(a+)+b";
      const longText = "a".repeat(30) + "!";

      expect(() => {
        matcher.match(longText, slowPattern, {
          caseSensitive: false,
          wholeWord: false,
          useRegex: true,
        });
      }).toThrow();

      vi.useRealTimers();
    });
  });

  describe("境界値: 空テキスト", () => {
    it("should return empty array when searching empty text", () => {
      const result = matcher.match("", "test", {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });

      expect(result).toEqual([]);
    });
  });
});
