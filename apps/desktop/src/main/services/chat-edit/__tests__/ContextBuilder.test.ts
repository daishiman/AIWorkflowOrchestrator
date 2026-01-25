/**
 * ContextBuilder Unit Tests
 *
 * TDD Red Phase: テストは実装前に作成されているため、現時点では失敗する
 */
import { describe, it, expect, beforeEach } from "vitest";

// ContextBuilderのモック（実装前）
// 実装後はこのモックを削除して実際のContextBuilderをインポート
// import { ContextBuilder } from "../ContextBuilder";

// 定数
const MAX_CONTEXT_SIZE = 100 * 1024; // 100KB

// FileContextInput型（実装時にインポートに置き換え）
interface TextSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  selectedText: string;
}

interface FileContextInput {
  filePath: string;
  content: string;
  selection?: TextSelection;
  language: string;
}

describe("ContextBuilder", () => {
  let contextBuilder: any;

  beforeEach(() => {
    // ContextBuilderが実装されたらここでインスタンスを作成
    // contextBuilder = new ContextBuilder();

    // 一時的なモック実装
    contextBuilder = {
      build: (contexts: FileContextInput[]) => {
        if (contexts.length === 0) return "";

        const sections = contexts.map((ctx) => {
          const fileName = ctx.filePath.split("/").pop();
          let header = `### File: ${fileName}`;
          if (ctx.selection) {
            header += ` (選択範囲: L${ctx.selection.startLine}-L${ctx.selection.endLine})`;
          }
          const content = ctx.selection
            ? ctx.selection.selectedText
            : ctx.content;
          return `${header}\n\`\`\`${ctx.language}\n${content}\n\`\`\``;
        });

        return `## ファイルコンテキスト\n\n${sections.join("\n\n")}`;
      },

      calculateSize: (contexts: FileContextInput[]) => {
        return contexts.reduce((total, ctx) => {
          return (
            total +
            new TextEncoder().encode(ctx.content).length +
            new TextEncoder().encode(ctx.filePath).length
          );
        }, 0);
      },

      validateSize: (contexts: FileContextInput[]) => {
        const size = contextBuilder.calculateSize(contexts);
        return size <= MAX_CONTEXT_SIZE;
      },
    };
  });

  describe("build", () => {
    it("単一ファイルからMarkdown形式で構築する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/Button.tsx",
          content: "export const Button = () => {};",
          language: "typescript",
        },
      ];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toContain("## ファイルコンテキスト");
      expect(result).toContain("Button.tsx");
      expect(result).toContain("```typescript");
      expect(result).toContain("export const Button = () => {};");
    });

    it("複数ファイルを正しく構築する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/Button.tsx",
          content: "export const Button = () => {};",
          language: "typescript",
        },
        {
          filePath: "/path/to/utils.ts",
          content: "export const helper = () => {};",
          language: "typescript",
        },
      ];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toContain("Button.tsx");
      expect(result).toContain("utils.ts");
      expect(result).toContain("export const Button = () => {};");
      expect(result).toContain("export const helper = () => {};");
    });

    it("選択範囲がある場合に行番号を表示する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/Button.tsx",
          content: "full file content",
          language: "typescript",
          selection: {
            startLine: 10,
            endLine: 25,
            startColumn: 1,
            endColumn: 1,
            selectedText: "selected content",
          },
        },
      ];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toContain("L10-L25");
      expect(result).toContain("選択範囲");
    });

    it("選択範囲がある場合、選択されたテキストのみを含む", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/Button.tsx",
          content: "full file content that should not appear",
          language: "typescript",
          selection: {
            startLine: 10,
            endLine: 25,
            startColumn: 1,
            endColumn: 1,
            selectedText: "only this selected content",
          },
        },
      ];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toContain("only this selected content");
      expect(result).not.toContain("full file content that should not appear");
    });

    it("空のコンテキスト配列で空文字列を返す", () => {
      // Arrange
      const contexts: FileContextInput[] = [];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toBe("");
    });

    it("異なる言語のファイルを正しく構築する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/script.py",
          content: "def hello(): pass",
          language: "python",
        },
        {
          filePath: "/path/to/config.json",
          content: '{"key": "value"}',
          language: "json",
        },
      ];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toContain("```python");
      expect(result).toContain("```json");
    });
  });

  describe("calculateSize", () => {
    it("コンテキストの合計サイズを計算する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(1000),
          language: "typescript",
        },
      ];

      // Act
      const size = contextBuilder.calculateSize(contexts);

      // Assert
      expect(size).toBeGreaterThanOrEqual(1000);
    });

    it("複数ファイルの合計サイズを計算する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file1.ts",
          content: "a".repeat(500),
          language: "typescript",
        },
        {
          filePath: "/path/to/file2.ts",
          content: "b".repeat(500),
          language: "typescript",
        },
      ];

      // Act
      const size = contextBuilder.calculateSize(contexts);

      // Assert
      expect(size).toBeGreaterThanOrEqual(1000);
    });

    it("空のコンテキストで0を返す", () => {
      // Arrange
      const contexts: FileContextInput[] = [];

      // Act
      const size = contextBuilder.calculateSize(contexts);

      // Assert
      expect(size).toBe(0);
    });

    it("マルチバイト文字を正しくカウントする", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "あいうえお", // 5文字 = 15バイト（UTF-8）
          language: "typescript",
        },
      ];

      // Act
      const size = contextBuilder.calculateSize(contexts);

      // Assert
      expect(size).toBeGreaterThanOrEqual(15);
    });
  });

  describe("validateSize", () => {
    it("制限内でtrueを返す", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "small content",
          language: "typescript",
        },
      ];

      // Act
      const isValid = contextBuilder.validateSize(contexts);

      // Assert
      expect(isValid).toBe(true);
    });

    it("100KBを超える場合にfalseを返す", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(MAX_CONTEXT_SIZE + 1),
          language: "typescript",
        },
      ];

      // Act
      const isValid = contextBuilder.validateSize(contexts);

      // Assert
      expect(isValid).toBe(false);
    });

    it("ちょうど100KBでtrueを返す", () => {
      // Arrange
      // ファイルパスのサイズも含めるため、コンテンツサイズを調整
      const pathSize = new TextEncoder().encode("/path/to/file.ts").length;
      const contentSize = MAX_CONTEXT_SIZE - pathSize;
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(contentSize),
          language: "typescript",
        },
      ];

      // Act
      const isValid = contextBuilder.validateSize(contexts);

      // Assert
      expect(isValid).toBe(true);
    });

    it("複数ファイルの合計が100KBを超える場合にfalseを返す", () => {
      // Arrange
      const halfSize = Math.floor(MAX_CONTEXT_SIZE / 2) + 100;
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file1.ts",
          content: "a".repeat(halfSize),
          language: "typescript",
        },
        {
          filePath: "/path/to/file2.ts",
          content: "b".repeat(halfSize),
          language: "typescript",
        },
      ];

      // Act
      const isValid = contextBuilder.validateSize(contexts);

      // Assert
      expect(isValid).toBe(false);
    });
  });
});
