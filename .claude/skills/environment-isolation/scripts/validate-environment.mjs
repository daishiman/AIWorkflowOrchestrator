#!/usr/bin/env node
/**
 * Environment Validation Script
 * 環境変数と環境分離の検証を行います
 */

import readline from 'readline';

const CURRENT_ENV = process.env.NODE_ENV || 'development';

console.log('🔍 Environment Validation');
console.log('========================\n');
console.log(`Current environment: ${CURRENT_ENV}\n`);

// 必須環境変数の定義
const REQUIRED_VARS = {
  development: ['DATABASE_URL', 'LOG_LEVEL'],
  staging: ['DATABASE_URL', 'API_BASE_URL', 'LOG_LEVEL', 'NEXTAUTH_SECRET'],
  production: ['DATABASE_URL', 'OPENAI_API_KEY', 'NEXTAUTH_SECRET', 'DISCORD_WEBHOOK_URL'],
};

// 開発パターン（本番環境で検出すべきでない）
const DEV_PATTERNS = ['dev', 'test', 'local', 'example', 'mock', 'localhost'];

// 本番パターン（開発環境で検出すべきでない）
const PROD_PATTERNS = ['prod', 'production', 'live'];

function validateRequiredVariables() {
  console.log('📋 Checking required environment variables...\n');

  const required = REQUIRED_VARS[CURRENT_ENV] || [];
  const missing = [];

  for (const varName of required) {
    if (process.env[varName]) {
      console.log(`  ✅ ${varName} - Present`);
    } else {
      console.log(`  ❌ ${varName} - Missing`);
      missing.push(varName);
    }
  }

  console.log('');

  if (missing.length > 0) {
    console.error('❌ VALIDATION FAILED: Missing required variables');
    console.error('Missing variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }
}

function validateEnvironmentMixing() {
  console.log('🔍 Checking for environment mixing...\n');

  const warnings = [];

  if (CURRENT_ENV === 'production') {
    // 本番環境で開発用パターンをチェック
    for (const [key, value] of Object.entries(process.env)) {
      if (value && DEV_PATTERNS.some(pattern => value.toLowerCase().includes(pattern))) {
        warnings.push(`Production env contains dev pattern in ${key}`);
        console.log(`  ⚠️  ${key} contains development pattern`);
      }
    }
  } else if (CURRENT_ENV === 'development') {
    // 開発環境で本番用パターンをチェック
    for (const [key] of Object.entries(process.env)) {
      if (key.includes('PROD') || PROD_PATTERNS.some(p => key.toLowerCase().includes(p))) {
        warnings.push(`Development env might contain prod secret: ${key}`);
        console.log(`  ⚠️  ${key} looks like production secret`);
      }
    }
  }

  if (warnings.length === 0) {
    console.log('  ✅ No environment mixing detected');
  }

  console.log('');
  return warnings;
}

function validateSecretFormats() {
  console.log('🔐 Validating secret formats...\n');

  // NEXTAUTH_SECRET検証
  if (CURRENT_ENV !== 'development' && process.env.NEXTAUTH_SECRET) {
    const secretLength = process.env.NEXTAUTH_SECRET.length;

    if (secretLength < 32) {
      console.log(`  ❌ NEXTAUTH_SECRET too short (${secretLength} chars, minimum 32)`);
      process.exit(1);
    } else {
      console.log(`  ✅ NEXTAUTH_SECRET length OK (${secretLength} chars)`);
    }
  }

  // DATABASE_URL検証
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.includes('postgresql://')) {
      console.log('  ✅ DATABASE_URL format valid (PostgreSQL)');
    } else {
      console.log('  ⚠️  DATABASE_URL format unusual');
    }
  }

  // API Key検証（本番のみ）
  if (CURRENT_ENV === 'production' && process.env.OPENAI_API_KEY) {
    if (process.env.OPENAI_API_KEY.startsWith('sk-proj-')) {
      console.log('  ✅ OPENAI_API_KEY format valid');
    } else {
      console.log('  ⚠️  OPENAI_API_KEY format unusual');
    }
  }

  console.log('');
}

function validateSecuritySettings() {
  console.log('🛡️  Validating security settings...\n');

  if (CURRENT_ENV === 'production') {
    // NODE_ENV確認
    if (process.env.NODE_ENV !== 'production') {
      console.log(`  ❌ NODE_ENV must be 'production' (current: ${process.env.NODE_ENV})`);
      process.exit(1);
    } else {
      console.log('  ✅ NODE_ENV correctly set to production');
    }

    // LOG_LEVEL確認
    if (process.env.LOG_LEVEL === 'debug') {
      console.log('  ⚠️  LOG_LEVEL is \'debug\' in production (should be \'info\' or \'warn\')');
    }
  } else {
    console.log('  ✅ Non-production environment - security checks relaxed');
  }

  console.log('');
}

function checkRailwayEnvironment() {
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log('🚂 Railway-specific checks...\n');
    console.log(`  Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);

    if (process.env.RAILWAY_ENVIRONMENT !== CURRENT_ENV) {
      console.log(`  ⚠️  Railway environment (${process.env.RAILWAY_ENVIRONMENT}) differs from NODE_ENV (${CURRENT_ENV})`);
    } else {
      console.log('  ✅ Railway environment matches NODE_ENV');
    }

    console.log('');
  }
}

function main() {
  try {
    validateRequiredVariables();
    const warnings = validateEnvironmentMixing();
    validateSecretFormats();
    validateSecuritySettings();
    checkRailwayEnvironment();

    // 結果サマリー
    console.log('═══════════════════════════════════════');
    console.log('✅ Environment Validation Complete');
    console.log('═══════════════════════════════════════\n');
    console.log(`Environment: ${CURRENT_ENV}`);
    console.log(`Warnings: ${warnings.length}\n`);

    if (warnings.length > 0) {
      console.log('⚠️  Warnings detected (review recommended):');
      warnings.forEach(w => console.log(`  - ${w}`));
      console.log('');
    } else {
      console.log('🎉 All checks passed!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
