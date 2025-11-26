#!/usr/bin/env node
/**
 * SOLID原則違反検出スクリプト
 *
 * 使用方法:
 *   node check-solid-violations.mjs <source-directory>
 *
 * 例:
 *   node check-solid-violations.mjs src/
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, basename } from 'path';

// 検出パターン
const VIOLATION_PATTERNS = {
  // SRP: 単一責任の原則
  srp: {
    largeClass: {
      pattern: /class\s+\w+/g,
      threshold: 300, // 行数
      message: 'クラスが大きすぎます（SRP違反の可能性）'
    },
    multipleImportTypes: {
      patterns: [
        /import.*from.*['"].*\/database/,
        /import.*from.*['"].*\/api/,
        /import.*from.*['"].*\/ui/
      ],
      threshold: 2,
      message: '複数のレイヤーに依存しています（SRP違反の可能性）'
    }
  },

  // OCP: 開放閉鎖の原則
  ocp: {
    typeSwitch: {
      pattern: /switch\s*\(\s*\w+\.type\s*\)|if\s*\(\s*\w+\.type\s*===?\s*['"]/g,
      message: '型による分岐があります（OCP違反の可能性）'
    },
    instanceof: {
      pattern: /instanceof\s+\w+/g,
      threshold: 2,
      message: '複数のinstanceofチェックがあります（OCP違反の可能性）'
    }
  },

  // LSP: リスコフの置換原則
  lsp: {
    emptyMethod: {
      pattern: /\w+\s*\([^)]*\)\s*:\s*\w+\s*{\s*}/g,
      message: '空のメソッド実装があります（LSP違反の可能性）'
    },
    throwNotImplemented: {
      pattern: /throw\s+new\s+Error\s*\(\s*['"].*not\s+(implemented|supported)/gi,
      message: 'NotImplemented例外があります（LSP違反の可能性）'
    }
  },

  // ISP: インターフェース分離の原則
  isp: {
    largeInterface: {
      pattern: /interface\s+\w+\s*{[^}]+}/gs,
      threshold: 10, // メソッド数
      message: 'インターフェースが大きすぎます（ISP違反の可能性）'
    }
  },

  // DIP: 依存性逆転の原則
  dip: {
    newInConstructor: {
      pattern: /constructor\s*\([^)]*\)\s*{[^}]*new\s+[A-Z]\w+/gs,
      message: 'コンストラクタ内でnewを使用しています（DIP違反の可能性）'
    },
    staticInstance: {
      pattern: /\.getInstance\s*\(\s*\)|\.instance\b/g,
      message: 'シングルトンパターンを使用しています（DIP違反の可能性）'
    }
  }
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

function countLines(content) {
  return content.split('\n').length;
}

function countMethods(interfaceContent) {
  const methodPattern = /^\s*\w+\s*\([^)]*\)\s*:/gm;
  const matches = interfaceContent.match(methodPattern);
  return matches ? matches.length : 0;
}

async function checkFile(filePath, baseDir) {
  const violations = [];
  const content = await readFile(filePath, 'utf-8');
  const relativePath = relative(baseDir, filePath);
  const lines = countLines(content);

  // SRP: 大きなクラス
  const classMatches = content.match(VIOLATION_PATTERNS.srp.largeClass.pattern);
  if (classMatches && lines > VIOLATION_PATTERNS.srp.largeClass.threshold) {
    violations.push({
      file: relativePath,
      principle: 'SRP',
      type: 'large_class',
      message: `${VIOLATION_PATTERNS.srp.largeClass.message}（${lines}行）`,
      severity: 'warning'
    });
  }

  // SRP: 複数レイヤーへの依存
  let layerCount = 0;
  for (const pattern of VIOLATION_PATTERNS.srp.multipleImportTypes.patterns) {
    if (pattern.test(content)) layerCount++;
  }
  if (layerCount >= VIOLATION_PATTERNS.srp.multipleImportTypes.threshold) {
    violations.push({
      file: relativePath,
      principle: 'SRP',
      type: 'multiple_layers',
      message: VIOLATION_PATTERNS.srp.multipleImportTypes.message,
      severity: 'warning'
    });
  }

  // OCP: 型による分岐
  const typeSwitchMatches = content.match(VIOLATION_PATTERNS.ocp.typeSwitch.pattern);
  if (typeSwitchMatches) {
    violations.push({
      file: relativePath,
      principle: 'OCP',
      type: 'type_switch',
      message: `${VIOLATION_PATTERNS.ocp.typeSwitch.message}（${typeSwitchMatches.length}箇所）`,
      severity: 'warning'
    });
  }

  // OCP: instanceof チェック
  const instanceofMatches = content.match(VIOLATION_PATTERNS.ocp.instanceof.pattern);
  if (instanceofMatches && instanceofMatches.length >= VIOLATION_PATTERNS.ocp.instanceof.threshold) {
    violations.push({
      file: relativePath,
      principle: 'OCP',
      type: 'instanceof_check',
      message: `${VIOLATION_PATTERNS.ocp.instanceof.message}（${instanceofMatches.length}箇所）`,
      severity: 'warning'
    });
  }

  // LSP: 空のメソッド実装
  const emptyMethodMatches = content.match(VIOLATION_PATTERNS.lsp.emptyMethod.pattern);
  if (emptyMethodMatches) {
    violations.push({
      file: relativePath,
      principle: 'LSP',
      type: 'empty_method',
      message: `${VIOLATION_PATTERNS.lsp.emptyMethod.message}（${emptyMethodMatches.length}箇所）`,
      severity: 'error'
    });
  }

  // LSP: NotImplemented例外
  const notImplementedMatches = content.match(VIOLATION_PATTERNS.lsp.throwNotImplemented.pattern);
  if (notImplementedMatches) {
    violations.push({
      file: relativePath,
      principle: 'LSP',
      type: 'not_implemented',
      message: `${VIOLATION_PATTERNS.lsp.throwNotImplemented.message}（${notImplementedMatches.length}箇所）`,
      severity: 'error'
    });
  }

  // ISP: 大きなインターフェース
  const interfaceMatches = content.match(VIOLATION_PATTERNS.isp.largeInterface.pattern);
  if (interfaceMatches) {
    for (const match of interfaceMatches) {
      const methodCount = countMethods(match);
      if (methodCount > VIOLATION_PATTERNS.isp.largeInterface.threshold) {
        const nameMatch = match.match(/interface\s+(\w+)/);
        const interfaceName = nameMatch ? nameMatch[1] : 'Unknown';
        violations.push({
          file: relativePath,
          principle: 'ISP',
          type: 'large_interface',
          message: `${VIOLATION_PATTERNS.isp.largeInterface.message}（${interfaceName}: ${methodCount}メソッド）`,
          severity: 'warning'
        });
      }
    }
  }

  // DIP: コンストラクタ内でのnew
  const newInConstructorMatches = content.match(VIOLATION_PATTERNS.dip.newInConstructor.pattern);
  if (newInConstructorMatches) {
    violations.push({
      file: relativePath,
      principle: 'DIP',
      type: 'new_in_constructor',
      message: VIOLATION_PATTERNS.dip.newInConstructor.message,
      severity: 'error'
    });
  }

  // DIP: getInstance
  const staticInstanceMatches = content.match(VIOLATION_PATTERNS.dip.staticInstance.pattern);
  if (staticInstanceMatches) {
    violations.push({
      file: relativePath,
      principle: 'DIP',
      type: 'static_instance',
      message: `${VIOLATION_PATTERNS.dip.staticInstance.message}（${staticInstanceMatches.length}箇所）`,
      severity: 'warning'
    });
  }

  return violations;
}

async function main() {
  const targetDir = process.argv[2] || 'src';

  console.log(`\n🔍 SOLID原則違反検出`);
  console.log(`📁 対象ディレクトリ: ${targetDir}\n`);

  const files = await findTsFiles(targetDir);
  console.log(`📄 検出ファイル数: ${files.length}\n`);

  const allViolations = [];

  for (const file of files) {
    const violations = await checkFile(file, targetDir);
    allViolations.push(...violations);
  }

  if (allViolations.length === 0) {
    console.log('✅ SOLID原則違反は検出されませんでした\n');
    process.exit(0);
  }

  // 原則別に分類
  const byPrinciple = {};
  for (const v of allViolations) {
    if (!byPrinciple[v.principle]) byPrinciple[v.principle] = [];
    byPrinciple[v.principle].push(v);
  }

  // サマリー
  console.log(`❌ ${allViolations.length} 件の潜在的違反が検出されました\n`);

  const principleNames = {
    SRP: '単一責任の原則',
    OCP: '開放閉鎖の原則',
    LSP: 'リスコフの置換原則',
    ISP: 'インターフェース分離の原則',
    DIP: '依存性逆転の原則'
  };

  // レポート出力
  for (const [principle, violations] of Object.entries(byPrinciple)) {
    const errors = violations.filter(v => v.severity === 'error').length;
    const warnings = violations.filter(v => v.severity === 'warning').length;

    console.log(`\n## ${principle}: ${principleNames[principle]} (${violations.length}件)`);
    console.log(`   🔴 Error: ${errors}, ⚠️ Warning: ${warnings}`);

    for (const v of violations) {
      const icon = v.severity === 'error' ? '🔴' : '⚠️';
      console.log(`   ${icon} ${v.file}`);
      console.log(`      └─ ${v.message}`);
    }
  }

  console.log('\n');

  // エラーがあれば非ゼロで終了
  const hasErrors = allViolations.some(v => v.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

main().catch(console.error);
