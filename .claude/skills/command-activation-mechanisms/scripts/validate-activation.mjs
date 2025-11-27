#!/usr/bin/env node
/**
 * Command Activation Mechanisms Validator
 *
 * コマンドの発動条件とトリガーを検証します。
 *
 * 検証項目:
 * - 発動条件の明確さ
 * - スラッシュコマンドの設定
 * - 自動発動の適切さ
 * - 手動発動の説明
 *
 * Usage:
 *   node validate-activation.mjs <command-file.md>
 */

import fs from 'fs';
import path from 'path';

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function extractActivationInfo(filePath, content) {
  const info = {
    commandName: path.basename(filePath, '.md'),
    slashCommand: null,
    triggers: [],
    isAutoActivated: false,
    hasManualInstructions: false
  };

  // スラッシュコマンド名の推定
  const dirs = path.dirname(filePath).split(path.sep);
  const commandsIndex = dirs.indexOf('commands');
  if (commandsIndex !== -1) {
    const namespace = dirs.slice(commandsIndex + 1).join(':');
    info.slashCommand = namespace
      ? `/${namespace}:${info.commandName}`
      : `/${info.commandName}`;
  }

  // トリガー条件の検出
  const triggerPatterns = [
    { pattern: /when.*user|ユーザーが.*時/i, type: 'user-action' },
    { pattern: /on\s+(save|commit|push)|保存時|コミット時/i, type: 'event' },
    { pattern: /if.*file|ファイルが.*場合/i, type: 'condition' },
    { pattern: /automatically|自動的に/i, type: 'auto' },
    { pattern: /trigger|発動|トリガー/i, type: 'explicit' }
  ];

  for (const { pattern, type } of triggerPatterns) {
    if (pattern.test(content)) {
      info.triggers.push(type);
    }
  }

  // 自動発動の検出
  info.isAutoActivated = info.triggers.includes('auto') || info.triggers.includes('event');

  // 手動発動の説明検出
  info.hasManualInstructions = /\/[a-z]+-[a-z]+|Usage|使用方法|実行方法/i.test(content);

  return info;
}

function validateActivation(info, content) {
  const issues = [];
  const warnings = [];
  const suggestions = [];

  // 1. スラッシュコマンドの使用方法
  if (!info.hasManualInstructions) {
    warnings.push('コマンドの実行方法が明示されていません');
    suggestions.push(`Usage セクションに ${info.slashCommand} の使用例を追加してください`);
  }

  // 2. トリガー条件の明確さ
  if (info.triggers.length === 0) {
    warnings.push('発動条件が検出されませんでした');
    suggestions.push('コマンドがいつ使用されるべきかを明記してください');
  }

  // 3. 自動発動の安全性
  if (info.isAutoActivated) {
    if (!/confirm|check|validate|確認|検証/i.test(content)) {
      warnings.push('自動発動コマンドにはユーザー確認を推奨します');
    }

    if (!/disable|off|無効|オフ/i.test(content)) {
      suggestions.push('自動発動を無効化する方法を説明してください');
    }
  }

  // 4. 引数との整合性
  if (/\$ARGUMENTS|\$\d/.test(content)) {
    if (!info.hasManualInstructions) {
      issues.push('引数を使用していますが、使用方法の説明がありません');
    }
  }

  // 5. 名前空間の活用
  if (info.slashCommand && !info.slashCommand.includes(':')) {
    const commandCount = (content.match(/\/[a-z]+-[a-z]+/g) || []).length;
    if (commandCount > 3) {
      suggestions.push('関連コマンドが多い場合は名前空間の使用を検討してください');
    }
  }

  return { issues, warnings, suggestions };
}

function analyzeDiscoverability(info, content) {
  const metrics = {
    hasDescription: /description:/i.test(content),
    hasUsageExample: /```[\s\S]*?\/[a-z]/i.test(content),
    hasKeywords: /keyword|タグ|カテゴリ/i.test(content),
    isWellNamed: /^[a-z]+-[a-z]+(-[a-z]+)?$/.test(info.commandName)
  };

  let score = 0;
  if (metrics.hasDescription) score += 30;
  if (metrics.hasUsageExample) score += 30;
  if (metrics.hasKeywords) score += 20;
  if (metrics.isWellNamed) score += 20;

  return { metrics, score };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Activation Mechanisms Validator${COLORS.reset}

Usage:
  node validate-activation.mjs <command-file.md>

検証項目:
  - スラッシュコマンド設定
  - 発動条件の明確さ
  - 自動発動の安全性
  - 手動発動の説明
  - 発見可能性

発動タイプ:
  - user-action: ユーザーアクションによる発動
  - event: イベント駆動（保存、コミット等）
  - condition: 条件ベース
  - auto: 自動発動
  - explicit: 明示的トリガー
`);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    log('error', `ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n${COLORS.bold}Analyzing Activation: ${filePath}${COLORS.reset}\n`);

  // 情報抽出
  const info = extractActivationInfo(filePath, content);

  // 検証
  const validation = validateActivation(info, content);

  // 発見可能性分析
  const discoverability = analyzeDiscoverability(info, content);

  // 基本情報表示
  console.log(`${COLORS.bold}Command Info:${COLORS.reset}`);
  log('info', `Name: ${info.commandName}`);
  log('info', `Slash Command: ${info.slashCommand || '(unknown)'}`);
  log('info', `Triggers: ${info.triggers.length > 0 ? info.triggers.join(', ') : '(none detected)'}`);
  log('info', `Auto-activated: ${info.isAutoActivated ? 'Yes' : 'No'}`);

  // 発見可能性スコア
  const discColor = discoverability.score >= 70 ? COLORS.green :
                    discoverability.score >= 50 ? COLORS.yellow : COLORS.red;
  console.log(`\n${COLORS.bold}Discoverability: ${discColor}${discoverability.score}%${COLORS.reset}`);

  console.log(`  Description: ${discoverability.metrics.hasDescription ? '✅' : '❌'}`);
  console.log(`  Usage example: ${discoverability.metrics.hasUsageExample ? '✅' : '❌'}`);
  console.log(`  Keywords: ${discoverability.metrics.hasKeywords ? '✅' : '❌'}`);
  console.log(`  Well-named: ${discoverability.metrics.isWellNamed ? '✅' : '❌'}`);

  // Issues
  if (validation.issues.length > 0) {
    console.log(`\n${COLORS.red}Issues:${COLORS.reset}`);
    validation.issues.forEach(issue => log('error', issue));
  }

  // Warnings
  if (validation.warnings.length > 0) {
    console.log(`\n${COLORS.yellow}Warnings:${COLORS.reset}`);
    validation.warnings.forEach(warning => log('warning', warning));
  }

  // Suggestions
  if (validation.suggestions.length > 0) {
    console.log(`\n${COLORS.blue}Suggestions:${COLORS.reset}`);
    validation.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
  }

  // Summary
  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Issues: ${validation.issues.length}`);
  console.log(`  Warnings: ${validation.warnings.length}`);
  console.log(`  Discoverability: ${discoverability.score}%`);

  if (validation.issues.length === 0 && discoverability.score >= 70) {
    log('success', '発動メカニズムは適切に設定されています');
  }

  process.exit(validation.issues.length > 0 ? 1 : 0);
}

main();
