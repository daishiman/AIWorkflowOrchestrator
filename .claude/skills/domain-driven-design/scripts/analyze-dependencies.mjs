#!/usr/bin/env node

/**
 * ドメイン依存関係分析スクリプト
 *
 * ドメイン層のコードが技術的詳細（インフラ層、プレゼンテーション層）に
 * 依存していないかを検証します。
 *
 * 使用方法:
 *   node analyze-dependencies.mjs <directory>
 *
 * 例:
 *   node analyze-dependencies.mjs src/shared/core/
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';

// 禁止された依存パターン
const FORBIDDEN_PATTERNS = {
  // インフラストラクチャ層への依存
  infrastructure: [
    /from\s+['"].*infrastructure/i,
    /from\s+['"].*infra/i,
    /from\s+['"].*database/i,
    /from\s+['"].*persistence/i,
    /from\s+['"].*orm/i,
    /from\s+['"].*prisma/i,
    /from\s+['"].*drizzle/i,
    /from\s+['"].*typeorm/i,
  ],

  // プレゼンテーション層への依存
  presentation: [
    /from\s+['"].*presentation/i,
    /from\s+['"].*ui/i,
    /from\s+['"].*views/i,
    /from\s+['"].*components/i,
    /from\s+['"].*pages/i,
    /from\s+['"]react/i,
    /from\s+['"]vue/i,
    /from\s+['"]@angular/i,
  ],

  // アプリケーション層への依存（ドメイン層からは禁止）
  application: [
    /from\s+['"].*application/i,
    /from\s+['"].*usecases/i,
    /from\s+['"].*use-cases/i,
    /from\s+['"].*handlers/i,
  ],

  // 外部フレームワークへの依存
  frameworks: [
    /from\s+['"]express/i,
    /from\s+['"]fastify/i,
    /from\s+['"]koa/i,
    /from\s+['"]hono/i,
    /from\s+['"]next/i,
  ],
};

// 許可されるドメイン内部の依存
const ALLOWED_PATTERNS = [
  /from\s+['"]\.\.?\//,  // 相対パス
  /from\s+['"].*domain/i,
  /from\s+['"].*entities/i,
  /from\s+['"].*value-objects/i,
  /from\s+['"].*aggregates/i,
  /from\s+['"].*repositories/i,
  /from\s+['"].*services/i,
  /from\s+['"].*events/i,
];

/**
 * ファイルの依存関係を分析
 */
async function analyzeFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];
  const imports = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // インポート文を検出
    const importMatch = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (!importMatch) continue;

    const importPath = importMatch[1];
    imports.push({ path: importPath, line: lineNumber });

    // 禁止パターンをチェック
    for (const [category, patterns] of Object.entries(FORBIDDEN_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          violations.push({
            file: filePath,
            line: lineNumber,
            category,
            import: importPath,
            content: line.trim(),
          });
        }
      }
    }
  }

  return { filePath, imports, violations };
}

/**
 * ディレクトリを再帰的に分析
 */
async function analyzeDirectory(dir, results = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      await analyzeDirectory(fullPath, results);
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        try {
          const analysis = await analyzeFile(fullPath);
          results.push(analysis);
        } catch {
          // ファイル読み込みエラーは無視
        }
      }
    }
  }

  return results;
}

/**
 * 依存関係グラフを構築
 */
function buildDependencyGraph(results) {
  const graph = {};

  for (const result of results) {
    const fileName = basename(result.filePath);
    graph[fileName] = {
      path: result.filePath,
      dependencies: result.imports.map(imp => imp.path),
      violationCount: result.violations.length,
    };
  }

  return graph;
}

/**
 * レポート生成
 */
function generateReport(results) {
  const report = [];
  const violations = results.flatMap(r => r.violations);
  const totalFiles = results.length;
  const filesWithViolations = results.filter(r => r.violations.length > 0).length;

  report.push('# ドメイン依存関係分析レポート\n');
  report.push(`生成日時: ${new Date().toISOString()}\n`);

  // サマリー
  report.push('\n## サマリー\n');
  report.push(`- 分析ファイル数: ${totalFiles}`);
  report.push(`- 違反ファイル数: ${filesWithViolations}`);
  report.push(`- 総違反数: ${violations.length}`);

  if (violations.length === 0) {
    report.push('\n✅ ドメイン層の依存関係は適切です。技術的詳細への依存は検出されませんでした。\n');
    return report.join('\n');
  }

  // カテゴリ別の違反
  report.push('\n## 違反の詳細\n');

  const byCategory = {};
  for (const v of violations) {
    if (!byCategory[v.category]) {
      byCategory[v.category] = [];
    }
    byCategory[v.category].push(v);
  }

  for (const [category, items] of Object.entries(byCategory)) {
    report.push(`\n### ${getCategoryLabel(category)} (${items.length}件)\n`);
    for (const item of items) {
      report.push(`- **${item.file}:${item.line}**`);
      report.push(`  - インポート: \`${item.import}\``);
      report.push(`  - コード: \`${item.content}\``);
    }
  }

  // 推奨アクション
  report.push('\n## 推奨アクション\n');
  report.push('1. **インフラ層への依存**: リポジトリインターフェースを通じてアクセス');
  report.push('2. **プレゼンテーション層への依存**: DTOやViewModelで分離');
  report.push('3. **アプリケーション層への依存**: 依存性逆転の原則を適用');
  report.push('4. **フレームワーク依存**: ポートとアダプターパターンで隔離');

  return report.join('\n');
}

/**
 * カテゴリラベルを取得
 */
function getCategoryLabel(category) {
  const labels = {
    infrastructure: 'インフラストラクチャ層への依存',
    presentation: 'プレゼンテーション層への依存',
    application: 'アプリケーション層への依存',
    frameworks: '外部フレームワークへの依存',
  };
  return labels[category] || category;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node analyze-dependencies.mjs <directory>');
    console.log('');
    console.log('例:');
    console.log('  node analyze-dependencies.mjs src/shared/core/');
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
  console.log('依存関係を分析中...\n');

  // 分析実行
  const results = await analyzeDirectory(targetDir);

  // レポート生成
  const report = generateReport(results);
  console.log(report);

  // 違反があればエラーコードで終了
  const hasViolations = results.some(r => r.violations.length > 0);
  process.exit(hasViolations ? 1 : 0);
}

main().catch((error) => {
  console.error('エラー:', error.message);
  process.exit(1);
});
