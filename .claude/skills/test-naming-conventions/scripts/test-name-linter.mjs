#!/usr/bin/env node

/**
 * テスト命名規則チェッカー
 *
 * テストファイルの命名規則をチェックし、改善提案を行います。
 *
 * Usage:
 *   node test-name-linter.mjs <test-file>
 *   node test-name-linter.mjs src/__tests__/user-service.test.ts
 */

import { readFileSync, existsSync } from "fs";
import { basename, dirname } from "path";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: node test-name-linter.mjs <test-file>");
  console.log(
    "Example: node test-name-linter.mjs src/__tests__/user-service.test.ts",
  );
  process.exit(1);
}

const testFilePath = args[0];

if (!existsSync(testFilePath)) {
  console.error(`Error: File not found: ${testFilePath}`);
  process.exit(1);
}

const content = readFileSync(testFilePath, "utf-8");

const analysis = {
  passed: [],
  warnings: [],
  failed: [],
  suggestions: [],
};

// ファイル名チェック
const fileName = basename(testFilePath);
const validFilePatterns = [
  ".test.ts",
  ".test.tsx",
  ".test.js",
  ".test.jsx",
  ".spec.ts",
  ".spec.tsx",
  ".spec.js",
  ".spec.jsx",
];

if (validFilePatterns.some((pattern) => fileName.endsWith(pattern))) {
  analysis.passed.push(`✅ ファイル名: ${fileName} は命名規則に準拠`);
} else {
  analysis.failed.push(`❌ ファイル名は .test.ts または .spec.ts で終わるべき`);
}

// ディレクトリチェック
const dirName = dirname(testFilePath);
if (
  dirName.includes("__tests__") ||
  dirName.includes("tests") ||
  dirName.includes("test")
) {
  analysis.passed.push(`✅ ディレクトリ: テスト用ディレクトリに配置`);
} else {
  analysis.warnings.push(
    `⚠️ __tests__/ または tests/ ディレクトリへの配置を推奨`,
  );
}

// describe ブロック抽出
const describeMatches =
  content.match(/describe\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
const describeNames = describeMatches.map((match) => {
  const m = match.match(/['"`]([^'"`]+)['"`]/);
  return m ? m[1] : "";
});

if (describeNames.length > 0) {
  analysis.passed.push(
    `✅ ${describeNames.length} 個の describe ブロックを検出`,
  );

  // describe の階層チェック
  const nestedDescribes =
    content.match(/describe\s*\([^)]+,\s*\(\)\s*=>\s*\{[^}]*describe/g) || [];
  const nestLevel = nestedDescribes.length;

  if (nestLevel > 3) {
    analysis.warnings.push(
      `⚠️ describe のネストが深い (${nestLevel}レベル) - 3レベル以内を推奨`,
    );
  }

  // 命名パターンチェック
  describeNames.forEach((name) => {
    // クラス/モジュール名（PascalCase）
    if (/^[A-Z][a-zA-Z0-9]+$/.test(name)) {
      // OK: クラス名
    }
    // メソッド名（#付きまたは.付き）
    else if (/^[#.][a-zA-Z]+/.test(name)) {
      // OK: メソッド名
    }
    // コンテキスト（when/with/given）
    else if (/^(when|with|given|for|if)\s+/i.test(name)) {
      // OK: コンテキスト
    } else if (name.length < 3) {
      analysis.warnings.push(`⚠️ describe "${name}" が短すぎる`);
    }
  });
}

// it/test ブロック抽出
const itMatches =
  content.match(/(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
const testNames = itMatches.map((match) => {
  const m = match.match(/['"`]([^'"`]+)['"`]/);
  return m ? m[1] : "";
});

if (testNames.length > 0) {
  analysis.passed.push(`✅ ${testNames.length} 個のテストケースを検出`);

  let shouldPattern = 0;
  let gwtPattern = 0;
  let otherPattern = 0;
  const problematicNames = [];

  testNames.forEach((name) => {
    // Should 形式: "should + 動詞"
    if (/^should\s+[a-z]+/i.test(name)) {
      shouldPattern++;
    }
    // Given-When-Then 形式
    else if (/^(given|when|then)\s+/i.test(name)) {
      gwtPattern++;
    }
    // 動詞で始まる形式 (returns, throws, creates など)
    else if (
      /^(returns?|throws?|creates?|updates?|deletes?|validates?|rejects?|accepts?)/i.test(
        name,
      )
    ) {
      shouldPattern++; // Should系として扱う
    } else {
      otherPattern++;
      if (name.length < 10) {
        problematicNames.push(name);
      } else if (!/\s/.test(name)) {
        problematicNames.push(name);
      }
    }
  });

  // パターン統一性チェック
  const dominantPattern = Math.max(shouldPattern, gwtPattern, otherPattern);
  const consistency = (dominantPattern / testNames.length) * 100;

  if (consistency >= 80) {
    analysis.passed.push(`✅ 命名パターンの一貫性: ${consistency.toFixed(0)}%`);
  } else {
    analysis.warnings.push(
      `⚠️ 命名パターンが混在 (一貫性: ${consistency.toFixed(0)}%)`,
    );
    analysis.suggestions.push(
      "💡 Should形式またはGiven-When-Then形式に統一推奨",
    );
  }

  // Should パターン詳細
  if (shouldPattern > 0) {
    analysis.passed.push(`  📝 Should形式: ${shouldPattern}個`);
  }
  if (gwtPattern > 0) {
    analysis.passed.push(`  📝 Given-When-Then形式: ${gwtPattern}個`);
  }
  if (otherPattern > 0) {
    analysis.warnings.push(`  ⚠️ その他の形式: ${otherPattern}個`);
  }

  // 問題のあるテスト名
  if (problematicNames.length > 0) {
    analysis.failed.push("❌ 改善が必要なテスト名:");
    problematicNames.slice(0, 5).forEach((name) => {
      analysis.failed.push(`   - "${name}"`);
    });
    if (problematicNames.length > 5) {
      analysis.failed.push(`   ... 他 ${problematicNames.length - 5}個`);
    }
  }

  // 曖昧なテスト名検出
  const vagueNames = testNames.filter((name) =>
    /^test$|^works$|^should work$|^it works$/i.test(name.trim()),
  );
  if (vagueNames.length > 0) {
    analysis.failed.push(`❌ 曖昧なテスト名: ${vagueNames.length}個`);
    vagueNames.forEach((name) => {
      analysis.failed.push(`   - "${name}" → 具体的な振る舞いを記述`);
    });
  }

  // 重複チェック
  const duplicates = testNames.filter(
    (name, index) => testNames.indexOf(name) !== index,
  );
  if (duplicates.length > 0) {
    analysis.failed.push(`❌ 重複したテスト名: ${duplicates.length}個`);
  }
}

// 結果出力
console.log("\n=== テスト命名規則チェック結果 ===\n");
console.log(`ファイル: ${testFilePath}\n`);

if (analysis.passed.length > 0) {
  console.log("【合格】");
  analysis.passed.forEach((msg) => console.log(`  ${msg}`));
}

if (analysis.warnings.length > 0) {
  console.log("\n【警告】");
  analysis.warnings.forEach((msg) => console.log(`  ${msg}`));
}

if (analysis.failed.length > 0) {
  console.log("\n【不合格】");
  analysis.failed.forEach((msg) => console.log(`  ${msg}`));
}

if (analysis.suggestions.length > 0) {
  console.log("\n【提案】");
  analysis.suggestions.forEach((msg) => console.log(`  ${msg}`));
}

// スコア計算
const totalChecks = analysis.passed.length + analysis.failed.length;
const score =
  totalChecks > 0
    ? Math.round((analysis.passed.length / totalChecks) * 100)
    : 0;

console.log(
  `\n【スコア】 ${score}% (${analysis.passed.length}/${totalChecks} 項目合格)`,
);

// 命名規則リファレンス
console.log("\n【命名規則リファレンス】");
console.log("  Should形式:");
console.log('    it("should return user when id is valid", ...)');
console.log('    it("should throw error when user not found", ...)');
console.log("");
console.log("  Given-When-Then形式:");
console.log('    describe("given valid credentials", () => {');
console.log('      describe("when login is called", () => {');
console.log('        it("then returns auth token", ...);');
console.log("      });");
console.log("    });");

process.exit(analysis.failed.length > 0 ? 1 : 0);
