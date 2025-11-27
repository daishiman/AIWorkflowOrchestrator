#!/usr/bin/env node
/**
 * Command Basic Patterns Validator
 *
 * コマンドファイルの基本パターンを検証します。
 *
 * 対応パターン:
 * - Simple（単一操作）
 * - Step-by-step（段階的実行）
 * - Conditional（条件分岐）
 * - File-reference（外部参照）
 *
 * Usage:
 *   node validate-patterns.mjs <command-file.md>
 */

import fs from 'fs';

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

const PATTERN_DETECTORS = {
  simple: {
    name: 'Simple（単一操作）',
    detect: (content) => {
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      return lines.length < 20 && !content.includes('## Step');
    },
    validate: (content) => {
      const issues = [];
      if (content.length > 1000) {
        issues.push('Simpleパターンには長すぎます。Step-by-stepを検討してください');
      }
      return issues;
    }
  },
  stepByStep: {
    name: 'Step-by-step（段階的実行）',
    detect: (content) => {
      return /##\s*(Step|ステップ)\s*\d/i.test(content) ||
             /\d+\.\s+[A-Z\u3040-\u309f\u30a0-\u30ff]/.test(content);
    },
    validate: (content) => {
      const issues = [];
      const stepMatches = content.match(/##\s*(Step|ステップ)\s*(\d+)/gi) || [];
      const numbers = stepMatches.map(m => parseInt(m.match(/\d+/)[0]));

      // ステップ番号の連続性チェック
      for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i + 1] !== numbers[i] + 1) {
          issues.push(`ステップ番号が連続していません: ${numbers[i]} → ${numbers[i + 1]}`);
        }
      }

      // 各ステップに説明があるか
      if (stepMatches.length > 0 && stepMatches.length < 2) {
        issues.push('Step-by-stepパターンには最低2つのステップが必要です');
      }

      return issues;
    }
  },
  conditional: {
    name: 'Conditional（条件分岐）',
    detect: (content) => {
      return /if\s*\(|if\s*\[|条件|場合|when|unless/i.test(content) ||
             /\?.*:/s.test(content);
    },
    validate: (content) => {
      const issues = [];

      // else/otherwise がない if
      if (/if\s*[\(\[]/.test(content) && !/else|otherwise|それ以外/i.test(content)) {
        issues.push('条件分岐に else/otherwise がありません');
      }

      return issues;
    }
  },
  fileReference: {
    name: 'File-reference（外部参照）',
    detect: (content) => {
      return /@[a-zA-Z0-9_\-\/\.]+\.(md|txt|json|yaml)/g.test(content) ||
             /\{\{.*\}\}/.test(content) ||
             /include|import|reference/i.test(content);
    },
    validate: (content) => {
      const issues = [];

      // 参照ファイルのパスをチェック
      const refs = content.match(/@([a-zA-Z0-9_\-\/\.]+)/g) || [];
      for (const ref of refs) {
        if (ref.includes('..')) {
          issues.push(`相対パス参照は避けてください: ${ref}`);
        }
      }

      return issues;
    }
  }
};

function detectPattern(content) {
  const detected = [];

  for (const [key, pattern] of Object.entries(PATTERN_DETECTORS)) {
    if (pattern.detect(content)) {
      detected.push({
        key,
        name: pattern.name,
        issues: pattern.validate(content)
      });
    }
  }

  return detected;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Basic Patterns Validator${COLORS.reset}

Usage:
  node validate-patterns.mjs <command-file.md>

検出パターン:
  - Simple（単一操作）
  - Step-by-step（段階的実行）
  - Conditional（条件分岐）
  - File-reference（外部参照）
`);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    log('error', `ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n${COLORS.bold}Analyzing Patterns: ${filePath}${COLORS.reset}\n`);

  const detected = detectPattern(content);

  if (detected.length === 0) {
    log('warning', 'パターンが検出されませんでした');
    log('info', '明確なパターンを使用することを推奨します');
  } else {
    console.log(`${COLORS.bold}Detected Patterns:${COLORS.reset}`);

    let totalIssues = 0;

    for (const pattern of detected) {
      log('info', pattern.name);

      if (pattern.issues.length > 0) {
        pattern.issues.forEach(issue => {
          log('warning', `  └─ ${issue}`);
          totalIssues++;
        });
      }
    }

    // 複数パターンの混在警告
    if (detected.length > 2) {
      console.log();
      log('warning', `${detected.length}つのパターンが混在しています。コマンドの分割を検討してください`);
    }

    console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
    console.log(`  Patterns detected: ${detected.length}`);
    console.log(`  Issues: ${totalIssues}`);

    if (totalIssues === 0 && detected.length <= 2) {
      log('success', 'パターン構造は適切です');
    }
  }
}

main();
