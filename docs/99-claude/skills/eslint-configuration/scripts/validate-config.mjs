#!/usr/bin/env node
/**
 * ESLint設定ファイルの構文検証スクリプト
 * Usage: node validate-config.mjs <eslintrc-file>
 */

import { readFile } from "fs/promises";
import { resolve } from "path";

async function validateESLintConfig(configPath) {
  try {
    const absolutePath = resolve(configPath);
    const content = await readFile(absolutePath, "utf-8");

    // JSON構文チェック
    let config;
    try {
      config = JSON.parse(content);
    } catch (parseError) {
      console.error("❌ JSON syntax error:", parseError.message);
      process.exit(1);
    }

    // 必須フィールドチェック
    const warnings = [];
    const errors = [];

    if (!config.extends && !config.rules) {
      errors.push('Missing "extends" or "rules" field');
    }

    if (
      config.parser &&
      !["@typescript-eslint/parser", "@babel/eslint-parser"].includes(
        config.parser,
      )
    ) {
      warnings.push(`Unusual parser: ${config.parser}`);
    }

    // Prettier競合チェック
    const conflictRules = [
      "indent",
      "quotes",
      "semi",
      "max-len",
      "comma-dangle",
    ];
    const activeConflicts = conflictRules.filter(
      (rule) =>
        config.rules && config.rules[rule] && config.rules[rule] !== "off",
    );

    if (
      activeConflicts.length > 0 &&
      (!config.extends || !config.extends.includes("prettier"))
    ) {
      warnings.push(
        `Potential Prettier conflicts: ${activeConflicts.join(", ")}`,
      );
      warnings.push('Consider adding "prettier" to extends array');
    }

    // 結果出力
    if (errors.length > 0) {
      console.error("❌ Validation failed:");
      errors.forEach((err) => console.error(`  - ${err}`));
      process.exit(1);
    }

    if (warnings.length > 0) {
      console.warn("⚠️  Warnings:");
      warnings.forEach((warn) => console.warn(`  - ${warn}`));
    }

    console.log("✅ ESLint config is valid");

    // 設定サマリー
    console.log("\n📊 Configuration summary:");
    console.log(`  Parser: ${config.parser || "default (Espree)"}`);
    console.log(
      `  Extends: ${config.extends ? config.extends.join(", ") : "none"}`,
    );
    console.log(
      `  Plugins: ${config.plugins ? config.plugins.join(", ") : "none"}`,
    );
    console.log(
      `  Custom rules: ${config.rules ? Object.keys(config.rules).length : 0}`,
    );
  } catch (error) {
    console.error("❌ Error reading config file:", error.message);
    process.exit(1);
  }
}

// CLI実行
const configPath = process.argv[2];
if (!configPath) {
  console.error("Usage: node validate-config.mjs <eslintrc-file>");
  process.exit(1);
}

validateESLintConfig(configPath);
