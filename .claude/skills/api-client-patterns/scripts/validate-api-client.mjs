#!/usr/bin/env node

/**
 * API Client Structure Validator
 *
 * APIクライアントコードが推奨パターンに従っているかを検証するスクリプト
 *
 * Usage:
 *   node validate-api-client.mjs <file-path>
 *   node validate-api-client.mjs src/infrastructure/discord/client.ts
 */

import fs from "fs";
import path from "path";

// 検証ルール
const VALIDATION_RULES = {
  // 外部型の内部への漏洩チェック
  externalTypeLeakage: {
    name: "外部型の漏洩チェック",
    patterns: [
      // 関数の戻り値に外部型名が含まれる可能性
      /:\s*Promise<External\w+>/g,
      /:\s*Promise<\w+Response>/g,
      /:\s*Promise<\w+ApiResult>/g,
    ],
    severity: "error",
    message: "外部型が関数の戻り値として公開されています。内部型に変換してください。",
  },

  // 型キャストの使用チェック
  unsafeTypeCast: {
    name: "安全でない型キャスト",
    patterns: [/as\s+\w+Response/g, /as\s+External\w+/g, /<\w+Response>/g],
    severity: "warning",
    message:
      "型キャスト（as）が使用されています。Zodなどで実行時検証を行うことを推奨します。",
  },

  // エラーハンドリングチェック
  errorHandling: {
    name: "エラーハンドリング",
    patterns: [/catch\s*\(\s*\w*\s*\)\s*\{/g],
    inverse: true, // このパターンが存在しない場合にエラー
    severity: "warning",
    message:
      "try-catchブロックが見つかりません。外部API呼び出しにはエラーハンドリングを推奨します。",
  },

  // Zodスキーマの使用推奨
  zodValidation: {
    name: "Zod検証",
    patterns: [/z\.object\s*\(/g, /\.parse\s*\(/g, /\.safeParse\s*\(/g],
    inverse: true,
    severity: "info",
    message:
      "Zodによる実行時検証が見つかりません。外部データの検証を推奨します。",
  },

  // 変換関数の存在チェック
  transformerFunction: {
    name: "変換関数",
    patterns: [
      /transform\w*\s*\(/g,
      /toInternal\s*\(/g,
      /toExternal\s*\(/g,
      /translate\w*\s*\(/g,
    ],
    inverse: true,
    severity: "info",
    message:
      "変換関数が見つかりません。データ変換を明示的な関数として分離することを推奨します。",
  },

  // ハードコードされたURL
  hardcodedUrls: {
    name: "ハードコードURL",
    patterns: [
      /['"`]https?:\/\/[^'"`]+['"`]/g,
      /['"`]\/api\/[^'"`]+['"`]/g,
    ],
    severity: "info",
    message:
      "ハードコードされたURLが見つかりました。環境変数または設定ファイルの使用を検討してください。",
  },
};

// 検証結果の型
class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.infos = [];
  }

  addIssue(severity, rule, line, match) {
    const issue = {
      rule: rule.name,
      message: rule.message,
      line,
      match,
    };

    switch (severity) {
      case "error":
        this.errors.push(issue);
        break;
      case "warning":
        this.warnings.push(issue);
        break;
      case "info":
        this.infos.push(issue);
        break;
    }
  }

  get isValid() {
    return this.errors.length === 0;
  }

  get summary() {
    return {
      errors: this.errors.length,
      warnings: this.warnings.length,
      infos: this.infos.length,
    };
  }
}

// ファイルの検証
function validateFile(filePath) {
  const result = new ValidationResult();

  if (!fs.existsSync(filePath)) {
    result.addIssue("error", { name: "ファイル", message: "ファイルが存在しません" }, 0, filePath);
    return result;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  for (const [ruleName, rule] of Object.entries(VALIDATION_RULES)) {
    let hasMatch = false;

    for (const pattern of rule.patterns) {
      // 各行をチェック
      lines.forEach((line, index) => {
        const matches = line.match(pattern);
        if (matches) {
          hasMatch = true;
          if (!rule.inverse) {
            result.addIssue(rule.severity, rule, index + 1, matches[0]);
          }
        }
      });
    }

    // inverse ルール: パターンが存在しない場合に報告
    if (rule.inverse && !hasMatch) {
      result.addIssue(rule.severity, rule, 0, null);
    }
  }

  return result;
}

// レポート出力
function printReport(filePath, result) {
  console.log("\n" + "=".repeat(60));
  console.log(`API Client Validation Report`);
  console.log(`File: ${filePath}`);
  console.log("=".repeat(60));

  const { errors, warnings, infos } = result.summary;

  // サマリー
  console.log(`\nSummary: ${errors} errors, ${warnings} warnings, ${infos} info`);

  // エラー出力
  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    result.errors.forEach((issue) => {
      console.log(`  Line ${issue.line}: ${issue.rule}`);
      console.log(`    ${issue.message}`);
      if (issue.match) console.log(`    Found: ${issue.match}`);
    });
  }

  // 警告出力
  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((issue) => {
      console.log(`  Line ${issue.line}: ${issue.rule}`);
      console.log(`    ${issue.message}`);
      if (issue.match) console.log(`    Found: ${issue.match}`);
    });
  }

  // 情報出力
  if (result.infos.length > 0) {
    console.log("\nℹ️  Info:");
    result.infos.forEach((issue) => {
      console.log(`  ${issue.rule}`);
      console.log(`    ${issue.message}`);
    });
  }

  // 結果
  console.log("\n" + "-".repeat(60));
  if (result.isValid) {
    console.log("✅ Validation passed (no errors)");
  } else {
    console.log("❌ Validation failed");
  }
  console.log("-".repeat(60) + "\n");

  return result.isValid;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: node validate-api-client.mjs <file-path>");
    console.log("Example: node validate-api-client.mjs src/infrastructure/discord/client.ts");
    process.exit(1);
  }

  const filePath = args[0];
  const result = validateFile(filePath);
  const isValid = printReport(filePath, result);

  process.exit(isValid ? 0 : 1);
}

main();
