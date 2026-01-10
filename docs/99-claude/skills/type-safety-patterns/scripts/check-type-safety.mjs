#!/usr/bin/env node
/**
 * 型安全性チェックスクリプト
 * TypeScriptファイルの型安全性パターンを検証します
 *
 * 使用方法:
 *   node check-type-safety.mjs <file.ts> [--strict] [--fix-suggestions]
 *
 * オプション:
 *   --strict          厳格モードでチェック
 *   --fix-suggestions 修正提案を表示
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// チェックルール定義
const RULES = {
  // 危険なパターン
  dangerous: [
    {
      pattern: /as\s+any\b/g,
      message: "as any の使用は型安全性を損ないます",
      severity: "error",
      suggestion: "具体的な型を指定するか、unknown を使用してください",
    },
    {
      pattern: /:\s*any\b/g,
      message: "any 型の使用は避けてください",
      severity: "error",
      suggestion: "unknown または具体的な型を使用してください",
    },
    {
      pattern: /!\./g,
      message: "Non-null assertion (!) の過度な使用",
      severity: "warning",
      suggestion:
        "Optional chaining (?.) または適切な null チェックを使用してください",
    },
    {
      pattern: /@ts-ignore/g,
      message: "@ts-ignore は型チェックを無効化します",
      severity: "error",
      suggestion: "@ts-expect-error を使用し、理由をコメントで説明してください",
    },
    {
      pattern: /@ts-nocheck/g,
      message: "@ts-nocheck はファイル全体の型チェックを無効化します",
      severity: "error",
      suggestion: "個別のエラーに対処してください",
    },
  ],

  // 推奨パターン
  recommended: [
    {
      pattern: /function\s+\w+\s*\([^)]*\)\s*{/g,
      antiPattern: /function\s+\w+\s*\([^)]*\)\s*:\s*\w+/g,
      message: "関数に戻り値の型注釈がありません",
      severity: "warning",
      suggestion: "明示的な戻り値の型を追加してください",
    },
    {
      pattern: /catch\s*\(\s*(\w+)\s*\)\s*{/g,
      check: (match, content) => {
        const varName = match[1];
        return (
          !content.includes(`${varName} instanceof`) &&
          !content.includes(`${varName} as`)
        );
      },
      message: "catch 変数の型チェックがありません",
      severity: "warning",
      suggestion: "instanceof でエラー型を確認してください",
    },
  ],

  // 型ガードパターン
  typeGuards: [
    {
      pattern: /typeof\s+\w+\s*===?\s*['"](\w+)['"]/g,
      valid: [
        "string",
        "number",
        "boolean",
        "undefined",
        "object",
        "function",
        "symbol",
        "bigint",
      ],
      message: "無効な typeof 比較",
      severity: "error",
    },
  ],

  // Discriminated Union パターン
  discriminatedUnion: [
    {
      pattern: /switch\s*\(\s*\w+\.(\w+)\s*\)/g,
      checkExhaustive: true,
      message: "switch 文に網羅性チェックがない可能性があります",
      severity: "info",
      suggestion: "default ケースで assertNever を使用してください",
    },
  ],
};

// 結果フォーマッター
function formatResult(results, filePath) {
  const errors = results.filter((r) => r.severity === "error");
  const warnings = results.filter((r) => r.severity === "warning");
  const infos = results.filter((r) => r.severity === "info");

  console.log(`\n📄 ${filePath}`);
  console.log("─".repeat(60));

  if (results.length === 0) {
    console.log("✅ 型安全性の問題は検出されませんでした");
    return { passed: true, errors: 0, warnings: 0 };
  }

  // エラー表示
  if (errors.length > 0) {
    console.log(`\n❌ エラー (${errors.length}):`);
    errors.forEach((e) => {
      console.log(`  L${e.line}: ${e.message}`);
      if (e.suggestion) {
        console.log(`     💡 ${e.suggestion}`);
      }
    });
  }

  // 警告表示
  if (warnings.length > 0) {
    console.log(`\n⚠️  警告 (${warnings.length}):`);
    warnings.forEach((w) => {
      console.log(`  L${w.line}: ${w.message}`);
      if (w.suggestion) {
        console.log(`     💡 ${w.suggestion}`);
      }
    });
  }

  // 情報表示
  if (infos.length > 0) {
    console.log(`\n💡 情報 (${infos.length}):`);
    infos.forEach((i) => {
      console.log(`  L${i.line}: ${i.message}`);
      if (i.suggestion) {
        console.log(`     💡 ${i.suggestion}`);
      }
    });
  }

  // サマリー
  console.log("\n" + "─".repeat(60));
  console.log(
    `📊 サマリー: ${errors.length} エラー, ${warnings.length} 警告, ${infos.length} 情報`,
  );

  return {
    passed: errors.length === 0,
    errors: errors.length,
    warnings: warnings.length,
  };
}

// 行番号を取得
function getLineNumber(content, index) {
  return content.substring(0, index).split("\n").length;
}

// ファイルをチェック
function checkFile(filePath, options = {}) {
  if (!existsSync(filePath)) {
    console.error(`❌ ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const results = [];

  // 危険なパターンをチェック
  RULES.dangerous.forEach((rule) => {
    let match;
    while ((match = rule.pattern.exec(content)) !== null) {
      results.push({
        line: getLineNumber(content, match.index),
        message: rule.message,
        severity: rule.severity,
        suggestion: options.fixSuggestions ? rule.suggestion : undefined,
      });
    }
  });

  // 推奨パターンをチェック
  if (options.strict) {
    RULES.recommended.forEach((rule) => {
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        // アンチパターンがあれば問題なし
        if (rule.antiPattern) {
          const antiMatch = rule.antiPattern.exec(content);
          if (antiMatch && antiMatch.index === match.index) {
            continue;
          }
        }
        // カスタムチェック
        if (rule.check && !rule.check(match, content)) {
          continue;
        }
        results.push({
          line: getLineNumber(content, match.index),
          message: rule.message,
          severity: rule.severity,
          suggestion: options.fixSuggestions ? rule.suggestion : undefined,
        });
      }
    });
  }

  // Discriminated Union チェック
  RULES.discriminatedUnion.forEach((rule) => {
    let match;
    while ((match = rule.pattern.exec(content)) !== null) {
      // default ケースがあるかチェック
      const switchContent = content.substring(match.index, match.index + 500);
      if (
        !switchContent.includes("default:") &&
        !switchContent.includes("assertNever")
      ) {
        results.push({
          line: getLineNumber(content, match.index),
          message: rule.message,
          severity: rule.severity,
          suggestion: options.fixSuggestions ? rule.suggestion : undefined,
        });
      }
    }
  });

  return formatResult(results, filePath);
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
型安全性チェックスクリプト

使用方法:
  node check-type-safety.mjs <file.ts> [options]

オプション:
  --strict          厳格モードでチェック（推奨パターンも検証）
  --fix-suggestions 修正提案を表示
  --help            ヘルプを表示

例:
  node check-type-safety.mjs src/api.ts
  node check-type-safety.mjs src/api.ts --strict --fix-suggestions
`);
    process.exit(0);
  }

  const filePath = resolve(args.find((a) => !a.startsWith("--")));
  const options = {
    strict: args.includes("--strict"),
    fixSuggestions: args.includes("--fix-suggestions"),
  };

  const result = checkFile(filePath, options);
  process.exit(result.passed ? 0 : 1);
}

main();
