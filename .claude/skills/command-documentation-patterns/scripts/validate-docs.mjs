#!/usr/bin/env node
/**
 * Command Documentation Patterns Validator
 *
 * コマンドファイルのドキュメンテーションを検証します。
 *
 * 検証項目:
 * - タイトルと概要
 * - 使用方法（Usage）
 * - 引数説明
 * - 例示（Examples）
 * - 注意事項
 *
 * Usage:
 *   node validate-docs.mjs <command-file.md>
 */

import fs from "fs";

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(type, message) {
  const icons = {
    error: `${COLORS.red}❌${COLORS.reset}`,
    success: `${COLORS.green}✅${COLORS.reset}`,
    warning: `${COLORS.yellow}⚠️${COLORS.reset}`,
    info: `${COLORS.blue}ℹ️${COLORS.reset}`,
  };
  console.log(`${icons[type]} ${message}`);
}

const DOC_SECTIONS = {
  title: {
    name: "タイトル",
    pattern: /^#\s+.+/m,
    required: true,
    weight: 3,
  },
  description: {
    name: "概要/説明",
    pattern: /description:|概要|説明|##\s*(About|Overview)/i,
    required: true,
    weight: 3,
  },
  usage: {
    name: "使用方法",
    pattern: /##\s*(Usage|使用方法|使い方)|```.*\n.*\/[a-z]/i,
    required: true,
    weight: 3,
  },
  arguments: {
    name: "引数説明",
    pattern: /##\s*(Arguments|引数|Parameters|パラメータ)|\$ARGUMENTS|\$\d/i,
    required: false,
    weight: 2,
  },
  examples: {
    name: "使用例",
    pattern: /##\s*(Example|例|Sample)|```[\s\S]*?```/i,
    required: true,
    weight: 3,
  },
  notes: {
    name: "注意事項",
    pattern: /##\s*(Note|注意|Warning|警告|Caution)|⚠️|注:/i,
    required: false,
    weight: 1,
  },
  seeAlso: {
    name: "関連コマンド",
    pattern: /##\s*(See Also|関連|Related)|\/[a-z]+-[a-z]+/i,
    required: false,
    weight: 1,
  },
};

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
    if (keyMatch) {
      frontmatter[keyMatch[1]] = keyMatch[2].trim();
    }
  }

  return frontmatter;
}

function analyzeDocumentation(content) {
  const results = {};
  let score = 0;
  let maxScore = 0;
  const issues = [];
  const warnings = [];

  const frontmatter = parseFrontmatter(content);

  for (const [key, section] of Object.entries(DOC_SECTIONS)) {
    const hasSection = section.pattern.test(content);
    results[key] = {
      name: section.name,
      present: hasSection,
      required: section.required,
      weight: section.weight,
    };

    maxScore += section.weight;
    if (hasSection) {
      score += section.weight;
    } else if (section.required) {
      issues.push(`必須セクション「${section.name}」がありません`);
    }
  }

  // Frontmatter description チェック
  if (frontmatter) {
    if (!frontmatter.description) {
      issues.push("Frontmatter に description がありません");
    } else {
      const descLines = frontmatter.description.split("|").length;
      if (descLines < 2) {
        warnings.push("description が短すぎます（複数行推奨）");
      }
    }
  }

  // 例の具体性チェック
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  if (codeBlocks.length === 0) {
    warnings.push("コードブロックの例がありません");
  }

  // 引数使用時の説明チェック
  if (/\$ARGUMENTS|\$\d/.test(content)) {
    if (!/argument-hint:/.test(content)) {
      warnings.push("引数を使用していますが argument-hint がありません");
    }
  }

  return {
    sections: results,
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    issues,
    warnings,
  };
}

function calculateReadability(content) {
  const lines = content.split("\n");
  const metrics = {
    totalLines: lines.length,
    codeBlocks: (content.match(/```/g) || []).length / 2,
    headers: (content.match(/^#{1,3}\s/gm) || []).length,
    lists: (content.match(/^[-*]\s/gm) || []).length,
    avgLineLength: Math.round(
      lines.filter((l) => l.trim()).reduce((sum, l) => sum + l.length, 0) /
        lines.filter((l) => l.trim()).length,
    ),
  };

  // 読みやすさスコア
  let readabilityScore = 100;

  // 長すぎる行
  if (metrics.avgLineLength > 100) readabilityScore -= 20;
  else if (metrics.avgLineLength > 80) readabilityScore -= 10;

  // ヘッダー不足
  if (metrics.headers < 2) readabilityScore -= 15;

  // リストの活用
  if (metrics.lists === 0 && metrics.totalLines > 30) readabilityScore -= 10;

  return {
    metrics,
    score: Math.max(0, readabilityScore),
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Documentation Patterns Validator${COLORS.reset}

Usage:
  node validate-docs.mjs <command-file.md>

検証セクション:
  - タイトル (必須)
  - 概要/説明 (必須)
  - 使用方法 (必須)
  - 引数説明
  - 使用例 (必須)
  - 注意事項
  - 関連コマンド
`);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    log("error", `ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");

  console.log(
    `\n${COLORS.bold}Analyzing Documentation: ${filePath}${COLORS.reset}\n`,
  );

  const analysis = analyzeDocumentation(content);
  const readability = calculateReadability(content);

  // ドキュメント品質スコア
  const overallScore = Math.round(
    (analysis.percentage + readability.score) / 2,
  );
  const gradeColor =
    overallScore >= 70
      ? COLORS.green
      : overallScore >= 50
        ? COLORS.yellow
        : COLORS.red;

  console.log(
    `${COLORS.bold}Documentation Quality: ${gradeColor}${overallScore}%${COLORS.reset}\n`,
  );

  // セクション分析
  console.log(`${COLORS.bold}Sections:${COLORS.reset}`);
  for (const [key, section] of Object.entries(analysis.sections)) {
    const status = section.present ? "✅" : section.required ? "❌" : "⬜";
    const reqLabel = section.required
      ? `${COLORS.red}(必須)${COLORS.reset}`
      : "";
    console.log(`  ${status} ${section.name} ${reqLabel}`);
  }

  // 可読性メトリクス
  console.log(`\n${COLORS.bold}Readability Metrics:${COLORS.reset}`);
  console.log(`  Lines: ${readability.metrics.totalLines}`);
  console.log(`  Headers: ${readability.metrics.headers}`);
  console.log(`  Code blocks: ${readability.metrics.codeBlocks}`);
  console.log(`  Lists: ${readability.metrics.lists}`);
  console.log(`  Avg line length: ${readability.metrics.avgLineLength}`);

  // Issues
  if (analysis.issues.length > 0) {
    console.log(`\n${COLORS.red}Issues:${COLORS.reset}`);
    analysis.issues.forEach((issue) => log("error", issue));
  }

  // Warnings
  if (analysis.warnings.length > 0) {
    console.log(`\n${COLORS.yellow}Warnings:${COLORS.reset}`);
    analysis.warnings.forEach((warning) => log("warning", warning));
  }

  // Summary
  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Section Score: ${analysis.percentage}%`);
  console.log(`  Readability Score: ${readability.score}%`);
  console.log(`  Overall Quality: ${overallScore}%`);

  if (overallScore >= 70 && analysis.issues.length === 0) {
    log("success", "ドキュメンテーションは適切に設定されています");
  }

  process.exit(analysis.issues.length > 0 ? 1 : 0);
}

main();
