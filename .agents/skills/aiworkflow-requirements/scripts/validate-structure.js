#!/usr/bin/env node
/**
 * 構造検証スクリプト
 *
 * 用途: スキル構造の整合性を検証
 * 実行: node scripts/validate-structure.js
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dirname, "..");

// 検証設定
const CONFIG = {
  requiredDirs: ["references", "scripts", "indexes"],
  requiredFiles: ["SKILL.md"],
  refsMinCount: 20,
  maxLinesPerFile: 500,
  indexesFiles: ["topic-map.md", "keywords.json"],
};

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
};

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function validateStructure() {
  console.log("🔍 スキル構造検証\n");

  const errors = [];
  const warnings = [];

  // 1. 必須ディレクトリ確認
  console.log("1. ディレクトリ構造...");
  for (const dir of CONFIG.requiredDirs) {
    const dirPath = join(SKILL_ROOT, dir);
    if (await exists(dirPath)) {
      console.log(`   ${colors.green}✅${colors.reset} ${dir}/`);
    } else {
      errors.push(`必須ディレクトリ不在: ${dir}/`);
      console.log(`   ${colors.red}❌${colors.reset} ${dir}/ が見つかりません`);
    }
  }

  // 2. 必須ファイル確認
  console.log("\n2. 必須ファイル...");
  for (const file of CONFIG.requiredFiles) {
    const filePath = join(SKILL_ROOT, file);
    if (await exists(filePath)) {
      const content = await readFile(filePath, "utf-8");
      const lines = content.split("\n").length;
      console.log(`   ${colors.green}✅${colors.reset} ${file} (${lines}行)`);
    } else {
      errors.push(`必須ファイル不在: ${file}`);
      console.log(`   ${colors.red}❌${colors.reset} ${file} が見つかりません`);
    }
  }

  // 3. references/の内容確認
  console.log("\n3. references/の内容...");
  const refsDir = join(SKILL_ROOT, "references");
  if (await exists(refsDir)) {
    const refsFiles = await readdir(refsDir);
    const mdFiles = refsFiles.filter((f) => f.endsWith(".md"));

    if (mdFiles.length >= CONFIG.refsMinCount) {
      console.log(
        `   ${colors.green}✅${colors.reset} ${mdFiles.length}ファイル`,
      );
    } else {
      warnings.push(
        `references/のファイル数が少ない: ${mdFiles.length}/${CONFIG.refsMinCount}`,
      );
      console.log(
        `   ${colors.yellow}⚠️${colors.reset} ${mdFiles.length}ファイル (推奨: ${CONFIG.refsMinCount}以上)`,
      );
    }

    // 総行数計算 & 500行超えチェック
    let totalLines = 0;
    const oversizedFiles = [];
    for (const file of mdFiles) {
      const content = await readFile(join(refsDir, file), "utf-8");
      const lines = content.split("\n").length;
      totalLines += lines;
      if (lines > CONFIG.maxLinesPerFile) {
        oversizedFiles.push({ file, lines });
      }
    }
    console.log(`   📊 総行数: ${totalLines.toLocaleString()}行`);

    if (oversizedFiles.length > 0) {
      console.log(
        `   ${colors.yellow}⚠️${colors.reset} ${oversizedFiles.length}ファイルが500行超:`,
      );
      for (const { file, lines } of oversizedFiles.slice(0, 5)) {
        console.log(`      - ${file} (${lines}行)`);
        warnings.push(`ファイルサイズ超過: ${file} (${lines}行)`);
      }
    }

    // 命名規則チェック
    const invalidNames = mdFiles.filter((f) => /^\d+-/.test(f));
    if (invalidNames.length > 0) {
      console.log(`   ${colors.yellow}⚠️${colors.reset} 番号付きファイル名:`);
      for (const file of invalidNames.slice(0, 5)) {
        console.log(`      - ${file}`);
        warnings.push(`番号付きファイル名: ${file}`);
      }
    }
  }

  // 4. indexes/の内容確認
  console.log("\n4. indexes/の内容...");
  const indexesDir = join(SKILL_ROOT, "indexes");
  if (await exists(indexesDir)) {
    for (const file of CONFIG.indexesFiles) {
      const filePath = join(indexesDir, file);
      if (await exists(filePath)) {
        console.log(`   ${colors.green}✅${colors.reset} ${file}`);
      } else {
        warnings.push(`インデックスファイル不在: indexes/${file}`);
        console.log(
          `   ${colors.yellow}⚠️${colors.reset} ${file} が見つかりません`,
        );
      }
    }
  }

  // 5. scripts/の内容確認
  console.log("\n5. scripts/の内容...");
  const scriptsDir = join(SKILL_ROOT, "scripts");
  if (await exists(scriptsDir)) {
    const scriptFiles = await readdir(scriptsDir);
    const jsFiles = scriptFiles.filter((f) => f.endsWith(".js"));
    console.log(`   📊 ${jsFiles.length}スクリプト: ${jsFiles.join(", ")}`);
  }

  // 結果出力
  console.log("\n" + "─".repeat(40));
  if (errors.length === 0 && warnings.length === 0) {
    console.log(
      `${colors.green}✅ すべての検証に合格しました${colors.reset}\n`,
    );
    return 0;
  }

  if (errors.length > 0) {
    console.log(
      `\n${colors.red}❌ エラー (${errors.length}件):${colors.reset}`,
    );
    errors.forEach((e) => console.log(`   - ${e}`));
  }

  if (warnings.length > 0) {
    console.log(
      `\n${colors.yellow}⚠️ 警告 (${warnings.length}件):${colors.reset}`,
    );
    warnings.forEach((w) => console.log(`   - ${w}`));
  }

  console.log("");
  return errors.length > 0 ? 1 : 0;
}

validateStructure()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error("エラー:", err.message);
    process.exit(1);
  });
