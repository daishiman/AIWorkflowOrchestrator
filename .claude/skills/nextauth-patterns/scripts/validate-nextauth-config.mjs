#!/usr/bin/env node
/**
 * NextAuth.js設定検証スクリプト
 */

import fs from 'fs';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: node validate-nextauth-config.mjs <auth-file>');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), args[0]);
  const content = fs.readFileSync(filePath, 'utf-8');

  console.log('🔍 Validating NextAuth.js Configuration...\n');

  const results = validateNextAuthConfig(content);
  printResults(results);

  if (results.errors.length > 0) {
    process.exit(1);
  }

  console.log('\n✅ NextAuth.js configuration is valid!');
}

function validateNextAuthConfig(content) {
  const errors = [];
  const warnings = [];

  // プロバイダーチェック
  if (!content.includes('providers:')) {
    errors.push('No providers defined');
  }

  // セッション戦略チェック
  if (!content.includes('strategy:')) {
    warnings.push('Session strategy not explicitly set');
  }

  // コールバックチェック
  if (!content.includes('callbacks:')) {
    warnings.push('No callbacks defined - consider adding jwt/session callbacks for role management');
  }

  // 環境変数チェック
  const envVars = content.match(/process\.env\.([A-Z_]+)/g) || [];
  if (envVars.length === 0) {
    warnings.push('No environment variables detected - ensure secrets are not hardcoded');
  }

  return { errors, warnings };
}

function printResults(results) {
  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    results.errors.forEach((err, idx) => console.log(`  ${idx + 1}. ${err}`));
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach((warn, idx) => console.log(`  ${idx + 1}. ${warn}`));
  }
}

main();
