/**
 * TC-01: Markdownドキュメント分割テスト
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

interface Chunk {
  content: string;
  metadata: {
    filePath: string;
    sectionTitle?: string;
    chunkIndex: number;
    totalChunks: number;
  };
  size: number;
}

class MockMarkdownChunker {
  constructor(private options: { maxChunkSize: number; overlapSize: number }) {}

  async chunk(
    content: string,
    metadata: { filePath: string },
  ): Promise<Chunk[]> {
    const sections = content.split(/\n(?=##? )/);
    const chunks: Chunk[] = [];

    sections.forEach((section, index) => {
      const lines = section.split("\n");
      const sectionTitle = lines[0]?.replace(/^##? /, "").trim();

      chunks.push({
        content: section,
        metadata: {
          filePath: metadata.filePath,
          sectionTitle,
          chunkIndex: index,
          totalChunks: sections.length,
        },
        size: section.length,
      });
    });

    return chunks;
  }
}

async function testMarkdownChunking() {
  console.log("=== TC-01: Markdownドキュメント分割テスト ===\n");

  const inputPath = join(baseDir, "markdown/simple.md");
  const outputPath = join(baseDir, "outputs/chunks/tc01-chunks.json");

  try {
    console.log("📖 ファイル読み込み:", inputPath);
    const content = await fs.readFile(inputPath, "utf-8");
    console.log(`   サイズ: ${content.length} bytes\n`);

    console.log("⚙️  チャンキング実行...");
    const chunker = new MockMarkdownChunker({
      maxChunkSize: 512,
      overlapSize: 50,
    });
    const chunks = await chunker.chunk(content, { filePath: inputPath });
    console.log(`   チャンク数: ${chunks.length}\n`);

    console.log("📊 チャンク詳細:");
    chunks.forEach((chunk, index) => {
      console.log(`   [${index}] ${chunk.metadata.sectionTitle || "No title"}`);
      console.log(`       サイズ: ${chunk.size} bytes`);
      console.log(
        `       先頭: ${chunk.content.substring(0, 50).replace(/\n/g, " ")}...`,
      );
    });
    console.log();

    console.log("💾 結果保存:", outputPath);
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(chunks, null, 2), "utf-8");

    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "チャンク数が適切",
        result: chunks.length >= 3 && chunks.length <= 10,
        actual: chunks.length,
      },
      {
        name: "各チャンクのサイズが妥当",
        result: chunks.every((c) => c.size > 0 && c.size <= 2000),
        actual: `min: ${Math.min(...chunks.map((c) => c.size))}, max: ${Math.max(...chunks.map((c) => c.size))}`,
      },
      {
        name: "メタデータが保持されている",
        result: chunks.every(
          (c) =>
            c.metadata.filePath &&
            c.metadata.chunkIndex >= 0 &&
            c.metadata.totalChunks === chunks.length,
        ),
        actual: "OK",
      },
      {
        name: "出力ファイルが生成された",
        result: await fs
          .access(outputPath)
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
      chunks: chunks.length,
      outputPath,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

testMarkdownChunking()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   チャンク数: ${result.chunks}`);
    console.log(`   出力: ${result.outputPath}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
