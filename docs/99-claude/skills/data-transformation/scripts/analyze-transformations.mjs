#!/usr/bin/env node

/**
 * データ変換パターン分析スクリプト
 *
 * 使用法:
 *   node analyze-transformations.mjs <file|directory>
 */

import fs from "fs";
import path from "path";

const patterns = {
  mapping: /map\s*\(|reduce\s*\(|filter\s*\(|transform/i,
  schema: /schema|mapping|serialize|deserialize/i,
  validation: /validate|safeParse|zod|ajv/i,
  etl: /extract|transform|load|etl/i,
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const results = {
    file: filePath,
    mapping: patterns.mapping.test(content),
    schema: patterns.schema.test(content),
    validation: patterns.validation.test(content),
    etl: patterns.etl.test(content),
  };
  return results;
}

function analyzeDirectory(dirPath) {
  const results = [];
  const files = fs.readdirSync(dirPath, { recursive: true });

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile()) {
      results.push(analyzeFile(filePath));
    }
  }

  return results;
}

const target = process.argv[2];
if (!target) {
  console.log("使用法: node analyze-transformations.mjs <file|directory>");
  process.exit(1);
}

const targetPath = path.resolve(target);
if (!fs.existsSync(targetPath)) {
  console.error(`ファイルまたはディレクトリが見つかりません: ${targetPath}`);
  process.exit(1);
}

const isDirectory = fs.statSync(targetPath).isDirectory();
const results = isDirectory
  ? analyzeDirectory(targetPath)
  : [analyzeFile(targetPath)];

console.log("\n🔍 変換パターン分析レポート");
console.log("═".repeat(50));

for (const result of results) {
  console.log(`\n📁 ${result.file}`);
  console.log(`  マッピング処理: ${result.mapping ? "あり" : "なし"}`);
  console.log(`  スキーマ処理: ${result.schema ? "あり" : "なし"}`);
  console.log(`  バリデーション: ${result.validation ? "あり" : "なし"}`);
  console.log(`  ETL用語: ${result.etl ? "あり" : "なし"}`);
}
