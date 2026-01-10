#!/usr/bin/env node
/**
 * Prettierフォーマット検証スクリプト
 *
 * 用途: プロジェクト全体のフォーマット適用状態を検証
 * 実行: node format-check.mjs [directory]
 * 出力: フォーマット違反ファイル一覧、統計情報
 */

import { execSync } from "child_process";
import { resolve } from "path";

async function checkFormatting(targetDir = ".") {
  const absolutePath = resolve(targetDir);

  console.log("🔍 Prettier Format Check\n");
  console.log(`Target: ${absolutePath}\n`);

  try {
    // Prettier --check実行
    const command = `prettier --check "${absolutePath}/**/*.{ts,tsx,js,jsx,json,md,yml,yaml,css,scss}"`;

    try {
      execSync(command, { encoding: "utf-8", stdio: "pipe" });

      // すべてフォーマット済み
      console.log("✅ All files are formatted correctly\n");
      console.log("📊 Statistics:");
      console.log("  Format compliance: 100%");
      console.log("  Violations: 0");

      process.exit(0);
    } catch (error) {
      // フォーマット違反あり
      const output = error.stdout || "";
      const violations = output
        .split("\n")
        .filter((line) => line.trim().length > 0);

      console.error("❌ Format violations detected\n");
      console.error("📋 Files needing formatting:");
      violations.forEach((file) => {
        if (file.trim()) {
          console.error(`  - ${file}`);
        }
      });

      console.error(`\n📊 Statistics:`);
      console.error(`  Violations: ${violations.length}`);

      console.error(`\n💡 To fix:`);
      console.error(`  pnpm format`);
      console.error(`  # or`);
      console.error(
        `  prettier --write "${targetDir}/**/*.{ts,tsx,js,jsx,json,md}"`,
      );

      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// CLI実行
const targetDir = process.argv[2] || ".";
checkFormatting(targetDir);
