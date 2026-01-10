#!/usr/bin/env node

/**
 * チュートリアル完了時間見積もりスクリプト
 *
 * 使用方法:
 *   node estimate-completion-time.mjs <file_or_directory>
 *
 * 機能:
 *   - ステップ数から所要時間を算出
 *   - 難易度に基づく調整
 *   - 視覚要素の影響を考慮
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

/**
 * 時間見積もりの基準値（分）
 */
const TIME_FACTORS = {
  // ステップあたりの基本時間
  STEP_BASE: 2,
  // サブステップあたりの追加時間
  SUBSTEP: 0.5,
  // コードブロックあたりの追加時間
  CODE_BLOCK: 1,
  // 演習セクションの追加時間
  EXERCISE: 5,
  // スクリーンショット確認時間
  SCREENSHOT: 0.3,
  // 読解時間（100語あたり）
  READING_PER_100_WORDS: 0.5,
};

/**
 * 難易度係数
 */
const DIFFICULTY_MULTIPLIERS = {
  beginner: 1.3, // 初心者向けは余裕を持たせる
  intermediate: 1.0, // 中級者向けは標準
  advanced: 0.8, // 上級者向けは短め
};

/**
 * Markdownからチュートリアル構造を分析
 */
function analyzeStructure(markdown) {
  const analysis = {
    steps: 0,
    substeps: 0,
    codeBlocks: 0,
    exercises: 0,
    screenshots: 0,
    wordCount: 0,
    difficulty: "intermediate",
  };

  // ステップ見出しをカウント（## ステップ N または ## Step N）
  const stepMatches = markdown.match(/^##\s+(ステップ|Step)\s+\d+/gim);
  analysis.steps = stepMatches ? stepMatches.length : 0;

  // サブステップをカウント（### N.N）
  const substepMatches = markdown.match(/^###\s+\d+\.\d+/gm);
  analysis.substeps = substepMatches ? substepMatches.length : 0;

  // コードブロックをカウント
  const codeBlockMatches = markdown.match(/```[\s\S]*?```/g);
  analysis.codeBlocks = codeBlockMatches ? codeBlockMatches.length : 0;

  // 演習セクションをカウント
  const exerciseMatches = markdown.match(/^##\s*(演習|Exercise|✏️)/gim);
  analysis.exercises = exerciseMatches ? exerciseMatches.length : 0;

  // スクリーンショットをカウント
  const screenshotMatches = markdown.match(/!\[.*?\]\(.*?\)/g);
  analysis.screenshots = screenshotMatches ? screenshotMatches.length : 0;

  // 単語数をカウント（日本語は2文字=1語として計算）
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "");

  const englishWords = (plainText.match(/[a-zA-Z]+/g) || []).length;
  const japaneseChars = (
    plainText.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g) || []
  ).length;
  analysis.wordCount = englishWords + Math.ceil(japaneseChars / 2);

  // 難易度を推定
  if (markdown.match(/初心者|beginner|入門|クイックスタート|quickstart/i)) {
    analysis.difficulty = "beginner";
  } else if (markdown.match(/上級|advanced|高度|応用/i)) {
    analysis.difficulty = "advanced";
  }

  return analysis;
}

/**
 * 所要時間を計算
 */
function calculateTime(analysis) {
  let totalMinutes = 0;

  // ステップとサブステップの時間
  totalMinutes += analysis.steps * TIME_FACTORS.STEP_BASE;
  totalMinutes += analysis.substeps * TIME_FACTORS.SUBSTEP;

  // コードブロック（入力・確認時間）
  totalMinutes += analysis.codeBlocks * TIME_FACTORS.CODE_BLOCK;

  // 演習セクション
  totalMinutes += analysis.exercises * TIME_FACTORS.EXERCISE;

  // スクリーンショット確認
  totalMinutes += analysis.screenshots * TIME_FACTORS.SCREENSHOT;

  // 読解時間
  totalMinutes +=
    (analysis.wordCount / 100) * TIME_FACTORS.READING_PER_100_WORDS;

  // 難易度係数を適用
  const multiplier = DIFFICULTY_MULTIPLIERS[analysis.difficulty] || 1.0;
  totalMinutes *= multiplier;

  return Math.ceil(totalMinutes);
}

/**
 * 推奨時間表示のフォーマット
 */
function formatTime(minutes) {
  if (minutes < 60) {
    return `約 ${minutes} 分`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `約 ${hours} 時間`;
  }
  return `約 ${hours} 時間 ${mins} 分`;
}

/**
 * ファイルを分析
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const analysis = analyzeStructure(content);
  const estimatedMinutes = calculateTime(analysis);

  return {
    file: basename(filePath),
    path: filePath,
    analysis,
    estimatedMinutes,
    formattedTime: formatTime(estimatedMinutes),
  };
}

/**
 * 結果を表示
 */
function printResults(results) {
  console.log("\n📊 チュートリアル完了時間見積もりレポート\n");
  console.log("=".repeat(70));

  for (const result of results) {
    console.log(`\n📄 ${result.file}`);
    console.log("-".repeat(70));

    console.log(`\n⏱️  見積もり時間: ${result.formattedTime}`);
    console.log(`   難易度: ${getDifficultyLabel(result.analysis.difficulty)}`);

    console.log("\n📝 構造分析:");
    console.log(`   ステップ数: ${result.analysis.steps}`);
    console.log(`   サブステップ数: ${result.analysis.substeps}`);
    console.log(`   コードブロック: ${result.analysis.codeBlocks}`);
    console.log(`   演習セクション: ${result.analysis.exercises}`);
    console.log(`   スクリーンショット: ${result.analysis.screenshots}`);
    console.log(`   総語数: ${result.analysis.wordCount}`);

    // レコメンデーション
    console.log("\n💡 推奨事項:");
    printRecommendations(result);
  }

  // サマリー
  if (results.length > 1) {
    const totalMinutes = results.reduce(
      (sum, r) => sum + r.estimatedMinutes,
      0,
    );
    console.log("\n" + "=".repeat(70));
    console.log(`📊 合計見積もり時間: ${formatTime(totalMinutes)}`);
    console.log(`   チュートリアル数: ${results.length}`);
  }
}

/**
 * 難易度ラベルを取得
 */
function getDifficultyLabel(difficulty) {
  const labels = {
    beginner: "🟢 初心者向け",
    intermediate: "🟡 中級者向け",
    advanced: "🔴 上級者向け",
  };
  return labels[difficulty] || difficulty;
}

/**
 * 推奨事項を表示
 */
function printRecommendations(result) {
  const { analysis, estimatedMinutes } = result;

  if (estimatedMinutes > 60) {
    console.log(
      "   ⚠️ 60分を超えています。複数のチュートリアルに分割を検討してください。",
    );
  }

  if (analysis.steps > 10) {
    console.log(
      "   ⚠️ ステップ数が多いです。セクション分割を検討してください。",
    );
  }

  if (analysis.screenshots === 0 && analysis.steps > 3) {
    console.log("   📷 スクリーンショットを追加すると理解しやすくなります。");
  }

  if (analysis.exercises === 0 && estimatedMinutes > 20) {
    console.log("   ✏️ 演習セクションの追加で学習定着が向上します。");
  }

  if (analysis.codeBlocks > 10) {
    console.log(
      "   💻 コードブロックが多いです。段階的な説明を心がけてください。",
    );
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "使用方法: node estimate-completion-time.mjs <file_or_directory>",
    );
    console.log("\n例:");
    console.log("  node estimate-completion-time.mjs docs/tutorials/");
    console.log("  node estimate-completion-time.mjs docs/quickstart.md");
    process.exit(1);
  }

  const target = args[0];
  const results = [];

  try {
    const stat = statSync(target);

    if (stat.isDirectory()) {
      // ディレクトリ内のMarkdownファイルを処理
      const files = readdirSync(target)
        .filter((f) => extname(f).toLowerCase() === ".md")
        .map((f) => join(target, f));

      for (const file of files) {
        results.push(analyzeFile(file));
      }
    } else {
      // 単一ファイルを処理
      results.push(analyzeFile(target));
    }

    if (results.length === 0) {
      console.log("⚠️ 分析対象のMarkdownファイルが見つかりません。");
      process.exit(1);
    }

    printResults(results);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
