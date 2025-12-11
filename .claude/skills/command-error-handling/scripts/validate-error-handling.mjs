#!/usr/bin/env node
/**
 * Command Error Handling Validator
 *
 * コマンドファイルのエラーハンドリングを検証します。
 *
 * 検証項目:
 * - エラーメッセージの明確さ
 * - リカバリー手順の存在
 * - ユーザーガイダンス
 * - ロールバック機能
 *
 * Usage:
 *   node validate-error-handling.mjs <command-file.md>
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

const ERROR_HANDLING_CHECKS = {
  errorDetection: {
    name: "エラー検出",
    patterns: [
      /error|fail|exception|エラー|失敗|例外/i,
      /catch|try|handle/i,
      /if.*not|if.*!|if.*null|if.*undefined/i,
    ],
    weight: 3,
  },
  errorMessages: {
    name: "エラーメッセージ",
    patterns: [
      /message|notify|alert|通知|メッセージ/i,
      /console\.(error|log)|log\(/i,
      /display.*error|show.*error|表示.*エラー/i,
    ],
    weight: 2,
  },
  recoverySteps: {
    name: "リカバリー手順",
    patterns: [
      /recover|retry|fallback|リカバリ|再試行|フォールバック/i,
      /alternative|backup|代替|バックアップ/i,
      /restore|回復|復元/i,
    ],
    weight: 3,
  },
  userGuidance: {
    name: "ユーザーガイダンス",
    patterns: [
      /suggest|recommend|hint|提案|推奨|ヒント/i,
      /try.*instead|instead.*try|代わりに/i,
      /check.*if|make sure|確認.*してください/i,
    ],
    weight: 2,
  },
  rollback: {
    name: "ロールバック機能",
    patterns: [
      /rollback|undo|revert|ロールバック|元に戻す/i,
      /backup.*before|前.*バックアップ/i,
      /restore.*state|状態.*復元/i,
    ],
    weight: 2,
  },
  gracefulDegradation: {
    name: "優雅な劣化",
    patterns: [
      /graceful|partial|部分的/i,
      /continue.*despite|skip.*error|エラー.*スキップ/i,
      /best effort|可能な限り/i,
    ],
    weight: 1,
  },
};

function analyzeErrorHandling(content) {
  const results = {};
  let totalScore = 0;
  let maxScore = 0;

  for (const [key, check] of Object.entries(ERROR_HANDLING_CHECKS)) {
    const hasPattern = check.patterns.some((pattern) => pattern.test(content));
    results[key] = {
      name: check.name,
      present: hasPattern,
      weight: check.weight,
    };

    maxScore += check.weight;
    if (hasPattern) {
      totalScore += check.weight;
    }
  }

  return {
    checks: results,
    score: totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100),
  };
}

function detectRiskyOperations(content) {
  const risks = [];

  const riskyPatterns = [
    { pattern: /delete|remove|rm\s/gi, description: "ファイル/データ削除" },
    { pattern: /drop|truncate/gi, description: "データベース操作" },
    { pattern: /deploy|push.*prod/gi, description: "デプロイ操作" },
    { pattern: /update|modify|edit/gi, description: "更新操作" },
    { pattern: /execute|run|exec/gi, description: "コマンド実行" },
  ];

  for (const { pattern, description } of riskyPatterns) {
    if (pattern.test(content)) {
      risks.push(description);
    }
  }

  return risks;
}

function generateRecommendations(analysis, risks) {
  const recommendations = [];

  // 不足しているチェックの推奨
  for (const [key, check] of Object.entries(analysis.checks)) {
    if (!check.present && check.weight >= 2) {
      recommendations.push(`${check.name}を追加してください`);
    }
  }

  // リスキー操作に対する推奨
  if (risks.length > 0 && !analysis.checks.rollback.present) {
    recommendations.push(
      "リスキーな操作があるため、ロールバック機能を追加してください",
    );
  }

  if (risks.length > 0 && !analysis.checks.recoverySteps.present) {
    recommendations.push(
      "リスキーな操作があるため、リカバリー手順を追加してください",
    );
  }

  return recommendations;
}

function getGrade(percentage) {
  if (percentage >= 90) return { grade: "A", color: COLORS.green };
  if (percentage >= 70) return { grade: "B", color: COLORS.green };
  if (percentage >= 50) return { grade: "C", color: COLORS.yellow };
  if (percentage >= 30) return { grade: "D", color: COLORS.yellow };
  return { grade: "F", color: COLORS.red };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Error Handling Validator${COLORS.reset}

Usage:
  node validate-error-handling.mjs <command-file.md>

検証項目:
  - エラー検出パターン
  - エラーメッセージの明確さ
  - リカバリー手順の存在
  - ユーザーガイダンス
  - ロールバック機能
  - 優雅な劣化（Graceful Degradation）
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
    `\n${COLORS.bold}Analyzing Error Handling: ${filePath}${COLORS.reset}\n`,
  );

  // 分析実行
  const analysis = analyzeErrorHandling(content);
  const risks = detectRiskyOperations(content);
  const { grade, color } = getGrade(analysis.percentage);

  // グレード表示
  console.log(
    `${COLORS.bold}Error Handling Grade: ${color}${grade} (${analysis.percentage}%)${COLORS.reset}\n`,
  );

  // 各チェック項目の結果
  console.log(`${COLORS.bold}Checks:${COLORS.reset}`);
  for (const [key, check] of Object.entries(analysis.checks)) {
    const status = check.present ? "✅" : "❌";
    const weightDisplay = "★".repeat(check.weight);
    console.log(
      `  ${status} ${check.name} ${COLORS.blue}${weightDisplay}${COLORS.reset}`,
    );
  }

  // リスキー操作の警告
  if (risks.length > 0) {
    console.log(`\n${COLORS.yellow}Risky Operations Detected:${COLORS.reset}`);
    risks.forEach((risk) => log("warning", risk));
  }

  // 推奨事項
  const recommendations = generateRecommendations(analysis, risks);
  if (recommendations.length > 0) {
    console.log(`\n${COLORS.bold}Recommendations:${COLORS.reset}`);
    recommendations.forEach((rec) => console.log(`  - ${rec}`));
  }

  // サマリー
  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(
    `  Score: ${analysis.score}/${analysis.maxScore} (${analysis.percentage}%)`,
  );
  console.log(`  Grade: ${grade}`);
  console.log(`  Risky Operations: ${risks.length}`);

  if (analysis.percentage >= 70 && risks.length === 0) {
    log("success", "エラーハンドリングは適切に設定されています");
  }

  process.exit(analysis.percentage < 50 ? 1 : 0);
}

main();
