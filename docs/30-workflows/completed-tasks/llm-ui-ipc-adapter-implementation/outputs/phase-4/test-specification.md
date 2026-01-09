# Phase 4: テスト仕様書

## 文書情報

| 項目           | 内容                        |
| -------------- | --------------------------- |
| タスクID       | TASK-LLM-UI-IPC-ADAPTER-001 |
| Phase          | 4                           |
| 作成日         | 2026-01-09                  |
| 適用スキル     | tdd-principles              |
| テストフェーズ | Red（失敗するテスト）       |

---

## 1. テスト戦略

### 1.1 TDDアプローチ

```
Phase 4: Red（失敗するテスト作成）
    ↓
Phase 5: Green（テストを通す最小実装）
    ↓
Phase 6: テスト拡充
    ↓
Phase 8: Refactor（設計改善）
```

### 1.2 テストピラミッド

```
        /\
       /  \  E2E Tests (少数)
      /----\
     /      \  Integration Tests (中程度)
    /--------\
   /          \  Unit Tests (多数)
  /------------\
```

| レベル      | 対象                       | 割合 |
| ----------- | -------------------------- | ---- |
| Unit        | コンポーネント、アダプター | 70%  |
| Integration | IPC通信、データフロー      | 25%  |
| E2E         | 完全なユーザーフロー       | 5%   |

---

## 2. テスト対象と責務

### 2.1 UIコンポーネントテスト

| コンポーネント   | 責務                        | テストファイル              |
| ---------------- | --------------------------- | --------------------------- |
| ProviderSelector | プロバイダー選択UI          | `ProviderSelector.test.tsx` |
| ModelSelector    | モデル選択UI                | `ModelSelector.test.tsx`    |
| HealthIndicator  | 接続状態表示                | `HealthIndicator.test.tsx`  |
| LLMSelectorPanel | 統合パネル（上記3つを統合） | `LLMSelectorPanel.test.tsx` |

**テストライブラリ**:

- Vitest
- @testing-library/react
- @testing-library/user-event

### 2.2 IPCハンドラーテスト

| ハンドラー        | 責務             | テストファイル |
| ----------------- | ---------------- | -------------- |
| llm:get-providers | プロバイダー一覧 | `llm.test.ts`  |
| llm:check-health  | ヘルスチェック   | `llm.test.ts`  |
| llm:send-chat     | チャット送信     | `llm.test.ts`  |
| llm:stream-chat   | ストリーミング   | `llm.test.ts`  |

**テストライブラリ**:

- Vitest
- electron-mock-ipc（または自作モック）

### 2.3 LLMアダプターテスト

| アダプター        | 責務               | テストファイル              |
| ----------------- | ------------------ | --------------------------- |
| OpenAIAdapter     | OpenAI API呼び出し | `OpenAIAdapter.test.ts`     |
| AnthropicAdapter  | Anthropic API      | `AnthropicAdapter.test.ts`  |
| GoogleAdapter     | Google AI API      | `GoogleAdapter.test.ts`     |
| xAIAdapter        | xAI API            | `xAIAdapter.test.ts`        |
| LLMAdapterFactory | アダプター生成     | `LLMAdapterFactory.test.ts` |

**テストライブラリ**:

- Vitest
- msw（Mock Service Worker）

---

## 3. モック戦略

### 3.1 テストダブルの種類

| 種類 | 用途         | 適用対象             |
| ---- | ------------ | -------------------- |
| Mock | 呼び出し検証 | llmSlice、IPC invoke |
| Stub | 固定値返却   | Preload API、外部API |
| Fake | 簡易実装     | SecureStorage        |
| Spy  | 呼び出し追跡 | イベントリスナー     |

### 3.2 モック対象

```typescript
// 1. Preload API モック
vi.mock("@/preload", () => ({
  electronAPI: {
    llm: {
      getProviders: vi.fn(),
      checkHealth: vi.fn(),
      sendChat: vi.fn(),
      streamChat: vi.fn(),
      onStreamChunk: vi.fn(),
      onStreamEnd: vi.fn(),
      onStreamError: vi.fn(),
    },
  },
}));

// 2. fetch モック（外部API）
global.fetch = vi.fn();

// 3. SecureStorage モック
vi.mock("@/main/services/secureStorage", () => ({
  SecureStorage: {
    getApiKey: vi.fn(),
    setApiKey: vi.fn(),
  },
}));

// 4. ipcMain モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));
```

### 3.3 MSW設定（外部API）

```typescript
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  // OpenAI
  http.post("https://api.openai.com/v1/chat/completions", () => {
    return HttpResponse.json({
      choices: [{ message: { content: "Mock response" } }],
    });
  }),

  // Anthropic
  http.post("https://api.anthropic.com/v1/messages", () => {
    return HttpResponse.json({
      content: [{ text: "Mock response" }],
    });
  }),

  // Google AI
  http.post("https://generativelanguage.googleapis.com/*", () => {
    return HttpResponse.json({
      candidates: [{ content: { parts: [{ text: "Mock response" }] } }],
    });
  }),
];

export const server = setupServer(...handlers);
```

---

## 4. テストカバレッジ目標

### 4.1 ユニットテスト

| 指標              | 目標 | 最低基準 |
| ----------------- | ---- | -------- |
| Line Coverage     | 90%  | 80%      |
| Branch Coverage   | 70%  | 60%      |
| Function Coverage | 90%  | 80%      |

### 4.2 結合テスト

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%  |

---

## 5. テストファイル構成

```
apps/desktop/src/
├── renderer/
│   └── components/
│       └── llm/
│           └── __tests__/
│               ├── ProviderSelector.test.tsx
│               ├── ModelSelector.test.tsx
│               ├── HealthIndicator.test.tsx
│               └── LLMSelectorPanel.test.tsx
├── main/
│   ├── handlers/
│   │   └── __tests__/
│   │       └── llm.test.ts
│   └── adapters/
│       └── llm/
│           └── __tests__/
│               ├── OpenAIAdapter.test.ts
│               ├── AnthropicAdapter.test.ts
│               ├── GoogleAdapter.test.ts
│               ├── xAIAdapter.test.ts
│               └── LLMAdapterFactory.test.ts
└── __tests__/
    └── integration/
        ├── llm.integration.test.ts
        ├── llm.flow.test.ts
        ├── llm.error.test.ts
        ├── llm.auth.test.ts
        └── llm.sync.test.ts
```

---

## 6. 境界値テスト

### 6.1 入力境界値

| パラメータ      | 境界値                 | テストケース           |
| --------------- | ---------------------- | ---------------------- |
| messages.length | 0, 1, MAX              | 空配列、1件、上限      |
| content.length  | 0, 1, MAX_TOKEN_LENGTH | 空文字、1文字、最大長  |
| temperature     | 0.0, 1.0, 2.0          | 最小、デフォルト、最大 |
| maxTokens       | 1, DEFAULT, MAX        | 最小、デフォルト、最大 |

### 6.2 出力境界値

| パラメータ   | 境界値               | テストケース               |
| ------------ | -------------------- | -------------------------- |
| latency      | 0, TIMEOUT_THRESHOLD | 即時応答、タイムアウト境界 |
| retryAfterMs | 0, MAX_RETRY_DELAY   | 即時リトライ、最大待機     |

---

## 7. Red状態の確認方法

```bash
# テスト実行（全て失敗することを確認）
pnpm --filter @repo/desktop test:run

# 期待される結果
# FAIL  apps/desktop/src/renderer/components/llm/__tests__/ProviderSelector.test.tsx
# FAIL  apps/desktop/src/renderer/components/llm/__tests__/ModelSelector.test.tsx
# FAIL  apps/desktop/src/renderer/components/llm/__tests__/HealthIndicator.test.tsx
# FAIL  apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx
# FAIL  apps/desktop/src/main/handlers/__tests__/llm.test.ts
# FAIL  apps/desktop/src/main/adapters/llm/__tests__/OpenAIAdapter.test.ts
# ...
```

---

## 8. 受け入れ基準との対応

| AC ID          | テストファイル            | テストケースID         |
| -------------- | ------------------------- | ---------------------- |
| AC-UI-001      | ProviderSelector.test.tsx | UI-001, UI-002         |
| AC-UI-002      | ModelSelector.test.tsx    | UI-003, UI-004         |
| AC-UI-003      | HealthIndicator.test.tsx  | UI-005, UI-006, UI-007 |
| AC-UI-004      | LLMSelectorPanel.test.tsx | UI-008                 |
| AC-IPC-001     | llm.test.ts               | IPC-001                |
| AC-IPC-002     | llm.test.ts               | IPC-002                |
| AC-IPC-003     | llm.test.ts               | IPC-003                |
| AC-IPC-004     | llm.test.ts               | IPC-004                |
| AC-ADAPTER-001 | OpenAIAdapter.test.ts     | ADP-001, ADP-002       |
| AC-ADAPTER-002 | AnthropicAdapter.test.ts  | ADP-003, ADP-004       |
| AC-ADAPTER-003 | GoogleAdapter.test.ts     | ADP-005                |
| AC-ADAPTER-004 | xAIAdapter.test.ts        | ADP-006                |
| AC-ADAPTER-005 | LLMAdapterFactory.test.ts | ADP-007                |

---

## 9. 使用スキル記録

| スキル                  | 適用箇所                           | 結果 |
| ----------------------- | ---------------------------------- | ---- |
| tdd-principles          | テスト先行設計、Red-Green-Refactor | 成功 |
| frontend-testing        | Reactコンポーネントテスト設計      | 成功 |
| integration-testing     | IPC/アダプター統合テスト設計       | 成功 |
| test-doubles            | モック/スタブ設計                  | 成功 |
| boundary-value-analysis | 境界値テストケース導出             | 成功 |
