#!/usr/bin/env node

/**
 * 翻訳準備度チェックスクリプト
 *
 * 使用方法:
 *   node check-translation-ready.mjs <file.md>
 *   node check-translation-ready.mjs <directory>
 *
 * 機能:
 *   - 翻訳しにくいパターンの検出
 *   - i18n対応度のスコアリング
 *   - 改善提案の出力
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

/**
 * 翻訳しにくいパターンの定義
 */
const PROBLEMATIC_PATTERNS = [
  {
    name: '長い文',
    pattern: /[^。！？\n]{80,}/g,
    severity: 'warning',
    message: '文が長すぎます（80文字超）。分割を検討してください。',
    penalty: 5
  },
  {
    name: '受動態',
    pattern: /(?:され|られ)(?:る|た|ます|ました)/g,
    severity: 'info',
    message: '受動態を検出。能動態への変更を検討してください。',
    penalty: 2
  },
  {
    name: '曖昧な代名詞',
    pattern: /(?:これ|それ|あれ|ここ|そこ|あそこ)(?:は|が|を|に|で)/g,
    severity: 'warning',
    message: '曖昧な代名詞を検出。具体的な名詞への置換を検討してください。',
    penalty: 3
  },
  {
    name: '文化依存の慣用句',
    pattern: /(?:一石二鳥|青写真|根回し|空気を読|顔が広|猫の手も借りたい|棚ぼた)/g,
    severity: 'error',
    message: '文化依存の慣用句を検出。直接的な表現に置き換えてください。',
    penalty: 10
  },
  {
    name: 'ハードコードされた日付形式',
    pattern: /\d{4}[\/\-年]\d{1,2}[\/\-月]\d{1,2}日?/g,
    severity: 'warning',
    message: 'ハードコードされた日付を検出。変数化を検討してください。',
    penalty: 3
  },
  {
    name: '通貨記号のハードコード',
    pattern: /[¥$€£]\d+(?:,\d{3})*/g,
    severity: 'warning',
    message: 'ハードコードされた通貨を検出。変数化を検討してください。',
    penalty: 3
  },
  {
    name: '文字列結合パターン',
    pattern: /["'`][^"'`]+["'`]\s*\+\s*[^+]+\+\s*["'`]/g,
    severity: 'error',
    message: '文字列結合を検出。プレースホルダーの使用を検討してください。',
    penalty: 8
  },
  {
    name: '略語（展開なし）',
    pattern: /(?<![（(])(?:API|CLI|UI|UX|PWA|SPA|SSR|CI\/CD)(?![）)])/g,
    severity: 'info',
    message: '略語を検出。初出時は展開することを検討してください。',
    penalty: 1
  },
  {
    name: '複数形の直接表現',
    pattern: /(?:\d+)\s*(?:個|件|枚|人|回|つ)の/g,
    severity: 'info',
    message: '数量表現を検出。複数形処理（ICU）を検討してください。',
    penalty: 2
  },
  {
    name: 'HTMLタグの埋め込み',
    pattern: /<(?:strong|em|b|i|a)[^>]*>[^<]+<\/(?:strong|em|b|i|a)>/g,
    severity: 'warning',
    message: 'HTMLタグを検出。プレースホルダーへの置換を検討してください。',
    penalty: 4
  }
];

/**
 * 良いパターンの定義（ボーナス）
 */
const GOOD_PATTERNS = [
  {
    name: 'プレースホルダー使用',
    pattern: /\{[a-z_]+\}/gi,
    bonus: 2,
    message: 'プレースホルダーを使用しています。'
  },
  {
    name: '箇条書き',
    pattern: /^[\-\*\d\.]\s+.+$/gm,
    bonus: 1,
    message: '箇条書きで構造化されています。'
  },
  {
    name: '短い文',
    pattern: /[^。！？\n]{10,40}[。！？]/g,
    bonus: 1,
    message: '適切な長さの文です。'
  },
  {
    name: '見出しによる構造化',
    pattern: /^#{1,4}\s+.+$/gm,
    bonus: 1,
    message: '見出しで構造化されています。'
  }
];

/**
 * ファイルを分析
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const issues = [];
  let totalPenalty = 0;
  let totalBonus = 0;

  // 問題パターンの検出
  for (const pattern of PROBLEMATIC_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);

    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.slice(0, match.index).split('\n').length;
      issues.push({
        type: 'problem',
        name: pattern.name,
        severity: pattern.severity,
        message: pattern.message,
        match: match[0].slice(0, 50) + (match[0].length > 50 ? '...' : ''),
        lineNumber,
        penalty: pattern.penalty
      });
      totalPenalty += pattern.penalty;
    }
  }

  // 良いパターンの検出
  for (const pattern of GOOD_PATTERNS) {
    const matches = content.match(pattern.pattern);
    if (matches && matches.length > 0) {
      totalBonus += pattern.bonus * Math.min(matches.length, 5); // 最大5回分
    }
  }

  // スコア計算（100点満点）
  const baseScore = 100;
  const score = Math.max(0, Math.min(100, baseScore - totalPenalty + totalBonus));

  return {
    filePath,
    lineCount: lines.length,
    charCount: content.length,
    issues,
    totalPenalty,
    totalBonus,
    score
  };
}

/**
 * ディレクトリ内のMarkdownファイルを取得
 */
function getMarkdownFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules') {
        getMarkdownFiles(fullPath, files);
      }
    } else if (extname(item).toLowerCase() === '.md') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 結果を表示
 */
function printResults(results) {
  console.log('\n🌐 翻訳準備度チェックレポート\n');
  console.log('='.repeat(70));

  // サマリー
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

  console.log('\n📊 サマリー');
  console.log(`   ファイル数: ${results.length}`);
  console.log(`   平均スコア: ${avgScore.toFixed(1)}/100`);
  console.log(`   総問題数: ${totalIssues}`);

  // スコアの評価
  let evaluation;
  if (avgScore >= 90) {
    evaluation = '🌟 優秀 - 翻訳準備完了';
  } else if (avgScore >= 75) {
    evaluation = '✅ 良好 - 軽微な改善推奨';
  } else if (avgScore >= 60) {
    evaluation = '⚠️ 要改善 - 翻訳前の修正推奨';
  } else {
    evaluation = '❌ 要修正 - 翻訳前の大幅修正必要';
  }
  console.log(`   評価: ${evaluation}`);

  // ファイルごとの詳細
  console.log('\n📄 ファイル別詳細\n');

  for (const result of results.sort((a, b) => a.score - b.score)) {
    const scoreIcon = result.score >= 80 ? '✅' :
                      result.score >= 60 ? '⚠️' : '❌';

    console.log(`${scoreIcon} ${basename(result.filePath)}`);
    console.log(`   スコア: ${result.score}/100`);
    console.log(`   問題数: ${result.issues.length}`);

    if (result.issues.length > 0) {
      // 重要度別に集計
      const errorCount = result.issues.filter(i => i.severity === 'error').length;
      const warningCount = result.issues.filter(i => i.severity === 'warning').length;
      const infoCount = result.issues.filter(i => i.severity === 'info').length;

      if (errorCount > 0) console.log(`   ❌ エラー: ${errorCount}`);
      if (warningCount > 0) console.log(`   ⚠️ 警告: ${warningCount}`);
      if (infoCount > 0) console.log(`   ℹ️ 情報: ${infoCount}`);

      // 主要な問題を表示（最大5件）
      const topIssues = result.issues
        .sort((a, b) => b.penalty - a.penalty)
        .slice(0, 5);

      for (const issue of topIssues) {
        const icon = issue.severity === 'error' ? '❌' :
                     issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`     ${icon} 行${issue.lineNumber}: ${issue.name}`);
        console.log(`        "${issue.match}"`);
      }
    }
    console.log('');
  }

  // 改善提案
  console.log('\n💡 改善提案:\n');

  // 問題パターンの集計
  const patternCounts = {};
  for (const result of results) {
    for (const issue of result.issues) {
      patternCounts[issue.name] = (patternCounts[issue.name] || 0) + 1;
    }
  }

  const sortedPatterns = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  for (const [pattern, count] of sortedPatterns) {
    const patternDef = PROBLEMATIC_PATTERNS.find(p => p.name === pattern);
    console.log(`   ${count}件: ${pattern}`);
    if (patternDef) {
      console.log(`      → ${patternDef.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));

  return avgScore >= 60;
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node check-translation-ready.mjs <file.md|directory>');
    console.log('\n例:');
    console.log('  node check-translation-ready.mjs docs/guide.md');
    console.log('  node check-translation-ready.mjs docs/');
    process.exit(1);
  }

  const target = args[0];

  if (!existsSync(target)) {
    console.error(`エラー: "${target}" が見つかりません`);
    process.exit(1);
  }

  const stat = statSync(target);
  let files;

  if (stat.isDirectory()) {
    files = getMarkdownFiles(target);
    console.log(`\n🔍 ${target} 内のファイルをチェック中...`);
  } else {
    files = [target];
    console.log(`\n🔍 ${target} をチェック中...`);
  }

  if (files.length === 0) {
    console.log('Markdownファイルが見つかりませんでした。');
    process.exit(0);
  }

  console.log(`   ${files.length} 個のファイルを分析します`);

  try {
    const results = files.map(analyzeFile);
    const success = printResults(results);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
