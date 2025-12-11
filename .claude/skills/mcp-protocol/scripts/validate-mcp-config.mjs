#!/usr/bin/env node

/**
 * MCP Configuration Validator
 *
 * MCP設定ファイル（claude_mcp_config.json）の構文と構造を検証します。
 *
 * 使用方法:
 *   node validate-mcp-config.mjs <config-file>
 *   node validate-mcp-config.mjs claude_mcp_config.json
 *
 * 出力:
 *   - 検証結果（成功/失敗）
 *   - エラー詳細（存在する場合）
 *   - 警告（ベストプラクティス違反）
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// 許可されたコマンド
const ALLOWED_COMMANDS = [
  "npx",
  "node",
  "python",
  "python3",
  "docker",
  "deno",
  "uvx",
];

// サーバー名の正規表現（kebab-case）
const SERVER_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

// 検証結果
const results = {
  errors: [],
  warnings: [],
  info: [],
};

/**
 * 設定ファイルを読み込み
 */
function loadConfig(filePath) {
  try {
    const absolutePath = resolve(filePath);
    const content = readFileSync(absolutePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`ファイルが見つかりません: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`JSON構文エラー: ${error.message}`);
    }
    throw error;
  }
}

/**
 * サーバー名を検証
 */
function validateServerName(name) {
  if (!SERVER_NAME_PATTERN.test(name)) {
    results.errors.push(`サーバー名 '${name}' はkebab-case形式ではありません`);
    return false;
  }
  return true;
}

/**
 * コマンドを検証
 */
function validateCommand(serverName, command) {
  if (!command) {
    results.errors.push(`[${serverName}] 'command' が必須です`);
    return false;
  }

  if (!ALLOWED_COMMANDS.includes(command)) {
    results.warnings.push(
      `[${serverName}] コマンド '${command}' は標準的ではありません（許可: ${ALLOWED_COMMANDS.join(", ")}）`,
    );
  }

  return true;
}

/**
 * 引数を検証
 */
function validateArgs(serverName, args) {
  if (!args) {
    results.warnings.push(`[${serverName}] 'args' が未定義です`);
    return true;
  }

  if (!Array.isArray(args)) {
    results.errors.push(`[${serverName}] 'args' は配列である必要があります`);
    return false;
  }

  return true;
}

/**
 * 環境変数を検証
 */
function validateEnv(serverName, env) {
  if (!env) {
    return true;
  }

  if (typeof env !== "object" || Array.isArray(env)) {
    results.errors.push(
      `[${serverName}] 'env' はオブジェクトである必要があります`,
    );
    return false;
  }

  // ハードコードされたシークレットをチェック
  const sensitivePatterns = [/api_?key/i, /secret/i, /password/i, /token/i];

  for (const [key, value] of Object.entries(env)) {
    const isSensitive = sensitivePatterns.some((pattern) => pattern.test(key));

    if (isSensitive && !value.startsWith("${") && !value.endsWith("}")) {
      results.warnings.push(
        `[${serverName}] 環境変数 '${key}' は環境変数参照形式 (\${VAR}) を使用してください`,
      );
    }
  }

  return true;
}

/**
 * タイムアウトを検証
 */
function validateTimeout(serverName, timeout) {
  if (timeout === undefined) {
    return true;
  }

  if (typeof timeout !== "number") {
    results.errors.push(`[${serverName}] 'timeout' は数値である必要があります`);
    return false;
  }

  if (timeout < 1000) {
    results.warnings.push(
      `[${serverName}] タイムアウトが短すぎます（${timeout}ms）。最低1000ms推奨`,
    );
  }

  if (timeout > 300000) {
    results.warnings.push(
      `[${serverName}] タイムアウトが長すぎます（${timeout}ms）。最大300000ms推奨`,
    );
  }

  return true;
}

/**
 * 単一サーバーの検証
 */
function validateServer(name, config) {
  let valid = true;

  valid = validateServerName(name) && valid;
  valid = validateCommand(name, config.command) && valid;
  valid = validateArgs(name, config.args) && valid;
  valid = validateEnv(name, config.env) && valid;
  valid = validateTimeout(name, config.timeout) && valid;

  // 情報を記録
  if (config.disabled) {
    results.info.push(`[${name}] サーバーは無効化されています`);
  }

  return valid;
}

/**
 * MCP設定全体を検証
 */
function validateMcpConfig(config) {
  if (!config.mcpServers) {
    results.errors.push("'mcpServers' キーが必須です");
    return false;
  }

  if (
    typeof config.mcpServers !== "object" ||
    Array.isArray(config.mcpServers)
  ) {
    results.errors.push("'mcpServers' はオブジェクトである必要があります");
    return false;
  }

  const servers = Object.entries(config.mcpServers);

  if (servers.length === 0) {
    results.warnings.push("MCPサーバーが1つも定義されていません");
  }

  let allValid = true;
  for (const [name, serverConfig] of servers) {
    if (!validateServer(name, serverConfig)) {
      allValid = false;
    }
  }

  return allValid;
}

/**
 * 結果を表示
 */
function printResults() {
  console.log("\n=== MCP設定検証結果 ===\n");

  if (results.errors.length > 0) {
    console.log("❌ エラー:");
    results.errors.forEach((err) => console.log(`   - ${err}`));
    console.log("");
  }

  if (results.warnings.length > 0) {
    console.log("⚠️  警告:");
    results.warnings.forEach((warn) => console.log(`   - ${warn}`));
    console.log("");
  }

  if (results.info.length > 0) {
    console.log("ℹ️  情報:");
    results.info.forEach((info) => console.log(`   - ${info}`));
    console.log("");
  }

  if (results.errors.length === 0) {
    console.log("✅ 検証成功: 設定ファイルは有効です");
    return true;
  } else {
    console.log("❌ 検証失敗: エラーを修正してください");
    return false;
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node validate-mcp-config.mjs <config-file>");
    console.log("例: node validate-mcp-config.mjs claude_mcp_config.json");
    process.exit(1);
  }

  const configPath = args[0];

  try {
    console.log(`検証中: ${configPath}`);
    const config = loadConfig(configPath);
    validateMcpConfig(config);
    const success = printResults();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
