#!/usr/bin/env node
/**
 * コード複雑度分析スクリプト
 *
 * 用途: プロジェクト全体の複雑度メトリクスを測定・レポート
 * 実行: node analyze-complexity.mjs [src-directory]
 * 出力: 複雑度統計、閾値違反一覧、推奨アクション
 */

import { ESLint } from "eslint";
import { resolve } from "path";

async function analyzeComplexity(targetDir = "src") {
  const absolutePath = resolve(targetDir);

  console.log("📊 Code Complexity Analysis\n");
  console.log(`Target: ${absolutePath}\n`);

  try {
    // ESLint設定（複雑度ルール有効化）
    const eslint = new ESLint({
      baseConfig: {
        parserOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
        },
        rules: {
          complexity: ["warn", 0], // すべての関数で複雑度を報告
          "max-depth": ["warn", 0],
          "max-lines-per-function": ["warn", 0],
          "max-params": ["warn", 0],
        },
      },
      useEslintrc: false,
    });

    // ファイルをlint
    const results = await eslint.lintFiles([
      `${absolutePath}/**/*.{ts,tsx,js,jsx}`,
    ]);

    // 複雑度データ収集
    const complexityData = {
      files: 0,
      functions: 0,
      totalComplexity: 0,
      violations: {
        complexity: [],
        maxDepth: [],
        maxLines: [],
        maxParams: [],
      },
      distribution: {
        simple: 0, // CC 1-5
        moderate: 0, // CC 6-10
        complex: 0, // CC 11-20
        veryComplex: 0, // CC 21+
      },
    };

    results.forEach((result) => {
      if (result.errorCount > 0 || result.warningCount > 0) {
        complexityData.files++;

        result.messages.forEach((msg) => {
          if (msg.ruleId === "complexity") {
            const complexity = extractComplexity(msg.message);
            complexityData.functions++;
            complexityData.totalComplexity += complexity;

            // 複雑度分布
            if (complexity <= 5) complexityData.distribution.simple++;
            else if (complexity <= 10) complexityData.distribution.moderate++;
            else if (complexity <= 20) complexityData.distribution.complex++;
            else complexityData.distribution.veryComplex++;

            // 閾値違反（>10）
            if (complexity > 10) {
              complexityData.violations.complexity.push({
                file: result.filePath.replace(process.cwd(), "."),
                line: msg.line,
                complexity,
                message: msg.message,
              });
            }
          }
        });
      }
    });

    // レポート出力
    console.log("📈 Complexity Statistics:\n");

    console.log(`  Files analyzed: ${complexityData.files}`);
    console.log(`  Functions found: ${complexityData.functions}`);

    if (complexityData.functions > 0) {
      const avgComplexity = (
        complexityData.totalComplexity / complexityData.functions
      ).toFixed(2);
      console.log(`  Average complexity: ${avgComplexity}`);
    }

    console.log("\n  Distribution:");
    console.log(
      `    Simple (1-5):      ${complexityData.distribution.simple} functions`,
    );
    console.log(
      `    Moderate (6-10):   ${complexityData.distribution.moderate} functions`,
    );
    console.log(
      `    Complex (11-20):   ${complexityData.distribution.complex} functions`,
    );
    console.log(
      `    Very Complex (21+): ${complexityData.distribution.veryComplex} functions`,
    );

    // 違反レポート
    if (complexityData.violations.complexity.length > 0) {
      console.log("\n⚠️  Complexity Violations (>10):\n");

      // 複雑度降順でソート
      const sorted = complexityData.violations.complexity
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 10); // Top 10

      sorted.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation.file}:${violation.line}`);
        console.log(`     Complexity: ${violation.complexity}`);
        console.log(`     → Recommendation: Refactor to reduce complexity\n`);
      });

      if (complexityData.violations.complexity.length > 10) {
        console.log(
          `  ... and ${complexityData.violations.complexity.length - 10} more\n`,
        );
      }
    } else {
      console.log("\n✅ No complexity violations detected\n");
    }

    // 推奨アクション
    console.log("💡 Recommendations:\n");

    if (complexityData.distribution.veryComplex > 0) {
      console.log(
        `  🔴 High Priority: Refactor ${complexityData.distribution.veryComplex} very complex functions`,
      );
    }
    if (complexityData.distribution.complex > 0) {
      console.log(
        `  🟡 Medium Priority: Review ${complexityData.distribution.complex} complex functions`,
      );
    }
    if (complexityData.violations.complexity.length === 0) {
      console.log(
        "  ✅ Code quality is good. Continue maintaining low complexity.",
      );
    }

    // Exit code
    const exitCode = complexityData.violations.complexity.length > 0 ? 1 : 0;
    process.exit(exitCode);
  } catch (error) {
    console.error("❌ Analysis error:", error.message);
    process.exit(1);
  }
}

/**
 * 複雑度メッセージから数値を抽出
 */
function extractComplexity(message) {
  const match = message.match(/complexity of (\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

// CLI実行
const targetDir = process.argv[2] || "src";
analyzeComplexity(targetDir);
