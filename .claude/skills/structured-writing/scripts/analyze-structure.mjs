#!/usr/bin/env node
/**
 * 文書構造分析スクリプト
 *
 * 使用方法: node analyze-structure.mjs <directory>
 *
 * 分析項目:
 * - トピックタイプの分布
 * - 見出し階層の深さ
 * - モジュール化の度合い
 * - 再利用パターンの検出
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const TOPIC_PATTERNS = {
  concept: /^#\s+(.*とは|.*について|.*の概要|what is|overview|introduction)/i,
  task: /^#\s+(.*する|.*方法|.*手順|how to|configure|install|setup|create)/i,
  reference: /^#\s+(.*リファレンス|.*一覧|.*仕様|reference|api|specification)/i
};

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const result = {
    path: filePath,
    topicType: 'unknown',
    headings: [],
    maxDepth: 0,
    wordCount: 0,
    hasMetadata: false,
    includes: [],
    links: []
  };

  // メタデータチェック
  if (content.startsWith('---')) {
    result.hasMetadata = true;
  }

  // トピックタイプ判定
  const firstHeading = lines.find(l => l.startsWith('# '));
  if (firstHeading) {
    for (const [type, pattern] of Object.entries(TOPIC_PATTERNS)) {
      if (pattern.test(firstHeading)) {
        result.topicType = type;
        break;
      }
    }
  }

  // 見出し分析
  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      result.headings.push({ level, text: headingMatch[2] });
      result.maxDepth = Math.max(result.maxDepth, level);
    }
  }

  // インクルード検出
  const includeMatches = content.matchAll(/\{\{(?:include|snippet|conref):([^}]+)\}\}/g);
  for (const match of includeMatches) {
    result.includes.push(match[1]);
  }

  // リンク検出
  const linkMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of linkMatches) {
    if (match[2].endsWith('.md')) {
      result.links.push(match[2]);
    }
  }

  // ワードカウント
  result.wordCount = content.replace(/[#`*_\[\]()]/g, '').split(/\s+/).filter(w => w).length;

  return result;
}

function analyzeDirectory(dir) {
  const results = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        walk(fullPath);
      } else if (stat.isFile() && extname(entry) === '.md') {
        results.push(analyzeFile(fullPath));
      }
    }
  }

  walk(dir);
  return results;
}

function generateReport(results) {
  const report = {
    summary: {
      totalFiles: results.length,
      byTopicType: {},
      avgWordCount: 0,
      avgMaxDepth: 0,
      withMetadata: 0,
      totalIncludes: 0,
      totalLinks: 0
    },
    issues: [],
    recommendations: []
  };

  // 集計
  let totalWords = 0;
  let totalDepth = 0;

  for (const r of results) {
    // トピックタイプ
    report.summary.byTopicType[r.topicType] = (report.summary.byTopicType[r.topicType] || 0) + 1;

    // ワードカウント
    totalWords += r.wordCount;

    // 深さ
    totalDepth += r.maxDepth;

    // メタデータ
    if (r.hasMetadata) report.summary.withMetadata++;

    // インクルード・リンク
    report.summary.totalIncludes += r.includes.length;
    report.summary.totalLinks += r.links.length;

    // 問題検出
    if (r.maxDepth > 4) {
      report.issues.push({
        file: r.path,
        issue: '見出し階層が深すぎます（推奨: 4レベルまで）',
        severity: 'warning'
      });
    }

    if (r.wordCount > 2000) {
      report.issues.push({
        file: r.path,
        issue: 'コンテンツが長すぎる可能性（分割を検討）',
        severity: 'info'
      });
    }

    if (!r.hasMetadata) {
      report.issues.push({
        file: r.path,
        issue: 'YAMLメタデータがありません',
        severity: 'info'
      });
    }

    if (r.topicType === 'unknown') {
      report.issues.push({
        file: r.path,
        issue: 'トピックタイプを判別できません（タイトルを見直し）',
        severity: 'warning'
      });
    }
  }

  report.summary.avgWordCount = Math.round(totalWords / results.length);
  report.summary.avgMaxDepth = (totalDepth / results.length).toFixed(1);

  // 推奨事項
  const unknownRatio = (report.summary.byTopicType.unknown || 0) / results.length;
  if (unknownRatio > 0.3) {
    report.recommendations.push('トピックタイプが不明なファイルが多いです。命名規則を見直してください。');
  }

  const metadataRatio = report.summary.withMetadata / results.length;
  if (metadataRatio < 0.5) {
    report.recommendations.push('YAMLメタデータを追加すると検索性と管理性が向上します。');
  }

  if (report.summary.totalIncludes === 0) {
    report.recommendations.push('コンテンツ再利用（include）が検出されませんでした。共通コンテンツの抽出を検討してください。');
  }

  return report;
}

// メイン実行
const targetDir = process.argv[2] || '.';

console.log(`\n📊 文書構造分析: ${targetDir}\n`);

const results = analyzeDirectory(targetDir);
const report = generateReport(results);

console.log('=== サマリー ===');
console.log(`総ファイル数: ${report.summary.totalFiles}`);
console.log(`平均文字数: ${report.summary.avgWordCount}`);
console.log(`平均見出し深度: ${report.summary.avgMaxDepth}`);
console.log(`メタデータあり: ${report.summary.withMetadata} (${Math.round(report.summary.withMetadata / report.summary.totalFiles * 100)}%)`);
console.log(`インクルード数: ${report.summary.totalIncludes}`);
console.log(`内部リンク数: ${report.summary.totalLinks}`);

console.log('\n=== トピックタイプ分布 ===');
for (const [type, count] of Object.entries(report.summary.byTopicType)) {
  const percent = Math.round(count / report.summary.totalFiles * 100);
  console.log(`  ${type}: ${count} (${percent}%)`);
}

if (report.issues.length > 0) {
  console.log('\n=== 問題点 ===');
  const warnings = report.issues.filter(i => i.severity === 'warning');
  const infos = report.issues.filter(i => i.severity === 'info');

  if (warnings.length > 0) {
    console.log(`⚠️  警告: ${warnings.length}件`);
    warnings.slice(0, 5).forEach(i => console.log(`   - ${i.file}: ${i.issue}`));
    if (warnings.length > 5) console.log(`   ... 他 ${warnings.length - 5}件`);
  }

  if (infos.length > 0) {
    console.log(`ℹ️  情報: ${infos.length}件`);
    infos.slice(0, 3).forEach(i => console.log(`   - ${i.file}: ${i.issue}`));
    if (infos.length > 3) console.log(`   ... 他 ${infos.length - 3}件`);
  }
}

if (report.recommendations.length > 0) {
  console.log('\n=== 推奨事項 ===');
  report.recommendations.forEach(r => console.log(`💡 ${r}`));
}

console.log('');
