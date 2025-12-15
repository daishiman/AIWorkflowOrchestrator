import { describe, it, expect, beforeEach } from "vitest";
import { ReplaceService } from "../ReplaceService";
import type { SearchMatch, SearchOptions } from "../../search/types";
import type { ReplaceOptions } from "@repo/shared/types/replace";

describe("ReplaceService", () => {
  let service: ReplaceService;

  beforeEach(() => {
    service = new ReplaceService();
  });

  describe("正常系: 単一置換", () => {
    it("should replace a single match", () => {
      const content = "Hello World";
      const match: SearchMatch = {
        text: "World",
        line: 1,
        column: 7,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "Universe",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("Hello Universe");
      expect(result.replacements).toHaveLength(1);
      expect(result.replacements[0].originalText).toBe("World");
      expect(result.replacements[0].newText).toBe("Universe");
    });

    it("should replace match at the beginning of content", () => {
      const content = "Hello World";
      const match: SearchMatch = {
        text: "Hello",
        line: 1,
        column: 1,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "Hi",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("Hi World");
    });

    it("should replace match at the end of content", () => {
      const content = "Hello World";
      const match: SearchMatch = {
        text: "World",
        line: 1,
        column: 7,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "Universe!",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("Hello Universe!");
    });
  });

  describe("正常系: 複数置換", () => {
    it("should replace multiple matches", () => {
      const content = "test test test";
      const matches: SearchMatch[] = [
        { text: "test", line: 1, column: 1, length: 4 },
        { text: "test", line: 1, column: 6, length: 4 },
        { text: "test", line: 1, column: 11, length: 4 },
      ];
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceMatches(
        content,
        matches,
        "foo",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("foo foo foo");
      expect(result.replacements).toHaveLength(3);
    });

    it("should replace matches across multiple lines", () => {
      const content = "line1 test\nline2 test\nline3 test";
      const matches: SearchMatch[] = [
        { text: "test", line: 1, column: 7, length: 4 },
        { text: "test", line: 2, column: 7, length: 4 },
        { text: "test", line: 3, column: 7, length: 4 },
      ];
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceMatches(
        content,
        matches,
        "replaced",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe(
        "line1 replaced\nline2 replaced\nline3 replaced",
      );
    });

    it("should handle replacement with different lengths", () => {
      const content = "short medium long";
      const matches: SearchMatch[] = [
        { text: "short", line: 1, column: 1, length: 5 },
        { text: "medium", line: 1, column: 7, length: 6 },
        { text: "long", line: 1, column: 14, length: 4 },
      ];
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceMatches(
        content,
        matches,
        "X",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("X X X");
    });
  });

  describe("正常系: 正規表現キャプチャ展開", () => {
    it("should expand $1 capture group", () => {
      const content = "test123";
      const match: SearchMatch = {
        text: "test123",
        line: 1,
        column: 1,
        length: 7,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: true,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "prefix_$1_suffix",
        { ...options, pattern: "(test\\d+)" },
        replaceOptions,
      );

      expect(result.newContent).toBe("prefix_test123_suffix");
    });

    it("should expand multiple capture groups", () => {
      const content = "2024-01-15";
      const match: SearchMatch = {
        text: "2024-01-15",
        line: 1,
        column: 1,
        length: 10,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: true,
        pattern: "(\\d{4})-(\\d{2})-(\\d{2})",
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "$3/$2/$1",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("15/01/2024");
    });

    it("should handle $0 for full match", () => {
      const content = "hello";
      const match: SearchMatch = {
        text: "hello",
        line: 1,
        column: 1,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: true,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "[$0]",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("[hello]");
    });

    it("should escape literal dollar signs with $$", () => {
      const content = "test";
      const match: SearchMatch = {
        text: "test",
        line: 1,
        column: 1,
        length: 4,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "$$100",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("$100");
    });
  });

  describe("正常系: 大文字/小文字保持", () => {
    it("should preserve all uppercase", () => {
      const content = "HELLO";
      const match: SearchMatch = {
        text: "HELLO",
        line: 1,
        column: 1,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: true };

      const result = service.replaceSingle(
        content,
        match,
        "world",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("WORLD");
    });

    it("should preserve all lowercase", () => {
      const content = "hello";
      const match: SearchMatch = {
        text: "hello",
        line: 1,
        column: 1,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: true };

      const result = service.replaceSingle(
        content,
        match,
        "WORLD",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("world");
    });

    it("should preserve title case (PascalCase)", () => {
      const content = "Hello";
      const match: SearchMatch = {
        text: "Hello",
        line: 1,
        column: 1,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: true };

      const result = service.replaceSingle(
        content,
        match,
        "world",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("World");
    });

    it("should preserve camelCase", () => {
      const content = "myVariable";
      const match: SearchMatch = {
        text: "myVariable",
        line: 1,
        column: 1,
        length: 10,
      };
      const options: SearchOptions = {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: true };

      const result = service.replaceSingle(
        content,
        match,
        "yourFunction",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("yourFunction");
    });
  });

  describe("境界値: 空文字列", () => {
    it("should replace with empty string", () => {
      const content = "Hello World";
      const match: SearchMatch = {
        text: "World",
        line: 1,
        column: 7,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("Hello ");
    });

    it("should handle empty matches array", () => {
      const content = "Hello World";
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceMatches(
        content,
        [],
        "X",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("Hello World");
      expect(result.replacements).toHaveLength(0);
    });
  });

  describe("境界値: 特殊文字", () => {
    it("should handle special characters in replacement", () => {
      const content = "test";
      const match: SearchMatch = {
        text: "test",
        line: 1,
        column: 1,
        length: 4,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "<tag>$value</tag>",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("<tag>$value</tag>");
    });

    it("should handle newlines in replacement", () => {
      const content = "single line";
      const match: SearchMatch = {
        text: "single line",
        line: 1,
        column: 1,
        length: 11,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "line1\nline2\nline3",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("line1\nline2\nline3");
    });

    it("should handle Unicode characters", () => {
      const content = "hello";
      const match: SearchMatch = {
        text: "hello",
        line: 1,
        column: 1,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const result = service.replaceSingle(
        content,
        match,
        "こんにちは",
        options,
        replaceOptions,
      );

      expect(result.newContent).toBe("こんにちは");
    });
  });

  describe("プレビュー生成", () => {
    it("should generate preview for replacement", () => {
      const lineText = "Hello World";
      const match: SearchMatch = {
        text: "World",
        line: 1,
        column: 7,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const preview = service.generatePreview(
        lineText,
        match,
        "Universe",
        options,
        replaceOptions,
      );

      expect(preview.beforeText).toBe("Hello World");
      expect(preview.afterText).toBe("Hello Universe");
      expect(preview.diff.removed.text).toBe("World");
      expect(preview.diff.added.text).toBe("Universe");
    });

    it("should show diff for length changes", () => {
      const lineText = "short";
      const match: SearchMatch = {
        text: "short",
        line: 1,
        column: 1,
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      const preview = service.generatePreview(
        lineText,
        match,
        "very long replacement",
        options,
        replaceOptions,
      );

      expect(preview.diff.removed.text).toBe("short");
      expect(preview.diff.added.text).toBe("very long replacement");
    });
  });

  describe("異常系: エラーハンドリング", () => {
    it("should throw error for invalid match position", () => {
      const content = "Hello";
      const match: SearchMatch = {
        text: "World",
        line: 1,
        column: 100, // Invalid column
        length: 5,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      expect(() => {
        service.replaceSingle(content, match, "X", options, replaceOptions);
      }).toThrow(/position|out of bounds|invalid/i);
    });

    it("should throw error for invalid line number", () => {
      const content = "Single line";
      const match: SearchMatch = {
        text: "line",
        line: 5, // Only 1 line exists
        column: 1,
        length: 4,
      };
      const options: SearchOptions = {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
      };
      const replaceOptions: ReplaceOptions = { preserveCase: false };

      expect(() => {
        service.replaceSingle(content, match, "X", options, replaceOptions);
      }).toThrow(/line|out of bounds|invalid/i);
    });
  });
});
