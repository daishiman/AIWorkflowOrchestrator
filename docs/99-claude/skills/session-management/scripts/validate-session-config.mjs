#!/usr/bin/env node

/**
 * セッション設定検証スクリプト
 *
 * 使用方法:
 *   node validate-session-config.mjs <config-file>
 *
 * 検証項目:
 *   - セッション戦略の妥当性
 *   - Cookie属性の安全性
 *   - タイムアウト設定
 *   - セキュリティ設定
 */

import fs from "fs";
import path from "path";

const VALIDATION_RULES = {
  minSessionDuration: 5 * 60, // 5分
  maxSessionDuration: 90 * 24 * 60 * 60, // 90日
  minAccessTokenDuration: 5 * 60, // 5分
  maxAccessTokenDuration: 24 * 60 * 60, // 24時間
  recommendedAccessTokenDuration: 60 * 60, // 1時間
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ Usage: node validate-session-config.mjs <config-file>");
    process.exit(1);
  }

  const configPath = path.resolve(process.cwd(), args[0]);

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    process.exit(1);
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    console.log("🔍 Validating Session Configuration...\n");

    const results = validateSessionConfig(config);

    printValidationResults(results);

    if (results.errors.length > 0) {
      process.exit(1);
    }

    console.log("\n✅ Session configuration is valid!");
  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

function validateSessionConfig(config) {
  const errors = [];
  const warnings = [];
  const info = [];

  // セッション戦略チェック
  if (!config.strategy) {
    errors.push("Missing session strategy (jwt or database)");
  } else if (!["jwt", "database", "hybrid"].includes(config.strategy)) {
    errors.push(
      `Invalid strategy: ${config.strategy}. Must be jwt, database, or hybrid`,
    );
  } else {
    info.push(`Session strategy: ${config.strategy}`);
  }

  // Cookie属性チェック
  if (config.cookie) {
    // HttpOnly
    if (config.cookie.httpOnly !== true) {
      errors.push("cookie.httpOnly must be true for security");
    }

    // Secure
    if (
      process.env.NODE_ENV === "production" &&
      config.cookie.secure !== true
    ) {
      errors.push("cookie.secure must be true in production");
    }

    // SameSite
    if (!config.cookie.sameSite) {
      warnings.push('cookie.sameSite is not set - recommend "lax" or "strict"');
    } else if (config.cookie.sameSite === "none" && !config.cookie.secure) {
      errors.push("cookie.sameSite=none requires cookie.secure=true");
    } else if (!["strict", "lax", "none"].includes(config.cookie.sameSite)) {
      errors.push(`Invalid sameSite: ${config.cookie.sameSite}`);
    }

    // MaxAge
    if (config.cookie.maxAge) {
      if (config.cookie.maxAge < VALIDATION_RULES.minSessionDuration) {
        warnings.push(`cookie.maxAge is very short (< 5 minutes)`);
      }
      if (config.cookie.maxAge > VALIDATION_RULES.maxSessionDuration) {
        warnings.push(`cookie.maxAge is very long (> 90 days) - security risk`);
      }
    }
  } else {
    errors.push("Missing cookie configuration");
  }

  // JWT設定チェック（JWT戦略の場合）
  if (config.strategy === "jwt") {
    if (!config.jwt) {
      errors.push("JWT strategy requires jwt configuration");
    } else {
      if (!config.jwt.secret) {
        errors.push("jwt.secret is required for JWT strategy");
      } else if (config.jwt.secret.length < 32) {
        warnings.push("jwt.secret should be at least 32 characters");
      }

      if (config.jwt.maxAge) {
        if (config.jwt.maxAge > VALIDATION_RULES.maxAccessTokenDuration) {
          warnings.push(
            `jwt.maxAge is too long (> 24 hours) - recommend 1 hour`,
          );
        }
      }
    }
  }

  // Database設定チェック（Database戦略の場合）
  if (config.strategy === "database") {
    if (!config.adapter) {
      errors.push("Database strategy requires adapter configuration");
    }
  }

  // タイムアウト設定チェック
  if (config.timeout) {
    if (config.timeout.idle && config.timeout.idle < 5 * 60) {
      warnings.push("timeout.idle is very short (< 5 minutes)");
    }
    if (config.timeout.absolute && config.timeout.absolute > 24 * 60 * 60) {
      warnings.push("timeout.absolute is very long (> 24 hours)");
    }
  }

  return { errors, warnings, info };
}

function printValidationResults(results) {
  if (results.errors.length > 0) {
    console.log("❌ Errors:");
    results.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err}`);
    });
    console.log("");
  }

  if (results.warnings.length > 0) {
    console.log("⚠️  Warnings:");
    results.warnings.forEach((warn, idx) => {
      console.log(`  ${idx + 1}. ${warn}`);
    });
    console.log("");
  }

  if (results.info.length > 0) {
    console.log("ℹ️  Info:");
    results.info.forEach((info, idx) => {
      console.log(`  ${idx + 1}. ${info}`);
    });
    console.log("");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
