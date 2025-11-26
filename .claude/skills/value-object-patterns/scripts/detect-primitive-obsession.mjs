#!/usr/bin/env node

/**
 * プリミティブ偏愛検出スクリプト
 *
 * コードベース内でプリミティブ型が値オブジェクトに置き換えられるべき
 * 箇所を検出します。
 *
 * 使用方法:
 *   node detect-primitive-obsession.mjs <directory>
 *
 * 例:
 *   node detect-primitive-obsession.mjs src/domain/
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';

// 検出パターン
const DETECTION_PATTERNS = {
  // プリミティブ型のパラメータ名パターン
  parameterPatterns: [
    { pattern: /:\s*string\s*[,)].*(?:email|mail)/i, suggestion: 'EmailAddress' },
    { pattern: /:\s*string\s*[,)].*(?:phone|tel)/i, suggestion: 'PhoneNumber' },
    { pattern: /:\s*string\s*[,)].*(?:postal|zip)/i, suggestion: 'PostalCode' },
    { pattern: /:\s*string\s*[,)].*(?:url|uri)/i, suggestion: 'Url' },
    { pattern: /:\s*string\s*[,)].*(?:password|pass)/i, suggestion: 'Password' },
    { pattern: /:\s*number\s*[,)].*(?:price|amount|cost|fee)/i, suggestion: 'Money' },
    { pattern: /:\s*number\s*[,)].*(?:quantity|qty|count)/i, suggestion: 'Quantity' },
    { pattern: /:\s*number\s*[,)].*(?:percent|rate)/i, suggestion: 'Percentage' },
    { pattern: /:\s*number\s*[,)].*(?:age)/i, suggestion: 'Age' },
    { pattern: /:\s*string\s*[,)].*(?:userId|customerId|orderId)/i, suggestion: '専用のId値オブジェクト' },
  ],

  // プロパティ型パターン
  propertyPatterns: [
    { pattern: /(?:email|mail)\s*:\s*string/i, suggestion: 'EmailAddress' },
    { pattern: /(?:phone|tel)\s*:\s*string/i, suggestion: 'PhoneNumber' },
    { pattern: /(?:postal|zip)(?:Code)?\s*:\s*string/i, suggestion: 'PostalCode' },
    { pattern: /(?:price|amount|cost|fee)\s*:\s*number/i, suggestion: 'Money' },
    { pattern: /(?:quantity|qty|count)\s*:\s*number/i, suggestion: 'Quantity' },
    { pattern: /(?:percent|rate)\s*:\s*number/i, suggestion: 'Percentage' },
    { pattern: /(?:url|uri)\s*:\s*string/i, suggestion: 'Url' },
    { pattern: /(?:password|pass)\s*:\s*string/i, suggestion: 'Password (ハッシュ化必須)' },
    { pattern: /(?:userId|customerId|orderId)\s*:\s*string/i, suggestion: '専用のId値オブジェクト' },
    { pattern: /(?:address)\s*:\s*string/i, suggestion: 'Address' },
    { pattern: /(?:name)\s*:\s*string/i, suggestion: 'PersonName または専用Name型' },
  ],

  // 同じ検証ロジックの重複（コードの匂い）
  validationDuplication: [
    { pattern: /\.test\(.*email/i, description: 'メールアドレスの検証が複数箇所に' },
    { pattern: /\.test\(.*phone/i, description: '電話番号の検証が複数箇所に' },
    { pattern: /\.length\s*[<>=]+\s*\d+.*(?:password|pass)/i, description: 'パスワード検証が複数箇所に' },
    { pattern: /[<>=]+\s*0.*(?:price|amount|cost)/i, description: '金額の範囲チェックが複数箇所に' },
  ],
};

/**
 * ファイルからプリミティブ偏愛を検出
 */
function detectPrimitiveObsession(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // パラメータパターンチェック
    for (const { pattern, suggestion } of DETECTION_PATTERNS.parameterPatterns) {
      if (pattern.test(line)) {
        issues.push({
          type: 'parameter',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: `値オブジェクト「${suggestion}」の使用を検討`,
        });
      }
    }

    // プロパティパターンチェック
    for (const { pattern, suggestion } of DETECTION_PATTERNS.propertyPatterns) {
      if (pattern.test(line)) {
        issues.push({
          type: 'property',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: `値オブジェクト「${suggestion}」の使用を検討`,
        });
      }
    }

    // バリデーション重複チェック
    for (const { pattern, description } of DETECTION_PATTERNS.validationDuplication) {
      if (pattern.test(line)) {
        issues.push({
          type: 'validation_duplication',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: description,
        });
      }
    }
  });

  return issues;
}

/**
 * 類似したバリデーションの重複を検出
 */
function detectValidationDuplication(allIssues) {
  const validationIssues = allIssues.filter(i => i.type === 'validation_duplication');

  // 同じパターンが複数ファイルで見つかった場合
  const groupedByPattern = new Map();
  for (const issue of validationIssues) {
    const key = issue.suggestion;
    if (!groupedByPattern.has(key)) {
      groupedByPattern.set(key, []);
    }
    groupedByPattern.get(key).push(issue);
  }

  const duplications = [];
  for (const [pattern, issues] of groupedByPattern) {
    if (issues.length > 1) {
      duplications.push({
        pattern,
        count: issues.length,
        files: [...new Set(issues.map(i => i.file))],
      });
    }
  }

  return duplications;
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
        if (fileExtensions.includes(ext)) {
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
function generateReport(allIssues, duplications, totalFiles) {
  const report = [];

  report.push('# プリミティブ偏愛検出レポート\n');
  report.push(`分析ファイル数: ${totalFiles}`);
  report.push(`生成日時: ${new Date().toISOString()}\n`);

  // サマリー
  const parameterIssues = allIssues.filter(i => i.type === 'parameter');
  const propertyIssues = allIssues.filter(i => i.type === 'property');
  const validationIssues = allIssues.filter(i => i.type === 'validation_duplication');

  report.push('\n## サマリー\n');
  report.push(`- パラメータの問題: ${parameterIssues.length}件`);
  report.push(`- プロパティの問題: ${propertyIssues.length}件`);
  report.push(`- バリデーション重複: ${validationIssues.length}件`);
  report.push(`- **合計: ${allIssues.length}件**\n`);

  // 優先度の高い問題（重複バリデーション）
  if (duplications.length > 0) {
    report.push('\n## 🔴 優先度高: バリデーションの重複\n');
    report.push('同じ検証ロジックが複数箇所にあります。値オブジェクトにカプセル化を検討してください。\n');
    for (const dup of duplications) {
      report.push(`### ${dup.pattern}`);
      report.push(`- 検出数: ${dup.count}件`);
      report.push(`- ファイル:`);
      for (const file of dup.files) {
        report.push(`  - ${file}`);
      }
      report.push('');
    }
  }

  // パラメータの問題
  if (parameterIssues.length > 0) {
    report.push('\n## 🟡 パラメータのプリミティブ型\n');
    report.push('関数パラメータでプリミティブ型が使用されています。\n');

    // ファイルごとにグループ化
    const byFile = groupByFile(parameterIssues);
    for (const [file, issues] of byFile) {
      report.push(`### ${file}`);
      for (const issue of issues) {
        report.push(`- 行 ${issue.line}: \`${truncate(issue.code, 60)}\``);
        report.push(`  - 提案: ${issue.suggestion}`);
      }
      report.push('');
    }
  }

  // プロパティの問題
  if (propertyIssues.length > 0) {
    report.push('\n## 🟡 プロパティのプリミティブ型\n');
    report.push('クラス/インターフェースのプロパティでプリミティブ型が使用されています。\n');

    const byFile = groupByFile(propertyIssues);
    for (const [file, issues] of byFile) {
      report.push(`### ${file}`);
      for (const issue of issues) {
        report.push(`- 行 ${issue.line}: \`${truncate(issue.code, 60)}\``);
        report.push(`  - 提案: ${issue.suggestion}`);
      }
      report.push('');
    }
  }

  // 推奨アクション
  report.push('\n## 推奨アクション\n');
  report.push('1. **バリデーション重複の解消**: 同じ検証ロジックを値オブジェクトに集約');
  report.push('2. **識別子の値オブジェクト化**: userId, orderIdなどを専用のId型に');
  report.push('3. **ドメイン概念の抽出**: email, phone, moneyなどを値オブジェクトに');
  report.push('4. **段階的な導入**: 影響範囲が小さい箇所から始める');

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
    console.log('使用方法: node detect-primitive-obsession.mjs <directory>');
    console.log('');
    console.log('例:');
    console.log('  node detect-primitive-obsession.mjs src/domain/');
    console.log('  node detect-primitive-obsession.mjs src/');
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
  console.log('ファイルを検索中...');

  // ファイル一覧取得
  const files = await walkDirectory(targetDir);
  console.log(`${files.length}個のファイルを発見`);

  // 検出
  const allIssues = [];

  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      const issues = detectPrimitiveObsession(content, file);
      allIssues.push(...issues);
    } catch (error) {
      console.warn(`警告: ファイル読み込みエラー: ${file}`);
    }
  }

  // バリデーション重複の検出
  const duplications = detectValidationDuplication(allIssues);

  // レポート生成
  const report = generateReport(allIssues, duplications, files.length);
  console.log('\n' + report);

  // 終了コード
  process.exit(allIssues.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('エラー:', error.message);
  process.exit(1);
});
