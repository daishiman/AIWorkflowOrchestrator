#!/usr/bin/env node
/**
 * 要件品質検証スクリプト
 *
 * 要件定義書の品質を検証し、曖昧な表現や不完全な要件を検出します。
 *
 * 使用方法:
 *   node validate-requirements.mjs <要件定義書.md>
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// 曖昧性検出パターン
const AMBIGUITY_PATTERNS = {
  quantitative: {
    pattern: /高速|速い|遅い|多い|少ない|大きい|小さい|長い|短い|頻繁/g,
    message: "量的曖昧性: 具体的な数値に変換してください",
    severity: "error",
  },
  qualitative: {
    pattern:
      /適切|正しく|十分|良い|悪い|使いやすい|分かりやすい|ユーザーフレンドリー/g,
    message: "質的曖昧性: 測定可能な基準に変換してください",
    severity: "error",
  },
  scope: {
    pattern: /など|等|その他|いくつか|主な|を含む/g,
    message: "範囲の曖昧性: 完全に列挙してください",
    severity: "warning",
  },
  conditional: {
    pattern: /場合によって|必要に応じて|状況次第|適宜|時々|可能であれば/g,
    message: "条件の曖昧性: 具体的な条件を列挙してください",
    severity: "warning",
  },
};

// 必須セクションチェック
const REQUIRED_SECTIONS = [
  { pattern: /##?\s*(概要|Overview)/i, name: "概要" },
  { pattern: /##?\s*(機能要件|Functional Requirements)/i, name: "機能要件" },
  {
    pattern: /##?\s*(非機能要件|Non-Functional Requirements)/i,
    name: "非機能要件",
  },
  { pattern: /##?\s*(制約|Constraints)/i, name: "制約条件" },
];

// 要件ID形式チェック
const REQUIREMENT_ID_PATTERN = /\b(FR|NFR|UC|AC)-\d{3}\b/g;

/**
 * 要件定義書を検証
 */
function validateRequirements(content, filePath) {
  const issues = [];
  const lines = content.split("\n");

  console.log("\n📋 要件定義書検証レポート");
  console.log("=".repeat(50));
  console.log(`ファイル: ${filePath}\n`);

  // 1. 曖昧性チェック
  console.log("🔍 曖昧性チェック...");
  for (const [type, config] of Object.entries(AMBIGUITY_PATTERNS)) {
    let lineNum = 0;
    for (const line of lines) {
      lineNum++;
      const matches = line.match(config.pattern);
      if (matches) {
        for (const match of matches) {
          issues.push({
            type: "ambiguity",
            severity: config.severity,
            line: lineNum,
            match,
            message: config.message,
          });
        }
      }
    }
  }

  // 2. 必須セクションチェック
  console.log("📑 必須セクションチェック...");
  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(content)) {
      issues.push({
        type: "structure",
        severity: "warning",
        message: `必須セクション「${section.name}」が見つかりません`,
      });
    }
  }

  // 3. 要件IDチェック
  console.log("🏷️  要件IDチェック...");
  const ids = content.match(REQUIREMENT_ID_PATTERN) || [];
  const uniqueIds = [...new Set(ids)];

  if (ids.length !== uniqueIds.length) {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    for (const dup of [...new Set(duplicates)]) {
      issues.push({
        type: "id",
        severity: "error",
        message: `重複する要件ID: ${dup}`,
      });
    }
  }

  // 4. 完全性チェック（受け入れ基準の有無）
  console.log("✅ 完全性チェック...");
  const frMatches = content.match(/FR-\d{3}/g) || [];
  const acMatches = content.match(/Scenario:|Given\s|When\s|Then\s/gi) || [];

  if (frMatches.length > 0 && acMatches.length === 0) {
    issues.push({
      type: "completeness",
      severity: "warning",
      message: "受け入れ基準（Given-When-Then）が定義されていません",
    });
  }

  return { issues, stats: { totalIds: uniqueIds.length, lines: lines.length } };
}

/**
 * 結果を表示
 */
function displayResults(result) {
  const { issues, stats } = result;

  console.log("\n" + "=".repeat(50));
  console.log("📊 検証結果サマリー");
  console.log("=".repeat(50));
  console.log(`総行数: ${stats.lines}`);
  console.log(`要件ID数: ${stats.totalIds}`);
  console.log(`検出された問題: ${issues.length}`);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  console.log(`  - エラー: ${errors.length}`);
  console.log(`  - 警告: ${warnings.length}`);

  if (issues.length > 0) {
    console.log("\n" + "=".repeat(50));
    console.log("📝 詳細");
    console.log("=".repeat(50));

    for (const issue of issues) {
      const icon = issue.severity === "error" ? "❌" : "⚠️";
      if (issue.line) {
        console.log(
          `${icon} [${issue.severity.toUpperCase()}] 行${issue.line}: "${issue.match}" - ${issue.message}`,
        );
      } else {
        console.log(
          `${icon} [${issue.severity.toUpperCase()}] ${issue.message}`,
        );
      }
    }
  }

  // 品質スコア計算
  const baseScore = 100;
  const errorPenalty = errors.length * 5;
  const warningPenalty = warnings.length * 2;
  const score = Math.max(0, baseScore - errorPenalty - warningPenalty);

  console.log("\n" + "=".repeat(50));
  console.log(`📈 品質スコア: ${score}/100`);

  if (score >= 80) {
    console.log("✅ 良好: 軽微な修正で承認可能");
  } else if (score >= 60) {
    console.log("⚠️  要改善: 修正後に再レビュー推奨");
  } else {
    console.log("❌ 不十分: 大幅な修正が必要");
  }
  console.log("=".repeat(50) + "\n");

  return score >= 60 ? 0 : 1;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node validate-requirements.mjs <要件定義書.md>");
    console.log("\n例:");
    console.log("  node validate-requirements.mjs ./docs/requirements.md");
    process.exit(1);
  }

  const filePath = resolve(args[0]);

  if (!existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const result = validateRequirements(content, filePath);
    const exitCode = displayResults(result);
    process.exit(exitCode);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
