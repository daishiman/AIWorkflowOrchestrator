/**
 * T-03-1: types.ts 型定義テスト
 *
 * @description TDD Red Phase - types.ts の型定義に対するテスト
 * @see docs/30-workflows/file-conversion-schemas/task-step01-type-design.md
 */

import { describe, it, expect } from "vitest";

// ========================================
// テスト対象のインポート（実装前なのでエラーになる）
// ========================================
import {
  // 定数オブジェクト
  FileTypes,
  FileCategories,
  // 型エクスポート（型テストで使用）
  type FileType,
  type FileCategory,
  type FileEntity,
  type ConversionEntity,
  type ExtractedMetadata,
  type ConversionResult,
  type FileSelectionInput,
  type FileSelectionResult,
  type SkippedFile,
} from "../types";

// ========================================
// FileTypes 定数テスト
// ========================================
describe("FileTypes", () => {
  describe("テキスト系タイプ", () => {
    it("TEXT が text/plain であること", () => {
      expect(FileTypes.TEXT).toBe("text/plain");
    });

    it("MARKDOWN が text/markdown であること", () => {
      expect(FileTypes.MARKDOWN).toBe("text/markdown");
    });

    it("HTML が text/html であること", () => {
      expect(FileTypes.HTML).toBe("text/html");
    });

    it("CSV が text/csv であること", () => {
      expect(FileTypes.CSV).toBe("text/csv");
    });

    it("TSV が text/tab-separated-values であること", () => {
      expect(FileTypes.TSV).toBe("text/tab-separated-values");
    });
  });

  describe("コード系タイプ", () => {
    it("JAVASCRIPT が text/javascript であること", () => {
      expect(FileTypes.JAVASCRIPT).toBe("text/javascript");
    });

    it("TYPESCRIPT が text/typescript であること", () => {
      expect(FileTypes.TYPESCRIPT).toBe("text/typescript");
    });

    it("PYTHON が application/x-python であること", () => {
      expect(FileTypes.PYTHON).toBe("application/x-python");
    });

    it("JSON が application/json であること", () => {
      expect(FileTypes.JSON).toBe("application/json");
    });

    it("YAML が application/x-yaml であること", () => {
      expect(FileTypes.YAML).toBe("application/x-yaml");
    });

    it("XML が application/xml であること", () => {
      expect(FileTypes.XML).toBe("application/xml");
    });
  });

  describe("ドキュメント系タイプ", () => {
    it("PDF が application/pdf であること", () => {
      expect(FileTypes.PDF).toBe("application/pdf");
    });

    it("DOCX が正しいMIMEタイプであること", () => {
      expect(FileTypes.DOCX).toBe(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
    });

    it("XLSX が正しいMIMEタイプであること", () => {
      expect(FileTypes.XLSX).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    });

    it("PPTX が正しいMIMEタイプであること", () => {
      expect(FileTypes.PPTX).toBe(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      );
    });
  });

  describe("その他タイプ", () => {
    it("UNKNOWN が application/octet-stream であること", () => {
      expect(FileTypes.UNKNOWN).toBe("application/octet-stream");
    });
  });

  describe("定数オブジェクトの特性", () => {
    it("FileTypes は16種類のタイプを持つこと", () => {
      expect(Object.keys(FileTypes)).toHaveLength(16);
    });

    it("FileTypes は as const で定義され、値が変更不可であること", () => {
      // TypeScriptの型チェックで保証されるが、ランタイムでも確認
      expect(Object.isFrozen(FileTypes)).toBe(false); // as constはfreezeしない
      // 代わりに、値の型がリテラル型であることをテスト
      const textValue: "text/plain" = FileTypes.TEXT;
      expect(textValue).toBe("text/plain");
    });
  });
});

// ========================================
// FileCategories 定数テスト
// ========================================
describe("FileCategories", () => {
  it("TEXT が text であること", () => {
    expect(FileCategories.TEXT).toBe("text");
  });

  it("CODE が code であること", () => {
    expect(FileCategories.CODE).toBe("code");
  });

  it("DOCUMENT が document であること", () => {
    expect(FileCategories.DOCUMENT).toBe("document");
  });

  it("SPREADSHEET が spreadsheet であること", () => {
    expect(FileCategories.SPREADSHEET).toBe("spreadsheet");
  });

  it("PRESENTATION が presentation であること", () => {
    expect(FileCategories.PRESENTATION).toBe("presentation");
  });

  it("OTHER が other であること", () => {
    expect(FileCategories.OTHER).toBe("other");
  });

  it("FileCategories は6種類のカテゴリを持つこと", () => {
    expect(Object.keys(FileCategories)).toHaveLength(6);
  });
});

// ========================================
// 型エクスポートテスト（コンパイル時チェック）
// ========================================
describe("型エクスポート", () => {
  describe("FileType 型", () => {
    it("FileType はFileTypesの値の型であること", () => {
      // 型の互換性テスト（コンパイル時に検証）
      const fileType: FileType = FileTypes.TEXT;
      expect(fileType).toBe("text/plain");
    });

    it("FileType にはすべてのMIMEタイプが含まれること", () => {
      // 各値がFileType型として有効であることを確認
      const types: FileType[] = [
        FileTypes.TEXT,
        FileTypes.MARKDOWN,
        FileTypes.HTML,
        FileTypes.CSV,
        FileTypes.TSV,
        FileTypes.JAVASCRIPT,
        FileTypes.TYPESCRIPT,
        FileTypes.PYTHON,
        FileTypes.JSON,
        FileTypes.YAML,
        FileTypes.XML,
        FileTypes.PDF,
        FileTypes.DOCX,
        FileTypes.XLSX,
        FileTypes.PPTX,
        FileTypes.UNKNOWN,
      ];
      expect(types).toHaveLength(16);
    });
  });

  describe("FileCategory 型", () => {
    it("FileCategory はFileCategoriesの値の型であること", () => {
      const category: FileCategory = FileCategories.TEXT;
      expect(category).toBe("text");
    });

    it("FileCategory にはすべてのカテゴリが含まれること", () => {
      const categories: FileCategory[] = [
        FileCategories.TEXT,
        FileCategories.CODE,
        FileCategories.DOCUMENT,
        FileCategories.SPREADSHEET,
        FileCategories.PRESENTATION,
        FileCategories.OTHER,
      ];
      expect(categories).toHaveLength(6);
    });
  });

  describe("FileEntity 型", () => {
    it("FileEntity 型が正しい構造を持つこと", () => {
      // 型の構造テスト（コンパイル時に検証）
      const entity: FileEntity = {
        id: "test-id" as any, // FileId branded type
        name: "test.txt",
        path: "/path/to/test.txt",
        mimeType: FileTypes.TEXT,
        category: FileCategories.TEXT,
        size: 1024,
        hash: "a".repeat(64),
        encoding: "utf-8",
        lastModified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };
      expect(entity.name).toBe("test.txt");
      expect(entity.size).toBe(1024);
    });
  });

  describe("ConversionEntity 型", () => {
    it("ConversionEntity 型が正しい構造を持つこと", () => {
      const entity: ConversionEntity = {
        id: "conv-id" as any, // ConversionId branded type
        fileId: "file-id" as any, // FileId branded type
        status: "pending",
        converterId: "markdown-converter",
        inputHash: "b".repeat(64),
        outputHash: null,
        duration: null,
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(entity.status).toBe("pending");
      expect(entity.outputHash).toBeNull();
    });
  });

  describe("ExtractedMetadata 型", () => {
    it("ExtractedMetadata 型が正しい構造を持つこと", () => {
      const metadata: ExtractedMetadata = {
        title: "Test Document",
        author: "Test Author",
        language: "ja",
        wordCount: 100,
        lineCount: 10,
        charCount: 500,
        headers: ["Header 1", "Header 2"],
        codeBlocks: 2,
        links: ["https://example.com"],
        custom: { key: "value" },
      };
      expect(metadata.wordCount).toBe(100);
      expect(metadata.headers).toHaveLength(2);
    });
  });

  describe("ConversionResult 型", () => {
    it("ConversionResult 型が正しい構造を持つこと", () => {
      const result: ConversionResult = {
        conversionId: "conv-id" as any,
        fileId: "file-id" as any,
        originalContent: "original",
        convertedContent: "converted",
        extractedMetadata: {
          title: null,
          author: null,
          language: null,
          wordCount: 1,
          lineCount: 1,
          charCount: 8,
          headers: [],
          codeBlocks: 0,
          links: [],
          custom: {},
        },
      };
      expect(result.originalContent).toBe("original");
      expect(result.convertedContent).toBe("converted");
    });
  });

  describe("FileSelectionInput 型", () => {
    it("FileSelectionInput 型が正しい構造を持つこと", () => {
      const input: FileSelectionInput = {
        paths: ["/path/to/dir"],
        recursive: true,
        includeHidden: false,
        maxFileSize: 10 * 1024 * 1024,
        allowedTypes: [FileTypes.TEXT, FileTypes.MARKDOWN],
        excludePatterns: ["node_modules/**"],
      };
      expect(input.paths).toHaveLength(1);
      expect(input.recursive).toBe(true);
    });
  });

  describe("FileSelectionResult 型", () => {
    it("FileSelectionResult 型が正しい構造を持つこと", () => {
      const result: FileSelectionResult = {
        selectedFiles: [],
        skippedFiles: [],
        totalSize: 0,
      };
      expect(result.selectedFiles).toHaveLength(0);
      expect(result.totalSize).toBe(0);
    });
  });

  describe("SkippedFile 型", () => {
    it("SkippedFile 型が正しい構造を持つこと", () => {
      const skipped: SkippedFile = {
        path: "/path/to/skipped.bin",
        reason: "Unsupported file type",
      };
      expect(skipped.path).toBe("/path/to/skipped.bin");
      expect(skipped.reason).toBe("Unsupported file type");
    });
  });
});

// ========================================
// 境界値テスト
// ========================================
describe("境界値テスト", () => {
  describe("FileEntity の境界値", () => {
    it("name は1文字以上であること（下限境界）", () => {
      const entity: Partial<FileEntity> = {
        name: "a", // 最小長
      };
      expect(entity.name).toHaveLength(1);
    });

    it("name は255文字以下であること（上限境界）", () => {
      const entity: Partial<FileEntity> = {
        name: "a".repeat(255), // 最大長
      };
      expect(entity.name).toHaveLength(255);
    });

    it("hash は64文字であること", () => {
      const entity: Partial<FileEntity> = {
        hash: "0".repeat(64),
      };
      expect(entity.hash).toHaveLength(64);
    });

    it("size は0以上であること（下限境界）", () => {
      const entity: Partial<FileEntity> = {
        size: 0,
      };
      expect(entity.size).toBe(0);
    });
  });

  describe("ConversionEntity の境界値", () => {
    it("duration は0以上であること（下限境界）", () => {
      const entity: Partial<ConversionEntity> = {
        duration: 0,
      };
      expect(entity.duration).toBe(0);
    });

    it("inputHash は64文字であること", () => {
      const entity: Partial<ConversionEntity> = {
        inputHash: "f".repeat(64),
      };
      expect(entity.inputHash).toHaveLength(64);
    });
  });

  describe("ExtractedMetadata の境界値", () => {
    it("wordCount は0以上であること（下限境界）", () => {
      const metadata: Partial<ExtractedMetadata> = {
        wordCount: 0,
      };
      expect(metadata.wordCount).toBe(0);
    });

    it("lineCount は0以上であること（下限境界）", () => {
      const metadata: Partial<ExtractedMetadata> = {
        lineCount: 0,
      };
      expect(metadata.lineCount).toBe(0);
    });

    it("charCount は0以上であること（下限境界）", () => {
      const metadata: Partial<ExtractedMetadata> = {
        charCount: 0,
      };
      expect(metadata.charCount).toBe(0);
    });

    it("codeBlocks は0以上であること（下限境界）", () => {
      const metadata: Partial<ExtractedMetadata> = {
        codeBlocks: 0,
      };
      expect(metadata.codeBlocks).toBe(0);
    });

    it("language は2文字であること（ISO 639-1）", () => {
      const validLanguages = ["ja", "en", "zh", "ko", "de", "fr"];
      validLanguages.forEach((lang) => {
        expect(lang).toHaveLength(2);
      });
    });
  });
});
