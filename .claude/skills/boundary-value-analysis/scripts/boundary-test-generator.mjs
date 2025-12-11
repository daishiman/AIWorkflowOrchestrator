#!/usr/bin/env node

/**
 * 境界値テストケース生成スクリプト
 *
 * 関数シグネチャまたは仕様から境界値テストケースを生成します。
 *
 * Usage:
 *   node boundary-test-generator.mjs --range <min> <max>
 *   node boundary-test-generator.mjs --type string --maxLength 100
 *   node boundary-test-generator.mjs --type array --maxSize 10
 */

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("境界値テストケース生成ツール\n");
  console.log("Usage:");
  console.log("  node boundary-test-generator.mjs --range <min> <max>");
  console.log(
    "  node boundary-test-generator.mjs --type string --maxLength <n>",
  );
  console.log("  node boundary-test-generator.mjs --type array --maxSize <n>");
  console.log(
    "  node boundary-test-generator.mjs --type date --from <date> --to <date>",
  );
  console.log("\nExamples:");
  console.log("  node boundary-test-generator.mjs --range 1 100");
  console.log(
    "  node boundary-test-generator.mjs --type string --maxLength 255",
  );
  process.exit(0);
}

// 引数パース
const parseArgs = () => {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      result[key] = args[i + 1] || true;
      i++;
    }
  }
  return result;
};

const options = parseArgs();

// 境界値生成関数
const generateBoundaryValues = {
  // 数値範囲の境界値
  range: (min, max) => {
    const minNum = parseInt(min);
    const maxNum = parseInt(max);
    return {
      type: "numeric",
      testCases: [
        { value: minNum - 1, expected: "invalid", description: "最小値未満" },
        { value: minNum, expected: "valid", description: "最小値（境界）" },
        { value: minNum + 1, expected: "valid", description: "最小値+1" },
        {
          value: Math.floor((minNum + maxNum) / 2),
          expected: "valid",
          description: "中央値",
        },
        { value: maxNum - 1, expected: "valid", description: "最大値-1" },
        { value: maxNum, expected: "valid", description: "最大値（境界）" },
        { value: maxNum + 1, expected: "invalid", description: "最大値超過" },
      ],
      edgeCases: [
        { value: 0, expected: "context-dependent", description: "ゼロ" },
        { value: -1, expected: "context-dependent", description: "負数" },
        {
          value: Number.MAX_SAFE_INTEGER,
          expected: "context-dependent",
          description: "最大安全整数",
        },
        { value: NaN, expected: "invalid", description: "NaN" },
        { value: Infinity, expected: "invalid", description: "Infinity" },
      ],
    };
  },

  // 文字列長の境界値
  string: (maxLength) => {
    const max = parseInt(maxLength);
    return {
      type: "string",
      testCases: [
        { value: "", expected: "context-dependent", description: "空文字列" },
        { value: "a", expected: "valid", description: "1文字" },
        {
          value: "a".repeat(max - 1),
          expected: "valid",
          description: "最大長-1",
        },
        {
          value: "a".repeat(max),
          expected: "valid",
          description: "最大長（境界）",
        },
        {
          value: "a".repeat(max + 1),
          expected: "invalid",
          description: "最大長超過",
        },
      ],
      edgeCases: [
        { value: null, expected: "invalid", description: "null" },
        { value: undefined, expected: "invalid", description: "undefined" },
        {
          value: "   ",
          expected: "context-dependent",
          description: "空白のみ",
        },
        {
          value: "日本語テスト",
          expected: "valid",
          description: "マルチバイト文字",
        },
        {
          value: "🎉🎊🎈",
          expected: "context-dependent",
          description: "絵文字",
        },
      ],
    };
  },

  // 配列サイズの境界値
  array: (maxSize) => {
    const max = parseInt(maxSize);
    return {
      type: "array",
      testCases: [
        { value: "[]", expected: "valid", description: "空配列" },
        { value: "[1]", expected: "valid", description: "要素1個" },
        {
          value: `[${Array(max - 1)
            .fill(1)
            .join(",")}]`,
          expected: "valid",
          description: "最大サイズ-1",
        },
        {
          value: `[${Array(max).fill(1).join(",")}]`,
          expected: "valid",
          description: "最大サイズ（境界）",
        },
        {
          value: `[${Array(max + 1)
            .fill(1)
            .join(",")}]`,
          expected: "invalid",
          description: "最大サイズ超過",
        },
      ],
      edgeCases: [
        { value: "null", expected: "invalid", description: "null" },
        { value: "undefined", expected: "invalid", description: "undefined" },
        {
          value: "[null, undefined]",
          expected: "context-dependent",
          description: "null/undefined要素",
        },
        {
          value: "[[nested]]",
          expected: "context-dependent",
          description: "ネスト配列",
        },
      ],
    };
  },

  // 日付の境界値
  date: (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const dayBefore = new Date(fromDate.getTime() - 86400000);
    const dayAfter = new Date(toDate.getTime() + 86400000);

    return {
      type: "date",
      testCases: [
        {
          value: dayBefore.toISOString().split("T")[0],
          expected: "invalid",
          description: "開始日の前日",
        },
        {
          value: fromDate.toISOString().split("T")[0],
          expected: "valid",
          description: "開始日（境界）",
        },
        {
          value: toDate.toISOString().split("T")[0],
          expected: "valid",
          description: "終了日（境界）",
        },
        {
          value: dayAfter.toISOString().split("T")[0],
          expected: "invalid",
          description: "終了日の翌日",
        },
      ],
      edgeCases: [
        {
          value: "2000-01-01",
          expected: "context-dependent",
          description: "Y2K境界",
        },
        {
          value: "2038-01-19",
          expected: "context-dependent",
          description: "Unix時間境界",
        },
        { value: "2024-02-29", expected: "valid", description: "うるう年" },
        {
          value: "2023-02-29",
          expected: "invalid",
          description: "無効なうるう日",
        },
      ],
    };
  },
};

// 実行
let result;

if (options.range) {
  const [min, max] = [options.range, args[args.indexOf("--range") + 2]];
  result = generateBoundaryValues.range(min, max);
} else if (options.type === "string" && options.maxLength) {
  result = generateBoundaryValues.string(options.maxLength);
} else if (options.type === "array" && options.maxSize) {
  result = generateBoundaryValues.array(options.maxSize);
} else if (options.type === "date" && options.from && options.to) {
  result = generateBoundaryValues.date(options.from, options.to);
} else {
  console.error("Invalid options. Use --help for usage.");
  process.exit(1);
}

// 結果出力
console.log("\n=== 境界値テストケース ===\n");
console.log(`タイプ: ${result.type}\n`);

console.log("【標準テストケース】");
result.testCases.forEach((tc, i) => {
  const status =
    tc.expected === "valid" ? "✅" : tc.expected === "invalid" ? "❌" : "⚠️";
  const valueStr =
    typeof tc.value === "string" && tc.value.length > 50
      ? tc.value.slice(0, 47) + "..."
      : tc.value;
  console.log(`  ${i + 1}. ${status} ${tc.description}`);
  console.log(`     値: ${valueStr}`);
  console.log(`     期待: ${tc.expected}`);
});

console.log("\n【エッジケース】");
result.edgeCases.forEach((tc, i) => {
  const status =
    tc.expected === "valid" ? "✅" : tc.expected === "invalid" ? "❌" : "⚠️";
  console.log(`  ${i + 1}. ${status} ${tc.description}`);
  console.log(`     期待: ${tc.expected}`);
});

// テストコードテンプレート出力
console.log("\n【Vitestテンプレート】");
console.log("```typescript");
console.log('describe("boundary value tests", () => {');
result.testCases.forEach((tc) => {
  const expectation =
    tc.expected === "valid" ? "to be valid" : "to throw error";
  console.log(`  it("should ${expectation} for ${tc.description}", () => {`);
  console.log(`    // Arrange`);
  console.log(`    const input = ${JSON.stringify(tc.value)};`);
  console.log(`    // Act & Assert`);
  if (tc.expected === "valid") {
    console.log(`    expect(() => validate(input)).not.toThrow();`);
  } else {
    console.log(`    expect(() => validate(input)).toThrow();`);
  }
  console.log(`  });`);
  console.log("");
});
console.log("});");
console.log("```");

console.log("\n【推奨事項】");
console.log("  1. 境界値は「ちょうど」「ひとつ上」「ひとつ下」をテスト");
console.log("  2. 同値クラスからは代表値を1つ選択");
console.log("  3. エッジケースは網羅的にテスト");
console.log("  4. 無効値のテストはエラーハンドリングを確認");
