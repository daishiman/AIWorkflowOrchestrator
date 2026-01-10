#!/usr/bin/env node
/**
 * output-formatting フォーマット検証スクリプト
 *
 * 使用方法:
 *   node scripts/validate-format.mjs <file> [--format json|yaml|markdown]
 */

import { readFileSync, existsSync } from "fs";

function validateJSON(content) {
  try {
    JSON.parse(content);
    return { valid: true, errors: [] };
  } catch (e) {
    return { valid: false, errors: [e.message] };
  }
}

function validateYAML(content) {
  const errors = [];

  // 基本的なYAML構文チェック
  const lines = content.split("\n");
  let indentStack = [0];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) continue;

    const indent = line.match(/^(\s*)/)[1].length;

    // タブとスペースの混在チェック
    if (line.match(/^\t+ /) || line.match(/^ +\t/)) {
      errors.push(`Line ${i + 1}: タブとスペースが混在しています`);
    }

    // 不正なインデント検出（奇数スペース）
    if (indent % 2 !== 0 && indent > 0) {
      errors.push(`Line ${i + 1}: インデントが不均一です（${indent}スペース）`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateMarkdown(content) {
  const errors = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 見出しの後にスペースがあるか
    if (line.match(/^#+[^# ]/)) {
      errors.push(`Line ${i + 1}: 見出し記号の後にスペースが必要です`);
    }

    // 閉じられていないコードブロック検出
    const codeBlocks = content.match(/```/g);
    if (codeBlocks && codeBlocks.length % 2 !== 0) {
      errors.push(`コードブロックが閉じられていません`);
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "使用方法: node validate-format.mjs <file> [--format json|yaml|markdown]",
    );
    process.exit(1);
  }

  const filePath = args[0];
  let format = args.includes("--format")
    ? args[args.indexOf("--format") + 1]
    : null;

  if (!existsSync(filePath)) {
    console.error(`ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");

  // 形式の自動検出
  if (!format) {
    if (filePath.endsWith(".json")) format = "json";
    else if (filePath.endsWith(".yaml") || filePath.endsWith(".yml"))
      format = "yaml";
    else if (filePath.endsWith(".md")) format = "markdown";
    else format = "markdown"; // デフォルト
  }

  let result;
  switch (format) {
    case "json":
      result = validateJSON(content);
      break;
    case "yaml":
      result = validateYAML(content);
      break;
    case "markdown":
      result = validateMarkdown(content);
      break;
    default:
      console.error(`不明な形式: ${format}`);
      process.exit(1);
  }

  if (result.valid) {
    console.log(`✓ ${format.toUpperCase()} 検証成功: ${filePath}`);
    process.exit(0);
  } else {
    console.log(`✗ ${format.toUpperCase()} 検証失敗: ${filePath}`);
    result.errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
}

main();
