#!/usr/bin/env node
/**
 * 受け入れ基準検証スクリプト
 *
 * Given-When-Then形式の受け入れ基準の構文と完全性を検証します。
 *
 * 使用方法:
 *   node validate-acceptance-criteria.mjs <受け入れ基準.md>
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// GWT構文パターン
const GWT_PATTERNS = {
  scenario: /Scenario(?:\s+Outline)?:\s*(.+)/gi,
  given: /Given\s+(.+)/gi,
  when: /When\s+(.+)/gi,
  then: /Then\s+(.+)/gi,
  and: /And\s+(.+)/gi,
  but: /But\s+(.+)/gi,
  examples: /Examples:/gi
};

// 曖昧な表現パターン
const VAGUE_PATTERNS = [
  { pattern: /正しく|適切に|うまく/g, message: '曖昧な表現: 具体的な結果に変換してください' },
  { pattern: /高速|速く|遅く/g, message: '曖昧な時間表現: 具体的な数値に変換してください' },
  { pattern: /多く|少なく|大量/g, message: '曖昧な量表現: 具体的な数値に変換してください' },
  { pattern: /すべて|いくつか/g, message: '曖昧な範囲: 具体的に列挙してください' }
];

/**
 * シナリオを解析
 */
function parseScenarios(content) {
  const scenarios = [];
  const lines = content.split('\n');
  let currentScenario = null;
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;
    const trimmedLine = line.trim();

    // シナリオ開始
    const scenarioMatch = trimmedLine.match(/^Scenario(?:\s+Outline)?:\s*(.+)/i);
    if (scenarioMatch) {
      if (currentScenario) {
        scenarios.push(currentScenario);
      }
      currentScenario = {
        name: scenarioMatch[1],
        line: lineNum,
        hasGiven: false,
        hasWhen: false,
        hasThen: false,
        hasExamples: false,
        isOutline: /Outline/i.test(trimmedLine),
        steps: []
      };
      continue;
    }

    if (currentScenario) {
      if (/^Given\s/i.test(trimmedLine)) {
        currentScenario.hasGiven = true;
        currentScenario.steps.push({ type: 'Given', content: trimmedLine, line: lineNum });
      } else if (/^When\s/i.test(trimmedLine)) {
        currentScenario.hasWhen = true;
        currentScenario.steps.push({ type: 'When', content: trimmedLine, line: lineNum });
      } else if (/^Then\s/i.test(trimmedLine)) {
        currentScenario.hasThen = true;
        currentScenario.steps.push({ type: 'Then', content: trimmedLine, line: lineNum });
      } else if (/^And\s/i.test(trimmedLine)) {
        currentScenario.steps.push({ type: 'And', content: trimmedLine, line: lineNum });
      } else if (/^But\s/i.test(trimmedLine)) {
        currentScenario.steps.push({ type: 'But', content: trimmedLine, line: lineNum });
      } else if (/^Examples:/i.test(trimmedLine)) {
        currentScenario.hasExamples = true;
      }
    }
  }

  if (currentScenario) {
    scenarios.push(currentScenario);
  }

  return scenarios;
}

/**
 * 受け入れ基準を検証
 */
function validateAcceptanceCriteria(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  console.log('\n📋 受け入れ基準検証レポート');
  console.log('='.repeat(50));
  console.log(`ファイル: ${filePath}\n`);

  // 1. シナリオ解析
  console.log('📑 シナリオ構造チェック...');
  const scenarios = parseScenarios(content);

  if (scenarios.length === 0) {
    issues.push({
      type: 'structure',
      severity: 'error',
      message: 'シナリオが見つかりません（Scenario: で始まる記述が必要）'
    });
  }

  // 2. 各シナリオの検証
  for (const scenario of scenarios) {
    // GWT構造チェック
    if (!scenario.hasGiven) {
      issues.push({
        type: 'structure',
        severity: 'error',
        line: scenario.line,
        message: `シナリオ「${scenario.name}」にGiven（前提条件）がありません`
      });
    }
    if (!scenario.hasWhen) {
      issues.push({
        type: 'structure',
        severity: 'error',
        line: scenario.line,
        message: `シナリオ「${scenario.name}」にWhen（アクション）がありません`
      });
    }
    if (!scenario.hasThen) {
      issues.push({
        type: 'structure',
        severity: 'error',
        line: scenario.line,
        message: `シナリオ「${scenario.name}」にThen（期待結果）がありません`
      });
    }

    // Scenario OutlineにはExamplesが必要
    if (scenario.isOutline && !scenario.hasExamples) {
      issues.push({
        type: 'structure',
        severity: 'error',
        line: scenario.line,
        message: `Scenario Outline「${scenario.name}」にExamplesがありません`
      });
    }

    // ステップ順序チェック（Given → When → Then）
    const types = scenario.steps.map(s => s.type);
    const givenIndex = types.indexOf('Given');
    const whenIndex = types.indexOf('When');
    const thenIndex = types.indexOf('Then');

    if (givenIndex > -1 && whenIndex > -1 && givenIndex > whenIndex) {
      issues.push({
        type: 'order',
        severity: 'warning',
        line: scenario.line,
        message: `シナリオ「${scenario.name}」でGivenがWhenの後にあります`
      });
    }
    if (whenIndex > -1 && thenIndex > -1 && whenIndex > thenIndex) {
      issues.push({
        type: 'order',
        severity: 'warning',
        line: scenario.line,
        message: `シナリオ「${scenario.name}」でWhenがThenの後にあります`
      });
    }
  }

  // 3. 曖昧表現チェック
  console.log('🔍 曖昧表現チェック...');
  let lineNum = 0;
  for (const line of lines) {
    lineNum++;
    for (const { pattern, message } of VAGUE_PATTERNS) {
      const matches = line.match(pattern);
      if (matches) {
        for (const match of matches) {
          issues.push({
            type: 'vague',
            severity: 'warning',
            line: lineNum,
            match,
            message
          });
        }
      }
    }
  }

  // 4. テスト可能性チェック
  console.log('✅ テスト可能性チェック...');
  for (const scenario of scenarios) {
    for (const step of scenario.steps) {
      if (step.type === 'Then') {
        // 具体的な検証がない場合
        if (!/表示|される|できる|なる|含む|\d+|true|false|エラー|成功|失敗/i.test(step.content)) {
          issues.push({
            type: 'testability',
            severity: 'info',
            line: step.line,
            message: '期待結果が具体的でない可能性があります（検証可能な表現を推奨）'
          });
        }
      }
    }
  }

  // 5. シナリオカバレッジチェック
  console.log('📊 シナリオカバレッジチェック...');
  const hasHappyPath = scenarios.some(s => /正常|成功|happy/i.test(s.name));
  const hasErrorCase = scenarios.some(s => /エラー|失敗|異常|error|fail/i.test(s.name));
  const hasBoundary = scenarios.some(s => /境界|最小|最大|boundary/i.test(s.name));

  if (!hasHappyPath) {
    issues.push({
      type: 'coverage',
      severity: 'info',
      message: '正常系シナリオが明示されていません'
    });
  }
  if (!hasErrorCase) {
    issues.push({
      type: 'coverage',
      severity: 'info',
      message: '異常系シナリオが定義されていません'
    });
  }
  if (!hasBoundary) {
    issues.push({
      type: 'coverage',
      severity: 'info',
      message: '境界値シナリオが定義されていません'
    });
  }

  return {
    issues,
    stats: {
      lines: lines.length,
      scenarios: scenarios.length,
      steps: scenarios.reduce((sum, s) => sum + s.steps.length, 0)
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
  console.log(`シナリオ数: ${stats.scenarios}`);
  console.log(`ステップ数: ${stats.steps}`);
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
        const matchInfo = issue.match ? ` "${issue.match}"` : '';
        console.log(`${icon} [${issue.severity.toUpperCase()}] 行${issue.line}:${matchInfo} ${issue.message}`);
      } else {
        console.log(`${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
      }
    }
  }

  // 品質スコア
  const baseScore = 100;
  const errorPenalty = errors.length * 15;
  const warningPenalty = warnings.length * 5;
  const score = Math.max(0, baseScore - errorPenalty - warningPenalty);

  console.log('\n' + '='.repeat(50));
  console.log(`📈 品質スコア: ${score}/100`);

  if (score >= 80) {
    console.log('✅ 良好: 受け入れ基準は十分に定義されています');
  } else if (score >= 60) {
    console.log('⚠️  要改善: GWT構造を確認してください');
  } else {
    console.log('❌ 不十分: 基本的なGWT構造を追加してください');
  }
  console.log('='.repeat(50) + '\n');

  return errors.length === 0 ? 0 : 1;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node validate-acceptance-criteria.mjs <受け入れ基準.md>');
    console.log('\n例:');
    console.log('  node validate-acceptance-criteria.mjs ./docs/acceptance-criteria/AC-001.md');
    process.exit(1);
  }

  const filePath = resolve(args[0]);

  if (!existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const result = validateAcceptanceCriteria(content, filePath);
    const exitCode = displayResults(result);
    process.exit(exitCode);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
