/**
 * @file 手動テスト実行スクリプト
 * @description RAG Conversion Systemの手動テストを実行
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { globalConversionService } from "../conversion-service";
import { registerDefaultConverters } from "../converters/index";
import type { ConverterInput } from "../types";
import { generateFileId } from "../../../types/rag/branded";

// =============================================================================
// 型定義
// =============================================================================

interface TestCase {
  id: string;
  category: string;
  description: string;
  filePath: string;
  mimeType: string;
  expectedBehavior: string;
}

interface TestResult {
  id: string;
  category: string;
  description: string;
  status: "PASS" | "FAIL";
  duration: number;
  details: string;
  error?: string;
}

// =============================================================================
// テストケース定義
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, "fixtures");

const TEST_CASES: TestCase[] = [
  {
    id: "TC-1",
    category: "機能（正常系）",
    description: "Markdown変換",
    filePath: join(FIXTURES_DIR, "sample.md"),
    mimeType: "text/markdown",
    expectedBehavior: "変換成功、見出し・リンク・コードブロックが抽出される",
  },
  {
    id: "TC-2",
    category: "機能（正常系）",
    description: "TypeScript変換",
    filePath: join(FIXTURES_DIR, "sample.ts"),
    mimeType: "text/x-typescript",
    expectedBehavior: "変換成功、関数・クラス・インポートが抽出される",
  },
  {
    id: "TC-3",
    category: "機能（正常系）",
    description: "JavaScript変換",
    filePath: join(FIXTURES_DIR, "sample.js"),
    mimeType: "text/javascript",
    expectedBehavior: "変換成功、関数・クラス・インポートが抽出される",
  },
  {
    id: "TC-4",
    category: "機能（正常系）",
    description: "Python変換",
    filePath: join(FIXTURES_DIR, "sample.py"),
    mimeType: "text/x-python",
    expectedBehavior: "変換成功、関数・クラス・インポートが抽出される",
  },
  {
    id: "TC-5",
    category: "機能（正常系）",
    description: "YAML変換",
    filePath: join(FIXTURES_DIR, "sample.yaml"),
    mimeType: "application/x-yaml",
    expectedBehavior: "変換成功、トップレベルキー・インデント深さが抽出される",
  },
  {
    id: "TC-6",
    category: "機能（異常系）",
    description: "空ファイル",
    filePath: join(FIXTURES_DIR, "empty.md"),
    mimeType: "text/markdown",
    expectedBehavior: "変換成功、空コンテンツが返される",
  },
];

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * ファイルを読み込んでConverterInputを作成
 */
async function createInput(
  filePath: string,
  mimeType: string,
): Promise<ConverterInput> {
  const content = await readFile(filePath, "utf-8");
  const fileId = generateFileId();

  return {
    fileId,
    content,
    mimeType,
    filePath,
    encoding: "utf-8",
  };
}

/**
 * 結果を検証
 */
function validateResult(
  testCase: TestCase,
  convertedContent: string,
  _metadata: unknown,
): { passed: boolean; details: string } {
  const details: string[] = [];

  // TC-6（空ファイル）の場合は空コンテンツでもOK
  if (testCase.id === "TC-6") {
    details.push(`✓ 空ファイルが正常に処理されました`);
    details.push(`✓ 変換コンテンツサイズ: ${convertedContent.length} 文字`);
    return {
      passed: true,
      details: details.join("\n"),
    };
  }

  // 基本的な検証（通常ケース）
  if (!convertedContent) {
    return {
      passed: false,
      details: "変換コンテンツが空です",
    };
  }

  details.push(`✓ 変換コンテンツサイズ: ${convertedContent.length} 文字`);

  // テストケース別の検証
  switch (testCase.id) {
    case "TC-1": // Markdown
      if (convertedContent.includes("見出し")) {
        details.push("✓ 見出しが抽出されました");
      }
      if (
        convertedContent.includes("https://example.com") ||
        convertedContent.includes("https://github.com")
      ) {
        details.push("✓ リンクが抽出されました");
      }
      if (convertedContent.includes("```")) {
        details.push("✓ コードブロックが保持されました");
      }
      break;

    case "TC-2": // TypeScript
    case "TC-3": // JavaScript
      if (
        convertedContent.includes("class") ||
        convertedContent.includes("Class")
      ) {
        details.push("✓ クラスが抽出されました");
      }
      if (
        convertedContent.includes("function") ||
        convertedContent.includes("Function")
      ) {
        details.push("✓ 関数が抽出されました");
      }
      break;

    case "TC-4": // Python
      if (
        convertedContent.includes("def") ||
        convertedContent.includes("クラス")
      ) {
        details.push("✓ 関数/クラスが抽出されました");
      }
      break;

    case "TC-5": // YAML
      if (
        convertedContent.includes("app") ||
        convertedContent.includes("server")
      ) {
        details.push("✓ トップレベルキーが抽出されました");
      }
      if (
        convertedContent.includes("indent") ||
        convertedContent.includes("インデント")
      ) {
        details.push("✓ インデント情報が抽出されました");
      }
      break;

    // TC-6は最初の検証でハンドリング済み
  }

  return {
    passed: true,
    details: details.join("\n"),
  };
}

// =============================================================================
// テスト実行
// =============================================================================

/**
 * 単一テストケースを実行
 */
async function runTestCase(testCase: TestCase): Promise<TestResult> {
  const startTime = Date.now();

  try {
    // 1. ConverterInput作成
    const input = await createInput(testCase.filePath, testCase.mimeType);

    // 2. 変換実行
    const result = await globalConversionService.convert(input);

    // 3. 結果検証
    if (!result.success) {
      return {
        id: testCase.id,
        category: testCase.category,
        description: testCase.description,
        status: "FAIL",
        duration: Date.now() - startTime,
        details: "変換失敗",
        error: result.error.message,
      };
    }

    const { convertedContent, extractedMetadata } = result.data;
    const validation = validateResult(
      testCase,
      convertedContent,
      extractedMetadata,
    );

    return {
      id: testCase.id,
      category: testCase.category,
      description: testCase.description,
      status: validation.passed ? "PASS" : "FAIL",
      duration: Date.now() - startTime,
      details: validation.details,
    };
  } catch (error) {
    return {
      id: testCase.id,
      category: testCase.category,
      description: testCase.description,
      status: "FAIL",
      duration: Date.now() - startTime,
      details: "例外が発生しました",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * すべてのテストケースを実行
 */
async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    console.log(`\n実行中: ${testCase.id} - ${testCase.description}...`);
    const result = await runTestCase(testCase);
    results.push(result);
    console.log(
      `  ${result.status === "PASS" ? "✓" : "✗"} ${result.status} (${result.duration}ms)`,
    );
  }

  return results;
}

/**
 * TC-7: コンバーター自動選択テスト
 */
async function runConverterSelectionTest(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const testFiles = [
      { path: join(FIXTURES_DIR, "sample.md"), mime: "text/markdown" },
      { path: join(FIXTURES_DIR, "sample.ts"), mime: "text/x-typescript" },
      { path: join(FIXTURES_DIR, "sample.yaml"), mime: "application/x-yaml" },
    ];

    const details: string[] = [];

    for (const file of testFiles) {
      const input = await createInput(file.path, file.mime);
      const canConvert = globalConversionService.canConvert(input);

      if (canConvert) {
        details.push(`✓ ${file.mime} に対応するコンバーターが見つかりました`);
      } else {
        return {
          id: "TC-7",
          category: "統合",
          description: "コンバーター自動選択",
          status: "FAIL",
          duration: Date.now() - startTime,
          details: `${file.mime} に対応するコンバーターが見つかりませんでした`,
        };
      }
    }

    return {
      id: "TC-7",
      category: "統合",
      description: "コンバーター自動選択",
      status: "PASS",
      duration: Date.now() - startTime,
      details: details.join("\n"),
    };
  } catch (error) {
    return {
      id: "TC-7",
      category: "統合",
      description: "コンバーター自動選択",
      status: "FAIL",
      duration: Date.now() - startTime,
      details: "例外が発生しました",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 結果をMarkdown形式で出力
 */
function formatResults(results: TestResult[]): string {
  const lines: string[] = [];

  lines.push("# RAG Conversion System - 手動テスト結果");
  lines.push("");
  lines.push(`**実行日時**: ${new Date().toISOString()}`);
  lines.push("");

  // サマリー
  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  lines.push("## サマリー");
  lines.push("");
  lines.push(`- **総テスト数**: ${results.length}`);
  lines.push(`- **成功**: ${passCount}`);
  lines.push(`- **失敗**: ${failCount}`);
  lines.push(
    `- **成功率**: ${((passCount / results.length) * 100).toFixed(1)}%`,
  );
  lines.push(`- **総実行時間**: ${totalDuration}ms`);
  lines.push("");

  // 詳細結果
  lines.push("## テスト結果詳細");
  lines.push("");
  lines.push("| No | カテゴリ | テスト項目 | 結果 | 実行時間 |");
  lines.push("|----|----------|-----------|------|---------|");

  for (const result of results) {
    const statusIcon = result.status === "PASS" ? "✓" : "✗";
    lines.push(
      `| ${result.id} | ${result.category} | ${result.description} | ${statusIcon} ${result.status} | ${result.duration}ms |`,
    );
  }

  lines.push("");

  // 各テストの詳細
  lines.push("## 詳細ログ");
  lines.push("");

  for (const result of results) {
    lines.push(`### ${result.id}: ${result.description}`);
    lines.push("");
    lines.push(`**カテゴリ**: ${result.category}`);
    lines.push(`**結果**: ${result.status}`);
    lines.push(`**実行時間**: ${result.duration}ms`);
    lines.push("");
    lines.push("**詳細**:");
    lines.push("```");
    lines.push(result.details);
    if (result.error) {
      lines.push("");
      lines.push(`エラー: ${result.error}`);
    }
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}

// =============================================================================
// メイン
// =============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("RAG Conversion System - 手動テスト");
  console.log("=".repeat(60));

  // コンバーター登録
  console.log("\n📦 コンバーター登録中...");
  const registrationResult = registerDefaultConverters();
  console.log(
    `  ✓ ${registrationResult.registeredCount} 個のコンバーターを登録しました`,
  );

  // サポートMIMEタイプ確認
  const supportedMimeTypes = globalConversionService.getSupportedMimeTypes();
  console.log(`  ✓ サポートMIMEタイプ: ${supportedMimeTypes.length} 種類`);

  // テスト実行
  console.log("\n🧪 テスト実行中...");
  const results = await runAllTests();

  // TC-7: コンバーター自動選択テスト
  console.log("\n実行中: TC-7 - コンバーター自動選択...");
  const tc7Result = await runConverterSelectionTest();
  results.push(tc7Result);
  console.log(
    `  ${tc7Result.status === "PASS" ? "✓" : "✗"} ${tc7Result.status} (${tc7Result.duration}ms)`,
  );

  // 結果出力
  console.log("\n" + "=".repeat(60));
  console.log("テスト完了");
  console.log("=".repeat(60));

  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;

  console.log(`\n総テスト数: ${results.length}`);
  console.log(`成功: ${passCount}`);
  console.log(`失敗: ${failCount}`);
  console.log(`成功率: ${((passCount / results.length) * 100).toFixed(1)}%`);

  // Markdownレポート生成
  const markdown = formatResults(results);
  console.log("\n📝 レポート生成:");
  console.log(markdown);

  // 終了コード
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("致命的エラー:", error);
  process.exit(1);
});
