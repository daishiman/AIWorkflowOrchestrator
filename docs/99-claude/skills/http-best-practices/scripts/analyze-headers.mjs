#!/usr/bin/env node

/**
 * HTTP Headers Analyzer
 *
 * HTTPヘッダー（特にセキュリティヘッダー）の実装を検証するスクリプト
 *
 * Usage:
 *   node analyze-headers.mjs <file.ts>
 *   node analyze-headers.mjs --dir <directory>
 *   node analyze-headers.mjs --url <url>
 *   node analyze-headers.mjs --help
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// セキュリティヘッダーチェック項目定義
const SECURITY_HEADERS = [
  {
    id: "cors-origin",
    name: "CORS Access-Control-Allow-Origin",
    severity: "error",
    pattern: /Access-Control-Allow-Origin|CORS.*origin/i,
    message: "CORS設定が実装されていることを確認してください",
    recommendation:
      "Access-Control-Allow-Originヘッダーを適切に設定し、信頼できるオリジンのみを許可する",
    owasp: "OWASP A05:2021 - Security Misconfiguration",
  },
  {
    id: "csp",
    name: "Content-Security-Policy",
    severity: "error",
    pattern: /Content-Security-Policy|CSP/i,
    message: "Content-Security-Policyが設定されていることを確認してください",
    recommendation:
      "CSPヘッダーを設定してXSS攻撃を防止する。script-src、style-src、img-srcなどのディレクティブを適切に設定",
    owasp: "OWASP A03:2021 - Injection",
  },
  {
    id: "x-frame-options",
    name: "X-Frame-Options",
    severity: "warning",
    pattern: /X-Frame-Options|frameOptions/i,
    message: "X-Frame-Optionsヘッダーの設定を検討してください",
    recommendation:
      "X-Frame-Options: DENY または SAMEORIGIN を設定してクリックジャッキング攻撃を防止",
    owasp: "OWASP A01:2021 - Broken Access Control",
  },
  {
    id: "x-content-type-options",
    name: "X-Content-Type-Options",
    severity: "warning",
    pattern: /X-Content-Type-Options|contentTypeOptions/i,
    message: "X-Content-Type-Optionsヘッダーの設定を検討してください",
    recommendation:
      "X-Content-Type-Options: nosniff を設定してMIMEタイプスニッフィングを防止",
    owasp: "OWASP A05:2021 - Security Misconfiguration",
  },
  {
    id: "hsts",
    name: "Strict-Transport-Security (HSTS)",
    severity: "error",
    pattern: /Strict-Transport-Security|HSTS/i,
    message: "HSTSヘッダーが設定されていることを確認してください",
    recommendation:
      "Strict-Transport-Security: max-age=31536000; includeSubDomains を設定してHTTPS接続を強制",
    owasp: "OWASP A02:2021 - Cryptographic Failures",
  },
  {
    id: "referrer-policy",
    name: "Referrer-Policy",
    severity: "info",
    pattern: /Referrer-Policy|referrerPolicy/i,
    message: "Referrer-Policyヘッダーの設定を検討してください",
    recommendation:
      "Referrer-Policy: strict-origin-when-cross-origin を設定して情報漏洩を防止",
    owasp: "OWASP A01:2021 - Broken Access Control",
  },
  {
    id: "permissions-policy",
    name: "Permissions-Policy",
    severity: "info",
    pattern: /Permissions-Policy|Feature-Policy/i,
    message: "Permissions-Policyヘッダーの設定を検討してください",
    recommendation:
      "Permissions-Policyを設定してブラウザ機能の使用を制限（例: geolocation=(), microphone=()）",
    owasp: "OWASP A05:2021 - Security Misconfiguration",
  },
  {
    id: "cors-credentials",
    name: "CORS Access-Control-Allow-Credentials",
    severity: "warning",
    pattern: /Access-Control-Allow-Credentials/i,
    message: "CORS認証情報の設定を確認してください",
    recommendation:
      "Access-Control-Allow-Credentials: trueを使用する場合は、Access-Control-Allow-Originにワイルドカード(*)を使用しない",
    owasp: "OWASP A01:2021 - Broken Access Control",
  },
  {
    id: "cors-methods",
    name: "CORS Access-Control-Allow-Methods",
    severity: "info",
    pattern: /Access-Control-Allow-Methods/i,
    message: "CORS許可メソッドが設定されていることを確認してください",
    recommendation:
      "必要最小限のHTTPメソッドのみを許可する（例: GET, POST, PUT, DELETE）",
    owasp: "OWASP A01:2021 - Broken Access Control",
  },
  {
    id: "cache-control",
    name: "Cache-Control",
    severity: "info",
    pattern: /Cache-Control|cacheControl/i,
    message: "Cache-Controlヘッダーの設定を確認してください",
    recommendation:
      "機密情報を含むレスポンスにはCache-Control: no-store, private を設定",
    owasp: "OWASP A04:2021 - Insecure Design",
  },
];

// アンチパターンチェック項目
const ANTI_PATTERNS = [
  {
    id: "cors-wildcard-with-credentials",
    name: "CORS ワイルドカード＋認証情報",
    severity: "error",
    pattern:
      /Access-Control-Allow-Origin.*\*.*Access-Control-Allow-Credentials.*true|Access-Control-Allow-Credentials.*true.*Access-Control-Allow-Origin.*\*/is,
    message:
      "危険: Access-Control-Allow-Origin: * とAccess-Control-Allow-Credentials: true の組み合わせが検出されました",
    recommendation:
      "認証情報を使用する場合は、Access-Control-Allow-Originに具体的なオリジンを指定する",
    owasp: "OWASP A01:2021 - Broken Access Control",
  },
  {
    id: "unsafe-inline-csp",
    name: "CSP unsafe-inline",
    severity: "warning",
    pattern: /'unsafe-inline'/,
    message: "警告: Content-Security-Policyで'unsafe-inline'が使用されています",
    recommendation:
      "可能な限り'unsafe-inline'を避け、nonceまたはhashベースのCSPを使用する",
    owasp: "OWASP A03:2021 - Injection",
  },
  {
    id: "unsafe-eval-csp",
    name: "CSP unsafe-eval",
    severity: "error",
    pattern: /'unsafe-eval'/,
    message: "危険: Content-Security-Policyで'unsafe-eval'が使用されています",
    recommendation: "'unsafe-eval'を削除し、evalやFunction()の使用を避ける",
    owasp: "OWASP A03:2021 - Injection",
  },
  {
    id: "missing-cache-control-sensitive",
    name: "機密情報のキャッシュ設定なし",
    severity: "warning",
    pattern: /password|token|secret|credential/i,
    antiPattern: /Cache-Control.*no-store|Cache-Control.*private/i,
    message:
      "機密情報を扱うエンドポイントにCache-Control: no-storeまたはprivateが設定されていない可能性があります",
    recommendation:
      "機密情報を含むレスポンスにはCache-Control: no-store, privateを設定する",
    owasp: "OWASP A04:2021 - Insecure Design",
  },
];

// ヘルプメッセージ
function showHelp() {
  console.log(`
HTTP Headers Analyzer - セキュリティヘッダーの検証ツール

使用方法:
  node analyze-headers.mjs <file.ts>           単一ファイルを検証
  node analyze-headers.mjs --dir <directory>   ディレクトリ内のすべてのファイルを検証
  node analyze-headers.mjs --help              このヘルプを表示

オプション:
  --dir <directory>    ディレクトリを再帰的に検証
  -v, --verbose        詳細な出力
  --json               JSON形式で結果を出力
  --help               このヘルプを表示

終了コード:
  0  成功（エラーなし）
  1  一般的なエラー
  2  引数エラー
  3  ファイル不在
  4  検証失敗（重大な問題が検出された）

例:
  node analyze-headers.mjs src/api/client.ts
  node analyze-headers.mjs --dir src/api
  node analyze-headers.mjs --dir src --json > report.json
`);
}

// ファイル読み込み
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`エラー: ファイルを読み込めません: ${filePath}`);
    console.error(error.message);
    process.exit(3);
  }
}

// ディレクトリ内のファイルを再帰的に取得
function getFilesRecursively(dir, extensions = [".ts", ".tsx", ".js", ".jsx"]) {
  const files = [];

  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // node_modules等を除外
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          traverse(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

// ヘッダーチェック実行
function analyzeHeaders(content, filePath) {
  const results = {
    file: filePath,
    errors: [],
    warnings: [],
    info: [],
    antiPatterns: [],
    passed: [],
  };

  // セキュリティヘッダーチェック
  for (const check of SECURITY_HEADERS) {
    const found = check.pattern.test(content);

    if (found) {
      results.passed.push({
        id: check.id,
        name: check.name,
        severity: check.severity,
      });
    } else {
      const result = {
        id: check.id,
        name: check.name,
        message: check.message,
        recommendation: check.recommendation,
        owasp: check.owasp,
      };

      if (check.severity === "error") {
        results.errors.push(result);
      } else if (check.severity === "warning") {
        results.warnings.push(result);
      } else {
        results.info.push(result);
      }
    }
  }

  // アンチパターンチェック
  for (const antiPattern of ANTI_PATTERNS) {
    const found = antiPattern.pattern.test(content);

    if (found) {
      // antiPatternフィールドがある場合は、それもチェック
      if (antiPattern.antiPattern) {
        const hasProtection = antiPattern.antiPattern.test(content);
        if (hasProtection) {
          continue; // 保護が実装されている場合はスキップ
        }
      }

      const result = {
        id: antiPattern.id,
        name: antiPattern.name,
        message: antiPattern.message,
        recommendation: antiPattern.recommendation,
        owasp: antiPattern.owasp,
      };

      results.antiPatterns.push(result);

      if (antiPattern.severity === "error") {
        results.errors.push(result);
      } else if (antiPattern.severity === "warning") {
        results.warnings.push(result);
      }
    }
  }

  return results;
}

// 結果出力（テキスト形式）
function printResults(results, verbose = false) {
  console.log(`\n━━━━ ${results.file} ━━━━\n`);

  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log("✅ すべてのセキュリティヘッダーチェックに合格しました\n");
  }

  if (results.antiPatterns.length > 0) {
    console.log("⚠️  アンチパターン検出:");
    for (const issue of results.antiPatterns) {
      console.log(`  ❌ ${issue.name}`);
      console.log(`     ${issue.message}`);
      console.log(`     推奨: ${issue.recommendation}`);
      if (verbose && issue.owasp) {
        console.log(`     OWASP: ${issue.owasp}`);
      }
      console.log();
    }
  }

  if (results.errors.length > 0) {
    console.log("🔴 エラー（必須）:");
    for (const error of results.errors) {
      if (results.antiPatterns.some((ap) => ap.id === error.id)) {
        continue; // アンチパターンで既に表示済み
      }
      console.log(`  ❌ ${error.name}`);
      console.log(`     ${error.message}`);
      console.log(`     推奨: ${error.recommendation}`);
      if (verbose && error.owasp) {
        console.log(`     OWASP: ${error.owasp}`);
      }
      console.log();
    }
  }

  if (results.warnings.length > 0) {
    console.log("🟡 警告（推奨）:");
    for (const warning of results.warnings) {
      if (results.antiPatterns.some((ap) => ap.id === warning.id)) {
        continue; // アンチパターンで既に表示済み
      }
      console.log(`  ⚠️  ${warning.name}`);
      console.log(`     ${warning.message}`);
      console.log(`     推奨: ${warning.recommendation}`);
      if (verbose && warning.owasp) {
        console.log(`     OWASP: ${warning.owasp}`);
      }
      console.log();
    }
  }

  if (verbose && results.info.length > 0) {
    console.log("ℹ️  情報（オプション）:");
    for (const info of results.info) {
      console.log(`  ℹ️  ${info.name}`);
      console.log(`     ${info.message}`);
      console.log(`     推奨: ${info.recommendation}`);
      if (info.owasp) {
        console.log(`     OWASP: ${info.owasp}`);
      }
      console.log();
    }
  }

  if (verbose && results.passed.length > 0) {
    console.log("✅ 検出されたセキュリティヘッダー:");
    for (const passed of results.passed) {
      console.log(`  ✅ ${passed.name}`);
    }
    console.log();
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// 結果サマリー
function printSummary(allResults) {
  const totalFiles = allResults.length;
  const filesWithErrors = allResults.filter((r) => r.errors.length > 0).length;
  const filesWithWarnings = allResults.filter(
    (r) => r.warnings.length > 0,
  ).length;
  const totalErrors = allResults.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = allResults.reduce(
    (sum, r) => sum + r.warnings.length,
    0,
  );
  const totalAntiPatterns = allResults.reduce(
    (sum, r) => sum + r.antiPatterns.length,
    0,
  );

  console.log("\n📊 検証サマリー");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`検証ファイル数: ${totalFiles}`);
  console.log(`エラーを含むファイル: ${filesWithErrors}`);
  console.log(`警告を含むファイル: ${filesWithWarnings}`);
  console.log(`総エラー数: ${totalErrors}`);
  console.log(`総警告数: ${totalWarnings}`);
  console.log(`アンチパターン検出数: ${totalAntiPatterns}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (filesWithErrors === 0 && totalAntiPatterns === 0) {
    console.log("✅ すべてのファイルが検証に合格しました！");
    return 0;
  } else if (totalErrors > 0 || totalAntiPatterns > 0) {
    console.log("❌ 重大な問題が検出されました。修正が必要です。");
    return 4;
  } else {
    console.log("⚠️  警告がありますが、重大な問題はありません。");
    return 0;
  }
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  const verbose = args.includes("--verbose") || args.includes("-v");
  const jsonOutput = args.includes("--json");
  const dirMode = args.includes("--dir");

  let targetPath;
  if (dirMode) {
    const dirIndex = args.indexOf("--dir");
    targetPath = args[dirIndex + 1];
    if (!targetPath) {
      console.error("エラー: --dir オプションにはディレクトリパスが必要です");
      process.exit(2);
    }
  } else {
    targetPath = args.find((arg) => !arg.startsWith("-"));
    if (!targetPath) {
      console.error("エラー: ファイルパスが指定されていません");
      showHelp();
      process.exit(2);
    }
  }

  // ファイルまたはディレクトリの存在確認
  if (!fs.existsSync(targetPath)) {
    console.error(`エラー: パスが存在しません: ${targetPath}`);
    process.exit(3);
  }

  let files = [];
  if (dirMode || fs.statSync(targetPath).isDirectory()) {
    files = getFilesRecursively(targetPath);
    if (files.length === 0) {
      console.log("検証対象のファイルが見つかりませんでした");
      process.exit(0);
    }
  } else {
    files = [targetPath];
  }

  const allResults = [];

  for (const file of files) {
    const content = readFile(file);
    const results = analyzeHeaders(content, file);
    allResults.push(results);

    if (!jsonOutput) {
      printResults(results, verbose);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(allResults, null, 2));
    process.exit(0);
  } else {
    const exitCode = printSummary(allResults);
    process.exit(exitCode);
  }
}

main();
