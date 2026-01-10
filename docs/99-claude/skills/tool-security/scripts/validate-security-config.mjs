#!/usr/bin/env node

/**
 * Security Configuration Validator
 *
 * セキュリティ設定ファイルを検証します。
 *
 * 使用方法:
 *   node validate-security-config.mjs <config-file>
 *   node validate-security-config.mjs security-config.json
 */

import { readFile } from "fs/promises";
import { existsSync } from "fs";

const configPath = process.argv[2];

if (!configPath) {
  console.log("使用方法: node validate-security-config.mjs <config-file>");
  console.log("例: node validate-security-config.mjs security-config.json");
  process.exit(1);
}

if (!existsSync(configPath)) {
  console.error(`❌ ファイルが見つかりません: ${configPath}`);
  process.exit(1);
}

/**
 * 検証ルール
 */
const validationRules = {
  authentication: {
    required: true,
    validate: (auth) => {
      const errors = [];
      const warnings = [];

      if (!auth.method) {
        errors.push("authentication.method は必須です");
      } else {
        const validMethods = ["api_key", "oauth2", "jwt", "bearer_token"];
        if (!validMethods.includes(auth.method)) {
          errors.push(
            `authentication.method は ${validMethods.join(", ")} のいずれかである必要があります`,
          );
        }
      }

      if (!auth.credentials) {
        errors.push("authentication.credentials は必須です");
      } else {
        if (!auth.credentials.source) {
          errors.push("authentication.credentials.source は必須です");
        } else {
          const validSources = ["environment", "secrets_manager", "vault"];
          if (!validSources.includes(auth.credentials.source)) {
            errors.push(
              `authentication.credentials.source は ${validSources.join(", ")} のいずれかである必要があります`,
            );
          }

          if (
            auth.credentials.source === "environment" &&
            !auth.credentials.envVar
          ) {
            errors.push("source=environment の場合、envVar は必須です");
          }

          if (
            ["secrets_manager", "vault"].includes(auth.credentials.source) &&
            !auth.credentials.secretPath
          ) {
            errors.push(
              `source=${auth.credentials.source} の場合、secretPath は必須です`,
            );
          }
        }
      }

      // ローテーション推奨
      if (!auth.rotation || !auth.rotation.enabled) {
        warnings.push(
          "キーローテーションが無効です。セキュリティ向上のため有効化を推奨します",
        );
      }

      return { errors, warnings };
    },
  },

  authorization: {
    required: true,
    validate: (authz) => {
      const errors = [];
      const warnings = [];

      if (!authz.model) {
        errors.push("authorization.model は必須です");
      } else {
        const validModels = ["rbac", "abac", "scope_based"];
        if (!validModels.includes(authz.model)) {
          errors.push(
            `authorization.model は ${validModels.join(", ")} のいずれかである必要があります`,
          );
        }
      }

      if (
        authz.model === "rbac" &&
        (!authz.roles || authz.roles.length === 0)
      ) {
        warnings.push("RBACモデルですが、ロールが定義されていません");
      }

      if (
        authz.model === "scope_based" &&
        (!authz.scopes || authz.scopes.length === 0)
      ) {
        warnings.push(
          "スコープベースモデルですが、スコープが定義されていません",
        );
      }

      // 過剰な権限チェック
      if (authz.scopes) {
        const dangerousScopes = authz.scopes.filter(
          (s) => s.includes(":all") || s.includes(":*") || s === "admin",
        );
        if (dangerousScopes.length > 0) {
          warnings.push(
            `過剰な権限スコープが検出されました: ${dangerousScopes.join(", ")}`,
          );
        }
      }

      return { errors, warnings };
    },
  },

  rateLimiting: {
    required: false,
    validate: (rl) => {
      const errors = [];
      const warnings = [];

      if (!rl.enabled) {
        warnings.push(
          "Rate Limitingが無効です。DoS攻撃防止のため有効化を推奨します",
        );
        return { errors, warnings };
      }

      if (!rl.maxRequests || rl.maxRequests < 1) {
        errors.push(
          "rateLimiting.maxRequests は1以上の整数である必要があります",
        );
      }

      if (!rl.windowMs || rl.windowMs < 1000) {
        errors.push("rateLimiting.windowMs は1000以上である必要があります");
      }

      if (rl.backoff) {
        const validStrategies = ["exponential", "linear", "fixed"];
        if (
          rl.backoff.strategy &&
          !validStrategies.includes(rl.backoff.strategy)
        ) {
          errors.push(
            `rateLimiting.backoff.strategy は ${validStrategies.join(", ")} のいずれかである必要があります`,
          );
        }

        if (rl.backoff.maxRetries && rl.backoff.maxRetries > 10) {
          warnings.push(
            "maxRetriesが10を超えています。過度なリトライはリソースを消費する可能性があります",
          );
        }
      }

      return { errors, warnings };
    },
  },

  inputValidation: {
    required: false,
    validate: (iv) => {
      const errors = [];
      const warnings = [];

      if (!iv.enabled) {
        warnings.push("入力検証が無効です。セキュリティ上のリスクがあります");
        return { errors, warnings };
      }

      if (iv.sanitization) {
        const criticalSanitizers = ["sql", "command"];
        for (const sanitizer of criticalSanitizers) {
          if (iv.sanitization[sanitizer] === false) {
            warnings.push(
              `${sanitizer}サニタイゼーションが無効です。インジェクション攻撃のリスクがあります`,
            );
          }
        }
      }

      return { errors, warnings };
    },
  },

  audit: {
    required: false,
    validate: (audit) => {
      const errors = [];
      const warnings = [];

      if (!audit.enabled) {
        warnings.push(
          "監査ログが無効です。コンプライアンスとセキュリティ監視のため有効化を推奨します",
        );
        return { errors, warnings };
      }

      if (audit.includeRequestBody || audit.includeResponseBody) {
        warnings.push(
          "リクエスト/レスポンスボディのログ記録が有効です。機密データの露出に注意してください",
        );
      }

      if (!audit.sensitiveFields || audit.sensitiveFields.length === 0) {
        warnings.push("機密フィールドのマスキングが設定されていません");
      }

      if (audit.retention && audit.retention.days < 30) {
        warnings.push(
          "ログ保持期間が30日未満です。コンプライアンス要件を確認してください",
        );
      }

      return { errors, warnings };
    },
  },

  network: {
    required: false,
    validate: (network) => {
      const errors = [];
      const warnings = [];

      if (network.tlsMinVersion === "1.0" || network.tlsMinVersion === "1.1") {
        errors.push("TLS 1.0/1.1は非推奨です。TLS 1.2以上を使用してください");
      }

      if (!network.allowedIps || network.allowedIps.length === 0) {
        warnings.push(
          "IPホワイトリストが設定されていません。必要に応じて設定を検討してください",
        );
      }

      if (network.allowedIps && network.allowedIps.includes("0.0.0.0/0")) {
        warnings.push(
          "0.0.0.0/0（全IP許可）が設定されています。セキュリティリスクを確認してください",
        );
      }

      return { errors, warnings };
    },
  },
};

/**
 * 設定を検証
 */
function validateConfig(config) {
  const allErrors = [];
  const allWarnings = [];

  // 必須フィールドチェック
  for (const [field, rule] of Object.entries(validationRules)) {
    if (rule.required && !config[field]) {
      allErrors.push(`${field} は必須フィールドです`);
      continue;
    }

    if (config[field]) {
      const { errors, warnings } = rule.validate(config[field]);
      allErrors.push(...errors);
      allWarnings.push(...warnings);
    }
  }

  return { errors: allErrors, warnings: allWarnings };
}

/**
 * セキュリティスコアを計算
 */
function calculateSecurityScore(config, errors, warnings) {
  let score = 100;

  // エラーは大きな減点
  score -= errors.length * 15;

  // 警告は小さな減点
  score -= warnings.length * 5;

  // ベストプラクティスボーナス
  if (config.authentication?.rotation?.enabled) score += 5;
  if (config.rateLimiting?.enabled) score += 5;
  if (config.inputValidation?.enabled) score += 5;
  if (config.audit?.enabled) score += 5;
  if (config.network?.tlsMinVersion === "1.3") score += 3;

  return Math.max(0, Math.min(100, score));
}

/**
 * メイン処理
 */
async function main() {
  try {
    const content = await readFile(configPath, "utf-8");
    const config = JSON.parse(content);

    console.log("🔍 セキュリティ設定を検証中...\n");

    const { errors, warnings } = validateConfig(config);
    const score = calculateSecurityScore(config, errors, warnings);

    // 結果表示
    if (errors.length > 0) {
      console.log("❌ エラー:");
      errors.forEach((e) => console.log(`   - ${e}`));
      console.log("");
    }

    if (warnings.length > 0) {
      console.log("⚠️  警告:");
      warnings.forEach((w) => console.log(`   - ${w}`));
      console.log("");
    }

    // セキュリティスコア表示
    let scoreIcon;
    if (score >= 80) scoreIcon = "🟢";
    else if (score >= 60) scoreIcon = "🟡";
    else scoreIcon = "🔴";

    console.log(`${scoreIcon} セキュリティスコア: ${score}/100\n`);

    // 設定サマリー
    console.log("📋 設定サマリー:");
    console.log(`   認証方式: ${config.authentication?.method || "未設定"}`);
    console.log(`   認可モデル: ${config.authorization?.model || "未設定"}`);
    console.log(
      `   Rate Limiting: ${config.rateLimiting?.enabled ? "有効" : "無効"}`,
    );
    console.log(
      `   入力検証: ${config.inputValidation?.enabled ? "有効" : "無効"}`,
    );
    console.log(`   監査ログ: ${config.audit?.enabled ? "有効" : "無効"}`);

    if (errors.length > 0) {
      console.log("\n❌ 検証失敗: エラーを修正してください");
      process.exit(1);
    } else if (warnings.length > 0) {
      console.log("\n⚠️  検証成功（警告あり）");
      process.exit(0);
    } else {
      console.log("\n✅ 検証成功");
      process.exit(0);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("❌ JSONパースエラー:", error.message);
    } else {
      console.error("❌ エラー:", error.message);
    }
    process.exit(1);
  }
}

main();
