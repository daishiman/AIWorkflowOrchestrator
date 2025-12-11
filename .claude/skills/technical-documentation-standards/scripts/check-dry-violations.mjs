#!/usr/bin/env node
/**
 * DRY違反検出スクリプト
 *
 * 使用方法:
 *   node check-dry-violations.mjs <directory>
 *
 * 機能:
 *   - 指定ディレクトリ内のMarkdownファイルを走査
 *   - 重複するフレーズを検出
 *   - 共通化の提案を出力
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, basename, relative } from "path";

const MIN_PHRASE_LENGTH = 20;
const MIN_OCCURRENCES = 2;

function getAllMarkdownFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && !entry.startsWith(".")) {
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractPhrases(content, minLength) {
  const phrases = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // コードブロック内はスキップ
    if (line.startsWith("```") || line.startsWith("    ")) continue;
    // 見出しはスキップ
    if (line.startsWith("#")) continue;

    // 意味のあるフレーズを抽出
    const trimmed = line.trim();
    if (trimmed.length >= minLength) {
      phrases.push(trimmed);
    }
  }

  return phrases;
}

function findDuplicates(files, baseDir) {
  const phraseLocations = new Map();

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const phrases = extractPhrases(content, MIN_PHRASE_LENGTH);
    const relativePath = relative(baseDir, file);

    for (const phrase of phrases) {
      if (!phraseLocations.has(phrase)) {
        phraseLocations.set(phrase, []);
      }
      const locations = phraseLocations.get(phrase);
      if (!locations.includes(relativePath)) {
        locations.push(relativePath);
      }
    }
  }

  // 重複のみ抽出
  const duplicates = [];
  for (const [phrase, locations] of phraseLocations) {
    if (locations.length >= MIN_OCCURRENCES) {
      duplicates.push({ phrase, locations, count: locations.length });
    }
  }

  // 重複回数でソート
  duplicates.sort((a, b) => b.count - a.count);

  return duplicates;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node check-dry-violations.mjs <directory>");
    process.exit(1);
  }

  const targetDir = args[0];
  let files;

  try {
    files = getAllMarkdownFiles(targetDir);
  } catch (error) {
    console.error(`ディレクトリを読み込めません: ${targetDir}`);
    process.exit(1);
  }

  console.log(`\n📋 DRY違反検出レポート`);
  console.log(`${"=".repeat(50)}\n`);
  console.log(`対象ディレクトリ: ${targetDir}`);
  console.log(`検出ファイル数: ${files.length}件\n`);

  const duplicates = findDuplicates(files, targetDir);

  if (duplicates.length === 0) {
    console.log("✅ DRY違反は検出されませんでした");
    process.exit(0);
  }

  console.log(`⚠️  重複フレーズ: ${duplicates.length}件検出\n`);

  duplicates.slice(0, 10).forEach((dup, index) => {
    console.log(
      `${index + 1}. "${dup.phrase.substring(0, 60)}${dup.phrase.length > 60 ? "..." : ""}"`,
    );
    console.log(`   出現回数: ${dup.count}回`);
    console.log(`   ファイル:`);
    dup.locations.forEach((loc) => {
      console.log(`     - ${loc}`);
    });
    console.log("");
  });

  if (duplicates.length > 10) {
    console.log(`... 他 ${duplicates.length - 10}件`);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(
    `💡 提案: 重複フレーズを common/ ディレクトリに共通化し、参照に置き換えてください`,
  );

  process.exit(duplicates.length > 0 ? 1 : 0);
}

main();
