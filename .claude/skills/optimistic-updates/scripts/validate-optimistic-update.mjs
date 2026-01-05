#!/usr/bin/env node
/**
 * optimistic-updates 実装検証スクリプト
 *
 * 楽観的更新の実装が必要な要素を含んでいるかチェックします。
 *
 * 使用方法:
 *   node scripts/validate-optimistic-update.mjs <file.ts>
 */

import { readFileSync, existsSync } from "fs";

const REQUIRED_PATTERNS = {
  reactQuery: {
    name: "React Query楽観的更新",
    patterns: [
      { regex: /onMutate/g, description: "onMutateフック" },
      { regex: /onError.*context/g, description: "onErrorでのロールバック" },
      { regex: /onSettled/g, description: "onSettledでの再検証" },
      { regex: /cancelQueries/g, description: "既存クエリのキャンセル" },
      { regex: /setQueryData/g, description: "楽観的データ更新" },
    ],
  },
  swr: {
    name: "SWR楽観的更新",
    patterns: [
      { regex: /optimisticData/g, description: "optimisticDataオプション" },
      { regex: /rollbackOnError/g, description: "rollbackOnErrorオプション" },
      { regex: /mutate\s*\(/g, description: "mutate関数" },
    ],
  },
};

function analyzeFile(content) {
  const results = {
    reactQuery: { found: [], missing: [] },
    swr: { found: [], missing: [] },
  };

  // React Query パターン検出
  for (const pattern of REQUIRED_PATTERNS.reactQuery.patterns) {
    if (pattern.regex.test(content)) {
      results.reactQuery.found.push(pattern.description);
    } else {
      results.reactQuery.missing.push(pattern.description);
    }
  }

  // SWR パターン検出
  for (const pattern of REQUIRED_PATTERNS.swr.patterns) {
    if (pattern.regex.test(content)) {
      results.swr.found.push(pattern.description);
    } else {
      results.swr.missing.push(pattern.description);
    }
  }

  return results;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node validate-optimistic-update.mjs <file.ts>");
    console.log("\n楽観的更新の実装パターンを検証します:");
    console.log(
      "- React Query: onMutate, onError, onSettled, cancelQueries, setQueryData",
    );
    console.log("- SWR: optimisticData, rollbackOnError, mutate");
    process.exit(0);
  }

  const filePath = args[0];

  if (!existsSync(filePath)) {
    console.error(`ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const results = analyzeFile(content);

  // 結果表示
  console.log(`\n楽観的更新パターン検証: ${filePath}\n`);

  // React Query
  const rqFound = results.reactQuery.found.length;
  const rqTotal = REQUIRED_PATTERNS.reactQuery.patterns.length;
  if (rqFound > 0) {
    console.log(`📦 React Query (${rqFound}/${rqTotal} 検出):`);
    results.reactQuery.found.forEach((p) => console.log(`  ✓ ${p}`));
    results.reactQuery.missing.forEach((p) => console.log(`  ✗ ${p} (不足)`));
  }

  // SWR
  const swrFound = results.swr.found.length;
  const swrTotal = REQUIRED_PATTERNS.swr.patterns.length;
  if (swrFound > 0) {
    console.log(`📦 SWR (${swrFound}/${swrTotal} 検出):`);
    results.swr.found.forEach((p) => console.log(`  ✓ ${p}`));
    results.swr.missing.forEach((p) => console.log(`  ✗ ${p} (不足)`));
  }

  if (rqFound === 0 && swrFound === 0) {
    console.log("⚠ 楽観的更新のパターンが検出されませんでした");
    process.exit(1);
  }

  // 完全性チェック
  if (rqFound === rqTotal || swrFound === swrTotal) {
    console.log("\n✓ 楽観的更新の実装は完全です");
    process.exit(0);
  } else {
    console.log("\n⚠ 一部のパターンが不足しています");
    process.exit(0);
  }
}

main();
