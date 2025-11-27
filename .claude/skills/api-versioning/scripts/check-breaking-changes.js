#!/usr/bin/env node
/**
 * OpenAPI 仕様の破壊的変更検出スクリプト
 *
 * 用途:
 * - 2つのOpenAPI仕様ファイルを比較
 * - 破壊的変更を自動検出
 * - 変更レポートを生成
 */

import { readFileSync } from 'fs';
import YAML from 'yaml';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function loadOpenAPISpec(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return YAML.parse(content);
  } catch (error) {
    log(colors.red, '❌', `ファイル読み込みエラー: ${filePath}`);
    log(colors.red, '   ', error.message);
    process.exit(1);
  }
}

function compareSpecs(oldSpec, newSpec) {
  const breakingChanges = [];
  const nonBreakingChanges = [];
  const deprecations = [];

  console.log(`\n${colors.blue}🔍 API 仕様を比較中...${colors.reset}\n`);

  // パス（エンドポイント）の比較
  const oldPaths = Object.keys(oldSpec.paths || {});
  const newPaths = Object.keys(newSpec.paths || {});

  // 削除されたエンドポイント
  oldPaths.forEach((path) => {
    if (!newPaths.includes(path)) {
      breakingChanges.push({
        type: 'endpoint_removed',
        severity: 'critical',
        path,
        message: `エンドポイント削除: ${path}`,
      });
    } else {
      // メソッドレベルの比較
      const oldMethods = Object.keys(oldSpec.paths[path]);
      const newMethods = Object.keys(newSpec.paths[path]);

      oldMethods.forEach((method) => {
        if (!newMethods.includes(method)) {
          breakingChanges.push({
            type: 'method_removed',
            severity: 'critical',
            path,
            method,
            message: `メソッド削除: ${method.toUpperCase()} ${path}`,
          });
        } else {
          // パラメータの比較
          const oldParams = oldSpec.paths[path][method].parameters || [];
          const newParams = newSpec.paths[path][method].parameters || [];

          // 新しい必須パラメータの追加
          newParams.forEach((newParam) => {
            const oldParam = oldParams.find((p) => p.name === newParam.name);

            if (!oldParam && newParam.required) {
              breakingChanges.push({
                type: 'required_param_added',
                severity: 'high',
                path,
                method,
                param: newParam.name,
                message: `必須パラメータ追加: ${method.toUpperCase()} ${path} → ${newParam.name}`,
              });
            }
          });

          // 削除されたパラメータ
          oldParams.forEach((oldParam) => {
            const newParam = newParams.find((p) => p.name === oldParam.name);

            if (!newParam) {
              breakingChanges.push({
                type: 'param_removed',
                severity: 'high',
                path,
                method,
                param: oldParam.name,
                message: `パラメータ削除: ${method.toUpperCase()} ${path} → ${oldParam.name}`,
              });
            }
          });

          // 非推奨マーク
          if (newSpec.paths[path][method].deprecated && !oldSpec.paths[path][method].deprecated) {
            deprecations.push({
              type: 'endpoint_deprecated',
              path,
              method,
              message: `非推奨マーク: ${method.toUpperCase()} ${path}`,
            });
          }
        }
      });

      // 新しいメソッドの追加（非破壊的）
      newMethods.forEach((method) => {
        if (!oldMethods.includes(method)) {
          nonBreakingChanges.push({
            type: 'method_added',
            path,
            method,
            message: `新メソッド追加: ${method.toUpperCase()} ${path}`,
          });
        }
      });
    }
  });

  // 新しいエンドポイントの追加（非破壊的）
  newPaths.forEach((path) => {
    if (!oldPaths.includes(path)) {
      nonBreakingChanges.push({
        type: 'endpoint_added',
        path,
        message: `新エンドポイント追加: ${path}`,
      });
    }
  });

  return { breakingChanges, nonBreakingChanges, deprecations };
}

function generateReport(oldVersion, newVersion, changes) {
  const { breakingChanges, nonBreakingChanges, deprecations } = changes;

  console.log(`${colors.magenta}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║       API 破壊的変更検出レポート              ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.blue}📊 サマリー${colors.reset}`);
  console.log(`   旧バージョン: ${oldVersion}`);
  console.log(`   新バージョン: ${newVersion}`);
  console.log(`   破壊的変更: ${breakingChanges.length} 件`);
  console.log(`   非破壊的変更: ${nonBreakingChanges.length} 件`);
  console.log(`   非推奨化: ${deprecations.length} 件\n`);

  // 破壊的変更
  if (breakingChanges.length > 0) {
    console.log(`${colors.red}🚨 破壊的変更（BREAKING CHANGES）${colors.reset}\n`);

    breakingChanges.forEach((change, index) => {
      const icon = change.severity === 'critical' ? '🔴' : '🟡';
      log(colors.red, `${icon}`, change.message);
    });

    console.log();
  }

  // 非推奨化
  if (deprecations.length > 0) {
    console.log(`${colors.yellow}⚠️  非推奨化（DEPRECATIONS）${colors.reset}\n`);

    deprecations.forEach((change) => {
      log(colors.yellow, '📝', change.message);
    });

    console.log();
  }

  // 非破壊的変更
  if (nonBreakingChanges.length > 0) {
    console.log(`${colors.green}✨ 非破壊的変更（NEW FEATURES）${colors.reset}\n`);

    nonBreakingChanges.forEach((change) => {
      log(colors.green, '➕', change.message);
    });

    console.log();
  }

  // 推奨アクション
  console.log(`${colors.blue}📋 推奨アクション${colors.reset}\n`);

  if (breakingChanges.length > 0) {
    log(colors.red, '1.', 'メジャーバージョンアップが必要です（例: v1 → v2）');
    log(colors.red, '2.', '移行ガイドを作成してください');
    log(colors.red, '3.', '最低4週間の移行期間を設定してください');
    log(colors.red, '4.', 'Sunset ヘッダーを旧バージョンに追加してください');
  } else if (deprecations.length > 0) {
    log(colors.yellow, '1.', '非推奨化アナウンスを公開してください');
    log(colors.yellow, '2.', 'Deprecation ヘッダーを追加してください');
  } else if (nonBreakingChanges.length > 0) {
    log(colors.green, '1.', 'マイナーバージョンアップで問題ありません（例: v1.1 → v1.2）');
    log(colors.green, '2.', 'CHANGELOG を更新してください');
  } else {
    log(colors.green, '✅', '変更は検出されませんでした');
  }

  console.log();

  // 終了コード
  return breakingChanges.length > 0 ? 1 : 0;
}

// メイン実行
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('使用方法: check-breaking-changes.js <旧仕様.yaml> <新仕様.yaml>');
  console.log('例: check-breaking-changes.js openapi-v1.yaml openapi-v2.yaml');
  process.exit(1);
}

const [oldSpecPath, newSpecPath] = args;

const oldSpec = loadOpenAPISpec(oldSpecPath);
const newSpec = loadOpenAPISpec(newSpecPath);

const oldVersion = oldSpec.info?.version || 'unknown';
const newVersion = newSpec.info?.version || 'unknown';

const changes = compareSpecs(oldSpec, newSpec);
const exitCode = generateReport(oldVersion, newVersion, changes);

process.exit(exitCode);
