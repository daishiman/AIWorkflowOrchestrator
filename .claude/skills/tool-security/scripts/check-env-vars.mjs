#!/usr/bin/env node

/**
 * Environment Variables Security Checker
 *
 * 環境変数のセキュリティ状態をチェックします。
 *
 * 使用方法:
 *   node check-env-vars.mjs [options]
 *
 * オプション:
 *   --required, -r  必須環境変数をカンマ区切りで指定
 *   --pattern, -p   チェックするパターン（例: *_TOKEN, *_KEY）
 *   --strict        厳格モード（警告もエラーとして扱う）
 */

import { parseArgs } from "util";

const { values } = parseArgs({
  options: {
    required: {
      type: "string",
      short: "r",
      default: "",
    },
    pattern: {
      type: "string",
      short: "p",
      default: "",
    },
    strict: {
      type: "boolean",
      default: false,
    },
  },
});

/**
 * 機密性が高い環境変数パターン
 */
const sensitivePatterns = [
  /^.*_TOKEN$/,
  /^.*_KEY$/,
  /^.*_SECRET$/,
  /^.*_PASSWORD$/,
  /^.*_CREDENTIAL$/,
  /^.*_API_KEY$/,
  /^.*_AUTH$/,
  /^DATABASE_URL$/,
  /^PRIVATE_KEY$/,
  /^JWT_SECRET$/,
  /^SESSION_SECRET$/,
  /^ENCRYPTION_KEY$/,
];

/**
 * 危険な環境変数パターン（本番環境で注意が必要）
 */
const dangerousPatterns = [
  /^DEBUG$/,
  /^NODE_ENV$/,
  /^DISABLE_.*$/,
  /^SKIP_.*$/,
  /^MOCK_.*$/,
  /^TEST_.*$/,
];

/**
 * 推奨されるプロバイダー固有の環境変数
 */
const providerVars = {
  github: ["GITHUB_TOKEN", "GH_TOKEN"],
  google: ["GOOGLE_API_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  slack: ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"],
  openai: ["OPENAI_API_KEY"],
  aws: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
  azure: ["AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "AZURE_TENANT_ID"],
};

/**
 * 環境変数をチェック
 */
function checkEnvironmentVariables() {
  const results = {
    sensitive: [],
    dangerous: [],
    missing: [],
    empty: [],
    providers: {},
  };

  const envVars = Object.keys(process.env);

  // 機密性の高い変数を検出
  for (const varName of envVars) {
    for (const pattern of sensitivePatterns) {
      if (pattern.test(varName)) {
        const value = process.env[varName];
        results.sensitive.push({
          name: varName,
          length: value?.length || 0,
          isEmpty: !value || value.trim() === "",
        });
        break;
      }
    }
  }

  // 危険な変数を検出
  for (const varName of envVars) {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(varName)) {
        results.dangerous.push({
          name: varName,
          value: process.env[varName],
        });
        break;
      }
    }
  }

  // 必須変数のチェック
  if (values.required) {
    const requiredVars = values.required.split(",").map((v) => v.trim());
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        results.missing.push(varName);
      } else if (process.env[varName].trim() === "") {
        results.empty.push(varName);
      }
    }
  }

  // パターンマッチングチェック
  if (values.pattern) {
    const patterns = values.pattern.split(",").map((p) => {
      const regexPattern = p.trim().replace(/\*/g, ".*");
      return new RegExp(`^${regexPattern}$`);
    });

    for (const pattern of patterns) {
      const matching = envVars.filter((v) => pattern.test(v));
      if (matching.length === 0) {
        results.missing.push(
          `パターン ${values.pattern} に一致する変数がありません`,
        );
      }
    }
  }

  // プロバイダー別チェック
  for (const [provider, vars] of Object.entries(providerVars)) {
    const found = vars.filter((v) => process.env[v]);
    if (found.length > 0) {
      results.providers[provider] = {
        found: found,
        missing: vars.filter((v) => !process.env[v]),
      };
    }
  }

  return results;
}

/**
 * セキュリティ推奨事項を生成
 */
function generateRecommendations(results) {
  const recommendations = [];

  // 空の機密変数
  const emptySensitive = results.sensitive.filter((s) => s.isEmpty);
  if (emptySensitive.length > 0) {
    recommendations.push({
      severity: "high",
      message: `空の機密変数が検出されました: ${emptySensitive.map((s) => s.name).join(", ")}`,
    });
  }

  // 危険な設定
  const debugEnabled = results.dangerous.find(
    (d) =>
      d.name === "DEBUG" && d.value && d.value !== "false" && d.value !== "0",
  );
  if (debugEnabled) {
    recommendations.push({
      severity: "medium",
      message: "DEBUG が有効です。本番環境では無効化してください",
    });
  }

  const nodeEnv = results.dangerous.find((d) => d.name === "NODE_ENV");
  if (nodeEnv && nodeEnv.value !== "production") {
    recommendations.push({
      severity: "medium",
      message: `NODE_ENV が '${nodeEnv.value}' です。本番環境では 'production' に設定してください`,
    });
  }

  // 必須変数の欠落
  if (results.missing.length > 0) {
    recommendations.push({
      severity: "high",
      message: `必須環境変数が設定されていません: ${results.missing.join(", ")}`,
    });
  }

  // 短すぎるシークレット
  const shortSecrets = results.sensitive.filter(
    (s) => !s.isEmpty && s.length < 16 && s.name.includes("SECRET"),
  );
  if (shortSecrets.length > 0) {
    recommendations.push({
      severity: "medium",
      message: `短すぎるシークレットが検出されました: ${shortSecrets.map((s) => s.name).join(", ")}`,
    });
  }

  return recommendations;
}

/**
 * 結果を表示
 */
function displayResults(results, recommendations) {
  console.log("🔍 環境変数セキュリティチェック\n");

  // 機密変数
  if (results.sensitive.length > 0) {
    console.log("🔐 検出された機密変数:");
    for (const s of results.sensitive) {
      const status = s.isEmpty ? "❌ 空" : `✅ 設定済 (${s.length}文字)`;
      console.log(`   ${s.name}: ${status}`);
    }
    console.log("");
  }

  // プロバイダー別
  const providers = Object.entries(results.providers);
  if (providers.length > 0) {
    console.log("📦 検出されたプロバイダー設定:");
    for (const [provider, info] of providers) {
      console.log(`   ${provider}:`);
      console.log(`     ✅ 設定済: ${info.found.join(", ")}`);
      if (info.missing.length > 0) {
        console.log(`     ⚠️  未設定: ${info.missing.join(", ")}`);
      }
    }
    console.log("");
  }

  // 危険な設定
  if (results.dangerous.length > 0) {
    console.log("⚠️  注意が必要な変数:");
    for (const d of results.dangerous) {
      console.log(`   ${d.name}=${d.value || "(空)"}`);
    }
    console.log("");
  }

  // 推奨事項
  if (recommendations.length > 0) {
    console.log("📋 セキュリティ推奨事項:");
    for (const rec of recommendations) {
      const icon = rec.severity === "high" ? "🔴" : "🟡";
      console.log(`   ${icon} ${rec.message}`);
    }
    console.log("");
  }

  // サマリー
  const hasHighSeverity = recommendations.some((r) => r.severity === "high");
  const hasMediumSeverity = recommendations.some(
    (r) => r.severity === "medium",
  );

  if (hasHighSeverity) {
    console.log("❌ 重大なセキュリティ問題があります");
    return false;
  } else if (hasMediumSeverity && values.strict) {
    console.log("⚠️  警告があります（厳格モード）");
    return false;
  } else if (hasMediumSeverity) {
    console.log("⚠️  警告がありますが、基本的なセキュリティは確保されています");
    return true;
  } else {
    console.log("✅ 環境変数のセキュリティチェックに合格しました");
    return true;
  }
}

/**
 * メイン処理
 */
function main() {
  const results = checkEnvironmentVariables();
  const recommendations = generateRecommendations(results);
  const success = displayResults(results, recommendations);

  process.exit(success ? 0 : 1);
}

main();
