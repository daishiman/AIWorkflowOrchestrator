#!/usr/bin/env node
/**
 * Command Best Practices Checker
 *
 * コマンドがベストプラクティスに従っているか検証します。
 *
 * 検証項目:
 * - 単一責任の原則
 * - 合成可能性
 * - 冪等性
 * - 透明性
 * - エラー耐性
 *
 * Usage:
 *   node check-best-practices.mjs <command-file.md>
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

const BEST_PRACTICES = {
  singleResponsibility: {
    name: '単一責任の原則',
    description: 'コマンドは1つのことを上手くやる',
    check: (content) => {
      const violations = [];

      // 複数の主要アクションを検出
      const actions = content.match(/##\s*(Step|Action|操作)\s*\d+/gi) || [];
      if (actions.length > 5) {
        violations.push('5つ以上のステップがあります。コマンドの分割を検討してください');
      }

      // 複数の独立した機能を検出
      const features = content.match(/##\s*(Feature|機能|また|さらに)/gi) || [];
      if (features.length > 2) {
        violations.push('複数の独立した機能があります');
      }

      // AND/ALSO パターンの過剰使用
      const andCount = (content.match(/\band\b|また|かつ/gi) || []).length;
      if (andCount > 10) {
        violations.push('「また」「かつ」の過剰使用は複数責任の兆候です');
      }

      return violations;
    },
    weight: 3
  },
  composability: {
    name: '合成可能性',
    description: '他のコマンドと組み合わせて使える',
    check: (content) => {
      const violations = [];

      // 入力/出力の明示
      if (!/input|output|入力|出力|result|結果/i.test(content)) {
        violations.push('入力/出力が明示されていません');
      }

      // 他コマンドとの連携言及
      if (!/combine|chain|pipe|組み合わせ|連携|パイプ/i.test(content)) {
        violations.push('他コマンドとの連携方法が説明されていません');
      }

      return violations;
    },
    weight: 2
  },
  idempotency: {
    name: '冪等性',
    description: '複数回実行しても同じ結果になる',
    check: (content) => {
      const violations = [];

      // 状態変更の検出
      if (/increment|append|add to|追加|増加/i.test(content)) {
        if (!/idempotent|冪等|同じ結果|already exist/i.test(content)) {
          violations.push('状態変更がありますが、冪等性の保証がありません');
        }
      }

      // 存在チェックの欠如
      if (/create|make|生成|作成/i.test(content)) {
        if (!/exist|already|既に|存在/i.test(content)) {
          violations.push('作成操作に存在チェックがありません');
        }
      }

      return violations;
    },
    weight: 2
  },
  transparency: {
    name: '透明性',
    description: '何をするか明確に伝える',
    check: (content) => {
      const violations = [];

      // 説明の存在
      if (!/description:/i.test(content)) {
        violations.push('Frontmatter に description がありません');
      }

      // 実行内容の説明
      if (!/will|する|します|行います/i.test(content)) {
        violations.push('コマンドが何をするか明示的に説明されていません');
      }

      // 副作用の説明
      if (/modify|change|delete|変更|削除/i.test(content)) {
        if (!/side effect|副作用|注意|warning/i.test(content)) {
          violations.push('副作用のある操作の警告がありません');
        }
      }

      return violations;
    },
    weight: 3
  },
  errorResilience: {
    name: 'エラー耐性',
    description: '失敗時に適切に対処する',
    check: (content) => {
      const violations = [];

      // エラーハンドリングの存在
      if (!/error|fail|exception|エラー|失敗/i.test(content)) {
        violations.push('エラーハンドリングが見つかりません');
      }

      // リカバリー方法
      if (/error|fail/i.test(content)) {
        if (!/recover|retry|rollback|復旧|再試行/i.test(content)) {
          violations.push('エラー時のリカバリー方法がありません');
        }
      }

      return violations;
    },
    weight: 2
  },
  documentation: {
    name: 'ドキュメンテーション',
    description: '使い方が明確に文書化されている',
    check: (content) => {
      const violations = [];

      // 使用例の存在
      if (!/example|例|sample|サンプル/i.test(content)) {
        violations.push('使用例がありません');
      }

      // 引数の説明
      if (/\$ARGUMENTS|\$\d/.test(content)) {
        if (!/argument-hint:|引数.*説明|parameter.*description/i.test(content)) {
          violations.push('引数を使用していますが説明がありません');
        }
      }

      return violations;
    },
    weight: 2
  },
  security: {
    name: 'セキュリティ考慮',
    description: 'セキュリティリスクを考慮している',
    check: (content) => {
      const violations = [];

      // 危険な操作の検出
      if (/delete|remove|drop|rm\s+-rf/i.test(content)) {
        if (!/confirm|確認|warning|警告/i.test(content)) {
          violations.push('破壊的操作に確認ステップがありません');
        }
      }

      // 機密情報の検出
      if (/password|secret|key|token|credential/i.test(content)) {
        if (!/secure|encrypt|mask|hidden|保護|暗号化/i.test(content)) {
          violations.push('機密情報の保護について言及がありません');
        }
      }

      return violations;
    },
    weight: 3
  }
};

function checkBestPractices(content) {
  const results = {};
  let totalScore = 0;
  let maxScore = 0;

  for (const [key, practice] of Object.entries(BEST_PRACTICES)) {
    const violations = practice.check(content);
    const passed = violations.length === 0;

    results[key] = {
      name: practice.name,
      description: practice.description,
      passed,
      violations,
      weight: practice.weight
    };

    maxScore += practice.weight;
    if (passed) {
      totalScore += practice.weight;
    }
  }

  return {
    practices: results,
    score: totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100)
  };
}

function getGrade(percentage) {
  if (percentage >= 90) return { grade: 'A', color: COLORS.green, label: 'Excellent' };
  if (percentage >= 75) return { grade: 'B', color: COLORS.green, label: 'Good' };
  if (percentage >= 60) return { grade: 'C', color: COLORS.yellow, label: 'Fair' };
  if (percentage >= 40) return { grade: 'D', color: COLORS.yellow, label: 'Needs Work' };
  return { grade: 'F', color: COLORS.red, label: 'Poor' };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Best Practices Checker${COLORS.reset}

Usage:
  node check-best-practices.mjs <command-file.md>

ベストプラクティス:
  - 単一責任の原則: 1つのことを上手くやる
  - 合成可能性: 他コマンドと組み合わせ可能
  - 冪等性: 複数回実行で同じ結果
  - 透明性: 何をするか明確に伝える
  - エラー耐性: 失敗時に適切に対処
  - ドキュメンテーション: 使い方が明確
  - セキュリティ考慮: リスクを考慮
`);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    log('error', `ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n${COLORS.bold}Checking Best Practices: ${filePath}${COLORS.reset}\n`);

  const analysis = checkBestPractices(content);
  const { grade, color, label } = getGrade(analysis.percentage);

  // グレード表示
  console.log(`${COLORS.bold}Best Practices Grade: ${color}${grade} - ${label} (${analysis.percentage}%)${COLORS.reset}\n`);

  // 各プラクティスの結果
  console.log(`${COLORS.bold}Practices:${COLORS.reset}`);
  for (const [key, practice] of Object.entries(analysis.practices)) {
    const status = practice.passed ? '✅' : '❌';
    const weightDisplay = '★'.repeat(practice.weight);
    console.log(`\n  ${status} ${COLORS.bold}${practice.name}${COLORS.reset} ${COLORS.blue}${weightDisplay}${COLORS.reset}`);
    console.log(`     ${practice.description}`);

    if (!practice.passed) {
      practice.violations.forEach(v => {
        console.log(`     ${COLORS.yellow}└─ ${v}${COLORS.reset}`);
      });
    }
  }

  // サマリー
  const passedCount = Object.values(analysis.practices).filter(p => p.passed).length;
  const totalCount = Object.keys(analysis.practices).length;

  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Passed: ${passedCount}/${totalCount}`);
  console.log(`  Score: ${analysis.score}/${analysis.maxScore} (${analysis.percentage}%)`);
  console.log(`  Grade: ${grade} (${label})`);

  if (analysis.percentage >= 75) {
    log('success', 'ベストプラクティスに概ね従っています');
  } else {
    console.log(`\n${COLORS.yellow}Improvement Areas:${COLORS.reset}`);
    Object.values(analysis.practices)
      .filter(p => !p.passed && p.weight >= 2)
      .forEach(p => {
        console.log(`  - ${p.name}`);
      });
  }

  process.exit(analysis.percentage < 50 ? 1 : 0);
}

main();
