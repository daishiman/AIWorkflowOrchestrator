#!/usr/bin/env node

/**
 * セキュリティレポート検証スクリプト
 *
 * セキュリティレポートの構造と必須項目を検証します。
 * 冪等性: 何度実行しても同じ検証結果を返します。
 *
 * 使用例:
 *   node validate-report.mjs <report-path>
 *   node validate-report.mjs ./reports/security-report.md
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_NOT_FOUND = 3;
const EXIT_VALIDATION_FAILED = 4;

function showHelp() {
  console.log(`
セキュリティレポート検証スクリプト

Usage: node validate-report.mjs <report-path> [options]

Arguments:
  report-path               検証対象のMarkdownファイルパス

Options:
  --strict                  厳格モード（推奨項目も必須として扱う）
  --format <json|text>      出力形式（デフォルト: text）
  -h, --help                このヘルプを表示

Exit codes:
  0  成功（すべての検証をパス）
  1  一般エラー
  2  引数エラー
  3  ファイルが見つからない
  4  検証失敗

Examples:
  node validate-report.mjs ./reports/security-report.md
  node validate-report.mjs ./report.md --strict --format json
  `);
}

// 必須セクションの定義
const REQUIRED_SECTIONS = [
  { pattern: /^#\s+.*レポート|^#\s+Security.*Report/im, name: "タイトル" },
  {
    pattern: /^##\s+エグゼクティブサマリー|^##\s+Executive Summary/im,
    name: "エグゼクティブサマリー",
  },
  {
    pattern: /^##\s+スコープ|^##\s+Scope/im,
    name: "スコープと方法論",
  },
  {
    pattern: /^##\s+主要発見事項|^##\s+.*Finding/im,
    name: "主要発見事項",
  },
  {
    pattern: /^##\s+アクションプラン|^##\s+Action Plan/im,
    name: "アクションプラン",
  },
];

// 必須項目の定義
const REQUIRED_ITEMS = [
  {
    pattern: /評価.*[:：]\s*[A-F]|Grade.*[:：]\s*[A-F]/i,
    name: "総合評価グレード",
  },
  {
    pattern: /Critical.*\d+|High.*\d+|Medium.*\d+|Low.*\d+/i,
    name: "脆弱性サマリー",
  },
  { pattern: /CVSS.*\d+\.\d+|CVSSスコア/i, name: "CVSSスコア" },
  { pattern: /A0[1-9]|A10|OWASP/i, name: "OWASP分類" },
  { pattern: /CWE-\d+/i, name: "CWE ID" },
];

// 推奨項目の定義
const RECOMMENDED_ITEMS = [
  { pattern: /Before.*After|修正前.*修正後/is, name: "Before/Afterコード" },
  { pattern: /期限|Deadline|1週間|24時間/i, name: "対応期限" },
  { pattern: /用語集|Glossary/i, name: "用語集" },
  { pattern: /参考資料|References/i, name: "参考資料" },
];

function validateReport(content, strictMode = false) {
  const results = {
    pass: true,
    sections: [],
    required: [],
    recommended: [],
    summary: {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
    },
  };

  // セクション検証
  for (const section of REQUIRED_SECTIONS) {
    const found = section.pattern.test(content);
    results.sections.push({
      name: section.name,
      found,
      required: true,
    });
    results.summary.totalChecks++;
    if (found) {
      results.summary.passedChecks++;
    } else {
      results.summary.failedChecks++;
      results.pass = false;
    }
  }

  // 必須項目検証
  for (const item of REQUIRED_ITEMS) {
    const found = item.pattern.test(content);
    results.required.push({
      name: item.name,
      found,
      required: true,
    });
    results.summary.totalChecks++;
    if (found) {
      results.summary.passedChecks++;
    } else {
      results.summary.failedChecks++;
      results.pass = false;
    }
  }

  // 推奨項目検証
  for (const item of RECOMMENDED_ITEMS) {
    const found = item.pattern.test(content);
    results.recommended.push({
      name: item.name,
      found,
      required: strictMode,
    });
    if (strictMode) {
      results.summary.totalChecks++;
      if (found) {
        results.summary.passedChecks++;
      } else {
        results.summary.failedChecks++;
        results.pass = false;
      }
    }
  }

  return results;
}

function formatTextOutput(results, reportPath) {
  const lines = [];
  const timestamp = new Date().toISOString();

  lines.push("═".repeat(60));
  lines.push("セキュリティレポート検証結果");
  lines.push("═".repeat(60));
  lines.push(`検証日時: ${timestamp}`);
  lines.push(`対象ファイル: ${reportPath}`);
  lines.push(`結果: ${results.pass ? "✓ PASS" : "✗ FAIL"}`);
  lines.push("");

  lines.push("─".repeat(40));
  lines.push("【必須セクション】");
  lines.push("─".repeat(40));
  for (const section of results.sections) {
    const status = section.found ? "✓" : "✗";
    lines.push(`  ${status} ${section.name}`);
  }
  lines.push("");

  lines.push("─".repeat(40));
  lines.push("【必須項目】");
  lines.push("─".repeat(40));
  for (const item of results.required) {
    const status = item.found ? "✓" : "✗";
    lines.push(`  ${status} ${item.name}`);
  }
  lines.push("");

  lines.push("─".repeat(40));
  lines.push("【推奨項目】");
  lines.push("─".repeat(40));
  for (const item of results.recommended) {
    const status = item.found ? "✓" : "○";
    const req = item.required ? "(必須)" : "(推奨)";
    lines.push(`  ${status} ${item.name} ${req}`);
  }
  lines.push("");

  lines.push("─".repeat(40));
  lines.push("【サマリー】");
  lines.push("─".repeat(40));
  lines.push(`  総チェック数: ${results.summary.totalChecks}`);
  lines.push(`  パス: ${results.summary.passedChecks}`);
  lines.push(`  失敗: ${results.summary.failedChecks}`);
  lines.push("");
  lines.push("═".repeat(60));

  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  // 引数解析
  const reportPath = args.find((arg) => !arg.startsWith("--"));
  const strictMode = args.includes("--strict");
  const formatIndex = args.indexOf("--format");
  const format =
    formatIndex !== -1 && args[formatIndex + 1]
      ? args[formatIndex + 1]
      : "text";

  if (!reportPath) {
    console.error("Error: レポートファイルのパスを指定してください");
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  // ファイル読み込み
  let content;
  try {
    const fullPath = resolve(reportPath);
    content = readFileSync(fullPath, "utf-8");
  } catch (err) {
    console.error(`Error: ファイルが見つかりません: ${reportPath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  // 検証実行
  const results = validateReport(content, strictMode);

  // 結果出力
  if (format === "json") {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(formatTextOutput(results, reportPath));
  }

  // 終了コード
  process.exit(results.pass ? EXIT_SUCCESS : EXIT_VALIDATION_FAILED);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
