---
name: api-mocking
description: |
  E2EテストにおけるAPI モック技術。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/api-mocking/resources/mock-patterns.md`: APIモックパターン
  - `.claude/skills/api-mocking/resources/msw-integration-guide.md`: MSW（Mock Service Worker）統合ガイド
  - `.claude/skills/api-mocking/templates/mock-handler-template.ts`: MSWモックハンドラーテンプレート
  - `.claude/skills/api-mocking/scripts/generate-mock-handlers.mjs`: MSWモックハンドラー自動生成スクリプト

  専門分野:
  - Playwright Route Mocking: route.fulfill()による柔軟なレスポンス制御
  - MSW統合: Mock Service Workerとの統合パターン
  - エラーシミュレーション: 4xx、5xx、ネットワークエラーの再現
  - 条件付きモック: URL、メソッド、ヘッダーに基づく動的レスポンス

  使用タイミング:
  - 外部APIへの依存を排除する必要がある時
  - API エラーケース（4xx, 5xx）をテストする時
  - テスト実行の安定性・速度向上が必要な時
  - ネットワーク遅延をシミュレートする時
  - Playwright Route Mockingを実装する時

  Use proactively when isolating external dependencies, simulating API errors,
  or stabilizing E2E tests with mocked responses.
version: 1.0.0
---

# API Mocking Skill

## 概要

E2EテストにおけるAPI モック技術。外部依存の排除、テスト安定化、エラーケースシミュレーションを提供。

## 核心概念

### 1. Playwright Route Mocking

```typescript
test.beforeEach(async ({ page }) => {
  // APIレスポンスをモック
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Test User 1' },
        { id: 2, name: 'Test User 2' }
      ])
    });
  });
});
```

### 2. エラーケースのシミュレーション

```typescript
test('APIエラー処理', async ({ page }) => {
  // 500エラーをモック
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });

  await page.goto('/users');
  await expect(page.getByText('Error loading users')).toBeVisible();
});
```

### 3. ネットワーク遅延のシミュレーション

```typescript
test('ローディング表示', async ({ page }) => {
  await page.route('**/api/users', async route => {
    // 2秒遅延
    await new Promise(resolve => setTimeout(resolve, 2000));

    route.fulfill({
      status: 200,
      body: JSON.stringify([])
    });
  });

  await page.goto('/users');

  // ローディング表示確認
  await expect(page.getByTestId('loading')).toBeVisible();
});
```

## 実装パターン

### パターン1: MSW（Mock Service Worker）統合

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test User 1' },
      { id: 2, name: 'Test User 2' }
    ]);
  })
];

// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### パターン2: 条件付きモック

```typescript
test('条件付きモック', async ({ page }) => {
  await page.route('**/api/**', route => {
    const url = route.request().url();

    // 特定エンドポイントのみモック
    if (url.includes('/api/users')) {
      route.fulfill({ status: 200, body: '[]' });
    } else {
      route.continue(); // その他は実APIへ
    }
  });
});
```

### パターン3: Fixture使用

```typescript
// fixtures/api-responses.json
{
  "users": [
    { "id": 1, "name": "User 1" }
  ],
  "posts": [
    { "id": 1, "title": "Post 1" }
  ]
}

// テスト
import apiResponses from './fixtures/api-responses.json';

test('Fixture使用', async ({ page }) => {
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(apiResponses.users)
    });
  });
});
```

## ベストプラクティス

### DO（推奨）

1. **モックの一元管理**:
```typescript
// mocks/index.ts
export const mockUsers = [{ id: 1, name: 'Test' }];
export const mockPosts = [{ id: 1, title: 'Post' }];
```

2. **エラーケースのテスト**:
```typescript
test('ネットワークエラー', async ({ page }) => {
  await page.route('**/api/**', route => route.abort());
});
```

3. **リクエスト検証**:
```typescript
test('POSTリクエスト検証', async ({ page }) => {
  await page.route('**/api/users', route => {
    const postData = route.request().postDataJSON();
    expect(postData.name).toBe('New User');

    route.fulfill({ status: 201, body: JSON.stringify(postData) });
  });
});
```

### DON'T（非推奨）

1. **本番APIに直接依存しない**
2. **モックデータをハードコードしない**

## 関連スキル

- **playwright-testing** (`.claude/skills/playwright-testing/SKILL.md`): 基本操作
- **test-data-management** (`.claude/skills/test-data-management/SKILL.md`): データ管理
- **flaky-test-prevention** (`.claude/skills/flaky-test-prevention/SKILL.md`): 安定性確保

## リソース

- [resources/msw-integration-guide.md](resources/msw-integration-guide.md) - MSW（Mock Service Worker）統合ガイド
- [resources/mock-patterns.md](resources/mock-patterns.md) - 各種モックパターン
- [scripts/generate-mock-handlers.mjs](scripts/generate-mock-handlers.mjs) - MSWハンドラー自動生成スクリプト
- [templates/mock-handler-template.ts](templates/mock-handler-template.ts) - MSWハンドラーテンプレート
