/**
 * TC-02: コードファイル分割テスト
 *
 * このスクリプトはTypeScriptファイルのチャンキング機能をテストします。
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
    type?: "interface" | "class" | "function" | "other";
    name?: string;
    chunkIndex: number;
    totalChunks: number;
  };
  size: number;
}

/**
 * シンプルなコードチャンカー（テスト用モック）
 */
class MockCodeChunker {
  constructor(private options: { maxChunkSize: number; overlapSize: number }) {}

  async chunk(
    content: string,
    metadata: { filePath: string },
  ): Promise<Chunk[]> {
    const chunks: Chunk[] = [];

    // インターフェース、クラス、関数で分割（簡易実装）
    const patterns = [
      { type: "interface" as const, regex: /export interface \w+\s*{[^}]+}/gs },
      { type: "class" as const, regex: /export class \w+\s*{[\s\S]+?^}/gm },
      {
        type: "function" as const,
        regex: /export (?:async )?function \w+[\s\S]+?^}/gm,
      },
    ];

    let index = 0;
    for (const { type, regex } of patterns) {
      const matches = content.matchAll(regex);
      for (const match of matches) {
        const nameMatch = match[0].match(
          /(?:interface|class|function)\s+(\w+)/,
        );
        const name = nameMatch ? nameMatch[1] : undefined;

        chunks.push({
          content: match[0],
          metadata: {
            filePath: metadata.filePath,
            type,
            name,
            chunkIndex: index++,
            totalChunks: 0, // 後で更新
          },
          size: match[0].length,
        });
      }
    }

    // totalChunksを更新
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    // チャンクが見つからない場合は全体を1つのチャンクとして扱う
    if (chunks.length === 0) {
      chunks.push({
        content,
        metadata: {
          filePath: metadata.filePath,
          type: "other",
          chunkIndex: 0,
          totalChunks: 1,
        },
        size: content.length,
      });
    }

    return chunks;
  }
}

async function testCodeChunking() {
  console.log("=== TC-02: コードファイル分割テスト ===\n");

  const inputPath = join(baseDir, "code/simple.ts");
  const outputPath = join(baseDir, "outputs/chunks/tc02-chunks.json");

  try {
    // 1. ファイル読み込み
    console.log("📖 ファイル読み込み:", inputPath);
    const content = await fs.readFile(inputPath, "utf-8");
    console.log(`   サイズ: ${content.length} bytes\n`);

    // 2. チャンキング実行
    console.log("⚙️  チャンキング実行...");
    const chunker = new MockCodeChunker({
      maxChunkSize: 512,
      overlapSize: 50,
    });
    const chunks = await chunker.chunk(content, { filePath: inputPath });
    console.log(`   チャンク数: ${chunks.length}\n`);

    // 3. 各チャンクの情報表示
    console.log("📊 チャンク詳細:");
    chunks.forEach((chunk, index) => {
      const typeName = chunk.metadata.name
        ? `${chunk.metadata.type}: ${chunk.metadata.name}`
        : chunk.metadata.type || "other";
      console.log(`   [${index}] ${typeName}`);
      console.log(`       サイズ: ${chunk.size} bytes`);
      console.log(
        `       先頭: ${chunk.content.substring(0, 50).replace(/\n/g, " ")}...`,
      );
    });
    console.log();

    // 4. 結果保存
    console.log("💾 結果保存:", outputPath);
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(chunks, null, 2), "utf-8");

    // 5. 検証
    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "チャンク数が適切",
        result: chunks.length >= 1,
        actual: chunks.length,
      },
      {
        name: "インターフェースが検出された",
        result: chunks.some((c) => c.metadata.type === "interface"),
        actual: chunks.filter((c) => c.metadata.type === "interface").length,
      },
      {
        name: "クラスが検出された",
        result: chunks.some((c) => c.metadata.type === "class"),
        actual: chunks.filter((c) => c.metadata.type === "class").length,
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

// メイン実行
testCodeChunking()
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
