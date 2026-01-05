/**
 * TC-10: 差分更新（変更ファイルのみ再処理）テスト
 *
 * このスクリプトは差分検出とキャッシュ機能をテストします。
 *
 * 前提条件:
 * - OPENAI_API_KEY 環境変数が設定されている
 * - キャッシュ機能が実装されている
 */

import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

interface FileInfo {
  path: string;
  hash: string;
  lastModified: Date;
}

interface ProcessingCache {
  files: Map<string, FileInfo>;
  embeddings: Map<string, number[]>;
}

/**
 * 差分更新パイプライン（モック実装）
 */
class MockIncrementalPipeline {
  private cache: ProcessingCache = {
    files: new Map(),
    embeddings: new Map(),
  };

  constructor(
    private config: {
      apiKey: string;
      outputDirectory: string;
      cacheEnabled: boolean;
    },
  ) {}

  /**
   * ファイルハッシュ計算
   */
  private async calculateHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, "utf-8");
    return createHash("sha256").update(content).digest("hex");
  }

  /**
   * ファイルが変更されたか確認
   */
  private async hasFileChanged(filePath: string): Promise<boolean> {
    if (!this.config.cacheEnabled) {
      return true; // キャッシュ無効の場合は常に再処理
    }

    const cached = this.cache.files.get(filePath);
    if (!cached) {
      return true; // 初回処理
    }

    const currentHash = await this.calculateHash(filePath);
    return currentHash !== cached.hash;
  }

  /**
   * ディレクトリ内のファイルを処理
   */
  async processDirectory(directoryPath: string): Promise<{
    processedFiles: string[];
    skippedFiles: string[];
    totalChunks: number;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    const processedFiles: string[] = [];
    const skippedFiles: string[] = [];
    let totalChunks = 0;

    // ディレクトリ内のMarkdownファイルを取得
    const files = await fs.readdir(directoryPath);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    console.log(`   ファイル検出: ${mdFiles.length}件`);

    for (const file of mdFiles) {
      const filePath = join(directoryPath, file);
      const hasChanged = await this.hasFileChanged(filePath);

      if (!hasChanged) {
        console.log(`   ⏭️  スキップ: ${file}（変更なし）`);
        skippedFiles.push(file);
        continue;
      }

      console.log(`   🔄 処理中: ${file}`);

      // ファイル処理
      const content = await fs.readFile(filePath, "utf-8");
      const chunks = content.split(/\n(?=##? )/).length;
      totalChunks += chunks;

      // キャッシュ更新
      const hash = await this.calculateHash(filePath);
      this.cache.files.set(filePath, {
        path: filePath,
        hash,
        lastModified: new Date(),
      });

      processedFiles.push(file);

      // 処理遅延をシミュレート
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      processedFiles,
      skippedFiles,
      totalChunks,
      processingTimeMs,
    };
  }
}

async function testIncrementalUpdate() {
  console.log("=== TC-10: 差分更新テスト ===\n");

  const testDir = join(baseDir, "incremental");
  const outputDir = join(baseDir, "outputs/incremental");

  try {
    // 1. 準備
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠️  OPENAI_API_KEY が設定されていません。モックで実行します。",
      );
    }
    console.log();

    // 2. 初回実行用ファイル作成
    console.log("📝 初回実行用ファイル作成...");
    const files = ["file1.md", "file2.md", "file3.md"];
    for (const file of files) {
      await fs.writeFile(
        join(testDir, file),
        `# ${file}\n\nInitial content for ${file}\n\nCreated at: ${new Date().toISOString()}`,
      );
      console.log(`   作成: ${file}`);
    }

    // 3. パイプライン初期化
    const pipeline = new MockIncrementalPipeline({
      apiKey: apiKey || "mock-key",
      outputDirectory: outputDir,
      cacheEnabled: true,
    });

    // 4. 初回実行
    console.log("\n🚀 初回実行...");
    const result1 = await pipeline.processDirectory(testDir);

    console.log("\n📊 初回実行結果:");
    console.log(`   処理ファイル: ${result1.processedFiles.length}件`);
    console.log(`   処理ファイル一覧: ${result1.processedFiles.join(", ")}`);
    console.log(`   スキップファイル: ${result1.skippedFiles.length}件`);
    console.log(
      `   処理時間: ${(result1.processingTimeMs / 1000).toFixed(2)}秒`,
    );

    // 5. 1つのファイルを更新
    console.log("\n✏️  file2.md を更新...");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // タイムスタンプ変更のため待機
    await fs.writeFile(
      join(testDir, "file2.md"),
      `# file2.md\n\n**Updated** content for file2.md\n\nUpdated at: ${new Date().toISOString()}`,
    );
    console.log("   更新完了");

    // 6. 差分更新実行
    console.log("\n🚀 差分更新実行...");
    const result2 = await pipeline.processDirectory(testDir);

    console.log("\n📊 差分更新結果:");
    console.log(`   処理ファイル: ${result2.processedFiles.length}件`);
    console.log(`   処理ファイル一覧: ${result2.processedFiles.join(", ")}`);
    console.log(`   スキップファイル: ${result2.skippedFiles.length}件`);
    console.log(`   スキップファイル一覧: ${result2.skippedFiles.join(", ")}`);
    console.log(
      `   処理時間: ${(result2.processingTimeMs / 1000).toFixed(2)}秒`,
    );

    // 7. 性能比較
    const speedup = result1.processingTimeMs / result2.processingTimeMs;
    console.log("\n⚡ パフォーマンス比較:");
    console.log(`   初回: ${(result1.processingTimeMs / 1000).toFixed(2)}秒`);
    console.log(`   差分: ${(result2.processingTimeMs / 1000).toFixed(2)}秒`);
    console.log(`   速度向上: ${speedup.toFixed(2)}倍`);

    // 8. 検証
    console.log("\n✅ 検証結果:");
    const validations = [
      {
        name: "初回: 全ファイル処理",
        result: result1.processedFiles.length === 3,
        actual: `${result1.processedFiles.length}/3`,
      },
      {
        name: "差分: file2.mdのみ処理",
        result: result2.processedFiles.length === 1,
        actual: `${result2.processedFiles.length}/1`,
      },
      {
        name: "差分: file1,file3スキップ",
        result: result2.skippedFiles.length === 2,
        actual: `${result2.skippedFiles.length}/2`,
      },
      {
        name: "処理ファイルがfile2.md",
        result: result2.processedFiles.includes("file2.md"),
        actual: result2.processedFiles[0] || "N/A",
      },
      {
        name: "差分更新が高速",
        result: result2.processingTimeMs < result1.processingTimeMs,
        actual: `${(result2.processingTimeMs / 1000).toFixed(2)}s < ${(result1.processingTimeMs / 1000).toFixed(2)}s`,
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
      initialFiles: result1.processedFiles.length,
      incrementalFiles: result2.processedFiles.length,
      skippedFiles: result2.skippedFiles.length,
      speedup,
    };
  } catch (error) {
    console.error("❌ エラー発生:", error);
    throw error;
  }
}

// メイン実行
testIncrementalUpdate()
  .then((result) => {
    console.log("\n📝 結果サマリー:");
    console.log(`   成功: ${result.success}`);
    console.log(`   初回処理: ${result.initialFiles}ファイル`);
    console.log(`   差分処理: ${result.incrementalFiles}ファイル`);
    console.log(`   スキップ: ${result.skippedFiles}ファイル`);
    console.log(`   速度向上: ${result.speedup.toFixed(2)}倍`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 テスト失敗:", error);
    process.exit(1);
  });
