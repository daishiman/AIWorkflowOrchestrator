#!/usr/bin/env node

/**
 * URI Validator
 *
 * MCPリソースURIの検証を行います。
 *
 * 使用方法:
 *   node validate-uri.mjs <uri>
 *   node validate-uri.mjs "file:///path/to/file.txt"
 *   node validate-uri.mjs "db://postgres/users/123"
 */

const uri = process.argv[2];

if (!uri) {
  console.log('使用方法: node validate-uri.mjs <uri>');
  console.log('');
  console.log('例:');
  console.log('  node validate-uri.mjs "file:///home/user/doc.txt"');
  console.log('  node validate-uri.mjs "db://postgres/mydb/users"');
  console.log('  node validate-uri.mjs "git://origin/main/README.md"');
  process.exit(1);
}

/**
 * サポートされているスキーム
 */
const SUPPORTED_SCHEMES = ['file', 'db', 'git', 'memory', 'http', 'https', 'custom'];

/**
 * スキーム別バリデーションルール
 */
const schemeRules = {
  file: {
    requiresPath: true,
    pathPattern: /^\/.*$/,
    description: 'ローカルファイルシステム'
  },
  db: {
    requiresPath: true,
    pathPattern: /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)?$/,
    description: 'データベースリソース',
    pathFormat: '/database/table[/id]'
  },
  git: {
    requiresPath: true,
    pathPattern: /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/.+$/,
    description: 'Gitリポジトリ',
    pathFormat: '/remote/branch/path'
  },
  memory: {
    requiresPath: true,
    pathPattern: /^\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/,
    description: 'メモリ/セッションデータ',
    pathFormat: '/scope/key'
  },
  http: {
    requiresHost: true,
    description: 'HTTP API'
  },
  https: {
    requiresHost: true,
    description: 'HTTPS API'
  },
  custom: {
    requiresPath: true,
    description: 'カスタムプロバイダー'
  }
};

/**
 * URIを検証
 */
function validateUri(uri) {
  const errors = [];
  const warnings = [];
  const info = {};

  // 1. 基本的なURL解析
  let parsed;
  try {
    parsed = new URL(uri);
  } catch (error) {
    errors.push(`無効なURI形式: ${error.message}`);
    return { valid: false, errors, warnings, info };
  }

  // 2. スキーム検証
  const scheme = parsed.protocol.replace(':', '');
  info.scheme = scheme;

  if (!SUPPORTED_SCHEMES.includes(scheme)) {
    warnings.push(`未知のスキーム: ${scheme}（サポート: ${SUPPORTED_SCHEMES.join(', ')}）`);
  }

  const rules = schemeRules[scheme];
  if (rules) {
    info.schemeDescription = rules.description;
  }

  // 3. パス検証
  info.path = parsed.pathname;

  if (rules?.requiresPath && !parsed.pathname) {
    errors.push('パスが必要です');
  }

  if (rules?.pathPattern && !rules.pathPattern.test(parsed.pathname)) {
    warnings.push(`パス形式が推奨フォーマットと異なります`);
    if (rules.pathFormat) {
      info.recommendedFormat = rules.pathFormat;
    }
  }

  // 4. ホスト検証
  if (rules?.requiresHost && !parsed.host) {
    errors.push('ホスト名が必要です');
  }
  if (parsed.host) {
    info.host = parsed.host;
  }

  // 5. セキュリティチェック
  const securityWarnings = checkSecurityIssues(parsed);
  warnings.push(...securityWarnings);

  // 6. 正規化チェック
  const normalized = normalizeUri(parsed);
  if (normalized !== uri) {
    info.normalizedUri = normalized;
    warnings.push('URIは正規化されていません');
  }

  // 7. クエリパラメータ
  if (parsed.search) {
    info.queryParams = Object.fromEntries(parsed.searchParams);
  }

  // 8. フラグメント
  if (parsed.hash) {
    info.fragment = parsed.hash.substring(1);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

/**
 * セキュリティ問題をチェック
 */
function checkSecurityIssues(parsed) {
  const warnings = [];

  // パストラバーサル
  if (parsed.pathname.includes('..')) {
    warnings.push('⚠️  パストラバーサルの可能性: ".." が含まれています');
  }

  // 認証情報の露出
  if (parsed.username || parsed.password) {
    warnings.push('⚠️  URIに認証情報が含まれています');
  }

  // ローカルホスト以外のfileスキーム
  if (parsed.protocol === 'file:' && parsed.host && parsed.host !== 'localhost') {
    warnings.push('⚠️  fileスキームで外部ホストが指定されています');
  }

  // 非標準ポート
  if (parsed.port && !['80', '443', '8080'].includes(parsed.port)) {
    warnings.push(`ℹ️  非標準ポートが使用されています: ${parsed.port}`);
  }

  return warnings;
}

/**
 * URIを正規化
 */
function normalizeUri(parsed) {
  let normalized = `${parsed.protocol}//`;

  if (parsed.host) {
    normalized += parsed.host.toLowerCase();
  }

  // パス正規化
  let path = parsed.pathname
    .replace(/\/+/g, '/')      // 重複スラッシュ
    .replace(/\/\.\//g, '/')   // /./
    .replace(/\/+$/, '');       // 末尾スラッシュ

  normalized += path || '/';

  // クエリパラメータソート
  if (parsed.search) {
    const params = [...parsed.searchParams.entries()]
      .filter(([_, v]) => v !== '')
      .sort(([a], [b]) => a.localeCompare(b));

    if (params.length > 0) {
      normalized += '?' + new URLSearchParams(params).toString();
    }
  }

  if (parsed.hash) {
    normalized += parsed.hash;
  }

  return normalized;
}

/**
 * 結果を表示
 */
function displayResults(result) {
  console.log('\n🔍 URI検証結果\n');
  console.log(`URI: ${uri}`);
  console.log('─'.repeat(50));

  // 基本情報
  console.log('\n📋 基本情報:');
  console.log(`   スキーム: ${result.info.scheme}`);
  if (result.info.schemeDescription) {
    console.log(`   タイプ: ${result.info.schemeDescription}`);
  }
  if (result.info.host) {
    console.log(`   ホスト: ${result.info.host}`);
  }
  console.log(`   パス: ${result.info.path}`);
  if (result.info.queryParams) {
    console.log(`   クエリ: ${JSON.stringify(result.info.queryParams)}`);
  }
  if (result.info.fragment) {
    console.log(`   フラグメント: ${result.info.fragment}`);
  }

  // エラー
  if (result.errors.length > 0) {
    console.log('\n❌ エラー:');
    result.errors.forEach(e => console.log(`   - ${e}`));
  }

  // 警告
  if (result.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    result.warnings.forEach(w => console.log(`   - ${w}`));
  }

  // 推奨情報
  if (result.info.recommendedFormat) {
    console.log(`\n💡 推奨パス形式: ${result.info.recommendedFormat}`);
  }

  if (result.info.normalizedUri) {
    console.log(`\n📝 正規化後: ${result.info.normalizedUri}`);
  }

  // 最終判定
  console.log('\n' + '─'.repeat(50));
  if (result.valid) {
    console.log('✅ URIは有効です');
  } else {
    console.log('❌ URIは無効です');
  }
}

// メイン処理
const result = validateUri(uri);
displayResults(result);
process.exit(result.valid ? 0 : 1);
