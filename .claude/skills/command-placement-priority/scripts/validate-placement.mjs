#!/usr/bin/env node
/**
 * Command Placement Priority Validator
 *
 * コマンドの配置と優先順位を検証します。
 *
 * 検証項目:
 * - 配置場所の適切さ
 * - 名前空間の構造
 * - 優先順位の設定
 * - スコープの明確さ
 *
 * Usage:
 *   node validate-placement.mjs <command-file.md>
 *   node validate-placement.mjs <commands-directory>
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

// 配置スコープの定義
const PLACEMENT_SCOPES = {
  user: {
    path: '~/.claude/commands',
    description: 'ユーザーグローバル（全プロジェクト共通）',
    priority: 1
  },
  project: {
    path: '.claude/commands',
    description: 'プロジェクト固有',
    priority: 2
  },
  namespace: {
    path: '.claude/commands/<namespace>',
    description: '名前空間（機能別グループ）',
    priority: 2
  }
};

function analyzeFilePlacement(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const placement = {
    scope: 'unknown',
    namespace: null,
    commandName: path.basename(filePath, '.md'),
    slashCommand: null,
    issues: [],
    warnings: []
  };

  // スコープ判定
  if (normalizedPath.includes('/.claude/commands/')) {
    if (normalizedPath.includes(process.env.HOME || '~')) {
      placement.scope = 'user';
    } else {
      placement.scope = 'project';
    }

    // 名前空間の検出
    const match = normalizedPath.match(/\.claude\/commands\/([^\/]+)\//);
    if (match) {
      placement.namespace = match[1];
      placement.scope = 'namespace';
      placement.slashCommand = `/${placement.namespace}:${placement.commandName}`;
    } else {
      placement.slashCommand = `/${placement.commandName}`;
    }
  } else {
    placement.issues.push('コマンドファイルが .claude/commands/ 内にありません');
  }

  return placement;
}

function validatePlacement(placement, content) {
  const issues = [...placement.issues];
  const warnings = [...placement.warnings];
  const suggestions = [];

  // 1. スコープに適した内容か
  if (placement.scope === 'user') {
    // ユーザーグローバルはプロジェクト固有の内容を含むべきでない
    if (/project|プロジェクト|this repo|このリポジトリ/i.test(content)) {
      warnings.push('ユーザーグローバルコマンドにプロジェクト固有の内容があります');
      suggestions.push('プロジェクト固有の場合は .claude/commands/ に移動してください');
    }
  }

  // 2. 名前空間の一貫性
  if (placement.namespace) {
    const namespaceKeywords = {
      'git': ['commit', 'push', 'pull', 'branch', 'merge'],
      'test': ['test', 'spec', 'coverage', 'mock'],
      'doc': ['document', 'readme', 'api', 'comment'],
      'build': ['build', 'compile', 'bundle', 'deploy'],
      'db': ['database', 'migration', 'schema', 'query']
    };

    const keywords = namespaceKeywords[placement.namespace] || [];
    const hasRelatedContent = keywords.some(kw =>
      content.toLowerCase().includes(kw) ||
      placement.commandName.includes(kw)
    );

    if (keywords.length > 0 && !hasRelatedContent) {
      warnings.push(`名前空間 '${placement.namespace}' と内容が一致しない可能性があります`);
    }
  }

  // 3. コマンド名の重複リスク
  if (!placement.namespace && placement.commandName) {
    const commonNames = ['create', 'delete', 'update', 'list', 'show', 'run', 'test'];
    if (commonNames.includes(placement.commandName)) {
      warnings.push('汎用的なコマンド名は衝突のリスクがあります');
      suggestions.push('より具体的な名前または名前空間の使用を検討してください');
    }
  }

  return { issues, warnings, suggestions };
}

function scanDirectory(dirPath) {
  const results = [];
  const namespaces = new Map();

  function scan(dir, depth = 0) {
    if (depth > 3) return; // 深すぎるネストを防止

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scan(fullPath, depth + 1);
      } else if (entry.name.endsWith('.md')) {
        const placement = analyzeFilePlacement(fullPath);
        results.push({ path: fullPath, placement });

        if (placement.namespace) {
          const count = namespaces.get(placement.namespace) || 0;
          namespaces.set(placement.namespace, count + 1);
        }
      }
    }
  }

  scan(dirPath);
  return { commands: results, namespaces };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Placement Priority Validator${COLORS.reset}

Usage:
  node validate-placement.mjs <command-file.md>
  node validate-placement.mjs <commands-directory>

配置スコープ:
  - user: ~/.claude/commands/ (ユーザーグローバル)
  - project: .claude/commands/ (プロジェクト固有)
  - namespace: .claude/commands/<ns>/ (名前空間)

優先順位:
  1. ユーザーグローバル（最低優先）
  2. プロジェクト固有（高優先）
  3. 名前空間付き（同等優先）
`);
    process.exit(0);
  }

  const target = args[0];

  if (!fs.existsSync(target)) {
    log('error', `ファイル/ディレクトリが見つかりません: ${target}`);
    process.exit(1);
  }

  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    // ディレクトリスキャン
    console.log(`\n${COLORS.bold}Scanning Directory: ${target}${COLORS.reset}\n`);

    const { commands, namespaces } = scanDirectory(target);

    // 名前空間統計
    if (namespaces.size > 0) {
      console.log(`${COLORS.bold}Namespaces:${COLORS.reset}`);
      for (const [ns, count] of namespaces) {
        console.log(`  ${ns}: ${count} commands`);
      }
      console.log();
    }

    // 問題のあるコマンド
    let totalIssues = 0;
    let totalWarnings = 0;

    for (const { path: filePath, placement } of commands) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const validation = validatePlacement(placement, content);

      if (validation.issues.length > 0 || validation.warnings.length > 0) {
        console.log(`${COLORS.bold}${placement.slashCommand || placement.commandName}${COLORS.reset}`);
        console.log(`  ${COLORS.blue}Scope: ${placement.scope}${COLORS.reset}`);

        validation.issues.forEach(i => log('error', i));
        validation.warnings.forEach(w => log('warning', w));

        totalIssues += validation.issues.length;
        totalWarnings += validation.warnings.length;
        console.log();
      }
    }

    console.log(`${COLORS.bold}Summary:${COLORS.reset}`);
    console.log(`  Commands scanned: ${commands.length}`);
    console.log(`  Namespaces: ${namespaces.size}`);
    console.log(`  Issues: ${totalIssues}`);
    console.log(`  Warnings: ${totalWarnings}`);

    if (totalIssues === 0 && totalWarnings === 0) {
      log('success', 'すべてのコマンドが適切に配置されています');
    }

    process.exit(totalIssues > 0 ? 1 : 0);
  } else {
    // 単一ファイル検証
    console.log(`\n${COLORS.bold}Validating Placement: ${target}${COLORS.reset}\n`);

    const content = fs.readFileSync(target, 'utf-8');
    const placement = analyzeFilePlacement(target);
    const validation = validatePlacement(placement, content);

    // 配置情報
    console.log(`${COLORS.bold}Placement Info:${COLORS.reset}`);
    log('info', `Command: ${placement.commandName}`);
    log('info', `Slash Command: ${placement.slashCommand || '(unknown)'}`);
    log('info', `Scope: ${placement.scope}`);
    if (placement.namespace) {
      log('info', `Namespace: ${placement.namespace}`);
    }

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
      validation.suggestions.forEach(s => console.log(`  - ${s}`));
    }

    // Summary
    console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
    console.log(`  Issues: ${validation.issues.length}`);
    console.log(`  Warnings: ${validation.warnings.length}`);

    if (validation.issues.length === 0) {
      log('success', '配置は適切です');
    }

    process.exit(validation.issues.length > 0 ? 1 : 0);
  }
}

main();
