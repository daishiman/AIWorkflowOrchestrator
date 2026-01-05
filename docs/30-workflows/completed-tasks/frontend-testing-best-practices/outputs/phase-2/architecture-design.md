# アーキテクチャ設計 - フロントエンドテストベストプラクティス

## ディレクトリ構造

```
apps/desktop/
├── src/
│   └── test/
│       ├── mocks/
│       │   ├── handlers.ts      # MSW APIハンドラー
│       │   └── server.ts        # MSWサーバー設定
│       ├── utils.tsx            # カスタムレンダー関数
│       ├── test-helpers.ts      # テストヘルパー
│       ├── factories.ts         # テストデータファクトリー
│       └── setup.ts             # テストセットアップ（更新）
├── e2e/
│   ├── auth.spec.ts             # 既存: 認証
│   ├── chat-history-export.spec.ts  # 既存
│   ├── chat-history-navigation.spec.ts  # 既存
│   ├── file-selection.spec.ts   # 既存
│   ├── system-prompt.spec.ts    # 既存
│   ├── workspace.spec.ts        # 既存
│   ├── settings.spec.ts         # 新規: 設定
│   ├── text-converter.spec.ts   # 新規: テキスト変換
│   └── error-handling.spec.ts   # 新規: エラー処理
└── vitest.config.ts             # カバレッジ閾値追加

packages/shared/
└── vitest.config.ts             # カバレッジ閾値追加

docs/testing/
├── TESTING.md                   # テスト実行ガイド
├── E2E.md                       # E2Eテスト追加方法
└── MSW.md                       # MSW使用方法
```

---

## MSWアーキテクチャ

### handlers.ts構造

```typescript
// Supabase Auth ハンドラー
const supabaseAuthHandlers = [
  http.post('https://*.supabase.co/auth/v1/token', ...),
  http.post('https://*.supabase.co/auth/v1/signup', ...),
  http.post('https://*.supabase.co/auth/v1/signout', ...),
];

// Anthropic ハンドラー
const anthropicHandlers = [
  http.post('https://api.anthropic.com/v1/messages', ...),
];

// 統合エクスポート
export const handlers = [
  ...supabaseAuthHandlers,
  ...anthropicHandlers,
];
```

### server.ts構造

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

### setup.ts更新内容

```typescript
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## テストユーティリティアーキテクチャ

### utils.tsx

| 関数名              | 用途                       |
| ------------------- | -------------------------- |
| renderWithRouter    | Router込みレンダリング     |
| renderWithProviders | 全Provider込みレンダリング |

### test-helpers.ts

| 関数名     | 用途                |
| ---------- | ------------------- |
| mockStore  | Zustandストアモック |
| resetStore | ストアリセット      |

### factories.ts

| 関数名                | 用途                   |
| --------------------- | ---------------------- |
| createMockChatSession | チャットセッション生成 |
| createMockChatMessage | チャットメッセージ生成 |

---

## カバレッジ設定

### desktop/vitest.config.ts

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 60,
    statements: 80,
  },
  exclude: [
    'node_modules/',
    'out/',
    'dist/',
    '**/*.test.{ts,tsx}',
    '**/*.config.{ts,js}',
    'e2e/**',
    'src/test/**',
    'src/main/index.ts',
    'src/preload/index.ts',
    'src/renderer/main.tsx',
  ],
}
```

### shared/vitest.config.ts

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 60,
    statements: 80,
  },
  exclude: [
    'node_modules/',
    'dist/',
    '**/*.test.ts',
    '**/index.ts',
    '**/interfaces.ts',
  ],
}
```

---

## CI/CD統合

### test.yml構造

```yaml
jobs:
  test:
    - Setup pnpm/Node.js
    - Install dependencies
    - Run unit tests
    - Run coverage check (80%閾値)
    - Upload coverage report

  e2e:
    - Setup environment
    - Install Playwright browsers
    - Run E2E tests
    - Upload failure artifacts
```
