/**
 * T-08-1: 手動テストスクリプト
 *
 * 自動テストでは検証できない型推論・インポートの動作を確認
 */

// ========================================
// テスト 1: バレルエクスポート確認
// ========================================
import {
  // 型定義（使用するもののみ）
  type FileId,
  type FileType,
  type FileCategory,
  type FileEntity,
  // 定数
  FileTypes,
  FileCategories,
  DEFAULT_MAX_FILE_SIZE,
  SHA256_HASH_PATTERN,
  // スキーマ
  fileTypeSchema,
  fileCategorySchema,
  fileEntitySchema,
  // ユーティリティ
  getFileTypeFromExtension,
  getFileTypeFromPath,
  getFileCategoryFromType,
  calculateFileHashSync,
  formatFileSize,
  parseFileSize,
  isValidFileExtension,
  isValidHash,
  validateFileSize,
  extractFileName,
  extractFileExtension,
} from "../index";

console.log("========================================");
console.log("T-08-1: 手動テスト実行");
console.log("========================================\n");

let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => boolean): void {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ PASS: ${name}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: ${name}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error}`);
    failCount++;
  }
}

// ========================================
// テスト 1: バレルエクスポート確認
// ========================================
console.log("\n--- テスト 1: バレルエクスポート確認 ---");

test("FileTypes定数がインポートできる", () => {
  return FileTypes !== undefined && FileTypes.TYPESCRIPT === "text/typescript";
});

test("FileCategories定数がインポートできる", () => {
  return FileCategories !== undefined && FileCategories.CODE === "code";
});

test("DEFAULT_MAX_FILE_SIZE定数がインポートできる", () => {
  return DEFAULT_MAX_FILE_SIZE === 10 * 1024 * 1024;
});

test("SHA256_HASH_PATTERN正規表現がインポートできる", () => {
  return SHA256_HASH_PATTERN.test("a".repeat(64));
});

// ========================================
// テスト 2-3: 型推論確認
// ========================================
console.log("\n--- テスト 2-3: 型推論確認 ---");

test("FileType型推論が正しく機能する", () => {
  const fileType: FileType = FileTypes.TYPESCRIPT;
  return fileType === "text/typescript";
});

test("FileCategory型推論が正しく機能する", () => {
  const category: FileCategory = FileCategories.CODE;
  return category === "code";
});

test("FileEntity型が正しく定義されている", () => {
  // 型チェック用（コンパイル時に検証）
  const mockEntity: FileEntity = {
    id: "550e8400-e29b-41d4-a716-446655440000" as FileId,
    name: "test.ts",
    path: "/path/to/test.ts",
    mimeType: FileTypes.TYPESCRIPT,
    category: FileCategories.CODE,
    size: 1024,
    hash: "a".repeat(64),
    encoding: "utf-8",
    lastModified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
  };
  return mockEntity.id !== undefined && mockEntity.name === "test.ts";
});

// ========================================
// テスト 4: 正常値のパース
// ========================================
console.log("\n--- テスト 4: 正常値のパース ---");

test("fileEntitySchema.parseで正常データがパースできる", () => {
  const validData = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "test.ts",
    path: "/path/to/test.ts",
    mimeType: "text/typescript",
    category: "code",
    size: 1024,
    hash: "a".repeat(64),
    encoding: "utf-8",
    lastModified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
  };
  const result = fileEntitySchema.safeParse(validData);
  return result.success === true;
});

test("fileTypeSchema.parseで正常値がパースできる", () => {
  const result = fileTypeSchema.safeParse("text/typescript");
  return result.success === true;
});

test("fileCategorySchema.parseで正常値がパースできる", () => {
  const result = fileCategorySchema.safeParse("code");
  return result.success === true;
});

// ========================================
// テスト 5: 異常値のパース
// ========================================
console.log("\n--- テスト 5: 異常値のパース ---");

test("fileEntitySchema.parseで異常データがエラーになる", () => {
  const invalidData = {
    id: "invalid-uuid",
    name: "",
    path: "",
  };
  const result = fileEntitySchema.safeParse(invalidData);
  return result.success === false;
});

test("fileTypeSchema.parseで無効なMIMEタイプがエラーになる", () => {
  const result = fileTypeSchema.safeParse("invalid/type");
  return result.success === false;
});

test("fileEntitySchemaでサイズ超過がエラーになる", () => {
  const oversizedData = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "test.ts",
    path: "/path/to/test.ts",
    mimeType: "text/typescript",
    category: "code",
    size: 100 * 1024 * 1024, // 100MB (超過)
    hash: "a".repeat(64),
    encoding: "utf-8",
    lastModified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
  };
  const result = fileEntitySchema.safeParse(oversizedData);
  return result.success === false;
});

// ========================================
// テスト 6: 拡張子からタイプ推定
// ========================================
console.log("\n--- テスト 6: 拡張子からタイプ推定 ---");

test("getFileTypeFromExtension('.ts')が'text/typescript'を返す", () => {
  return getFileTypeFromExtension(".ts") === "text/typescript";
});

test("getFileTypeFromExtension('md')が'text/markdown'を返す", () => {
  return getFileTypeFromExtension("md") === "text/markdown";
});

test("getFileTypeFromExtension('.json')が'application/json'を返す", () => {
  return getFileTypeFromExtension(".json") === "application/json";
});

test("getFileTypeFromPath('/path/to/file.ts')が'text/typescript'を返す", () => {
  return getFileTypeFromPath("/path/to/file.ts") === "text/typescript";
});

test("getFileCategoryFromType('text/typescript')が'code'を返す", () => {
  return getFileCategoryFromType("text/typescript") === "code";
});

// ========================================
// テスト 7: ハッシュ計算
// ========================================
console.log("\n--- テスト 7: ハッシュ計算 ---");

test("calculateFileHashSyncが64文字のハッシュを返す", () => {
  const result = calculateFileHashSync("Hello, World!");
  return result.success && result.data.length === 64;
});

test("calculateFileHashSyncの結果が有効なハッシュ形式", () => {
  const result = calculateFileHashSync("Hello, World!");
  return result.success && isValidHash(result.data);
});

// ========================================
// その他のユーティリティテスト
// ========================================
console.log("\n--- その他のユーティリティテスト ---");

test("formatFileSizeが正しくフォーマットする", () => {
  return formatFileSize(1024) === "1.00 KB";
});

test("parsFileSizeが正しくパースする", () => {
  const result = parseFileSize("1 KB");
  return result.success && result.data === 1024;
});

test("isValidFileExtensionが.tsをtrueと判定", () => {
  return isValidFileExtension(".ts") === true;
});

test("isValidFileExtensionが.xyzをfalseと判定", () => {
  return isValidFileExtension(".xyz") === false;
});

test("validateFileSizeが正常サイズでsuccessを返す", () => {
  const result = validateFileSize(1024);
  return result.success === true;
});

test("validateFileSizeが超過サイズでerrorを返す", () => {
  const result = validateFileSize(100 * 1024 * 1024);
  return result.success === false;
});

test("extractFileNameがパスからファイル名を抽出", () => {
  return extractFileName("/path/to/file.ts") === "file.ts";
});

test("extractFileExtensionがパスから拡張子を抽出", () => {
  return extractFileExtension("/path/to/file.ts") === ".ts";
});

// ========================================
// 結果サマリー
// ========================================
console.log("\n========================================");
console.log(`テスト結果: ${passCount} PASS / ${failCount} FAIL`);
console.log("========================================");

if (failCount === 0) {
  console.log("\n✅ すべての手動テストが成功しました！");
  process.exit(0);
} else {
  console.log("\n❌ 一部のテストが失敗しました。");
  process.exit(1);
}
