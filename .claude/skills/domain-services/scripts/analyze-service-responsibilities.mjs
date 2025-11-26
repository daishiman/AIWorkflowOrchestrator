#!/usr/bin/env node

/**
 * サービス責務分析スクリプト
 *
 * ドメインサービスとアプリケーションサービスの責務を分析し、
 * 潜在的な問題を検出します。
 *
 * 使用方法:
 *   node analyze-service-responsibilities.mjs <directory>
 *
 * 例:
 *   node analyze-service-responsibilities.mjs src/domain/services/
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

// 検出パターン
const PATTERNS = {
  // ドメインサービスでの問題パターン
  domainServiceIssues: [
    {
      pattern: /\bawait\b/,
      issue: 'async/await',
      suggestion: 'ドメインサービスは通常同期的。外部リソースアクセスはアプリケーションサービスで',
    },
    {
      pattern: /repository\./i,
      issue: 'リポジトリ直接アクセス',
      suggestion: 'ドメインサービスはリポジトリに依存すべきでない。アプリケーションサービスで注入',
    },
    {
      pattern: /\.query\(|\.execute\(|\.find\(/,
      issue: 'データベースアクセスの可能性',
      suggestion: 'ドメインサービスはインフラストラクチャに依存すべきでない',
    },
    {
      pattern: /fetch\(|axios\.|http\./i,
      issue: 'HTTP呼び出し',
      suggestion: '外部APIアクセスはアプリケーションサービスまたはインフラ層で',
    },
    {
      pattern: /private\s+\w+\s*[:=]/,
      issue: 'インスタンス変数（状態）の可能性',
      suggestion: 'ドメインサービスはステートレスであるべき',
    },
    {
      pattern: /this\.\w+\s*=/,
      issue: '状態の変更',
      suggestion: 'ドメインサービスは状態を持つべきでない',
    },
  ],

  // アプリケーションサービスでの問題パターン
  appServiceIssues: [
    {
      pattern: /if\s*\([^)]*\.balance|if\s*\([^)]*\.status|if\s*\([^)]*\.is\w+\(/,
      issue: 'ビジネスロジックの漏れ',
      suggestion: 'ビジネスルールはエンティティまたはドメインサービスに',
    },
    {
      pattern: /\.setBalance\(|\.setStatus\(/,
      issue: '直接的な状態変更',
      suggestion: 'エンティティのメソッドを通じて状態を変更すべき',
    },
    {
      pattern: /for\s*\(.*items|\.forEach\(.*calculate/i,
      issue: '計算ループ',
      suggestion: '計算ロジックはドメインサービスまたは値オブジェクトに',
    },
  ],

  // 命名の問題
  namingIssues: [
    {
      pattern: /Manager$/,
      issue: 'Manager サフィックス',
      suggestion: 'より具体的なドメイン用語を使用',
    },
    {
      pattern: /Helper$/,
      issue: 'Helper サフィックス',
      suggestion: 'Service または具体的な責務名を使用',
    },
    {
      pattern: /Utils?$/,
      issue: 'Utils サフィックス',
      suggestion: 'ドメインサービスとして再設計',
    },
    {
      pattern: /Processor$/,
      issue: 'Processor サフィックス',
      suggestion: 'より具体的なドメイン用語を使用',
    },
  ],
};

/**
 * サービスの種類を判定
 */
function determineServiceType(filePath, content) {
  const fileName = basename(filePath);

  // パスベースの判定
  if (filePath.includes('/application/') || filePath.includes('/app/')) {
    return 'application';
  }
  if (filePath.includes('/domain/')) {
    return 'domain';
  }

  // 内容ベースの判定
  const hasAwait = /\bawait\b/.test(content);
  const hasRepository = /repository/i.test(content);
  const hasTransaction = /transaction|unitOfWork/i.test(content);

  if (hasAwait || hasRepository || hasTransaction) {
    return 'application';
  }

  return 'domain'; // デフォルト
}

/**
 * ファイルを分析
 */
function analyzeFile(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  const serviceType = determineServiceType(filePath, content);

  // クラス名を抽出
  const classMatch = content.match(/class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : basename(filePath);

  // 命名の問題をチェック
  for (const { pattern, issue, suggestion } of PATTERNS.namingIssues) {
    if (pattern.test(className)) {
      issues.push({
        type: 'naming',
        file: filePath,
        className,
        line: null,
        issue,
        suggestion,
      });
    }
  }

  // サービス種類に応じた問題をチェック
  const patternsToCheck = serviceType === 'domain'
    ? PATTERNS.domainServiceIssues
    : PATTERNS.appServiceIssues;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    for (const { pattern, issue, suggestion } of patternsToCheck) {
      if (pattern.test(line)) {
        // 重複を避ける
        const existingIssue = issues.find(
          i => i.line === lineNumber && i.issue === issue
        );
        if (!existingIssue) {
          issues.push({
            type: serviceType === 'domain' ? 'domain_issue' : 'app_issue',
            file: filePath,
            className,
            line: lineNumber,
            code: line.trim(),
            issue,
            suggestion,
          });
        }
      }
    }
  });

  return { className, serviceType, issues };
}

/**
 * ディレクトリを再帰的に走査
 */
async function walkDirectory(dir, fileExtensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        // サービスファイルのみを対象
        if (fileExtensions.includes(ext) && /service/i.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(dir);
  return files;
}

/**
 * レポート生成
 */
function generateReport(analyses) {
  const report = [];

  report.push('# サービス責務分析レポート\n');
  report.push(`生成日時: ${new Date().toISOString()}`);
  report.push(`分析サービス数: ${analyses.length}\n`);

  // サマリー
  const domainServices = analyses.filter(a => a.serviceType === 'domain');
  const appServices = analyses.filter(a => a.serviceType === 'application');
  const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0);

  report.push('\n## サマリー\n');
  report.push(`- ドメインサービス: ${domainServices.length}件`);
  report.push(`- アプリケーションサービス: ${appServices.length}件`);
  report.push(`- **検出された問題: ${totalIssues}件**\n`);

  // 問題の詳細
  const issuesByType = {
    naming: [],
    domain_issue: [],
    app_issue: [],
  };

  for (const analysis of analyses) {
    for (const issue of analysis.issues) {
      issuesByType[issue.type].push(issue);
    }
  }

  // 命名の問題
  if (issuesByType.naming.length > 0) {
    report.push('\n## 🔴 命名の問題\n');
    for (const issue of issuesByType.naming) {
      report.push(`### ${issue.className}`);
      report.push(`- ファイル: ${issue.file}`);
      report.push(`- 問題: ${issue.issue}`);
      report.push(`- 提案: ${issue.suggestion}`);
      report.push('');
    }
  }

  // ドメインサービスの問題
  if (issuesByType.domain_issue.length > 0) {
    report.push('\n## 🟡 ドメインサービスの問題\n');
    report.push('ドメインサービスに不適切なコードが含まれています。\n');

    const byFile = groupByFile(issuesByType.domain_issue);
    for (const [file, issues] of byFile) {
      report.push(`### ${basename(file)}`);
      report.push(`ファイル: ${file}\n`);
      for (const issue of issues) {
        report.push(`- 行 ${issue.line}: ${issue.issue}`);
        report.push(`  - コード: \`${truncate(issue.code, 50)}\``);
        report.push(`  - 提案: ${issue.suggestion}`);
      }
      report.push('');
    }
  }

  // アプリケーションサービスの問題
  if (issuesByType.app_issue.length > 0) {
    report.push('\n## 🟡 アプリケーションサービスの問題\n');
    report.push('アプリケーションサービスにビジネスロジックが漏れています。\n');

    const byFile = groupByFile(issuesByType.app_issue);
    for (const [file, issues] of byFile) {
      report.push(`### ${basename(file)}`);
      report.push(`ファイル: ${file}\n`);
      for (const issue of issues) {
        report.push(`- 行 ${issue.line}: ${issue.issue}`);
        report.push(`  - コード: \`${truncate(issue.code, 50)}\``);
        report.push(`  - 提案: ${issue.suggestion}`);
      }
      report.push('');
    }
  }

  // 推奨アクション
  report.push('\n## 推奨アクション\n');
  report.push('1. **命名の改善**: Manager/Helper/Utils を具体的なドメイン用語に');
  report.push('2. **責務の分離**: ドメインサービスからインフラ依存を除去');
  report.push('3. **ビジネスロジックの移動**: アプリケーションサービスからドメイン層へ');
  report.push('4. **ステートレス化**: ドメインサービスから状態を除去');

  return report.join('\n');
}

/**
 * ファイルごとにグループ化
 */
function groupByFile(issues) {
  const byFile = new Map();
  for (const issue of issues) {
    if (!byFile.has(issue.file)) {
      byFile.set(issue.file, []);
    }
    byFile.get(issue.file).push(issue);
  }
  return byFile;
}

/**
 * 文字列を切り詰め
 */
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node analyze-service-responsibilities.mjs <directory>');
    console.log('');
    console.log('例:');
    console.log('  node analyze-service-responsibilities.mjs src/domain/services/');
    console.log('  node analyze-service-responsibilities.mjs src/');
    process.exit(1);
  }

  const targetDir = args[0];

  // ディレクトリ存在確認
  try {
    const stats = await stat(targetDir);
    if (!stats.isDirectory()) {
      console.error(`エラー: ${targetDir} はディレクトリではありません`);
      process.exit(1);
    }
  } catch {
    console.error(`エラー: ディレクトリが見つかりません: ${targetDir}`);
    process.exit(1);
  }

  console.log(`分析対象: ${targetDir}`);
  console.log('サービスファイルを検索中...');

  // ファイル一覧取得
  const files = await walkDirectory(targetDir);
  console.log(`${files.length}個のサービスファイルを発見`);

  if (files.length === 0) {
    console.log('サービスファイルが見つかりませんでした。');
    console.log('ファイル名に "Service" が含まれるファイルが対象です。');
    process.exit(0);
  }

  // 分析
  const analyses = [];

  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      const analysis = analyzeFile(content, file);
      analyses.push(analysis);
    } catch (error) {
      console.warn(`警告: ファイル読み込みエラー: ${file}`);
    }
  }

  // レポート生成
  const report = generateReport(analyses);
  console.log('\n' + report);

  // 終了コード
  const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0);
  process.exit(totalIssues > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('エラー:', error.message);
  process.exit(1);
});
