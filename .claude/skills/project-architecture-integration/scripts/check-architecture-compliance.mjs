#!/usr/bin/env node
/**
 * check-architecture-compliance.mjs
 * エージェントがプロジェクトアーキテクチャに準拠しているか検証するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/project-architecture-integration/scripts/check-architecture-compliance.mjs <agent_file.md>
 *
 * 出力:
 *   アーキテクチャ準拠チェックの結果を表示します。
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ARCHITECTURE_CHECKS = {
  layerStructure: {
    name: "レイヤー構造準拠",
    description: "ハイブリッドアーキテクチャ（shared/features/app）の理解",
    keywords: [
      "shared/",
      "features/",
      "app/",
      "shared/core",
      "shared/infrastructure",
    ],
    weight: 3,
  },
  dependencyDirection: {
    name: "依存関係の方向性",
    description: "外から内への単方向依存",
    keywords: ["依存関係", "単方向", "逆方向の依存"],
    weight: 3,
  },
  databasePrinciples: {
    name: "データベース設計原則",
    description: "JSON、トランザクション、インデックス戦略の考慮",
    keywords: [
      "JSON",
      "トランザクション",
      "インデックス",
      "SQLite",
      "データベース",
    ],
    weight: 2,
  },
  apiDesign: {
    name: "REST API設計",
    description: "RESTful原則、バージョニング、HTTPステータス",
    keywords: ["REST", "API", "HTTPステータス", "バージョン", "エンドポイント"],
    weight: 2,
  },
  testStrategy: {
    name: "テスト戦略",
    description: "TDD、テストピラミッド、カバレッジ目標",
    keywords: [
      "TDD",
      "テスト",
      "カバレッジ",
      "ユニットテスト",
      "E2E",
      "Vitest",
      "Playwright",
    ],
    weight: 2,
  },
  errorHandling: {
    name: "エラーハンドリング",
    description: "エラー分類、リトライ戦略、構造化ログ",
    keywords: [
      "エラー",
      "リトライ",
      "ログ",
      "サーキットブレーカー",
      "構造化ログ",
    ],
    weight: 2,
  },
  cicd: {
    name: "CI/CD要件",
    description: "GitHub Actions、品質ゲート、自動デプロイ",
    keywords: ["CI/CD", "GitHub Actions", "デプロイ", "品質ゲート", "ビルド"],
    weight: 1,
  },
};

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = {};
  const lines = match[1].split("\n");
  let currentKey = null;
  let multilineValue = "";

  for (const line of lines) {
    if (line.match(/^\w+:/)) {
      if (currentKey && multilineValue) {
        yaml[currentKey] = multilineValue.trim();
        multilineValue = "";
      }
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      currentKey = key.trim();
      if (value && value !== "|") {
        yaml[currentKey] = value;
        currentKey = null;
      }
    } else if (currentKey && line.startsWith("  ")) {
      multilineValue += line.trim() + "\n";
    }
  }

  if (currentKey && multilineValue) {
    yaml[currentKey] = multilineValue.trim();
  }

  return yaml;
}

function checkKeywords(content, keywords) {
  const lowerContent = content.toLowerCase();
  const found = [];
  const missing = [];

  for (const keyword of keywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  return { found, missing, score: found.length / keywords.length };
}

function determineRelevantChecks(content, yaml) {
  const tools = yaml.tools || "";
  const description = yaml.description || "";
  const relevantChecks = [];

  // すべてのエージェントに適用
  relevantChecks.push("layerStructure");
  relevantChecks.push("dependencyDirection");

  // データベース関連
  if (
    content.includes("データベース") ||
    content.includes("DB") ||
    content.includes("repository") ||
    tools.includes("Bash")
  ) {
    relevantChecks.push("databasePrinciples");
  }

  // API関連
  if (
    content.includes("API") ||
    content.includes("エンドポイント") ||
    content.includes("HTTP") ||
    content.includes("REST")
  ) {
    relevantChecks.push("apiDesign");
  }

  // テスト関連
  if (
    content.includes("テスト") ||
    content.includes("test") ||
    description.includes("テスト")
  ) {
    relevantChecks.push("testStrategy");
  }

  // エラーハンドリング（すべてのエージェントに推奨）
  relevantChecks.push("errorHandling");

  // デプロイ関連
  if (
    content.includes("デプロイ") ||
    content.includes("CI") ||
    content.includes("deploy") ||
    tools.includes("Bash")
  ) {
    relevantChecks.push("cicd");
  }

  return relevantChecks;
}

function analyzeCompliance(content, yaml) {
  const results = {};
  const relevantChecks = determineRelevantChecks(content, yaml);

  for (const [checkId, check] of Object.entries(ARCHITECTURE_CHECKS)) {
    const isRelevant = relevantChecks.includes(checkId);
    const { found, missing, score } = checkKeywords(content, check.keywords);

    results[checkId] = {
      ...check,
      relevant: isRelevant,
      found,
      missing,
      score: isRelevant ? score : null,
      pass: isRelevant ? score >= 0.3 : true, // 30%以上でパス
    };
  }

  return results;
}

function calculateOverallScore(results) {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const [checkId, result] of Object.entries(results)) {
    if (result.relevant) {
      totalWeight += result.weight;
      weightedScore += result.score * result.weight * 10;
    }
  }

  return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

function printResults(filePath, yaml, results) {
  const overallScore = calculateOverallScore(results);

  console.log("═══════════════════════════════════════════════════════════");
  console.log("          アーキテクチャ準拠チェックレポート                  ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`ファイル: ${filePath}`);
  console.log(`エージェント名: ${yaml.name || "不明"}`);
  console.log("───────────────────────────────────────────────────────────");

  for (const [checkId, result] of Object.entries(results)) {
    if (!result.relevant) continue;

    const status = result.pass ? "✅" : "⚠️";
    const scoreDisplay = (result.score * 10).toFixed(1);

    console.log(`\n${status} ${result.name} (${scoreDisplay}/10)`);
    console.log(`   ${result.description}`);

    if (result.found.length > 0) {
      console.log(`   ✓ 検出: ${result.found.join(", ")}`);
    }
    if (result.missing.length > 0 && !result.pass) {
      console.log(`   ✗ 未検出: ${result.missing.join(", ")}`);
    }
  }

  console.log("\n───────────────────────────────────────────────────────────");
  console.log(`総合スコア: ${overallScore.toFixed(1)}/10`);

  if (overallScore >= 7) {
    console.log("✅ 評価: アーキテクチャに準拠しています");
  } else if (overallScore >= 5) {
    console.log("⚠️  評価: 一部改善が必要です");
  } else {
    console.log("❌ 評価: アーキテクチャ準拠の見直しが必要です");
  }
  console.log("═══════════════════════════════════════════════════════════");

  // 改善提案
  const improvements = [];
  for (const [checkId, result] of Object.entries(results)) {
    if (result.relevant && !result.pass) {
      improvements.push(
        `- ${result.name}: ${result.missing.slice(0, 3).join(", ")}への言及を追加`,
      );
    }
  }

  if (improvements.length > 0) {
    console.log("\n改善提案:");
    improvements.forEach((i) => console.log(i));
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "使用方法: node check-architecture-compliance.mjs <agent_file.md>",
    );
    process.exit(1);
  }

  const filePath = resolve(args[0]);
  let content;

  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`エラー: ファイル "${filePath}" を読み込めません`);
    process.exit(1);
  }

  const yaml = parseYamlFrontmatter(content);
  const results = analyzeCompliance(content, yaml);

  printResults(filePath, yaml, results);

  const overallScore = calculateOverallScore(results);
  process.exit(overallScore >= 5 ? 0 : 1);
}

main();
