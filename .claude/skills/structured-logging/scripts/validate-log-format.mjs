#!/usr/bin/env node
/**
 * ログフォーマット検証スクリプト
 *
 * 用途: ログファイルが構造化ログの仕様に準拠しているかを検証
 * 使用例: node validate-log-format.mjs <log-file.json>
 */

import fs from "fs";
import path from "path";

// 必須フィールドの定義
const REQUIRED_FIELDS = [
  "timestamp",
  "level",
  "message",
  "service",
  "environment",
];
const VALID_LOG_LEVELS = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

// ログエントリの検証
function validateLogEntry(entry, lineNumber) {
  const errors = [];

  // 必須フィールドのチェック
  for (const field of REQUIRED_FIELDS) {
    if (!(field in entry)) {
      errors.push(`Line ${lineNumber}: Missing required field "${field}"`);
    }
  }

  // ログレベルの検証
  if (entry.level && !VALID_LOG_LEVELS.includes(entry.level)) {
    errors.push(
      `Line ${lineNumber}: Invalid log level "${entry.level}". Must be one of: ${VALID_LOG_LEVELS.join(", ")}`,
    );
  }

  // タイムスタンプ形式の検証（ISO8601）
  if (entry.timestamp) {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!iso8601Regex.test(entry.timestamp)) {
      errors.push(
        `Line ${lineNumber}: Invalid timestamp format "${entry.timestamp}". Expected ISO8601 format.`,
      );
    }
  }

  // エラーログの場合、errorフィールドの検証
  if (entry.level === "ERROR" || entry.level === "FATAL") {
    if (!entry.error) {
      errors.push(
        `Line ${lineNumber}: ERROR/FATAL logs must include "error" field`,
      );
    } else {
      if (!entry.error.type) {
        errors.push(`Line ${lineNumber}: error.type is required`);
      }
      if (!entry.error.message) {
        errors.push(`Line ${lineNumber}: error.message is required`);
      }
    }
  }

  // PIIマスキングの警告チェック（簡易版）
  const warnings = [];
  const piiPatterns = [
    { pattern: /password/i, message: "Possible password field detected" },
    {
      pattern: /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      message: "Possible unmasked email detected",
    },
    {
      pattern: /\b\d{3}-\d{3}-\d{4}\b/,
      message: "Possible unmasked phone number detected",
    },
    { pattern: /\b\d{16}\b/, message: "Possible credit card number detected" },
  ];

  const jsonString = JSON.stringify(entry);
  for (const { pattern, message } of piiPatterns) {
    if (pattern.test(jsonString)) {
      warnings.push(`Line ${lineNumber}: ${message}`);
    }
  }

  return { errors, warnings };
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node validate-log-format.mjs <log-file.jsonl>");
    process.exit(1);
  }

  const logFilePath = path.resolve(args[0]);

  if (!fs.existsSync(logFilePath)) {
    console.error(`Error: File not found: ${logFilePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(logFilePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  let totalErrors = 0;
  let totalWarnings = 0;

  console.log(`\n📋 Validating log file: ${logFilePath}`);
  console.log(`📊 Total log entries: ${lines.length}\n`);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    try {
      const entry = JSON.parse(line);
      const { errors, warnings } = validateLogEntry(entry, lineNumber);

      if (errors.length > 0) {
        errors.forEach((err) => console.error(`❌ ${err}`));
        totalErrors += errors.length;
      }

      if (warnings.length > 0) {
        warnings.forEach((warn) => console.warn(`⚠️  ${warn}`));
        totalWarnings += warnings.length;
      }
    } catch (error) {
      console.error(`❌ Line ${lineNumber}: Invalid JSON - ${error.message}`);
      totalErrors++;
    }
  });

  // サマリー出力
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Validation Summary:`);
  console.log(`   Total entries: ${lines.length}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);
  console.log(`${"=".repeat(60)}\n`);

  if (totalErrors > 0) {
    console.error("❌ Validation failed. Please fix the errors above.");
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.warn("⚠️  Validation passed with warnings. Review recommended.");
    process.exit(0);
  } else {
    console.log("✅ Validation passed. All logs are compliant.");
    process.exit(0);
  }
}

main();
