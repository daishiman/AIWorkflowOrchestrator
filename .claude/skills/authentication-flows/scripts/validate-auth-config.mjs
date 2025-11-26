#!/usr/bin/env node

/**
 * Authentication Configuration Validator
 *
 * 認証設定のセキュリティベストプラクティス準拠を検証するスクリプト
 *
 * Usage:
 *   node validate-auth-config.mjs <config.json>
 *   node validate-auth-config.mjs --scan <directory>
 */

import fs from "fs";
import path from "path";

// セキュリティチェック定義
const SECURITY_CHECKS = {
  oauth: [
    {
      id: "oauth-pkce",
      name: "PKCE使用",
      check: (config) => config.pkce === true || config.code_challenge_method === "S256",
      severity: "warning",
      message: "パブリッククライアントではPKCEの使用を推奨します",
    },
    {
      id: "oauth-state",
      name: "State パラメータ",
      check: (config) => config.useState !== false,
      severity: "error",
      message: "CSRF対策のためstateパラメータを使用してください",
    },
    {
      id: "oauth-https",
      name: "HTTPS使用",
      check: (config) => {
        const urls = [config.authorizationEndpoint, config.tokenEndpoint, config.redirectUri];
        return urls.filter(Boolean).every((url) => url.startsWith("https://"));
      },
      severity: "error",
      message: "すべてのOAuth URLはHTTPSである必要があります",
    },
  ],

  jwt: [
    {
      id: "jwt-algorithm",
      name: "安全なアルゴリズム",
      check: (config) => {
        const safeAlgorithms = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "HS256", "HS384", "HS512"];
        return safeAlgorithms.includes(config.algorithm);
      },
      severity: "error",
      message: "安全な署名アルゴリズムを使用してください（none は禁止）",
    },
    {
      id: "jwt-expiry",
      name: "有効期限設定",
      check: (config) => {
        if (!config.expiresIn) return false;
        const expiry = parseExpiry(config.expiresIn);
        return expiry > 0 && expiry <= 24 * 60 * 60 * 1000; // 最大24時間
      },
      severity: "warning",
      message: "JWTの有効期限は24時間以内を推奨します",
    },
    {
      id: "jwt-issuer",
      name: "発行者設定",
      check: (config) => Boolean(config.issuer),
      severity: "warning",
      message: "JWT発行者(iss)を設定してください",
    },
    {
      id: "jwt-audience",
      name: "対象者設定",
      check: (config) => Boolean(config.audience),
      severity: "warning",
      message: "JWT対象者(aud)を設定してください",
    },
  ],

  apiKey: [
    {
      id: "apikey-hashing",
      name: "ハッシュ化保存",
      check: (config) => config.hashAlgorithm && config.hashAlgorithm !== "plain",
      severity: "error",
      message: "APIキーはハッシュ化して保存してください",
    },
    {
      id: "apikey-expiry",
      name: "有効期限設定",
      check: (config) => config.expiresIn || config.maxAge,
      severity: "warning",
      message: "APIキーに有効期限を設定することを推奨します",
    },
    {
      id: "apikey-rotation",
      name: "ローテーション設定",
      check: (config) => config.rotationPolicy || config.autoRotate,
      severity: "info",
      message: "APIキーの定期ローテーションを検討してください",
    },
  ],

  general: [
    {
      id: "https-only",
      name: "HTTPS強制",
      check: (config) => config.httpsOnly !== false && config.secure !== false,
      severity: "error",
      message: "認証通信はHTTPSのみを使用してください",
    },
    {
      id: "rate-limiting",
      name: "レート制限",
      check: (config) => config.rateLimit || config.maxAttempts,
      severity: "warning",
      message: "認証エンドポイントにレート制限を設定してください",
    },
    {
      id: "lockout",
      name: "アカウントロックアウト",
      check: (config) => config.lockoutPolicy || config.maxFailedAttempts,
      severity: "warning",
      message: "ブルートフォース対策のロックアウトポリシーを設定してください",
    },
  ],
};

// 有効期限文字列をミリ秒に変換
function parseExpiry(expiry) {
  if (typeof expiry === "number") return expiry * 1000;

  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

// 設定タイプを検出
function detectConfigType(config) {
  if (config.authorizationEndpoint || config.tokenEndpoint || config.clientId) {
    return "oauth";
  }
  if (config.algorithm || config.secret || config.privateKey) {
    return "jwt";
  }
  if (config.apiKey || config.keyPrefix || config.hashAlgorithm) {
    return "apiKey";
  }
  return "general";
}

// 設定を検証
function validateConfig(config, configType = null) {
  const type = configType || detectConfigType(config);
  const checks = [...(SECURITY_CHECKS[type] || []), ...SECURITY_CHECKS.general];

  const result = {
    type,
    errors: [],
    warnings: [],
    info: [],
    passed: [],
  };

  for (const check of checks) {
    try {
      const passed = check.check(config);

      if (passed) {
        result.passed.push({ id: check.id, name: check.name });
      } else {
        const issue = {
          id: check.id,
          name: check.name,
          message: check.message,
        };

        switch (check.severity) {
          case "error":
            result.errors.push(issue);
            break;
          case "warning":
            result.warnings.push(issue);
            break;
          case "info":
            result.info.push(issue);
            break;
        }
      }
    } catch (e) {
      // チェック中のエラーは無視
    }
  }

  return result;
}

// コード内の認証設定をスキャン
function scanDirectory(dirPath) {
  const findings = [];
  const patterns = [
    // ハードコードされたシークレット
    {
      pattern: /['"`](sk[-_]|api[-_]?key[-_]?|secret[-_]?|password[-_]?)[a-zA-Z0-9_-]{10,}['"`]/gi,
      severity: "error",
      message: "ハードコードされたシークレットが検出されました",
    },
    // 弱いJWT設定
    {
      pattern: /algorithm\s*[:=]\s*['"`]none['"`]/gi,
      severity: "error",
      message: "JWT algorithm=none は禁止です",
    },
    // HTTP URL（認証関連）
    {
      pattern: /(authorizationEndpoint|tokenEndpoint|redirectUri)\s*[:=]\s*['"`]http:\/\//gi,
      severity: "error",
      message: "認証URLにHTTPが使用されています",
    },
    // 証明書検証の無効化
    {
      pattern: /rejectUnauthorized\s*[:=]\s*false/gi,
      severity: "error",
      message: "TLS証明書検証が無効化されています",
    },
    // 環境変数チェックなし
    {
      pattern: /process\.env\.[A-Z_]+\s*\|\|\s*['"`][^'"`]{10,}['"`]/gi,
      severity: "warning",
      message: "環境変数のフォールバックに機密値が含まれている可能性があります",
    },
  ];

  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");

    for (const { pattern, severity, message } of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        findings.push({
          file: filePath,
          severity,
          message,
          matches: matches.length,
        });
      }
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith(".") && file !== "node_modules") {
          walkDir(filePath);
        }
      } else if (/\.(ts|js|tsx|jsx|json)$/.test(file)) {
        scanFile(filePath);
      }
    }
  }

  walkDir(dirPath);
  return findings;
}

// レポート出力
function printReport(result, source) {
  console.log("\n" + "=".repeat(60));
  console.log(`Authentication Config Validation: ${source}`);
  console.log(`Type: ${result.type}`);
  console.log("=".repeat(60));

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    for (const issue of result.errors) {
      console.log(`  [${issue.id}] ${issue.message}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    for (const issue of result.warnings) {
      console.log(`  [${issue.id}] ${issue.message}`);
    }
  }

  if (result.info.length > 0) {
    console.log("\nℹ️  Info:");
    for (const issue of result.info) {
      console.log(`  [${issue.id}] ${issue.message}`);
    }
  }

  if (result.passed.length > 0) {
    console.log("\n✅ Passed:");
    for (const item of result.passed) {
      console.log(`  [${item.id}] ${item.name}`);
    }
  }

  const isValid = result.errors.length === 0;
  console.log("\n" + "-".repeat(60));
  console.log(`Result: ${isValid ? "✅ PASSED" : "❌ FAILED"}`);
  console.log("-".repeat(60));

  return isValid;
}

// スキャン結果出力
function printScanReport(findings) {
  console.log("\n" + "=".repeat(60));
  console.log("Security Scan Results");
  console.log("=".repeat(60));

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    for (const finding of errors) {
      console.log(`  ${finding.file}`);
      console.log(`    ${finding.message} (${finding.matches} occurrences)`);
    }
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    for (const finding of warnings) {
      console.log(`  ${finding.file}`);
      console.log(`    ${finding.message} (${finding.matches} occurrences)`);
    }
  }

  if (findings.length === 0) {
    console.log("\n✅ No security issues found");
  }

  console.log("\n" + "-".repeat(60));
  console.log(`Total: ${findings.length} issues (${errors.length} errors, ${warnings.length} warnings)`);
  console.log("-".repeat(60));

  return errors.length === 0;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node validate-auth-config.mjs <config.json>");
    console.log("  node validate-auth-config.mjs --scan <directory>");
    process.exit(1);
  }

  if (args[0] === "--scan") {
    const dirPath = args[1] || ".";
    if (!fs.existsSync(dirPath)) {
      console.error("Error: Directory not found");
      process.exit(1);
    }

    const findings = scanDirectory(dirPath);
    const isValid = printScanReport(findings);
    process.exit(isValid ? 0 : 1);
  } else {
    const configPath = args[0];
    if (!fs.existsSync(configPath)) {
      console.error("Error: Config file not found");
      process.exit(1);
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      const result = validateConfig(config);
      const isValid = printReport(result, configPath);
      process.exit(isValid ? 0 : 1);
    } catch (e) {
      console.error("Error: Failed to parse config file");
      process.exit(1);
    }
  }
}

main();
