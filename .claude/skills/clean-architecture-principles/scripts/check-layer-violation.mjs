#!/usr/bin/env node
/**
 * Clean Architecture レイヤー違反検出スクリプト
 *
 * 使用方法:
 *   node check-layer-violation.mjs <source-directory>
 *
 * 例:
 *   node check-layer-violation.mjs src/
 *   node check-layer-violation.mjs src/shared/core/
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

// レイヤー定義（内側から外側の順）
const LAYER_ORDER = [
  'shared/core',
  'shared/infrastructure',
  'features',
  'app'
];

// 各レイヤーが許可される依存先
const ALLOWED_DEPENDENCIES = {
  'shared/core': [],  // 外部依存なし
  'shared/infrastructure': ['shared/core'],
  'features': ['shared/core', 'shared/infrastructure'],
  'app': ['shared/core', 'shared/infrastructure', 'features']
};

// 禁止される外部ライブラリ（shared/coreで）
const FORBIDDEN_IN_CORE = [
  'drizzle',
  'zod',
  '@ai-sdk',
  'discord.js',
  'next'
];

async function findTsFiles(dir) {
  const files = [];

  async function scan(currentDir) {
    try {
      const entries = await readdir(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== '__tests__') {
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

function getLayer(filePath) {
  for (const layer of LAYER_ORDER) {
    if (filePath.includes(layer)) {
      return layer;
    }
  }
  return null;
}

function extractImports(content) {
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  const imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

async function checkFile(filePath, baseDir) {
  const violations = [];
  const content = await readFile(filePath, 'utf-8');
  const relativePath = relative(baseDir, filePath);
  const currentLayer = getLayer(relativePath);

  if (!currentLayer) {
    return violations;
  }

  const imports = extractImports(content);
  const allowedDeps = ALLOWED_DEPENDENCIES[currentLayer] || [];

  for (const imp of imports) {
    // 相対インポートの処理
    if (imp.startsWith('.')) {
      // 同じレイヤー内の依存はOK
      continue;
    }

    // shared/core の外部ライブラリチェック
    if (currentLayer === 'shared/core') {
      for (const forbidden of FORBIDDEN_IN_CORE) {
        if (imp.includes(forbidden)) {
          violations.push({
            file: relativePath,
            layer: currentLayer,
            import: imp,
            type: 'forbidden_external',
            message: `shared/core は ${forbidden} に依存してはいけません`
          });
        }
      }
    }

    // レイヤー間の依存チェック
    for (const layer of LAYER_ORDER) {
      if (imp.includes(layer) && !allowedDeps.includes(layer) && layer !== currentLayer) {
        violations.push({
          file: relativePath,
          layer: currentLayer,
          import: imp,
          type: 'layer_violation',
          message: `${currentLayer} は ${layer} に依存してはいけません`
        });
      }
    }

    // features間の相互依存チェック
    if (currentLayer === 'features' && imp.includes('features/')) {
      const currentFeature = relativePath.match(/features\/([^/]+)/)?.[1];
      const importFeature = imp.match(/features\/([^/]+)/)?.[1];

      if (currentFeature && importFeature && currentFeature !== importFeature) {
        violations.push({
          file: relativePath,
          layer: currentLayer,
          import: imp,
          type: 'feature_cross_dependency',
          message: `features/${currentFeature} は features/${importFeature} に依存してはいけません`
        });
      }
    }
  }

  return violations;
}

async function main() {
  const targetDir = process.argv[2] || 'src';

  console.log(`\n🔍 Clean Architecture レイヤー違反検出`);
  console.log(`📁 対象ディレクトリ: ${targetDir}\n`);

  const files = await findTsFiles(targetDir);
  console.log(`📄 検出ファイル数: ${files.length}\n`);

  const allViolations = [];

  for (const file of files) {
    const violations = await checkFile(file, targetDir);
    allViolations.push(...violations);
  }

  if (allViolations.length === 0) {
    console.log('✅ レイヤー違反は検出されませんでした\n');
    process.exit(0);
  }

  console.log(`❌ ${allViolations.length} 件の違反が検出されました\n`);

  // 種類別に分類
  const byType = {};
  for (const v of allViolations) {
    if (!byType[v.type]) byType[v.type] = [];
    byType[v.type].push(v);
  }

  // レポート出力
  for (const [type, violations] of Object.entries(byType)) {
    console.log(`\n## ${type} (${violations.length}件)`);
    for (const v of violations) {
      console.log(`  - ${v.file}`);
      console.log(`    import: ${v.import}`);
      console.log(`    ${v.message}`);
    }
  }

  console.log('\n');
  process.exit(1);
}

main().catch(console.error);
