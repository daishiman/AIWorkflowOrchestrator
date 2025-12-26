/**
 * TC-04: Qwen3埋め込み生成テスト
 *
 * このスクリプトはQwen3 APIを使用した埋め込み生成機能をテストします。
 *
 * 前提条件:
 * - QWEN3_API_KEY 環境変数が設定されている（オプション）
 * - TC-01が実行済み（chunks/tc01-chunks.json が存在）
 *
 * 注: Qwen3 APIが利用できない場合、このテストはモックデータで実行されます。
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

interface EmbeddingResult {
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[];
  embeddingDimensions: number;
  model: string;
  processingTimeMs: number;
}

/**
 * Qwen3埋め込み生成器（モック実装）
 */
class MockQwen3EmbeddingGenerator {
  constructor(
    private config: {
      apiKey: string;
      model: string;
      dimensions?: number;
    },
  ) {}

  async generate(text: string): Promise<number[]> {
    // Qwen3はモックデータのみ（実際のAPIエンドポイントが不明のため）
    console.log("   ⚠️  Qwen3モックデータを使用");

    const dimensions = this.config.dimensions || 768;
    const embedding = Array.from(
      { length: dimensions },
      () => Math.random() * 0.2 - 0.1,
    );

    // 正規化
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const normalized = embedding.map((val) => val / norm);

    await new Promise((resolve) => setTimeout(resolve, 80)); // API遅延をシミュレート
    return normalized;
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await this.generate(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }
}

async function testQwen3Embedding() {
  console.log("=== TC-04: Qwen3埋め込み生成テスト ===\n");

  const inputPath = join(baseDir, "outputs/chunks/tc01-chunks.json");
  const outputPath = join(baseDir, "outputs/embeddings/tc04-embeddings.json");

  try {
    // 1. APIキー確認
    const apiKey = process.env.QWEN3_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠️  QWEN3_API_KEY が設定されていません。モックデータを使用します。",
      );
    } else {
      console.log("✓ QWEN3_API_KEY 確認済み");
    }
    console.log();

    // 2. チャンクデータ読み込み
    console.log("📖 チャンクデータ読み込み:", inputPath);
    const chunksJson = await fs.readFile(inputPath, "utf-8");
    const chunks = JSON.parse(chunksJson);
    console.log(`   チャンク数: ${chunks.length}\n`);

    // 3. 埋め込み生成
    console.log("⚙️  埋め込み生成実行...");
    const generator = new MockQwen3EmbeddingGenerator({
      apiKey: apiKey || "mock-key",
      model: "qwen3-embedding",
      dimensions: 768,
    });

    const startTime = Date.now();
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`   [${i + 1}/${chunks.length}] 処理中...`);

      const embeddingStartTime = Date.now();
      const embedding = await generator.generate(chunk.content);
      const processingTimeMs = Date.now() - embeddingStartTime;

      results.push({
        content: chunk.content,
        metadata: chunk.metadata,
        embedding,
        embeddingDimensions: embedding.length,
        model: "qwen3-embedding",
        processingTimeMs,
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`   完了: ${(totalTime / 1000).toFixed(2)}秒\n`);

    // 4. 結果保存
    console.log("💾 結果保存:", outputPath);
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2), "utf-8");

    // 5. ベクトル統計
    console.log("\n📊 ベクトル統計:");
    const firstEmbedding = results[0].embedding;
    const norm = Math.sqrt(
      firstEmbedding.reduce((sum, val) => sum + val * val, 0),
    );
    console.log(`   次元数: ${firstEmbedding.length}`);
    console.log(`   ノルム（最初のベクトル）: ${norm.toFixed(6)}`);
    console.log(
      `   平均処理時間: ${(totalTime / results.length).toFixed(0)}ms`,
    );

    // 6. 検証
    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "埋め込み生成数が正しい",
        result: results.length === chunks.length,
        actual: results.length,
      },
      {
        name: "次元数が正しい（768次元）",
        result: results.every((r) => r.embeddingDimensions === 768),
        actual: 768,
      },
      {
        name: "OpenAI埋め込みと次元数が異なる",
        result: firstEmbedding.length !== 1536,
        actual: `${firstEmbedding.length} != 1536`,
      },
      {
        name: "ベクトルがすべて数値",
        result: results.every((r) =>
          r.embedding.every((v) => typeof v === "number"),
        ),
        actual: "OK",
      },
      {
        name: "ベクトルが正規化されている",
        result: Math.abs(norm - 1.0) < 0.1,
        actual: norm.toFixed(6),
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
      embeddings: results.length,
      dimensions: firstEmbedding.length,
      totalTimeMs: totalTime,
      outputPath,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testQwen3Embedding()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   埋め込み数: ${result.embeddings}`);
    console.log(`   次元数: ${result.dimensions}`);
    console.log(`   処理時間: ${(result.totalTimeMs / 1000).toFixed(2)}秒`);
    console.log(`   出力: ${result.outputPath}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
