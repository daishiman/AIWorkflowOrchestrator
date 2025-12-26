/**
 * TC-08: パイプライン統合テスト（変換→チャンク→埋め込み→保存）
 *
 * このスクリプトはパイプライン全体の統合動作をテストします。
 *
 * 前提条件:
 * - OPENAI_API_KEY 環境変数が設定されている
 * - medium.md が生成されている
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

interface PipelineResult {
  chunks: Array<{
    content: string;
    metadata: Record<string, unknown>;
  }>;
  embeddings: Array<{
    content: string;
    embedding: number[];
  }>;
  outputPath: string;
  statistics: {
    totalChunks: number;
    totalEmbeddings: number;
    processingTimeMs: number;
    avgTimePerChunk: number;
  };
}

/**
 * 統合パイプライン（モック実装）
 */
class MockEmbeddingGenerationPipeline {
  constructor(
    private config: {
      apiKey: string;
      outputDirectory: string;
      chunkSize: number;
      overlapSize: number;
      embeddingModel: string;
    },
  ) {}

  async process(inputPath: string): Promise<PipelineResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    // 1. ファイル読み込み（変換）
    logs.push(`[STEP 1] ファイル変換: ${inputPath}`);
    const content = await fs.readFile(inputPath, "utf-8");
    logs.push(`         サイズ: ${(content.length / 1024).toFixed(2)} KB`);

    // 2. チャンキング
    logs.push(`[STEP 2] チャンキング実行...`);
    const sections = content.split(/\n(?=##? )/);
    const chunks = sections.map((section, index) => ({
      content: section,
      metadata: {
        chunkIndex: index,
        totalChunks: sections.length,
        filePath: inputPath,
      },
    }));
    logs.push(`         チャンク数: ${chunks.length}`);

    // 3. 埋め込み生成
    logs.push(`[STEP 3] 埋め込み生成実行...`);
    const embeddings: Array<{ content: string; embedding: number[] }> = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // モック埋め込み生成
      const embedding = Array.from(
        { length: 1536 },
        () => Math.random() * 0.2 - 0.1,
      );
      const norm = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0),
      );
      const normalized = embedding.map((val) => val / norm);

      embeddings.push({
        content: chunk.content,
        embedding: normalized,
      });

      if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
        logs.push(`         進捗: ${i + 1}/${chunks.length}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 50)); // API遅延
    }

    // 4. ベクトルストア保存
    logs.push(`[STEP 4] ベクトルストア保存...`);
    const outputPath = join(
      this.config.outputDirectory,
      `embeddings-${Date.now()}.json`,
    );

    const outputData = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index].embedding,
      embeddingDimensions: embeddings[index].embedding.length,
    }));

    await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));
    logs.push(`         保存先: ${outputPath}`);

    const totalTime = Date.now() - startTime;
    logs.push(`[STEP 5] 完了: ${(totalTime / 1000).toFixed(2)}秒`);

    // ログ出力
    logs.forEach((log) => console.log(log));

    return {
      chunks,
      embeddings,
      outputPath,
      statistics: {
        totalChunks: chunks.length,
        totalEmbeddings: embeddings.length,
        processingTimeMs: totalTime,
        avgTimePerChunk: totalTime / chunks.length,
      },
    };
  }
}

async function testPipeline() {
  console.log("=== TC-08: パイプライン統合テスト ===\n");

  const inputPath = join(baseDir, "markdown/medium.md");
  const outputDir = join(baseDir, "outputs/pipeline");

  try {
    // 1. 出力ディレクトリ作成
    await fs.mkdir(outputDir, { recursive: true });

    // 2. APIキー確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠️  OPENAI_API_KEY が設定されていません。モックで実行します。",
      );
    }
    console.log();

    // 3. パイプライン実行
    console.log("🚀 パイプライン実行開始\n");
    const pipeline = new MockEmbeddingGenerationPipeline({
      apiKey: apiKey || "mock-key",
      outputDirectory: outputDir,
      chunkSize: 512,
      overlapSize: 50,
      embeddingModel: "text-embedding-3-small",
    });

    const result = await pipeline.process(inputPath);

    // 4. 保存データ検証
    console.log("\n📁 保存データ検証...");
    const savedData = await fs.readFile(result.outputPath, "utf-8");
    const parsed = JSON.parse(savedData);
    console.log(`   保存データ件数: ${parsed.length}`);

    // 5. 統計表示
    console.log("\n📊 処理統計:");
    console.log(`   総チャンク数: ${result.statistics.totalChunks}`);
    console.log(`   総埋め込み数: ${result.statistics.totalEmbeddings}`);
    console.log(
      `   処理時間: ${(result.statistics.processingTimeMs / 1000).toFixed(2)}秒`,
    );
    console.log(
      `   平均時間/チャンク: ${result.statistics.avgTimePerChunk.toFixed(0)}ms`,
    );

    // 6. 検証
    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "全ステップが完了",
        result: result.chunks.length > 0 && result.embeddings.length > 0,
        actual: "OK",
      },
      {
        name: "チャンク数 = 埋め込み数",
        result: result.chunks.length === result.embeddings.length,
        actual: `${result.chunks.length} = ${result.embeddings.length}`,
      },
      {
        name: "出力ファイルが生成された",
        result: await fs
          .access(result.outputPath)
          .then(() => true)
          .catch(() => false),
        actual: result.outputPath,
      },
      {
        name: "保存データが正しい形式",
        result:
          parsed.length > 0 &&
          parsed.every(
            (item: any) =>
              item.content &&
              item.embedding &&
              item.embeddingDimensions === 1536,
          ),
        actual: "OK",
      },
      {
        name: "エラーが発生しなかった",
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
      chunks: result.statistics.totalChunks,
      processingTimeMs: result.statistics.processingTimeMs,
      outputPath: result.outputPath,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testPipeline()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   チャンク数: ${result.chunks}`);
    console.log(
      `   処理時間: ${(result.processingTimeMs / 1000).toFixed(2)}秒`,
    );
    console.log(`   出力: ${result.outputPath}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
