#!/usr/bin/env node

/**
 * Linting/Formatting設定検証スクリプト
 *
 * プロジェクトのlinting/formatting設定が正しく構成されているか検証する。
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_VALIDATION_FAILED = 4;

function showHelp() {
  console.log(`
Usage: node validate-config.mjs [project-path]

Arguments:
  project-path    検証対象のプロジェクトパス（省略時: カレントディレクトリ）

Options:
  -h, --help      このヘルプを表示

Examples:
  node validate-config.mjs
  node validate-config.mjs /path/to/project
  `);
}

function checkFile(projectPath, filename, description) {
  const filePath = join(projectPath, filename);
  const exists = existsSync(filePath);
  const status = exists ? "✓" : "✗";
  console.log(`  ${status} ${description}: ${filename}`);
  return exists;
}

function validateESLint(projectPath) {
  console.log("\n[ESLint]");

  // Flat config (v9+)
  const flatConfig = checkFile(
    projectPath,
    "eslint.config.js",
    "Flat Config (v9+)",
  );
  const flatConfigMjs = checkFile(
    projectPath,
    "eslint.config.mjs",
    "Flat Config (mjs)",
  );

  // Legacy config
  const legacyJson = checkFile(
    projectPath,
    ".eslintrc.json",
    "Legacy Config (json)",
  );
  const legacyJs = checkFile(projectPath, ".eslintrc.js", "Legacy Config (js)");

  const hasESLint = flatConfig || flatConfigMjs || legacyJson || legacyJs;

  if (!hasESLint) {
    console.log("  ⚠ ESLint設定が見つかりません");
  }

  return hasESLint;
}

function validatePrettier(projectPath) {
  console.log("\n[Prettier]");

  const prettierrc = checkFile(projectPath, ".prettierrc", "設定ファイル");
  const prettierrcJson = checkFile(
    projectPath,
    ".prettierrc.json",
    "設定ファイル (json)",
  );
  const prettierrcJs = checkFile(
    projectPath,
    "prettier.config.js",
    "設定ファイル (js)",
  );
  const prettierIgnore = checkFile(
    projectPath,
    ".prettierignore",
    "無視パターン",
  );

  const hasPrettier = prettierrc || prettierrcJson || prettierrcJs;

  if (!hasPrettier) {
    console.log("  ⚠ Prettier設定が見つかりません");
  }

  return hasPrettier;
}

function validateBiome(projectPath) {
  console.log("\n[Biome]");

  const biomeJson = checkFile(projectPath, "biome.json", "設定ファイル");

  if (!biomeJson) {
    console.log("  ⚠ Biome設定が見つかりません");
  }

  return biomeJson;
}

function validatePreCommit(projectPath) {
  console.log("\n[Pre-commit Hooks]");

  const husky = checkFile(projectPath, ".husky/pre-commit", "Husky pre-commit");
  const lintStaged = checkFile(
    projectPath,
    "lint-staged.config.js",
    "lint-staged設定",
  );

  // package.json内のlint-staged設定をチェック
  const packageJsonPath = join(projectPath, "package.json");
  let hasLintStagedInPackage = false;
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      hasLintStagedInPackage = !!packageJson["lint-staged"];
      if (hasLintStagedInPackage) {
        console.log("  ✓ lint-staged設定 (package.json内)");
      }
    } catch {
      // ignore
    }
  }

  const hasPreCommit = husky && (lintStaged || hasLintStagedInPackage);

  if (!hasPreCommit) {
    console.log("  ⚠ Pre-commit設定が不完全です");
  }

  return hasPreCommit;
}

function validatePackageScripts(projectPath) {
  console.log("\n[package.json Scripts]");

  const packageJsonPath = join(projectPath, "package.json");

  if (!existsSync(packageJsonPath)) {
    console.log("  ✗ package.jsonが見つかりません");
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const scripts = packageJson.scripts || {};

    const hasLint = !!scripts.lint;
    const hasFormat = !!scripts.format || !!scripts["format:check"];

    console.log(`  ${hasLint ? "✓" : "✗"} lint スクリプト`);
    console.log(`  ${hasFormat ? "✓" : "✗"} format スクリプト`);

    return hasLint;
  } catch (err) {
    console.log(`  ✗ package.jsonの解析エラー: ${err.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const projectPath = args[0] || process.cwd();

  if (!existsSync(projectPath)) {
    console.error(`Error: パス '${projectPath}' が存在しません`);
    process.exit(EXIT_ARGS_ERROR);
  }

  console.log(`\n=== Linting/Formatting設定検証 ===`);
  console.log(`プロジェクト: ${projectPath}`);

  const results = {
    eslint: validateESLint(projectPath),
    prettier: validatePrettier(projectPath),
    biome: validateBiome(projectPath),
    preCommit: validatePreCommit(projectPath),
    scripts: validatePackageScripts(projectPath),
  };

  console.log("\n=== 検証結果サマリー ===");

  const hasLinter = results.eslint || results.biome;
  const hasFormatter = results.prettier || results.biome;

  console.log(`Linter: ${hasLinter ? "✓ 設定済み" : "✗ 未設定"}`);
  console.log(`Formatter: ${hasFormatter ? "✓ 設定済み" : "✗ 未設定"}`);
  console.log(`Pre-commit: ${results.preCommit ? "✓ 設定済み" : "✗ 未設定"}`);
  console.log(`Scripts: ${results.scripts ? "✓ 設定済み" : "✗ 未設定"}`);

  const allPassed = hasLinter && hasFormatter && results.scripts;

  if (allPassed) {
    console.log("\n✓ 基本的なlinting/formatting設定が完了しています");
    process.exit(EXIT_SUCCESS);
  } else {
    console.log("\n⚠ 一部の設定が不足しています");
    process.exit(EXIT_VALIDATION_FAILED);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
