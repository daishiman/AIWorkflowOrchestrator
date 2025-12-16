/**
 * T-03-3: utils.ts ユーティリティ関数テスト
 *
 * @description TDD Red Phase - utils.ts のユーティリティ関数に対するテスト
 * @see docs/30-workflows/file-conversion-schemas/task-step01-utils-design.md
 */

import { describe, it, expect } from "vitest";

// ========================================
// テスト対象のインポート（実装前なのでエラーになる）
// ========================================
import {
  // ファイルタイプ関連
  getFileTypeFromExtension,
  getFileTypeFromPath,
  getFileCategoryFromType,
  // ハッシュ関連
  calculateFileHash,
  calculateFileHashSync,
  // ファイルサイズ関連
  formatFileSize,
  parseFileSize,
  // バリデーション関連
  isValidFileExtension,
  isValidHash,
  validateFileSize,
  // ファイル名関連
  extractFileName,
  extractFileExtension,
} from "../utils";

// ========================================
// getFileTypeFromExtension テスト
// ========================================
describe("getFileTypeFromExtension", () => {
  describe("テキスト系拡張子", () => {
    it(".txt を text/plain に変換すること", () => {
      expect(getFileTypeFromExtension(".txt")).toBe("text/plain");
    });

    it(".text を text/plain に変換すること", () => {
      expect(getFileTypeFromExtension(".text")).toBe("text/plain");
    });

    it(".md を text/markdown に変換すること", () => {
      expect(getFileTypeFromExtension(".md")).toBe("text/markdown");
    });

    it(".markdown を text/markdown に変換すること", () => {
      expect(getFileTypeFromExtension(".markdown")).toBe("text/markdown");
    });

    it(".html を text/html に変換すること", () => {
      expect(getFileTypeFromExtension(".html")).toBe("text/html");
    });

    it(".htm を text/html に変換すること", () => {
      expect(getFileTypeFromExtension(".htm")).toBe("text/html");
    });

    it(".csv を text/csv に変換すること", () => {
      expect(getFileTypeFromExtension(".csv")).toBe("text/csv");
    });

    it(".tsv を text/tab-separated-values に変換すること", () => {
      expect(getFileTypeFromExtension(".tsv")).toBe(
        "text/tab-separated-values",
      );
    });
  });

  describe("コード系拡張子", () => {
    it(".js を text/javascript に変換すること", () => {
      expect(getFileTypeFromExtension(".js")).toBe("text/javascript");
    });

    it(".mjs を text/javascript に変換すること", () => {
      expect(getFileTypeFromExtension(".mjs")).toBe("text/javascript");
    });

    it(".cjs を text/javascript に変換すること", () => {
      expect(getFileTypeFromExtension(".cjs")).toBe("text/javascript");
    });

    it(".jsx を text/javascript に変換すること", () => {
      expect(getFileTypeFromExtension(".jsx")).toBe("text/javascript");
    });

    it(".ts を text/typescript に変換すること", () => {
      expect(getFileTypeFromExtension(".ts")).toBe("text/typescript");
    });

    it(".mts を text/typescript に変換すること", () => {
      expect(getFileTypeFromExtension(".mts")).toBe("text/typescript");
    });

    it(".cts を text/typescript に変換すること", () => {
      expect(getFileTypeFromExtension(".cts")).toBe("text/typescript");
    });

    it(".tsx を text/typescript に変換すること", () => {
      expect(getFileTypeFromExtension(".tsx")).toBe("text/typescript");
    });

    it(".py を application/x-python に変換すること", () => {
      expect(getFileTypeFromExtension(".py")).toBe("application/x-python");
    });

    it(".pyw を application/x-python に変換すること", () => {
      expect(getFileTypeFromExtension(".pyw")).toBe("application/x-python");
    });

    it(".json を application/json に変換すること", () => {
      expect(getFileTypeFromExtension(".json")).toBe("application/json");
    });

    it(".yaml を application/x-yaml に変換すること", () => {
      expect(getFileTypeFromExtension(".yaml")).toBe("application/x-yaml");
    });

    it(".yml を application/x-yaml に変換すること", () => {
      expect(getFileTypeFromExtension(".yml")).toBe("application/x-yaml");
    });

    it(".xml を application/xml に変換すること", () => {
      expect(getFileTypeFromExtension(".xml")).toBe("application/xml");
    });
  });

  describe("ドキュメント系拡張子", () => {
    it(".pdf を application/pdf に変換すること", () => {
      expect(getFileTypeFromExtension(".pdf")).toBe("application/pdf");
    });

    it(".docx を正しいMIMEタイプに変換すること", () => {
      expect(getFileTypeFromExtension(".docx")).toBe(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
    });

    it(".xlsx を正しいMIMEタイプに変換すること", () => {
      expect(getFileTypeFromExtension(".xlsx")).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    });

    it(".pptx を正しいMIMEタイプに変換すること", () => {
      expect(getFileTypeFromExtension(".pptx")).toBe(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      );
    });
  });

  describe("拡張子の正規化", () => {
    it("ドットなしの拡張子を受け入れること", () => {
      expect(getFileTypeFromExtension("ts")).toBe("text/typescript");
    });

    it("大文字の拡張子を正規化すること", () => {
      expect(getFileTypeFromExtension(".TS")).toBe("text/typescript");
    });

    it("大文字小文字混在を正規化すること", () => {
      expect(getFileTypeFromExtension(".Ts")).toBe("text/typescript");
    });
  });

  describe("未知の拡張子", () => {
    it("未知の拡張子は application/octet-stream を返すこと", () => {
      expect(getFileTypeFromExtension(".xyz")).toBe("application/octet-stream");
    });

    it("空文字列は application/octet-stream を返すこと", () => {
      expect(getFileTypeFromExtension("")).toBe("application/octet-stream");
    });

    it("ドットのみは application/octet-stream を返すこと", () => {
      expect(getFileTypeFromExtension(".")).toBe("application/octet-stream");
    });
  });
});

// ========================================
// getFileTypeFromPath テスト
// ========================================
describe("getFileTypeFromPath", () => {
  describe("正常系", () => {
    it("パスからファイルタイプを取得できること", () => {
      expect(getFileTypeFromPath("/path/to/file.ts")).toBe("text/typescript");
    });

    it("相対パスでも動作すること", () => {
      expect(getFileTypeFromPath("src/index.js")).toBe("text/javascript");
    });

    it("Windowsパスでも動作すること", () => {
      expect(getFileTypeFromPath("C:\\Users\\test\\file.md")).toBe(
        "text/markdown",
      );
    });
  });

  describe("拡張子なしのパス", () => {
    it("拡張子なしのパスは UNKNOWN を返すこと", () => {
      expect(getFileTypeFromPath("/path/to/README")).toBe(
        "application/octet-stream",
      );
    });

    it("ドットで終わるパスは UNKNOWN を返すこと", () => {
      expect(getFileTypeFromPath("/path/to/file.")).toBe(
        "application/octet-stream",
      );
    });
  });
});

// ========================================
// getFileCategoryFromType テスト
// ========================================
describe("getFileCategoryFromType", () => {
  describe("テキスト系", () => {
    it("text/plain は text カテゴリであること", () => {
      expect(getFileCategoryFromType("text/plain")).toBe("text");
    });

    it("text/markdown は text カテゴリであること", () => {
      expect(getFileCategoryFromType("text/markdown")).toBe("text");
    });

    it("text/html は text カテゴリであること", () => {
      expect(getFileCategoryFromType("text/html")).toBe("text");
    });

    it("text/csv は text カテゴリであること", () => {
      expect(getFileCategoryFromType("text/csv")).toBe("text");
    });

    it("text/tab-separated-values は text カテゴリであること", () => {
      expect(getFileCategoryFromType("text/tab-separated-values")).toBe("text");
    });
  });

  describe("コード系", () => {
    it("text/javascript は code カテゴリであること", () => {
      expect(getFileCategoryFromType("text/javascript")).toBe("code");
    });

    it("text/typescript は code カテゴリであること", () => {
      expect(getFileCategoryFromType("text/typescript")).toBe("code");
    });

    it("application/x-python は code カテゴリであること", () => {
      expect(getFileCategoryFromType("application/x-python")).toBe("code");
    });

    it("application/json は code カテゴリであること", () => {
      expect(getFileCategoryFromType("application/json")).toBe("code");
    });

    it("application/x-yaml は code カテゴリであること", () => {
      expect(getFileCategoryFromType("application/x-yaml")).toBe("code");
    });

    it("application/xml は code カテゴリであること", () => {
      expect(getFileCategoryFromType("application/xml")).toBe("code");
    });
  });

  describe("ドキュメント系", () => {
    it("application/pdf は document カテゴリであること", () => {
      expect(getFileCategoryFromType("application/pdf")).toBe("document");
    });

    it("DOCX は document カテゴリであること", () => {
      expect(
        getFileCategoryFromType(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ),
      ).toBe("document");
    });
  });

  describe("スプレッドシート", () => {
    it("XLSX は spreadsheet カテゴリであること", () => {
      expect(
        getFileCategoryFromType(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ),
      ).toBe("spreadsheet");
    });
  });

  describe("プレゼンテーション", () => {
    it("PPTX は presentation カテゴリであること", () => {
      expect(
        getFileCategoryFromType(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ),
      ).toBe("presentation");
    });
  });

  describe("その他", () => {
    it("application/octet-stream は other カテゴリであること", () => {
      expect(getFileCategoryFromType("application/octet-stream")).toBe("other");
    });
  });
});

// ========================================
// calculateFileHash テスト
// ========================================
describe("calculateFileHash", () => {
  describe("正常系", () => {
    it("文字列のSHA-256ハッシュを計算できること", async () => {
      const result = await calculateFileHash("Hello, World!");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(64);
        expect(result.data).toMatch(/^[0-9a-f]{64}$/);
      }
    });

    it("空文字列のハッシュを計算できること", async () => {
      const result = await calculateFileHash("");
      expect(result.success).toBe(true);
      if (result.success) {
        // SHA-256 of empty string
        expect(result.data).toBe(
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        );
      }
    });

    it("同じ入力に対して同じハッシュを返すこと", async () => {
      const result1 = await calculateFileHash("test content");
      const result2 = await calculateFileHash("test content");
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (result1.success && result2.success) {
        expect(result1.data).toBe(result2.data);
      }
    });

    it("異なる入力に対して異なるハッシュを返すこと", async () => {
      const result1 = await calculateFileHash("content A");
      const result2 = await calculateFileHash("content B");
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (result1.success && result2.success) {
        expect(result1.data).not.toBe(result2.data);
      }
    });

    it("ArrayBufferを受け入れること", async () => {
      const buffer = new TextEncoder().encode("Hello, World!");
      const result = await calculateFileHash(buffer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(64);
      }
    });
  });

  describe("日本語コンテンツ", () => {
    it("日本語文字列のハッシュを計算できること", async () => {
      const result = await calculateFileHash("こんにちは世界");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(64);
        expect(result.data).toMatch(/^[0-9a-f]{64}$/);
      }
    });
  });
});

// ========================================
// calculateFileHashSync テスト（Node.js環境のみ）
// ========================================
describe("calculateFileHashSync", () => {
  describe("正常系", () => {
    it("文字列のSHA-256ハッシュを同期計算できること", () => {
      const result = calculateFileHashSync("Hello, World!");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(64);
        expect(result.data).toMatch(/^[0-9a-f]{64}$/);
      }
    });

    it("空文字列のハッシュを計算できること", () => {
      const result = calculateFileHashSync("");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        );
      }
    });
  });
});

// ========================================
// formatFileSize テスト
// ========================================
describe("formatFileSize", () => {
  describe("正常系", () => {
    it("0バイトを正しくフォーマットすること", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
    });

    it("1バイトを正しくフォーマットすること", () => {
      expect(formatFileSize(1)).toBe("1 Bytes");
    });

    it("512バイトを正しくフォーマットすること", () => {
      expect(formatFileSize(512)).toBe("512 Bytes");
    });

    it("1023バイトを正しくフォーマットすること", () => {
      expect(formatFileSize(1023)).toBe("1023 Bytes");
    });

    it("1024バイト（1KB）を正しくフォーマットすること", () => {
      expect(formatFileSize(1024)).toBe("1.00 KB");
    });

    it("1536バイト（1.5KB）を正しくフォーマットすること", () => {
      expect(formatFileSize(1536)).toBe("1.50 KB");
    });

    it("1048576バイト（1MB）を正しくフォーマットすること", () => {
      expect(formatFileSize(1048576)).toBe("1.00 MB");
    });

    it("1073741824バイト（1GB）を正しくフォーマットすること", () => {
      expect(formatFileSize(1073741824)).toBe("1.00 GB");
    });
  });

  describe("小数点桁数の指定", () => {
    it("小数点1桁でフォーマットできること", () => {
      expect(formatFileSize(1536, 1)).toBe("1.5 KB");
    });

    it("小数点0桁でフォーマットできること", () => {
      expect(formatFileSize(1536, 0)).toBe("2 KB");
    });

    it("小数点3桁でフォーマットできること", () => {
      expect(formatFileSize(1536, 3)).toBe("1.500 KB");
    });
  });

  describe("異常系", () => {
    it("負の値でエラーをスローすること", () => {
      expect(() => formatFileSize(-1)).toThrow();
    });
  });
});

// ========================================
// parseFileSize テスト
// ========================================
describe("parseFileSize", () => {
  describe("正常系", () => {
    it("'0 Bytes' をパースできること", () => {
      const result = parseFileSize("0 Bytes");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it("'1 KB' をパースできること", () => {
      const result = parseFileSize("1 KB");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1024);
      }
    });

    it("'1.5 MB' をパースできること", () => {
      const result = parseFileSize("1.5 MB");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(Math.round(1.5 * 1024 * 1024));
      }
    });

    it("'10 GB' をパースできること", () => {
      const result = parseFileSize("10 GB");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(10 * 1024 * 1024 * 1024);
      }
    });

    it("スペースなしでもパースできること", () => {
      const result = parseFileSize("512KB");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(512 * 1024);
      }
    });

    it("小文字の単位でもパースできること", () => {
      const result = parseFileSize("1 kb");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1024);
      }
    });
  });

  describe("異常系", () => {
    it("無効な形式でエラーを返すこと", () => {
      const result = parseFileSize("invalid");
      expect(result.success).toBe(false);
    });

    it("不明な単位でエラーを返すこと", () => {
      const result = parseFileSize("100 XB");
      expect(result.success).toBe(false);
    });

    it("負の値でエラーを返すこと", () => {
      const result = parseFileSize("-1 KB");
      expect(result.success).toBe(false);
    });
  });
});

// ========================================
// isValidFileExtension テスト
// ========================================
describe("isValidFileExtension", () => {
  describe("有効な拡張子", () => {
    it(".ts は有効であること", () => {
      expect(isValidFileExtension(".ts")).toBe(true);
    });

    it(".md は有効であること", () => {
      expect(isValidFileExtension(".md")).toBe(true);
    });

    it(".pdf は有効であること", () => {
      expect(isValidFileExtension(".pdf")).toBe(true);
    });

    it("ドットなしでも有効であること", () => {
      expect(isValidFileExtension("ts")).toBe(true);
    });
  });

  describe("無効な拡張子", () => {
    it(".xyz は無効であること", () => {
      expect(isValidFileExtension(".xyz")).toBe(false);
    });

    it("空文字列は無効であること", () => {
      expect(isValidFileExtension("")).toBe(false);
    });
  });
});

// ========================================
// isValidHash テスト
// ========================================
describe("isValidHash", () => {
  describe("有効なハッシュ", () => {
    it("64文字の16進数文字列は有効であること", () => {
      expect(isValidHash("a".repeat(64))).toBe(true);
    });

    it("0-9a-fの文字で構成されたハッシュは有効であること", () => {
      expect(
        isValidHash(
          "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        ),
      ).toBe(true);
    });
  });

  describe("無効なハッシュ", () => {
    it("63文字は無効であること", () => {
      expect(isValidHash("a".repeat(63))).toBe(false);
    });

    it("65文字は無効であること", () => {
      expect(isValidHash("a".repeat(65))).toBe(false);
    });

    it("大文字を含むハッシュは無効であること", () => {
      expect(isValidHash("A".repeat(64))).toBe(false);
    });

    it("16進数以外の文字を含むハッシュは無効であること", () => {
      expect(isValidHash("g".repeat(64))).toBe(false);
    });

    it("空文字列は無効であること", () => {
      expect(isValidHash("")).toBe(false);
    });
  });
});

// ========================================
// validateFileSize テスト
// ========================================
describe("validateFileSize", () => {
  describe("正常系", () => {
    it("0バイトは有効であること", () => {
      const result = validateFileSize(0);
      expect(result.success).toBe(true);
    });

    it("10MB以下は有効であること（デフォルト上限）", () => {
      const result = validateFileSize(10 * 1024 * 1024);
      expect(result.success).toBe(true);
    });

    it("カスタム上限内は有効であること", () => {
      const result = validateFileSize(500, 1024);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("負のサイズはエラーを返すこと", () => {
      const result = validateFileSize(-1);
      expect(result.success).toBe(false);
    });

    it("デフォルト上限（10MB）を超えるとエラーを返すこと", () => {
      const result = validateFileSize(10 * 1024 * 1024 + 1);
      expect(result.success).toBe(false);
    });

    it("カスタム上限を超えるとエラーを返すこと", () => {
      const result = validateFileSize(1025, 1024);
      expect(result.success).toBe(false);
    });
  });
});

// ========================================
// extractFileName テスト
// ========================================
describe("extractFileName", () => {
  describe("Unixパス", () => {
    it("絶対パスからファイル名を抽出できること", () => {
      expect(extractFileName("/path/to/file.ts")).toBe("file.ts");
    });

    it("相対パスからファイル名を抽出できること", () => {
      expect(extractFileName("src/index.js")).toBe("index.js");
    });

    it("ファイル名のみの場合そのまま返すこと", () => {
      expect(extractFileName("file.txt")).toBe("file.txt");
    });
  });

  describe("Windowsパス", () => {
    it("Windowsパスからファイル名を抽出できること", () => {
      expect(extractFileName("C:\\Users\\test\\file.md")).toBe("file.md");
    });

    it("混合パス区切りでも動作すること", () => {
      expect(extractFileName("C:/Users/test\\file.md")).toBe("file.md");
    });
  });

  describe("エッジケース", () => {
    it("末尾がスラッシュの場合は空文字を返すこと", () => {
      expect(extractFileName("/path/to/")).toBe("");
    });
  });
});

// ========================================
// extractFileExtension テスト
// ========================================
describe("extractFileExtension", () => {
  describe("正常系", () => {
    it("拡張子を抽出できること", () => {
      expect(extractFileExtension("/path/to/file.ts")).toBe(".ts");
    });

    it("複数ドットがある場合は最後の拡張子を返すこと", () => {
      expect(extractFileExtension("file.test.ts")).toBe(".ts");
    });
  });

  describe("拡張子なし", () => {
    it("拡張子なしのファイルは空文字を返すこと", () => {
      expect(extractFileExtension("/path/to/README")).toBe("");
    });

    it("ドットで始まるファイル（隠しファイル）は空文字を返すこと", () => {
      expect(extractFileExtension(".gitignore")).toBe("");
    });
  });
});

// ========================================
// 境界値テスト
// ========================================
describe("境界値テスト", () => {
  describe("formatFileSize 境界値", () => {
    it("1023バイト（KB境界手前）", () => {
      expect(formatFileSize(1023)).toBe("1023 Bytes");
    });

    it("1024バイト（KB境界）", () => {
      expect(formatFileSize(1024)).toBe("1.00 KB");
    });

    it("1048575バイト（MB境界手前）", () => {
      expect(formatFileSize(1048575)).toContain("KB");
    });

    it("1048576バイト（MB境界）", () => {
      expect(formatFileSize(1048576)).toBe("1.00 MB");
    });
  });

  describe("validateFileSize 境界値", () => {
    it("デフォルト上限ちょうど（10MB）は有効", () => {
      const result = validateFileSize(10 * 1024 * 1024);
      expect(result.success).toBe(true);
    });

    it("デフォルト上限+1バイトは無効", () => {
      const result = validateFileSize(10 * 1024 * 1024 + 1);
      expect(result.success).toBe(false);
    });
  });
});
