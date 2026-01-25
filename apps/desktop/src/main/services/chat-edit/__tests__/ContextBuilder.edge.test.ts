/**
 * ContextBuilder Edge Case Tests
 *
 * Phase 6: 追加のエッジケーステスト
 */
import { describe, it, expect, beforeEach } from "vitest";
import { ContextBuilder } from "../ContextBuilder";
import type { FileContextInput } from "../types";

describe("ContextBuilder - エッジケース", () => {
  let contextBuilder: ContextBuilder;

  beforeEach(() => {
    contextBuilder = new ContextBuilder();
  });

  describe("build - エッジケース", () => {
    it("空のcontexts配列で空文字を返す", () => {
      expect(contextBuilder.build([])).toBe("");
    });

    it("特殊文字を含むファイルパスを正しく処理する", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file with spaces.ts",
          content: "content",
          language: "typescript",
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain("file with spaces.ts");
    });

    it("Markdownコードブロックを含むコンテンツを処理する", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.md",
          content: "```typescript\ncode\n```",
          language: "markdown",
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain("```markdown");
    });

    it("非常に長いファイル名を正しく処理する", () => {
      const longName = "a".repeat(200) + ".ts";
      const contexts: FileContextInput[] = [
        {
          filePath: `/path/to/${longName}`,
          content: "content",
          language: "typescript",
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain(longName);
    });

    it("日本語ファイル名を正しく処理する", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/日本語ファイル.ts",
          content: "content",
          language: "typescript",
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain("日本語ファイル.ts");
    });

    it("絵文字を含むコンテンツを正しく処理する", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "// 🎉 Test 🚀",
          language: "typescript",
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain("🎉");
      expect(result).toContain("🚀");
    });

    it("選択範囲でselectedTextを使用する", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "full content that should not appear",
          language: "typescript",
          selection: {
            startLine: 1,
            endLine: 5,
            startColumn: 1,
            endColumn: 10,
            selectedText: "selected content only",
          },
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain("selected content only");
      expect(result).not.toContain("full content that should not appear");
    });
  });

  describe("calculateSize - エッジケース", () => {
    it("空のcontexts配列で0を返す", () => {
      expect(contextBuilder.calculateSize([])).toBe(0);
    });

    it("マルチバイト文字を正しくカウントする", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "日本語テスト", // 6文字 = 18バイト（UTF-8）
          language: "typescript",
        },
      ];
      const size = contextBuilder.calculateSize(contexts);
      expect(size).toBeGreaterThanOrEqual(18);
    });

    it("絵文字を正しくカウントする", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "🎉🚀", // 2絵文字 = 8バイト（UTF-8）
          language: "typescript",
        },
      ];
      const size = contextBuilder.calculateSize(contexts);
      expect(size).toBeGreaterThanOrEqual(8);
    });

    it("空のコンテンツでもパスサイズを含める", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "",
          language: "typescript",
        },
      ];
      const size = contextBuilder.calculateSize(contexts);
      expect(size).toBeGreaterThan(0); // パスサイズが含まれる
    });
  });

  describe("validateSize - 境界値テスト", () => {
    it("ちょうど100KBでtrueを返す", () => {
      const pathSize = Buffer.byteLength("/path/to/file.ts", "utf-8");
      const contentSize = 100 * 1024 - pathSize;
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(contentSize),
          language: "typescript",
        },
      ];
      expect(contextBuilder.validateSize(contexts)).toBe(true);
    });

    it("100KB + 1バイトでfalseを返す", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(100 * 1024 + 1),
          language: "typescript",
        },
      ];
      expect(contextBuilder.validateSize(contexts)).toBe(false);
    });

    it("複数ファイルの合計が100KB未満でtrueを返す", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/a.ts",
          content: "a".repeat(30 * 1024),
          language: "typescript",
        },
        {
          filePath: "/b.ts",
          content: "b".repeat(30 * 1024),
          language: "typescript",
        },
      ];
      expect(contextBuilder.validateSize(contexts)).toBe(true);
    });

    it("複数ファイルの合計が100KB超過でfalseを返す", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/a.ts",
          content: "a".repeat(60 * 1024),
          language: "typescript",
        },
        {
          filePath: "/b.ts",
          content: "b".repeat(50 * 1024),
          language: "typescript",
        },
      ];
      expect(contextBuilder.validateSize(contexts)).toBe(false);
    });
  });
});
