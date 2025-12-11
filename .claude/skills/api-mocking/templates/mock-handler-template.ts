/**
 * MSWモックハンドラーテンプレート
 *
 * このテンプレートは、MSW（Mock Service Worker）を使用したAPIモックの基本構造を提供します。
 *
 * 使用方法:
 * 1. このファイルをコピーして、プロジェクトのtests/mocks/ディレクトリに配置
 * 2. {{変数}}を実際の値に置き換え
 * 3. 必要に応じてカスタマイズ
 */

import { http, HttpResponse, delay } from "msw";

// ==============================================================================
// 型定義
// ==============================================================================

/**
 * ユーザー型
 *
 * {{CUSTOMIZE_USER_TYPE}}
 */
type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
  createdAt: string;
  updatedAt?: string;
};

/**
 * {{RESOURCE_NAME}}型
 *
 * {{CUSTOMIZE_RESOURCE_TYPE}}
 */
type Resource = {
  id: string;
  // {{ADDITIONAL_FIELDS}}
};

// ==============================================================================
// モックデータ（ステート）
// ==============================================================================

/**
 * インメモリデータストア
 *
 * テスト中にリソースの状態を保持します。
 * 各テスト後にresetMockState()でリセットしてください。
 */
const mockState = {
  users: new Map<string, User>([
    [
      "1",
      {
        id: "1",
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ],
    [
      "2",
      {
        id: "2",
        email: "user@test.com",
        name: "Test User",
        role: "user",
        createdAt: "2024-01-02T00:00:00Z",
      },
    ],
  ]),

  // {{ADDITIONAL_RESOURCES}}
  // 例: projects: new Map<string, Project>(),

  nextUserId: 3,
  authToken: "mock-jwt-token-initial",
};

/**
 * モックステートをリセット
 *
 * 各テスト後に呼び出してください。
 */
export function resetMockState() {
  mockState.users.clear();
  mockState.users.set("1", {
    id: "1",
    email: "admin@test.com",
    name: "Admin User",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  });
  mockState.users.set("2", {
    id: "2",
    email: "user@test.com",
    name: "Test User",
    role: "user",
    createdAt: "2024-01-02T00:00:00Z",
  });
  mockState.nextUserId = 3;
  mockState.authToken = "mock-jwt-token-initial";
}

// ==============================================================================
// ヘルパー関数
// ==============================================================================

/**
 * 認証トークンを検証
 */
function validateAuth(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${mockState.authToken}`;
}

/**
 * 認証エラーレスポンス
 */
function unauthorizedResponse() {
  return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Not Foundレスポンス
 */
function notFoundResponse(resource: string) {
  return HttpResponse.json({ error: `${resource} not found` }, { status: 404 });
}

// ==============================================================================
// 認証ハンドラー
// ==============================================================================

export const authHandlers = [
  // ログイン
  http.post("{{API_BASE_URL}}/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // 簡易認証（テスト用）
    if (body.email === "admin@test.com" && body.password === "password123") {
      mockState.authToken = `mock-jwt-token-${Date.now()}`;

      return HttpResponse.json({
        token: mockState.authToken,
        user: mockState.users.get("1"),
      });
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  // ログアウト
  http.post("{{API_BASE_URL}}/auth/logout", ({ request }) => {
    if (!validateAuth(request)) {
      return unauthorizedResponse();
    }

    mockState.authToken = "";
    return HttpResponse.json({ message: "Logged out" });
  }),

  // 現在のユーザー取得
  http.get("{{API_BASE_URL}}/auth/me", ({ request }) => {
    if (!validateAuth(request)) {
      return unauthorizedResponse();
    }

    // トークンからユーザーIDを抽出（実際はJWTデコード）
    // ここでは簡略化してadminユーザーを返す
    return HttpResponse.json(mockState.users.get("1"));
  }),
];

// ==============================================================================
// ユーザーCRUDハンドラー
// ==============================================================================

export const userHandlers = [
  // ユーザー一覧取得
  http.get("{{API_BASE_URL}}/users", ({ request }) => {
    if (!validateAuth(request)) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const role = url.searchParams.get("role");

    let users = Array.from(mockState.users.values());

    // ロールフィルタリング
    if (role) {
      users = users.filter((user) => user.role === role);
    }

    // ページネーション
    const total = users.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = users.slice(start, end);

    return HttpResponse.json({
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }),

  // ユーザー詳細取得
  http.get("{{API_BASE_URL}}/users/:userId", ({ request, params }) => {
    if (!validateAuth(request)) {
      return unauthorizedResponse();
    }

    const { userId } = params;
    const user = mockState.users.get(userId as string);

    if (!user) {
      return notFoundResponse("User");
    }

    return HttpResponse.json(user);
  }),

  // ユーザー作成
  http.post("{{API_BASE_URL}}/users", async ({ request }) => {
    if (!validateAuth(request)) {
      return unauthorizedResponse();
    }

    const body = (await request.json()) as Partial<User>;

    // バリデーション
    if (!body.email || !body.name) {
      return HttpResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newUser: User = {
      id: `user_${mockState.nextUserId++}`,
      email: body.email,
      name: body.name,
      role: body.role || "user",
      createdAt: new Date().toISOString(),
    };

    mockState.users.set(newUser.id, newUser);

    return HttpResponse.json(newUser, { status: 201 });
  }),

  // ユーザー更新
  http.put("{{API_BASE_URL}}/users/:userId", async ({ request, params }) => {
    if (!validateAuth(request)) {
      return unauthorizedResponse();
    }

    const { userId } = params;
    const user = mockState.users.get(userId as string);

    if (!user) {
      return notFoundResponse("User");
    }

    const body = (await request.json()) as Partial<User>;

    const updatedUser: User = {
      ...user,
      ...body,
      id: user.id, // IDは変更不可
      updatedAt: new Date().toISOString(),
    };

    mockState.users.set(userId as string, updatedUser);

    return HttpResponse.json(updatedUser);
  }),

  // ユーザー削除
  http.delete("{{API_BASE_URL}}/users/:userId", ({ request, params }) => {
    if (!validateAuth(request)) {
      return unauthorizedResponse();
    }

    const { userId } = params;

    if (!mockState.users.has(userId as string)) {
      return notFoundResponse("User");
    }

    mockState.users.delete(userId as string);

    return new HttpResponse(null, { status: 204 });
  }),
];

// ==============================================================================
// エラーシミュレーションハンドラー
// ==============================================================================

export const errorHandlers = [
  // 500 Internal Server Error
  http.get("{{API_BASE_URL}}/error/500", () => {
    return HttpResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }),

  // 503 Service Unavailable
  http.get("{{API_BASE_URL}}/error/503", () => {
    return HttpResponse.json({ error: "Service Unavailable" }, { status: 503 });
  }),

  // ネットワークエラー
  http.get("{{API_BASE_URL}}/error/network", () => {
    return HttpResponse.error();
  }),

  // タイムアウト
  http.get("{{API_BASE_URL}}/error/timeout", async () => {
    await delay(60000); // 60秒待機
    return HttpResponse.json({ data: "Should timeout" });
  }),
];

// ==============================================================================
// パフォーマンステスト用ハンドラー
// ==============================================================================

export const performanceHandlers = [
  // 高速レスポンス（50ms）
  http.get("{{API_BASE_URL}}/perf/fast", async () => {
    await delay(50);
    return HttpResponse.json({ data: "Fast response" });
  }),

  // 通常速度（500ms）
  http.get("{{API_BASE_URL}}/perf/normal", async () => {
    await delay(500);
    return HttpResponse.json({ data: "Normal response" });
  }),

  // 低速レスポンス（3秒）
  http.get("{{API_BASE_URL}}/perf/slow", async () => {
    await delay(3000);
    return HttpResponse.json({ data: "Slow response" });
  }),

  // 大量データ
  http.get("{{API_BASE_URL}}/perf/large", () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      id: `item_${i + 1}`,
      value: Math.random() * 1000,
    }));

    return HttpResponse.json({ items: largeData });
  }),
];

// ==============================================================================
// すべてのハンドラーをエクスポート
// ==============================================================================

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...errorHandlers,
  ...performanceHandlers,

  // {{ADDITIONAL_HANDLERS}}
];

// ==============================================================================
// 使用例
// ==============================================================================

/**
 * MSWセットアップ例:
 *
 * ```typescript
 * // tests/setup/msw-server.ts
 * import { setupServer } from 'msw/node';
 * import { handlers } from '../mocks/handlers';
 *
 * export const server = setupServer(...handlers);
 *
 * export function startMockServer() {
 *   server.listen({ onUnhandledRequest: 'warn' });
 * }
 *
 * export function stopMockServer() {
 *   server.close();
 * }
 *
 * export function resetMockServer() {
 *   server.resetHandlers();
 * }
 * ```
 */

/**
 * テストでの使用例:
 *
 * ```typescript
 * import { test, expect } from './fixtures/msw-fixtures';
 * import { resetMockState } from './mocks/handlers';
 *
 * test.describe('ユーザー管理', () => {
 *   test.beforeEach(() => {
 *     resetMockState();
 *   });
 *
 *   test('ユーザー一覧の取得', async ({ page }) => {
 *     await page.goto('/users');
 *     await expect(page.locator('text=Admin User')).toBeVisible();
 *     await expect(page.locator('text=Test User')).toBeVisible();
 *   });
 * });
 * ```
 */

/**
 * カスタムハンドラーのオーバーライド例:
 *
 * ```typescript
 * test('カスタムレスポンス', async ({ page, mockServer }) => {
 *   mockServer.use(
 *     http.get('/api/users', () => {
 *       return HttpResponse.json([
 *         { id: '99', name: 'Custom User' },
 *       ]);
 *     })
 *   );
 *
 *   await page.goto('/users');
 *   await expect(page.locator('text=Custom User')).toBeVisible();
 * });
 * ```
 */
