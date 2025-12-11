#!/usr/bin/env node

/**
 * React Hooks使用状況分析スクリプト
 *
 * 使用方法:
 *   node analyze-hooks-usage.mjs <file.tsx>
 *
 * 機能:
 *   - useState, useEffect, useCallback, useMemo, useReducerの使用を検出
 *   - 依存配列の問題を検出
 *   - メモ化の過不足を検出
 */

import { readFile } from "fs/promises";
import { resolve } from "path";

const HOOKS_PATTERNS = {
  useState: /useState\s*(<[^>]+>)?\s*\(/g,
  useEffect:
    /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\},\s*\[([\s\S]*?)\]\s*\)/g,
  useCallback: /useCallback\s*\(\s*[\s\S]*?,\s*\[([\s\S]*?)\]\s*\)/g,
  useMemo: /useMemo\s*\(\s*\(\)\s*=>\s*[\s\S]*?,\s*\[([\s\S]*?)\]\s*\)/g,
  useReducer: /useReducer\s*\(/g,
  useRef: /useRef\s*(<[^>]+>)?\s*\(/g,
  useContext: /useContext\s*\(/g,
};

const WARNING_PATTERNS = [
  {
    name: "Empty dependency array without comment",
    pattern: /useEffect\s*\([^)]+,\s*\[\]\s*\)(?!\s*\/\/)/g,
    message: "空の依存配列には意図をコメントで明記してください",
  },
  {
    name: "Missing dependency array",
    pattern: /useEffect\s*\([^,]+\)(?!\s*,)/g,
    message: "useEffectに依存配列がありません（毎レンダリング実行）",
  },
  {
    name: "Object in dependency",
    pattern: /\[\s*\{[^}]+\}\s*\]/g,
    message: "依存配列にオブジェクトリテラルがあります（無限ループの原因）",
  },
];

async function analyzeFile(filePath) {
  const absolutePath = resolve(process.cwd(), filePath);
  const content = await readFile(absolutePath, "utf-8");

  console.log(`\n📊 Hooks使用状況分析: ${filePath}\n`);
  console.log("=".repeat(60));

  // Hooksの使用回数をカウント
  console.log("\n📌 Hooks使用状況:\n");

  let totalHooks = 0;
  for (const [hookName, pattern] of Object.entries(HOOKS_PATTERNS)) {
    const matches = content.match(pattern);
    const count = matches ? matches.length : 0;
    totalHooks += count;

    if (count > 0) {
      console.log(`  ${hookName}: ${count}回`);
    }
  }

  if (totalHooks === 0) {
    console.log("  （Hooksは使用されていません）");
  }

  // 警告パターンをチェック
  console.log("\n⚠️  潜在的な問題:\n");

  let warningCount = 0;
  for (const { name, pattern, message } of WARNING_PATTERNS) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      warningCount += matches.length;
      console.log(`  [${name}]`);
      console.log(`    ${message}`);
      console.log(`    検出数: ${matches.length}件\n`);
    }
  }

  if (warningCount === 0) {
    console.log("  （警告はありません）");
  }

  // サマリー
  console.log("\n" + "=".repeat(60));
  console.log(`\n📈 サマリー:`);
  console.log(`  - 総Hooks使用数: ${totalHooks}`);
  console.log(`  - 警告数: ${warningCount}`);

  // 推奨事項
  if (warningCount > 0) {
    console.log("\n💡 推奨事項:");
    console.log("  - ESLint react-hooks/exhaustive-deps を有効にしてください");
    console.log("  - 空の依存配列には意図をコメントで明記してください");
    console.log(
      "  - オブジェクトはuseMemoでメモ化するか、プリミティブに分解してください",
    );
  }

  console.log("\n");

  return {
    totalHooks,
    warningCount,
  };
}

// メイン処理
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
使用方法: node analyze-hooks-usage.mjs <file.tsx>

例:
  node analyze-hooks-usage.mjs src/components/UserProfile.tsx
  node analyze-hooks-usage.mjs src/hooks/useAuth.ts
`);
  process.exit(1);
}

try {
  await analyzeFile(args[0]);
} catch (error) {
  console.error(`エラー: ${error.message}`);
  process.exit(1);
}
