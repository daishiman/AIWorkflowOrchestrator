#!/usr/bin/env node

/**
 * プロンプトインジェクション防御実装の検証スクリプト
 *
 * 使用方法:
 *   node validate-defense.mjs <code-directory>
 *
 * 検証内容:
 *   - 入力検証の実装確認
 *   - プロンプト構造化の実装確認
 *   - 出力検証の実装確認
 *   - コンテキスト分離の実装確認
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";

// 検証結果の格納
const results = {
  inputValidation: { score: 0, maxScore: 0, findings: [] },
  promptStructuring: { score: 0, maxScore: 0, findings: [] },
  outputValidation: { score: 0, maxScore: 0, findings: [] },
  contextIsolation: { score: 0, maxScore: 0, findings: [] },
  overall: { score: 0, maxScore: 0 },
};

// 検証パターン定義
const validationPatterns = {
  inputValidation: {
    lengthCheck: {
      patterns: [/\.length\s*[><=]+\s*\d+/, /maxLength/, /minLength/],
      points: 10,
      description: "入力長チェック",
    },
    whitelistValidation: {
      patterns: [
        /whitelist/i,
        /allowList/i,
        /test\s*\(\s*input\s*\)/,
        /match\s*\(/,
      ],
      points: 15,
      description: "ホワイトリスト検証",
    },
    forbiddenPatterns: {
      patterns: [/forbidden/i, /blacklist/i, /deny/i, /ignore.*instruction/i],
      points: 10,
      description: "禁止パターン検出",
    },
    structuredInput: {
      patterns: [/JSON\.parse/, /zod/, /ajv/, /validator/],
      points: 10,
      description: "構造化入力検証",
    },
  },
  promptStructuring: {
    delimiter: {
      patterns: [
        /<user_input>/,
        /<\|user\|>/,
        /```user/,
        /delimiter/i,
        /separator/i,
      ],
      points: 15,
      description: "デリミタ使用",
    },
    escaping: {
      patterns: [/escape/i, /sanitize/i, /\.replace\(/],
      points: 10,
      description: "エスケープ処理",
    },
    messageSeparation: {
      patterns: [/role.*system/, /role.*user/, /messages\s*:/, /systemPrompt/],
      points: 15,
      description: "メッセージ分離",
    },
  },
  outputValidation: {
    secretDetection: {
      patterns: [
        /API.*KEY/i,
        /SECRET/i,
        /PASSWORD/i,
        /detectSecret/i,
        /sensitivePattern/i,
      ],
      points: 15,
      description: "機密情報検出",
    },
    systemPromptLeakage: {
      patterns: [/systemPrompt.*includes/, /leakage/i, /exposure/i],
      points: 15,
      description: "システムプロンプト漏洩検出",
    },
    topicValidation: {
      patterns: [/topic/i, /context/i, /relevant/i, /expectedTopic/],
      points: 10,
      description: "トピック逸脱検出",
    },
  },
  contextIsolation: {
    minimumPrivilege: {
      patterns: [/allowedTools/, /permissions/, /restrictions/, /capability/i],
      points: 15,
      description: "最小権限原則",
    },
    sessionIsolation: {
      patterns: [/sessionId/, /session.*isolation/i, /userContext/],
      points: 10,
      description: "セッション隔離",
    },
    sandboxing: {
      patterns: [/sandbox/i, /timeout/i, /maxTokens/, /resource.*limit/i],
      points: 10,
      description: "サンドボックス化",
    },
  },
};

/**
 * ファイル内容を読み込んで検証パターンをチェック
 */
function validateFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");

    for (const [category, patterns] of Object.entries(validationPatterns)) {
      for (const [checkName, checkConfig] of Object.entries(patterns)) {
        results[category].maxScore += checkConfig.points;

        const found = checkConfig.patterns.some((pattern) =>
          pattern.test(content),
        );

        if (found) {
          results[category].score += checkConfig.points;
          results[category].findings.push({
            file: filePath,
            check: checkName,
            description: checkConfig.description,
            status: "PASS",
          });
        }
      }
    }
  } catch (error) {
    console.error(`ファイル読み込みエラー: ${filePath}`, error.message);
  }
}

/**
 * ディレクトリを再帰的に走査してTypeScript/JavaScriptファイルを検証
 */
function scanDirectory(dirPath) {
  if (!existsSync(dirPath)) {
    console.error(`エラー: ディレクトリが見つかりません: ${dirPath}`);
    process.exit(1);
  }

  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // node_modules等を除外
      if (!["node_modules", ".git", "dist", "build"].includes(entry)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = extname(entry);
      if ([".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(ext)) {
        validateFile(fullPath);
      }
    }
  }
}

/**
 * 検証結果をレポート出力
 */
function generateReport() {
  console.log("\n=== プロンプトインジェクション防御検証レポート ===\n");

  let totalScore = 0;
  let totalMaxScore = 0;

  for (const [category, result] of Object.entries(results)) {
    if (category === "overall") continue;

    totalScore += result.score;
    totalMaxScore += result.maxScore;

    const percentage =
      result.maxScore > 0
        ? ((result.score / result.maxScore) * 100).toFixed(1)
        : 0;

    console.log(`## ${getCategoryName(category)}`);
    console.log(
      `スコア: ${result.score} / ${result.maxScore} (${percentage}%)`,
    );

    if (result.findings.length > 0) {
      console.log("検出された実装:");
      const uniqueChecks = [
        ...new Set(result.findings.map((f) => f.description)),
      ];
      uniqueChecks.forEach((desc) => {
        console.log(`  ✅ ${desc}`);
      });
    } else {
      console.log("  ⚠️  実装が検出されませんでした");
    }
    console.log("");
  }

  results.overall.score = totalScore;
  results.overall.maxScore = totalMaxScore;

  const overallPercentage =
    totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : 0;

  console.log("=== 総合評価 ===");
  console.log(
    `総合スコア: ${totalScore} / ${totalMaxScore} (${overallPercentage}%)`,
  );

  if (overallPercentage >= 80) {
    console.log("評価: ✅ 優秀（多層防御が十分に実装されています）");
  } else if (overallPercentage >= 60) {
    console.log("評価: ⚠️  良好（一部の防御層が不足しています）");
  } else if (overallPercentage >= 40) {
    console.log("評価: ⚠️  改善が必要（重要な防御層が不足しています）");
  } else {
    console.log(
      "評価: ❌ 不十分（プロンプトインジェクション対策が不足しています）",
    );
  }

  console.log("\n=== 推奨事項 ===");
  generateRecommendations();
}

/**
 * カテゴリ名を日本語に変換
 */
function getCategoryName(category) {
  const names = {
    inputValidation: "1. 入力検証",
    promptStructuring: "2. プロンプト構造化",
    outputValidation: "3. 出力検証",
    contextIsolation: "4. コンテキスト分離",
  };
  return names[category] || category;
}

/**
 * 推奨事項を生成
 */
function generateRecommendations() {
  const recommendations = [];

  for (const [category, result] of Object.entries(results)) {
    if (category === "overall") continue;

    const percentage =
      result.maxScore > 0 ? (result.score / result.maxScore) * 100 : 0;

    if (percentage < 50) {
      recommendations.push({
        priority: "HIGH",
        category: getCategoryName(category),
        message: `${getCategoryName(category)}の実装が不足しています。`,
      });
    } else if (percentage < 80) {
      recommendations.push({
        priority: "MEDIUM",
        category: getCategoryName(category),
        message: `${getCategoryName(category)}の一部が未実装です。`,
      });
    }
  }

  if (recommendations.length === 0) {
    console.log("特に推奨事項はありません。現在の実装を維持してください。");
  } else {
    recommendations
      .sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .forEach((rec, index) => {
        console.log(
          `${index + 1}. [${rec.priority}] ${rec.category}: ${rec.message}`,
        );
      });

    console.log(
      "\n詳細な実装ガイドラインは references/patterns.md を参照してください。",
    );
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log("使用方法:");
    console.log("  node validate-defense.mjs <code-directory>");
    console.log("");
    console.log("例:");
    console.log("  node validate-defense.mjs ./src");
    console.log("  node validate-defense.mjs ./packages/api");
    process.exit(0);
  }

  const targetDir = args[0];

  console.log(`検証対象: ${targetDir}`);
  console.log("スキャン中...\n");

  scanDirectory(targetDir);
  generateReport();

  // スコアが低い場合は終了コード1を返す
  const overallPercentage =
    results.overall.maxScore > 0
      ? (results.overall.score / results.overall.maxScore) * 100
      : 0;

  if (overallPercentage < 40) {
    process.exit(1);
  }
}

main();
