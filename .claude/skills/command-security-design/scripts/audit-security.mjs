#!/usr/bin/env node
/**
 * Command Security Auditor
 *
 * コマンドファイルのセキュリティを監査します。
 *
 * 検証項目:
 * - allowed-tools の設定
 * - disable-model-invocation の適切な使用
 * - 破壊的操作の検出
 * - 機密情報パターンの検出
 *
 * Usage:
 *   node audit-security.mjs <command-file.md>
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
    error: `${COLORS.red}🚨${COLORS.reset}`,
    success: `${COLORS.green}✅${COLORS.reset}`,
    warning: `${COLORS.yellow}⚠️${COLORS.reset}`,
    info: `${COLORS.blue}ℹ️${COLORS.reset}`
  };
  console.log(`${icons[type]} ${message}`);
}

// 破壊的なパターン
const DESTRUCTIVE_PATTERNS = [
  { pattern: /rm\s+-[rf]+/g, description: '再帰的なファイル削除' },
  { pattern: /delete|drop|truncate/gi, description: 'データ削除コマンド' },
  { pattern: /production|prod\b/gi, description: '本番環境への参照' },
  { pattern: /deploy.*production/gi, description: '本番デプロイ' },
  { pattern: /force.*push|push.*force/gi, description: 'Git force push' },
  { pattern: /--force|-f\s+/g, description: '強制フラグ' }
];

// 機密情報パターン
const SECRET_PATTERNS = [
  { pattern: /api[_-]?key/gi, description: 'API Key参照' },
  { pattern: /password/gi, description: 'パスワード参照' },
  { pattern: /secret/gi, description: 'Secret参照' },
  { pattern: /token/gi, description: 'Token参照' },
  { pattern: /private[_-]?key/gi, description: 'Private Key参照' },
  { pattern: /\.env\b/g, description: '.envファイル参照' }
];

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.+)/);
    if (keyMatch) {
      frontmatter[keyMatch[1]] = keyMatch[2].trim();
    }
  }

  return frontmatter;
}

function analyzeSecurityRisks(content, frontmatter) {
  const findings = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: []
  };

  // 1. allowed-tools の分析
  const allowedTools = frontmatter['allowed-tools'];
  if (!allowedTools) {
    findings.medium.push('allowed-tools が設定されていません。ツール使用が制限されません');
  } else {
    if (allowedTools.includes('*')) {
      findings.high.push('allowed-tools にワイルドカード(*) が含まれています');
    }
    if (allowedTools.includes('Bash') && !allowedTools.includes('(')) {
      findings.medium.push('Bash が制限なしで許可されています');
    }
  }

  // 2. disable-model-invocation の分析
  const disableInvocation = frontmatter['disable-model-invocation'];

  // 3. 破壊的パターンの検出
  let hasDestructivePattern = false;
  for (const { pattern, description } of DESTRUCTIVE_PATTERNS) {
    if (pattern.test(content)) {
      hasDestructivePattern = true;
      findings.high.push(`破壊的パターン検出: ${description}`);
    }
  }

  // 破壊的なのに disable-model-invocation がない
  if (hasDestructivePattern && disableInvocation !== 'true') {
    findings.critical.push(
      '破壊的な操作が含まれていますが、disable-model-invocation: true が設定されていません'
    );
  }

  // 4. 機密情報パターンの検出
  for (const { pattern, description } of SECRET_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      // 機密情報の保護チェックがあるか確認
      const hasProtection = /check.*secret|secret.*check|detect.*secret/i.test(content);
      if (hasProtection) {
        findings.info.push(`${description} - 保護チェックあり`);
      } else {
        findings.medium.push(`${description} が含まれていますが、保護チェックがありません`);
      }
    }
  }

  // 5. ユーザー確認の検出
  if (hasDestructivePattern) {
    const hasConfirmation = /confirm|approval|verify|are you sure/i.test(content);
    if (!hasConfirmation) {
      findings.high.push('破壊的な操作の前にユーザー確認がありません');
    }
  }

  // 6. ロールバック機能の検出
  if (hasDestructivePattern) {
    const hasRollback = /rollback|undo|revert|backup/i.test(content);
    if (!hasRollback) {
      findings.low.push('破壊的な操作のロールバック機能が見つかりません');
    }
  }

  return findings;
}

function calculateRiskScore(findings) {
  let score = 0;
  score += findings.critical.length * 30;
  score += findings.high.length * 15;
  score += findings.medium.length * 5;
  score += findings.low.length * 2;
  return Math.min(score, 100);
}

function getRiskLevel(score) {
  if (score >= 50) return { level: 'CRITICAL', color: COLORS.red };
  if (score >= 30) return { level: 'HIGH', color: COLORS.red };
  if (score >= 15) return { level: 'MEDIUM', color: COLORS.yellow };
  if (score >= 5) return { level: 'LOW', color: COLORS.green };
  return { level: 'MINIMAL', color: COLORS.green };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Security Auditor${COLORS.reset}

Usage:
  node audit-security.mjs <command-file.md>

検査項目:
  - allowed-tools の設定
  - disable-model-invocation の適切な使用
  - 破壊的操作の検出
  - 機密情報パターンの検出
  - ユーザー確認の存在
  - ロールバック機能の存在
`);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    log('error', `ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);

  console.log(`\n${COLORS.bold}Security Audit: ${filePath}${COLORS.reset}\n`);

  // セキュリティ分析
  const findings = analyzeSecurityRisks(content, frontmatter);

  // リスクスコア計算
  const riskScore = calculateRiskScore(findings);
  const { level, color } = getRiskLevel(riskScore);

  // 結果表示
  console.log(`${COLORS.bold}Risk Score: ${color}${riskScore}/100 (${level})${COLORS.reset}\n`);

  if (findings.critical.length > 0) {
    console.log(`${COLORS.red}${COLORS.bold}CRITICAL:${COLORS.reset}`);
    findings.critical.forEach(f => log('error', f));
    console.log();
  }

  if (findings.high.length > 0) {
    console.log(`${COLORS.red}HIGH:${COLORS.reset}`);
    findings.high.forEach(f => log('warning', f));
    console.log();
  }

  if (findings.medium.length > 0) {
    console.log(`${COLORS.yellow}MEDIUM:${COLORS.reset}`);
    findings.medium.forEach(f => log('warning', f));
    console.log();
  }

  if (findings.low.length > 0) {
    console.log(`${COLORS.green}LOW:${COLORS.reset}`);
    findings.low.forEach(f => log('info', f));
    console.log();
  }

  if (findings.info.length > 0) {
    console.log(`${COLORS.blue}INFO:${COLORS.reset}`);
    findings.info.forEach(f => log('info', f));
    console.log();
  }

  // サマリー
  console.log(`${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Critical: ${findings.critical.length}`);
  console.log(`  High: ${findings.high.length}`);
  console.log(`  Medium: ${findings.medium.length}`);
  console.log(`  Low: ${findings.low.length}`);

  // 推奨事項
  if (riskScore > 0) {
    console.log(`\n${COLORS.bold}Recommendations:${COLORS.reset}`);
    if (findings.critical.length > 0) {
      console.log('  - disable-model-invocation: true を追加してください');
    }
    if (!frontmatter['allowed-tools']) {
      console.log('  - allowed-tools で必要なツールのみを許可してください');
    }
  }

  process.exit(findings.critical.length > 0 ? 1 : 0);
}

main();
