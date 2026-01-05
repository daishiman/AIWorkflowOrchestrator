/**
 * ファイル選択Zodスキーマ テスト
 *
 * TDD Red Phase: これらのテストは実装前に作成され、
 * 実装が完了するまで失敗する（Red状態）
 *
 * @see docs/30-workflows/file-selection/step03-type-design.md
 */

import { describe, it, expect } from "vitest";
import {
  // 基本スキーマ
  fileExtensionSchema,
  filePathSchema,
  mimeTypeSchema,
  fileFilterCategorySchema,
  dialogFileFilterSchema,
  // ファイル情報
  selectedFileSchema,
  // IPC通信スキーマ
  openFileDialogRequestSchema,
  openFileDialogResponseSchema,
  getFileMetadataRequestSchema,
  getFileMetadataResponseSchema,
  getMultipleFileMetadataRequestSchema,
  getMultipleFileMetadataResponseSchema,
  validateFilePathRequestSchema,
  validateFilePathResponseSchema,
  // 状態管理スキーマ
  fileSelectionStateSchema,
} from "./file-selection.schema";

// ============================================================
// テスト用ヘルパー
// ============================================================

const createValidSelectedFile = (overrides = {}) => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  path: "/Users/test/documents/sample.pdf",
  name: "sample.pdf",
  extension: ".pdf",
  size: 1024,
  mimeType: "application/pdf",
  lastModified: "2025-01-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

// ============================================================
// fileExtensionSchema テスト
// ============================================================

describe("fileExtensionSchema", () => {
  describe("有効なケース", () => {
    it.each([
      [".pdf", "PDF拡張子"],
      [".docx", "Word拡張子"],
      [".txt", "テキスト拡張子"],
      [".mp3", "音声拡張子"],
      [".json", "JSON拡張子"],
      [".yaml", "YAML拡張子"],
      [".a", "最小長（2文字）"],
      [".abcdefghi", "最大長（10文字）"],
    ])("有効な拡張子: %s (%s)", (ext) => {
      const result = fileExtensionSchema.safeParse(ext);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(ext);
      }
    });
  });

  describe("無効なケース - フォーマット", () => {
    it.each([
      ["pdf", "ドットなし"],
      ["", "空文字"],
      [".pdf.txt", "複数ドット"],
      [".PDF", "大文字のみ許可しない（正規表現次第）"],
    ])("無効な拡張子: %s (%s)", (ext) => {
      const result = fileExtensionSchema.safeParse(ext);
      expect(result.success).toBe(false);
    });

    it("11文字以上はエラー（最大10文字）", () => {
      const result = fileExtensionSchema.safeParse(".abcdefghij");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("10文字");
      }
    });
  });

  describe("無効なケース - 特殊文字", () => {
    it.each([
      [".pdf!", "感嘆符"],
      [".pdf@", "アットマーク"],
      [".pdf/", "スラッシュ"],
      [".pdf\\", "バックスラッシュ"],
      [".pdf<", "小なり記号"],
      [".pdf>", "大なり記号"],
    ])("特殊文字を含む拡張子: %s (%s)", (ext) => {
      const result = fileExtensionSchema.safeParse(ext);
      expect(result.success).toBe(false);
    });
  });

  describe("無効な型", () => {
    it.each([null, undefined, 123, {}, []])("無効な型: %s", (value) => {
      const result = fileExtensionSchema.safeParse(value);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// filePathSchema テスト
// ============================================================

describe("filePathSchema", () => {
  describe("有効なケース", () => {
    it.each([
      ["/Users/test/file.pdf", "Unix絶対パス"],
      ["C:\\Users\\test\\file.pdf", "Windows絶対パス"],
      ["/path/to/very/deep/nested/file.txt", "深いネスト"],
      ["/ファイル.pdf", "日本語ファイル名"],
      ["/path with spaces/file.pdf", "スペース含む"],
      ["/a.txt", "短いパス"],
    ])("有効なパス: %s (%s)", (path) => {
      const result = filePathSchema.safeParse(path);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なケース - 必須・長さ", () => {
    it("空文字はエラー", () => {
      const result = filePathSchema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("必須");
      }
    });

    it("1001文字以上はエラー（最大1000文字）", () => {
      const longPath = "/" + "a".repeat(1000);
      const result = filePathSchema.safeParse(longPath);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("1000文字");
      }
    });
  });

  describe("無効なケース - セキュリティ（パストラバーサル）", () => {
    it.each([
      ["../etc/passwd", "相対パストラバーサル"],
      ["/path/../etc/passwd", "中間トラバーサル"],
      ["..\\windows\\system32", "Windowsトラバーサル"],
      ["/path/to/..\\file", "混合トラバーサル"],
    ])("パストラバーサルを拒否: %s (%s)", (path) => {
      const result = filePathSchema.safeParse(path);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "ディレクトリトラバーサル",
        );
      }
    });
  });

  describe("無効な型", () => {
    it.each([null, undefined, 123, {}, []])("無効な型: %s", (value) => {
      const result = filePathSchema.safeParse(value);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// mimeTypeSchema テスト
// ============================================================

describe("mimeTypeSchema", () => {
  describe("有効なケース", () => {
    it.each([
      ["application/pdf", "PDF"],
      ["text/plain", "プレーンテキスト"],
      ["image/png", "PNG画像"],
      ["audio/mpeg", "MP3"],
      ["video/mp4", "MP4動画"],
      [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Word DOCX",
      ],
      ["application/x-yaml", "YAML"],
      ["image/svg+xml", "SVG"],
    ])("有効なMIMEタイプ: %s (%s)", (mime) => {
      const result = mimeTypeSchema.safeParse(mime);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なケース", () => {
    it.each([
      ["pdf", "タイプのみ"],
      ["application", "サブタイプなし"],
      ["application/", "サブタイプ空"],
      ["/pdf", "タイプなし"],
      ["", "空文字"],
      ["application pdf", "スラッシュなし"],
    ])("無効なMIMEタイプ: %s (%s)", (mime) => {
      const result = mimeTypeSchema.safeParse(mime);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// fileFilterCategorySchema テスト
// ============================================================

describe("fileFilterCategorySchema", () => {
  describe("有効なケース", () => {
    it.each(["all", "office", "text", "media", "image"] as const)(
      "有効なカテゴリ: %s",
      (category) => {
        const result = fileFilterCategorySchema.safeParse(category);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(category);
        }
      },
    );
  });

  describe("無効なケース", () => {
    it.each([
      ["video", "未定義カテゴリ"],
      ["ALL", "大文字"],
      ["", "空文字"],
      ["document", "未定義カテゴリ"],
    ])("無効なカテゴリ: %s (%s)", (category) => {
      const result = fileFilterCategorySchema.safeParse(category);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// dialogFileFilterSchema テスト
// ============================================================

describe("dialogFileFilterSchema", () => {
  describe("有効なケース", () => {
    it("正常なフィルター定義", () => {
      const result = dialogFileFilterSchema.safeParse({
        name: "PDFファイル",
        extensions: ["pdf"],
      });
      expect(result.success).toBe(true);
    });

    it("複数拡張子", () => {
      const result = dialogFileFilterSchema.safeParse({
        name: "オフィス文書",
        extensions: ["pdf", "docx", "xlsx", "pptx"],
      });
      expect(result.success).toBe(true);
    });

    it("最大20個の拡張子", () => {
      const extensions = Array.from({ length: 20 }, (_, i) => `ext${i}`);
      const result = dialogFileFilterSchema.safeParse({
        name: "多数の拡張子",
        extensions,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("無効なケース", () => {
    it("名前が51文字以上はエラー", () => {
      const result = dialogFileFilterSchema.safeParse({
        name: "a".repeat(51),
        extensions: ["pdf"],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("50文字");
      }
    });

    it("拡張子が21個以上はエラー", () => {
      const extensions = Array.from({ length: 21 }, (_, i) => `ext${i}`);
      const result = dialogFileFilterSchema.safeParse({
        name: "テスト",
        extensions,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("20個");
      }
    });

    it("必須フィールドがない", () => {
      const result = dialogFileFilterSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// selectedFileSchema テスト
// ============================================================

describe("selectedFileSchema", () => {
  describe("有効なケース", () => {
    it("全フィールドが正常なファイル情報", () => {
      const validFile = createValidSelectedFile();
      const result = selectedFileSchema.safeParse(validFile);
      expect(result.success).toBe(true);
    });

    it("大きなファイルサイズ", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ size: 1024 * 1024 * 1024 * 10 }), // 10GB
      );
      expect(result.success).toBe(true);
    });

    it("サイズ0のファイル", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ size: 0 }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe("無効なケース - ID", () => {
    it("不正なUUID形式", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ id: "not-a-uuid" }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("ID");
      }
    });
  });

  describe("無効なケース - パス", () => {
    it("パストラバーサル", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ path: "../etc/passwd" }),
      );
      expect(result.success).toBe(false);
    });

    it("空パス", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ path: "" }),
      );
      expect(result.success).toBe(false);
    });
  });

  describe("無効なケース - 名前", () => {
    it("空の名前", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ name: "" }),
      );
      expect(result.success).toBe(false);
    });

    it("256文字以上の名前", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ name: "a".repeat(256) }),
      );
      expect(result.success).toBe(false);
    });
  });

  describe("無効なケース - サイズ", () => {
    it("負のサイズ", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ size: -1 }),
      );
      expect(result.success).toBe(false);
    });

    it("小数のサイズ", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ size: 1.5 }),
      );
      expect(result.success).toBe(false);
    });
  });

  describe("無効なケース - 日時", () => {
    it("不正なISO日時フォーマット", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ lastModified: "2025-01-01" }),
      );
      expect(result.success).toBe(false);
    });

    it("空の日時", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ createdAt: "" }),
      );
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// openFileDialogRequestSchema テスト
// ============================================================

describe("openFileDialogRequestSchema", () => {
  describe("有効なケース", () => {
    it("デフォルト値のみ", () => {
      const result = openFileDialogRequestSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("全オプション指定", () => {
      const result = openFileDialogRequestSchema.safeParse({
        title: "ファイルを選択",
        multiSelections: false,
        filterCategory: "office",
        customFilters: [{ name: "PDF", extensions: ["pdf"] }],
        defaultPath: "/Users/test",
      });
      expect(result.success).toBe(true);
    });

    it("multiSelectionsのデフォルト値がtrue", () => {
      const result = openFileDialogRequestSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.multiSelections).toBe(true);
      }
    });
  });

  describe("無効なケース", () => {
    it("タイトルが101文字以上はエラー", () => {
      const result = openFileDialogRequestSchema.safeParse({
        title: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("不正なfilterCategory", () => {
      const result = openFileDialogRequestSchema.safeParse({
        filterCategory: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("customFiltersが11個以上はエラー", () => {
      const customFilters = Array.from({ length: 11 }, (_, i) => ({
        name: `Filter ${i}`,
        extensions: ["txt"],
      }));
      const result = openFileDialogRequestSchema.safeParse({ customFilters });
      expect(result.success).toBe(false);
    });

    it("パストラバーサルを含むdefaultPath", () => {
      const result = openFileDialogRequestSchema.safeParse({
        defaultPath: "../etc",
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// openFileDialogResponseSchema テスト
// ============================================================

describe("openFileDialogResponseSchema", () => {
  describe("成功レスポンス", () => {
    it("ファイル選択成功", () => {
      const result = openFileDialogResponseSchema.safeParse({
        success: true,
        data: {
          canceled: false,
          filePaths: ["/path/to/file.pdf"],
        },
      });
      expect(result.success).toBe(true);
    });

    it("キャンセル", () => {
      const result = openFileDialogResponseSchema.safeParse({
        success: true,
        data: {
          canceled: true,
          filePaths: [],
        },
      });
      expect(result.success).toBe(true);
    });

    it("複数ファイル選択", () => {
      const result = openFileDialogResponseSchema.safeParse({
        success: true,
        data: {
          canceled: false,
          filePaths: ["/path/to/file1.pdf", "/path/to/file2.pdf"],
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("失敗レスポンス", () => {
    it("エラーメッセージ付き", () => {
      const result = openFileDialogResponseSchema.safeParse({
        success: false,
        error: "ダイアログを開けませんでした",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("無効なケース", () => {
    it("successがtrueでdataがない", () => {
      const result = openFileDialogResponseSchema.safeParse({
        success: true,
      });
      expect(result.success).toBe(false);
    });

    it("パストラバーサルを含むfilePath", () => {
      const result = openFileDialogResponseSchema.safeParse({
        success: true,
        data: {
          canceled: false,
          filePaths: ["../etc/passwd"],
        },
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// getFileMetadataRequestSchema テスト
// ============================================================

describe("getFileMetadataRequestSchema", () => {
  describe("有効なケース", () => {
    it("正常なファイルパス", () => {
      const result = getFileMetadataRequestSchema.safeParse({
        filePath: "/path/to/file.pdf",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("無効なケース", () => {
    it("filePathが必須", () => {
      const result = getFileMetadataRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("パストラバーサル", () => {
      const result = getFileMetadataRequestSchema.safeParse({
        filePath: "../etc/passwd",
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// getFileMetadataResponseSchema テスト
// ============================================================

describe("getFileMetadataResponseSchema", () => {
  describe("成功レスポンス", () => {
    it("正常なファイルメタデータ", () => {
      const result = getFileMetadataResponseSchema.safeParse({
        success: true,
        data: createValidSelectedFile(),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("失敗レスポンス", () => {
    it("エラーメッセージ付き", () => {
      const result = getFileMetadataResponseSchema.safeParse({
        success: false,
        error: "ファイルが見つかりません",
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================
// getMultipleFileMetadataRequestSchema テスト
// ============================================================

describe("getMultipleFileMetadataRequestSchema", () => {
  describe("有効なケース", () => {
    it("単一ファイル", () => {
      const result = getMultipleFileMetadataRequestSchema.safeParse({
        filePaths: ["/path/to/file.pdf"],
      });
      expect(result.success).toBe(true);
    });

    it("最大100ファイル", () => {
      const filePaths = Array.from(
        { length: 100 },
        (_, i) => `/path/file${i}.pdf`,
      );
      const result = getMultipleFileMetadataRequestSchema.safeParse({
        filePaths,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("無効なケース", () => {
    it("101ファイル以上はエラー", () => {
      const filePaths = Array.from(
        { length: 101 },
        (_, i) => `/path/file${i}.pdf`,
      );
      const result = getMultipleFileMetadataRequestSchema.safeParse({
        filePaths,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("100件");
      }
    });

    it("パストラバーサルを含むファイルも基本バリデーションはパス（ハンドラ側でチェック）", () => {
      // パストラバーサルチェックはIPCハンドラ側で個別に実施
      // スキーマレベルでは基本的なパスフォーマットのみチェック
      const result = getMultipleFileMetadataRequestSchema.safeParse({
        filePaths: ["/valid/path.pdf", "../etc/passwd"],
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================
// getMultipleFileMetadataResponseSchema テスト
// ============================================================

describe("getMultipleFileMetadataResponseSchema", () => {
  describe("成功レスポンス", () => {
    it("全ファイル成功", () => {
      const result = getMultipleFileMetadataResponseSchema.safeParse({
        success: true,
        data: {
          files: [createValidSelectedFile()],
          errors: [],
        },
      });
      expect(result.success).toBe(true);
    });

    it("部分的成功", () => {
      const result = getMultipleFileMetadataResponseSchema.safeParse({
        success: true,
        data: {
          files: [createValidSelectedFile()],
          errors: [
            {
              filePath: "/path/to/missing.pdf",
              error: "ファイルが見つかりません",
            },
          ],
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("失敗レスポンス", () => {
    it("エラーメッセージ付き", () => {
      const result = getMultipleFileMetadataResponseSchema.safeParse({
        success: false,
        error: "メタデータ取得に失敗しました",
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================
// validateFilePathRequestSchema テスト
// ============================================================

describe("validateFilePathRequestSchema", () => {
  describe("有効なケース", () => {
    it("正常なファイルパス", () => {
      const result = validateFilePathRequestSchema.safeParse({
        filePath: "/path/to/file.pdf",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("基本バリデーション", () => {
    it("パストラバーサルを含むパスも基本バリデーションはパス（ハンドラ側でチェック）", () => {
      // パストラバーサルチェックはIPCハンドラ側で実施
      // スキーマレベルでは基本的なパスフォーマットのみチェック
      const result = validateFilePathRequestSchema.safeParse({
        filePath: "../etc/passwd",
      });
      expect(result.success).toBe(true);
    });

    it("空のパスは拒否", () => {
      const result = validateFilePathRequestSchema.safeParse({
        filePath: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// validateFilePathResponseSchema テスト
// ============================================================

describe("validateFilePathResponseSchema", () => {
  describe("成功レスポンス", () => {
    it("有効なパス", () => {
      const result = validateFilePathResponseSchema.safeParse({
        success: true,
        data: {
          valid: true,
          exists: true,
          isFile: true,
          isDirectory: false,
        },
      });
      expect(result.success).toBe(true);
    });

    it("無効なパス", () => {
      const result = validateFilePathResponseSchema.safeParse({
        success: true,
        data: {
          valid: false,
          error: "パストラバーサルが検出されました",
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("失敗レスポンス", () => {
    it("エラーメッセージ付き", () => {
      const result = validateFilePathResponseSchema.safeParse({
        success: false,
        error: "検証に失敗しました",
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================
// fileSelectionStateSchema テスト
// ============================================================

describe("fileSelectionStateSchema", () => {
  describe("有効なケース", () => {
    it("初期状態", () => {
      const result = fileSelectionStateSchema.safeParse({
        files: [],
        filterCategory: "all",
        isDragging: false,
        isLoading: false,
        error: null,
      });
      expect(result.success).toBe(true);
    });

    it("ファイル選択済み状態", () => {
      const result = fileSelectionStateSchema.safeParse({
        files: [createValidSelectedFile()],
        filterCategory: "office",
        isDragging: false,
        isLoading: false,
        error: null,
      });
      expect(result.success).toBe(true);
    });

    it("エラー状態", () => {
      const result = fileSelectionStateSchema.safeParse({
        files: [],
        filterCategory: "all",
        isDragging: false,
        isLoading: false,
        error: "ファイル選択に失敗しました",
      });
      expect(result.success).toBe(true);
    });

    it("ドラッグ中状態", () => {
      const result = fileSelectionStateSchema.safeParse({
        files: [],
        filterCategory: "all",
        isDragging: true,
        isLoading: false,
        error: null,
      });
      expect(result.success).toBe(true);
    });

    it("ローディング状態", () => {
      const result = fileSelectionStateSchema.safeParse({
        files: [],
        filterCategory: "all",
        isDragging: false,
        isLoading: true,
        error: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("無効なケース", () => {
    it("必須フィールドがない", () => {
      const result = fileSelectionStateSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("不正なfilterCategory", () => {
      const result = fileSelectionStateSchema.safeParse({
        files: [],
        filterCategory: "invalid",
        isDragging: false,
        isLoading: false,
        error: null,
      });
      expect(result.success).toBe(false);
    });

    it("filesに無効なファイル情報", () => {
      const result = fileSelectionStateSchema.safeParse({
        files: [{ id: "invalid-id" }],
        filterCategory: "all",
        isDragging: false,
        isLoading: false,
        error: null,
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// セキュリティテスト
// ============================================================

describe("セキュリティ要件", () => {
  describe("パストラバーサル防御", () => {
    it.each([
      ["../", "相対パス上昇"],
      ["..\\", "Windows相対パス上昇"],
      ["/path/../etc", "中間パストラバーサル"],
      ["C:\\path\\..\\system32", "Windows中間トラバーサル"],
    ])("パストラバーサルをブロック: %s (%s)", (path) => {
      const result = filePathSchema.safeParse(path);
      expect(result.success).toBe(false);
    });
  });

  describe("入力長制限", () => {
    it("filePathSchemaの最大長", () => {
      const longPath = "/" + "a".repeat(1001);
      const result = filePathSchema.safeParse(longPath);
      expect(result.success).toBe(false);
    });

    it("fileExtensionSchemaの最大長", () => {
      // 10文字（.abcdefghi）は有効
      const longExt = "." + "a".repeat(9);
      const validResult = fileExtensionSchema.safeParse(longExt);
      expect(validResult.success).toBe(true);

      // 11文字（.abcdefghij）は無効
      const tooLongExt = "." + "a".repeat(10);
      const invalidResult = fileExtensionSchema.safeParse(tooLongExt);
      expect(invalidResult.success).toBe(false);
    });
  });
});

// ============================================================
// 境界値テスト
// ============================================================

describe("境界値テスト", () => {
  describe("filePathSchema", () => {
    it("最小長（1文字）", () => {
      const result = filePathSchema.safeParse("/");
      expect(result.success).toBe(true);
    });

    it("最大長（1000文字）", () => {
      const path = "/" + "a".repeat(999);
      const result = filePathSchema.safeParse(path);
      expect(result.success).toBe(true);
    });

    it("最大長+1（1001文字）", () => {
      const path = "/" + "a".repeat(1000);
      const result = filePathSchema.safeParse(path);
      expect(result.success).toBe(false);
    });
  });

  describe("selectedFileSchema", () => {
    it("サイズ0", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ size: 0 }),
      );
      expect(result.success).toBe(true);
    });

    it("サイズNumber.MAX_SAFE_INTEGER", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ size: Number.MAX_SAFE_INTEGER }),
      );
      expect(result.success).toBe(true);
    });

    it("名前最小長（1文字）", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ name: "a" }),
      );
      expect(result.success).toBe(true);
    });

    it("名前最大長（255文字）", () => {
      const result = selectedFileSchema.safeParse(
        createValidSelectedFile({ name: "a".repeat(255) }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe("getMultipleFileMetadataRequestSchema", () => {
    it("ファイル0件", () => {
      const result = getMultipleFileMetadataRequestSchema.safeParse({
        filePaths: [],
      });
      expect(result.success).toBe(true);
    });

    it("ファイル100件", () => {
      const filePaths = Array.from(
        { length: 100 },
        (_, i) => `/path/file${i}.pdf`,
      );
      const result = getMultipleFileMetadataRequestSchema.safeParse({
        filePaths,
      });
      expect(result.success).toBe(true);
    });

    it("ファイル101件", () => {
      const filePaths = Array.from(
        { length: 101 },
        (_, i) => `/path/file${i}.pdf`,
      );
      const result = getMultipleFileMetadataRequestSchema.safeParse({
        filePaths,
      });
      expect(result.success).toBe(false);
    });
  });
});
