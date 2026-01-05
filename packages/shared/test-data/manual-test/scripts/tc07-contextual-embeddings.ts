/**
 * TC-07: Contextual Embeddings（コンテキスト付与）テスト
 *
 * このスクリプトはチャンクにコンテキスト情報を付与する機能をテストします。
 *
 * 前提条件:
 * - OPENAI_API_KEY 環境変数が設定されている
 * - TC-01が実行済み（chunks/tc01-chunks.json が存在）
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

interface ContextualChunk extends Chunk {
  context: {
    previous?: string;
    next?: string;
    documentTitle?: string;
  };
}

interface ContextualEmbedding {
  content: string;
  context: {
    previous?: string;
    next?: string;
    documentTitle?: string;
  };
  embedding: number[];
  embeddingDimensions: number;
  hasContext: boolean;
}

/**
 * コンテキスト付与プロセッサー（モック実装）
 */
class MockContextualEmbeddingProcessor {
  constructor(
    private config: {
      apiKey: string;
      contextWindow: number;
      contextStrategy: "surrounding" | "hierarchical";
    },
  ) {}

  /**
   * チャンクにコンテキストを付与
   */
  addContext(chunks: Chunk[]): ContextualChunk[] {
    return chunks.map((chunk, index) => {
      const context: ContextualChunk["context"] = {};

      if (this.config.contextStrategy === "surrounding") {
        // 前後のチャンクをコンテキストとして追加
        if (index > 0 && this.config.contextWindow >= 1) {
          context.previous = chunks[index - 1].content.substring(0, 100);
        }

        if (index < chunks.length - 1 && this.config.contextWindow >= 1) {
          context.next = chunks[index + 1].content.substring(0, 100);
        }
      }

      // ドキュメントタイトルを追加（最初のチャンクから抽出）
      const titleMatch = chunks[0].content.match(/^#\s+(.+)/m);
      if (titleMatch) {
        context.documentTitle = titleMatch[1];
      }

      return {
        ...chunk,
        context,
      };
    });
  }

  /**
   * コンテキスト付き埋め込み生成
   */
  async generateWithContext(
    contextualChunks: ContextualChunk[],
  ): Promise<ContextualEmbedding[]> {
    const results: ContextualEmbedding[] = [];

    for (let i = 0; i < contextualChunks.length; i++) {
      const chunk = contextualChunks[i];

      // コンテキストを含めたテキストを作成
      let enrichedText = chunk.content;
      if (chunk.context.documentTitle) {
        enrichedText = `Document: ${chunk.context.documentTitle}\n\n${enrichedText}`;
      }
      if (chunk.context.previous) {
        enrichedText = `Previous context: ${chunk.context.previous}\n\n${enrichedText}`;
      }
      if (chunk.context.next) {
        enrichedText = `${enrichedText}\n\nNext context: ${chunk.context.next}`;
      }

      // 埋め込み生成（モック）
      const embedding = Array.from(
        { length: 1536 },
        () => Math.random() * 0.2 - 0.1,
      );
      const norm = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0),
      );
      const normalized = embedding.map((val) => val / norm);

      results.push({
        content: chunk.content,
        context: chunk.context,
        embedding: normalized,
        embeddingDimensions: normalized.length,
        hasContext:
          !!chunk.context.previous ||
          !!chunk.context.next ||
          !!chunk.context.documentTitle,
      });

      await new Promise((resolve) => setTimeout(resolve, 50)); // API遅延
    }

    return results;
  }
}

async function testContextualEmbeddings() {
  console.log("=== TC-07: Contextual Embeddings テスト ===\n");

  const inputPath = join(baseDir, "outputs/chunks/tc01-chunks.json");
  const outputPath = join(baseDir, "outputs/embeddings/tc07-contextual.json");

  try {
    // 1. APIキー確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠️  OPENAI_API_KEY が設定されていません。モックで実行します。",
      );
    }
    console.log();

    // 2. チャンクデータ読み込み
    console.log("📖 チャンクデータ読み込み:", inputPath);
    const chunksJson = await fs.readFile(inputPath, "utf-8");
    const chunks = JSON.parse(chunksJson);
    console.log(`   チャンク数: ${chunks.length}\n`);

    // 3. コンテキスト付与プロセッサー初期化
    console.log("⚙️  コンテキスト付与処理...");
    const processor = new MockContextualEmbeddingProcessor({
      apiKey: apiKey || "mock-key",
      contextWindow: 1,
      contextStrategy: "surrounding",
    });

    // 4. コンテキスト付与
    const contextualChunks = processor.addContext(chunks);
    console.log(`   コンテキスト付与完了`);

    // 5. コンテキスト統計
    const withPrevious = contextualChunks.filter(
      (c) => c.context.previous,
    ).length;
    const withNext = contextualChunks.filter((c) => c.context.next).length;
    const withTitle = contextualChunks.filter(
      (c) => c.context.documentTitle,
    ).length;

    console.log("\n📊 コンテキスト統計:");
    console.log(`   前コンテキスト: ${withPrevious}/${chunks.length}`);
    console.log(`   後コンテキスト: ${withNext}/${chunks.length}`);
    console.log(`   ドキュメントタイトル: ${withTitle}/${chunks.length}`);

    // 6. 埋め込み生成
    console.log("\n⚙️  コンテキスト付き埋め込み生成...");
    const startTime = Date.now();
    const embeddings = await processor.generateWithContext(contextualChunks);
    const totalTime = Date.now() - startTime;

    console.log(`   完了: ${(totalTime / 1000).toFixed(2)}秒`);

    // 7. 結果保存
    console.log("\n💾 結果保存:", outputPath);
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(embeddings, null, 2));

    // 8. 検証
    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "埋め込み生成数が正しい",
        result: embeddings.length === chunks.length,
        actual: embeddings.length,
      },
      {
        name: "中間チャンクにコンテキストがある",
        result: withPrevious > 0 && withNext > 0,
        actual: `prev: ${withPrevious}, next: ${withNext}`,
      },
      {
        name: "最初のチャンクは前コンテキストなし",
        result: !embeddings[0].context.previous,
        actual: "OK",
      },
      {
        name: "最後のチャンクは後コンテキストなし",
        result: !embeddings[embeddings.length - 1].context.next,
        actual: "OK",
      },
      {
        name: "すべての埋め込みが生成された",
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
      embeddings: embeddings.length,
      withContext: embeddings.filter((e) => e.hasContext).length,
      totalTimeMs: totalTime,
      outputPath,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testContextualEmbeddings()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   埋め込み数: ${result.embeddings}`);
    console.log(`   コンテキスト付与: ${result.withContext}`);
    console.log(`   処理時間: ${(result.totalTimeMs / 1000).toFixed(2)}秒`);
    console.log(`   出力: ${result.outputPath}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
