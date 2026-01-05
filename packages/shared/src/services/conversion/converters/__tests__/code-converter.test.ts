/**
 * @file CodeConverterのテスト
 * @module @repo/shared/services/conversion/converters/__tests__/code-converter.test
 * @description TDD Red フェーズ - 実装前のテスト作成
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CodeConverter } from "../code-converter";
import type { ConverterInput } from "../../types";
import { createFileId } from "../../../../types/rag/branded";

describe("CodeConverter", () => {
  let converter: CodeConverter;

  beforeEach(() => {
    converter = new CodeConverter();
  });

  // ========================================
  // プロパティテスト
  // ========================================

  describe("properties", () => {
    it("should have correct id", () => {
      expect(converter.id).toBe("code-converter");
    });

    it("should have correct name", () => {
      expect(converter.name).toBe("Code File Converter");
    });

    it("should support TypeScript mime types", () => {
      expect(converter.supportedMimeTypes).toContain("text/x-typescript");
      expect(converter.supportedMimeTypes).toContain("text/typescript");
      expect(converter.supportedMimeTypes).toContain("application/typescript");
    });

    it("should support JavaScript mime types", () => {
      expect(converter.supportedMimeTypes).toContain("text/javascript");
      expect(converter.supportedMimeTypes).toContain("application/javascript");
    });

    it("should support Python mime types", () => {
      expect(converter.supportedMimeTypes).toContain("text/x-python");
      expect(converter.supportedMimeTypes).toContain("text/x-python-script");
      expect(converter.supportedMimeTypes).toContain("application/x-python");
    });

    it("should have priority 10", () => {
      expect(converter.priority).toBe(10);
    });

    it("should have a description", () => {
      const metadata = converter.getMetadata();
      expect(metadata.description).toBeDefined();
      expect(typeof metadata.description).toBe("string");
      expect(metadata.description.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // canConvertテスト
  // ========================================

  describe("canConvert", () => {
    it("should return true for TypeScript files", () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return true for JavaScript files", () => {
      const input = createTestInput({
        mimeType: "text/javascript",
        filePath: "/path/to/file.js",
        content: "const x = 1;",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return true for Python files", () => {
      const input = createTestInput({
        mimeType: "text/x-python",
        filePath: "/path/to/file.py",
        content: "x = 1",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return false for text/plain", () => {
      const input = createTestInput({
        mimeType: "text/plain",
        filePath: "/path/to/file.txt",
        content: "plain text",
      });
      expect(converter.canConvert(input)).toBe(false);
    });

    it("should return false for text/html", () => {
      const input = createTestInput({
        mimeType: "text/html",
        filePath: "/path/to/file.html",
        content: "<html></html>",
      });
      expect(converter.canConvert(input)).toBe(false);
    });
  });

  // ========================================
  // 言語検出テスト
  // ========================================

  describe("convert - language detection", () => {
    it("should detect TypeScript for .ts files", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x: number = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe(
          "typescript",
        );
      }
    });

    it("should detect TypeScript for .tsx files", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.tsx",
        content: "const App = () => <div />;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe(
          "typescript",
        );
      }
    });

    it("should detect TypeScript for .mts files", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.mts",
        content: "export const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe(
          "typescript",
        );
      }
    });

    it("should detect JavaScript for .js files", async () => {
      const input = createTestInput({
        mimeType: "text/javascript",
        filePath: "/path/to/file.js",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe(
          "javascript",
        );
      }
    });

    it("should detect JavaScript for .jsx files", async () => {
      const input = createTestInput({
        mimeType: "text/javascript",
        filePath: "/path/to/file.jsx",
        content: "const App = () => <div />;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe(
          "javascript",
        );
      }
    });

    it("should detect JavaScript for .mjs files", async () => {
      const input = createTestInput({
        mimeType: "text/javascript",
        filePath: "/path/to/file.mjs",
        content: "export const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe(
          "javascript",
        );
      }
    });

    it("should detect Python for .py files", async () => {
      const input = createTestInput({
        mimeType: "text/x-python",
        filePath: "/path/to/file.py",
        content: "x = 1",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe("python");
      }
    });

    it("should detect text for unknown extensions", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.unknown",
        content: "some content",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe("text");
      }
    });
  });

  // ========================================
  // JavaScript/TypeScript 構造抽出テスト
  // ========================================

  describe("convert - JS/TS structure extraction", () => {
    it("should extract function definitions", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: `
function foo() {}
export function bar() {}
async function baz() {}
export async function qux() {}
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.functions).toContain("foo");
        expect(result.data.extractedMetadata.custom.functions).toContain("bar");
        expect(result.data.extractedMetadata.custom.functions).toContain("baz");
        expect(result.data.extractedMetadata.custom.functions).toContain("qux");
      }
    });

    it("should extract arrow functions", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: `
const foo = () => {};
export const bar = async () => {};
const baz = (x) => x * 2;
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.functions).toContain("foo");
        expect(result.data.extractedMetadata.custom.functions).toContain("bar");
        expect(result.data.extractedMetadata.custom.functions).toContain("baz");
      }
    });

    it("should extract class definitions", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: `
class Foo {}
export class Bar extends Base {}
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.classes).toContain("Foo");
        expect(result.data.extractedMetadata.custom.classes).toContain("Bar");
      }
    });

    it("should extract imports", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: `
import foo from "module-a";
import { bar } from "module-b";
import "side-effect";
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.importCount).toBe(3);
      }
    });

    it("should extract exports", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: `
export const foo = 1;
export function bar() {}
export class Baz {}
export interface IFoo {}
export type MyType = string;
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(
          result.data.extractedMetadata.custom.exportCount,
        ).toBeGreaterThanOrEqual(5);
      }
    });

    it("should count classes and functions correctly", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: `
class MyClass {}
function myFunction() {}
const arrowFunc = () => {};
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.classCount).toBe(1);
        expect(result.data.extractedMetadata.custom.functionCount).toBe(2);
      }
    });
  });

  // ========================================
  // Python 構造抽出テスト
  // ========================================

  describe("convert - Python structure extraction", () => {
    it("should extract Python function definitions", async () => {
      const input = createTestInput({
        mimeType: "text/x-python",
        filePath: "/path/to/file.py",
        content: `
def foo():
    pass

def bar(x, y):
    return x + y
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.functions).toContain("foo");
        expect(result.data.extractedMetadata.custom.functions).toContain("bar");
      }
    });

    it("should extract Python class definitions", async () => {
      const input = createTestInput({
        mimeType: "text/x-python",
        filePath: "/path/to/file.py",
        content: `
class Foo:
    pass

class Bar(Base):
    pass
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.classes).toContain("Foo");
        expect(result.data.extractedMetadata.custom.classes).toContain("Bar");
      }
    });

    it("should extract Python imports", async () => {
      const input = createTestInput({
        mimeType: "text/x-python",
        filePath: "/path/to/file.py",
        content: `
import os
from os.path import join
import sys
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(
          result.data.extractedMetadata.custom.importCount,
        ).toBeGreaterThanOrEqual(3);
      }
    });
  });

  // ========================================
  // Markdown形式出力テスト
  // ========================================

  describe("convert - Markdown output format", () => {
    it("should format output with Code Structure section", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: `
class MyClass {}
function myFunction() {}
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("## Code Structure");
        expect(result.data.convertedContent).toContain("### Classes");
        expect(result.data.convertedContent).toContain("`MyClass`");
        expect(result.data.convertedContent).toContain("### Functions");
        expect(result.data.convertedContent).toContain("`myFunction`");
      }
    });

    it("should format output with Source Code section", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("## Source Code");
        expect(result.data.convertedContent).toContain("```typescript");
        expect(result.data.convertedContent).toContain("const x = 1;");
        expect(result.data.convertedContent).toContain("```");
      }
    });

    it("should skip Code Structure when no classes or functions", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // 関数もクラスもない場合、Code Structure セクションは含まれない
        expect(result.data.convertedContent).not.toContain("### Classes");
        expect(result.data.convertedContent).not.toContain("### Functions");
      }
    });

    it("should use correct language in code block for Python", async () => {
      const input = createTestInput({
        mimeType: "text/x-python",
        filePath: "/path/to/file.py",
        content: "x = 1",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("```python");
      }
    });
  });

  // ========================================
  // メタデータテスト
  // ========================================

  describe("convert - metadata", () => {
    it("should set title to null", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.title).toBeNull();
      }
    });

    it("should set author to null", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.author).toBeNull();
      }
    });

    it("should set language to en for code files", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.language).toBe("en");
      }
    });

    it("should set codeBlocks to 1", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.codeBlocks).toBe(1);
      }
    });

    it("should set links to empty array", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.links).toEqual([]);
      }
    });

    it("should create headers from classes and functions", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: `
class MyClass {}
function myFunction() {}
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.headers).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ level: 2, text: "class MyClass" }),
            expect.objectContaining({ level: 2, text: "function myFunction" }),
          ]),
        );
      }
    });

    it("should count words correctly", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.wordCount).toBeGreaterThan(0);
      }
    });

    it("should count lines correctly", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "line1\nline2\nline3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.lineCount).toBe(3);
      }
    });

    it("should count characters correctly", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "Hello",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.charCount).toBe(5);
      }
    });
  });

  // ========================================
  // エッジケーステスト
  // ========================================

  describe("convert - edge cases", () => {
    it("should handle empty file", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.functionCount).toBe(0);
        expect(result.data.extractedMetadata.custom.classCount).toBe(0);
      }
    });

    it("should handle file with no functions", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;\nconst y = 2;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.functionCount).toBe(0);
      }
    });

    it("should handle file with unknown extension", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.unknown",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.language).toBe("text");
      }
    });

    it("should handle maxContentLength option", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;\n".repeat(100),
      });

      const result = await converter.convert(input, { maxContentLength: 50 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBeLessThanOrEqual(50);
      }
    });
  });

  // ========================================
  // 異常系テスト
  // ========================================

  describe("convert - error cases", () => {
    it("should fail with missing fileId", async () => {
      const input = {
        fileId: "" as unknown as ReturnType<typeof createFileId>,
        filePath: "/test.ts",
        mimeType: "text/x-typescript",
        content: "const x = 1;",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing filePath", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "",
        mimeType: "text/x-typescript",
        content: "const x = 1;",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing mimeType", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.ts",
        mimeType: "",
        content: "const x = 1;",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with null content", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.ts",
        mimeType: "text/x-typescript",
        content: null as unknown as string,
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // 処理時間テスト
  // ========================================

  describe("convert - processing time", () => {
    it("should return processing time greater than or equal to 0", async () => {
      const input = createTestInput({
        mimeType: "text/x-typescript",
        filePath: "/path/to/file.ts",
        content: "const x = 1;",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.processingTime).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

// ========================================
// ヘルパー関数
// ========================================

/**
 * テスト用のConverterInputを作成
 */
function createTestInput(
  overrides: Partial<ConverterInput> = {},
): ConverterInput {
  return {
    fileId: createFileId("test-file-id"),
    filePath: "/path/to/test.ts",
    mimeType: "text/x-typescript",
    content: "const x = 1;",
    encoding: "utf-8",
    ...overrides,
  };
}
