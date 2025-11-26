# MSW（Mock Service Worker）統合ガイド

MSW（Mock Service Worker）は、ネットワークレベルでAPIリクエストをインターセプトし、モックレスポンスを返すライブラリです。
このガイドでは、Playwright E2EテストでMSWを統合する方法を解説します。

---

## 目次

1. [MSWとは](#mswとは)
2. [セットアップ](#セットアップ)
3. [基本的な使用方法](#基本的な使用方法)
4. [Playwrightとの統合](#playwrightとの統合)
5. [高度なパターン](#高度なパターン)

---

## MSWとは

### 特徴

- **ネットワークレベルのモック**: Service Workerを使用してネットワークリクエストをインターセプト
- **ブラウザとNode.js両対応**: E2Eテストとユニットテストで同じモック定義を使用可能
- **型安全**: TypeScriptで型付きハンドラーを定義可能
- **透過的**: アプリケーションコードの変更不要

### PlaywrightでMSWを使用する理由

✅ **外部API依存の排除**: 実際の外部APIを呼び出さない
✅ **テストの安定性**: ネットワーク障害やレート制限を回避
✅ **高速化**: ネットワーク遅延がない
✅ **エラーシナリオのテスト**: 500エラー、タイムアウトなどを簡単にシミュレート

---

## セットアップ

### インストール

```bash
pnpm add -D msw
```

### MSW初期化

```bash
# Service Workerファイルを生成（public/ディレクトリに配置）
pnpm msw init public/ --save
```

これにより、`public/mockServiceWorker.js`が生成されます。

---

## 基本的な使用方法

### 1. ハンドラーの定義

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GETリクエストのモック
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
    ]);
  }),

  // POSTリクエストのモック
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json(
      {
        id: '3',
        ...newUser,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // パスパラメータを含むリクエスト
  http.get('/api/users/:userId', ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      id: userId,
      name: 'Mock User',
      email: `user${userId}@example.com`,
    });
  }),

  // エラーレスポンス
  http.delete('/api/users/:userId', () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),
];
```

---

### 2. Node.js環境でのセットアップ

Playwright E2Eテストでは、Node.js環境でMSWを使用します。

```typescript
// tests/setup/msw-server.ts
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

// MSWサーバーをセットアップ
export const server = setupServer(...handlers);

// テスト開始前にサーバーを起動
export function startMockServer() {
  server.listen({
    onUnhandledRequest: 'warn', // モックされていないリクエストを警告
  });
}

// テスト終了後にサーバーを停止
export function stopMockServer() {
  server.close();
}

// 各テスト後にハンドラーをリセット
export function resetMockServer() {
  server.resetHandlers();
}
```

---

## Playwrightとの統合

### パターン1: グローバルセットアップ

すべてのテストでMSWを有効化する場合。

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

```typescript
// tests/setup/global-setup.ts
import { startMockServer } from './msw-server';

export default async function globalSetup() {
  // MSWサーバーを起動
  startMockServer();

  console.log('MSW server started');
}
```

```typescript
// tests/setup/global-teardown.ts
import { stopMockServer } from './msw-server';

export default async function globalTeardown() {
  // MSWサーバーを停止
  stopMockServer();

  console.log('MSW server stopped');
}
```

---

### パターン2: Fixtureベースのセットアップ

特定のテストでのみMSWを使用する場合。

```typescript
// tests/fixtures/msw-fixtures.ts
import { test as base } from '@playwright/test';
import { server, resetMockServer } from '../setup/msw-server';

type MswFixtures = {
  mockServer: typeof server;
};

export const test = base.extend<MswFixtures>({
  mockServer: async ({}, use, testInfo) => {
    // テスト前: ハンドラーをリセット
    resetMockServer();

    // テストにserverを提供
    await use(server);

    // テスト後: ハンドラーをリセット
    resetMockServer();
  },
});

export { expect } from '@playwright/test';
```

### 使用例

```typescript
// tests/api-mocked.spec.ts
import { test, expect } from './fixtures/msw-fixtures';
import { http, HttpResponse } from 'msw';

test.describe('APIモックテスト', () => {
  test('ユーザー一覧の取得', async ({ page, mockServer }) => {
    await page.goto('/users');

    // モックレスポンスが表示されることを確認
    await expect(page.locator('text=Alice')).toBeVisible();
    await expect(page.locator('text=Bob')).toBeVisible();
  });

  test('カスタムハンドラーでオーバーライド', async ({ page, mockServer }) => {
    // このテストのみ異なるレスポンスを返す
    mockServer.use(
      http.get('/api/users', () => {
        return HttpResponse.json([
          { id: '99', name: 'Custom User', email: 'custom@example.com' },
        ]);
      })
    );

    await page.goto('/users');

    await expect(page.locator('text=Custom User')).toBeVisible();
  });
});
```

---

## 高度なパターン

### 1. 条件付きモック

リクエストの内容に応じてレスポンスを変更。

```typescript
// tests/mocks/conditional-handlers.ts
import { http, HttpResponse } from 'msw';

export const conditionalHandlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');

    if (role === 'admin') {
      return HttpResponse.json([
        { id: '1', name: 'Admin User', role: 'admin' },
      ]);
    }

    return HttpResponse.json([
      { id: '2', name: 'Regular User', role: 'user' },
    ]);
  }),

  http.post('/api/login', async ({ request }) => {
    const { email, password } = await request.json();

    // 特定の認証情報でのみ成功
    if (email === 'admin@test.com' && password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: { id: '1', email },
      });
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
```

---

### 2. ネットワーク遅延のシミュレーション

```typescript
// tests/mocks/delayed-handlers.ts
import { http, HttpResponse, delay } from 'msw';

export const delayedHandlers = [
  http.get('/api/slow-endpoint', async () => {
    // 2秒の遅延をシミュレート
    await delay(2000);

    return HttpResponse.json({ data: 'Slow response' });
  }),

  http.get('/api/timeout-endpoint', async () => {
    // 60秒の遅延（タイムアウトをトリガー）
    await delay(60000);

    return HttpResponse.json({ data: 'Should timeout' });
  }),
];
```

### 使用例

```typescript
// tests/slow-api.spec.ts
import { test, expect } from './fixtures/msw-fixtures';
import { delayedHandlers } from './mocks/delayed-handlers';

test('遅いAPIのローディング状態', async ({ page, mockServer }) => {
  mockServer.use(...delayedHandlers);

  await page.goto('/dashboard');

  // ローディングインジケーターが表示される
  await expect(page.locator('.loading-spinner')).toBeVisible();

  // 2秒後にデータが表示される
  await expect(page.locator('.data-content')).toBeVisible({ timeout: 5000 });
});
```

---

### 3. エラーシナリオのテスト

```typescript
// tests/mocks/error-handlers.ts
import { http, HttpResponse } from 'msw';

export const errorHandlers = [
  // 500 Internal Server Error
  http.get('/api/error-500', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  // 404 Not Found
  http.get('/api/not-found', () => {
    return HttpResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    );
  }),

  // ネットワークエラー
  http.get('/api/network-error', () => {
    return HttpResponse.error();
  }),

  // レート制限
  http.get('/api/rate-limited', () => {
    return HttpResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }),
];
```

### 使用例

```typescript
// tests/error-handling.spec.ts
import { test, expect } from './fixtures/msw-fixtures';
import { errorHandlers } from './mocks/error-handlers';

test.describe('エラーハンドリング', () => {
  test('500エラーの表示', async ({ page, mockServer }) => {
    mockServer.use(...errorHandlers);

    await page.goto('/dashboard');

    // エラーメッセージが表示される
    await expect(page.locator('.error-message')).toContainText(
      'Internal Server Error'
    );
  });

  test('リトライロジック', async ({ page, mockServer }) => {
    let attemptCount = 0;

    mockServer.use(
      http.get('/api/retry-test', () => {
        attemptCount++;

        // 最初の2回は失敗、3回目で成功
        if (attemptCount < 3) {
          return HttpResponse.error();
        }

        return HttpResponse.json({ data: 'Success after retry' });
      })
    );

    await page.goto('/dashboard');

    // リトライ後に成功
    await expect(page.locator('.data-content')).toBeVisible({ timeout: 10000 });
  });
});
```

---

### 4. 認証フロー

```typescript
// tests/mocks/auth-handlers.ts
import { http, HttpResponse } from 'msw';

let mockAuthToken: string | null = null;

export const authHandlers = [
  // ログイン
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'test@example.com' && password === 'password123') {
      mockAuthToken = 'mock-jwt-token-' + Date.now();

      return HttpResponse.json({
        token: mockAuthToken,
        user: { id: '1', email, name: 'Test User' },
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  // 認証が必要なエンドポイント
  http.get('/api/protected/profile', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || authHeader !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    });
  }),

  // ログアウト
  http.post('/api/auth/logout', () => {
    mockAuthToken = null;
    return HttpResponse.json({ message: 'Logged out' });
  }),
];
```

---

## ベストプラクティス

### DO ✅

- **ハンドラーを分離**: 機能ごとにハンドラーファイルを分ける
- **型安全**: TypeScriptでリクエスト・レスポンスの型を定義
- **リセット**: 各テスト後にハンドラーをリセット
- **現実的なレスポンス**: 実際のAPIと同じ構造を返す
- **エラーケース**: 500、404、ネットワークエラーをテスト

### DON'T ❌

- **実APIに依存しない**: テストから実際の外部APIを呼び出さない
- **ハードコードしない**: 環境変数やテストデータジェネレーターを使用
- **グローバル状態**: ハンドラー間で状態を共有しない（テスト独立性）
- **過度に複雑なモック**: シンプルなレスポンスを優先

---

## まとめ

MSWを使用することで、外部API依存を排除し、安定したE2Eテストを構築できます。

**キーポイント**:
1. **ネットワークレベルのモック**: Service Workerで透過的にインターセプト
2. **Fixture統合**: Playwrightのfixtureで簡単に使用
3. **条件付きレスポンス**: リクエスト内容に応じて動的に返す
4. **エラーシミュレーション**: 500、404、ネットワークエラーをテスト
5. **認証フロー**: トークン管理とprotectedエンドポイント

MSWにより、外部APIに依存しない高速で安定したテストが実現できます。
