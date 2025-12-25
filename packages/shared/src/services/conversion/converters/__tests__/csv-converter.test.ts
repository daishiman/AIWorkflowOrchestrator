/**
 * @file CSVConverterのテスト
 * @module @repo/shared/services/conversion/converters/__tests__/csv-converter.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CSVConverter } from "../csv-converter";
import type { ConverterInput } from "../../types";
import { createFileId } from "../../../../types/rag/branded";

describe("CSVConverter", () => {
  let converter: CSVConverter;

  beforeEach(() => {
    converter = new CSVConverter();
  });

  // ========================================
  // プロパティテスト
  // ========================================

  describe("properties", () => {
    it("should have correct id", () => {
      expect(converter.id).toBe("csv-converter");
    });

    it("should have correct name", () => {
      expect(converter.name).toBe("CSV Converter");
    });

    it("should support text/csv mime type", () => {
      expect(converter.supportedMimeTypes).toContain("text/csv");
    });

    it("should support text/tab-separated-values mime type", () => {
      expect(converter.supportedMimeTypes).toContain(
        "text/tab-separated-values",
      );
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
    it("should return true for text/csv", () => {
      const input = createTestInput({
        mimeType: "text/csv",
        content: "a,b,c",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return true for text/tab-separated-values", () => {
      const input = createTestInput({
        mimeType: "text/tab-separated-values",
        content: "a\tb\tc",
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
  // 正常系テスト - CSV→Markdownテーブル変換
  // ========================================

  describe("convert - normal cases", () => {
    it("should convert simple CSV to Markdown table", async () => {
      const input = createTestInput({
        content: "name,age,city\nAlice,30,Tokyo\nBob,25,Osaka",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("| name | age | city |");
        expect(result.data.convertedContent).toContain("| --- | --- | --- |");
        expect(result.data.convertedContent).toContain(
          "| Alice | 30 | Tokyo |",
        );
        expect(result.data.convertedContent).toContain("| Bob | 25 | Osaka |");
      }
    });

    it("should convert TSV to Markdown table", async () => {
      const input = createTestInput({
        mimeType: "text/tab-separated-values",
        content: "name\tage\tcity\nAlice\t30\tTokyo\nBob\t25\tOsaka",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("| name | age | city |");
        expect(result.data.convertedContent).toContain(
          "| Alice | 30 | Tokyo |",
        );
      }
    });

    it("should handle CSV with quoted fields", async () => {
      const input = createTestInput({
        content:
          'name,description\n"John Doe","A person, with comma"\nJane,"Simple"',
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain(
          "| name | description |",
        );
        expect(result.data.convertedContent).toContain("| John Doe |");
        expect(result.data.convertedContent).toContain("A person, with comma");
      }
    });

    it("should handle CSV with special characters", async () => {
      const input = createTestInput({
        content: "name,value\nTest,100%\nItem,Special|Char",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("| Test | 100% |");
      }
    });

    it("should handle CSV with empty cells", async () => {
      const input = createTestInput({
        content: "a,b,c\n1,,3\n,2,",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("| 1 |  | 3 |");
        expect(result.data.convertedContent).toContain("|  | 2 |  |");
      }
    });

    it("should handle CSV with unicode characters", async () => {
      const input = createTestInput({
        content: "名前,都市\n太郎,東京\n花子,大阪",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("| 名前 | 都市 |");
        expect(result.data.convertedContent).toContain("| 太郎 | 東京 |");
        expect(result.data.convertedContent).toContain("| 花子 | 大阪 |");
      }
    });

    it("should escape pipe characters in Markdown output", async () => {
      const input = createTestInput({
        content: 'name,description\nTest,"Value|with|pipes"',
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // パイプ文字がエスケープされているか確認
        expect(result.data.convertedContent).toContain("\\|");
      }
    });
  });

  // ========================================
  // メタデータ抽出テスト
  // ========================================

  describe("convert - metadata extraction", () => {
    it("should extract row count", async () => {
      const input = createTestInput({
        content: "a,b,c\n1,2,3\n4,5,6\n7,8,9",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvRowCount).toBe(3);
      }
    });

    it("should extract column count", async () => {
      const input = createTestInput({
        content: "a,b,c,d,e\n1,2,3,4,5",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvColumnCount).toBe(5);
      }
    });

    it("should extract column names", async () => {
      const input = createTestInput({
        content: "name,age,city\nAlice,30,Tokyo",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvColumns).toEqual([
          "name",
          "age",
          "city",
        ]);
      }
    });

    it("should detect comma delimiter", async () => {
      const input = createTestInput({
        mimeType: "text/csv",
        content: "a,b,c\n1,2,3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvDelimiter).toBe(",");
      }
    });

    it("should detect tab delimiter", async () => {
      const input = createTestInput({
        mimeType: "text/tab-separated-values",
        content: "a\tb\tc\n1\t2\t3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvDelimiter).toBe("\t");
      }
    });

    it("should indicate header presence", async () => {
      const input = createTestInput({
        content: "name,age\nAlice,30",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvHasHeader).toBe(true);
      }
    });
  });

  // ========================================
  // 境界値テスト
  // ========================================

  describe("convert - edge cases", () => {
    it("should handle empty CSV", async () => {
      const input = createTestInput({
        content: "",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("");
      }
    });

    it("should handle CSV with only header", async () => {
      const input = createTestInput({
        content: "name,age,city",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("| name | age | city |");
        expect(result.data.extractedMetadata.custom.csvRowCount).toBe(0);
      }
    });

    it("should handle single column CSV", async () => {
      const input = createTestInput({
        content: "name\nAlice\nBob\nCharlie",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("| name |");
        expect(result.data.convertedContent).toContain("| Alice |");
        expect(result.data.extractedMetadata.custom.csvColumnCount).toBe(1);
      }
    });

    it("should handle single row CSV", async () => {
      const input = createTestInput({
        content: "a,b,c\n1,2,3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvRowCount).toBe(1);
      }
    });

    it("should handle CSV with trailing newline", async () => {
      const input = createTestInput({
        content: "a,b\n1,2\n",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvRowCount).toBe(1);
      }
    });

    it("should handle CSV with CRLF line endings", async () => {
      const input = createTestInput({
        content: "a,b,c\r\n1,2,3\r\n4,5,6",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvRowCount).toBe(2);
      }
    });

    it("should handle maxContentLength option", async () => {
      const input = createTestInput({
        content: "a,b,c\n1,2,3\n4,5,6\n7,8,9\n10,11,12",
      });

      const result = await converter.convert(input, { maxContentLength: 50 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBeLessThanOrEqual(50);
      }
    });

    it("should handle whitespace in CSV cells", async () => {
      const input = createTestInput({
        content: "name,value\n  padded  ,  spaces  ",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // セル内の空白は保持される
        expect(result.data.convertedContent).toContain("padded");
        expect(result.data.convertedContent).toContain("spaces");
      }
    });
  });

  // ========================================
  // パースエラーテスト
  // ========================================

  describe("convert - parse error cases", () => {
    it("should handle malformed CSV gracefully", async () => {
      const input = createTestInput({
        content: 'a,b,c\n1,2\n"unclosed quote,value',
      });

      const result = await converter.convert(input);

      // パースエラーがあっても部分的に成功する可能性がある
      expect(result.success).toBeDefined();
    });

    it("should handle CSV with inconsistent column counts", async () => {
      const input = createTestInput({
        content: "a,b,c\n1,2,3\n4,5\n6,7,8,9",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
    });

    it("should handle CSV with only delimiters", async () => {
      const input = createTestInput({
        content: ",,,\n,,,",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(
          result.data.extractedMetadata.custom.csvRowCount,
        ).toBeGreaterThanOrEqual(0);
      }
    });

    it("should handle CSV with mixed delimiters", async () => {
      const input = createTestInput({
        content: "a,b,c\n1\t2\t3",
      });

      const result = await converter.convert(input);

      // パースは成功するがデータが正しく分割されない可能性がある
      expect(result.success).toBeDefined();
    });

    it("should handle completely invalid CSV that produces no data", async () => {
      // 空の行だけのCSV（skipEmptyLinesでスキップされる）
      const input = createTestInput({
        content: "\n\n\n",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.csvRowCount).toBe(0);
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
        filePath: "/test.csv",
        mimeType: "text/csv",
        content: "a,b,c",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing filePath", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "",
        mimeType: "text/csv",
        content: "a,b,c",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing mimeType", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.csv",
        mimeType: "",
        content: "a,b,c",
        encoding: "utf-8",
      };

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
    filePath: "/path/to/test.csv",
    mimeType: "text/csv",
    content: "a,b,c\n1,2,3",
    encoding: "utf-8",
    ...overrides,
  };
}
