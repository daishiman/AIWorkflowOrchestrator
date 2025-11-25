/**
 * スモークテストテンプレート
 *
 * デプロイ後の基本動作確認テスト
 * 主要エンドポイントの疎通確認を行う
 *
 * 使用方法:
 *   npx tsx smoke-test-template.ts https://your-app.railway.app
 *   npx tsx smoke-test-template.ts http://localhost:3000
 */

interface TestResult {
  name: string;
  endpoint: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
}

interface SmokeTestConfig {
  baseUrl: string;
  timeout: number;
  tests: TestCase[];
}

interface TestCase {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expectedStatus: number;
  expectedBody?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  skip?: boolean;
}

// ===========================================
// テストケース定義（プロジェクトに合わせて編集）
// ===========================================

const testCases: TestCase[] = [
  // ヘルスチェック
  {
    name: 'Health Check',
    endpoint: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    expectedBody: { status: 'healthy' },
  },

  // 認証エンドポイント
  {
    name: 'Auth Status',
    endpoint: '/api/auth/session',
    method: 'GET',
    expectedStatus: 200,
  },

  // 主要APIエンドポイント
  {
    name: 'API Root',
    endpoint: '/api',
    method: 'GET',
    expectedStatus: 200,
  },

  // 静的アセット
  {
    name: 'Static Assets',
    endpoint: '/favicon.ico',
    method: 'GET',
    expectedStatus: 200,
  },

  // 例: 認証が必要なエンドポイント（スキップ可能）
  {
    name: 'Protected Endpoint',
    endpoint: '/api/user/profile',
    method: 'GET',
    expectedStatus: 401, // 認証なしで401を期待
    skip: false,
  },
];

// ===========================================
// テストランナー
// ===========================================

async function runTest(
  baseUrl: string,
  testCase: TestCase,
  timeout: number
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${baseUrl}${testCase.endpoint}`;

  if (testCase.skip) {
    return {
      name: testCase.name,
      endpoint: testCase.endpoint,
      status: 'skip',
      duration: 0,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
        ...testCase.headers,
      },
      body: testCase.body ? JSON.stringify(testCase.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;

    // ステータスコードチェック
    if (response.status !== testCase.expectedStatus) {
      return {
        name: testCase.name,
        endpoint: testCase.endpoint,
        status: 'fail',
        duration,
        error: `Expected status ${testCase.expectedStatus}, got ${response.status}`,
      };
    }

    // レスポンスボディチェック（指定された場合）
    if (testCase.expectedBody) {
      const body = await response.json();
      for (const [key, value] of Object.entries(testCase.expectedBody)) {
        if (body[key] !== value) {
          return {
            name: testCase.name,
            endpoint: testCase.endpoint,
            status: 'fail',
            duration,
            error: `Expected body.${key} = ${value}, got ${body[key]}`,
          };
        }
      }
    }

    return {
      name: testCase.name,
      endpoint: testCase.endpoint,
      status: 'pass',
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      name: testCase.name,
      endpoint: testCase.endpoint,
      status: 'fail',
      duration,
      error: errorMessage,
    };
  }
}

async function runSmokeTests(config: SmokeTestConfig): Promise<TestResult[]> {
  const results: TestResult[] = [];

  console.log(`\n🔥 Smoke Tests - ${config.baseUrl}\n`);
  console.log('─'.repeat(60));

  for (const testCase of config.tests) {
    const result = await runTest(config.baseUrl, testCase, config.timeout);
    results.push(result);

    const icon =
      result.status === 'pass'
        ? '✅'
        : result.status === 'skip'
          ? '⏭️'
          : '❌';
    const duration =
      result.status !== 'skip' ? ` (${result.duration}ms)` : '';

    console.log(`${icon} ${result.name}${duration}`);
    if (result.error) {
      console.log(`   └─ ${result.error}`);
    }
  }

  return results;
}

function printSummary(results: TestResult[]): boolean {
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;
  const total = results.length;

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Summary\n');
  console.log(`   Total:   ${total}`);
  console.log(`   Passed:  ${passed} ✅`);
  console.log(`   Failed:  ${failed} ❌`);
  console.log(`   Skipped: ${skipped} ⏭️`);
  console.log(`   Duration: ${totalDuration}ms`);

  if (failed === 0) {
    console.log('\n🎉 All smoke tests passed!\n');
    return true;
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed!\n`);
    return false;
  }
}

// ===========================================
// メイン実行
// ===========================================

async function main() {
  const baseUrl = process.argv[2];

  if (!baseUrl) {
    console.error('Usage: npx tsx smoke-test-template.ts <base-url>');
    console.error('Example: npx tsx smoke-test-template.ts https://app.railway.app');
    process.exit(1);
  }

  // URLの正規化
  const normalizedUrl = baseUrl.replace(/\/$/, '');

  const config: SmokeTestConfig = {
    baseUrl: normalizedUrl,
    timeout: 10000, // 10秒タイムアウト
    tests: testCases,
  };

  try {
    const results = await runSmokeTests(config);
    const allPassed = printSummary(results);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
