# テスト仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | TASK-AUTH-MODE-SELECTION-001 |
| Phase      | 4                            |
| 作成日     | 2026-02-09                   |
| テスト種別 | Unit / Integration / E2E     |

---

## テスト戦略

### テストピラミッド

```
        /  E2E  \           5%  - 手動テスト + Playwright
       /────────\
      / 統合テスト \         15% - IPC通信・状態管理連携
     /──────────────\
    /   ユニットテスト   \     80% - 個別コンポーネント・サービス
   /────────────────────\
```

### テスト種別と比率

| 種別           | 比率 | 対象                                            | ツール                 |
| -------------- | ---- | ----------------------------------------------- | ---------------------- |
| ユニットテスト | 80%  | サービス、プロバイダー、Slice、UIコンポーネント | Vitest                 |
| 統合テスト     | 15%  | IPC通信、Renderer-Main連携                      | Vitest + Electron Mock |
| E2Eテスト      | 5%   | ユーザーシナリオ全体                            | Playwright             |

### TDDサイクル

```
Red → Green → Refactor

1. Red: 失敗するテストを書く（本Phase）
2. Green: テストを通す最小実装（Phase 5）
3. Refactor: コード品質改善（Phase 8）
```

---

## テスト対象一覧

### Main Process（サービス層）

| 対象                     | テストファイル                                 | テスト種別  | 優先度 |
| ------------------------ | ---------------------------------------------- | ----------- | ------ |
| AuthModeService          | `__tests__/auth-mode-service.test.ts`          | Unit        | 高     |
| SubscriptionAuthProvider | `__tests__/subscription-auth-provider.test.ts` | Unit        | 高     |
| authModeHandlers         | `__tests__/auth-mode-handlers.test.ts`         | Unit        | 高     |
| IPC統合                  | `__tests__/auth-mode-ipc-integration.test.ts`  | Integration | 中     |

### Renderer Process（UI/状態管理層）

| 対象                    | テストファイル                               | テスト種別 | 優先度 |
| ----------------------- | -------------------------------------------- | ---------- | ------ |
| authModeSlice           | `__tests__/authModeSlice.test.ts`            | Unit       | 高     |
| AuthModeSelector        | `__tests__/AuthModeSelector.test.tsx`        | Unit       | 高     |
| AuthModeStatusIndicator | `__tests__/AuthModeStatusIndicator.test.tsx` | Unit       | 中     |
| AuthModeSettingsSection | `__tests__/AuthModeSettingsSection.test.tsx` | Unit       | 中     |
| ConfirmDialog           | `__tests__/AuthModeConfirmDialog.test.tsx`   | Unit       | 中     |

### Preload

| 対象        | テストファイル                  | テスト種別 | 優先度 |
| ----------- | ------------------------------- | ---------- | ------ |
| authModeApi | `__tests__/authModeApi.test.ts` | Unit       | 中     |

### E2E

| 対象               | テストファイル                    | テスト種別 | 優先度 |
| ------------------ | --------------------------------- | ---------- | ------ |
| 認証方式選択フロー | `e2e/auth-mode-selection.spec.ts` | E2E        | 低     |

---

## テストカバレッジ目標

### 全体目標

| 指標              | 最低基準 | 推奨基準 | 必達条件 |
| ----------------- | -------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      | 必須     |
| Branch Coverage   | 60%      | 70%      | 必須     |
| Function Coverage | 80%      | 90%      | 必須     |

### コンポーネント別目標

| コンポーネント           | Line | Branch | Function |
| ------------------------ | ---- | ------ | -------- |
| AuthModeService          | 90%+ | 80%+   | 100%     |
| SubscriptionAuthProvider | 90%+ | 80%+   | 100%     |
| authModeSlice            | 85%+ | 70%+   | 100%     |
| UIコンポーネント         | 80%+ | 60%+   | 90%+     |
| IPCハンドラ              | 85%+ | 70%+   | 100%     |

---

## モック・スタブ一覧

### Main Process モック

#### IAuthKeyService（既存サービス）

```typescript
const mockAuthKeyService: IAuthKeyService = {
  setKey: vi.fn().mockResolvedValue(undefined),
  getKey: vi.fn().mockResolvedValue("sk-ant-api03-test-key"),
  hasKey: vi.fn().mockResolvedValue(true),
  validateKey: vi.fn().mockResolvedValue(true),
  deleteKey: vi.fn().mockResolvedValue(undefined),
};
```

#### ISubscriptionAuthProvider

```typescript
const mockSubscriptionAuthProvider: ISubscriptionAuthProvider = {
  getToken: vi.fn().mockResolvedValue("sk-ant-oat01-test-token"),
  hasToken: vi.fn().mockResolvedValue(true),
  validateToken: vi.fn().mockResolvedValue(true),
  clearCache: vi.fn(),
};
```

#### IKeychainAccess（keytar ラッパー）

```typescript
const mockKeychainAccess: IKeychainAccess = {
  getPassword: vi.fn().mockResolvedValue(null),
  setPassword: vi.fn().mockResolvedValue(undefined),
  deletePassword: vi.fn().mockResolvedValue(true),
};
```

#### electron-store

```typescript
const mockStore = {
  get: vi.fn().mockReturnValue(undefined),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn().mockReturnValue(false),
};

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => mockStore),
}));
```

### Renderer Process モック

#### window.electronAPI

```typescript
const mockElectronAPI = {
  authMode: {
    get: vi.fn().mockResolvedValue({
      success: true,
      data: { mode: "subscription" },
    }),
    set: vi.fn().mockResolvedValue({ success: true }),
    getStatus: vi.fn().mockResolvedValue({
      success: true,
      data: {
        mode: "subscription",
        isAuthenticated: true,
        hasCredentials: true,
      },
    }),
    validate: vi.fn().mockResolvedValue({
      success: true,
      data: { isValid: true, mode: "subscription", hasCredentials: true },
    }),
    onChanged: vi.fn(),
  },
};

Object.defineProperty(window, "electronAPI", {
  value: mockElectronAPI,
  writable: true,
});
```

#### IPC Renderer

```typescript
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
}));
```

### 環境変数モック

```typescript
const originalEnv = process.env;

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

// 特定テスト内で設定
process.env.CLAUDE_CODE_OAUTH_TOKEN = "sk-ant-oat01-env-token";
process.env.NODE_ENV = "test";
```

---

## テスト環境セットアップ

### Vitest設定

```typescript
// vitest.config.ts（抜粋）
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/main/services/auth/**",
        "src/renderer/store/slices/authModeSlice.ts",
        "src/renderer/components/**/AuthMode*.tsx",
      ],
      exclude: ["**/__tests__/**", "**/*.d.ts"],
    },
  },
});
```

### テストセットアップファイル

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// グローバルモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
}));

// console.log/warn/error の抑制（テスト環境）
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  // error: vi.fn(), // エラーは表示を維持
};
```

---

## テスト実行コマンド

### 基本コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# ウォッチモード
pnpm --filter @repo/desktop test:watch

# カバレッジ付き実行
pnpm --filter @repo/desktop test:coverage

# 特定ファイルのみ実行
pnpm --filter @repo/desktop test auth-mode
```

### CI実行コマンド

```bash
# CI用（並列制限・カバレッジ）
pnpm --filter @repo/desktop test:ci --coverage
```

---

## テストデータ

### トークンサンプル

```typescript
const TEST_TOKENS = {
  // 有効なOAuthトークン
  validOAuthToken: "sk-ant-oat01-valid-test-token-xxxx",

  // 期限切れトークン（テスト用）
  expiredToken: "sk-ant-oat01-expired-token-xxxx",

  // 無効な形式のトークン
  invalidFormatToken: "invalid-token-format",

  // 有効なAPIキー
  validApiKey: "sk-ant-api03-valid-test-key-xxxx",

  // 無効な形式のAPIキー
  invalidApiKey: "sk-invalid-key",
};
```

### Keychain JSONサンプル

```typescript
const TEST_KEYCHAIN_DATA = {
  // 正常なトークンデータ
  validTokenData: JSON.stringify({
    accessToken: "sk-ant-oat01-keychain-token",
    refreshToken: "sk-ant-ort01-keychain-refresh",
  }),

  // refreshToken無し
  accessTokenOnly: JSON.stringify({
    accessToken: "sk-ant-oat01-access-only",
  }),

  // 不正なJSON
  invalidJson: "not-a-json-string",

  // 空オブジェクト
  emptyObject: "{}",
};
```

---

## 受入基準とテストケースのマッピング

| 受入基準 | 関連テストケース         | テストファイル                                                |
| -------- | ------------------------ | ------------------------------------------------------------- |
| AC-1     | TC-AMS-001, TC-SAP-001   | auth-mode-service.test.ts, subscription-auth-provider.test.ts |
| AC-2     | TC-AMS-002, TC-SAP-002   | auth-mode-service.test.ts, subscription-auth-provider.test.ts |
| AC-3     | TC-AMS-003, TC-AKS-001   | auth-mode-service.test.ts                                     |
| AC-4     | TC-AMS-004, TC-AKS-002   | auth-mode-service.test.ts                                     |
| AC-5     | TC-AMS-005, TC-SLICE-005 | auth-mode-service.test.ts, authModeSlice.test.ts              |
| AC-6     | TC-AMS-006               | auth-mode-service.test.ts                                     |
| AC-7     | TC-SAP-003               | subscription-auth-provider.test.ts                            |
| AC-8     | TC-UI-001, TC-UI-002     | AuthModeStatusIndicator.test.tsx                              |
| AC-9     | TC-SAP-004               | subscription-auth-provider.test.ts                            |
| AC-10    | TC-AKS-003               | auth-mode-service.test.ts                                     |
| AC-11    | TC-UI-003, TC-SLICE-003  | AuthModeSelector.test.tsx, authModeSlice.test.ts              |

---

## 関連ドキュメント

| ドキュメント                 | パス                                                   |
| ---------------------------- | ------------------------------------------------------ |
| 受入基準                     | `outputs/phase-1/acceptance-criteria.md`               |
| AuthModeService設計          | `outputs/phase-2/auth-mode-service-design.md`          |
| SubscriptionAuthProvider設計 | `outputs/phase-2/subscription-auth-provider-design.md` |
| IPC仕様                      | `outputs/phase-2/ipc-specification.md`                 |
| 状態管理設計                 | `outputs/phase-2/state-management-design.md`           |
| UI設計                       | `outputs/phase-2/ui-wireframe.md`                      |
| コード品質ルール             | `.claude/rules/02-code-quality.md`                     |
