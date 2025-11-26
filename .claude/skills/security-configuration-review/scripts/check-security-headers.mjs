#!/usr/bin/env node

/**
 * セキュリティヘッダーチェックスクリプト
 *
 * 使用方法: node check-security-headers.mjs <url>
 * 例: node check-security-headers.mjs https://example.com
 */

import https from 'https';
import http from 'http';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const requiredHeaders = {
  'strict-transport-security': {
    required: true,
    severity: 'high',
    check: (value) => value && value.includes('max-age=')
  },
  'x-frame-options': {
    required: true,
    severity: 'high',
    check: (value) => value && (value === 'DENY' || value === 'SAMEORIGIN')
  },
  'x-content-type-options': {
    required: true,
    severity: 'medium',
    check: (value) => value === 'nosniff'
  },
  'content-security-policy': {
    required: true,
    severity: 'high',
    check: (value) => value && value.length > 0
  },
  'referrer-policy': {
    required: false,
    severity: 'low',
    check: (value) => value && value.length > 0
  },
  'permissions-policy': {
    required: false,
    severity: 'low',
    check: (value) => value && value.length > 0
  }
};

function checkUrl(url) {
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    protocol.get(url, (res) => {
      resolve(res.headers);
    }).on('error', reject);
  });
}

async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error(`${colors.red}使用方法: node check-security-headers.mjs <url>${colors.reset}`);
    console.error(`例: node check-security-headers.mjs https://example.com`);
    process.exit(1);
  }

  console.log(`${colors.cyan}=== セキュリティヘッダーチェック ===${colors.reset}\n`);
  console.log(`URL: ${url}\n`);

  try {
    const headers = await checkUrl(url);

    let issueCount = 0;

    for (const [headerName, config] of Object.entries(requiredHeaders)) {
      const value = headers[headerName];
      const exists = !!value;
      const valid = exists && config.check(value);

      if (config.required && !exists) {
        console.log(`${colors.red}❌ ${headerName}${colors.reset}: 未設定 (${config.severity})`);
        issueCount++;
      } else if (exists && !valid) {
        console.log(`${colors.yellow}⚠️  ${headerName}${colors.reset}: 設定不適切`);
        console.log(`   値: ${value}`);
        issueCount++;
      } else if (exists && valid) {
        console.log(`${colors.green}✅ ${headerName}${colors.reset}`);
        console.log(`   ${value.substring(0, 80)}${value.length > 80 ? '...' : ''}`);
      } else {
        console.log(`${colors.yellow}ℹ️  ${headerName}${colors.reset}: 未設定 (optional)`);
      }
      console.log('');
    }

    console.log(`${colors.cyan}=== サマリー ===${colors.reset}\n`);
    if (issueCount === 0) {
      console.log(`${colors.green}✅ すべての重要なヘッダーが設定されています${colors.reset}\n`);
    } else {
      console.log(`${colors.red}検出された問題: ${issueCount}件${colors.reset}\n`);
    }
  } catch (error) {
    console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
