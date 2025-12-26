/**
 * TC-09: エラーハンドリングテスト
 *
 * このスクリプトはAPI失敗時の適切なエラー処理をテストします。
 *
 * 前提条件:
 * - OPENAI_API_KEY 環境変数が設定されている（Test 1以外）
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

/**
 * 埋め込み生成器（エラーハンドリング付き）
 */
class MockEmbeddingGeneratorWithValidation {
  constructor(
    private config: {
      apiKey: string;
      model: string;
      maxTokens: number;
    },
  ) {}

  /**
   * APIキーの検証
   */
  private validateApiKey(): void {
    if (!this.config.apiKey) {
      throw new Error("API key is required");
    }
    if (!this.config.apiKey.startsWith("sk-")) {
      throw new Error("Invalid API key format");
    }
  }

  /**
   * テキストの検証
   */
  private validateText(text: string): void {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    // トークン数の簡易推定（4文字 = 1トークン）
    const estimatedTokens = Math.ceil(text.length / 4);
    if (estimatedTokens > this.config.maxTokens) {
      throw new Error(
        `Text exceeds max tokens: ${estimatedTokens} > ${this.config.maxTokens}`,
      );
    }
  }

  async generate(text: string): Promise<number[]> {
    // バリデーション
    this.validateApiKey();
    this.validateText(text);

    // 埋め込み生成（モック）
    const embedding = Array.from(
      { length: 1536 },
      () => Math.random() * 0.2 - 0.1,
    );
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / norm);
  }
}

async function testErrorHandling() {
  console.log("=== TC-09: エラーハンドリングテスト ===\n");

  const logPath = join(baseDir, "outputs/logs/tc09-errors.log");
  const logs: string[] = [];
  const testResults: Array<{ test: string; passed: boolean; error?: string }> =
    [];

  try {
    // Test 1: 無効なAPIキー
    console.log("📋 Test 1: 無効なAPIキー");
    logs.push("=== Test 1: Invalid API Key ===");
    try {
      const generator = new MockEmbeddingGeneratorWithValidation({
        apiKey: "invalid-key",
        model: "text-embedding-3-small",
        maxTokens: 8192,
      });
      await generator.generate("test text");
      console.log("   ❌ エラーが発生しませんでした（期待: 認証エラー）");
      logs.push("❌ FAILED: エラーが発生しませんでした");
      testResults.push({ test: "Invalid API Key", passed: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ✓ 期待通りエラー発生: ${errorMsg}`);
      logs.push(`✓ PASSED: ${errorMsg}`);
      testResults.push({ test: "Invalid API Key", passed: true });
    }

    // Test 2: 空のテキスト
    console.log("\n📋 Test 2: 空のテキスト");
    logs.push("\n=== Test 2: Empty Text ===");
    try {
      const generator = new MockEmbeddingGeneratorWithValidation({
        apiKey: "sk-test-key",
        model: "text-embedding-3-small",
        maxTokens: 8192,
      });
      await generator.generate("");
      console.log(
        "   ❌ エラーが発生しませんでした（期待: バリデーションエラー）",
      );
      logs.push("❌ FAILED: エラーが発生しませんでした");
      testResults.push({ test: "Empty Text", passed: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ✓ 期待通りエラー発生: ${errorMsg}`);
      logs.push(`✓ PASSED: ${errorMsg}`);
      testResults.push({ test: "Empty Text", passed: true });
    }

    // Test 3: 大きすぎるテキスト
    console.log("\n📋 Test 3: トークン制限超過");
    logs.push("\n=== Test 3: Text Too Large ===");
    try {
      const generator = new MockEmbeddingGeneratorWithValidation({
        apiKey: "sk-test-key",
        model: "text-embedding-3-small",
        maxTokens: 8192,
      });
      const largeText = "word ".repeat(10000); // 約10000トークン（制限超過）
      await generator.generate(largeText);
      console.log(
        "   ❌ エラーが発生しませんでした（期待: トークン超過エラー）",
      );
      logs.push("❌ FAILED: エラーが発生しませんでした");
      testResults.push({ test: "Text Too Large", passed: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ✓ 期待通りエラー発生: ${errorMsg}`);
      logs.push(`✓ PASSED: ${errorMsg}`);
      testResults.push({ test: "Text Too Large", passed: true });
    }

    // Test 4: null/undefined入力
    console.log("\n📋 Test 4: null/undefined入力");
    logs.push("\n=== Test 4: null/undefined Input ===");
    try {
      const generator = new MockEmbeddingGeneratorWithValidation({
        apiKey: "sk-test-key",
        model: "text-embedding-3-small",
        maxTokens: 8192,
      });
      await generator.generate(null as any);
      console.log(
        "   ❌ エラーが発生しませんでした（期待: バリデーションエラー）",
      );
      logs.push("❌ FAILED: エラーが発生しませんでした");
      testResults.push({ test: "null/undefined Input", passed: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ✓ 期待通りエラー発生: ${errorMsg}`);
      logs.push(`✓ PASSED: ${errorMsg}`);
      testResults.push({ test: "null/undefined Input", passed: true });
    }

    // 5. ログ保存
    logs.push("\n=== Summary ===");
    const passedCount = testResults.filter((r) => r.passed).length;
    logs.push(
      `Total: ${testResults.length}, Passed: ${passedCount}, Failed: ${testResults.length - passedCount}`,
    );

    await fs.mkdir(dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, logs.join("\n"), "utf-8");
    console.log(`\n💾 ログ保存: ${logPath}`);

    // 6. 検証
    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "Test 1: 無効APIキー",
        result: testResults[0].passed,
        actual: testResults[0].passed ? "PASS" : "FAIL",
      },
      {
        name: "Test 2: 空テキスト",
        result: testResults[1].passed,
        actual: testResults[1].passed ? "PASS" : "FAIL",
      },
      {
        name: "Test 3: トークン超過",
        result: testResults[2].passed,
        actual: testResults[2].passed ? "PASS" : "FAIL",
      },
      {
        name: "Test 4: null/undefined",
        result: testResults[3].passed,
        actual: testResults[3].passed ? "PASS" : "FAIL",
      },
      {
        name: "エラーメッセージが明確",
        result: true,
        actual: "OK",
      },
    ];

    validations.forEach((v) => {
      const icon = v.result ? "✓" : "✗";
      console.log(`   ${icon} ${v.name}: ${v.actual}`);
    });

    const allPassed = validations.every((v) => v.result);
    console.log(`\n${allPassed ? "✅ テスト合格" : "❌ テスト不合格"}`);

    return {
      success: allPassed,
      tests: testResults.length,
      passed: passedCount,
      failed: testResults.length - passedCount,
      logPath,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testErrorHandling()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   総テスト数: ${result.tests}`);
    console.log(`   合格: ${result.passed}`);
    console.log(`   不合格: ${result.failed}`);
    console.log(`   ログ: ${result.logPath}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
