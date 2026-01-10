#!/usr/bin/env node

/**
 * テストダブル分析スクリプト
 *
 * テストファイルからテストダブルの使用状況を分析し、
 * 適切な使い分けができているかを検証します。
 *
 * Usage:
 *   node test-double-analyzer.mjs <test-file>
 *   node test-double-analyzer.mjs src/__tests__/user-service.test.ts
 */

import { readFileSync, existsSync } from "fs";
import { basename } from "path";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: node test-double-analyzer.mjs <test-file>");
  console.log(
    "Example: node test-double-analyzer.mjs src/__tests__/user-service.test.ts",
  );
  process.exit(1);
}

const testFilePath = args[0];

if (!existsSync(testFilePath)) {
  console.error(`Error: File not found: ${testFilePath}`);
  process.exit(1);
}

const content = readFileSync(testFilePath, "utf-8");

// テストダブルの検出
const testDoubles = {
  mock: [],
  stub: [],
  spy: [],
  fake: [],
  dummy: [],
};

const analysis = {
  passed: [],
  warnings: [],
  suggestions: [],
};

// Mock検出（振る舞い検証）
const mockPatterns =
  content.match(/vi\.fn\(\)|jest\.fn\(\)|sinon\.mock|\.mock\(/g) || [];
const verifyPatterns =
  content.match(
    /toHaveBeenCalled|toHaveBeenCalledWith|toHaveBeenCalledTimes|\.verify\(/g,
  ) || [];

if (mockPatterns.length > 0) {
  testDoubles.mock = mockPatterns;
  if (verifyPatterns.length > 0) {
    analysis.passed.push(
      `✅ Mock使用 (${mockPatterns.length}個) + 振る舞い検証あり`,
    );
  } else {
    analysis.warnings.push(
      `⚠️ Mock使用 (${mockPatterns.length}個) だが振る舞い検証なし → Stubの方が適切かも`,
    );
  }
}

// Stub検出（戻り値の固定）
const stubPatterns =
  content.match(
    /mockReturnValue|mockResolvedValue|mockRejectedValue|\.returns\(|\.resolves\(/g,
  ) || [];
if (stubPatterns.length > 0) {
  testDoubles.stub = stubPatterns;
  analysis.passed.push(`✅ Stub使用 (${stubPatterns.length}個) - 戻り値の固定`);
}

// Spy検出（実際の実装 + 監視）
const spyPatterns = content.match(/vi\.spyOn|jest\.spyOn|sinon\.spy/g) || [];
if (spyPatterns.length > 0) {
  testDoubles.spy = spyPatterns;
  analysis.passed.push(
    `✅ Spy使用 (${spyPatterns.length}個) - 実装を保持しつつ監視`,
  );
}

// vi.mock検出（モジュールモック）
const moduleMockPatterns = content.match(/vi\.mock\(['"`][^'"`]+['"`]/g) || [];
if (moduleMockPatterns.length > 0) {
  analysis.passed.push(
    `✅ モジュールモック使用 (${moduleMockPatterns.length}個)`,
  );

  // 過度なモジュールモック警告
  if (moduleMockPatterns.length > 5) {
    analysis.warnings.push(
      `⚠️ モジュールモックが多い (${moduleMockPatterns.length}個) - テスト対象の責務が大きすぎる可能性`,
    );
  }
}

// 検証パターンの分析
const stateVerification =
  content.match(/toBe\(|toEqual\(|toContain\(|toHaveProperty\(/g) || [];
const behaviorVerification = verifyPatterns;

if (stateVerification.length > 0 && behaviorVerification.length > 0) {
  analysis.passed.push("✅ 状態検証と振る舞い検証を併用");
} else if (stateVerification.length > 0) {
  analysis.passed.push("✅ 状態検証を使用（Classic TDDスタイル）");
} else if (behaviorVerification.length > 0) {
  analysis.passed.push("✅ 振る舞い検証を使用（Mockistスタイル）");
}

// mockClear/mockReset/mockRestoreの使用チェック
const resetPatterns =
  content.match(
    /mockClear|mockReset|mockRestore|clearAllMocks|resetAllMocks|restoreAllMocks/g,
  ) || [];
if (mockPatterns.length > 0 && resetPatterns.length === 0) {
  analysis.warnings.push("⚠️ モック使用時はbeforeEach/afterEachでリセット推奨");
} else if (resetPatterns.length > 0) {
  analysis.passed.push("✅ モックリセットを実施");
}

// テストダブルなしのテスト
const totalDoubles =
  mockPatterns.length + stubPatterns.length + spyPatterns.length;
if (totalDoubles === 0) {
  analysis.suggestions.push(
    "💡 テストダブルなし - 純粋関数/ユニットテストまたは統合テスト",
  );
}

// 過度なモッキング警告
if (totalDoubles > 15) {
  analysis.warnings.push(
    `⚠️ テストダブルが多い (${totalDoubles}個) - テスト対象を分割することを検討`,
  );
}

// 結果出力
console.log("\n=== テストダブル分析結果 ===\n");
console.log(`ファイル: ${basename(testFilePath)}\n`);

console.log("【検出されたテストダブル】");
console.log(`  Mock: ${mockPatterns.length}個`);
console.log(`  Stub: ${stubPatterns.length}個`);
console.log(`  Spy:  ${spyPatterns.length}個`);
console.log(`  合計: ${totalDoubles}個\n`);

if (analysis.passed.length > 0) {
  console.log("【良い点】");
  analysis.passed.forEach((msg) => console.log(`  ${msg}`));
}

if (analysis.warnings.length > 0) {
  console.log("\n【警告】");
  analysis.warnings.forEach((msg) => console.log(`  ${msg}`));
}

if (analysis.suggestions.length > 0) {
  console.log("\n【提案】");
  analysis.suggestions.forEach((msg) => console.log(`  ${msg}`));
}

// 推奨ガイドライン
console.log("\n【テストダブル選択ガイド】");
console.log("  Dummy: 引数を埋めるだけ（使用されない）");
console.log("  Stub:  固定値を返す（状態検証向け）");
console.log("  Spy:   実装を保持して呼び出しを監視");
console.log("  Mock:  期待する呼び出しを事前定義（振る舞い検証向け）");
console.log("  Fake:  簡略化された実装（インメモリDBなど）");

// スコア
const score =
  analysis.passed.length > 0
    ? Math.round(
        (analysis.passed.length /
          (analysis.passed.length + analysis.warnings.length)) *
          100,
      )
    : 0;

console.log(`\n【スコア】 ${score}%`);

process.exit(analysis.warnings.length > 3 ? 1 : 0);
