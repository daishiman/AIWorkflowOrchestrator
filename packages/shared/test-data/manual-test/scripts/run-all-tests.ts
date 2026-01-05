/**
 * 全手動テスト実行スクリプト
 *
 * このスクリプトはTC-01～TC-10のすべてのテストを順番に実行し、
 * 結果をサマリーレポートとして出力します。
 */

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, "..");

interface TestResult {
  testId: string;
  name: string;
  status: "pass" | "fail" | "skip";
  exitCode: number;
  output: string;
  duration: number;
}

/**
 * テストスクリプトを実行
 */
async function runTest(scriptPath: string): Promise<TestResult> {
  const testId = scriptPath.match(/tc(\d+)/)?.[1] || "unknown";
  const testName = scriptPath.replace(/.*\//, "").replace(/\.ts$/, "");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`実行中: ${testName} (TC-${testId.padStart(2, "0")})`);
  console.log("=".repeat(60));

  const startTime = Date.now();

  return new Promise((resolve) => {
    const child = spawn("pnpm", ["tsx", scriptPath], {
      cwd: join(baseDir, ".."),
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr?.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("close", (code) => {
      const duration = Date.now() - startTime;
      const output = stdout + stderr;

      const status: "pass" | "fail" | "skip" =
        code === 0 ? "pass" : output.includes("スキップ") ? "skip" : "fail";

      resolve({
        testId: `TC-${testId.padStart(2, "0")}`,
        name: testName,
        status,
        exitCode: code || 0,
        output,
        duration,
      });
    });
  });
}

/**
 * サマリーレポート生成
 */
function generateSummary(results: TestResult[]): string {
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const skipped = results.filter((r) => r.status === "skip").length;

  const lines: string[] = [];
  lines.push("# 手動テスト実行サマリー\n");
  lines.push(`**実行日時**: ${new Date().toISOString()}\n`);
  lines.push("## 総合結果\n");
  lines.push("| 項目 | 件数 |");
  lines.push("|------|------|");
  lines.push(`| **総テスト数** | ${results.length} |`);
  lines.push(`| **合格** | ${passed} |`);
  lines.push(`| **不合格** | ${failed} |`);
  lines.push(`| **スキップ** | ${skipped} |`);
  lines.push(
    `| **成功率** | ${((passed / results.length) * 100).toFixed(1)}% |\n`,
  );

  lines.push("## テスト詳細\n");
  lines.push("| テストID | テスト名 | 結果 | 実行時間 |");
  lines.push("|---------|---------|------|---------|");

  results.forEach((r) => {
    const statusEmoji =
      r.status === "pass" ? "✅" : r.status === "skip" ? "⏭️" : "❌";
    const statusText =
      r.status === "pass" ? "PASS" : r.status === "skip" ? "SKIP" : "FAIL";
    lines.push(
      `| ${r.testId} | ${r.name} | ${statusEmoji} ${statusText} | ${(r.duration / 1000).toFixed(2)}s |`,
    );
  });

  lines.push("\n## 実行ログ\n");
  lines.push("詳細なログは各テストの出力ディレクトリを参照してください。\n");
  lines.push("- チャンキング結果: `test-data/manual-test/outputs/chunks/`");
  lines.push("- 埋め込み結果: `test-data/manual-test/outputs/embeddings/`");
  lines.push("- 実行ログ: `test-data/manual-test/outputs/logs/`\n");

  if (failed > 0) {
    lines.push("## 失敗したテスト\n");
    results
      .filter((r) => r.status === "fail")
      .forEach((r) => {
        lines.push(`### ${r.testId}: ${r.name}\n`);
        lines.push("```");
        lines.push(r.output.substring(r.output.lastIndexOf("❌")));
        lines.push("```\n");
      });
  }

  const finalStatus = failed === 0 ? "✅ 全テスト合格" : "❌ 一部テスト不合格";
  lines.push(`## 最終判定\n\n${finalStatus}`);

  return lines.join("\n");
}

async function runAllTests() {
  console.log("=".repeat(60));
  console.log("手動テストスイート実行開始");
  console.log("=".repeat(60));

  const testScripts = [
    "tc01-chunking.ts",
    "tc02-code-chunking.ts",
    "tc03-openai-embedding.ts",
    "tc04-qwen3-embedding.ts",
    "tc05-batch-processing.ts",
    "tc06-rate-limit.ts",
    "tc07-contextual-embeddings.ts",
    "tc08-pipeline.ts",
    "tc09-error-handling.ts",
    "tc10-incremental.ts",
  ];

  const results: TestResult[] = [];

  for (const script of testScripts) {
    const scriptPath = join(__dirname, script);
    const result = await runTest(scriptPath);
    results.push(result);
  }

  // サマリー生成
  console.log("\n\n" + "=".repeat(60));
  console.log("テスト実行完了");
  console.log("=".repeat(60) + "\n");

  const summary = generateSummary(results);
  console.log(summary);

  // サマリー保存
  const summaryPath = join(baseDir, "outputs/test-summary.md");
  await fs.mkdir(dirname(summaryPath), { recursive: true });
  await fs.writeFile(summaryPath, summary, "utf-8");
  console.log(`\n📄 サマリーレポート保存: ${summaryPath}`);

  // 終了コード決定
  const failed = results.filter((r) => r.status === "fail").length;
  process.exit(failed > 0 ? 1 : 0);
}

// メイン実行
runAllTests().catch((error) => {
  console.error("💥 テストスイート実行失敗:", error);
  process.exit(1);
});
