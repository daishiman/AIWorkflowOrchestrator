#!/usr/bin/env node
/**
 * Command Naming Convention Validator
 *
 * コマンドファイルの命名規則を検証します。
 *
 * 検証項目:
 * - kebab-case 形式
 * - 動詞ベース命名
 * - 名前空間の適切な使用
 * - 発見可能性
 *
 * Usage:
 *   node validate-naming.mjs <command-file.md>
 *   node validate-naming.mjs <directory>
 */

import fs from "fs";
import path from "path";

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

// 推奨される動詞
const RECOMMENDED_VERBS = [
  "create",
  "add",
  "make",
  "generate",
  "delete",
  "remove",
  "clear",
  "update",
  "modify",
  "edit",
  "change",
  "get",
  "fetch",
  "list",
  "show",
  "display",
  "run",
  "execute",
  "start",
  "stop",
  "test",
  "check",
  "validate",
  "verify",
  "deploy",
  "build",
  "compile",
  "fix",
  "repair",
  "resolve",
  "commit",
  "push",
  "pull",
  "merge",
  "review",
  "analyze",
  "audit",
  "init",
  "setup",
  "configure",
  "export",
  "import",
  "sync",
  "backup",
  "restore",
];

function isKebabCase(name) {
  // kebab-case: 小文字とハイフンのみ
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name);
}

function startsWithVerb(name) {
  const firstPart = name.split("-")[0];
  return RECOMMENDED_VERBS.includes(firstPart);
}

function validateCommandName(filePath) {
  const fileName = path.basename(filePath, ".md");
  const dirName = path.dirname(filePath);
  const isInNamespace = dirName !== "." && !dirName.endsWith("commands");

  const errors = [];
  const warnings = [];
  const suggestions = [];

  // 1. kebab-case チェック
  if (!isKebabCase(fileName)) {
    errors.push(`"${fileName}" は kebab-case ではありません`);

    // 修正候補を提案
    const suggestedName = fileName
      .replace(/([A-Z])/g, "-$1")
      .replace(/[_\s]+/g, "-")
      .toLowerCase()
      .replace(/^-/, "");
    suggestions.push(`推奨: ${suggestedName}`);
  }

  // 2. 動詞ベース命名チェック
  if (!startsWithVerb(fileName)) {
    warnings.push(`"${fileName}" は動詞で始まっていません`);

    // 動詞候補を提案
    const possibleVerbs = RECOMMENDED_VERBS.filter((v) =>
      fileName.toLowerCase().includes(v.substring(0, 3)),
    );
    if (possibleVerbs.length > 0) {
      suggestions.push(`動詞候補: ${possibleVerbs.slice(0, 3).join(", ")}`);
    }
  }

  // 3. 名前の長さチェック
  if (fileName.length > 30) {
    warnings.push(
      `"${fileName}" が長すぎます（${fileName.length}文字）。20文字以内を推奨`,
    );
  }

  // 4. 説明的な名前かチェック
  if (fileName.length < 3) {
    errors.push(`"${fileName}" が短すぎます。説明的な名前を使用してください`);
  }

  // 5. 数字で始まっていないかチェック
  if (/^\d/.test(fileName)) {
    errors.push(`"${fileName}" は数字で始まっています`);
  }

  return {
    fileName,
    isInNamespace,
    errors,
    warnings,
    suggestions,
  };
}

function scanDirectory(dirPath) {
  const results = [];

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith(".md")) {
        results.push({
          path: fullPath,
          validation: validateCommandName(fullPath),
        });
      }
    }
  }

  scan(dirPath);
  return results;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Naming Convention Validator${COLORS.reset}

Usage:
  node validate-naming.mjs <command-file.md>
  node validate-naming.mjs <directory>

検証項目:
  - kebab-case 形式
  - 動詞ベース命名
  - 名前の長さ
  - 説明的な命名

推奨される動詞:
  ${RECOMMENDED_VERBS.slice(0, 10).join(", ")}...
`);
    process.exit(0);
  }

  const target = args[0];

  if (!fs.existsSync(target)) {
    log("error", `ファイル/ディレクトリが見つかりません: ${target}`);
    process.exit(1);
  }

  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    // ディレクトリスキャン
    console.log(
      `\n${COLORS.bold}Scanning Directory: ${target}${COLORS.reset}\n`,
    );

    const results = scanDirectory(target);
    let totalErrors = 0;
    let totalWarnings = 0;

    for (const { path: filePath, validation } of results) {
      const { fileName, errors, warnings, suggestions } = validation;

      if (errors.length > 0 || warnings.length > 0) {
        console.log(`\n${COLORS.bold}${fileName}${COLORS.reset} (${filePath})`);

        errors.forEach((e) => log("error", e));
        warnings.forEach((w) => log("warning", w));
        suggestions.forEach((s) => log("info", s));

        totalErrors += errors.length;
        totalWarnings += warnings.length;
      }
    }

    console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
    console.log(`  Files scanned: ${results.length}`);
    console.log(`  Errors: ${totalErrors}`);
    console.log(`  Warnings: ${totalWarnings}`);

    if (totalErrors === 0 && totalWarnings === 0) {
      log("success", "すべてのファイルが命名規則に従っています");
    }

    process.exit(totalErrors > 0 ? 1 : 0);
  } else {
    // 単一ファイル検証
    console.log(`\n${COLORS.bold}Validating: ${target}${COLORS.reset}\n`);

    const { fileName, isInNamespace, errors, warnings, suggestions } =
      validateCommandName(target);

    log("info", `ファイル名: ${fileName}`);
    log("info", `名前空間内: ${isInNamespace ? "Yes" : "No"}`);

    if (errors.length > 0) {
      console.log(`\n${COLORS.red}Errors:${COLORS.reset}`);
      errors.forEach((e) => log("error", e));
    }

    if (warnings.length > 0) {
      console.log(`\n${COLORS.yellow}Warnings:${COLORS.reset}`);
      warnings.forEach((w) => log("warning", w));
    }

    if (suggestions.length > 0) {
      console.log(`\n${COLORS.blue}Suggestions:${COLORS.reset}`);
      suggestions.forEach((s) => log("info", s));
    }

    console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Warnings: ${warnings.length}`);

    if (errors.length === 0 && warnings.length === 0) {
      log("success", "命名規則に従っています");
    }

    process.exit(errors.length > 0 ? 1 : 0);
  }
}

main();
