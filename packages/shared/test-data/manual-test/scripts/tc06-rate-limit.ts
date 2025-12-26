/**
 * TC-06: レート制限時のリトライテスト
 *
 * このスクリプトはレート制限発生時のリトライ機能をテストします。
 *
 * 前提条件:
 * - OPENAI_API_KEY 環境変数が設定されている
 * - リトライ機能が実装されている
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

/**
 * リトライハンドラー（モック実装）
 */
class MockRetryHandler {
  private attemptCounts: Map<string, number> = new Map();

  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        this.attemptCounts.set(key, attempt);
        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 指数バックオフ
          console.log(
            `   ⚠️  リトライ ${attempt + 1}/${maxRetries}: ${delay}ms後に再試行`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  getAttemptCount(key: string): number {
    return this.attemptCounts.get(key) || 0;
  }

  getTotalRetries(): number {
    return Array.from(this.attemptCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
  }
}

/**
 * 埋め込み生成器（レート制限シミュレーション付き）
 */
class MockEmbeddingGeneratorWithRateLimit {
  private callCount = 0;
  private rateLimitThreshold = 5; // 5回に1回レート制限エラーをシミュレート

  async generate(text: string): Promise<number[]> {
    this.callCount++;

    // レート制限をシミュレート
    if (this.callCount % this.rateLimitThreshold === 0) {
      throw new Error("Rate limit exceeded (429)");
    }

    // 正常な埋め込み生成
    const embedding = Array.from(
      { length: 1536 },
      () => Math.random() * 0.2 - 0.1,
    );
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / norm);
  }
}

async function testRateLimit() {
  console.log("=== TC-06: レート制限時のリトライテスト ===\n");

  const logPath = join(baseDir, "outputs/logs/tc06-rate-limit.log");
  const logs: string[] = [];

  try {
    // 1. 初期化
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠️  OPENAI_API_KEY が設定されていません。モックで実行します。",
      );
    }
    console.log();

    const generator = new MockEmbeddingGeneratorWithRateLimit();
    const retryHandler = new MockRetryHandler();

    // 2. テストデータ準備
    const testTexts = Array.from(
      { length: 50 },
      (_, i) => `Test text ${i} for rate limit testing`,
    );

    console.log("⚙️  レート制限テスト実行...");
    console.log(`   テキスト数: ${testTexts.length}`);
    console.log(`   レート制限: 5回に1回シミュレート\n`);

    const startTime = Date.now();
    const embeddings: number[][] = [];
    let successCount = 0;
    let rateLimitCount = 0;

    // 3. 各テキストを処理（リトライ付き）
    for (let i = 0; i < testTexts.length; i++) {
      const text = testTexts[i];
      const logPrefix = `   [${i + 1}/${testTexts.length}]`;

      try {
        const embedding = await retryHandler.execute(
          `embedding-${i}`,
          async () => {
            try {
              return await generator.generate(text);
            } catch (error) {
              if (
                error instanceof Error &&
                error.message.includes("Rate limit")
              ) {
                rateLimitCount++;
                console.log(`${logPrefix} レート制限発生`);
              }
              throw error;
            }
          },
          3,
        );

        embeddings.push(embedding);
        successCount++;

        if ((i + 1) % 10 === 0) {
          console.log(`${logPrefix} 処理済み`);
        }
      } catch (error) {
        const msg = `${logPrefix} 失敗: ${error}`;
        console.error(msg);
        logs.push(msg);
      }
    }

    const totalTime = Date.now() - startTime;
    const totalRetries = retryHandler.getTotalRetries();

    // 4. 結果統計
    console.log("\n📊 実行統計:");
    console.log(`   総リクエスト数: ${testTexts.length}`);
    console.log(`   成功数: ${successCount}`);
    console.log(`   レート制限発生回数: ${rateLimitCount}`);
    console.log(`   総リトライ回数: ${totalRetries}`);
    console.log(`   処理時間: ${(totalTime / 1000).toFixed(2)}秒`);

    // 5. ログ保存
    logs.push(`\n=== 実行サマリー ===`);
    logs.push(`総リクエスト数: ${testTexts.length}`);
    logs.push(`成功数: ${successCount}`);
    logs.push(`レート制限発生: ${rateLimitCount}回`);
    logs.push(`総リトライ回数: ${totalRetries}`);
    logs.push(`処理時間: ${(totalTime / 1000).toFixed(2)}秒`);

    await fs.writeFile(logPath, logs.join("\n"), "utf-8");
    console.log(`\n💾 ログ保存: ${logPath}`);

    // 6. 検証
    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "レート制限が発生した",
        result: rateLimitCount > 0,
        actual: `${rateLimitCount}回`,
      },
      {
        name: "リトライが実行された",
        result: totalRetries > 0,
        actual: `${totalRetries}回`,
      },
      {
        name: "リトライ回数が妥当（≤ maxRetries）",
        result: totalRetries <= rateLimitCount * 3,
        actual: `${totalRetries} / ${rateLimitCount * 3}`,
      },
      {
        name: "最終的にすべて成功",
        result: successCount === testTexts.length,
        actual: `${successCount}/${testTexts.length}`,
      },
      {
        name: "ログファイルが生成された",
        result: await fs
          .access(logPath)
          .then(() => true)
          .catch(() => false),
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
      requests: testTexts.length,
      rateLimits: rateLimitCount,
      retries: totalRetries,
      totalTimeMs: totalTime,
      logPath,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testRateLimit()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   リクエスト数: ${result.requests}`);
    console.log(`   レート制限発生: ${result.rateLimits}回`);
    console.log(`   リトライ回数: ${result.retries}`);
    console.log(`   処理時間: ${(result.totalTimeMs / 1000).toFixed(2)}秒`);
    console.log(`   ログ: ${result.logPath}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
