#!/usr/bin/env node
/**
 * Command-Agent-Skill Integration Validator
 *
 * Trinity Architecture の統合パターンを検証します。
 *
 * 検証項目:
 * - エージェント参照の正確性
 * - スキル参照の正確性
 * - 連携パターンの適切さ
 * - 依存関係の明示
 *
 * Usage:
 *   node validate-integration.mjs <command-file.md>
 */

import fs from 'fs';
import path from 'path';

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(type, message) {
  const icons = {
    error: `${COLORS.red}❌${COLORS.reset}`,
    success: `${COLORS.green}✅${COLORS.reset}`,
    warning: `${COLORS.yellow}⚠️${COLORS.reset}`,
    info: `${COLORS.blue}ℹ️${COLORS.reset}`
  };
  console.log(`${icons[type]} ${message}`);
}

function extractReferences(content) {
  const refs = {
    agents: [],
    skills: [],
    commands: [],
    tools: []
  };

  // エージェント参照 (@agent-name 形式)
  const agentMatches = content.match(/@[a-z][a-z0-9-]+(?![\/\.])/g) || [];
  refs.agents = [...new Set(agentMatches)];

  // スキル参照 (skill: または .claude/skills/ 形式)
  const skillMatches = content.match(/skill:\s*([a-z][a-z0-9-]+)|\.claude\/skills\/([a-z][a-z0-9-]+)/gi) || [];
  refs.skills = [...new Set(skillMatches.map(m => m.replace(/skill:\s*|\.claude\/skills\//gi, '')))];

  // コマンド参照 (/command-name 形式)
  const commandMatches = content.match(/\/[a-z][a-z0-9-:]+/g) || [];
  refs.commands = [...new Set(commandMatches)];

  // ツール参照 (allowed-tools から)
  const toolsMatch = content.match(/allowed-tools:\s*(.+)/);
  if (toolsMatch) {
    refs.tools = toolsMatch[1].split(',').map(t => t.trim());
  }

  return refs;
}

function analyzeIntegrationPatterns(content, refs) {
  const patterns = {
    detected: [],
    issues: [],
    warnings: []
  };

  // 1. Agent-First Pattern (エージェントを主軸とした設計)
  if (refs.agents.length > 0) {
    patterns.detected.push('Agent-First');

    // エージェントへの委譲が明示されているか
    if (!/delegate|invoke|call|委譲|呼び出し/i.test(content)) {
      patterns.warnings.push('エージェント参照がありますが、委譲パターンが不明確です');
    }
  }

  // 2. Skill-Enhanced Pattern (スキルで知識を補完)
  if (refs.skills.length > 0) {
    patterns.detected.push('Skill-Enhanced');

    // スキルの適用方法が明示されているか
    if (!/apply|use|参照|活用/i.test(content)) {
      patterns.warnings.push('スキル参照がありますが、適用方法が不明確です');
    }
  }

  // 3. Command Chain Pattern (コマンドの連鎖)
  if (refs.commands.length > 1) {
    patterns.detected.push('Command-Chain');

    // 実行順序が明確か
    if (!/then|次に|after|before|順番/i.test(content)) {
      patterns.warnings.push('複数コマンドがありますが、実行順序が不明確です');
    }
  }

  // 4. Tool Restriction Pattern (ツール制限)
  if (refs.tools.length > 0 && !refs.tools.includes('*')) {
    patterns.detected.push('Tool-Restricted');
  }

  // 統合なしの場合
  if (patterns.detected.length === 0) {
    patterns.warnings.push('Trinity 統合パターンが検出されませんでした');
  }

  return patterns;
}

function checkDependencies(refs, basePath) {
  const dependencies = {
    agents: { found: [], missing: [] },
    skills: { found: [], missing: [] }
  };

  // コマンドファイルの位置から .claude ディレクトリを推定
  const claudeDir = basePath.includes('.claude')
    ? basePath.substring(0, basePath.indexOf('.claude') + 7)
    : path.join(path.dirname(basePath), '.claude');

  // エージェントの存在確認
  for (const agent of refs.agents) {
    const agentName = agent.replace('@', '');
    const agentPath = path.join(claudeDir, 'agents', `${agentName}.md`);

    if (fs.existsSync(agentPath)) {
      dependencies.agents.found.push(agent);
    } else {
      dependencies.agents.missing.push(agent);
    }
  }

  // スキルの存在確認
  for (const skill of refs.skills) {
    const skillPath = path.join(claudeDir, 'skills', skill);

    if (fs.existsSync(skillPath)) {
      dependencies.skills.found.push(skill);
    } else {
      dependencies.skills.missing.push(skill);
    }
  }

  return dependencies;
}

function generateIntegrationScore(patterns, deps) {
  let score = 50; // 基本スコア

  // パターン検出でスコア加算
  score += patterns.detected.length * 10;

  // 問題でスコア減算
  score -= patterns.issues.length * 15;
  score -= patterns.warnings.length * 5;

  // 依存関係の欠落でスコア減算
  score -= deps.agents.missing.length * 10;
  score -= deps.skills.missing.length * 10;

  return Math.max(0, Math.min(100, score));
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command-Agent-Skill Integration Validator${COLORS.reset}

Usage:
  node validate-integration.mjs <command-file.md>

検証パターン:
  - Agent-First: エージェントへの委譲
  - Skill-Enhanced: スキルによる知識補完
  - Command-Chain: コマンドの連鎖実行
  - Tool-Restricted: ツールの制限

Trinity Architecture:
  Command (トリガー) → Agent (実行者) → Skill (知識)
`);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    log('error', `ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n${COLORS.bold}Analyzing Integration: ${filePath}${COLORS.reset}\n`);

  // 参照の抽出
  const refs = extractReferences(content);

  // 統合パターンの分析
  const patterns = analyzeIntegrationPatterns(content, refs);

  // 依存関係のチェック
  const deps = checkDependencies(refs, filePath);

  // スコア計算
  const score = generateIntegrationScore(patterns, deps);
  const scoreColor = score >= 70 ? COLORS.green : score >= 50 ? COLORS.yellow : COLORS.red;

  console.log(`${COLORS.bold}Integration Score: ${scoreColor}${score}%${COLORS.reset}\n`);

  // 検出された参照
  console.log(`${COLORS.bold}References Found:${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}Agents:${COLORS.reset} ${refs.agents.length > 0 ? refs.agents.join(', ') : '(none)'}`);
  console.log(`  ${COLORS.cyan}Skills:${COLORS.reset} ${refs.skills.length > 0 ? refs.skills.join(', ') : '(none)'}`);
  console.log(`  ${COLORS.cyan}Commands:${COLORS.reset} ${refs.commands.length > 0 ? refs.commands.join(', ') : '(none)'}`);
  console.log(`  ${COLORS.cyan}Tools:${COLORS.reset} ${refs.tools.length > 0 ? refs.tools.join(', ') : '(none)'}`);

  // 検出されたパターン
  if (patterns.detected.length > 0) {
    console.log(`\n${COLORS.bold}Integration Patterns:${COLORS.reset}`);
    patterns.detected.forEach(p => log('info', p));
  }

  // 依存関係の状態
  if (deps.agents.missing.length > 0 || deps.skills.missing.length > 0) {
    console.log(`\n${COLORS.red}Missing Dependencies:${COLORS.reset}`);
    deps.agents.missing.forEach(a => log('error', `Agent not found: ${a}`));
    deps.skills.missing.forEach(s => log('error', `Skill not found: ${s}`));
  }

  // 警告
  if (patterns.warnings.length > 0) {
    console.log(`\n${COLORS.yellow}Warnings:${COLORS.reset}`);
    patterns.warnings.forEach(w => log('warning', w));
  }

  // サマリー
  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Integration patterns: ${patterns.detected.length}`);
  console.log(`  Missing dependencies: ${deps.agents.missing.length + deps.skills.missing.length}`);
  console.log(`  Warnings: ${patterns.warnings.length}`);

  if (score >= 70 && deps.agents.missing.length === 0 && deps.skills.missing.length === 0) {
    log('success', 'Trinity 統合は適切に設定されています');
  }

  process.exit(deps.agents.missing.length + deps.skills.missing.length > 0 ? 1 : 0);
}

main();
