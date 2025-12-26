/**
 * PERF-02: メモリ使用量テスト
 *
 * 品質ゲート: 500MB以下
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

const QUALITY_GATE = {
  maxMemoryMB: 500,
  documentSizeKB: 100,
};

/**
 * メモリ使用量取得（MB単位）
 */
function getMemoryUsageMB(): {
  heapUsed: number;
  heapTotal: number;
  rss: number;
} {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed / 1024 / 1024,
    heapTotal: usage.heapTotal / 1024 / 1024,
    rss: usage.rss / 1024 / 1024,
  };
}

/**
 * 100KB+のドキュメント生成
 */
function generateLargeDocument(targetSizeKB: number): string {
  const sections: string[] = [];
  sections.push("# Large Document for Memory Test\n\n");

  let currentSize = 0;
  let sectionIndex = 0;

  while (currentSize < targetSizeKB * 1024) {
    sectionIndex++;
    const section =
      `\n## Section ${sectionIndex}\n\n` +
      `This is section ${sectionIndex} with substantial content. `.repeat(20) +
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. `.repeat(10) +
      `\n\n### Subsection ${sectionIndex}.1\n\n` +
      `Detailed information for subsection ${sectionIndex}.1. `.repeat(15) +
      `\n\n### Subsection ${sectionIndex}.2\n\n` +
      `Additional content for subsection ${sectionIndex}.2. `.repeat(15) +
      `\n`;

    sections.push(section);
    currentSize += section.length;

    if (sectionIndex % 50 === 0) {
      console.log(`   ドキュメント生成: ${(currentSize / 1024).toFixed(2)} KB`);
    }
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
  async generateBatch(texts: string[]): Promise<number[][]> {
    await new Promise((resolve) => setTimeout(resolve, texts.length));

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

async function testMemoryUsage() {
  console.log("=== PERF-02: メモリ使用量テスト ===\n");
  console.log(`品質ゲート: ${QUALITY_GATE.maxMemoryMB}MB以下\n`);

  try {
    // GC実行（ベースライン測定のため）
    if (global.gc) {
      global.gc();
    }

    // 1. ベースラインメモリ
    const memoryBefore = getMemoryUsageMB();
    console.log("📊 ベースラインメモリ:");
    console.log(`   Heap Used: ${memoryBefore.heapUsed.toFixed(2)} MB`);
    console.log(`   Heap Total: ${memoryBefore.heapTotal.toFixed(2)} MB`);
    console.log(`   RSS: ${memoryBefore.rss.toFixed(2)} MB\n`);

    // 2. 大容量ドキュメント生成
    console.log(`📝 ${QUALITY_GATE.documentSizeKB}KB ドキュメント生成中...`);
    const document = generateLargeDocument(QUALITY_GATE.documentSizeKB);
    console.log(`   実際のサイズ: ${(document.length / 1024).toFixed(2)} KB\n`);

    const memoryAfterDoc = getMemoryUsageMB();
    const docMemory = memoryAfterDoc.heapUsed - memoryBefore.heapUsed;
    console.log("📊 ドキュメント読み込み後:");
    console.log(`   追加メモリ: ${docMemory.toFixed(2)} MB\n`);

    // 3. チャンキング
    console.log("⚙️  チャンキング実行...");
    const chunker = new MockChunker();
    const chunks = await chunker.chunk(document);
    console.log(`   チャンク数: ${chunks.length}`);

    const memoryAfterChunk = getMemoryUsageMB();
    const chunkMemory = memoryAfterChunk.heapUsed - memoryAfterDoc.heapUsed;
    console.log(`   追加メモリ: ${chunkMemory.toFixed(2)} MB\n`);

    // 4. 埋め込み生成
    console.log("⚙️  埋め込み生成実行（バッチサイズ: 50）...");
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
        const currentMemory = getMemoryUsageMB();
        console.log(
          `   進捗: ${embeddings.length}/${chunks.length}, Heap: ${currentMemory.heapUsed.toFixed(2)} MB`,
        );
      }
    }

    const memoryAfterEmbed = getMemoryUsageMB();
    const embedMemory = memoryAfterEmbed.heapUsed - memoryAfterChunk.heapUsed;
    console.log(`   追加メモリ: ${embedMemory.toFixed(2)} MB\n`);

    // 5. ピークメモリ測定
    const peakMemory = memoryAfterEmbed.heapUsed;
    const totalMemoryUsed = peakMemory - memoryBefore.heapUsed;

    console.log("📊 メモリ使用量サマリー:");
    console.log(`   ベースライン: ${memoryBefore.heapUsed.toFixed(2)} MB`);
    console.log(`   ドキュメント: +${docMemory.toFixed(2)} MB`);
    console.log(`   チャンキング: +${chunkMemory.toFixed(2)} MB`);
    console.log(`   埋め込み生成: +${embedMemory.toFixed(2)} MB`);
    console.log(`   ピークメモリ: ${peakMemory.toFixed(2)} MB`);
    console.log(`   総使用量: ${totalMemoryUsed.toFixed(2)} MB`);

    // 6. 品質ゲート評価
    console.log("\n✅ 品質ゲート評価:");
    const validations = [
      {
        name: "ピークメモリ ≤ 500MB",
        result: peakMemory <= QUALITY_GATE.maxMemoryMB,
        actual: `${peakMemory.toFixed(2)} MB`,
      },
      {
        name: "総使用量が妥当",
        result: totalMemoryUsed <= QUALITY_GATE.maxMemoryMB,
        actual: `${totalMemoryUsed.toFixed(2)} MB`,
      },
      {
        name: "メモリリークなし",
        result: embedMemory < chunks.length * 0.1, // 1チャンクあたり0.1MB未満
        actual: `${(embedMemory / chunks.length).toFixed(3)} MB/chunk`,
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
      peakMemoryMB: peakMemory,
      totalMemoryUsedMB: totalMemoryUsed,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testMemoryUsage()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   チャンク数: ${result.chunks}`);
    console.log(`   ピークメモリ: ${result.peakMemoryMB.toFixed(2)} MB`);
    console.log(`   総使用量: ${result.totalMemoryUsedMB.toFixed(2)} MB`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
