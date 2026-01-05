/**
 * PERF-04: 並列処理テスト
 *
 * 品質ゲート: 並列度に応じて処理時間が短縮されること
 */

import { promises as _fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const _baseDir = join(__dirname, "..");

const QUALITY_GATE = {
  minThroughput: 100, // chunks/min
};

/**
 * テストドキュメント生成
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
  async generate(_text: string): Promise<number[]> {
    await new Promise((resolve) => setTimeout(resolve, 10)); // 10ms/リクエスト

    const embedding = Array.from(
      { length: 1536 },
      () => Math.random() * 0.2 - 0.1,
    );
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / norm);
  }
}

/**
 * 並列度制御付きバッチプロセッサー
 */
class ParallelBatchProcessor {
  async processBatch(
    chunks: Array<{ content: string }>,
    batchSize: number,
    concurrency: number,
  ): Promise<number[][]> {
    const generator = new MockEmbeddingGenerator();
    const embeddings: number[][] = [];

    // バッチに分割
    const batches: Array<Array<{ content: string }>> = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      batches.push(chunks.slice(i, i + batchSize));
    }

    // 並列処理
    const executing: Promise<void>[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      const task = (async () => {
        const batchEmbeddings = await Promise.all(
          batch.map((c) => generator.generate(c.content)),
        );
        embeddings.push(...batchEmbeddings);
      })();

      executing.push(task);

      // 並列度制御
      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === task),
          1,
        );
      }
    }

    await Promise.all(executing);
    return embeddings;
  }
}

async function testParallelProcessing() {
  console.log("=== PERF-04: 並列処理テスト ===\n");
  console.log("品質ゲート: 並列度に応じて処理時間が短縮されること\n");

  try {
    // 1. テストドキュメント生成
    const targetChunks = 100;
    console.log(`📝 テストドキュメント生成（${targetChunks}チャンク）...`);
    const document = generateTestDocument(targetChunks);

    const chunker = new MockChunker();
    const chunks = await chunker.chunk(document);
    console.log(`   チャンク数: ${chunks.length}\n`);

    // 2. 各並列度でテスト
    const concurrencies = [1, 2, 4, 8];
    const batchSize = 10;
    const results: Array<{
      concurrency: number;
      processingTimeMs: number;
      speedup: number;
    }> = [];

    console.log("⚙️  並列処理テスト実行...\n");

    for (const concurrency of concurrencies) {
      console.log(`🔄 並列度: ${concurrency}`);

      const processor = new ParallelBatchProcessor();
      const startTime = Date.now();

      await processor.processBatch(chunks, batchSize, concurrency);

      const processingTimeMs = Date.now() - startTime;
      const speedup =
        results.length > 0
          ? results[0].processingTimeMs / processingTimeMs
          : 1.0;

      results.push({
        concurrency,
        processingTimeMs,
        speedup,
      });

      console.log(`   処理時間: ${processingTimeMs}ms`);
      console.log(`   速度向上: ${speedup.toFixed(2)}倍\n`);
    }

    // 3. 結果分析
    console.log("📊 並列度比較:");
    console.log("| 並列度 | 処理時間 | 速度向上 | 効率 |");
    console.log("|-------|---------|---------|------|");

    results.forEach((r) => {
      const efficiency = ((r.speedup / r.concurrency) * 100).toFixed(1);
      console.log(
        `| ${r.concurrency.toString().padEnd(5)} | ${r.processingTimeMs.toString().padEnd(7)}ms | ${r.speedup.toFixed(2)}倍    | ${efficiency}% |`,
      );
    });

    // 4. スループット計算
    const throughputs = results.map((r) => ({
      concurrency: r.concurrency,
      throughput: (chunks.length / r.processingTimeMs) * 60000,
    }));

    console.log("\n📈 スループット:");
    throughputs.forEach((t) => {
      console.log(
        `   並列度${t.concurrency}: ${t.throughput.toFixed(0)} chunks/min`,
      );
    });

    // 5. 品質ゲート評価
    const maxThroughput = Math.max(...throughputs.map((t) => t.throughput));

    console.log("\n✅ 品質ゲート評価:");
    const validations = [
      {
        name: "最高スループット ≥ 100 chunks/min",
        result: maxThroughput >= QUALITY_GATE.minThroughput,
        actual: `${maxThroughput.toFixed(0)} chunks/min`,
      },
      {
        name: "並列度2で速度向上あり",
        result: results[1].speedup > 1.3,
        actual: `${results[1].speedup.toFixed(2)}倍`,
      },
      {
        name: "並列度4で速度向上あり",
        result: results[2].speedup > 2.0,
        actual: `${results[2].speedup.toFixed(2)}倍`,
      },
      {
        name: "並列度8で速度向上あり",
        result: results[3].speedup > 3.0,
        actual: `${results[3].speedup.toFixed(2)}倍`,
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
      maxThroughput,
      optimalConcurrency: throughputs.reduce((best, current) =>
        current.throughput > best.throughput ? current : best,
      ).concurrency,
      results,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testParallelProcessing()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(
      `   最高スループット: ${result.maxThroughput.toFixed(0)} chunks/min`,
    );
    console.log(`   最適並列度: ${result.optimalConcurrency}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
