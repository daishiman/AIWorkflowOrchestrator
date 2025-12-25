/**
 * @file PlainTextConverterの手動テスト
 * @module @repo/shared/services/conversion/converters/__tests__/manual/plain-text-converter-manual.test
 * @description 実際のファイルを使った統合テスト
 */

import { describe, it, expect, beforeAll } from "vitest";
import { PlainTextConverter } from "../../plain-text-converter";
import { globalConverterRegistry } from "../../../converter-registry";
import { registerDefaultConverters } from "../../index";
import type { ConverterInput } from "../../../types";
import { createFileId } from "../../../../../types/rag/branded";
import * as fs from "fs/promises";
import * as path from "path";

describe("PlainTextConverter - Manual Integration Test", () => {
  let converter: PlainTextConverter;
  const testFilesDir = path.join(__dirname, "test-files");

  beforeAll(async () => {
    // レジストリ登録
    registerDefaultConverters();
    converter = new PlainTextConverter();

    // テストファイルディレクトリを作成
    await fs.mkdir(testFilesDir, { recursive: true });

    // テストファイルを作成
    await createTestFiles(testFilesDir);
  });

  // ========================================
  // 手動テストケース 1: UTF-8 BOM付きファイル変換
  // ========================================

  it("Manual Test 1: should convert UTF-8 BOM file correctly", async () => {
    const filePath = path.join(testFilesDir, "test-bom.txt");
    const fileContent = await fs.readFile(filePath);

    const input: ConverterInput = {
      fileId: createFileId("manual-test-1"),
      filePath,
      mimeType: "text/plain",
      content: fileContent,
      encoding: "utf-8",
    };

    const result = await converter.convert(input);

    expect(result.success).toBe(true);
    if (result.success) {
      // BOMが除去されていること
      expect(result.data.convertedContent.charCodeAt(0)).not.toBe(0xfeff);
      expect(result.data.convertedContent).toBe("Hello, World!");
      console.log("✅ Test 1 PASS: BOM removed successfully");
    }
  });

  // ========================================
  // 手動テストケース 2: CRLF→LF変換
  // ========================================

  it("Manual Test 2: should normalize CRLF to LF", async () => {
    const filePath = path.join(testFilesDir, "test-crlf.txt");
    const fileContent = await fs.readFile(filePath, "utf-8");

    const input: ConverterInput = {
      fileId: createFileId("manual-test-2"),
      filePath,
      mimeType: "text/plain",
      content: fileContent,
      encoding: "utf-8",
    };

    const result = await converter.convert(input);

    expect(result.success).toBe(true);
    if (result.success) {
      // CRLFが存在しないこと
      expect(result.data.convertedContent).not.toContain("\r\n");
      // LFで統一されていること
      expect(result.data.convertedContent).toBe("Line 1\nLine 2\nLine 3");
      console.log("✅ Test 2 PASS: CRLF normalized to LF");
    }
  });

  // ========================================
  // 手動テストケース 3: 行数・単語数カウント
  // ========================================

  it("Manual Test 3: should count lines and words correctly", async () => {
    const filePath = path.join(testFilesDir, "test-metadata.txt");
    const fileContent = await fs.readFile(filePath, "utf-8");

    const input: ConverterInput = {
      fileId: createFileId("manual-test-3"),
      filePath,
      mimeType: "text/plain",
      content: fileContent,
      encoding: "utf-8",
    };

    const result = await converter.convert(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.extractedMetadata.lineCount).toBe(3);
      expect(result.data.extractedMetadata.wordCount).toBeGreaterThan(0);
      expect(result.data.extractedMetadata.charCount).toBeGreaterThan(0);
      console.log("✅ Test 3 PASS: Metadata extracted correctly");
      console.log(
        `   Lines: ${result.data.extractedMetadata.lineCount}, Words: ${result.data.extractedMetadata.wordCount}, Chars: ${result.data.extractedMetadata.charCount}`,
      );
    }
  });

  // ========================================
  // 手動テストケース 4: 空ファイル処理
  // ========================================

  it("Manual Test 4: should handle empty file", async () => {
    const filePath = path.join(testFilesDir, "test-empty.txt");
    const fileContent = await fs.readFile(filePath, "utf-8");

    const input: ConverterInput = {
      fileId: createFileId("manual-test-4"),
      filePath,
      mimeType: "text/plain",
      content: fileContent,
      encoding: "utf-8",
    };

    const result = await converter.convert(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.convertedContent).toBe("");
      expect(result.data.extractedMetadata.lineCount).toBe(0);
      expect(result.data.extractedMetadata.wordCount).toBe(0);
      console.log("✅ Test 4 PASS: Empty file handled correctly");
    }
  });

  // ========================================
  // 手動テストケース 5: レジストリ経由での変換
  // ========================================

  it("Manual Test 5: should work through converter registry", async () => {
    const filePath = path.join(testFilesDir, "test-registry.txt");
    const fileContent = await fs.readFile(filePath, "utf-8");

    const input: ConverterInput = {
      fileId: createFileId("manual-test-5"),
      filePath,
      mimeType: "text/plain",
      content: fileContent,
      encoding: "utf-8",
    };

    // レジストリ経由で変換
    const converterResult = globalConverterRegistry.findConverter(input);
    expect(converterResult.success).toBe(true);

    if (converterResult.success) {
      const registryConverter = converterResult.data;
      expect(registryConverter.id).toBe("plain-text-converter");

      const result = await registryConverter.convert(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Registry Test Content");
        console.log("✅ Test 5 PASS: Registry integration works correctly");
      }
    }
  });
});

// ========================================
// ヘルパー関数
// ========================================

/**
 * テストファイルを作成
 */
async function createTestFiles(dir: string): Promise<void> {
  // Test 1: UTF-8 BOM付きファイル
  const bomBuffer = Buffer.from([
    0xef,
    0xbb,
    0xbf,
    ...Buffer.from("Hello, World!"),
  ]);
  await fs.writeFile(path.join(dir, "test-bom.txt"), bomBuffer);

  // Test 2: CRLFファイル
  await fs.writeFile(
    path.join(dir, "test-crlf.txt"),
    "Line 1\r\nLine 2\r\nLine 3",
  );

  // Test 3: メタデータテスト用
  await fs.writeFile(
    path.join(dir, "test-metadata.txt"),
    "First line with some words\nSecond line\nThird line",
  );

  // Test 4: 空ファイル
  await fs.writeFile(path.join(dir, "test-empty.txt"), "");

  // Test 5: レジストリテスト用
  await fs.writeFile(
    path.join(dir, "test-registry.txt"),
    "Registry Test Content",
  );

  console.log(`Test files created in ${dir}`);
}
