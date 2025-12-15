import { describe, it, expect, beforeEach } from "vitest";
import { CaptureExpander } from "../CaptureExpander";

describe("CaptureExpander", () => {
  let expander: CaptureExpander;

  beforeEach(() => {
    expander = new CaptureExpander();
  });

  describe("正常系: 基本的なキャプチャ展開", () => {
    it("should expand $1 capture group", () => {
      const result = expander.expand("test123", /(test)(\d+)/, "prefix_$1");

      expect(result).toBe("prefix_test");
    });

    it("should expand $2 capture group", () => {
      const result = expander.expand("test123", /(test)(\d+)/, "suffix_$2");

      expect(result).toBe("suffix_123");
    });

    it("should expand multiple capture groups", () => {
      const result = expander.expand("John Doe", /(\w+)\s+(\w+)/, "$2, $1");

      expect(result).toBe("Doe, John");
    });

    it("should expand $0 as full match", () => {
      const result = expander.expand("hello", /hello/, "[$0]");

      expect(result).toBe("[hello]");
    });
  });

  describe("正常系: 名前付きキャプチャ", () => {
    it("should expand named capture group", () => {
      const result = expander.expand(
        "hello world",
        /(?<greeting>\w+)\s+(?<target>\w+)/,
        "$<target> says $<greeting>",
      );

      expect(result).toBe("world says hello");
    });

    it("should handle mixed numbered and named captures", () => {
      const result = expander.expand(
        "test123",
        /(?<word>[a-z]+)(?<num>\d+)/,
        "$1-$<num>",
      );

      expect(result).toBe("test-123");
    });
  });

  describe("正常系: エスケープ処理", () => {
    it("should treat $$ as literal $", () => {
      const result = expander.expand("test", /test/, "$$100");

      expect(result).toBe("$100");
    });

    it("should preserve $$ followed by number", () => {
      const result = expander.expand("abc", /(abc)/, "$$$1");

      expect(result).toBe("$abc");
    });

    it("should handle multiple $$ sequences", () => {
      const result = expander.expand("x", /x/, "$$$$");

      expect(result).toBe("$$");
    });
  });

  describe("境界値: 存在しないキャプチャグループ", () => {
    it("should preserve $n when group does not exist", () => {
      const result = expander.expand("test", /(test)/, "$1 $2 $3");

      expect(result).toBe("test $2 $3");
    });

    it("should preserve $<name> when named group does not exist", () => {
      const result = expander.expand(
        "test",
        /(?<first>\w+)/,
        "$<first> $<second>",
      );

      expect(result).toBe("test $<second>");
    });
  });

  describe("境界値: 空キャプチャグループ", () => {
    it("should handle empty capture group", () => {
      const result = expander.expand("test", /(test)?/, "$1");

      // Pattern matches at the beginning with 'test', so $1 should be 'test'
      expect(result).toBe("test");
    });

    it("should handle optional capture that matches empty", () => {
      const result = expander.expand("ab", /a(x)?b/, "[$1]");

      expect(result).toBe("[]");
    });
  });

  describe("境界値: 多数のキャプチャグループ", () => {
    it("should handle more than 9 capture groups", () => {
      const pattern = /(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)/;
      const result = expander.expand(
        "123456789012",
        pattern,
        "$12-$11-$10-$9-$1",
      );

      expect(result).toBe("2-1-0-9-1");
    });
  });

  describe("境界値: 特殊文字を含む置換文字列", () => {
    it("should not expand $n in literal string context", () => {
      const result = expander.expand(
        "test",
        /test/,
        "Result: $1", // No capture group, $1 should remain
      );

      expect(result).toBe("Result: $1");
    });

    it("should handle regex special characters in replacement", () => {
      const result = expander.expand("test", /(test)/, "($1)");

      expect(result).toBe("(test)");
    });
  });

  describe("異常系: 無効なパターン", () => {
    it("should handle null match result gracefully", () => {
      const result = expander.expand("nomatch", /xyz/, "$1");

      // Should return replacement string as-is since no match
      expect(result).toBe("$1");
    });
  });

  describe("パフォーマンス: 大きな入力", () => {
    it("should handle long replacement strings efficiently", () => {
      const longReplacement = "$1".repeat(100);
      const startTime = Date.now();

      expander.expand("test", /(test)/, longReplacement);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });

    it("should handle many capture groups efficiently", () => {
      const pattern = /(\w)(\w)(\w)(\w)(\w)(\w)(\w)(\w)(\w)(\w)/;
      const replacement = "$1$2$3$4$5$6$7$8$9$10";

      const startTime = Date.now();
      expander.expand("abcdefghij", pattern, replacement);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });
  });
});
