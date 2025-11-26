#!/usr/bin/env node
/**
 * 脆弱性スキャンスクリプト
 * ソースコードからセキュリティ脆弱性パターンを検出します
 *
 * 使用方法:
 *   node scan-vulnerabilities.mjs <directory> [--fix-suggestions] [--json]
 *
 * オプション:
 *   --fix-suggestions 修正提案を表示
 *   --json            JSON形式で出力
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// 脆弱性パターン定義
const VULNERABILITY_PATTERNS = {
  // XSS脆弱性
  xss: [
    {
      pattern: /innerHTML\s*=/g,
      message: 'innerHTML への直接代入は XSS 脆弱性の原因になります',
      severity: 'high',
      suggestion: 'textContent を使用するか、DOMPurify でサニタイズしてください',
    },
    {
      pattern: /outerHTML\s*=/g,
      message: 'outerHTML への直接代入は XSS 脆弱性の原因になります',
      severity: 'high',
      suggestion: 'DOM操作メソッドを使用してください',
    },
    {
      pattern: /document\.write\s*\(/g,
      message: 'document.write は XSS 脆弱性の原因になります',
      severity: 'high',
      suggestion: 'DOM操作メソッドを使用してください',
    },
    {
      pattern: /dangerouslySetInnerHTML/g,
      message: 'dangerouslySetInnerHTML は XSS リスクがあります',
      severity: 'medium',
      suggestion: 'DOMPurify でサニタイズするか、別の方法を検討してください',
    },
    {
      pattern: /\$\{[^}]+\}.*innerHTML/g,
      message: 'テンプレートリテラルを innerHTML に使用しています',
      severity: 'high',
      suggestion: 'エスケープ処理を追加してください',
    },
  ],

  // SQLインジェクション
  sqlInjection: [
    {
      pattern: /`SELECT.*\$\{/gi,
      message: 'テンプレートリテラルで SQL クエリを構築しています',
      severity: 'critical',
      suggestion: 'パラメータ化クエリまたは ORM を使用してください',
    },
    {
      pattern: /`INSERT.*\$\{/gi,
      message: 'テンプレートリテラルで SQL クエリを構築しています',
      severity: 'critical',
      suggestion: 'パラメータ化クエリまたは ORM を使用してください',
    },
    {
      pattern: /`UPDATE.*\$\{/gi,
      message: 'テンプレートリテラルで SQL クエリを構築しています',
      severity: 'critical',
      suggestion: 'パラメータ化クエリまたは ORM を使用してください',
    },
    {
      pattern: /`DELETE.*\$\{/gi,
      message: 'テンプレートリテラルで SQL クエリを構築しています',
      severity: 'critical',
      suggestion: 'パラメータ化クエリまたは ORM を使用してください',
    },
    {
      pattern: /\+ ['"].*(?:SELECT|INSERT|UPDATE|DELETE)/gi,
      message: '文字列連結で SQL クエリを構築しています',
      severity: 'critical',
      suggestion: 'パラメータ化クエリを使用してください',
    },
  ],

  // コマンドインジェクション
  commandInjection: [
    {
      pattern: /exec\s*\(\s*`/g,
      message: 'exec でテンプレートリテラルを使用しています',
      severity: 'critical',
      suggestion: 'execFile を使用し、引数を配列で渡してください',
    },
    {
      pattern: /exec\s*\([^,)]+\+/g,
      message: 'exec で文字列連結を使用しています',
      severity: 'critical',
      suggestion: 'execFile を使用し、引数を配列で渡してください',
    },
    {
      pattern: /child_process.*exec\s*\(/g,
      message: 'exec の使用は危険です',
      severity: 'high',
      suggestion: 'execFile または spawn を使用してください',
    },
    {
      pattern: /shell:\s*true/g,
      message: 'shell: true オプションは危険です',
      severity: 'high',
      suggestion: 'shell: false を使用し、引数を配列で渡してください',
    },
  ],

  // パストラバーサル
  pathTraversal: [
    {
      pattern: /path\.join\s*\([^)]*req\.(params|query|body)/g,
      message: 'ユーザー入力を直接パスに使用しています',
      severity: 'high',
      suggestion: 'パスをサニタイズし、ベースディレクトリを検証してください',
    },
    {
      pattern: /readFile.*req\.(params|query|body)/g,
      message: 'ユーザー入力でファイルを読み込んでいます',
      severity: 'high',
      suggestion: '許可リストでパスを検証してください',
    },
    {
      pattern: /\.\.[\\/]/g,
      message: 'パストラバーサルパターンが含まれています',
      severity: 'medium',
      suggestion: 'パスを正規化して検証してください',
    },
  ],

  // 認証・認可
  authentication: [
    {
      pattern: /password.*=.*['"][^'"]+['"]/gi,
      message: 'ハードコードされたパスワードが含まれています',
      severity: 'critical',
      suggestion: '環境変数またはシークレット管理を使用してください',
    },
    {
      pattern: /api[_-]?key.*=.*['"][^'"]+['"]/gi,
      message: 'ハードコードされた API キーが含まれています',
      severity: 'critical',
      suggestion: '環境変数を使用してください',
    },
    {
      pattern: /secret.*=.*['"][^'"]+['"]/gi,
      message: 'ハードコードされたシークレットが含まれています',
      severity: 'critical',
      suggestion: '環境変数またはシークレット管理を使用してください',
    },
  ],

  // その他
  other: [
    {
      pattern: /eval\s*\(/g,
      message: 'eval の使用は危険です',
      severity: 'high',
      suggestion: '別の方法を検討してください',
    },
    {
      pattern: /new\s+Function\s*\(/g,
      message: 'Function コンストラクタの使用は危険です',
      severity: 'high',
      suggestion: '別の方法を検討してください',
    },
    {
      pattern: /Math\.random\s*\(\)/g,
      message: 'Math.random はセキュリティ用途には不適切です',
      severity: 'low',
      suggestion: 'crypto.randomBytes を使用してください',
    },
  ],
};

// ファイル拡張子フィルター
const TARGET_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'];

// 行番号を取得
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// ファイルをスキャン
function scanFile(filepath, options = {}) {
  const content = readFileSync(filepath, 'utf-8');
  const findings = [];

  for (const [category, patterns] of Object.entries(VULNERABILITY_PATTERNS)) {
    for (const rule of patterns) {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

      while ((match = regex.exec(content)) !== null) {
        findings.push({
          file: filepath,
          line: getLineNumber(content, match.index),
          category,
          message: rule.message,
          severity: rule.severity,
          match: match[0].substring(0, 50),
          suggestion: options.fixSuggestions ? rule.suggestion : undefined,
        });
      }
    }
  }

  return findings;
}

// ディレクトリを再帰的にスキャン
function scanDirectory(dir, options = {}) {
  const allFindings = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // node_modules, .git などをスキップ
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry)) {
          walk(fullPath);
        }
      } else if (TARGET_EXTENSIONS.includes(extname(entry))) {
        const findings = scanFile(fullPath, options);
        allFindings.push(...findings);
      }
    }
  }

  walk(dir);
  return allFindings;
}

// 結果をフォーマット
function formatResults(findings, options = {}) {
  if (options.json) {
    return JSON.stringify(findings, null, 2);
  }

  if (findings.length === 0) {
    return '✅ 脆弱性は検出されませんでした';
  }

  const grouped = {};
  for (const finding of findings) {
    const key = finding.severity;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(finding);
  }

  const severityOrder = ['critical', 'high', 'medium', 'low'];
  const severityLabels = {
    critical: '🔴 CRITICAL',
    high: '🟠 HIGH',
    medium: '🟡 MEDIUM',
    low: '🟢 LOW',
  };

  let output = '\n📊 脆弱性スキャン結果\n';
  output += '═'.repeat(60) + '\n';

  for (const severity of severityOrder) {
    if (grouped[severity] && grouped[severity].length > 0) {
      output += `\n${severityLabels[severity]} (${grouped[severity].length}件)\n`;
      output += '─'.repeat(60) + '\n';

      for (const finding of grouped[severity]) {
        output += `\n📁 ${finding.file}:${finding.line}\n`;
        output += `   ${finding.message}\n`;
        output += `   マッチ: ${finding.match}...\n`;
        if (finding.suggestion) {
          output += `   💡 ${finding.suggestion}\n`;
        }
      }
    }
  }

  output += '\n' + '═'.repeat(60) + '\n';
  output += `📈 合計: ${findings.length}件の脆弱性を検出\n`;
  output += `   CRITICAL: ${grouped.critical?.length || 0}\n`;
  output += `   HIGH: ${grouped.high?.length || 0}\n`;
  output += `   MEDIUM: ${grouped.medium?.length || 0}\n`;
  output += `   LOW: ${grouped.low?.length || 0}\n`;

  return output;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
脆弱性スキャンスクリプト

使用方法:
  node scan-vulnerabilities.mjs <directory> [options]

オプション:
  --fix-suggestions 修正提案を表示
  --json            JSON形式で出力
  --help            ヘルプを表示

例:
  node scan-vulnerabilities.mjs ./src
  node scan-vulnerabilities.mjs ./src --fix-suggestions
  node scan-vulnerabilities.mjs ./src --json > report.json

検出する脆弱性:
  - XSS (Cross-Site Scripting)
  - SQL インジェクション
  - コマンドインジェクション
  - パストラバーサル
  - ハードコードされた認証情報
  - eval/Function の使用
`);
    process.exit(0);
  }

  const targetDir = args.find((a) => !a.startsWith('--'));
  const options = {
    fixSuggestions: args.includes('--fix-suggestions'),
    json: args.includes('--json'),
  };

  try {
    const findings = scanDirectory(targetDir, options);
    console.log(formatResults(findings, options));

    // 終了コード: CRITICAL/HIGHがあれば1
    const hasCritical = findings.some((f) => f.severity === 'critical' || f.severity === 'high');
    process.exit(hasCritical ? 1 : 0);
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
