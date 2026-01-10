#!/usr/bin/env node
/**
 * PM2 ecosystem.config.js 検証スクリプト
 *
 * 使用方法:
 *   node .claude/skills/pm2-ecosystem-config/scripts/validate-ecosystem.mjs <config-file>
 *
 * 例:
 *   node .claude/skills/pm2-ecosystem-config/scripts/validate-ecosystem.mjs ecosystem.config.js
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// 検証結果を格納
const results = {
  errors: [],
  warnings: [],
  info: [],
};

// 必須項目の定義
const REQUIRED_FIELDS = ["name", "script"];

// 推奨項目の定義
const RECOMMENDED_FIELDS = [
  "cwd",
  "exec_mode",
  "instances",
  "autorestart",
  "max_restarts",
  "min_uptime",
];

// 有効な exec_mode 値
const VALID_EXEC_MODES = ["fork", "cluster"];

// 有効な instances 値のパターン
const VALID_INSTANCES_PATTERNS = [
  /^-?\d+$/, // 数値
  /^max$/i, // 'max' 文字列
];

/**
 * 設定ファイルを読み込む
 */
function loadConfig(filePath) {
  const absolutePath = resolve(process.cwd(), filePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`設定ファイルが見つかりません: ${absolutePath}`);
  }

  try {
    // JavaScript構文チェック
    const content = readFileSync(absolutePath, "utf8");

    // 基本的な構文検証（module.exportsの存在確認）
    if (!content.includes("module.exports")) {
      throw new Error("module.exports が見つかりません");
    }

    // 設定ファイルを読み込み
    const config = require(absolutePath);
    return config;
  } catch (error) {
    throw new Error(`設定ファイルの読み込みエラー: ${error.message}`);
  }
}

/**
 * apps配列を検証
 */
function validateApps(config) {
  if (!config.apps) {
    results.errors.push("apps配列が定義されていません");
    return;
  }

  if (!Array.isArray(config.apps)) {
    results.errors.push("appsはArray型である必要があります");
    return;
  }

  if (config.apps.length === 0) {
    results.errors.push("apps配列が空です");
    return;
  }

  results.info.push(`アプリケーション数: ${config.apps.length}`);

  config.apps.forEach((app, index) => {
    validateApp(app, index);
  });
}

/**
 * 個別アプリケーション設定を検証
 */
function validateApp(app, index) {
  const prefix = `apps[${index}]`;

  // 必須項目チェック
  REQUIRED_FIELDS.forEach((field) => {
    if (!app[field]) {
      results.errors.push(`${prefix}: 必須項目 '${field}' が未定義です`);
    }
  });

  // 推奨項目チェック
  RECOMMENDED_FIELDS.forEach((field) => {
    if (app[field] === undefined) {
      results.warnings.push(`${prefix}: 推奨項目 '${field}' が未定義です`);
    }
  });

  // exec_mode検証
  if (app.exec_mode && !VALID_EXEC_MODES.includes(app.exec_mode)) {
    results.errors.push(
      `${prefix}: exec_mode '${app.exec_mode}' は無効です。` +
        `有効な値: ${VALID_EXEC_MODES.join(", ")}`,
    );
  }

  // instances検証
  if (app.instances !== undefined) {
    const instancesStr = String(app.instances);
    const isValid = VALID_INSTANCES_PATTERNS.some((pattern) =>
      pattern.test(instancesStr),
    );
    if (!isValid) {
      results.errors.push(
        `${prefix}: instances '${app.instances}' は無効です。` +
          `有効な値: 数値, 'max', 0, -1`,
      );
    }
  }

  // cluster mode + instances: 1 の警告
  if (app.exec_mode === "cluster" && app.instances === 1) {
    results.warnings.push(
      `${prefix}: cluster modeでinstances: 1は効果がありません。` +
        `fork modeを検討してください`,
    );
  }

  // max_restarts検証
  if (app.max_restarts !== undefined) {
    if (typeof app.max_restarts !== "number" || app.max_restarts < 0) {
      results.errors.push(
        `${prefix}: max_restarts は0以上の数値である必要があります`,
      );
    }
    if (app.max_restarts > 100) {
      results.warnings.push(
        `${prefix}: max_restarts: ${app.max_restarts} は非常に高い値です`,
      );
    }
  }

  // max_memory_restart検証
  if (app.max_memory_restart) {
    const memoryPattern = /^\d+[KMG]?$/i;
    if (!memoryPattern.test(app.max_memory_restart)) {
      results.errors.push(
        `${prefix}: max_memory_restart '${app.max_memory_restart}' は無効な形式です。` +
          `例: '500M', '1G', '1024'`,
      );
    }
  }

  // 環境変数チェック
  validateEnvironment(app, prefix);

  // ログ設定チェック
  validateLogSettings(app, prefix);

  results.info.push(`${prefix} (${app.name || "unnamed"}): 検証完了`);
}

/**
 * 環境変数設定を検証
 */
function validateEnvironment(app, prefix) {
  // 機密情報の検出パターン
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /api_key/i,
    /apikey/i,
    /token/i,
    /credential/i,
  ];

  const checkForSensitiveData = (envObj, envName) => {
    if (!envObj || typeof envObj !== "object") return;

    Object.entries(envObj).forEach(([key, value]) => {
      // キー名に機密情報が含まれ、かつ値がハードコードされている場合
      const isSensitiveKey = sensitivePatterns.some((p) => p.test(key));
      const isHardcoded =
        typeof value === "string" &&
        value.length > 0 &&
        !value.startsWith("${") &&
        !value.includes("process.env");

      if (isSensitiveKey && isHardcoded) {
        results.warnings.push(
          `${prefix}.${envName}.${key}: 機密情報がハードコードされている可能性があります。` +
            `環境変数または.envファイルの使用を推奨します`,
        );
      }
    });
  };

  checkForSensitiveData(app.env, "env");
  checkForSensitiveData(app.env_production, "env_production");
  checkForSensitiveData(app.env_staging, "env_staging");
}

/**
 * ログ設定を検証
 */
function validateLogSettings(app, prefix) {
  // ログファイルパスの検証
  if (app.error_file && app.error_file.startsWith("/")) {
    results.warnings.push(
      `${prefix}.error_file: 絶対パスは環境依存性を高めます。` +
        `相対パスを推奨します`,
    );
  }

  if (app.out_file && app.out_file.startsWith("/")) {
    results.warnings.push(
      `${prefix}.out_file: 絶対パスは環境依存性を高めます。` +
        `相対パスを推奨します`,
    );
  }

  // cluster mode でのmerge_logs推奨
  if (app.exec_mode === "cluster" && !app.merge_logs) {
    results.warnings.push(
      `${prefix}: cluster modeではmerge_logs: trueを推奨します`,
    );
  }
}

/**
 * 結果を出力
 */
function printResults() {
  console.log("\n" + "=".repeat(60));
  console.log("PM2 Ecosystem Config 検証結果");
  console.log("=".repeat(60) + "\n");

  // 情報
  if (results.info.length > 0) {
    console.log("📋 情報:");
    results.info.forEach((msg) => console.log(`   ${msg}`));
    console.log();
  }

  // 警告
  if (results.warnings.length > 0) {
    console.log("⚠️  警告:");
    results.warnings.forEach((msg) => console.log(`   ${msg}`));
    console.log();
  }

  // エラー
  if (results.errors.length > 0) {
    console.log("❌ エラー:");
    results.errors.forEach((msg) => console.log(`   ${msg}`));
    console.log();
  }

  // サマリー
  console.log("-".repeat(60));
  console.log(
    `検証結果: エラー ${results.errors.length}件, 警告 ${results.warnings.length}件`,
  );

  if (results.errors.length === 0) {
    console.log("✅ 設定ファイルは有効です");
    return 0;
  } else {
    console.log("❌ 設定ファイルにエラーがあります");
    return 1;
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node validate-ecosystem.mjs <config-file>");
    console.log("例: node validate-ecosystem.mjs ecosystem.config.js");
    process.exit(1);
  }

  const configPath = args[0];

  try {
    console.log(`検証対象: ${configPath}`);
    const config = loadConfig(configPath);
    validateApps(config);
    const exitCode = printResults();
    process.exit(exitCode);
  } catch (error) {
    console.error(`\n❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
