#!/usr/bin/env node
/**
 * Repository構造検証スクリプト
 *
 * Repository実装ファイルが設計原則に従っているか検証します。
 *
 * 使用方法:
 *   node validate-repository.mjs <repository-file.ts>
 *
 * 検証項目:
 *   - インターフェース実装の有無
 *   - toEntity/toRecord変換関数の存在
 *   - CRUD操作の実装
 *   - DBの詳細が外部に漏れていないか
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// 検証結果の定数
const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️';

/**
 * メイン検証関数
 */
function validateRepository(filePath) {
  const absolutePath = resolve(filePath);

  if (!existsSync(absolutePath)) {
    console.error(`${FAIL} ファイルが見つかりません: ${absolutePath}`);
    process.exit(1);
  }

  const content = readFileSync(absolutePath, 'utf-8');
  const results = [];
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  console.log('\n📋 Repository構造検証レポート');
  console.log('='.repeat(50));
  console.log(`ファイル: ${filePath}\n`);

  // 1. インターフェース実装チェック
  const implementsPattern = /implements\s+I\w+Repository/;
  if (implementsPattern.test(content)) {
    results.push(`${PASS} インターフェース実装: 検出`);
    passCount++;
  } else {
    results.push(`${FAIL} インターフェース実装: 未検出 (implements IXxxRepository が必要)`);
    failCount++;
  }

  // 2. toEntity変換関数チェック
  const toEntityPattern = /(?:private\s+)?toEntity\s*\(/;
  if (toEntityPattern.test(content)) {
    results.push(`${PASS} toEntity変換関数: 検出`);
    passCount++;
  } else {
    results.push(`${WARN} toEntity変換関数: 未検出 (DB→ドメイン変換の実装を推奨)`);
    warnCount++;
  }

  // 3. toRecord変換関数チェック
  const toRecordPattern = /(?:private\s+)?toRecord\s*\(/;
  if (toRecordPattern.test(content)) {
    results.push(`${PASS} toRecord変換関数: 検出`);
    passCount++;
  } else {
    results.push(`${WARN} toRecord変換関数: 未検出 (ドメイン→DB変換の実装を推奨)`);
    warnCount++;
  }

  // 4. CRUD操作チェック
  const crudMethods = [
    { name: 'add/create', pattern: /async\s+(?:add|create)\s*\(/ },
    { name: 'findById', pattern: /async\s+findById\s*\(/ },
    { name: 'update', pattern: /async\s+update\s*\(/ },
    { name: 'remove/delete', pattern: /async\s+(?:remove|delete)\s*\(/ },
  ];

  crudMethods.forEach(({ name, pattern }) => {
    if (pattern.test(content)) {
      results.push(`${PASS} ${name}メソッド: 検出`);
      passCount++;
    } else {
      results.push(`${WARN} ${name}メソッド: 未検出`);
      warnCount++;
    }
  });

  // 5. DB詳細漏洩チェック
  const leakagePatterns = [
    { name: 'SQL文字列', pattern: /['"`]SELECT\s|['"`]INSERT\s|['"`]UPDATE\s|['"`]DELETE\s/i },
    { name: 'テーブル名直接参照', pattern: /FROM\s+['"`]?\w+['"`]?\s+WHERE/i },
  ];

  leakagePatterns.forEach(({ name, pattern }) => {
    if (pattern.test(content)) {
      results.push(`${WARN} ${name}: 検出 (抽象化の改善を検討)`);
      warnCount++;
    } else {
      results.push(`${PASS} ${name}: 未検出`);
      passCount++;
    }
  });

  // 6. エラーハンドリングチェック
  const errorHandlingPattern = /try\s*\{[\s\S]*catch\s*\(/;
  if (errorHandlingPattern.test(content)) {
    results.push(`${PASS} エラーハンドリング: 検出`);
    passCount++;
  } else {
    results.push(`${WARN} エラーハンドリング: 未検出 (try-catchの実装を推奨)`);
    warnCount++;
  }

  // 7. コンストラクタでのDB注入チェック
  const constructorDbPattern = /constructor\s*\([^)]*(?:db|database|client|connection)[^)]*\)/i;
  if (constructorDbPattern.test(content)) {
    results.push(`${PASS} DBクライアント注入: 検出`);
    passCount++;
  } else {
    results.push(`${WARN} DBクライアント注入: 未検出 (依存性注入の使用を推奨)`);
    warnCount++;
  }

  // 結果出力
  console.log('検証結果:');
  console.log('-'.repeat(50));
  results.forEach(result => console.log(result));

  console.log('\n' + '='.repeat(50));
  console.log(`合計: ${PASS} ${passCount} / ${WARN} ${warnCount} / ${FAIL} ${failCount}`);

  // スコア計算
  const total = passCount + failCount + warnCount;
  const score = Math.round((passCount / total) * 100);
  console.log(`スコア: ${score}%`);

  if (failCount > 0) {
    console.log(`\n${FAIL} 必須項目が未実装です。修正が必要です。`);
    process.exit(1);
  } else if (warnCount > 0) {
    console.log(`\n${WARN} 推奨事項があります。改善を検討してください。`);
    process.exit(0);
  } else {
    console.log(`\n${PASS} すべての検証に合格しました！`);
    process.exit(0);
  }
}

// CLI実行
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('使用方法: node validate-repository.mjs <repository-file.ts>');
  console.log('例: node validate-repository.mjs src/shared/infrastructure/database/repositories/WorkflowRepository.ts');
  process.exit(1);
}

validateRepository(args[0]);
