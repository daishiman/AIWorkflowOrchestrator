#!/usr/bin/env node
/**
 * Command Performance Analyzer
 *
 * コマンドのパフォーマンス特性を分析します。
 *
 * 分析項目:
 * - トークン効率
 * - 実行複雑性
 * - 並列化可能性
 * - キャッシュ活用
 *
 * Usage:
 *   node analyze-performance.mjs <command-file.md>
 */

import fs from "fs";

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
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

function analyzeTokenEfficiency(content) {
  const metrics = {
    totalChars: content.length,
    totalLines: content.split("\n").length,
    estimatedTokens: Math.ceil(content.length / 4), // 大まかな推定
    codeBlockChars: 0,
    descriptionChars: 0,
    redundancy: 0,
  };

  // コードブロックのサイズ
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  metrics.codeBlockChars = codeBlocks.reduce(
    (sum, block) => sum + block.length,
    0,
  );

  // description のサイズ
  const descMatch = content.match(
    /description:\s*\|?\n?([\s\S]*?)(?=\n[a-z-]+:|---)/i,
  );
  if (descMatch) {
    metrics.descriptionChars = descMatch[1].length;
  }

  // 冗長性の検出（繰り返しパターン）
  const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordCounts = {};
  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  const repeatedWords = Object.entries(wordCounts).filter(
    ([_, count]) => count > 5,
  ).length;

  metrics.redundancy = Math.min(100, repeatedWords * 10);

  // 効率スコア計算
  const efficiencyScore = Math.max(
    0,
    100 -
      metrics.redundancy * 0.5 -
      (metrics.estimatedTokens > 1000 ? 20 : 0) -
      (metrics.totalLines > 200 ? 15 : 0),
  );

  return { metrics, score: Math.round(efficiencyScore) };
}

function analyzeExecutionComplexity(content) {
  const factors = {
    conditionalBranches: 0,
    loops: 0,
    externalCalls: 0,
    nestedDepth: 0,
    stepsCount: 0,
  };

  // 条件分岐
  factors.conditionalBranches = (
    content.match(/if|when|unless|場合|条件/gi) || []
  ).length;

  // ループ
  factors.loops = (
    content.match(/for each|foreach|loop|repeat|繰り返し|ループ/gi) || []
  ).length;

  // 外部呼び出し
  factors.externalCalls = (
    content.match(/api|fetch|request|call|外部|リクエスト/gi) || []
  ).length;

  // ネストの深さ推定
  const lines = content.split("\n");
  let maxIndent = 0;
  lines.forEach((line) => {
    const indent = (line.match(/^(\s*)/)?.[1]?.length || 0) / 2;
    maxIndent = Math.max(maxIndent, indent);
  });
  factors.nestedDepth = Math.min(maxIndent, 10);

  // ステップ数
  factors.stepsCount =
    (content.match(/##\s*(Step|ステップ)/gi) || []).length ||
    (content.match(/^\d+\.\s/gm) || []).length;

  // 複雑性スコア計算
  const complexityScore =
    factors.conditionalBranches * 5 +
    factors.loops * 8 +
    factors.externalCalls * 10 +
    factors.nestedDepth * 3 +
    factors.stepsCount * 2;

  const level =
    complexityScore >= 50 ? "HIGH" : complexityScore >= 25 ? "MEDIUM" : "LOW";

  return { factors, score: complexityScore, level };
}

function analyzeParallelizability(content) {
  const analysis = {
    independentTasks: [],
    dependencies: [],
    parallelOpportunities: 0,
    recommendations: [],
  };

  // 独立タスクの検出
  const steps = content.match(/##\s*(Step|ステップ)\s*\d+[^\n]*/gi) || [];
  analysis.independentTasks = steps;

  // 依存関係の検出
  const depPatterns = [
    /after|before|depend|requires|前に|後に|依存|必要/gi,
    /then|次に|その後/gi,
    /result.*from|output.*of|結果.*から/gi,
  ];

  depPatterns.forEach((pattern) => {
    const matches = content.match(pattern) || [];
    analysis.dependencies.push(...matches);
  });

  // 並列化可能性の評価
  if (steps.length > 1 && analysis.dependencies.length < steps.length) {
    analysis.parallelOpportunities =
      steps.length - analysis.dependencies.length;
    analysis.recommendations.push(
      `${analysis.parallelOpportunities}個のタスクを並列実行できる可能性があります`,
    );
  }

  // 並列化パターンの検出
  if (/parallel|concurrent|同時|並列/i.test(content)) {
    analysis.recommendations.push("並列処理が既に考慮されています");
  } else if (analysis.parallelOpportunities > 2) {
    analysis.recommendations.push("並列処理の導入を検討してください");
  }

  const score =
    analysis.parallelOpportunities > 0
      ? Math.min(100, 50 + analysis.parallelOpportunities * 15)
      : 30;

  return { ...analysis, score };
}

function analyzeCacheUtilization(content) {
  const analysis = {
    cacheOpportunities: [],
    currentCaching: false,
    recommendations: [],
  };

  // キャッシュ使用の検出
  analysis.currentCaching = /cache|キャッシュ|memoize|store.*result/i.test(
    content,
  );

  // キャッシュ機会の検出
  const cacheablePatterns = [
    { pattern: /fetch|api|request|リクエスト/i, description: "API呼び出し" },
    {
      pattern: /read.*file|ファイル.*読み込み/i,
      description: "ファイル読み込み",
    },
    { pattern: /compute|calculate|計算/i, description: "計算結果" },
    { pattern: /search|query|検索|クエリ/i, description: "検索結果" },
  ];

  for (const { pattern, description } of cacheablePatterns) {
    if (pattern.test(content)) {
      analysis.cacheOpportunities.push(description);
    }
  }

  // 推奨事項
  if (analysis.cacheOpportunities.length > 0 && !analysis.currentCaching) {
    analysis.recommendations.push(
      `キャッシュ可能な処理: ${analysis.cacheOpportunities.join(", ")}`,
    );
  }

  if (/repeat|loop|繰り返し/i.test(content) && !analysis.currentCaching) {
    analysis.recommendations.push("繰り返し処理にキャッシュを検討してください");
  }

  const score = analysis.currentCaching
    ? 80
    : 100 - analysis.cacheOpportunities.length * 15;

  return { ...analysis, score: Math.max(0, score) };
}

function generateOptimizationSuggestions(
  tokenEfficiency,
  complexity,
  parallel,
  cache,
) {
  const suggestions = [];

  // トークン効率
  if (tokenEfficiency.score < 70) {
    suggestions.push({
      area: "トークン効率",
      priority: "HIGH",
      suggestion: "冗長な説明を削減し、より簡潔な記述を検討してください",
    });
  }

  // 複雑性
  if (complexity.level === "HIGH") {
    suggestions.push({
      area: "複雑性",
      priority: "HIGH",
      suggestion:
        "コマンドを複数の小さなコマンドに分割することを検討してください",
    });
  }

  // 並列化
  if (parallel.parallelOpportunities > 2) {
    suggestions.push({
      area: "並列化",
      priority: "MEDIUM",
      suggestion: `${parallel.parallelOpportunities}個の独立タスクを並列実行できます`,
    });
  }

  // キャッシュ
  if (cache.cacheOpportunities.length > 0 && !cache.currentCaching) {
    suggestions.push({
      area: "キャッシュ",
      priority: "MEDIUM",
      suggestion: `${cache.cacheOpportunities.join(", ")}のキャッシュを検討してください`,
    });
  }

  return suggestions;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Performance Analyzer${COLORS.reset}

Usage:
  node analyze-performance.mjs <command-file.md>

分析項目:
  - トークン効率: コマンドサイズと冗長性
  - 実行複雑性: 分岐、ループ、外部呼び出し
  - 並列化可能性: 独立タスクの検出
  - キャッシュ活用: キャッシュ機会の特定
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
    `\n${COLORS.bold}Analyzing Performance: ${filePath}${COLORS.reset}\n`,
  );

  // 各分析を実行
  const tokenEfficiency = analyzeTokenEfficiency(content);
  const complexity = analyzeExecutionComplexity(content);
  const parallel = analyzeParallelizability(content);
  const cache = analyzeCacheUtilization(content);

  // 総合スコア
  const overallScore = Math.round(
    tokenEfficiency.score * 0.25 +
      (100 - Math.min(complexity.score, 100)) * 0.25 +
      parallel.score * 0.25 +
      cache.score * 0.25,
  );

  const scoreColor =
    overallScore >= 70
      ? COLORS.green
      : overallScore >= 50
        ? COLORS.yellow
        : COLORS.red;

  console.log(
    `${COLORS.bold}Performance Score: ${scoreColor}${overallScore}%${COLORS.reset}\n`,
  );

  // トークン効率
  console.log(
    `${COLORS.bold}Token Efficiency:${COLORS.reset} ${tokenEfficiency.score}%`,
  );
  console.log(`  Estimated tokens: ${tokenEfficiency.metrics.estimatedTokens}`);
  console.log(`  Lines: ${tokenEfficiency.metrics.totalLines}`);
  console.log(`  Redundancy: ${tokenEfficiency.metrics.redundancy}%`);

  // 複雑性
  const complexColor =
    complexity.level === "LOW"
      ? COLORS.green
      : complexity.level === "MEDIUM"
        ? COLORS.yellow
        : COLORS.red;
  console.log(
    `\n${COLORS.bold}Execution Complexity:${COLORS.reset} ${complexColor}${complexity.level}${COLORS.reset} (${complexity.score})`,
  );
  console.log(
    `  Conditional branches: ${complexity.factors.conditionalBranches}`,
  );
  console.log(`  Loops: ${complexity.factors.loops}`);
  console.log(`  External calls: ${complexity.factors.externalCalls}`);
  console.log(`  Steps: ${complexity.factors.stepsCount}`);

  // 並列化
  console.log(
    `\n${COLORS.bold}Parallelizability:${COLORS.reset} ${parallel.score}%`,
  );
  console.log(`  Independent tasks: ${parallel.independentTasks.length}`);
  console.log(`  Dependencies: ${parallel.dependencies.length}`);
  console.log(`  Parallel opportunities: ${parallel.parallelOpportunities}`);

  // キャッシュ
  console.log(
    `\n${COLORS.bold}Cache Utilization:${COLORS.reset} ${cache.score}%`,
  );
  console.log(`  Current caching: ${cache.currentCaching ? "Yes" : "No"}`);
  console.log(`  Cache opportunities: ${cache.cacheOpportunities.length}`);

  // 最適化提案
  const suggestions = generateOptimizationSuggestions(
    tokenEfficiency,
    complexity,
    parallel,
    cache,
  );

  if (suggestions.length > 0) {
    console.log(`\n${COLORS.bold}Optimization Suggestions:${COLORS.reset}`);
    suggestions.forEach((s) => {
      const priorityColor = s.priority === "HIGH" ? COLORS.red : COLORS.yellow;
      console.log(
        `  ${priorityColor}[${s.priority}]${COLORS.reset} ${s.area}: ${s.suggestion}`,
      );
    });
  }

  // サマリー
  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Overall Score: ${overallScore}%`);
  console.log(`  Token Efficiency: ${tokenEfficiency.score}%`);
  console.log(`  Complexity: ${complexity.level}`);
  console.log(`  Parallelizability: ${parallel.score}%`);
  console.log(`  Cache Utilization: ${cache.score}%`);

  if (overallScore >= 70) {
    log("success", "パフォーマンス特性は良好です");
  }

  process.exit(overallScore < 50 ? 1 : 0);
}

main();
