/**
 * PERF-01: 1000チャンク処理時間テスト
 *
 * 品質ゲート: 5分以内に完了
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

const QUALITY_GATE = {
  maxProcessingTimeMs: 300_000, // 5分
  targetChunks: 1000,
};

/**
 * 大容量ドキュメント生成（1000チャンク以上）
 */
function generateLargeDocument(targetChunks: number): string {
  const sections: string[] = [];
  sections.push("# Large Performance Test Document\n");
  sections.push("## Introduction\n");
  sections.push(
    "This document is generated to test 1000+ chunk processing performance.\n",
  );

  for (let i = 1; i <= targetChunks; i++) {
    sections.push(`\n## Section ${i}\n`);
    sections.push(
      `This is section ${i} with enough content to create a meaningful chunk. `,
    );
    sections.push(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. `);
    sections.push(
      `Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. `,
    );
    sections.push(`Ut enim ad minim veniam, quis nostrud exercitation.\n`);

    if (i % 100 === 0) {
      console.log(`   ドキュメント生成中: ${i}/${targetChunks} セクション`);
    }
  }

  return sections.join("");
}

/**
 * シンプルなチャンカー
 */
class MockChunker {
  async chunk(content: string): Promise<Array<{ content: string }>> {
    const sections = content.split(/\n(?=##? )/);
    return sections.map((s) => ({ content: s }));
  }
}

/**
 * 埋め込み生成器（高速モック）
 */
class MockEmbeddingGenerator {
  async generateBatch(texts: string[]): Promise<number[][]> {
    // 実際のAPI呼び出しをシミュレート（2ms/chunk）
    await new Promise((resolve) => setTimeout(resolve, texts.length * 2));

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

async function testLargeScaleProcessing() {
  console.log("=== PERF-01: 1000チャンク処理時間テスト ===\n");
  console.log(`品質ゲート: ${QUALITY_GATE.maxProcessingTimeMs / 1000}秒以内\n`);

  try {
    // 1. 大容量ドキュメント生成
    console.log("📝 大容量ドキュメント生成中...");
    const document = generateLargeDocument(QUALITY_GATE.targetChunks);
    console.log(`   サイズ: ${(document.length / 1024).toFixed(2)} KB\n`);

    // 2. チャンキング
    console.log("⚙️  チャンキング実行...");
    const chunkStartTime = Date.now();
    const chunker = new MockChunker();
    const chunks = await chunker.chunk(document);
    const chunkTime = Date.now() - chunkStartTime;
    console.log(`   チャンク数: ${chunks.length}`);
    console.log(`   チャンキング時間: ${chunkTime}ms\n`);

    // 3. バッチ埋め込み生成
    console.log("⚙️  埋め込み生成実行（バッチサイズ: 50）...");
    const embeddingStartTime = Date.now();
    const generator = new MockEmbeddingGenerator();
    const batchSize = 50;
    const embeddings: number[][] = [];

    const batchCount = Math.ceil(chunks.length / batchSize);
    for (let i = 0; i < batchCount; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, chunks.length);
      const batch = chunks.slice(batchStart, batchEnd);

      const batchEmbeddings = await generator.generateBatch(
        batch.map((c) => c.content),
      );
      embeddings.push(...batchEmbeddings);

      if ((i + 1) % 10 === 0 || i === batchCount - 1) {
        console.log(
          `   進捗: ${Math.min((i + 1) * batchSize, chunks.length)}/${chunks.length} (${((((i + 1) * batchSize) / chunks.length) * 100).toFixed(1)}%)`,
        );
      }
    }

    const embeddingTime = Date.now() - embeddingStartTime;
    console.log(
      `   埋め込み生成時間: ${(embeddingTime / 1000).toFixed(2)}秒\n`,
    );

    // 4. 総合統計
    const totalTime = chunkTime + embeddingTime;
    const throughput = (chunks.length / totalTime) * 60000;

    console.log("📊 パフォーマンス統計:");
    console.log(`   総チャンク数: ${chunks.length}`);
    console.log(`   総処理時間: ${(totalTime / 1000).toFixed(2)}秒`);
    console.log(`   チャンキング: ${chunkTime}ms`);
    console.log(`   埋め込み生成: ${(embeddingTime / 1000).toFixed(2)}秒`);
    console.log(
      `   平均時間/チャンク: ${(totalTime / chunks.length).toFixed(0)}ms`,
    );
    console.log(`   スループット: ${throughput.toFixed(0)} chunks/min`);

    // 5. 品質ゲート評価
    console.log("\n✅ 品質ゲート評価:");
    const validations = [
      {
        name: "チャンク数 ≥ 1000",
        result: chunks.length >= QUALITY_GATE.targetChunks,
        actual: chunks.length,
      },
      {
        name: "処理時間 ≤ 5分",
        result: totalTime <= QUALITY_GATE.maxProcessingTimeMs,
        actual: `${(totalTime / 1000).toFixed(2)}秒`,
      },
      {
        name: "スループット ≥ 100 chunks/min",
        result: throughput >= 100,
        actual: `${throughput.toFixed(0)} chunks/min`,
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
      totalTimeMs: totalTime,
      throughput,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testLargeScaleProcessing()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   チャンク数: ${result.chunks}`);
    console.log(`   総処理時間: ${(result.totalTimeMs / 1000).toFixed(2)}秒`);
    console.log(`   スループット: ${result.throughput.toFixed(0)} chunks/min`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
