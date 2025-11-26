#!/usr/bin/env node

/**
 * OAuth 2.0設定検証スクリプト
 *
 * 使用方法:
 *   node validate-oauth-config.mjs <config-file>
 *
 * 検証項目:
 *   - 必須パラメータの存在
 *   - URLフォーマットの妥当性
 *   - Client ID/Secretの形式
 *   - Redirect URIのセキュリティ
 *   - Scopeの妥当性
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// バリデーションルール
// ========================================

const VALIDATION_RULES = {
  requiredFields: [
    'authorizeUrl',
    'tokenUrl',
    'clientId',
    'redirectUri',
    'scope',
  ],
  urlPattern: /^https?:\/\/.+/,
  clientIdMinLength: 10,
  clientSecretMinLength: 16,
  stateMinLength: 32,
  codeVerifierMinLength: 43,
  codeVerifierMaxLength: 128,
};

// ========================================
// メイン処理
// ========================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: node validate-oauth-config.mjs <config-file>');
    console.error('');
    console.error('Example:');
    console.error('  node validate-oauth-config.mjs oauth-config.json');
    process.exit(1);
  }

  const configPath = path.resolve(process.cwd(), args[0]);

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    process.exit(1);
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    console.log('🔍 Validating OAuth 2.0 Configuration...\n');

    const results = validateOAuthConfig(config);

    printValidationResults(results);

    if (results.errors.length > 0) {
      process.exit(1);
    }

    console.log('\n✅ OAuth 2.0 configuration is valid!');
  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// ========================================
// バリデーション関数
// ========================================

function validateOAuthConfig(config) {
  const errors = [];
  const warnings = [];
  const info = [];

  // 必須フィールドチェック
  for (const field of VALIDATION_RULES.requiredFields) {
    if (!config[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // authorizeUrl検証
  if (config.authorizeUrl) {
    if (!VALIDATION_RULES.urlPattern.test(config.authorizeUrl)) {
      errors.push('authorizeUrl must be a valid URL');
    }
    if (!config.authorizeUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
      errors.push('authorizeUrl must use HTTPS in production');
    }
  }

  // tokenUrl検証
  if (config.tokenUrl) {
    if (!VALIDATION_RULES.urlPattern.test(config.tokenUrl)) {
      errors.push('tokenUrl must be a valid URL');
    }
    if (!config.tokenUrl.startsWith('https://')) {
      errors.push('tokenUrl must use HTTPS');
    }
  }

  // clientId検証
  if (config.clientId) {
    if (config.clientId.length < VALIDATION_RULES.clientIdMinLength) {
      warnings.push(`clientId seems too short (< ${VALIDATION_RULES.clientIdMinLength} chars)`);
    }
  }

  // clientSecret検証（存在する場合）
  if (config.clientSecret) {
    if (config.clientSecret.length < VALIDATION_RULES.clientSecretMinLength) {
      warnings.push(`clientSecret seems too short (< ${VALIDATION_RULES.clientSecretMinLength} chars)`);
    }
    warnings.push('clientSecret should be stored in environment variables, not in config files');
  }

  // redirectUri検証
  if (config.redirectUri) {
    if (!VALIDATION_RULES.urlPattern.test(config.redirectUri)) {
      errors.push('redirectUri must be a valid URL');
    }
    if (!config.redirectUri.startsWith('https://') &&
        !config.redirectUri.startsWith('http://localhost') &&
        process.env.NODE_ENV === 'production') {
      errors.push('redirectUri must use HTTPS in production (except localhost)');
    }
    if (config.redirectUri.includes('*')) {
      errors.push('redirectUri must not contain wildcards');
    }
  }

  // scope検証
  if (config.scope) {
    const scopes = config.scope.split(' ');
    if (scopes.length === 0) {
      errors.push('scope must contain at least one scope');
    }
    if (scopes.length > 10) {
      warnings.push('scope contains many scopes - consider minimal privilege principle');
    }
  }

  // PKCEパラメータ検証（存在する場合）
  if (config.usePKCE) {
    info.push('PKCE enabled - recommended for SPAs and mobile apps');

    if (config.codeChallengeMethod && config.codeChallengeMethod !== 'S256') {
      warnings.push('codeChallengeMethod should be S256, not plain');
    }
  }

  // State parameter検証（存在する場合）
  if (config.state) {
    if (config.state.length < VALIDATION_RULES.stateMinLength) {
      warnings.push(`state should be at least ${VALIDATION_RULES.stateMinLength} characters for security`);
    }
  } else {
    warnings.push('state parameter is recommended for CSRF protection');
  }

  return { errors, warnings, info };
}

// ========================================
// 結果表示
// ========================================

function printValidationResults(results) {
  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    results.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err}`);
    });
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach((warn, idx) => {
      console.log(`  ${idx + 1}. ${warn}`);
    });
    console.log('');
  }

  if (results.info.length > 0) {
    console.log('ℹ️  Info:');
    results.info.forEach((info, idx) => {
      console.log(`  ${idx + 1}. ${info}`);
    });
    console.log('');
  }
}

// ========================================
// 実行
// ========================================

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
