#!/usr/bin/env node

/**
 * API Connection Tester
 *
 * 外部APIへの接続テストを実行します。
 *
 * 使用方法:
 *   node test-api-connection.mjs <base-url> [options]
 *   node test-api-connection.mjs https://api.github.com --header "Authorization: token xxx"
 *
 * オプション:
 *   --header, -H  追加ヘッダー（複数指定可）
 *   --timeout, -t タイムアウト（ミリ秒）
 *   --method, -m  HTTPメソッド
 *   --verbose, -v 詳細出力
 */

import { parseArgs } from 'util';

const { values, positionals } = parseArgs({
  options: {
    header: {
      type: 'string',
      short: 'H',
      multiple: true,
      default: []
    },
    timeout: {
      type: 'string',
      short: 't',
      default: '10000'
    },
    method: {
      type: 'string',
      short: 'm',
      default: 'GET'
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      default: false
    }
  },
  allowPositionals: true
});

const url = positionals[0];

if (!url) {
  console.log('使用方法: node test-api-connection.mjs <url> [options]');
  console.log('');
  console.log('オプション:');
  console.log('  -H, --header   追加ヘッダー（複数指定可）');
  console.log('  -t, --timeout  タイムアウト（ミリ秒、デフォルト: 10000）');
  console.log('  -m, --method   HTTPメソッド（デフォルト: GET）');
  console.log('  -v, --verbose  詳細出力');
  console.log('');
  console.log('例:');
  console.log('  node test-api-connection.mjs https://api.github.com');
  console.log('  node test-api-connection.mjs https://api.example.com -H "Authorization: Bearer xxx"');
  process.exit(1);
}

/**
 * ヘッダー文字列をパース
 */
function parseHeaders(headerStrings) {
  const headers = {};
  for (const header of headerStrings) {
    const colonIndex = header.indexOf(':');
    if (colonIndex === -1) {
      console.warn(`無効なヘッダー形式: ${header}`);
      continue;
    }
    const name = header.substring(0, colonIndex).trim();
    const value = header.substring(colonIndex + 1).trim();
    headers[name] = value;
  }
  return headers;
}

/**
 * 接続テストを実行
 */
async function testConnection(url, options) {
  const { method, headers, timeout, verbose } = options;

  console.log(`\n🔍 接続テスト: ${url}`);
  console.log(`   メソッド: ${method}`);
  console.log(`   タイムアウト: ${timeout}ms`);

  if (verbose && Object.keys(headers).length > 0) {
    console.log('   ヘッダー:');
    for (const [key, value] of Object.entries(headers)) {
      // センシティブな値をマスク
      const maskedValue = key.toLowerCase().includes('authorization')
        ? value.substring(0, 10) + '...'
        : value;
      console.log(`     ${key}: ${maskedValue}`);
    }
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), parseInt(timeout));

    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'API-Connection-Tester/1.0',
        ...headers
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n📊 結果:');
    console.log(`   ステータス: ${response.status} ${response.statusText}`);
    console.log(`   レスポンス時間: ${duration}ms`);

    // レスポンスヘッダー
    if (verbose) {
      console.log('\n   レスポンスヘッダー:');
      response.headers.forEach((value, key) => {
        console.log(`     ${key}: ${value}`);
      });
    }

    // Rate Limit情報
    const rateLimitHeaders = [
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'retry-after'
    ];

    const rateLimitInfo = {};
    for (const header of rateLimitHeaders) {
      const value = response.headers.get(header);
      if (value) {
        rateLimitInfo[header] = value;
      }
    }

    if (Object.keys(rateLimitInfo).length > 0) {
      console.log('\n   Rate Limit情報:');
      for (const [key, value] of Object.entries(rateLimitInfo)) {
        console.log(`     ${key}: ${value}`);
      }
    }

    // レスポンスボディ（一部）
    if (verbose) {
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const body = await response.json();
          console.log('\n   レスポンスボディ (JSON):');
          console.log('     ' + JSON.stringify(body, null, 2).replace(/\n/g, '\n     ').substring(0, 500));
          if (JSON.stringify(body).length > 500) {
            console.log('     ... (truncated)');
          }
        } else {
          const text = await response.text();
          console.log('\n   レスポンスボディ:');
          console.log('     ' + text.substring(0, 200));
          if (text.length > 200) {
            console.log('     ... (truncated)');
          }
        }
      } catch (e) {
        // ボディ読み取りエラーは無視
      }
    }

    // 判定
    if (response.ok) {
      console.log('\n✅ 接続成功');
      return true;
    } else {
      console.log(`\n⚠️  HTTPエラー: ${response.status}`);
      return false;
    }
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n❌ 接続失敗');
    console.log(`   エラー: ${error.message}`);
    console.log(`   経過時間: ${duration}ms`);

    if (error.name === 'AbortError') {
      console.log('   原因: タイムアウト');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   原因: 接続拒否（サーバーが起動していないか、URLが間違っています）');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   原因: ホスト名を解決できません');
    }

    return false;
  }
}

/**
 * メイン処理
 */
async function main() {
  const headers = parseHeaders(values.header);

  const success = await testConnection(url, {
    method: values.method,
    headers,
    timeout: values.timeout,
    verbose: values.verbose
  });

  process.exit(success ? 0 : 1);
}

main();
