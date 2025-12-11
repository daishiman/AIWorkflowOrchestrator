#!/usr/bin/env node
/**
 * Command Arguments Validator
 *
 * コマンドファイルの引数システムを検証します。
 *
 * 検証項目:
 * - $ARGUMENTS の使用
 * - 位置引数（$1, $2, ...）の使用
 * - argument-hint の整合性
 * - 引数検証ロジックの存在
 *
 * Usage:
 *   node validate-arguments.mjs <command-file.md>
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

function extractArgumentHint(content) {
  const match = content.match(/argument-hint:\s*(.+)/);
  return match ? match[1].trim() : null;
}

function analyzeArgumentUsage(content) {
  const usage = {
    hasArguments: content.includes("$ARGUMENTS"),
    positionalArgs: [],
    hasValidation: false,
    hasDefaultValue: false,
  };

  // 位置引数の検出
  const positionalMatches = content.match(/\$(\d+)/g);
  if (positionalMatches) {
    usage.positionalArgs = [...new Set(positionalMatches)].sort();
  }

  // 検証ロジックの検出
  const validationPatterns = [
    /if\s*\[\s*-z\s*"\$ARGUMENTS"/,
    /if\s*\[\s*-z\s*"\$\d+"/,
    /\[\s*-z\s*"?\$ARGUMENTS"?\s*\]/,
    /validation/i,
    /check.*argument/i,
    /required.*argument/i,
  ];
  usage.hasValidation = validationPatterns.some((p) => p.test(content));

  // デフォルト値の検出
  const defaultPatterns = [/\$\{.*:-.*\}/, /default/i, /if.*empty.*use/i];
  usage.hasDefaultValue = defaultPatterns.some((p) => p.test(content));

  return usage;
}

function validateArgumentConsistency(argumentHint, usage) {
  const errors = [];
  const warnings = [];

  // argument-hint がある場合
  if (argumentHint) {
    // 位置引数の数をカウント
    const hintArgs = argumentHint.match(/\[([^\]]+)\]/g) || [];
    const expectedCount = hintArgs.length;

    if (usage.positionalArgs.length === 0 && !usage.hasArguments) {
      warnings.push(
        `argument-hint が定義されていますが、$ARGUMENTS も位置引数も使用されていません`,
      );
    }

    if (usage.positionalArgs.length > 0) {
      const maxPositional = Math.max(
        ...usage.positionalArgs.map((a) => parseInt(a.replace("$", ""))),
      );
      if (maxPositional > expectedCount) {
        warnings.push(
          `argument-hint で定義された引数数(${expectedCount})より多い位置引数($${maxPositional})が使用されています`,
        );
      }
    }
  } else {
    // argument-hint がない場合
    if (usage.positionalArgs.length > 1) {
      warnings.push(
        `複数の位置引数(${usage.positionalArgs.join(", ")})が使用されていますが、argument-hint がありません`,
      );
    }
  }

  // 引数を使用している場合の検証
  if (usage.hasArguments || usage.positionalArgs.length > 0) {
    if (!usage.hasValidation) {
      warnings.push(
        "引数の検証ロジックがありません。不正な入力に対するエラーハンドリングを検討してください",
      );
    }
  }

  return { errors, warnings };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Arguments Validator${COLORS.reset}

Usage:
  node validate-arguments.mjs <command-file.md>

検証項目:
  - $ARGUMENTS の使用
  - 位置引数（$1, $2, ...）の使用
  - argument-hint との整合性
  - 引数検証ロジックの存在
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
    `\n${COLORS.bold}Validating Arguments: ${filePath}${COLORS.reset}\n`,
  );

  // 分析
  const argumentHint = extractArgumentHint(content);
  const usage = analyzeArgumentUsage(content);

  // 結果表示
  console.log(`${COLORS.bold}Analysis:${COLORS.reset}`);
  log("info", `argument-hint: ${argumentHint || "(未定義)"}`);
  log("info", `$ARGUMENTS 使用: ${usage.hasArguments ? "Yes" : "No"}`);
  log(
    "info",
    `位置引数: ${usage.positionalArgs.length > 0 ? usage.positionalArgs.join(", ") : "(なし)"}`,
  );
  log("info", `検証ロジック: ${usage.hasValidation ? "Yes" : "No"}`);
  log("info", `デフォルト値: ${usage.hasDefaultValue ? "Yes" : "No"}`);

  // 整合性チェック
  const { errors, warnings } = validateArgumentConsistency(argumentHint, usage);

  if (errors.length > 0) {
    console.log(`\n${COLORS.red}Errors:${COLORS.reset}`);
    errors.forEach((e) => log("error", e));
  }

  if (warnings.length > 0) {
    console.log(`\n${COLORS.yellow}Warnings:${COLORS.reset}`);
    warnings.forEach((w) => log("warning", w));
  }

  // サマリー
  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    process.exit(1);
  }

  if (warnings.length === 0) {
    log("success", "引数システムは適切に設定されています");
  }
}

main();
