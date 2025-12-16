/**
 * T-03-2: schemas.ts Zodスキーマテスト
 *
 * @description TDD Red Phase - schemas.ts のZodスキーマに対するテスト
 * @see docs/30-workflows/file-conversion-schemas/task-step01-schema-design.md
 */

import { describe, it, expect } from "vitest";

// ========================================
// テスト対象のインポート（実装前なのでエラーになる）
// ========================================
import {
  // 列挙型スキーマ
  fileTypeSchema,
  fileCategorySchema,
  // エンティティスキーマ
  fileEntitySchema,
  conversionEntitySchema,
  conversionEntityWithValidationSchema,
  // 値オブジェクトスキーマ
  extractedMetadataSchema,
  conversionResultSchema,
  // 入出力スキーマ
  fileSelectionInputSchema,
  fileSelectionResultSchema,
  skippedFileSchema,
  // パーシャルスキーマ
  partialFileEntitySchema,
  partialConversionEntitySchema,
  // 作成用スキーマ
  createFileEntitySchema,
  createConversionEntitySchema,
} from "../schemas";

// ========================================
// テストデータファクトリー
// ========================================
const createValidFileEntity = () => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "test-file.txt",
  path: "/path/to/test-file.txt",
  mimeType: "text/plain",
  category: "text",
  size: 1024,
  hash: "a".repeat(64),
  encoding: "utf-8",
  lastModified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
});

const createValidConversionEntity = () => ({
  id: "550e8400-e29b-41d4-a716-446655440001",
  fileId: "550e8400-e29b-41d4-a716-446655440000",
  status: "pending" as const,
  converterId: "markdown-converter",
  inputHash: "b".repeat(64),
  outputHash: null,
  duration: null,
  error: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createValidExtractedMetadata = () => ({
  title: "Test Document",
  author: "Test Author",
  language: "ja",
  wordCount: 100,
  lineCount: 10,
  charCount: 500,
  headers: ["Header 1", "Header 2"],
  codeBlocks: 2,
  links: ["https://example.com"],
  custom: {},
});

// ========================================
// fileTypeSchema テスト
// ========================================
describe("fileTypeSchema", () => {
  describe("正常系", () => {
    it("text/plain を受け入れること", () => {
      const result = fileTypeSchema.safeParse("text/plain");
      expect(result.success).toBe(true);
    });

    it("text/markdown を受け入れること", () => {
      const result = fileTypeSchema.safeParse("text/markdown");
      expect(result.success).toBe(true);
    });

    it("application/pdf を受け入れること", () => {
      const result = fileTypeSchema.safeParse("application/pdf");
      expect(result.success).toBe(true);
    });

    it("application/json を受け入れること", () => {
      const result = fileTypeSchema.safeParse("application/json");
      expect(result.success).toBe(true);
    });

    it("application/octet-stream を受け入れること", () => {
      const result = fileTypeSchema.safeParse("application/octet-stream");
      expect(result.success).toBe(true);
    });

    it("全16種類のMIMEタイプを受け入れること", () => {
      const validTypes = [
        "text/plain",
        "text/markdown",
        "text/html",
        "text/csv",
        "text/tab-separated-values",
        "text/javascript",
        "text/typescript",
        "application/x-python",
        "application/json",
        "application/x-yaml",
        "application/xml",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/octet-stream",
      ];

      validTypes.forEach((type) => {
        const result = fileTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("異常系", () => {
    it("未定義のMIMEタイプを拒否すること", () => {
      const result = fileTypeSchema.safeParse("invalid/type");
      expect(result.success).toBe(false);
    });

    it("空文字列を拒否すること", () => {
      const result = fileTypeSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("nullを拒否すること", () => {
      const result = fileTypeSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("数値を拒否すること", () => {
      const result = fileTypeSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it("エラーメッセージが適切であること", () => {
      const result = fileTypeSchema.safeParse("invalid/type");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "無効なファイルタイプ",
        );
      }
    });
  });
});

// ========================================
// fileCategorySchema テスト
// ========================================
describe("fileCategorySchema", () => {
  describe("正常系", () => {
    it("text を受け入れること", () => {
      const result = fileCategorySchema.safeParse("text");
      expect(result.success).toBe(true);
    });

    it("code を受け入れること", () => {
      const result = fileCategorySchema.safeParse("code");
      expect(result.success).toBe(true);
    });

    it("document を受け入れること", () => {
      const result = fileCategorySchema.safeParse("document");
      expect(result.success).toBe(true);
    });

    it("spreadsheet を受け入れること", () => {
      const result = fileCategorySchema.safeParse("spreadsheet");
      expect(result.success).toBe(true);
    });

    it("presentation を受け入れること", () => {
      const result = fileCategorySchema.safeParse("presentation");
      expect(result.success).toBe(true);
    });

    it("other を受け入れること", () => {
      const result = fileCategorySchema.safeParse("other");
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("未定義のカテゴリを拒否すること", () => {
      const result = fileCategorySchema.safeParse("invalid");
      expect(result.success).toBe(false);
    });

    it("エラーメッセージが適切であること", () => {
      const result = fileCategorySchema.safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "無効なファイルカテゴリ",
        );
      }
    });
  });
});

// ========================================
// fileEntitySchema テスト
// ========================================
describe("fileEntitySchema", () => {
  describe("正常系", () => {
    it("有効なファイルエンティティを受け入れること", () => {
      const validEntity = createValidFileEntity();
      const result = fileEntitySchema.safeParse(validEntity);
      expect(result.success).toBe(true);
    });

    it("metadataに任意のキー・値を含められること", () => {
      const entity = {
        ...createValidFileEntity(),
        metadata: { customKey: "customValue", nested: { key: 123 } },
      };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系 - name フィールド", () => {
    it("空のname を拒否すること", () => {
      const entity = { ...createValidFileEntity(), name: "" };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("256文字以上のnameを拒否すること", () => {
      const entity = { ...createValidFileEntity(), name: "a".repeat(256) };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - path フィールド", () => {
    it("空のpathを拒否すること", () => {
      const entity = { ...createValidFileEntity(), path: "" };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - size フィールド", () => {
    it("負のsizeを拒否すること", () => {
      const entity = { ...createValidFileEntity(), size: -1 };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("10MBを超えるsizeを拒否すること", () => {
      const entity = { ...createValidFileEntity(), size: 10 * 1024 * 1024 + 1 };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("小数のsizeを拒否すること", () => {
      const entity = { ...createValidFileEntity(), size: 1.5 };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - hash フィールド", () => {
    it("63文字のhashを拒否すること", () => {
      const entity = { ...createValidFileEntity(), hash: "a".repeat(63) };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("65文字のhashを拒否すること", () => {
      const entity = { ...createValidFileEntity(), hash: "a".repeat(65) };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("大文字を含むhashを拒否すること", () => {
      const entity = { ...createValidFileEntity(), hash: "A".repeat(64) };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("16進数以外の文字を含むhashを拒否すること", () => {
      const entity = { ...createValidFileEntity(), hash: "g".repeat(64) };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - id フィールド", () => {
    it("無効なUUID形式を拒否すること", () => {
      const entity = { ...createValidFileEntity(), id: "invalid-uuid" };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト", () => {
    it("name が1文字（下限境界）で受け入れられること", () => {
      const entity = { ...createValidFileEntity(), name: "a" };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("name が255文字（上限境界）で受け入れられること", () => {
      const entity = { ...createValidFileEntity(), name: "a".repeat(255) };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("size が0（下限境界）で受け入れられること", () => {
      const entity = { ...createValidFileEntity(), size: 0 };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("size が10MB（上限境界）で受け入れられること", () => {
      const entity = { ...createValidFileEntity(), size: 10 * 1024 * 1024 };
      const result = fileEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });
  });
});

// ========================================
// conversionEntitySchema テスト
// ========================================
describe("conversionEntitySchema", () => {
  describe("正常系", () => {
    it("有効な変換エンティティを受け入れること", () => {
      const entity = createValidConversionEntity();
      const result = conversionEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("pending 状態を受け入れること", () => {
      const entity = { ...createValidConversionEntity(), status: "pending" };
      const result = conversionEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("processing 状態を受け入れること", () => {
      const entity = { ...createValidConversionEntity(), status: "processing" };
      const result = conversionEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("completed 状態（outputHash, duration付き）を受け入れること", () => {
      const entity = {
        ...createValidConversionEntity(),
        status: "completed",
        outputHash: "c".repeat(64),
        duration: 1000,
      };
      const result = conversionEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("failed 状態（error付き）を受け入れること", () => {
      const entity = {
        ...createValidConversionEntity(),
        status: "failed",
        error: "Conversion failed",
      };
      const result = conversionEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("無効なstatusを拒否すること", () => {
      const entity = { ...createValidConversionEntity(), status: "invalid" };
      const result = conversionEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("負のdurationを拒否すること", () => {
      const entity = { ...createValidConversionEntity(), duration: -1 };
      const result = conversionEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });
});

// ========================================
// conversionEntityWithValidationSchema テスト
// ========================================
describe("conversionEntityWithValidationSchema", () => {
  describe("ビジネスルール検証", () => {
    it("completed 状態で outputHash がnullの場合を拒否すること", () => {
      const entity = {
        ...createValidConversionEntity(),
        status: "completed",
        outputHash: null,
        duration: 1000,
      };
      const result = conversionEntityWithValidationSchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("completed 状態で duration がnullの場合を拒否すること", () => {
      const entity = {
        ...createValidConversionEntity(),
        status: "completed",
        outputHash: "c".repeat(64),
        duration: null,
      };
      const result = conversionEntityWithValidationSchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("failed 状態で error がnullの場合を拒否すること", () => {
      const entity = {
        ...createValidConversionEntity(),
        status: "failed",
        error: null,
      };
      const result = conversionEntityWithValidationSchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("completed 状態で outputHash と duration が設定されている場合を受け入れること", () => {
      const entity = {
        ...createValidConversionEntity(),
        status: "completed",
        outputHash: "c".repeat(64),
        duration: 1000,
      };
      const result = conversionEntityWithValidationSchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("failed 状態で error が設定されている場合を受け入れること", () => {
      const entity = {
        ...createValidConversionEntity(),
        status: "failed",
        error: "Conversion failed",
      };
      const result = conversionEntityWithValidationSchema.safeParse(entity);
      expect(result.success).toBe(true);
    });
  });
});

// ========================================
// extractedMetadataSchema テスト
// ========================================
describe("extractedMetadataSchema", () => {
  describe("正常系", () => {
    it("有効なメタデータを受け入れること", () => {
      const metadata = createValidExtractedMetadata();
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });

    it("nullableフィールドがnullの場合を受け入れること", () => {
      const metadata = {
        ...createValidExtractedMetadata(),
        title: null,
        author: null,
        language: null,
      };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });

    it("空の配列フィールドを受け入れること", () => {
      const metadata = {
        ...createValidExtractedMetadata(),
        headers: [],
        links: [],
      };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系 - language フィールド", () => {
    it("1文字の言語コードを拒否すること", () => {
      const metadata = { ...createValidExtractedMetadata(), language: "j" };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it("3文字の言語コードを拒否すること", () => {
      const metadata = { ...createValidExtractedMetadata(), language: "jpn" };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it("大文字の言語コードを拒否すること", () => {
      const metadata = { ...createValidExtractedMetadata(), language: "JA" };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - 数値フィールド", () => {
    it("負のwordCountを拒否すること", () => {
      const metadata = { ...createValidExtractedMetadata(), wordCount: -1 };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it("負のlineCountを拒否すること", () => {
      const metadata = { ...createValidExtractedMetadata(), lineCount: -1 };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it("小数のwordCountを拒否すること", () => {
      const metadata = { ...createValidExtractedMetadata(), wordCount: 1.5 };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - links フィールド", () => {
    it("無効なURLを拒否すること", () => {
      const metadata = {
        ...createValidExtractedMetadata(),
        links: ["not-a-valid-url"],
      };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト", () => {
    it("title が500文字（上限境界）で受け入れられること", () => {
      const metadata = {
        ...createValidExtractedMetadata(),
        title: "a".repeat(500),
      };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });

    it("title が501文字で拒否されること", () => {
      const metadata = {
        ...createValidExtractedMetadata(),
        title: "a".repeat(501),
      };
      const result = extractedMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });
  });
});

// ========================================
// fileSelectionInputSchema テスト
// ========================================
describe("fileSelectionInputSchema", () => {
  describe("正常系", () => {
    it("有効な入力を受け入れること", () => {
      const input = {
        paths: ["/path/to/dir"],
        recursive: true,
        includeHidden: false,
        maxFileSize: 1024,
        excludePatterns: [],
      };
      const result = fileSelectionInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("allowedTypesがオプショナルであること", () => {
      const input = {
        paths: ["/path/to/dir"],
        recursive: false,
        includeHidden: false,
        maxFileSize: 1024,
        excludePatterns: [],
      };
      const result = fileSelectionInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("デフォルト値が適用されること", () => {
      const input = {
        paths: ["/path/to/dir"],
      };
      const result = fileSelectionInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.recursive).toBe(false);
        expect(result.data.includeHidden).toBe(false);
        expect(result.data.maxFileSize).toBe(10 * 1024 * 1024);
        expect(result.data.excludePatterns).toEqual([]);
      }
    });
  });

  describe("異常系", () => {
    it("空のpaths配列を拒否すること", () => {
      const input = {
        paths: [],
        recursive: false,
        includeHidden: false,
        maxFileSize: 1024,
        excludePatterns: [],
      };
      const result = fileSelectionInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("空文字列のpathを拒否すること", () => {
      const input = {
        paths: [""],
        recursive: false,
        includeHidden: false,
        maxFileSize: 1024,
        excludePatterns: [],
      };
      const result = fileSelectionInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("負のmaxFileSizeを拒否すること", () => {
      const input = {
        paths: ["/path"],
        maxFileSize: -1,
      };
      const result = fileSelectionInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("0のmaxFileSizeを拒否すること", () => {
      const input = {
        paths: ["/path"],
        maxFileSize: 0,
      };
      const result = fileSelectionInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

// ========================================
// skippedFileSchema テスト
// ========================================
describe("skippedFileSchema", () => {
  describe("正常系", () => {
    it("有効なスキップファイル情報を受け入れること", () => {
      const skipped = {
        path: "/path/to/skipped.bin",
        reason: "Unsupported file type",
      };
      const result = skippedFileSchema.safeParse(skipped);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("空のpathを拒否すること", () => {
      const skipped = {
        path: "",
        reason: "Some reason",
      };
      const result = skippedFileSchema.safeParse(skipped);
      expect(result.success).toBe(false);
    });

    it("空のreasonを拒否すること", () => {
      const skipped = {
        path: "/path/to/file",
        reason: "",
      };
      const result = skippedFileSchema.safeParse(skipped);
      expect(result.success).toBe(false);
    });
  });
});

// ========================================
// fileSelectionResultSchema テスト
// ========================================
describe("fileSelectionResultSchema", () => {
  describe("正常系", () => {
    it("有効な結果を受け入れること", () => {
      const result = fileSelectionResultSchema.safeParse({
        selectedFiles: [],
        skippedFiles: [],
        totalSize: 0,
      });
      expect(result.success).toBe(true);
    });

    it("ファイルを含む結果を受け入れること", () => {
      const result = fileSelectionResultSchema.safeParse({
        selectedFiles: [createValidFileEntity()],
        skippedFiles: [{ path: "/skipped", reason: "Too large" }],
        totalSize: 1024,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("負のtotalSizeを拒否すること", () => {
      const result = fileSelectionResultSchema.safeParse({
        selectedFiles: [],
        skippedFiles: [],
        totalSize: -1,
      });
      expect(result.success).toBe(false);
    });
  });
});

// ========================================
// パーシャルスキーマテスト
// ========================================
describe("partialFileEntitySchema", () => {
  it("部分的なデータを受け入れること", () => {
    const result = partialFileEntitySchema.safeParse({
      name: "updated-name.txt",
    });
    expect(result.success).toBe(true);
  });

  it("idフィールドが除外されていること", () => {
    const result = partialFileEntitySchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    // id is omitted, so it should be ignored or cause an error
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).id).toBeUndefined();
    }
  });
});

describe("partialConversionEntitySchema", () => {
  it("部分的なデータを受け入れること", () => {
    const result = partialConversionEntitySchema.safeParse({
      status: "completed",
    });
    expect(result.success).toBe(true);
  });
});

// ========================================
// 作成用スキーマテスト
// ========================================
describe("createFileEntitySchema", () => {
  it("id, createdAt, updatedAt なしのデータを受け入れること", () => {
    const data = {
      name: "new-file.txt",
      path: "/path/to/new-file.txt",
      mimeType: "text/plain",
      category: "text",
      size: 512,
      hash: "d".repeat(64),
      encoding: "utf-8",
      lastModified: new Date(),
      metadata: {},
    };
    const result = createFileEntitySchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe("createConversionEntitySchema", () => {
  it("初期状態のデータを受け入れること", () => {
    const data = {
      fileId: "550e8400-e29b-41d4-a716-446655440000",
      converterId: "markdown-converter",
      inputHash: "e".repeat(64),
    };
    const result = createConversionEntitySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("pending");
    }
  });
});

// ========================================
// conversionResultSchema テスト
// ========================================
describe("conversionResultSchema", () => {
  describe("正常系", () => {
    it("有効な変換結果を受け入れること", () => {
      const result = conversionResultSchema.safeParse({
        conversionId: "550e8400-e29b-41d4-a716-446655440001",
        fileId: "550e8400-e29b-41d4-a716-446655440000",
        originalContent: "# Original Content",
        convertedContent: "Converted Content",
        extractedMetadata: createValidExtractedMetadata(),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("無効なconversionIdを拒否すること", () => {
      const result = conversionResultSchema.safeParse({
        conversionId: "invalid-uuid",
        fileId: "550e8400-e29b-41d4-a716-446655440000",
        originalContent: "content",
        convertedContent: "content",
        extractedMetadata: createValidExtractedMetadata(),
      });
      expect(result.success).toBe(false);
    });
  });
});
