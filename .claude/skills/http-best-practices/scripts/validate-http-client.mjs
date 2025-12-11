#!/usr/bin/env node

/**
 * HTTP Client Validator
 *
 * HTTPクライアント実装のベストプラクティス準拠を検証するスクリプト
 *
 * Usage:
 *   node validate-http-client.mjs <file.ts>
 *   node validate-http-client.mjs --dir <directory>
 */

import fs from "fs";
import path from "path";

// チェック項目定義
const CHECKS = [
  {
    id: "timeout-config",
    name: "タイムアウト設定",
    severity: "error",
    pattern: /timeout|AbortSignal\.timeout|setTimeout/i,
    message: "タイムアウトが設定されていることを確認してください",
    recommendation: "すべてのHTTPリクエストにタイムアウトを設定する",
  },
  {
    id: "error-handling",
    name: "エラーハンドリング",
    severity: "error",
    pattern: /catch\s*\(|\.catch\s*\(|try\s*{/,
    message: "エラーハンドリングが実装されていることを確認してください",
    recommendation: "すべての非同期操作でエラーをキャッチする",
  },
  {
    id: "content-type",
    name: "Content-Type設定",
    severity: "warning",
    pattern: /Content-Type|content-type|contentType/i,
    message: "Content-Typeヘッダーが設定されていることを確認してください",
    recommendation: "リクエストボディを送信する場合はContent-Typeを設定する",
  },
  {
    id: "status-check",
    name: "ステータスコードチェック",
    severity: "error",
    pattern: /response\.ok|response\.status|statusCode/i,
    message:
      "レスポンスステータスコードがチェックされていることを確認してください",
    recommendation: "response.okまたはstatusを確認してエラーハンドリングする",
  },
  {
    id: "keepalive",
    name: "Keep-Alive設定",
    severity: "info",
    pattern: /keepAlive|keep-alive|Agent/i,
    message: "Keep-Aliveの使用を検討してください",
    recommendation: "複数リクエストを行う場合はKeep-Aliveを有効にする",
  },
  {
    id: "request-id",
    name: "リクエストID",
    severity: "info",
    pattern: /x-request-id|requestId|request-id|X-Request-ID/i,
    message: "リクエストIDの使用を検討してください",
    recommendation: "デバッグ・トレーシングのためリクエストIDを設定する",
  },
  {
    id: "retry-logic",
    name: "リトライロジック",
    severity: "info",
    pattern: /retry|maxRetries|attempts|retryable/i,
    message: "リトライロジックの実装を検討してください",
    recommendation: "一時的なエラーに対するリトライ機構を実装する",
  },
  {
    id: "hardcoded-url",
    name: "ハードコードされたURL",
    severity: "warning",
    pattern: /https?:\/\/[a-z0-9]+\.[a-z]{2,}/i,
    antiPattern: true,
    message: "ハードコードされたURLが検出されました",
    recommendation: "環境変数または設定ファイルからURLを取得する",
  },
  {
    id: "credentials-in-code",
    name: "認証情報のハードコード",
    severity: "error",
    pattern: /['"`](sk-|api[_-]?key|password|secret)[a-zA-Z0-9_-]{10,}['"`]/i,
    antiPattern: true,
    message: "認証情報がコードにハードコードされている可能性があります",
    recommendation:
      "認証情報は環境変数またはシークレット管理サービスを使用する",
  },
  {
    id: "json-parse-safety",
    name: "JSON.parse安全性",
    severity: "warning",
    pattern: /JSON\.parse\s*\(/,
    followUp: /try\s*{[^}]*JSON\.parse|\.catch/,
    message: "JSON.parseにエラーハンドリングがあることを確認してください",
    recommendation: "JSON.parseは必ずtry-catchで囲む",
  },
];

// 結果クラス
class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.passed = [];
  }

  addIssue(check, found, line = null) {
    const issue = {
      id: check.id,
      name: check.name,
      message: check.message,
      recommendation: check.recommendation,
      line,
    };

    if (check.antiPattern) {
      // アンチパターンは見つかった場合に問題
      if (found) {
        this.categorize(check.severity, issue);
      } else {
        this.passed.push({ id: check.id, name: check.name });
      }
    } else {
      // 通常パターンは見つからない場合に問題
      if (!found) {
        this.categorize(check.severity, issue);
      } else {
        this.passed.push({ id: check.id, name: check.name });
      }
    }
  }

  categorize(severity, issue) {
    switch (severity) {
      case "error":
        this.errors.push(issue);
        break;
      case "warning":
        this.warnings.push(issue);
        break;
      case "info":
        this.info.push(issue);
        break;
    }
  }

  get isValid() {
    return this.errors.length === 0;
  }

  get score() {
    const total =
      this.errors.length +
      this.warnings.length +
      this.info.length +
      this.passed.length;
    if (total === 0) return 100;
    return Math.round((this.passed.length / total) * 100);
  }
}

// ファイル検証
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const result = new ValidationResult();

  for (const check of CHECKS) {
    const matches = content.match(check.pattern);
    const found = matches !== null;

    // フォローアップチェック（JSON.parseなど）
    if (check.followUp && found) {
      const followUpFound = check.followUp.test(content);
      result.addIssue(check, followUpFound);
    } else {
      result.addIssue(check, found);
    }
  }

  return result;
}

// ディレクトリ検証
function validateDirectory(dirPath) {
  const results = new Map();

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith(".") && file !== "node_modules") {
          walkDir(filePath);
        }
      } else if (/\.(ts|js|tsx|jsx)$/.test(file)) {
        results.set(filePath, validateFile(filePath));
      }
    }
  }

  walkDir(dirPath);
  return results;
}

// レポート出力
function printReport(filePath, result) {
  console.log("\n" + "=".repeat(60));
  console.log(`File: ${filePath}`);
  console.log(`Score: ${result.score}%`);
  console.log("=".repeat(60));

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    for (const issue of result.errors) {
      console.log(`  [${issue.id}] ${issue.message}`);
      console.log(`    → ${issue.recommendation}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    for (const issue of result.warnings) {
      console.log(`  [${issue.id}] ${issue.message}`);
      console.log(`    → ${issue.recommendation}`);
    }
  }

  if (result.info.length > 0) {
    console.log("\nℹ️  Suggestions:");
    for (const issue of result.info) {
      console.log(`  [${issue.id}] ${issue.message}`);
      console.log(`    → ${issue.recommendation}`);
    }
  }

  if (result.passed.length > 0) {
    console.log("\n✅ Passed:");
    for (const item of result.passed) {
      console.log(`  [${item.id}] ${item.name}`);
    }
  }

  console.log("\n" + "-".repeat(60));
  console.log(`Result: ${result.isValid ? "✅ PASSED" : "❌ FAILED"}`);
  console.log("-".repeat(60));
}

// サマリー出力
function printSummary(results) {
  console.log("\n" + "=".repeat(60));
  console.log("Validation Summary");
  console.log("=".repeat(60));

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfo = 0;
  let totalPassed = 0;

  for (const [filePath, result] of results) {
    const status = result.isValid ? "✅" : "❌";
    console.log(`${status} ${filePath} (Score: ${result.score}%)`);

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    totalInfo += result.info.length;
    totalPassed += result.passed.length;
  }

  console.log("\n" + "-".repeat(60));
  console.log(`Files: ${results.size}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);
  console.log(`Info: ${totalInfo}`);
  console.log(`Passed: ${totalPassed}`);
  console.log("-".repeat(60));

  const overallValid = totalErrors === 0;
  console.log(`\nOverall: ${overallValid ? "✅ PASSED" : "❌ FAILED"}`);

  return overallValid;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node validate-http-client.mjs <file.ts>");
    console.log("  node validate-http-client.mjs --dir <directory>");
    process.exit(1);
  }

  if (args[0] === "--dir") {
    const dirPath = args[1];
    if (!dirPath || !fs.existsSync(dirPath)) {
      console.error("Error: Directory not found");
      process.exit(1);
    }

    const results = validateDirectory(dirPath);

    for (const [filePath, result] of results) {
      printReport(filePath, result);
    }

    const isValid = printSummary(results);
    process.exit(isValid ? 0 : 1);
  } else {
    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
      console.error("Error: File not found");
      process.exit(1);
    }

    const result = validateFile(filePath);
    printReport(filePath, result);
    process.exit(result.isValid ? 0 : 1);
  }
}

main();
