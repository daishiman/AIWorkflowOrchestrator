/**
 * 手動テストスクリプト
 *
 * 実環境での動作を確認するための手動テストケース
 */

import {
  BaseConverter,
  createTestRegistry,
  createConversionService,
} from "../index";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, createFileId } from "../../../types/rag";

// =============================================================================
// テスト用コンバーター実装
// =============================================================================

class TestPlainTextConverter extends BaseConverter {
  readonly id = "test-plain-text-converter";
  readonly name = "Test Plain Text Converter";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 5;

  protected async doConvert(
    input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    const text = this.getTextContent(input);

    return ok({
      convertedContent: text.toUpperCase(),
      extractedMetadata: {
        title: null,
        author: null,
        language: "en",
        wordCount: text.split(" ").length,
        lineCount: 1,
        charCount: text.length,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: 0,
    });
  }
}

class HighPriorityConverter extends BaseConverter {
  readonly id = "high-priority-converter";
  readonly name = "High Priority Converter";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 10; // 高優先度

  protected async doConvert(
    input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    const text = this.getTextContent(input);

    return ok({
      convertedContent: `[HIGH PRIORITY] ${text}`,
      extractedMetadata: {
        title: null,
        author: null,
        language: "en",
        wordCount: 0,
        lineCount: 0,
        charCount: 0,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: 0,
    });
  }
}

class SlowConverter extends BaseConverter {
  readonly id = "slow-converter";
  readonly name = "Slow Converter";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 0;

  protected async doConvert(
    input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    // 意図的に遅延（5秒）
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const text = this.getTextContent(input);

    return ok({
      convertedContent: text,
      extractedMetadata: {
        title: null,
        author: null,
        language: "en",
        wordCount: 0,
        lineCount: 0,
        charCount: 0,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: 5000,
    });
  }
}

// =============================================================================
// テストケース実行
// =============================================================================

async function runManualTests() {
  console.log("=".repeat(60));
  console.log("手動テスト開始");
  console.log("=".repeat(60));
  console.log();

  let passCount = 0;
  let failCount = 0;

  // テストケース1: コンバーター登録
  console.log("📋 テストケース1: コンバーター登録");
  try {
    const registry = createTestRegistry();
    const converter = new TestPlainTextConverter();

    const result = registry.register(converter);

    if (result.success && registry.size === 1) {
      console.log("✅ PASS: コンバーター登録成功、size=1");
      passCount++;
    } else {
      console.log("❌ FAIL: 登録失敗またはサイズ不一致");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL: 例外発生", error);
    failCount++;
  }
  console.log();

  // テストケース2: 優先度順選択
  console.log("📋 テストケース2: 優先度順選択");
  try {
    const registry = createTestRegistry();
    const lowPriority = new TestPlainTextConverter(); // priority 5
    const highPriority = new HighPriorityConverter(); // priority 10

    registry.register(lowPriority);
    registry.register(highPriority);

    const input: ConverterInput = {
      fileId: createFileId("test-123"),
      filePath: "/test.txt",
      mimeType: "text/plain",
      content: "hello world",
      encoding: "utf-8",
    };

    const result = registry.findConverter(input);

    if (
      result.success &&
      result.data.id === "high-priority-converter" &&
      result.data.priority === 10
    ) {
      console.log(
        "✅ PASS: 最高優先度のコンバーター（priority 10）が選択された",
      );
      passCount++;
    } else {
      console.log("❌ FAIL: 優先度選択が正しくない");
      console.log("  実際:", result.success ? result.data.id : "エラー");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL: 例外発生", error);
    failCount++;
  }
  console.log();

  // テストケース3: タイムアウト動作
  console.log("📋 テストケース3: タイムアウト動作");
  try {
    const registry = createTestRegistry();
    const slowConverter = new SlowConverter(); // 5秒かかる

    registry.register(slowConverter);

    const service = createConversionService(registry, {
      defaultTimeout: 1000, // 1秒でタイムアウト
      maxConcurrentConversions: 5,
    });

    const input: ConverterInput = {
      fileId: createFileId("test-456"),
      filePath: "/test.txt",
      mimeType: "text/plain",
      content: "test content",
      encoding: "utf-8",
    };

    console.log("  変換開始（1秒でタイムアウト予定）...");
    const startTime = Date.now();
    const result = await service.convert(input);
    const elapsed = Date.now() - startTime;

    if (!result.success && result.error.code === "TIMEOUT" && elapsed < 2000) {
      console.log(
        `✅ PASS: タイムアウトエラーが返された（経過時間: ${elapsed}ms）`,
      );
      passCount++;
    } else {
      console.log("❌ FAIL: タイムアウトが正しく動作しない");
      console.log("  実際:", result.success ? "成功" : result.error.code);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL: 例外発生", error);
    failCount++;
  }
  console.log();

  // テストケース4: 同時実行制御
  console.log("📋 テストケース4: 同時実行制御");
  try {
    const registry = createTestRegistry();
    const slowConverter = new SlowConverter(); // 5秒かかる

    registry.register(slowConverter);

    const service = createConversionService(registry, {
      defaultTimeout: 10000,
      maxConcurrentConversions: 2, // 最大2件
    });

    const input1: ConverterInput = {
      fileId: createFileId("file-1"),
      filePath: "/test1.txt",
      mimeType: "text/plain",
      content: "content 1",
      encoding: "utf-8",
    };

    const input2: ConverterInput = {
      fileId: createFileId("file-2"),
      filePath: "/test2.txt",
      mimeType: "text/plain",
      content: "content 2",
      encoding: "utf-8",
    };

    const input3: ConverterInput = {
      fileId: createFileId("file-3"),
      filePath: "/test3.txt",
      mimeType: "text/plain",
      content: "content 3",
      encoding: "utf-8",
    };

    console.log("  変換1開始（バックグラウンド）");
    const promise1 = service.convert(input1);

    console.log("  変換2開始（バックグラウンド）");
    const promise2 = service.convert(input2);

    // 少し待ってから3件目を実行
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("  変換3開始（制限超過予定）");
    const result3 = await service.convert(input3);

    if (!result3.success && result3.error.code === "RESOURCE_EXHAUSTED") {
      console.log("✅ PASS: 3件目がRESOURCE_EXHAUSTEDエラーで拒否された");
      passCount++;
    } else {
      console.log("❌ FAIL: 同時実行制御が正しく動作しない");
      console.log("  実際:", result3.success ? "成功" : result3.error.code);
      failCount++;
    }

    // 1件目と2件目の完了を待つ
    await promise1;
    await promise2;
  } catch (error) {
    console.log("❌ FAIL: 例外発生", error);
    failCount++;
  }
  console.log();

  // テストケース5: 未登録MIMEタイプ
  console.log("📋 テストケース5: 未登録MIMEタイプ");
  try {
    const registry = createTestRegistry();
    const converter = new TestPlainTextConverter(); // text/plainのみサポート

    registry.register(converter);

    const input: ConverterInput = {
      fileId: createFileId("test-789"),
      filePath: "/test.pdf",
      mimeType: "application/pdf", // 登録されていない
      content: "pdf content",
      encoding: "utf-8",
    };

    const result = registry.findConverter(input);

    if (!result.success && result.error.code === "CONVERTER_NOT_FOUND") {
      console.log("✅ PASS: CONVERTER_NOT_FOUNDエラーが返された");
      passCount++;
    } else {
      console.log("❌ FAIL: 期待したエラーが返されない");
      console.log("  実際:", result.success ? "成功" : result.error.code);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL: 例外発生", error);
    failCount++;
  }
  console.log();

  // 結果サマリー
  console.log("=".repeat(60));
  console.log("手動テスト結果サマリー");
  console.log("=".repeat(60));
  console.log(`✅ PASS: ${passCount}/5`);
  console.log(`❌ FAIL: ${failCount}/5`);
  console.log(`成功率: ${((passCount / 5) * 100).toFixed(1)}%`);
  console.log();

  if (failCount === 0) {
    console.log("🎉 すべての手動テストが成功しました！");
  } else {
    console.log("⚠️  一部のテストが失敗しました。詳細を確認してください。");
    process.exit(1);
  }
}

// テスト実行
runManualTests().catch((error) => {
  console.error("手動テスト実行中にエラーが発生:", error);
  process.exit(1);
});
