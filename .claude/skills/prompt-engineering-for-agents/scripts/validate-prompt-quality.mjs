#!/usr/bin/env node

/**
 * プロンプト品質検証スクリプト
 *
 * System Promptの品質を4つの指標で評価します:
 * - 明確性: 曖昧な表現の有無
 * - 具体性: 測定可能な基準の有無
 * - 構造化: セクション構成の論理性
 * - 完全性: 必須要素の充足度
 */

import { readFileSync } from "fs";
import { join } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

// 曖昧な表現のリスト
const AMBIGUOUS_TERMS = [
  "適宜",
  "必要に応じて",
  "など",
  "いくつかの",
  "できるだけ",
  "可能な限り",
  "適切に",
  "よしなに",
];

// 必須セクション
const REQUIRED_SECTIONS = [
  "##.*役割",
  "##.*ワークフロー",
  "##.*ベストプラクティス",
];

function showHelp() {
  console.log(`
Usage: node scripts/validate-prompt-quality.mjs <prompt-file> [options]

Arguments:
  prompt-file   Path to the prompt file to validate

Options:
  -h, --help    Show this help message
  `);
}

function evaluateClarity(content) {
  let score = 5;
  const findings = [];

  for (const term of AMBIGUOUS_TERMS) {
    const regex = new RegExp(term, "gi");
    const matches = content.match(regex);
    if (matches) {
      findings.push({ term, count: matches.length });
      score -= 0.5;
    }
  }

  score = Math.max(1, Math.min(5, score));

  return {
    score: Math.round(score * 10) / 10,
    findings,
    level: score >= 4 ? "Good" : score >= 3 ? "Fair" : "Poor",
  };
}

function evaluateStructure(content) {
  let score = 5;
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    const regex = new RegExp(section, "i");
    if (!regex.test(content)) {
      missing.push(section.replace("##.*", ""));
      score -= 1.5;
    }
  }

  score = Math.max(1, Math.min(5, score));

  return {
    score: Math.round(score * 10) / 10,
    missing,
    level: score >= 4 ? "Good" : score >= 3 ? "Fair" : "Poor",
  };
}

function evaluateCompleteness(content) {
  let score = 5;
  const missing = [];

  // 必須要素のチェック
  const elements = [
    { name: "役割定義", pattern: /^##\s*役割/im },
    { name: "ワークフロー", pattern: /^##\s*ワークフロー/im },
    { name: "制約", pattern: /(すべきこと|避けるべきこと)/i },
  ];

  for (const element of elements) {
    if (!element.pattern.test(content)) {
      missing.push(element.name);
      score -= 1.5;
    }
  }

  score = Math.max(1, Math.min(5, score));

  return {
    score: Math.round(score * 10) / 10,
    missing,
    level: score >= 4 ? "Good" : score >= 3 ? "Fair" : "Poor",
  };
}

function calculateOverallScore(clarity, structure, completeness) {
  const average = (clarity.score + structure.score + completeness.score) / 3;
  const overall = Math.round(average * 10) / 10;

  let level;
  if (overall >= 4.5) level = "Excellent";
  else if (overall >= 3.5) level = "Good";
  else if (overall >= 2.5) level = "Fair";
  else level = "Poor";

  return { overall, level };
}

function main(args) {
  if (args.includes("-h") || args.includes("--help") || args.length === 0) {
    showHelp();
    process.exit(args.length === 0 ? EXIT_ARGS_ERROR : EXIT_SUCCESS);
  }

  const filePath = args[0];

  try {
    const content = readFileSync(filePath, "utf-8");

    console.log("\n=== Prompt Quality Validation ===\n");
    console.log(`File: ${filePath}\n`);

    // 明確性評価
    const clarity = evaluateClarity(content);
    console.log(`📝 Clarity: ${clarity.score}/5 (${clarity.level})`);
    if (clarity.findings.length > 0) {
      console.log("   Ambiguous terms found:");
      clarity.findings.forEach(({ term, count }) => {
        console.log(`   - "${term}": ${count} occurrence(s)`);
      });
    }
    console.log("");

    // 構造化評価
    const structure = evaluateStructure(content);
    console.log(`🏗️  Structure: ${structure.score}/5 (${structure.level})`);
    if (structure.missing.length > 0) {
      console.log("   Missing sections:");
      structure.missing.forEach((section) => {
        console.log(`   - ${section}`);
      });
    }
    console.log("");

    // 完全性評価
    const completeness = evaluateCompleteness(content);
    console.log(
      `✅ Completeness: ${completeness.score}/5 (${completeness.level})`,
    );
    if (completeness.missing.length > 0) {
      console.log("   Missing elements:");
      completeness.missing.forEach((element) => {
        console.log(`   - ${element}`);
      });
    }
    console.log("");

    // 総合評価
    const overall = calculateOverallScore(clarity, structure, completeness);
    console.log(`🎯 Overall Score: ${overall.overall}/5 (${overall.level})`);
    console.log("");

    // 推奨事項
    if (overall.overall < 4.0) {
      console.log("📋 Recommendations:");
      if (clarity.score < 4) {
        console.log("   - Replace ambiguous terms with specific conditions");
      }
      if (structure.score < 4) {
        console.log(
          "   - Add missing sections to follow the 7-section structure",
        );
      }
      if (completeness.score < 4) {
        console.log("   - Add missing elements (role, workflow, constraints)");
      }
      console.log("");
    }

    // 評価基準
    console.log("Evaluation Criteria:");
    console.log("- Excellent: 4.5-5.0");
    console.log("- Good: 3.5-4.4");
    console.log("- Fair: 2.5-3.4");
    console.log("- Poor: 1.0-2.4");
    console.log("");

    process.exit(EXIT_SUCCESS);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(EXIT_ERROR);
  }
}

main(process.argv.slice(2));
