#!/usr/bin/env node

/**
 * 用語一貫性分析スクリプト
 *
 * コードベース内の命名とドメイン用語集の整合性を分析します。
 *
 * 使用方法:
 *   node analyze-terminology.mjs <directory> [--glossary <path>]
 *
 * 例:
 *   node analyze-terminology.mjs src/domain/
 *   node analyze-terminology.mjs src/ --glossary docs/glossary.json
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';

// デフォルトのドメイン用語パターン
const DEFAULT_DOMAIN_PATTERNS = {
  // 一般的なDDD用語（検出対象外）
  technicalTerms: [
    /Entity$/,
    /VO$/,
    /DTO$/,
    /Repository$/,
    /Service$/,
    /Factory$/,
    /Impl$/,
    /Interface$/,
    /Abstract/,
    /Base$/,
    /Manager$/,
    /Helper$/,
    /Utils?$/,
    /Handler$/,
    /Controller$/,
    /Provider$/,
  ],

  // 非推奨の命名パターン
  deprecatedPatterns: [
    { pattern: /Data$/, suggestion: 'より具体的なドメイン用語を使用' },
    { pattern: /Info$/, suggestion: 'より具体的なドメイン用語を使用' },
    { pattern: /Manager$/, suggestion: 'Service または具体的な責務名を使用' },
    { pattern: /Helper$/, suggestion: 'Service または具体的な責務名を使用' },
    { pattern: /Utils?$/, suggestion: 'ドメインサービスに移行' },
    { pattern: /process/, suggestion: '具体的なドメイン動詞を使用' },
    { pattern: /handle/, suggestion: '具体的なドメイン動詞を使用' },
    { pattern: /do[A-Z]/, suggestion: '具体的なドメイン動詞を使用' },
  ],
};

/**
 * TypeScript/JavaScriptファイルからクラス名、メソッド名を抽出
 */
function extractTerms(content, filePath) {
  const terms = {
    classes: [],
    methods: [],
    properties: [],
    enums: [],
    types: [],
  };

  // クラス名の抽出
  const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g;
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    terms.classes.push({
      name: match[1],
      file: filePath,
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // インターフェース名の抽出
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    terms.types.push({
      name: match[1],
      file: filePath,
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // 型エイリアスの抽出
  const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=/g;
  while ((match = typeRegex.exec(content)) !== null) {
    terms.types.push({
      name: match[1],
      file: filePath,
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // 列挙型の抽出
  const enumRegex = /(?:export\s+)?enum\s+(\w+)/g;
  while ((match = enumRegex.exec(content)) !== null) {
    terms.enums.push({
      name: match[1],
      file: filePath,
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // メソッド名の抽出（クラス内）
  const methodRegex =
    /(?:public|private|protected|static|async)?\s*(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/g;
  while ((match = methodRegex.exec(content)) !== null) {
    const methodName = match[1];
    // コンストラクタや一般的なキーワードを除外
    if (
      !['constructor', 'if', 'for', 'while', 'switch', 'catch'].includes(
        methodName
      )
    ) {
      terms.methods.push({
        name: methodName,
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  return terms;
}

/**
 * 用語の問題を検出
 */
function analyzeTerms(terms, glossary = null) {
  const issues = {
    technicalSuffixes: [],
    deprecatedPatterns: [],
    inconsistentNaming: [],
    missingFromGlossary: [],
  };

  const allTerms = [
    ...terms.classes,
    ...terms.types,
    ...terms.enums,
    ...terms.methods,
  ];

  for (const term of allTerms) {
    // 技術的なサフィックスの検出
    for (const pattern of DEFAULT_DOMAIN_PATTERNS.technicalTerms) {
      if (pattern.test(term.name)) {
        issues.technicalSuffixes.push({
          ...term,
          pattern: pattern.toString(),
          suggestion: '技術的なサフィックスを削除し、ドメイン用語を使用',
        });
      }
    }

    // 非推奨パターンの検出
    for (const { pattern, suggestion } of DEFAULT_DOMAIN_PATTERNS
      .deprecatedPatterns) {
      if (pattern.test(term.name)) {
        issues.deprecatedPatterns.push({
          ...term,
          pattern: pattern.toString(),
          suggestion,
        });
      }
    }

    // 用語集との照合（用語集が提供された場合）
    if (glossary && glossary.terms) {
      const termInGlossary = glossary.terms.some(
        (g) =>
          g.englishTerm === term.name ||
          g.codeMapping?.className === term.name ||
          g.term === term.name
      );

      if (
        !termInGlossary &&
        terms.classes.some((c) => c.name === term.name)
      ) {
        issues.missingFromGlossary.push({
          ...term,
          suggestion: '用語集に追加を検討',
        });
      }
    }
  }

  // 命名の一貫性チェック（類似用語の検出）
  const classNames = terms.classes.map((c) => c.name);
  const similarGroups = findSimilarTerms(classNames);
  for (const group of similarGroups) {
    if (group.length > 1) {
      issues.inconsistentNaming.push({
        terms: group,
        suggestion: '用語を統一することを検討',
      });
    }
  }

  return issues;
}

/**
 * 類似した用語をグループ化
 */
function findSimilarTerms(terms) {
  const groups = [];
  const processed = new Set();

  // 同じ概念を指す可能性のある用語パターン
  const synonymPatterns = [
    ['User', 'Customer', 'Client', 'Account'],
    ['Order', 'Purchase', 'Transaction'],
    ['Item', 'Product', 'Good'],
    ['Create', 'Add', 'Register', 'Insert'],
    ['Update', 'Modify', 'Edit', 'Change'],
    ['Delete', 'Remove', 'Cancel'],
    ['Get', 'Fetch', 'Find', 'Retrieve'],
  ];

  for (const synonymGroup of synonymPatterns) {
    const found = terms.filter((t) =>
      synonymGroup.some(
        (syn) => t.includes(syn) || t.toLowerCase().includes(syn.toLowerCase())
      )
    );

    if (found.length > 1) {
      const uniqueFound = [...new Set(found)];
      if (uniqueFound.length > 1) {
        groups.push(uniqueFound);
        uniqueFound.forEach((t) => processed.add(t));
      }
    }
  }

  return groups;
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
        // node_modules と隠しディレクトリをスキップ
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
function generateReport(allIssues, totalFiles) {
  const report = [];

  report.push('# 用語一貫性分析レポート\n');
  report.push(`分析ファイル数: ${totalFiles}\n`);
  report.push(`生成日時: ${new Date().toISOString()}\n`);

  // サマリー
  const totalIssues =
    allIssues.technicalSuffixes.length +
    allIssues.deprecatedPatterns.length +
    allIssues.inconsistentNaming.length +
    allIssues.missingFromGlossary.length;

  report.push('\n## サマリー\n');
  report.push(`- 技術的サフィックス: ${allIssues.technicalSuffixes.length}件`);
  report.push(`- 非推奨パターン: ${allIssues.deprecatedPatterns.length}件`);
  report.push(`- 命名の不整合: ${allIssues.inconsistentNaming.length}件`);
  report.push(`- 用語集に未登録: ${allIssues.missingFromGlossary.length}件`);
  report.push(`- **合計: ${totalIssues}件**\n`);

  // 詳細
  if (allIssues.technicalSuffixes.length > 0) {
    report.push('\n## 技術的サフィックス\n');
    report.push(
      'ドメイン用語に技術的なサフィックスが付いています。削除を検討してください。\n'
    );
    for (const issue of allIssues.technicalSuffixes) {
      report.push(`- \`${issue.name}\` (${issue.file}:${issue.line})`);
      report.push(`  - 提案: ${issue.suggestion}`);
    }
  }

  if (allIssues.deprecatedPatterns.length > 0) {
    report.push('\n## 非推奨パターン\n');
    report.push('より具体的なドメイン用語への置き換えを検討してください。\n');
    for (const issue of allIssues.deprecatedPatterns) {
      report.push(`- \`${issue.name}\` (${issue.file}:${issue.line})`);
      report.push(`  - パターン: ${issue.pattern}`);
      report.push(`  - 提案: ${issue.suggestion}`);
    }
  }

  if (allIssues.inconsistentNaming.length > 0) {
    report.push('\n## 命名の不整合\n');
    report.push('同じ概念に異なる用語が使われている可能性があります。\n');
    for (const issue of allIssues.inconsistentNaming) {
      report.push(`- 類似用語: ${issue.terms.join(', ')}`);
      report.push(`  - 提案: ${issue.suggestion}`);
    }
  }

  if (allIssues.missingFromGlossary.length > 0) {
    report.push('\n## 用語集に未登録\n');
    report.push('用語集への追加を検討してください。\n');
    for (const issue of allIssues.missingFromGlossary) {
      report.push(`- \`${issue.name}\` (${issue.file}:${issue.line})`);
    }
  }

  return report.join('\n');
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node analyze-terminology.mjs <directory> [--glossary <path>]');
    console.log('');
    console.log('例:');
    console.log('  node analyze-terminology.mjs src/domain/');
    console.log('  node analyze-terminology.mjs src/ --glossary docs/glossary.json');
    process.exit(1);
  }

  const targetDir = args[0];
  let glossaryPath = null;

  // オプション解析
  const glossaryIndex = args.indexOf('--glossary');
  if (glossaryIndex !== -1 && args[glossaryIndex + 1]) {
    glossaryPath = args[glossaryIndex + 1];
  }

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

  // 用語集の読み込み
  let glossary = null;
  if (glossaryPath) {
    try {
      const glossaryContent = await readFile(glossaryPath, 'utf-8');
      glossary = JSON.parse(glossaryContent);
      console.log(`用語集を読み込みました: ${glossaryPath}`);
    } catch (error) {
      console.warn(`警告: 用語集の読み込みに失敗しました: ${error.message}`);
    }
  }

  console.log(`分析対象: ${targetDir}`);
  console.log('ファイルを検索中...');

  // ファイル一覧取得
  const files = await walkDirectory(targetDir);
  console.log(`${files.length}個のファイルを発見`);

  // 用語抽出と分析
  const allTerms = {
    classes: [],
    methods: [],
    properties: [],
    enums: [],
    types: [],
  };

  const allIssues = {
    technicalSuffixes: [],
    deprecatedPatterns: [],
    inconsistentNaming: [],
    missingFromGlossary: [],
  };

  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      const terms = extractTerms(content, file);

      // 用語を集約
      allTerms.classes.push(...terms.classes);
      allTerms.methods.push(...terms.methods);
      allTerms.enums.push(...terms.enums);
      allTerms.types.push(...terms.types);
    } catch (error) {
      console.warn(`警告: ファイル読み込みエラー: ${file}`);
    }
  }

  // 分析実行
  const issues = analyzeTerms(allTerms, glossary);
  allIssues.technicalSuffixes.push(...issues.technicalSuffixes);
  allIssues.deprecatedPatterns.push(...issues.deprecatedPatterns);
  allIssues.inconsistentNaming.push(...issues.inconsistentNaming);
  allIssues.missingFromGlossary.push(...issues.missingFromGlossary);

  // レポート生成
  const report = generateReport(allIssues, files.length);
  console.log('\n' + report);

  // 終了コード
  const totalIssues =
    allIssues.technicalSuffixes.length +
    allIssues.deprecatedPatterns.length +
    allIssues.inconsistentNaming.length;

  process.exit(totalIssues > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('エラー:', error.message);
  process.exit(1);
});
