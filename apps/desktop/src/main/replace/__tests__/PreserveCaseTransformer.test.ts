import { describe, it, expect, beforeEach } from "vitest";
import { PreserveCaseTransformer } from "../PreserveCaseTransformer";

describe("PreserveCaseTransformer", () => {
  let transformer: PreserveCaseTransformer;

  beforeEach(() => {
    transformer = new PreserveCaseTransformer();
  });

  describe("正常系: 大文字保持", () => {
    it("should convert replacement to all uppercase when original is all uppercase", () => {
      const result = transformer.transform("HELLO", "world");
      expect(result).toBe("WORLD");
    });

    it("should handle multi-word uppercase", () => {
      const result = transformer.transform("HELLO WORLD", "goodbye universe");
      expect(result).toBe("GOODBYE UNIVERSE");
    });

    it("should handle uppercase with numbers", () => {
      const result = transformer.transform("TEST123", "foo456");
      expect(result).toBe("FOO456");
    });
  });

  describe("正常系: 小文字保持", () => {
    it("should convert replacement to all lowercase when original is all lowercase", () => {
      const result = transformer.transform("hello", "WORLD");
      expect(result).toBe("world");
    });

    it("should handle multi-word lowercase", () => {
      const result = transformer.transform("hello world", "GOODBYE UNIVERSE");
      expect(result).toBe("goodbye universe");
    });
  });

  describe("正常系: タイトルケース（PascalCase）保持", () => {
    it("should capitalize first letter when original starts with uppercase", () => {
      const result = transformer.transform("Hello", "world");
      expect(result).toBe("World");
    });

    it("should preserve PascalCase for multi-word", () => {
      const result = transformer.transform("HelloWorld", "goodbyeuniverse");
      expect(result).toBe("Goodbyeuniverse");
    });
  });

  describe("正常系: camelCase 保持", () => {
    it("should preserve camelCase pattern", () => {
      const result = transformer.transform("myVariable", "yourMethod");
      expect(result).toBe("yourMethod");
    });

    it("should convert to camelCase when original is camelCase", () => {
      const result = transformer.transform("firstName", "LASTNAME");
      expect(result).toBe("lastname");
    });
  });

  describe("正常系: 混合ケース", () => {
    it("should handle mixed case by preserving first character case", () => {
      const result = transformer.transform("HeLLo", "world");
      expect(result).toBe("World");
    });

    it("should preserve case pattern character by character for equal length", () => {
      const result = transformer.transform("AbCd", "wxyz");
      expect(result).toBe("WxYz");
    });
  });

  describe("境界値: 長さの違い", () => {
    it("should handle replacement shorter than original", () => {
      const result = transformer.transform("HELLO", "hi");
      expect(result).toBe("HI");
    });

    it("should handle replacement longer than original", () => {
      const result = transformer.transform("HI", "hello");
      // Should apply pattern from original and extend with lowercase
      expect(result).toBe("HEllo");
    });

    it("should handle single character original", () => {
      const result = transformer.transform("H", "hello");
      expect(result).toBe("Hello");
    });

    it("should handle single character replacement", () => {
      const result = transformer.transform("HELLO", "x");
      expect(result).toBe("X");
    });
  });

  describe("境界値: 空文字列", () => {
    it("should return empty string when replacement is empty", () => {
      const result = transformer.transform("Hello", "");
      expect(result).toBe("");
    });

    it("should return replacement as-is when original is empty", () => {
      const result = transformer.transform("", "hello");
      expect(result).toBe("hello");
    });
  });

  describe("境界値: 特殊文字", () => {
    it("should preserve non-alphabetic characters", () => {
      const result = transformer.transform("TEST_123", "foo_456");
      expect(result).toBe("FOO_456");
    });

    it("should handle strings with only numbers", () => {
      const result = transformer.transform("123", "456");
      expect(result).toBe("456");
    });

    it("should handle strings with only special characters", () => {
      const result = transformer.transform("!@#", "$%^");
      expect(result).toBe("$%^");
    });

    it("should handle Unicode characters", () => {
      const result = transformer.transform("HELLO", "こんにちは");
      // Unicode characters should pass through unchanged
      expect(result).toBe("こんにちは");
    });
  });

  describe("境界値: スペースと句読点", () => {
    it("should handle spaces in strings", () => {
      const result = transformer.transform("Hello World", "foo bar");
      expect(result).toBe("Foo Bar");
    });

    it("should handle punctuation", () => {
      const result = transformer.transform("HELLO!", "goodbye!");
      expect(result).toBe("GOODBYE!");
    });

    it("should handle hyphens", () => {
      const result = transformer.transform("FIRST-NAME", "last-name");
      expect(result).toBe("LAST-NAME");
    });
  });

  describe("異常系: 判定できないケース", () => {
    it("should return replacement as-is when case pattern is ambiguous", () => {
      // When original has mixed case with no clear pattern
      const result = transformer.transform("hElLo", "WORLD");
      // Should apply character-by-character case mapping
      expect(result.length).toBe(5);
    });
  });

  describe("パフォーマンス", () => {
    it("should handle long strings efficiently", () => {
      const original = "HELLO".repeat(1000);
      const replacement = "world".repeat(1000);

      const startTime = Date.now();
      transformer.transform(original, replacement);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });
  });

  describe("SNAKE_CASE と kebab-case", () => {
    it("should preserve UPPER_SNAKE_CASE", () => {
      const result = transformer.transform("MY_CONSTANT", "your_value");
      expect(result).toBe("YOUR_VALUE");
    });

    it("should preserve lower_snake_case", () => {
      const result = transformer.transform("my_variable", "YOUR_METHOD");
      expect(result).toBe("your_method");
    });

    it("should preserve kebab-case", () => {
      const result = transformer.transform("my-component", "YOUR-ELEMENT");
      expect(result).toBe("your-element");
    });

    it("should preserve UPPER-KEBAB-CASE", () => {
      const result = transformer.transform("MY-CONSTANT", "your-value");
      expect(result).toBe("YOUR-VALUE");
    });
  });
});
