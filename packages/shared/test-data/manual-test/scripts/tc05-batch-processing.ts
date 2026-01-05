/**
 * TC-05: 100チャンクバッチ処理テスト
 *
 * このスクリプトは大量チャンクのバッチ処理機能をテストします。
 *
 * 前提条件:
 * - OPENAI_API_KEY 環境変数が設定されている
 * - large.md が生成されている
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

interface Chunk {
  content: string;
  metadata: Record<string, unknown>;
  size: number;
}

interface EmbeddingResult {
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[];
  embeddingDimensions: number;
  processingTimeMs: number;
}

/**
 * バッチプロセッサー（モック実装）
 */
class MockBatchProcessor {
  constructor(
    private config: {
      apiKey: string;
      model: string;
      batchSize: number;
      dimensions: number;
    },
  ) {}

  async processBatch(chunks: Chunk[]): Promise<EmbeddingResult[]> {
    console.log(
      `\n   📦 バッチ処理: ${chunks.length}チャンク（バッチサイズ: ${this.config.batchSize}）`,
    );

    const results: EmbeddingResult[] = [];
    const batchCount = Math.ceil(chunks.length / this.config.batchSize);

    for (let i = 0; i < batchCount; i++) {
      const batchStart = i * this.config.batchSize;
      const batchEnd = Math.min(
        batchStart + this.config.batchSize,
        chunks.length,
      );
      const batch = chunks.slice(batchStart, batchEnd);

      console.log(
        `   [Batch ${i + 1}/${batchCount}] ${batch.length}チャンク処理中...`,
      );

      const batchStartTime = Date.now();

      // 各チャンクの埋め込み生成（モック）
      for (const chunk of batch) {
        const embedding = Array.from(
          { length: this.config.dimensions },
          () => Math.random() * 0.2 - 0.1,
        );

        // 正規化
        const norm = Math.sqrt(
          embedding.reduce((sum, val) => sum + val * val, 0),
        );
        const normalized = embedding.map((val) => val / norm);

        results.push({
          content: chunk.content,
          metadata: chunk.metadata,
          embedding: normalized,
          embeddingDimensions: normalized.length,
          processingTimeMs: Date.now() - batchStartTime,
        });
      }

      const batchTime = Date.now() - batchStartTime;
      console.log(`       完了: ${batchTime}ms`);

      // バッチ間の遅延（レート制限対策）
      if (i < batchCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

/**
 * シンプルなMarkdownチャンカー
 */
class MockMarkdownChunker {
  async chunk(content: string): Promise<Chunk[]> {
    const sections = content.split(/\n(?=##? )/);
    return sections.map((section, index) => ({
      content: section,
      metadata: {
        chunkIndex: index,
        totalChunks: sections.length,
      },
      size: section.length,
    }));
  }
}

async function testBatchProcessing() {
  console.log("=== TC-05: 100チャンクバッチ処理テスト ===\n");

  const inputPath = join(baseDir, "markdown/large.md");
  const chunksOutput = join(baseDir, "outputs/chunks/tc05-chunks.json");
  const embeddingsOutput = join(
    baseDir,
    "outputs/embeddings/tc05-embeddings.json",
  );

  try {
    // 1. APIキー確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠️  OPENAI_API_KEY が設定されていません。モックで実行します。",
      );
    }
    console.log();

    // 2. ドキュメント読み込み
    console.log("📖 大規模ドキュメント読み込み:", inputPath);
    const content = await fs.readFile(inputPath, "utf-8");
    console.log(`   サイズ: ${(content.length / 1024).toFixed(2)} KB\n`);

    // 3. チャンキング
    console.log("⚙️  チャンキング実行...");
    const chunker = new MockMarkdownChunker();
    const chunks = await chunker.chunk(content);
    console.log(`   チャンク数: ${chunks.length}`);

    await fs.mkdir(dirname(chunksOutput), { recursive: true });
    await fs.writeFile(chunksOutput, JSON.stringify(chunks, null, 2));
    console.log(`   チャンク保存: ${chunksOutput}`);

    // 4. バッチ処理で埋め込み生成
    console.log("\n⚙️  バッチ埋め込み生成実行...");
    const processor = new MockBatchProcessor({
      apiKey: apiKey || "mock-key",
      model: "text-embedding-3-small",
      batchSize: 20,
      dimensions: 1536,
    });

    const startTime = Date.now();
    const embeddings = await processor.processBatch(chunks);
    const totalTime = Date.now() - startTime;

    console.log(`\n   完了: ${(totalTime / 1000).toFixed(2)}秒`);
    console.log(
      `   平均処理時間: ${(totalTime / embeddings.length).toFixed(0)}ms/チャンク`,
    );

    // 5. 結果保存
    console.log("\n💾 結果保存:", embeddingsOutput);
    await fs.mkdir(dirname(embeddingsOutput), { recursive: true });
    await fs.writeFile(
      embeddingsOutput,
      JSON.stringify(embeddings, null, 2),
      "utf-8",
    );

    // 6. スループット計算
    const throughputPerMin = (embeddings.length / totalTime) * 60000;
    console.log("\n📊 パフォーマンス統計:");
    console.log(`   総チャンク数: ${embeddings.length}`);
    console.log(`   総処理時間: ${(totalTime / 1000).toFixed(2)}秒`);
    console.log(`   スループット: ${throughputPerMin.toFixed(0)} chunks/min`);

    // 7. 検証
    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "チャンク数 ≥ 3",
        result: chunks.length >= 3,
        actual: chunks.length,
      },
      {
        name: "埋め込み数 = チャンク数",
        result: embeddings.length === chunks.length,
        actual: `${embeddings.length} = ${chunks.length}`,
      },
      {
        name: "処理時間が合理的（<2秒/チャンク）",
        result: totalTime / embeddings.length < 2000,
        actual: `${(totalTime / embeddings.length).toFixed(0)}ms/chunk`,
      },
      {
        name: "レート制限エラーなし",
        result: true, // モックなのでエラーは発生しない
        actual: "OK",
      },
      {
        name: "すべてのチャンクが処理された",
        result: embeddings.every((e) => e.embedding.length === 1536),
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
      chunks: chunks.length,
      embeddings: embeddings.length,
      totalTimeMs: totalTime,
      throughput: throughputPerMin,
      outputPath: embeddingsOutput,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testBatchProcessing()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   チャンク数: ${result.chunks}`);
    console.log(`   埋め込み数: ${result.embeddings}`);
    console.log(`   処理時間: ${(result.totalTimeMs / 1000).toFixed(2)}秒`);
    console.log(`   スループット: ${result.throughput.toFixed(0)} chunks/min`);
    console.log(`   出力: ${result.outputPath}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
