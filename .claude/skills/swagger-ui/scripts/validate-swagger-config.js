#!/usr/bin/env node
/**
 * Swagger UI 設定検証スクリプト
 *
 * 用途:
 * - Swagger UI の設定ファイルを検証
 * - 必須オプションの存在確認
 * - 推奨設定のチェック
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ANSI カラーコード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function validateSwaggerConfig(configPath) {
  console.log(`\n${colors.blue}📋 Swagger UI 設定を検証中...${colors.reset}\n`);

  // 設定ファイルの存在確認
  if (!existsSync(configPath)) {
    log(colors.red, '❌', `設定ファイルが見つかりません: ${configPath}`);
    process.exit(1);
  }

  let config;
  try {
    const content = readFileSync(configPath, 'utf-8');
    config = JSON.parse(content);
    log(colors.green, '✅', '設定ファイルの読み込みに成功');
  } catch (error) {
    log(colors.red, '❌', `JSON パースエラー: ${error.message}`);
    process.exit(1);
  }

  let errorCount = 0;
  let warningCount = 0;

  // 必須オプションのチェック
  console.log(`\n${colors.blue}📌 必須オプション${colors.reset}`);

  if (!config.url && !config.urls) {
    log(colors.red, '❌', '`url` または `urls` が設定されていません');
    errorCount++;
  } else {
    log(colors.green, '✅', 'OpenAPI 仕様ファイルの URL が設定されています');
  }

  // 推奨オプションのチェック
  console.log(`\n${colors.blue}💡 推奨オプション${colors.reset}`);

  const recommendations = [
    {
      key: 'deepLinking',
      expected: true,
      message: 'URL ハッシュでの操作リンク有効化',
    },
    {
      key: 'docExpansion',
      expected: 'list',
      message: '初期展開状態の設定',
    },
    {
      key: 'filter',
      expected: true,
      message: 'フィルター機能の有効化（大規模 API 向け）',
    },
    {
      key: 'persistAuthorization',
      expected: false,
      message: '認証情報の永続化（本番環境では無効推奨）',
      production: false,
    },
  ];

  recommendations.forEach(({ key, expected, message, production }) => {
    if (config[key] === undefined) {
      log(colors.yellow, '⚠️ ', `${key}: 未設定（推奨: ${expected}） - ${message}`);
      warningCount++;
    } else if (production === false && config[key] === true) {
      log(colors.yellow, '⚠️ ', `${key}: 本番環境では無効化を推奨`);
      warningCount++;
    } else {
      log(colors.green, '✅', `${key}: ${config[key]}`);
    }
  });

  // セキュリティチェック
  console.log(`\n${colors.blue}🛡️  セキュリティ${colors.reset}`);

  if (config.supportedSubmitMethods && config.supportedSubmitMethods.length > 0) {
    log(
      colors.yellow,
      '⚠️ ',
      `Try it out が有効です。本番環境では無効化を検討してください`
    );
    warningCount++;
  } else {
    log(colors.green, '✅', 'Try it out が無効化されています');
  }

  if (config.requestInterceptor) {
    log(
      colors.yellow,
      '⚠️ ',
      'requestInterceptor が設定されています。認証情報がハードコードされていないか確認してください'
    );
    warningCount++;
  }

  // パフォーマンスチェック
  console.log(`\n${colors.blue}⚡ パフォーマンス${colors.reset}`);

  if (config.defaultModelsExpandDepth > 3) {
    log(colors.yellow, '⚠️ ', `defaultModelsExpandDepth が大きすぎます（現在: ${config.defaultModelsExpandDepth}、推奨: 1-3）`);
    warningCount++;
  } else {
    log(colors.green, '✅', `モデル展開深度: ${config.defaultModelsExpandDepth || 1}`);
  }

  // 結果サマリー
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  if (errorCount === 0 && warningCount === 0) {
    log(colors.green, '✨', '設定は完璧です！');
  } else {
    if (errorCount > 0) {
      log(colors.red, '❌', `エラー: ${errorCount} 件`);
    }
    if (warningCount > 0) {
      log(colors.yellow, '⚠️ ', `警告: ${warningCount} 件`);
    }
  }

  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  return errorCount === 0;
}

// スクリプト実行
const configPath = process.argv[2] || '.claude/skills/swagger-ui/templates/swagger-config.json';

if (!validateSwaggerConfig(configPath)) {
  process.exit(1);
}
