#!/usr/bin/env node
/**
 * ユースケース検証スクリプト
 *
 * ユースケース記述の完全性と一貫性を検証します。
 *
 * 使用方法:
 *   node validate-use-case.mjs <ユースケース.md>
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// 必須要素チェック
const REQUIRED_ELEMENTS = [
  { pattern: /##?\s*(概要|説明|Description)/i, name: '概要', required: true },
  { pattern: /##?\s*(アクター|Actor)/i, name: 'アクター', required: true },
  { pattern: /##?\s*(前提条件|Precondition)/i, name: '前提条件', required: true },
  { pattern: /##?\s*(トリガー|Trigger)/i, name: 'トリガー', required: true },
  { pattern: /##?\s*(メインシナリオ|Main|基本フロー|正常系)/i, name: 'メインシナリオ', required: true },
  { pattern: /##?\s*(代替シナリオ|Alternative)/i, name: '代替シナリオ', required: false },
  { pattern: /##?\s*(例外シナリオ|Exception)/i, name: '例外シナリオ', required: false },
  { pattern: /##?\s*(事後条件|Postcondition)/i, name: '事後条件', required: true }
];

// シナリオステップのパターン
const STEP_PATTERNS = {
  numbered: /^\s*(\d+)\.\s+(.+)/,
  lettered: /^\s*([A-Z]\d*)\.\s+(.+)/,
  exception: /^\s*(E\d+-\d+)\.\s+(.+)/
};

/**
 * ユースケースを検証
 */
function validateUseCase(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  console.log('\n📋 ユースケース検証レポート');
  console.log('='.repeat(50));
  console.log(`ファイル: ${filePath}\n`);

  // 1. 必須要素チェック
  console.log('📑 必須要素チェック...');
  const foundElements = [];
  for (const element of REQUIRED_ELEMENTS) {
    const found = element.pattern.test(content);
    foundElements.push({ ...element, found });

    if (element.required && !found) {
      issues.push({
        type: 'structure',
        severity: 'error',
        message: `必須要素「${element.name}」が見つかりません`
      });
    } else if (!element.required && !found) {
      issues.push({
        type: 'structure',
        severity: 'info',
        message: `推奨要素「${element.name}」が見つかりません`
      });
    }
  }

  // 2. アクター定義チェック
  console.log('👤 アクター定義チェック...');
  const actorSection = content.match(/##?\s*(アクター|Actor)[\s\S]*?(?=##|$)/i);
  if (actorSection) {
    const actorContent = actorSection[0];
    if (!/プライマリ|Primary/i.test(actorContent)) {
      issues.push({
        type: 'actor',
        severity: 'warning',
        message: 'プライマリアクターが明示されていません'
      });
    }
  }

  // 3. シナリオステップの連続性チェック
  console.log('📝 シナリオステップチェック...');
  let lineNum = 0;
  let lastStepNum = 0;
  let inMainScenario = false;

  for (const line of lines) {
    lineNum++;

    if (/##?\s*(メインシナリオ|Main|基本フロー|正常系)/i.test(line)) {
      inMainScenario = true;
      lastStepNum = 0;
    } else if (/##/.test(line)) {
      inMainScenario = false;
    }

    if (inMainScenario) {
      const match = line.match(STEP_PATTERNS.numbered);
      if (match) {
        const stepNum = parseInt(match[1]);
        if (stepNum !== lastStepNum + 1 && lastStepNum > 0) {
          issues.push({
            type: 'sequence',
            severity: 'warning',
            line: lineNum,
            message: `ステップ番号が連続していません（${lastStepNum} → ${stepNum}）`
          });
        }
        lastStepNum = stepNum;

        // 主語チェック
        const stepContent = match[2];
        if (!/^(ユーザー|システム|アクター|User|System|Actor)/i.test(stepContent)) {
          issues.push({
            type: 'step',
            severity: 'info',
            line: lineNum,
            message: 'ステップの主語が不明確です（ユーザー/システムを明示推奨）'
          });
        }
      }
    }
  }

  // 4. 代替シナリオの参照チェック
  console.log('🔀 シナリオ参照チェック...');
  const branchReferences = content.match(/ステップ\s*\d+|Step\s*\d+|→\s*ステップ|→\s*Step/gi) || [];
  const stepNumbers = content.match(/^\s*(\d+)\.\s+/gm) || [];
  const maxStep = stepNumbers.length > 0
    ? Math.max(...stepNumbers.map(s => parseInt(s.match(/\d+/)[0])))
    : 0;

  for (const ref of branchReferences) {
    const refNum = parseInt(ref.match(/\d+/)?.[0] || 0);
    if (refNum > maxStep) {
      issues.push({
        type: 'reference',
        severity: 'error',
        message: `存在しないステップへの参照: ${ref}`
      });
    }
  }

  // 5. ゴール明確性チェック
  console.log('🎯 ゴール明確性チェック...');
  if (!/##?\s*(ゴール|Goal|目標)/i.test(content)) {
    issues.push({
      type: 'goal',
      severity: 'warning',
      message: 'ユースケースのゴールが明示されていません'
    });
  }

  return {
    issues,
    stats: {
      lines: lines.length,
      elements: foundElements.filter(e => e.found).length,
      totalElements: REQUIRED_ELEMENTS.length
    }
  };
}

/**
 * 結果を表示
 */
function displayResults(result) {
  const { issues, stats } = result;

  console.log('\n' + '='.repeat(50));
  console.log('📊 検証結果サマリー');
  console.log('='.repeat(50));
  console.log(`総行数: ${stats.lines}`);
  console.log(`要素充足: ${stats.elements}/${stats.totalElements}`);
  console.log(`検出された問題: ${issues.length}`);

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  console.log(`  - エラー: ${errors.length}`);
  console.log(`  - 警告: ${warnings.length}`);
  console.log(`  - 情報: ${infos.length}`);

  if (issues.length > 0) {
    console.log('\n' + '='.repeat(50));
    console.log('📝 詳細');
    console.log('='.repeat(50));

    for (const issue of issues) {
      const icon = issue.severity === 'error' ? '❌' :
                   issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      if (issue.line) {
        console.log(`${icon} [${issue.severity.toUpperCase()}] 行${issue.line}: ${issue.message}`);
      } else {
        console.log(`${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
      }
    }
  }

  // 完成度スコア
  const elementScore = (stats.elements / stats.totalElements) * 50;
  const errorPenalty = errors.length * 10;
  const warningPenalty = warnings.length * 3;
  const score = Math.max(0, Math.min(100, elementScore + 50 - errorPenalty - warningPenalty));

  console.log('\n' + '='.repeat(50));
  console.log(`📈 完成度スコア: ${Math.round(score)}/100`);

  if (score >= 80) {
    console.log('✅ 良好: ユースケースは十分に定義されています');
  } else if (score >= 60) {
    console.log('⚠️  要改善: いくつかの要素を補完してください');
  } else {
    console.log('❌ 不十分: 必須要素を追加してください');
  }
  console.log('='.repeat(50) + '\n');

  return errors.length === 0 ? 0 : 1;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node validate-use-case.mjs <ユースケース.md>');
    console.log('\n例:');
    console.log('  node validate-use-case.mjs ./docs/use-cases/UC-001.md');
    process.exit(1);
  }

  const filePath = resolve(args[0]);

  if (!existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const result = validateUseCase(content, filePath);
    const exitCode = displayResults(result);
    process.exit(exitCode);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
