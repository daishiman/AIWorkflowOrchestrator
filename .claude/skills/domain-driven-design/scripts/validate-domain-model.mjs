#!/usr/bin/env node
/**
 * ドメインモデル検証スクリプト
 *
 * DDDのビルディングブロックに準拠しているかを検証します。
 *
 * 使用方法:
 *   node validate-domain-model.mjs <file-or-directory>
 *
 * 例:
 *   node validate-domain-model.mjs src/shared/core/entities/
 *   node validate-domain-model.mjs src/shared/core/entities/Workflow.ts
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, basename } from "path";

// 検証ルール
const VALIDATION_RULES = {
  entity: {
    requiredPatterns: [
      { pattern: /readonly\s+\w+Id\s*:/i, description: "識別子（ID）の定義" },
      {
        pattern: /private|readonly/i,
        description: "カプセル化（private/readonly）",
      },
    ],
    warningPatterns: [
      {
        pattern: /public\s+set\s+/i,
        description: "public setterの使用（避けるべき）",
      },
      {
        pattern: /:\s*(string|number|boolean)\s*;/g,
        description: "プリミティブ型の直接使用",
      },
    ],
  },
  valueObject: {
    requiredPatterns: [
      { pattern: /readonly/i, description: "不変性（readonly）" },
    ],
    warningPatterns: [
      { pattern: /public\s+\w+\s*=/i, description: "可変プロパティの可能性" },
    ],
  },
  repository: {
    requiredPatterns: [
      {
        pattern: /interface\s+I\w*Repository/i,
        description: "Repositoryインターフェースの命名",
      },
      { pattern: /Promise</i, description: "非同期操作（Promise）" },
    ],
    warningPatterns: [
      {
        pattern: /SELECT|INSERT|UPDATE|DELETE/i,
        description: "SQL文の直接使用（インターフェースには不適切）",
      },
    ],
  },
};

// カラー出力用
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ファイルタイプの推測
function guessFileType(content, filename) {
  const lowerFilename = filename.toLowerCase();

  if (
    lowerFilename.includes("repository") ||
    (content.includes("interface I") && content.includes("Repository"))
  ) {
    return "repository";
  }
  if (
    content.includes("readonly") &&
    !content.includes("Id") &&
    content.match(/equals\s*\(/i)
  ) {
    return "valueObject";
  }
  if (
    content.includes("Id") &&
    (content.includes("class") || content.includes("interface"))
  ) {
    return "entity";
  }
  return "unknown";
}

// 単一ファイルの検証
function validateFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const filename = basename(filePath);
  const fileType = guessFileType(content, filename);

  const results = {
    file: filePath,
    type: fileType,
    passed: [],
    warnings: [],
    errors: [],
  };

  if (fileType === "unknown") {
    results.warnings.push("ファイルタイプを特定できませんでした");
    return results;
  }

  const rules = VALIDATION_RULES[fileType];

  // 必須パターンのチェック
  for (const rule of rules.requiredPatterns) {
    if (rule.pattern.test(content)) {
      results.passed.push(`✓ ${rule.description}`);
    } else {
      results.errors.push(`✗ ${rule.description}が見つかりません`);
    }
  }

  // 警告パターンのチェック
  for (const rule of rules.warningPatterns) {
    if (rule.pattern.test(content)) {
      results.warnings.push(`⚠ ${rule.description}`);
    }
  }

  // 追加チェック
  if (fileType === "entity") {
    // プリミティブ型の使用数をカウント
    const primitiveMatches = content.match(
      /:\s*(string|number|boolean)\s*[;=]/g,
    );
    if (primitiveMatches && primitiveMatches.length > 3) {
      results.warnings.push(
        `⚠ プリミティブ型が${primitiveMatches.length}箇所で使用されています。値オブジェクトの導入を検討してください`,
      );
    }
  }

  return results;
}

// ディレクトリの再帰的検証
function validateDirectory(dirPath) {
  const allResults = [];
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      allResults.push(...validateDirectory(fullPath));
    } else if (
      extname(entry) === ".ts" &&
      !entry.endsWith(".d.ts") &&
      !entry.endsWith(".test.ts")
    ) {
      allResults.push(validateFile(fullPath));
    }
  }

  return allResults;
}

// 結果の表示
function displayResults(results) {
  let totalPassed = 0;
  let totalWarnings = 0;
  let totalErrors = 0;

  for (const result of results) {
    log(`\n📄 ${result.file}`, "cyan");
    log(`   タイプ: ${result.type}`, "blue");

    for (const passed of result.passed) {
      log(`   ${passed}`, "green");
      totalPassed++;
    }

    for (const warning of result.warnings) {
      log(`   ${warning}`, "yellow");
      totalWarnings++;
    }

    for (const error of result.errors) {
      log(`   ${error}`, "red");
      totalErrors++;
    }
  }

  log("\n" + "=".repeat(50), "cyan");
  log("📊 検証サマリー", "cyan");
  log(`   ファイル数: ${results.length}`);
  log(`   ✓ 合格: ${totalPassed}`, "green");
  log(`   ⚠ 警告: ${totalWarnings}`, "yellow");
  log(`   ✗ エラー: ${totalErrors}`, "red");

  return totalErrors === 0;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    log(
      "使用方法: node validate-domain-model.mjs <file-or-directory>",
      "yellow",
    );
    log(
      "例: node validate-domain-model.mjs src/shared/core/entities/",
      "yellow",
    );
    process.exit(1);
  }

  const targetPath = args[0];

  if (!existsSync(targetPath)) {
    log(`エラー: パスが存在しません: ${targetPath}`, "red");
    process.exit(1);
  }

  log("🔍 ドメインモデル検証を開始します...", "cyan");

  const stat = statSync(targetPath);
  let results;

  if (stat.isDirectory()) {
    results = validateDirectory(targetPath);
  } else {
    results = [validateFile(targetPath)];
  }

  const success = displayResults(results);
  process.exit(success ? 0 : 1);
}

main();
