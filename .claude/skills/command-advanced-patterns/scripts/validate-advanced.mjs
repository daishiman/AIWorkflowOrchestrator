#!/usr/bin/env node
/**
 * Command Advanced Patterns Validator
 *
 * 高度なコマンドパターンを検証します。
 *
 * 対応パターン:
 * - Pipeline（パイプライン処理）
 * - Meta-command（メタコマンド）
 * - Interactive（対話的処理）
 *
 * Usage:
 *   node validate-advanced.mjs <command-file.md>
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

const ADVANCED_PATTERNS = {
  pipeline: {
    name: "Pipeline（パイプライン処理）",
    detect: (content) => {
      return (
        /\|>|→|then|次に|パイプ|pipeline/i.test(content) ||
        /output.*input|result.*next/i.test(content)
      );
    },
    validate: (content) => {
      const issues = [];
      const warnings = [];

      // パイプラインステージの存在確認
      const stages = content.match(/##\s*(Stage|Phase|ステージ)/gi) || [];
      if (stages.length === 0 && /pipeline/i.test(content)) {
        warnings.push("Pipelineパターンには明確なステージ定義を推奨します");
      }

      // エラーハンドリングの確認
      if (!/error|fail|catch|エラー|失敗/i.test(content)) {
        warnings.push("パイプライン中断時のエラーハンドリングがありません");
      }

      // 中間結果の保存確認
      if (!/checkpoint|save|保存|intermediate/i.test(content)) {
        warnings.push("中間結果の保存ポイントがありません");
      }

      return { issues, warnings };
    },
  },
  metaCommand: {
    name: "Meta-command（メタコマンド）",
    detect: (content) => {
      return (
        /\/[a-z]+-[a-z]+|invoke|dispatch|orchestrat/i.test(content) ||
        /call.*command|実行.*コマンド|delegate/i.test(content)
      );
    },
    validate: (content) => {
      const issues = [];
      const warnings = [];

      // 呼び出すコマンドの明示
      const commandRefs = content.match(/\/[a-z][a-z0-9-]+/g) || [];
      if (commandRefs.length === 0) {
        warnings.push("呼び出すコマンドが明示されていません");
      }

      // 循環参照の可能性
      if (/recursive|self-call|再帰/i.test(content)) {
        warnings.push("再帰呼び出しには終了条件が必要です");
      }

      // 依存コマンドの存在確認の指示
      if (!/exist|check|確認|validate/i.test(content)) {
        warnings.push("依存コマンドの存在確認を追加してください");
      }

      return { issues, warnings };
    },
  },
  interactive: {
    name: "Interactive（対話的処理）",
    detect: (content) => {
      return (
        /prompt|ask|confirm|input|質問|確認|入力|選択/i.test(content) ||
        /user.*response|ユーザー.*回答/i.test(content)
      );
    },
    validate: (content) => {
      const issues = [];
      const warnings = [];

      // タイムアウト/デフォルト値
      if (!/timeout|default|デフォルト|タイムアウト/i.test(content)) {
        warnings.push(
          "対話にはタイムアウトまたはデフォルト値を設定してください",
        );
      }

      // 入力検証
      if (!/validate|check|valid|検証|チェック/i.test(content)) {
        warnings.push("ユーザー入力の検証がありません");
      }

      // キャンセル処理
      if (!/cancel|abort|中止|キャンセル/i.test(content)) {
        warnings.push("キャンセル時の処理が定義されていません");
      }

      return { issues, warnings };
    },
  },
};

function analyzePatterns(content) {
  const results = [];

  for (const [key, pattern] of Object.entries(ADVANCED_PATTERNS)) {
    if (pattern.detect(content)) {
      const validation = pattern.validate(content);
      results.push({
        key,
        name: pattern.name,
        ...validation,
      });
    }
  }

  return results;
}

function calculateComplexity(content, patterns) {
  let score = 0;

  // パターン数による複雑性
  score += patterns.length * 10;

  // 行数による複雑性
  const lines = content.split("\n").length;
  if (lines > 100) score += 20;
  else if (lines > 50) score += 10;

  // 条件分岐の数
  const conditions = (content.match(/if|when|場合|条件/gi) || []).length;
  score += conditions * 5;

  // ネストの深さ推定
  const maxIndent = Math.max(
    ...content.split("\n").map((l) => l.match(/^(\s*)/)?.[1]?.length || 0),
  );
  score += Math.floor(maxIndent / 2) * 3;

  return {
    score,
    level: score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW",
    color:
      score >= 50 ? COLORS.red : score >= 25 ? COLORS.yellow : COLORS.green,
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Advanced Patterns Validator${COLORS.reset}

Usage:
  node validate-advanced.mjs <command-file.md>

検出パターン:
  - Pipeline（パイプライン処理）
  - Meta-command（メタコマンド）
  - Interactive（対話的処理）

複雑性評価:
  - LOW: シンプルな高度パターン
  - MEDIUM: 適度な複雑性
  - HIGH: 分割を検討すべき複雑性
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
    `\n${COLORS.bold}Analyzing Advanced Patterns: ${filePath}${COLORS.reset}\n`,
  );

  const patterns = analyzePatterns(content);
  const complexity = calculateComplexity(content, patterns);

  // 複雑性表示
  console.log(
    `${COLORS.bold}Complexity: ${complexity.color}${complexity.score} (${complexity.level})${COLORS.reset}\n`,
  );

  if (patterns.length === 0) {
    log("info", "高度なパターンは検出されませんでした");
  } else {
    console.log(`${COLORS.bold}Detected Advanced Patterns:${COLORS.reset}`);

    let totalIssues = 0;
    let totalWarnings = 0;

    for (const pattern of patterns) {
      console.log(`\n${COLORS.blue}${pattern.name}${COLORS.reset}`);

      if (pattern.issues.length > 0) {
        pattern.issues.forEach((issue) => {
          log("error", issue);
          totalIssues++;
        });
      }

      if (pattern.warnings.length > 0) {
        pattern.warnings.forEach((warning) => {
          log("warning", warning);
          totalWarnings++;
        });
      }

      if (pattern.issues.length === 0 && pattern.warnings.length === 0) {
        log("success", "問題なし");
      }
    }

    console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
    console.log(`  Advanced patterns: ${patterns.length}`);
    console.log(`  Complexity: ${complexity.level} (${complexity.score})`);
    console.log(`  Errors: ${totalIssues}`);
    console.log(`  Warnings: ${totalWarnings}`);

    if (complexity.level === "HIGH") {
      console.log(`\n${COLORS.yellow}Recommendations:${COLORS.reset}`);
      console.log("  - コマンドを複数の小さなコマンドに分割してください");
      console.log("  - 共通処理をユーティリティコマンドとして抽出してください");
    }

    process.exit(totalIssues > 0 ? 1 : 0);
  }
}

main();
