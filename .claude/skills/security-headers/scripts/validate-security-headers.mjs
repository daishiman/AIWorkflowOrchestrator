#!/usr/bin/env node
/**
 * セキュリティヘッダー検証スクリプト
 */

import fs from 'fs';
import path from 'path';

const REQUIRED_HEADERS = [
  'Content-Security-Policy',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Strict-Transport-Security',
];

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: node validate-security-headers.mjs <next.config.js>');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), args[0]);
  const content = fs.readFileSync(filePath, 'utf-8');

  console.log('🔍 Validating Security Headers...\n');

  const results = validateSecurityHeaders(content);
  printResults(results);

  if (results.errors.length > 0) {
    process.exit(1);
  }

  console.log('\n✅ Security headers are valid!');
}

function validateSecurityHeaders(content) {
  const errors = [];
  const warnings = [];

  for (const header of REQUIRED_HEADERS) {
    if (!content.includes(header)) {
      errors.push(`Missing required header: ${header}`);
    }
  }

  // CSP検証
  if (content.includes("'unsafe-inline'") || content.includes("'unsafe-eval'")) {
    warnings.push("CSP contains 'unsafe-inline' or 'unsafe-eval' - consider removing for better security");
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
