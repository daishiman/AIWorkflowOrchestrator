#!/usr/bin/env node

/**
 * ドキュメント可読性スコア測定スクリプト
 *
 * 使用方法:
 *   node measure-readability.mjs <file_or_directory>
 *
 * 機能:
 *   - Flesch Reading Ease スコア算出
 *   - 文の長さ分析
 *   - 専門用語検出
 *   - 日本語対応（文字数ベース）
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

// 専門用語リスト（検出対象）
const TECHNICAL_TERMS = [
  "API",
  "エンドポイント",
  "リクエスト",
  "レスポンス",
  "トークン",
  "パラメータ",
  "クエリ",
  "キャッシュ",
  "デプロイ",
  "マイグレーション",
  "コンフィグ",
  "インスタンス",
  "スキーマ",
  "バリデーション",
];

/**
 * Markdownファイルからプレーンテキストを抽出
 */
function extractText(markdown) {
  return (
    markdown
      // コードブロックを除去
      .replace(/```[\s\S]*?```/g, "")
      // インラインコードを除去
      .replace(/`[^`]+`/g, "")
      // 見出しマーカーを除去
      .replace(/^#{1,6}\s+/gm, "")
      // リストマーカーを除去
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // リンクをテキストに変換
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // 画像を除去
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      // テーブルマーカーを除去
      .replace(/\|/g, " ")
      .replace(/[-:]+/g, "")
      // 複数の空白を単一に
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * 日本語の文を分割
 */
function splitSentences(text) {
  // 日本語と英語の文末を考慮
  return text.split(/[。！？!?.]+/).filter((s) => s.trim().length > 0);
}

/**
 * 日本語の単語数をカウント（文字数ベース）
 * 日本語は約2文字 = 1単語として計算
 */
function countWords(text) {
  // 英単語
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  // 日本語文字（ひらがな、カタカナ、漢字）
  const japaneseChars = (
    text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g) || []
  ).length;
  // 日本語は2文字で1単語として計算
  return englishWords + Math.ceil(japaneseChars / 2);
}

/**
 * Flesch Reading Ease スコア計算（日本語対応版）
 *
 * 本来の計算式: 206.835 - 1.015 × (総単語数/総文数) - 84.6 × (総音節数/総単語数)
 * 日本語版は簡略化: 文の長さと文字の複雑さで近似
 */
function calculateFleschScore(text) {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;

  const totalWords = countWords(text);
  const avgWordsPerSentence = totalWords / sentences.length;

  // 日本語版のスコア算出（簡略化）
  // 文が短いほど読みやすい
  let score = 100 - avgWordsPerSentence * 3;

  // スコアを0-100の範囲に制限
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 文の長さ分析
 */
function analyzeSentenceLength(text) {
  const sentences = splitSentences(text);
  const lengths = sentences.map((s) => countWords(s));

  const longSentences = sentences.filter((s, i) => lengths[i] > 25);

  return {
    total: sentences.length,
    avgLength:
      lengths.length > 0
        ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
        : 0,
    maxLength: Math.max(...lengths, 0),
    longSentences: longSentences.length,
    longSentenceExamples: longSentences.slice(0, 3),
  };
}

/**
 * 専門用語を検出
 */
function detectTechnicalTerms(text) {
  const found = [];
  for (const term of TECHNICAL_TERMS) {
    const regex = new RegExp(term, "gi");
    const matches = text.match(regex);
    if (matches) {
      found.push({ term, count: matches.length });
    }
  }
  return found.sort((a, b) => b.count - a.count);
}

/**
 * ファイルを分析
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const text = extractText(content);

  const fleschScore = calculateFleschScore(text);
  const sentenceAnalysis = analyzeSentenceLength(text);
  const technicalTerms = detectTechnicalTerms(text);

  return {
    file: filePath,
    fleschScore,
    fleschGrade: getFleschGrade(fleschScore),
    sentenceAnalysis,
    technicalTerms,
    totalWords: countWords(text),
  };
}

/**
 * Flesch スコアの評価
 */
function getFleschGrade(score) {
  if (score >= 90) return "非常に読みやすい（小学生レベル）";
  if (score >= 80) return "読みやすい（中学生レベル）";
  if (score >= 70) return "やや読みやすい（高校生レベル）";
  if (score >= 60) return "標準（一般成人レベル）";
  if (score >= 50) return "やや難しい";
  if (score >= 30) return "難しい";
  return "非常に難しい";
}

/**
 * 結果を表示
 */
function printResults(results) {
  console.log("\n📊 ドキュメント可読性分析レポート\n");
  console.log("=".repeat(60));

  for (const result of results) {
    console.log(`\n📄 ${result.file}`);
    console.log("-".repeat(60));

    // Fleschスコア
    const scoreEmoji =
      result.fleschScore >= 70 ? "✅" : result.fleschScore >= 50 ? "⚠️" : "❌";
    console.log(
      `${scoreEmoji} Flesch スコア: ${result.fleschScore}/100 (${result.fleschGrade})`,
    );

    // 文の分析
    console.log(`\n📝 文の分析:`);
    console.log(`   総文数: ${result.sentenceAnalysis.total}`);
    console.log(`   平均文長: ${result.sentenceAnalysis.avgLength} 語/文`);
    console.log(`   最長文: ${result.sentenceAnalysis.maxLength} 語`);

    if (result.sentenceAnalysis.longSentences > 0) {
      console.log(
        `   ⚠️ 長い文（25語超）: ${result.sentenceAnalysis.longSentences} 文`,
      );
    }

    // 専門用語
    if (result.technicalTerms.length > 0) {
      console.log(`\n🔧 検出された専門用語:`);
      for (const term of result.technicalTerms.slice(0, 5)) {
        console.log(`   - ${term.term}: ${term.count}回`);
      }
    }

    // 総単語数
    console.log(`\n📈 総単語数: ${result.totalWords}`);
  }

  // サマリー
  if (results.length > 1) {
    const avgScore = Math.round(
      results.reduce((a, r) => a + r.fleschScore, 0) / results.length,
    );
    console.log("\n" + "=".repeat(60));
    console.log(`📊 全体平均スコア: ${avgScore}/100`);
  }

  console.log("\n💡 推奨事項:");
  console.log("   - スコア70以上を目標に文章を調整してください");
  console.log("   - 25語を超える文は分割を検討してください");
  console.log(
    "   - 専門用語には説明を追加するか、平易な言葉に置き換えてください",
  );
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node measure-readability.mjs <file_or_directory>");
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

    printResults(results);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
