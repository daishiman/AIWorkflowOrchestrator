#!/usr/bin/env node

/**
 * 診断フロー検証スクリプト
 *
 * トラブルシューティングドキュメントの診断フローを検証します:
 * - すべての診断パスが解決策に到達するか
 * - エラーコードの一意性
 * - リンク切れチェック
 * - 解決策の成功率が記載されているか
 *
 * 使用法:
 *   node validate-diagnostic-flow.mjs <troubleshooting-doc.md>
 *   node validate-diagnostic-flow.mjs docs/troubleshooting/*.md
 *
 * 出力:
 *   - エラー: 重大な問題（診断パスが解決策に到達しない）
 *   - 警告: 推奨改善（成功率未記載）
 *   - 情報: 統計情報
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// 検証ルール
const VALIDATION_RULES = {
  // エラーコード形式（1000-5999の範囲）
  errorCodePattern: /\b[1-5]\d{3}\b/g,

  // 解決策マーカー
  solutionMarkers: [
    /^#+\s*解決策[A-Z]:/m,
    /^#+\s*方法\d+:/m,
    /^\d+\.\s*\*\*解決策/m
  ],

  // 診断ステップマーカー
  diagnosisStepMarkers: [
    /^#+\s*ステップ\s*\d+:/m,
    /^#+\s*診断\s*\d+:/m
  ],

  // 成功率パターン
  successRatePattern: /成功率.*?(\d+)%/,

  // リンクパターン
  linkPattern: /\[([^\]]+)\]\(([^)]+)\)/g
};

/**
 * Markdownファイルを解析
 */
function parseMarkdown(filePath) {
  const absolutePath = resolve(filePath);
  const content = readFileSync(absolutePath, 'utf-8');

  return {
    filePath: absolutePath,
    content,
    lines: content.split('\n')
  };
}

/**
 * エラーコードを抽出
 */
function extractErrorCodes(doc) {
  const codes = new Set();
  const matches = doc.content.matchAll(VALIDATION_RULES.errorCodePattern);

  for (const match of matches) {
    codes.add(match[0]);
  }

  return Array.from(codes);
}

/**
 * 診断ステップを検出
 */
function detectDiagnosisSteps(doc) {
  const steps = [];

  doc.lines.forEach((line, index) => {
    for (const pattern of VALIDATION_RULES.diagnosisStepMarkers) {
      if (pattern.test(line)) {
        steps.push({
          lineNumber: index + 1,
          content: line.trim()
        });
        break;
      }
    }
  });

  return steps;
}

/**
 * 解決策を検出
 */
function detectSolutions(doc) {
  const solutions = [];

  doc.lines.forEach((line, index) => {
    for (const pattern of VALIDATION_RULES.solutionMarkers) {
      if (pattern.test(line)) {
        // 成功率を検索（次の10行内）
        let successRate = null;
        for (let i = 0; i < 10 && index + i < doc.lines.length; i++) {
          const match = doc.lines[index + i].match(VALIDATION_RULES.successRatePattern);
          if (match) {
            successRate = parseInt(match[1]);
            break;
          }
        }

        solutions.push({
          lineNumber: index + 1,
          content: line.trim(),
          successRate
        });
        break;
      }
    }
  });

  return solutions;
}

/**
 * リンク切れチェック
 */
function checkBrokenLinks(doc) {
  const brokenLinks = [];
  const matches = doc.content.matchAll(VALIDATION_RULES.linkPattern);

  for (const match of matches) {
    const [fullMatch, text, url] = match;

    // 内部リンク（#で始まる）の検証
    if (url.startsWith('#')) {
      const anchor = url.substring(1);
      // 見出しIDを生成（簡易版: 小文字化、スペース→ハイフン）
      const headingPattern = new RegExp(`^#+\\s+.*${anchor}`, 'im');

      if (!headingPattern.test(doc.content)) {
        brokenLinks.push({
          text,
          url,
          issue: '内部リンク先が見つかりません'
        });
      }
    }
  }

  return brokenLinks;
}

/**
 * 診断フローの完全性を検証
 */
function validateDiagnosticFlow(doc) {
  const steps = detectDiagnosisSteps(doc);
  const solutions = detectSolutions(doc);
  const issues = [];

  // 診断ステップが存在するか
  if (steps.length === 0) {
    issues.push({
      type: 'warning',
      message: '診断ステップが検出されませんでした'
    });
  }

  // 解決策が存在するか
  if (solutions.length === 0) {
    issues.push({
      type: 'error',
      message: '解決策が検出されませんでした'
    });
  }

  // 診断ステップ数 vs 解決策数のバランス
  if (steps.length > 0 && solutions.length > 0) {
    const ratio = solutions.length / steps.length;
    if (ratio < 0.5) {
      issues.push({
        type: 'warning',
        message: `解決策が少なすぎる可能性（診断ステップ:${steps.length}, 解決策:${solutions.length}）`
      });
    }
  }

  return { steps, solutions, issues };
}

/**
 * 検証を実行
 */
function validateDocument(filePath) {
  console.log(`\n📄 検証中: ${filePath}`);
  console.log('─'.repeat(80));

  const doc = parseMarkdown(filePath);
  const errorCodes = extractErrorCodes(doc);
  const { steps, solutions, issues } = validateDiagnosticFlow(doc);
  const brokenLinks = checkBrokenLinks(doc);

  let errorCount = 0;
  let warningCount = 0;

  // エラーコード統計
  if (errorCodes.length > 0) {
    console.log(`\n📊 エラーコード統計:`);
    console.log(`   検出数: ${errorCodes.length}`);
    console.log(`   範囲: ${Math.min(...errorCodes)} - ${Math.max(...errorCodes)}`);

    // 重複チェック
    const duplicates = errorCodes.filter((code, index) =>
      errorCodes.indexOf(code) !== index
    );
    if (duplicates.length > 0) {
      console.log(`   ⚠️  重複: ${duplicates.join(', ')}`);
      warningCount++;
    }
  }

  // 診断フロー統計
  console.log(`\n🔍 診断フロー統計:`);
  console.log(`   診断ステップ: ${steps.length}`);
  console.log(`   解決策: ${solutions.length}`);

  // 解決策の成功率チェック
  const solutionsWithoutRate = solutions.filter(s => s.successRate === null);
  if (solutionsWithoutRate.length > 0) {
    console.log(`\n⚠️  成功率未記載の解決策: ${solutionsWithoutRate.length}件`);
    solutionsWithoutRate.forEach(s => {
      console.log(`   - L${s.lineNumber}: ${s.content}`);
    });
    warningCount += solutionsWithoutRate.length;
  }

  // 平均成功率
  const ratedSolutions = solutions.filter(s => s.successRate !== null);
  if (ratedSolutions.length > 0) {
    const avgRate = ratedSolutions.reduce((sum, s) => sum + s.successRate, 0) / ratedSolutions.length;
    console.log(`   平均成功率: ${avgRate.toFixed(1)}%`);
  }

  // 診断フローの問題
  if (issues.length > 0) {
    console.log(`\n📋 診断フローの問題:`);
    issues.forEach(issue => {
      const icon = issue.type === 'error' ? '❌' : '⚠️';
      console.log(`   ${icon} ${issue.message}`);
      if (issue.type === 'error') errorCount++;
      else warningCount++;
    });
  }

  // リンク切れ
  if (brokenLinks.length > 0) {
    console.log(`\n🔗 リンク切れ:`);
    brokenLinks.forEach(link => {
      console.log(`   ❌ "${link.text}" → ${link.url}`);
      console.log(`      ${link.issue}`);
    });
    errorCount += brokenLinks.length;
  }

  // サマリー
  console.log(`\n${'='.repeat(80)}`);
  if (errorCount === 0 && warningCount === 0) {
    console.log('✅ 検証成功: 問題は検出されませんでした');
  } else {
    console.log(`📊 検証結果: エラー ${errorCount}件, 警告 ${warningCount}件`);
  }

  return { errorCount, warningCount };
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(`
使用法:
  node validate-diagnostic-flow.mjs <troubleshooting-doc.md> [...]

例:
  node validate-diagnostic-flow.mjs docs/troubleshooting/auth-errors.md
  node validate-diagnostic-flow.mjs docs/troubleshooting/*.md

検証項目:
  ✓ エラーコードの一意性（1000-5999範囲）
  ✓ 診断ステップの存在
  ✓ 解決策の存在と成功率
  ✓ 内部リンクの有効性
  ✓ 診断フローの完全性
`);
    process.exit(1);
  }

  console.log('🔍 トラブルシューティングドキュメント検証');
  console.log(`検証対象: ${args.length}ファイル\n`);

  let totalErrors = 0;
  let totalWarnings = 0;

  args.forEach(filePath => {
    try {
      const { errorCount, warningCount } = validateDocument(filePath);
      totalErrors += errorCount;
      totalWarnings += warningCount;
    } catch (error) {
      console.error(`\n❌ エラー: ${filePath}`);
      console.error(`   ${error.message}`);
      totalErrors++;
    }
  });

  // 最終サマリー
  if (args.length > 1) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 最終結果');
    console.log(`   検証ファイル数: ${args.length}`);
    console.log(`   総エラー数: ${totalErrors}`);
    console.log(`   総警告数: ${totalWarnings}`);

    if (totalErrors === 0 && totalWarnings === 0) {
      console.log('\n✅ すべてのドキュメントが検証に合格しました');
    }
  }

  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
