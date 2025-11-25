#!/usr/bin/env node
/**
 * analyze-extensibility.mjs
 *
 * TypeScriptコードの拡張性を分析してOCP違反を検出するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/open-closed-principle/scripts/analyze-extensibility.mjs <file.ts>
 *
 * 検出内容:
 *   - switch文の検出
 *   - if-elseチェーンの検出
 *   - instanceof使用の検出
 *   - 型リテラル比較の検出
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';

// ===== パターン定義 =====

const OCP_VIOLATION_PATTERNS = {
  switchStatement: {
    name: 'switch文',
    pattern: /switch\s*\([^)]+\)\s*\{/g,
    severity: 'warning',
    message: 'switch文が検出されました。Strategy/Registry パターンへのリファクタリングを検討してください。',
    suggestion: 'インターフェースと具象クラスを使用して、各ケースを独立したクラスに分離することを推奨します。',
  },
  ifElseChain: {
    name: 'if-elseチェーン',
    pattern: /if\s*\([^)]+\)\s*\{[^}]*\}\s*else\s+if\s*\([^)]+\)\s*\{[^}]*\}\s*else\s+if/g,
    severity: 'warning',
    message: '長いif-elseチェーンが検出されました。Strategy/Registry パターンへのリファクタリングを検討してください。',
    suggestion: '条件ごとに独立したクラスを作成し、レジストリパターンで管理することを推奨します。',
  },
  instanceofCheck: {
    name: 'instanceof チェック',
    pattern: /instanceof\s+\w+/g,
    severity: 'info',
    message: 'instanceof による型チェックが検出されました。ポリモーフィズムの使用を検討してください。',
    suggestion: '各クラスが共通のインターフェースを実装し、自身の振る舞いを持つようにリファクタリングを推奨します。',
  },
  typeofCheck: {
    name: 'typeof チェック',
    pattern: /typeof\s+\w+\s*===?\s*['"][^'"]+['"]/g,
    severity: 'info',
    message: 'typeof による型チェックが検出されました。',
    suggestion: '型ガード関数やポリモーフィズムの使用を検討してください。',
  },
  typeLiteralComparison: {
    name: '型リテラル比較',
    pattern: /\.type\s*===?\s*['"][^'"]+['"]/g,
    severity: 'info',
    message: '型リテラルによる比較が検出されました。',
    suggestion: 'Strategy/Registryパターンを使用して、型に基づく分岐を排除することを推奨します。',
  },
};

// ===== 分析関数 =====

function analyzeFile(content) {
  const issues = [];
  const lines = content.split('\n');

  for (const [key, violation] of Object.entries(OCP_VIOLATION_PATTERNS)) {
    const matches = content.match(violation.pattern);
    if (matches) {
      for (const match of matches) {
        // マッチした位置の行番号を特定
        const index = content.indexOf(match);
        const lineNumber = content.substring(0, index).split('\n').length;

        issues.push({
          type: key,
          name: violation.name,
          severity: violation.severity,
          message: violation.message,
          suggestion: violation.suggestion,
          match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
          lineNumber,
        });
      }
    }
  }

  return issues;
}

function analyzeExtensionPoints(content) {
  const extensionPoints = [];

  // インターフェース検出
  const interfaceMatches = content.match(/interface\s+I\w+\s*\{/g);
  if (interfaceMatches) {
    for (const match of interfaceMatches) {
      const name = match.match(/interface\s+(I\w+)/)?.[1];
      extensionPoints.push({
        type: 'interface',
        name,
        description: 'インターフェースによる拡張ポイント',
      });
    }
  }

  // 抽象クラス検出
  const abstractMatches = content.match(/abstract\s+class\s+\w+/g);
  if (abstractMatches) {
    for (const match of abstractMatches) {
      const name = match.match(/abstract\s+class\s+(\w+)/)?.[1];
      extensionPoints.push({
        type: 'abstract_class',
        name,
        description: '抽象クラスによる拡張ポイント',
      });
    }
  }

  // レジストリパターン検出
  const registryMatches = content.match(/register\s*\([^)]*\)\s*:\s*void/g);
  if (registryMatches) {
    extensionPoints.push({
      type: 'registry',
      name: 'Register Method',
      description: 'レジストリパターンによる拡張ポイント',
    });
  }

  return extensionPoints;
}

function calculateScore(issues) {
  let score = 100;

  for (const issue of issues) {
    if (issue.severity === 'error') {
      score -= 15;
    } else if (issue.severity === 'warning') {
      score -= 10;
    } else if (issue.severity === 'info') {
      score -= 5;
    }
  }

  return Math.max(0, score);
}

// ===== 出力 =====

function printResults(filename, issues, extensionPoints, score) {
  console.log('\n🔍 OCP拡張性分析結果');
  console.log('='.repeat(60));
  console.log(`📁 ファイル: ${filename}`);
  console.log(`📊 OCP準拠スコア: ${score}/100`);
  console.log('');

  // 検出された問題
  if (issues.length > 0) {
    console.log('⚠️ 検出されたOCP違反の可能性');
    console.log('-'.repeat(40));

    for (const issue of issues) {
      const icon = issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`\n${icon} ${issue.name} (行 ${issue.lineNumber})`);
      console.log(`   ${issue.message}`);
      console.log(`   コード: ${issue.match}`);
      console.log(`   💡 推奨: ${issue.suggestion}`);
    }
  } else {
    console.log('✅ OCP違反の可能性は検出されませんでした');
  }

  // 拡張ポイント
  console.log('\n📋 検出された拡張ポイント');
  console.log('-'.repeat(40));

  if (extensionPoints.length > 0) {
    for (const ep of extensionPoints) {
      const icon = ep.type === 'interface' ? '📐' :
                   ep.type === 'abstract_class' ? '🏗️' :
                   ep.type === 'registry' ? '📦' : '📌';
      console.log(`${icon} ${ep.name}: ${ep.description}`);
    }
  } else {
    console.log('   拡張ポイントが見つかりませんでした');
    console.log('   💡 インターフェースやレジストリパターンの導入を検討してください');
  }

  // サマリー
  console.log('\n' + '='.repeat(60));
  console.log('📊 サマリー');
  console.log(`   OCP違反の可能性: ${issues.length}件`);
  console.log(`   拡張ポイント: ${extensionPoints.length}件`);
  console.log(`   スコア: ${score}/100`);

  if (score < 70) {
    console.log('\n❌ 拡張性の改善が必要です');
    console.log('   リファクタリングガイド: .claude/skills/open-closed-principle/resources/refactoring-to-ocp.md');
  } else if (score < 90) {
    console.log('\n⚠️ いくつかの改善点があります');
  } else {
    console.log('\n✅ 良好な拡張性です');
  }

  console.log('');
}

// ===== メイン処理 =====

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node analyze-extensibility.mjs <file.ts>');
    console.log('');
    console.log('例:');
    console.log('  node analyze-extensibility.mjs src/services/workflow-engine.ts');
    process.exit(0);
  }

  const filePath = resolve(process.cwd(), args[0]);

  if (!existsSync(filePath)) {
    console.error(`❌ ファイルが見つかりません: ${args[0]}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, 'utf-8');

    const issues = analyzeFile(content);
    const extensionPoints = analyzeExtensionPoints(content);
    const score = calculateScore(issues);

    printResults(basename(filePath), issues, extensionPoints, score);

    // スコアが低い場合は終了コード1
    process.exit(score < 70 ? 1 : 0);

  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
