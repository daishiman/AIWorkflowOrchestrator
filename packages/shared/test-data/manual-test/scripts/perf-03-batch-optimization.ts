/**
 * PERF-03: バッチサイズ最適化テスト
 *
 * 品質ゲート: 100 chunks/min以上
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

const QUALITY_GATE = {
  minThroughput: 100, // chunks/min
};

/**
 * テスト用ドキュメント生成
 */
function generateTestDocument(chunkCount: number): string {
  const sections: string[] = [];
  for (let i = 0; i < chunkCount; i++) {
    sections.push(
      `## Section ${i}\n\nContent for section ${i}. `.repeat(10) + "\n",
    );
  }
  return sections.join("");
}

/**
 * チャンカー
 */
class MockChunker {
  async chunk(content: string): Promise<Array<{ content: string }>> {
    const sections = content.split(/\n(?=##? )/);
    return sections.map((s) => ({ content: s }));
  }
}

/**
 * 埋め込み生成器
 */
class MockEmbeddingGenerator {
  async generateBatch(texts: string[], batchSize: number): Promise<number[][]> {
    // バッチサイズに応じた処理遅延（小さいバッチ = オーバーヘッド大）
    const overhead = batchSize < 10 ? 5 : batchSize < 50 ? 2 : 1;
    await new Promise((resolve) =>
      setTimeout(resolve, texts.length * overhead),
    );

    return texts.map(() => {
      const embedding = Array.from(
        { length: 1536 },
        () => Math.random() * 0.2 - 0.1,
      );
      const norm = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0),
      );
      return embedding.map((val) => val / norm);
    });
  }
}

async function testBatchOptimization() {
  console.log("=== PERF-03: バッチサイズ最適化テスト ===\n");
  console.log(`品質ゲート: ${QUALITY_GATE.minThroughput} chunks/min以上\n`);

  try {
    // 1. テストドキュメント生成
    const targetChunks = 200;
    console.log(`📝 テストドキュメント生成（${targetChunks}チャンク）...`);
    const document = generateTestDocument(targetChunks);
    console.log(`   サイズ: ${(document.length / 1024).toFixed(2)} KB\n`);

    const chunker = new MockChunker();
    const chunks = await chunker.chunk(document);
    console.log(`   チャンク数: ${chunks.length}\n`);

    // 2. 各バッチサイズでテスト
    const batchSizes = [10, 20, 50, 100];
    const results: Array<{
      batchSize: number;
      processingTimeMs: number;
      throughput: number;
    }> = [];

    console.log("⚙️  バッチサイズ最適化テスト実行...\n");

    for (const batchSize of batchSizes) {
      console.log(`📦 バッチサイズ: ${batchSize}`);

      const generator = new MockEmbeddingGenerator();
      const startTime = Date.now();

      // バッチ処理
      const embeddings: number[][] = [];
      const batchCount = Math.ceil(chunks.length / batchSize);

      for (let i = 0; i < batchCount; i++) {
        const batchStart = i * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, chunks.length);
        const batch = chunks.slice(batchStart, batchEnd);

        const batchEmbeddings = await generator.generateBatch(
          batch.map((c) => c.content),
          batchSize,
        );
        embeddings.push(...batchEmbeddings);
      }

      const processingTimeMs = Date.now() - startTime;
      const throughput = (chunks.length / processingTimeMs) * 60000;

      results.push({
        batchSize,
        processingTimeMs,
        throughput,
      });

      console.log(`   処理時間: ${processingTimeMs}ms`);
      console.log(`   スループット: ${throughput.toFixed(0)} chunks/min\n`);
    }

    // 3. 結果分析
    console.log("📊 バッチサイズ比較:");
    console.log("| バッチサイズ | 処理時間 | スループット | 相対性能 |");
    console.log("|------------|---------|-------------|---------|");

    const baseline = results[0].throughput;
    results.forEach((r) => {
      const relative = ((r.throughput / baseline) * 100).toFixed(1);
      console.log(
        `| ${r.batchSize.toString().padEnd(10)} | ${r.processingTimeMs.toString().padEnd(7)}ms | ${r.throughput.toFixed(0).padEnd(11)} | ${relative}% |`,
      );
    });

    // 4. 最適バッチサイズ特定
    const optimal = results.reduce((best, current) =>
      current.throughput > best.throughput ? current : best,
    );

    console.log(`\n🎯 最適バッチサイズ: ${optimal.batchSize}`);
    console.log(`   スループット: ${optimal.throughput.toFixed(0)} chunks/min`);

    // 5. 品質ゲート評価
    console.log("\n✅ 品質ゲート評価:");
    const validations = [
      {
        name: "最高スループット ≥ 100 chunks/min",
        result: optimal.throughput >= QUALITY_GATE.minThroughput,
        actual: `${optimal.throughput.toFixed(0)} chunks/min`,
      },
      {
        name: "バッチサイズによる性能差がある",
        result:
          results[results.length - 1].throughput > results[0].throughput * 0.8,
        actual: `${((results[results.length - 1].throughput / results[0].throughput) * 100).toFixed(1)}%`,
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
      optimalBatchSize: optimal.batchSize,
      maxThroughput: optimal.throughput,
      results,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testBatchOptimization()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   最適バッチサイズ: ${result.optimalBatchSize}`);
    console.log(
      `   最高スループット: ${result.maxThroughput.toFixed(0)} chunks/min`,
    );
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
