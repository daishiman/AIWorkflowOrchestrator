#!/usr/bin/env node
/**
 * Prompt Evaluator Script
 *
 * プロンプトの品質を評価するためのスクリプト
 *
 * 使用方法:
 *   node prompt-evaluator.mjs --test-file tests.json --output results.json
 */

import fs from "fs/promises";
import path from "path";

// ====================
// 型定義
// ====================

/**
 * @typedef {Object} TestCase
 * @property {string} id - テストケースID
 * @property {string} name - テスト名
 * @property {string} type - テストタイプ
 * @property {Object} input - 入力データ
 * @property {Object} expected - 期待される結果
 * @property {Object} [metadata] - メタデータ
 */

/**
 * @typedef {Object} TestResult
 * @property {string} testId - テストケースID
 * @property {string} status - 'passed' | 'failed' | 'error'
 * @property {Object} output - 出力データ
 * @property {Object} evaluation - 評価結果
 * @property {number} duration - 実行時間(ms)
 */

/**
 * @typedef {Object} EvaluationReport
 * @property {string} timestamp - 実行日時
 * @property {Object} summary - サマリー
 * @property {TestResult[]} results - 個別結果
 */

// ====================
// 評価関数
// ====================

/**
 * 完全一致チェック
 */
function exactMatch(actual, expected) {
  const normalizedActual = actual.trim();
  const normalizedExpected = expected.trim();
  return normalizedActual === normalizedExpected;
}

/**
 * 部分一致チェック
 */
function containsMatch(actual, expected) {
  return actual.includes(expected);
}

/**
 * JSONスキーマ検証
 */
function validateJSON(output) {
  try {
    JSON.parse(output);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * 長さチェック
 */
function validateLength(output, min, max) {
  const length = output.length;
  return {
    valid: length >= min && length <= max,
    actual: length,
    min,
    max,
  };
}

/**
 * キーワードチェック
 */
function checkKeywords(output, required = [], forbidden = []) {
  const lowerOutput = output.toLowerCase();

  const missingRequired = required.filter(
    (kw) => !lowerOutput.includes(kw.toLowerCase()),
  );

  const foundForbidden = forbidden.filter((kw) =>
    lowerOutput.includes(kw.toLowerCase()),
  );

  return {
    passed: missingRequired.length === 0 && foundForbidden.length === 0,
    missingRequired,
    foundForbidden,
  };
}

/**
 * 類似度計算（簡易版）
 */
function calculateSimilarity(str1, str2) {
  const tokens1 = new Set(str1.toLowerCase().split(/\s+/));
  const tokens2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...tokens1].filter((t) => tokens2.has(t)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}

// ====================
// テスト実行
// ====================

/**
 * 単一テストケースの評価
 */
function evaluateTestCase(testCase, output) {
  const { type, expected } = testCase;
  const evaluation = {
    passed: false,
    score: 0,
    details: {},
  };

  switch (type) {
    case "accuracy":
      if (expected.match_type === "exact") {
        evaluation.passed = exactMatch(output, expected.output);
        evaluation.score = evaluation.passed ? 1.0 : 0.0;
      } else if (expected.match_type === "contains") {
        evaluation.passed = containsMatch(output, expected.output);
        evaluation.score = evaluation.passed ? 1.0 : 0.0;
      } else if (expected.match_type === "semantic") {
        const similarity = calculateSimilarity(output, expected.output);
        evaluation.score = similarity;
        evaluation.passed = similarity >= (expected.threshold || 0.8);
      }
      break;

    case "format":
      if (expected.format === "json") {
        const jsonResult = validateJSON(output);
        evaluation.passed = jsonResult.valid;
        evaluation.score = jsonResult.valid ? 1.0 : 0.0;
        evaluation.details.jsonValidation = jsonResult;
      }
      break;

    case "edge_case":
      const acceptableBehaviors = expected.acceptable_behaviors || [];
      evaluation.passed = acceptableBehaviors.some((behavior) =>
        output.includes(behavior),
      );
      evaluation.score = evaluation.passed ? 1.0 : 0.0;
      break;

    case "safety":
      const forbidden = expected.forbidden_content || [];
      const keywordCheck = checkKeywords(output, [], forbidden);
      evaluation.passed = keywordCheck.passed;
      evaluation.score = evaluation.passed ? 1.0 : 0.0;
      evaluation.details.forbiddenFound = keywordCheck.foundForbidden;
      break;

    default:
      evaluation.passed = true;
      evaluation.score = 1.0;
  }

  return evaluation;
}

/**
 * テストスイートの実行（シミュレーション）
 */
async function runTestSuite(testCases, options = {}) {
  const results = [];

  for (const testCase of testCases) {
    const startTime = Date.now();

    // 実際の実装では、ここでLLM APIを呼び出す
    // このスクリプトではシミュレーション
    const simulatedOutput = testCase.expected?.output || "";

    const evaluation = evaluateTestCase(testCase, simulatedOutput);

    results.push({
      testId: testCase.id,
      testName: testCase.name,
      status: evaluation.passed ? "passed" : "failed",
      output: {
        actual: simulatedOutput,
        expected: testCase.expected?.output,
      },
      evaluation,
      duration: Date.now() - startTime,
    });
  }

  return results;
}

/**
 * レポート生成
 */
function generateReport(results) {
  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    error: results.filter((r) => r.status === "error").length,
  };

  summary.passRate = ((summary.passed / summary.total) * 100).toFixed(1);

  const byType = {};
  for (const result of results) {
    const type = result.testId.split("-")[0];
    if (!byType[type]) {
      byType[type] = { total: 0, passed: 0, failed: 0 };
    }
    byType[type].total++;
    if (result.status === "passed") {
      byType[type].passed++;
    } else {
      byType[type].failed++;
    }
  }

  return {
    timestamp: new Date().toISOString(),
    summary,
    byType,
    results,
    failedTests: results.filter((r) => r.status !== "passed"),
  };
}

// ====================
// CLI
// ====================

async function main() {
  const args = process.argv.slice(2);

  // ヘルプ表示
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Prompt Evaluator Script

使用方法:
  node prompt-evaluator.mjs [options]

オプション:
  --test-file <path>   テストケースファイル（JSON）
  --output <path>      結果出力ファイル
  --verbose           詳細出力
  --help, -h          このヘルプを表示

例:
  node prompt-evaluator.mjs --test-file tests.json --output results.json
`);
    process.exit(0);
  }

  // 引数パース
  const testFileIndex = args.indexOf("--test-file");
  const outputIndex = args.indexOf("--output");
  const verbose = args.includes("--verbose");

  if (testFileIndex === -1) {
    console.error("エラー: --test-file オプションが必要です");
    process.exit(1);
  }

  const testFile = args[testFileIndex + 1];
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;

  try {
    // テストケース読み込み
    if (verbose) console.log(`テストファイル読み込み中: ${testFile}`);
    const testContent = await fs.readFile(testFile, "utf-8");
    const testCases = JSON.parse(testContent);

    // テスト実行
    if (verbose) console.log(`テスト実行中: ${testCases.length}件`);
    const results = await runTestSuite(testCases);

    // レポート生成
    const report = generateReport(results);

    // 結果出力
    if (outputFile) {
      await fs.writeFile(outputFile, JSON.stringify(report, null, 2));
      console.log(`結果を保存しました: ${outputFile}`);
    }

    // コンソール出力
    console.log("\n===== テスト結果サマリー =====");
    console.log(`合計: ${report.summary.total}`);
    console.log(`成功: ${report.summary.passed} (${report.summary.passRate}%)`);
    console.log(`失敗: ${report.summary.failed}`);
    console.log(`エラー: ${report.summary.error}`);

    if (report.failedTests.length > 0) {
      console.log("\n===== 失敗したテスト =====");
      for (const failed of report.failedTests) {
        console.log(`- ${failed.testId}: ${failed.testName}`);
      }
    }

    // 終了コード
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("エラー:", error.message);
    process.exit(1);
  }
}

main();
