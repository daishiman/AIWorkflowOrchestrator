#!/usr/bin/env node

/**
 * validate-architecture.mjs
 * エージェントアーキテクチャの妥当性を検証するスクリプト
 *
 * Usage: node validate-architecture.mjs <agent_file.md>
 *
 * 検証項目:
 *   1. アーキテクチャパターンの一貫性
 *   2. 循環依存の検出
 *   3. 単一責任原則の遵守
 *   4. 依存関係の妥当性
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

/**
 * アーキテクチャパターンを検出
 */
function detectArchitecturePattern(content) {
  console.log('📐 [1/4] アーキテクチャパターンの検出...');

  const patterns = [
    { pattern: 'orchestrator', keywords: ['orchestrator', 'オーケストレーター'], name: 'Orchestrator-Worker パターン' },
    { pattern: 'pipeline', keywords: ['pipeline', 'パイプライン'], name: 'Pipeline パターン' },
    { pattern: 'hub-and-spoke', keywords: ['hub-and-spoke', 'ハブアンドスポーク'], name: 'Hub-and-Spoke パターン' },
    { pattern: 'state-machine', keywords: ['state-machine', '状態機械'], name: 'State Machine パターン' }
  ];

  for (const { pattern, keywords, name } of patterns) {
    if (keywords.some(kw => content.toLowerCase().includes(kw.toLowerCase()))) {
      console.log(`${colors.green}  ✓ ${name}検出${colors.reset}`);
      return { pattern, result: { errors: 0, warnings: 0 } };
    }
  }

  console.log(`${colors.yellow}  ⚠ アーキテクチャパターンが明示されていません${colors.reset}`);
  return { pattern: 'unknown', result: { errors: 0, warnings: 1 } };
}

/**
 * 循環依存を検出
 */
function detectCircularDependencies(content, agentFile) {
  console.log('🔄 [2/4] 循環依存の検出...');

  let errors = 0;

  // エージェント名を取得
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  const agentName = nameMatch ? nameMatch[1].trim() : path.basename(agentFile, '.md');

  // 依存関係を抽出
  const depPattern = /(?:Task|Skill|Agent)\(([^)]+)\)/g;
  const deps = [];
  let match;

  while ((match = depPattern.exec(content)) !== null) {
    deps.push(match[1].trim());
  }

  if (deps.length === 0) {
    console.log(`${colors.green}  ✓ 依存関係なし（スタンドアロン）${colors.reset}`);
    return { errors: 0, warnings: 0 };
  }

  // 各依存先をチェック
  for (const dep of deps) {
    if (fs.existsSync(dep)) {
      const depContent = fs.readFileSync(dep, 'utf-8');
      if (depContent.includes(agentName)) {
        console.log(`${colors.red}  ✗ 循環依存検出: ${agentName} ⇄ ${dep}${colors.reset}`);
        errors++;
      }
    }
  }

  if (errors === 0) {
    console.log(`${colors.green}  ✓ 循環依存なし${colors.reset}`);
  }

  return { errors, warnings: 0 };
}

/**
 * 単一責任原則を検証
 */
function validateSingleResponsibility(content) {
  console.log('📋 [3/4] 単一責任原則の検証...');

  let errors = 0;
  let warnings = 0;

  // 役割セクションの数をカウント
  const roleCount = (content.match(/^## 役割|^## Role/gm) || []).length;

  if (roleCount === 1) {
    console.log(`${colors.green}  ✓ 単一責任原則を遵守${colors.reset}`);
  } else if (roleCount === 0) {
    console.log(`${colors.red}  ✗ 役割セクションが定義されていません${colors.reset}`);
    errors++;
  } else {
    console.log(`${colors.yellow}  ⚠ 複数の役割が定義されています（${roleCount} 個）${colors.reset}`);
    warnings++;
  }

  // Phase数をチェック
  const phaseCount = (content.match(/^### Phase/gm) || []).length;

  if (phaseCount >= 3 && phaseCount <= 7) {
    console.log(`${colors.green}  ✓ Phase数適切（${phaseCount} 個）${colors.reset}`);
  } else if (phaseCount > 7) {
    console.log(`${colors.yellow}  ⚠ Phase数が多すぎます（${phaseCount} 個）- 分割を検討${colors.reset}`);
    warnings++;
  } else if (phaseCount > 0) {
    console.log(`${colors.yellow}  ⚠ Phase数が少ないです（${phaseCount} 個）${colors.reset}`);
    warnings++;
  }

  return { errors, warnings };
}

/**
 * 依存関係の妥当性を検証
 */
function validateDependencies(content, pattern) {
  console.log('🔗 [4/4] 依存関係の妥当性検証...');

  let errors = 0;
  let warnings = 0;

  // tools の検証
  const toolsMatch = content.match(/^tools:\s*(.+)$/m);

  if (toolsMatch) {
    const tools = toolsMatch[1];
    console.log(`${colors.green}  ✓ ツール定義あり: ${tools}${colors.reset}`);

    // パターンごとの推奨ツールチェック
    if (pattern === 'orchestrator' && !tools.includes('Task')) {
      console.log(`${colors.yellow}  ⚠ Orchestratorパターンには Task ツールが推奨されます${colors.reset}`);
      warnings++;
    }
  } else {
    console.log(`${colors.red}  ✗ ツール定義がありません${colors.reset}`);
    errors++;
  }

  // スキル依存の検証
  const skillDepCount = (content.match(/Skill\(/g) || []).length;

  if (skillDepCount > 0) {
    console.log(`${colors.green}  ✓ スキル依存あり（${skillDepCount} 個）${colors.reset}`);
  } else {
    console.log(`${colors.yellow}  ⚠ スキル依存なし - プログレッシブディスクロージャーを検討${colors.reset}`);
    warnings++;
  }

  return { errors, warnings };
}

/**
 * メイン検証関数
 */
function validateArchitecture(agentFile) {
  console.log('=== エージェントアーキテクチャ検証 ===');
  console.log(`対象ファイル: ${agentFile}`);
  console.log('');

  if (!fs.existsSync(agentFile)) {
    console.log(`${colors.red}エラー: ファイルが見つかりません: ${agentFile}${colors.reset}`);
    return false;
  }

  const content = fs.readFileSync(agentFile, 'utf-8');

  let totalErrors = 0;
  let totalWarnings = 0;

  // 1. アーキテクチャパターンの検出
  const { pattern, result: patternResult } = detectArchitecturePattern(content);
  totalErrors += patternResult.errors;
  totalWarnings += patternResult.warnings;

  // 2. 循環依存の検出
  const circularResult = detectCircularDependencies(content, agentFile);
  totalErrors += circularResult.errors;
  totalWarnings += circularResult.warnings;

  // 3. 単一責任原則の検証
  const srpResult = validateSingleResponsibility(content);
  totalErrors += srpResult.errors;
  totalWarnings += srpResult.warnings;

  // 4. 依存関係の妥当性
  const depsResult = validateDependencies(content, pattern);
  totalErrors += depsResult.errors;
  totalWarnings += depsResult.warnings;

  // 結果サマリー
  console.log('');
  console.log('=== 検証結果サマリー ===');
  console.log(`エラー: ${colors.red}${totalErrors}${colors.reset}`);
  console.log(`警告: ${colors.yellow}${totalWarnings}${colors.reset}`);

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`\n${colors.green}✓ すべての検証に合格しました${colors.reset}`);
    return true;
  } else if (totalErrors === 0) {
    console.log(`\n${colors.yellow}⚠ 警告がありますが、致命的ではありません${colors.reset}`);
    return true;
  } else {
    console.log(`\n${colors.red}✗ エラーが検出されました。修正が必要です${colors.reset}`);
    return false;
  }
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用法: node validate-architecture.mjs <agent_file.md>');
    console.log('');
    console.log('例:');
    console.log('  node validate-architecture.mjs .claude/agents/skill-librarian.md');
    process.exit(1);
  }

  const success = validateArchitecture(args[0]);
  process.exit(success ? 0 : 1);
}

main();
