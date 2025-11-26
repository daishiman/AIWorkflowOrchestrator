# APIモックパターン

E2Eテストで使用可能な各種モックパターンとその実装方法を解説します。

---

## 目次

1. [基本的なモックパターン](#基本的なモックパターン)
2. [条件付きモック](#条件付きモック)
3. [ステートフルモック](#ステートフルモック)
4. [エラーシミュレーション](#エラーシミュレーション)
5. [パフォーマンステスト用モック](#パフォーマンステスト用モック)

---

## 基本的なモックパターン

### 1. 静的レスポンス

最もシンプルなパターン。常に同じレスポンスを返す。

```typescript
// tests/mocks/static-handlers.ts
import { http, HttpResponse } from 'msw';

export const staticHandlers = [
  http.get('/api/config', () => {
    return HttpResponse.json({
      apiVersion: '1.0.0',
      features: {
        darkMode: true,
        notifications: true,
      },
    });
  }),
];
```

**用途**: 設定、機能フラグ、静的マスターデータ

---

### 2. 動的レスポンス（パスパラメータ）

URLパスからパラメータを取得して動的にレスポンスを生成。

```typescript
// tests/mocks/dynamic-handlers.ts
import { http, HttpResponse } from 'msw';

export const dynamicHandlers = [
  http.get('/api/users/:userId', ({ params }) => {
    const { userId } = params;

    return HttpResponse.json({
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      createdAt: new Date().toISOString(),
    });
  }),

  http.get('/api/projects/:projectId/tasks/:taskId', ({ params }) => {
    const { projectId, taskId } = params;

    return HttpResponse.json({
      id: taskId,
      title: `Task ${taskId}`,
      projectId,
      status: 'in_progress',
    });
  }),
];
```

**用途**: リソースID指定のエンドポイント

---

### 3. クエリパラメータ処理

URLクエリパラメータに応じてレスポンスを変更。

```typescript
// tests/mocks/query-handlers.ts
import { http, HttpResponse } from 'msw';

export const queryHandlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const role = url.searchParams.get('role');

    // ページネーション
    const users = Array.from({ length: limit }, (_, i) => ({
      id: `${(page - 1) * limit + i + 1}`,
      name: `User ${(page - 1) * limit + i + 1}`,
      email: `user${(page - 1) * limit + i + 1}@example.com`,
      role: role || 'user',
    }));

    return HttpResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: Math.ceil(100 / limit),
      },
    });
  }),
];
```

**用途**: ページネーション、フィルタリング、ソート

---

### 4. リクエストボディ処理（POST/PUT）

リクエストボディを検証し、適切なレスポンスを返す。

```typescript
// tests/mocks/request-body-handlers.ts
import { http, HttpResponse } from 'msw';

export const requestBodyHandlers = [
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();

    // バリデーション
    if (!body.email || !body.name) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 新規リソースを返す
    return HttpResponse.json(
      {
        id: `user_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.put('/api/users/:userId', async ({ params, request }) => {
    const { userId } = params;
    const body = await request.json();

    return HttpResponse.json({
      id: userId,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),
];
```

**用途**: 作成、更新、バリデーション

---

## 条件付きモック

### 1. ヘッダーベースの条件分岐

リクエストヘッダーに応じてレスポンスを変更。

```typescript
// tests/mocks/header-based-handlers.ts
import { http, HttpResponse } from 'msw';

export const headerBasedHandlers = [
  http.get('/api/profile', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    // 認証なし
    if (!authHeader) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 無効なトークン
    if (!authHeader.startsWith('Bearer mock-token-')) {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // 正常なレスポンス
    return HttpResponse.json({
      id: '1',
      name: 'Authenticated User',
      email: 'user@example.com',
    });
  }),

  http.get('/api/data', ({ request }) => {
    const acceptLanguage = request.headers.get('Accept-Language');

    if (acceptLanguage?.includes('ja')) {
      return HttpResponse.json({ message: 'こんにちは' });
    }

    return HttpResponse.json({ message: 'Hello' });
  }),
];
```

**用途**: 認証、多言語対応、コンテンツネゴシエーション

---

### 2. リクエストメソッド別

同じURLでもメソッドによってレスポンスを変更。

```typescript
// tests/mocks/method-based-handlers.ts
import { http, HttpResponse } from 'msw';

let resources: any[] = [
  { id: '1', name: 'Resource 1' },
  { id: '2', name: 'Resource 2' },
];

export const methodBasedHandlers = [
  // GET: 一覧取得
  http.get('/api/resources', () => {
    return HttpResponse.json(resources);
  }),

  // POST: 新規作成
  http.post('/api/resources', async ({ request }) => {
    const body = await request.json();
    const newResource = { id: `${Date.now()}`, ...body };
    resources.push(newResource);
    return HttpResponse.json(newResource, { status: 201 });
  }),

  // PUT: 更新
  http.put('/api/resources/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const index = resources.findIndex((r) => r.id === id);

    if (index === -1) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }

    resources[index] = { id, ...body };
    return HttpResponse.json(resources[index]);
  }),

  // DELETE: 削除
  http.delete('/api/resources/:id', ({ params }) => {
    const { id } = params;
    resources = resources.filter((r) => r.id !== id);
    return HttpResponse.json({ message: 'Deleted' }, { status: 204 });
  }),
];
```

**用途**: CRUD操作

---

## ステートフルモック

### リソース状態を保持

テスト中にリソースの状態を保持し、複数のリクエストで一貫性を保つ。

```typescript
// tests/mocks/stateful-handlers.ts
import { http, HttpResponse } from 'msw';

// ステート（インメモリDB的な役割）
const state = {
  users: new Map<string, any>(),
  nextUserId: 1,
};

export const statefulHandlers = [
  // ユーザー作成（ステートに追加）
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    const userId = `user_${state.nextUserId++}`;

    const newUser = {
      id: userId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    state.users.set(userId, newUser);

    return HttpResponse.json(newUser, { status: 201 });
  }),

  // ユーザー取得（ステートから取得）
  http.get('/api/users/:userId', ({ params }) => {
    const { userId } = params;
    const user = state.users.get(userId);

    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  // ユーザー一覧（ステートから取得）
  http.get('/api/users', () => {
    return HttpResponse.json(Array.from(state.users.values()));
  }),

  // ユーザー更新（ステートを更新）
  http.put('/api/users/:userId', async ({ params, request }) => {
    const { userId } = params;
    const body = await request.json();
    const user = state.users.get(userId);

    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = { ...user, ...body, updatedAt: new Date().toISOString() };
    state.users.set(userId, updatedUser);

    return HttpResponse.json(updatedUser);
  }),

  // ユーザー削除（ステートから削除）
  http.delete('/api/users/:userId', ({ params }) => {
    const { userId } = params;

    if (!state.users.has(userId)) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    state.users.delete(userId);
    return HttpResponse.json({ message: 'Deleted' }, { status: 204 });
  }),
];

// ステートリセット関数（テスト間でクリーン）
export function resetState() {
  state.users.clear();
  state.nextUserId = 1;
}
```

### 使用例

```typescript
// tests/stateful-api.spec.ts
import { test, expect } from './fixtures/msw-fixtures';
import { statefulHandlers, resetState } from './mocks/stateful-handlers';

test.describe('ステートフルAPIテスト', () => {
  test.beforeEach(({ mockServer }) => {
    mockServer.use(...statefulHandlers);
    resetState(); // 各テスト前にステートをリセット
  });

  test('ユーザーのCRUD操作', async ({ page, request }) => {
    // 1. 作成
    const createResponse = await request.post('/api/users', {
      data: { name: 'Alice', email: 'alice@example.com' },
    });
    const user = await createResponse.json();
    expect(user.id).toBeDefined();

    // 2. 取得
    const getResponse = await request.get(`/api/users/${user.id}`);
    const fetchedUser = await getResponse.json();
    expect(fetchedUser.name).toBe('Alice');

    // 3. 更新
    const updateResponse = await request.put(`/api/users/${user.id}`, {
      data: { name: 'Alice Updated' },
    });
    const updatedUser = await updateResponse.json();
    expect(updatedUser.name).toBe('Alice Updated');

    // 4. 削除
    const deleteResponse = await request.delete(`/api/users/${user.id}`);
    expect(deleteResponse.status()).toBe(204);

    // 5. 削除後の取得（404）
    const notFoundResponse = await request.get(`/api/users/${user.id}`);
    expect(notFoundResponse.status()).toBe(404);
  });
});
```

**用途**: 複雑なワークフローテスト、CRUD操作の検証

---

## エラーシミュレーション

### 1. HTTPステータスコードエラー

```typescript
// tests/mocks/error-handlers.ts
import { http, HttpResponse } from 'msw';

export const errorHandlers = [
  // 400 Bad Request
  http.post('/api/bad-request', () => {
    return HttpResponse.json(
      { error: 'Invalid input', details: { field: 'email', message: 'Invalid format' } },
      { status: 400 }
    );
  }),

  // 401 Unauthorized
  http.get('/api/unauthorized', () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),

  // 403 Forbidden
  http.delete('/api/forbidden', () => {
    return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
  }),

  // 404 Not Found
  http.get('/api/not-found', () => {
    return HttpResponse.json({ error: 'Resource not found' }, { status: 404 });
  }),

  // 500 Internal Server Error
  http.get('/api/server-error', () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),

  // 503 Service Unavailable
  http.get('/api/unavailable', () => {
    return HttpResponse.json({ error: 'Service Unavailable' }, { status: 503 });
  }),
];
```

---

### 2. ネットワークエラー

```typescript
// tests/mocks/network-error-handlers.ts
import { http, HttpResponse } from 'msw';

export const networkErrorHandlers = [
  // ネットワークエラー（接続失敗）
  http.get('/api/network-error', () => {
    return HttpResponse.error();
  }),

  // タイムアウト
  http.get('/api/timeout', async () => {
    await new Promise((resolve) => setTimeout(resolve, 60000));
    return HttpResponse.json({ data: 'Should timeout' });
  }),
];
```

---

### 3. 段階的失敗（リトライテスト用）

```typescript
// tests/mocks/retry-handlers.ts
import { http, HttpResponse } from 'msw';

let attemptCount = 0;

export const retryHandlers = [
  http.get('/api/retry-test', () => {
    attemptCount++;

    // 最初の2回は失敗、3回目で成功
    if (attemptCount < 3) {
      return HttpResponse.json({ error: 'Temporary error' }, { status: 500 });
    }

    return HttpResponse.json({ data: 'Success after retry' });
  }),
];

export function resetRetryCount() {
  attemptCount = 0;
}
```

**用途**: リトライロジックのテスト、エラーハンドリングの検証

---

## パフォーマンステスト用モック

### 1. 大量データのシミュレーション

```typescript
// tests/mocks/large-data-handlers.ts
import { http, HttpResponse } from 'msw';

export const largeDataHandlers = [
  http.get('/api/large-dataset', () => {
    // 10,000件のアイテムを生成
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: `item_${i + 1}`,
      name: `Item ${i + 1}`,
      value: Math.random() * 1000,
    }));

    return HttpResponse.json({ items });
  }),
];
```

**用途**: 仮想スクロール、ページネーションのパフォーマンステスト

---

### 2. 遅延シミュレーション

```typescript
// tests/mocks/performance-handlers.ts
import { http, HttpResponse, delay } from 'msw';

export const performanceHandlers = [
  // 高速API（50ms）
  http.get('/api/fast', async () => {
    await delay(50);
    return HttpResponse.json({ data: 'Fast response' });
  }),

  // 通常速度API（500ms）
  http.get('/api/normal', async () => {
    await delay(500);
    return HttpResponse.json({ data: 'Normal response' });
  }),

  // 低速API（3秒）
  http.get('/api/slow', async () => {
    await delay(3000);
    return HttpResponse.json({ data: 'Slow response' });
  }),
];
```

**用途**: ローディング表示、タイムアウト処理のテスト

---

## ベストプラクティス

### DO ✅

- **ハンドラーを分類**: 機能ごとにファイルを分ける
- **ステートリセット**: 各テスト後にステートをリセット
- **型安全**: TypeScriptで型を定義
- **エラーケースをテスト**: 正常系だけでなく異常系も
- **現実的なレスポンス時間**: delayで実際のAPIに近い遅延を追加

### DON'T ❌

- **グローバルステート**: ハンドラー間で状態を共有しない
- **過度に複雑**: シンプルなレスポンスを優先
- **実APIに依存**: テストから実際のAPIを呼び出さない
- **ハードコード**: 環境変数やテストデータジェネレーターを使用

---

## まとめ

適切なモックパターンを選択することで、効率的で安定したAPIテストを実現できます。

**キーポイント**:
1. **静的 vs 動的**: 状況に応じて適切なパターンを選択
2. **条件付きモック**: リクエスト内容に応じて動的にレスポンスを変更
3. **ステートフル**: 複雑なワークフローはステート管理で対応
4. **エラーシミュレーション**: 異常系のテストも重要
5. **パフォーマンステスト**: 遅延や大量データをシミュレート

これらのパターンを組み合わせて、包括的なAPIテストを構築してください。
