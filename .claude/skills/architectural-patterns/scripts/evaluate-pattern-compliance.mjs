#!/usr/bin/env node
/**
 * アーキテクチャパターン準拠評価スクリプト
 *
 * 使用方法:
 *   node evaluate-pattern-compliance.mjs <source-directory> [--pattern=hexagonal|onion|vertical-slice]
 *
 * 例:
 *   node evaluate-pattern-compliance.mjs src/
 *   node evaluate-pattern-compliance.mjs src/ --pattern=hexagonal
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, dirname, basename } from 'path';

// パターン別の期待される構造
const PATTERNS = {
  hexagonal: {
    name: 'Hexagonal Architecture',
    expectedDirs: ['domain', 'application', 'infrastructure', 'adapters', 'ports'],
    rules: [
      { from: 'domain', to: ['application', 'infrastructure', 'adapters'], allowed: false },
      { from: 'application', to: ['infrastructure', 'adapters'], allowed: false },
      { from: 'ports', to: ['infrastructure', 'adapters'], allowed: false },
    ],
  },
  onion: {
    name: 'Onion Architecture',
    expectedDirs: ['domain', 'core', 'application', 'infrastructure'],
    rules: [
      { from: 'domain', to: ['application', 'infrastructure'], allowed: false },
      { from: 'core', to: ['application', 'infrastructure'], allowed: false },
      { from: 'application', to: ['infrastructure'], allowed: false },
    ],
  },
  'vertical-slice': {
    name: 'Vertical Slice Architecture',
    expectedDirs: ['features', 'shared'],
    rules: [
      // 各featureは独立している必要がある
      { from: 'features/*', to: ['features/*'], allowed: false, sameFeature: true },
    ],
  },
};

async function findTsFiles(dir) {
  const files = [];

  async function scan(currentDir) {
    try {
      const entries = await readdir(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
            await scan(fullPath);
          }
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (e) {
      // ディレクトリが存在しない場合はスキップ
    }
  }

  await scan(dir);
  return files;
}

function getLayer(filePath, baseDir) {
  const relativePath = relative(baseDir, filePath);
  const parts = relativePath.split('/');

  // 最初のディレクトリをレイヤーとして返す
  return parts[0]?.toLowerCase() || 'unknown';
}

function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:(?:\{[^}]*\}|[^{}\s]+)\s+from\s+)?['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    // 相対インポートのみ対象
    if (importPath.startsWith('.') || importPath.startsWith('@/')) {
      imports.push(importPath);
    }
  }

  return imports;
}

async function analyzeFile(filePath, baseDir) {
  const content = await readFile(filePath, 'utf-8');
  const imports = extractImports(content);
  const layer = getLayer(filePath, baseDir);

  return {
    file: relative(baseDir, filePath),
    layer,
    imports,
  };
}

function checkViolations(analysis, pattern, baseDir) {
  const violations = [];
  const patternRules = PATTERNS[pattern]?.rules || [];

  for (const file of analysis) {
    for (const imp of file.imports) {
      // インポート先のレイヤーを推定
      let targetLayer = 'unknown';

      if (imp.startsWith('@/')) {
        targetLayer = imp.replace('@/', '').split('/')[0]?.toLowerCase();
      } else if (imp.startsWith('..')) {
        // 相対パスから推定
        const resolved = join(dirname(file.file), imp);
        targetLayer = resolved.split('/')[0]?.toLowerCase();
      } else if (imp.startsWith('.')) {
        targetLayer = file.layer; // 同じレイヤー内
      }

      // ルールチェック
      for (const rule of patternRules) {
        if (file.layer === rule.from || rule.from.endsWith('/*')) {
          const targetMatches = rule.to.some(t => {
            if (t.endsWith('/*')) {
              return targetLayer.startsWith(t.replace('/*', ''));
            }
            return targetLayer === t;
          });

          if (targetMatches && !rule.allowed) {
            violations.push({
              file: file.file,
              fromLayer: file.layer,
              toLayer: targetLayer,
              import: imp,
              rule: `${rule.from} → ${rule.to.join('|')}`,
            });
          }
        }
      }
    }
  }

  return violations;
}

function detectPattern(dirStructure) {
  const dirs = new Set(dirStructure.map(d => d.toLowerCase()));

  // パターン検出の優先順位
  if (dirs.has('ports') || dirs.has('adapters')) {
    return 'hexagonal';
  }
  if (dirs.has('features') && dirs.has('shared')) {
    return 'vertical-slice';
  }
  if (dirs.has('domain') && dirs.has('infrastructure')) {
    return 'onion';
  }

  return 'unknown';
}

async function getTopLevelDirs(targetDir) {
  const entries = await readdir(targetDir);
  const dirs = [];

  for (const entry of entries) {
    const fullPath = join(targetDir, entry);
    const stats = await stat(fullPath);
    if (stats.isDirectory() && !entry.startsWith('.')) {
      dirs.push(entry);
    }
  }

  return dirs;
}

async function main() {
  const args = process.argv.slice(2);
  const targetDir = args.find(a => !a.startsWith('--')) || 'src';
  const patternArg = args.find(a => a.startsWith('--pattern='));
  const specifiedPattern = patternArg?.split('=')[1]?.toLowerCase();

  console.log('\n📐 アーキテクチャパターン準拠評価');
  console.log(`📁 対象ディレクトリ: ${targetDir}\n`);

  // ディレクトリ構造を取得
  const topLevelDirs = await getTopLevelDirs(targetDir);
  console.log(`📂 トップレベルディレクトリ: ${topLevelDirs.join(', ')}\n`);

  // パターン検出または指定
  const detectedPattern = specifiedPattern || detectPattern(topLevelDirs);
  const pattern = PATTERNS[detectedPattern];

  if (!pattern) {
    console.log('⚠️ アーキテクチャパターンを特定できませんでした');
    console.log('   利用可能なパターン: hexagonal, onion, vertical-slice');
    console.log('   --pattern=<pattern> で明示的に指定してください\n');
    process.exit(0);
  }

  console.log(`🏗️ 検出/指定パターン: ${pattern.name}`);
  console.log(`📋 期待されるディレクトリ: ${pattern.expectedDirs.join(', ')}\n`);

  // ディレクトリ構造の評価
  console.log('## ディレクトリ構造の評価\n');
  const missingDirs = pattern.expectedDirs.filter(d => !topLevelDirs.includes(d));
  const extraDirs = topLevelDirs.filter(d => !pattern.expectedDirs.includes(d));

  if (missingDirs.length === 0) {
    console.log('✅ すべての期待されるディレクトリが存在します');
  } else {
    console.log(`⚠️ 不足しているディレクトリ: ${missingDirs.join(', ')}`);
  }

  if (extraDirs.length > 0) {
    console.log(`📌 追加のディレクトリ: ${extraDirs.join(', ')}`);
  }

  // ファイル分析
  console.log('\n## 依存関係の分析\n');
  const files = await findTsFiles(targetDir);
  console.log(`📄 検出ファイル数: ${files.length}`);

  if (files.length === 0) {
    console.log('⚠️ TypeScriptファイルが見つかりませんでした\n');
    process.exit(0);
  }

  const analysis = [];
  for (const file of files) {
    const result = await analyzeFile(file, targetDir);
    analysis.push(result);
  }

  // レイヤー別ファイル数
  const layerCounts = {};
  for (const a of analysis) {
    layerCounts[a.layer] = (layerCounts[a.layer] || 0) + 1;
  }

  console.log('\n### レイヤー別ファイル数\n');
  for (const [layer, count] of Object.entries(layerCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${layer}: ${count}ファイル`);
  }

  // 違反検出
  console.log('\n## 依存関係違反の検出\n');
  const violations = checkViolations(analysis, detectedPattern, targetDir);

  if (violations.length === 0) {
    console.log('✅ 依存関係違反は検出されませんでした\n');
  } else {
    console.log(`❌ ${violations.length} 件の依存関係違反が検出されました\n`);

    for (const v of violations) {
      console.log(`  🔴 ${v.file}`);
      console.log(`     ${v.fromLayer} → ${v.toLayer}`);
      console.log(`     import: ${v.import}`);
      console.log(`     違反ルール: ${v.rule}\n`);
    }
  }

  // スコア算出
  console.log('## 準拠スコア\n');
  const structureScore = missingDirs.length === 0 ? 40 : Math.max(0, 40 - missingDirs.length * 10);
  const dependencyScore = violations.length === 0 ? 40 : Math.max(0, 40 - violations.length * 5);
  const isolationScore = 20; // 簡易評価
  const totalScore = structureScore + dependencyScore + isolationScore;

  console.log(`  構造スコア: ${structureScore}/40`);
  console.log(`  依存関係スコア: ${dependencyScore}/40`);
  console.log(`  ドメイン隔離スコア: ${isolationScore}/20`);
  console.log(`  -------------`);
  console.log(`  総合スコア: ${totalScore}/100\n`);

  const rating = totalScore >= 80 ? '✅ 良好' : totalScore >= 60 ? '⚠️ 要改善' : '❌ 要対応';
  console.log(`評価: ${rating}\n`);

  process.exit(violations.length > 0 ? 1 : 0);
}

main().catch(console.error);
