/**
 * @file JSONConverterのテスト
 * @module @repo/shared/services/conversion/converters/__tests__/json-converter.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { JSONConverter } from "../json-converter";
import type { ConverterInput } from "../../types";
import { createFileId } from "../../../../types/rag/branded";

describe("JSONConverter", () => {
  let converter: JSONConverter;

  beforeEach(() => {
    converter = new JSONConverter();
  });

  // ========================================
  // プロパティテスト
  // ========================================

  describe("properties", () => {
    it("should have correct id", () => {
      expect(converter.id).toBe("json-converter");
    });

    it("should have correct name", () => {
      expect(converter.name).toBe("JSON Converter");
    });

    it("should support application/json mime type", () => {
      expect(converter.supportedMimeTypes).toContain("application/json");
    });

    it("should have priority 5", () => {
      expect(converter.priority).toBe(5);
    });

    it("should have a description", () => {
      const description = (converter as any).getDescription();
      expect(description).toBeDefined();
      expect(typeof description).toBe("string");
      expect(description.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // canConvertテスト
  // ========================================

  describe("canConvert", () => {
    it("should return true for application/json", () => {
      const input = createTestInput({
        mimeType: "application/json",
        content: "{}",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return false for text/plain", () => {
      const input = createTestInput({
        mimeType: "text/plain",
        content: "plain text",
      });
      expect(converter.canConvert(input)).toBe(false);
    });

    it("should return false for text/html", () => {
      const input = createTestInput({
        mimeType: "text/html",
        content: "<html></html>",
      });
      expect(converter.canConvert(input)).toBe(false);
    });
  });

  // ========================================
  // 正常系テスト - JSON→読みやすいテキスト変換
  // ========================================

  describe("convert - normal cases", () => {
    it("should convert simple object to readable format", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          name: "Alice",
          age: 30,
          city: "Tokyo",
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("name");
        expect(result.data.convertedContent).toContain("Alice");
        expect(result.data.convertedContent).toContain("age");
        expect(result.data.convertedContent).toContain("30");
        expect(result.data.convertedContent).toContain("city");
        expect(result.data.convertedContent).toContain("Tokyo");
      }
    });

    it("should convert array to readable format", async () => {
      const input = createTestInput({
        content: JSON.stringify(["apple", "banana", "cherry"]),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("apple");
        expect(result.data.convertedContent).toContain("banana");
        expect(result.data.convertedContent).toContain("cherry");
      }
    });

    it("should convert nested object to readable format", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          person: {
            name: "Bob",
            address: {
              city: "Osaka",
              country: "Japan",
            },
          },
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("person");
        expect(result.data.convertedContent).toContain("name");
        expect(result.data.convertedContent).toContain("Bob");
        expect(result.data.convertedContent).toContain("address");
        expect(result.data.convertedContent).toContain("city");
        expect(result.data.convertedContent).toContain("Osaka");
      }
    });

    it("should convert array of objects to readable format", async () => {
      const input = createTestInput({
        content: JSON.stringify([
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" },
        ]),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("Item 1");
        expect(result.data.convertedContent).toContain("Item 2");
      }
    });

    it("should handle boolean and null values", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          active: true,
          deleted: false,
          optional: null,
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("active");
        expect(result.data.convertedContent).toContain("true");
        expect(result.data.convertedContent).toContain("deleted");
        expect(result.data.convertedContent).toContain("false");
        expect(result.data.convertedContent).toContain("optional");
        expect(result.data.convertedContent).toContain("null");
      }
    });

    it("should handle numeric values", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          integer: 42,
          float: 3.14,
          negative: -100,
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("42");
        expect(result.data.convertedContent).toContain("3.14");
        expect(result.data.convertedContent).toContain("-100");
      }
    });

    it("should handle unicode characters", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          greeting: "こんにちは",
          emoji: "🎉",
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("こんにちは");
        expect(result.data.convertedContent).toContain("🎉");
      }
    });

    it("should handle deeply nested structure", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          level1: {
            level2: {
              level3: {
                level4: {
                  value: "deep",
                },
              },
            },
          },
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("level1");
        expect(result.data.convertedContent).toContain("level2");
        expect(result.data.convertedContent).toContain("level3");
        expect(result.data.convertedContent).toContain("level4");
        expect(result.data.convertedContent).toContain("deep");
      }
    });
  });

  // ========================================
  // メタデータ抽出テスト
  // ========================================

  describe("convert - metadata extraction", () => {
    it("should extract top-level keys", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          name: "Test",
          age: 25,
          city: "Tokyo",
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.jsonTopLevelKeys).toEqual([
          "name",
          "age",
          "city",
        ]);
      }
    });

    it("should calculate nesting depth", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          level1: {
            level2: {
              level3: "value",
            },
          },
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.jsonNestingDepth).toBe(3);
      }
    });

    it("should count objects", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          obj1: {},
          obj2: { nested: {} },
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // ルートオブジェクト + obj1 + obj2 + nested = 4
        expect(result.data.extractedMetadata.custom.jsonObjectCount).toBe(4);
      }
    });

    it("should count arrays", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          arr1: [1, 2, 3],
          arr2: [[1], [2]],
        }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // arr1 + arr2 + 2 nested arrays = 4
        expect(result.data.extractedMetadata.custom.jsonArrayCount).toBe(4);
      }
    });

    it("should calculate data size", async () => {
      const input = createTestInput({
        content: JSON.stringify({ test: "value" }),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.jsonDataSize).toBe(
          JSON.stringify({ test: "value" }).length,
        );
      }
    });

    it("should handle array at root level for top-level keys", async () => {
      const input = createTestInput({
        content: JSON.stringify([1, 2, 3]),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // 配列の場合はトップレベルキーは空
        expect(result.data.extractedMetadata.custom.jsonTopLevelKeys).toEqual(
          [],
        );
      }
    });
  });

  // ========================================
  // 境界値テスト
  // ========================================

  describe("convert - edge cases", () => {
    it("should handle empty string", async () => {
      const input = createTestInput({
        content: "",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("");
      }
    });

    it("should handle empty object", async () => {
      const input = createTestInput({
        content: "{}",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.jsonTopLevelKeys).toEqual(
          [],
        );
        expect(result.data.extractedMetadata.custom.jsonObjectCount).toBe(1);
      }
    });

    it("should handle empty array", async () => {
      const input = createTestInput({
        content: "[]",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.jsonArrayCount).toBe(1);
      }
    });

    it("should handle primitive JSON values", async () => {
      const input = createTestInput({
        content: '"just a string"',
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("just a string");
      }
    });

    it("should handle maxContentLength option", async () => {
      const input = createTestInput({
        content: JSON.stringify({
          longKey: "a".repeat(100),
        }),
      });

      const result = await converter.convert(input, { maxContentLength: 50 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBeLessThanOrEqual(50);
      }
    });

    it("should handle JSON with whitespace", async () => {
      const input = createTestInput({
        content: '  { "name": "test" }  ',
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("name");
        expect(result.data.convertedContent).toContain("test");
      }
    });

    it("should handle pretty-printed JSON", async () => {
      const input = createTestInput({
        content: JSON.stringify({ name: "test", value: 123 }, null, 2),
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("name");
        expect(result.data.convertedContent).toContain("test");
      }
    });
  });

  // ========================================
  // 異常系テスト
  // ========================================

  describe("convert - error cases", () => {
    it("should fail with invalid JSON", async () => {
      const input = createTestInput({
        content: "{ invalid json }",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing fileId", async () => {
      const input = {
        fileId: "" as unknown as ReturnType<typeof createFileId>,
        filePath: "/test.json",
        mimeType: "application/json",
        content: "{}",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing filePath", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "",
        mimeType: "application/json",
        content: "{}",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing mimeType", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.json",
        mimeType: "",
        content: "{}",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should handle truncated JSON gracefully", async () => {
      const input = createTestInput({
        content: '{ "name": "test"',
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
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
    filePath: "/path/to/test.json",
    mimeType: "application/json",
    content: '{"test": "value"}',
    encoding: "utf-8",
    ...overrides,
  };
}
