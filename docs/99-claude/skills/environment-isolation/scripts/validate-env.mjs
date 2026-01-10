#!/usr/bin/env node

/**
 * 環境変数検証スクリプト
 *
 * 環境変数の存在確認、型チェック、環境固有の必須項目を検証します。
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

// 環境変数スキーマ定義
const ENV_SCHEMA = {
  // 必須変数（全環境）
  required: ["NODE_ENV"],

  // 環境別必須変数
  environmentRequired: {
    production: [
      "DATABASE_URL",
      "DATABASE_AUTH_TOKEN",
      "JWT_SECRET",
      "NEXTAUTH_SECRET",
    ],
    staging: ["DATABASE_URL", "DATABASE_AUTH_TOKEN"],
    development: [],
    test: [],
  },

  // 推奨変数（警告のみ）
  recommended: ["LOG_LEVEL", "PORT"],

  // 型定義
  types: {
    PORT: "number",
    DEBUG: "boolean",
    LOG_LEVEL: "enum:debug,info,warn,error",
    NODE_ENV: "enum:development,staging,production,test",
  },

  // 最小長
  minLength: {
    JWT_SECRET: 32,
    NEXTAUTH_SECRET: 32,
    DATABASE_AUTH_TOKEN: 10,
  },
};

function showHelp() {
  console.log(`
Usage: node validate-env.mjs [options]

Options:
  --env <environment>   検証する環境 (development, staging, production, test)
  --file <path>         .envファイルのパス [default: .env]
  --strict              厳密モード（警告もエラーとして扱う）
  -h, --help            このヘルプを表示

Examples:
  node validate-env.mjs --env production
  node validate-env.mjs --env staging --file .env.staging
  node validate-env.mjs --env development --strict
  `);
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, "utf-8");
  const env = {};

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key) {
        let value = valueParts.join("=");
        // クォートを除去
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        env[key.trim()] = value;
      }
    }
  });

  return env;
}

function validateType(key, value, typeSpec) {
  if (!typeSpec) return { valid: true };

  if (typeSpec === "number") {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return {
        valid: false,
        message: `${key} must be a number, got: ${value}`,
      };
    }
  }

  if (typeSpec === "boolean") {
    if (!["true", "false", "1", "0"].includes(value.toLowerCase())) {
      return {
        valid: false,
        message: `${key} must be a boolean, got: ${value}`,
      };
    }
  }

  if (typeSpec.startsWith("enum:")) {
    const allowedValues = typeSpec.slice(5).split(",");
    if (!allowedValues.includes(value)) {
      return {
        valid: false,
        message: `${key} must be one of [${allowedValues.join(", ")}], got: ${value}`,
      };
    }
  }

  return { valid: true };
}

function validateMinLength(key, value, minLength) {
  if (minLength && value.length < minLength) {
    return {
      valid: false,
      message: `${key} must be at least ${minLength} characters, got: ${value.length}`,
    };
  }
  return { valid: true };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  // 引数解析
  const getArg = (name) => {
    const index = args.indexOf(name);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const environment = getArg("--env") || process.env.NODE_ENV || "development";
  const envFile = getArg("--file") || ".env";
  const strictMode = args.includes("--strict");

  console.log(`\n=== Environment Validation ===`);
  console.log(`Environment: ${environment}`);
  console.log(`File: ${envFile}`);
  console.log(`Strict Mode: ${strictMode}`);
  console.log("");

  // 環境変数を収集（ファイル + process.env）
  const fileEnv = parseEnvFile(envFile);
  const env = { ...process.env, ...fileEnv };

  if (fileEnv) {
    console.log(
      `✓ Loaded ${Object.keys(fileEnv).length} variables from ${envFile}`,
    );
  } else {
    console.log(`⚠ .env file not found: ${envFile}`);
  }

  const errors = [];
  const warnings = [];

  // 1. 必須変数チェック
  console.log("\n--- Required Variables ---");
  for (const key of ENV_SCHEMA.required) {
    if (!env[key]) {
      errors.push(`Missing required variable: ${key}`);
      console.log(`✗ ${key}: MISSING`);
    } else {
      console.log(`✓ ${key}: ${env[key]}`);
    }
  }

  // 2. 環境別必須変数チェック
  const envRequired = ENV_SCHEMA.environmentRequired[environment] || [];
  if (envRequired.length > 0) {
    console.log(`\n--- ${environment} Required Variables ---`);
    for (const key of envRequired) {
      if (!env[key]) {
        errors.push(`Missing ${environment} required variable: ${key}`);
        console.log(`✗ ${key}: MISSING`);
      } else {
        console.log(`✓ ${key}: ****** (hidden)`);
      }
    }
  }

  // 3. 推奨変数チェック
  console.log("\n--- Recommended Variables ---");
  for (const key of ENV_SCHEMA.recommended) {
    if (!env[key]) {
      warnings.push(`Missing recommended variable: ${key}`);
      console.log(`⚠ ${key}: not set`);
    } else {
      console.log(`✓ ${key}: ${env[key]}`);
    }
  }

  // 4. 型チェック
  console.log("\n--- Type Validation ---");
  for (const [key, typeSpec] of Object.entries(ENV_SCHEMA.types)) {
    if (env[key]) {
      const result = validateType(key, env[key], typeSpec);
      if (!result.valid) {
        errors.push(result.message);
        console.log(`✗ ${key}: ${result.message}`);
      } else {
        console.log(`✓ ${key}: valid ${typeSpec}`);
      }
    }
  }

  // 5. 最小長チェック
  console.log("\n--- Length Validation ---");
  for (const [key, minLength] of Object.entries(ENV_SCHEMA.minLength)) {
    if (env[key]) {
      const result = validateMinLength(key, env[key], minLength);
      if (!result.valid) {
        errors.push(result.message);
        console.log(`✗ ${key}: ${result.message}`);
      } else {
        console.log(`✓ ${key}: length OK (>= ${minLength})`);
      }
    }
  }

  // 結果サマリー
  console.log("\n=== Validation Summary ===");
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log("\n❌ Validation FAILED:");
    errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(EXIT_ERROR);
  }

  if (warnings.length > 0 && strictMode) {
    console.log("\n⚠ Validation FAILED (strict mode):");
    warnings.forEach((w) => console.log(`  - ${w}`));
    process.exit(EXIT_ERROR);
  }

  console.log("\n✅ Validation PASSED");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
