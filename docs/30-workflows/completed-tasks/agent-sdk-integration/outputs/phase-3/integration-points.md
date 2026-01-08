# Agent SDK統合 統合ポイント定義書

> Phase 3 成果物
> 作成日: 2026-01-08
> スキル: integration-patterns, tdd-principles

---

## 1. 概要

本ドキュメントは、Agent SDK統合における統合テストの観点から、主要な統合ポイントとテスト戦略を定義する。

### 1.1 統合テストの目的

| 目的                 | 説明                                              |
| -------------------- | ------------------------------------------------- |
| 境界検証             | モジュール間の通信が正しく行われることを確認      |
| コントラクト検証     | API契約（型、バリデーション）が守られることを確認 |
| エンドツーエンド確認 | ユーザーシナリオが正しく動作することを確認        |

---

## 2. 統合ポイント一覧

### 2.1 レイヤー間統合ポイント

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Integration Points                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [IP-1] React Component ←→ useAgent Hook                           │
│         └── Hookの戻り値とコールバックの動作                        │
│                                                                     │
│  [IP-2] useAgent Hook ←→ Preload API                               │
│         └── window.agentAPIの呼び出しとエラーハンドリング           │
│                                                                     │
│  [IP-3] Preload API ←→ IPC Handler                                 │
│         └── IPC通信のシリアライズ/デシリアライズ                    │
│                                                                     │
│  [IP-4] IPC Handler ←→ AgentClient                                 │
│         └── バリデーションとビジネスロジック委譲                    │
│                                                                     │
│  [IP-5] AgentClient ←→ SessionManager                              │
│         └── セッション操作とコンテキスト管理                        │
│                                                                     │
│  [IP-6] AgentClient ←→ Claude Agent SDK                            │
│         └── SDK APIの呼び出しとストリーミング処理                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 統合ポイント詳細

### 3.1 IP-1: React Component ←→ useAgent Hook

**統合対象**:

- `apps/desktop/src/renderer/components/*`
- `apps/desktop/src/renderer/hooks/useAgent.ts`

**テスト観点**:

| ID      | 観点                        | 期待結果                                   |
| ------- | --------------------------- | ------------------------------------------ |
| IP-1-01 | query()呼び出し時の状態変化 | isLoading: true → messages更新 → false     |
| IP-1-02 | abort()呼び出し時の状態変化 | isLoading: false, error: AgentAbortedError |
| IP-1-03 | メッセージ受信時のUI更新    | messages配列にリアルタイム追加             |
| IP-1-04 | エラー発生時のerror状態     | error stateが正しく設定される              |
| IP-1-05 | clearMessages()の動作       | messages配列がクリアされる                 |
| IP-1-06 | resetSession()の動作        | 新しいsessionIdが発行される                |

**テストパターン**:

```typescript
// IP-1統合テスト例
describe("IP-1: React Component ←→ useAgent Hook", () => {
  it("should update isLoading during query execution", async () => {
    const { result } = renderHook(() => useAgent());

    // 初期状態
    expect(result.current.isLoading).toBe(false);

    // クエリ開始
    const queryPromise = act(() => result.current.query("Hello"));
    expect(result.current.isLoading).toBe(true);

    // 完了
    await queryPromise;
    expect(result.current.isLoading).toBe(false);
  });
});
```

---

### 3.2 IP-2: useAgent Hook ←→ Preload API

**統合対象**:

- `apps/desktop/src/renderer/hooks/useAgent.ts`
- `apps/desktop/src/preload/agent-api.ts`

**テスト観点**:

| ID      | 観点                      | 期待結果                                 |
| ------- | ------------------------- | ---------------------------------------- |
| IP-2-01 | window.agentAPIの存在確認 | 全メソッドがアクセス可能                 |
| IP-2-02 | query()のPromise解決      | 正常終了時にresolve                      |
| IP-2-03 | query()のPromise拒否      | エラー時にreject + 正しいエラー型        |
| IP-2-04 | onMessage()のコールバック | ストリーミングメッセージを正しく受信     |
| IP-2-05 | unsubscribe()の動作       | リスナー解除後はコールバックが呼ばれない |

**モック戦略**:

```typescript
// Preload API モック
const mockAgentAPI: AgentAPI = {
  query: vi.fn().mockResolvedValue(undefined),
  abort: vi.fn(),
  getStatus: vi
    .fn()
    .mockResolvedValue({ status: "initialized", timestamp: Date.now() }),
  createSession: vi.fn().mockResolvedValue("session-123"),
  resumeSession: vi.fn().mockResolvedValue(undefined),
  destroySession: vi.fn().mockResolvedValue(undefined),
  onMessage: vi.fn().mockReturnValue(() => {}),
};

// グローバル設定
vi.stubGlobal("agentAPI", mockAgentAPI);
```

---

### 3.3 IP-3: Preload API ←→ IPC Handler

**統合対象**:

- `apps/desktop/src/preload/agent-api.ts`
- `apps/desktop/src/main/agent/agent-handler.ts`

**テスト観点**:

| ID      | 観点                     | 期待結果                                  |
| ------- | ------------------------ | ----------------------------------------- |
| IP-3-01 | agent:query IPCの往復    | リクエスト/レスポンスが正しくシリアライズ |
| IP-3-02 | agent:message IPCの受信  | Main→Rendererのメッセージが正しく到達     |
| IP-3-03 | エラーのシリアライズ     | AgentErrorが正しくデシリアライズされる    |
| IP-3-04 | agent:abort の一方向通信 | Main Processで正しくキャンセル処理        |
| IP-3-05 | チャネル定数の一致       | 両側で同じチャネル名を使用                |

**IPC統合テスト**:

```typescript
// Electron IPC モック
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
}));

describe("IP-3: IPC Communication", () => {
  it("should serialize error across IPC boundary", async () => {
    const error = new AgentValidationError("Invalid prompt");
    const serialized = error.toJSON();
    const deserialized = deserializeAgentError(serialized);

    expect(deserialized).toBeInstanceOf(AgentValidationError);
    expect(deserialized.message).toBe("Invalid prompt");
  });
});
```

---

### 3.4 IP-4: IPC Handler ←→ AgentClient

**統合対象**:

- `apps/desktop/src/main/agent/agent-handler.ts`
- `packages/shared/src/agent/agent-client.ts`

**テスト観点**:

| ID      | 観点                         | 期待結果                                  |
| ------- | ---------------------------- | ----------------------------------------- |
| IP-4-01 | バリデーション成功時の委譲   | AgentClient.query()が呼び出される         |
| IP-4-02 | バリデーション失敗時の拒否   | ValidationErrorがスローされる             |
| IP-4-03 | ストリーミングメッセージ転送 | onMessageコールバック経由でIPCに転送      |
| IP-4-04 | abort()のAbortController連携 | 実行中クエリがキャンセルされる            |
| IP-4-05 | 初期化状態の確認             | NOT_INITIALIZEDエラーの適切なハンドリング |

**テストパターン**:

```typescript
describe("IP-4: Handler → AgentClient", () => {
  let mockClient: AgentClient;
  let handler: ReturnType<typeof registerAgentHandlers>;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
      abort: vi.fn(),
      getStatus: vi.fn(),
    } as unknown as AgentClient;
  });

  it("should delegate valid query to AgentClient", async () => {
    const request = { prompt: "Hello", options: { timeout: 30000 } };
    await handler.handleQuery(request);

    expect(mockClient.query).toHaveBeenCalledWith(
      "Hello",
      { timeout: 30000 },
      expect.any(Function),
    );
  });
});
```

---

### 3.5 IP-5: AgentClient ←→ SessionManager

**統合対象**:

- `packages/shared/src/agent/agent-client.ts`
- `packages/shared/src/agent/session-manager.ts`

**テスト観点**:

| ID      | 観点                       | 期待結果                                 |
| ------- | -------------------------- | ---------------------------------------- |
| IP-5-01 | セッション作成             | UUID v4形式のIDが返される                |
| IP-5-02 | セッションコンテキスト取得 | 既存セッションのコンテキストが復元される |
| IP-5-03 | セッション不存在エラー     | SESSION_NOT_FOUNDエラーがスローされる    |
| IP-5-04 | セッション破棄             | 破棄後の再開がエラーになる               |
| IP-5-05 | セッション最大数制限       | 10個超過時に最古セッションが自動破棄     |

**テストパターン**:

```typescript
describe("IP-5: AgentClient → SessionManager", () => {
  it("should create and resume session correctly", () => {
    const sessionManager = new SessionManager();

    // 作成
    const sessionId = sessionManager.createSession();
    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/);

    // 再開
    const session = sessionManager.resumeSession(sessionId);
    expect(session.id).toBe(sessionId);
    expect(session.context).toBeDefined();
  });

  it("should throw error for non-existent session", () => {
    const sessionManager = new SessionManager();

    expect(() => sessionManager.resumeSession("non-existent")).toThrow(
      AgentSessionError,
    );
  });
});
```

---

### 3.6 IP-6: AgentClient ←→ Claude Agent SDK

**統合対象**:

- `packages/shared/src/agent/agent-client.ts`
- `@anthropic-ai/claude-agent-sdk`

**テスト観点**:

| ID      | 観点                        | 期待結果                               |
| ------- | --------------------------- | -------------------------------------- |
| IP-6-01 | query()のストリーミング処理 | 各メッセージタイプが正しく変換される   |
| IP-6-02 | タイムアウト処理            | 指定時間後にAbortSignalが発火          |
| IP-6-03 | エラーのラッピング          | SDKエラーがAgentErrorに変換される      |
| IP-6-04 | AbortControllerの連携       | abort()でSDKのクエリがキャンセルされる |
| IP-6-05 | ツール使用メッセージの処理  | tool_use/tool_resultが正しく転送される |

**SDKモック戦略**:

```typescript
// SDK モック
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn().mockImplementation(async function* (prompt, options) {
    yield { type: "text", content: "Hello" };
    yield { type: "text", content: " World" };
    yield { type: "complete" };
  }),
}));

describe("IP-6: AgentClient → SDK", () => {
  it("should handle streaming messages", async () => {
    const client = new AgentClient({ apiKey: "test-key" });
    const messages: SDKMessage[] = [];

    await client.query("Hello", {}, (msg) => messages.push(msg));

    expect(messages).toHaveLength(3);
    expect(messages[0].type).toBe("text");
    expect(messages[2].isComplete).toBe(true);
  });
});
```

---

## 4. 統合テスト戦略

### 4.1 テストピラミッド

```
                    ┌───────────┐
                    │   E2E     │  ← 少数（5-10件）
                   ─┴───────────┴─
                  ┌───────────────┐
                  │  Integration  │  ← 中程度（30-50件）
                 ─┴───────────────┴─
               ┌───────────────────┐
               │       Unit        │  ← 多数（100+件）
              ─┴───────────────────┴─
```

### 4.2 カバレッジ目標

| テスト種別  | 目標      | 対象             |
| ----------- | --------- | ---------------- |
| Unit        | 80%+ Line | 個別モジュール   |
| Integration | 60%+ Line | 統合ポイント     |
| E2E         | Critical  | ユーザーシナリオ |

### 4.3 テストダブル使用方針

| 統合ポイント | テストダブル      | 理由                             |
| ------------ | ----------------- | -------------------------------- |
| IP-1         | Fake (renderHook) | React Hookのテストユーティリティ |
| IP-2         | Mock (vi.mock)    | window.agentAPIのモック          |
| IP-3         | Mock (vi.mock)    | Electron IPCのモック             |
| IP-4         | Spy (vi.spyOn)    | AgentClientの呼び出し検証        |
| IP-5         | Real              | 純粋なビジネスロジック           |
| IP-6         | Mock (vi.mock)    | 外部SDK依存の排除                |

---

## 5. 統合テストシナリオ

### 5.1 正常系シナリオ

| ID    | シナリオ                     | 対象IP       |
| ----- | ---------------------------- | ------------ |
| SC-01 | クエリ実行〜完了             | IP-1,2,3,4,6 |
| SC-02 | セッション作成〜クエリ〜破棄 | IP-1,2,3,4,5 |
| SC-03 | 連続クエリ実行               | IP-1,2,3,4,6 |
| SC-04 | ストリーミングメッセージ受信 | IP-1,2,3,6   |

### 5.2 異常系シナリオ

| ID    | シナリオ               | 対象IP       |
| ----- | ---------------------- | ------------ |
| SC-05 | バリデーションエラー   | IP-2,3,4     |
| SC-06 | タイムアウト           | IP-1,2,3,4,6 |
| SC-07 | ユーザーキャンセル     | IP-1,2,3,4,6 |
| SC-08 | セッション不存在エラー | IP-2,3,4,5   |
| SC-09 | SDK初期化失敗          | IP-4,6       |
| SC-10 | ネットワークエラー     | IP-4,6       |

---

## 6. テスト実装優先順位

### 6.1 Phase 4（TDD Red）優先順位

| 優先度 | 統合ポイント | 理由                               |
| ------ | ------------ | ---------------------------------- |
| 1      | IP-5         | 純粋ロジック、外部依存なし         |
| 2      | IP-4         | バリデーション、エラーハンドリング |
| 3      | IP-6         | SDKモック、コア機能                |
| 4      | IP-3         | IPC通信、シリアライズ              |
| 5      | IP-2         | Preload API                        |
| 6      | IP-1         | React Hook、UI連携                 |

### 6.2 テストファイル構成

```
packages/shared/src/agent/__tests__/
├── agent-client.test.ts         # IP-4, IP-6
├── session-manager.test.ts      # IP-5
├── validation.test.ts           # Unit
└── errors.test.ts               # Unit

apps/desktop/src/main/agent/__tests__/
├── agent-handler.test.ts        # IP-3, IP-4
└── agent-initializer.test.ts    # IP-6

apps/desktop/src/preload/__tests__/
└── agent-api.test.ts            # IP-2, IP-3

apps/desktop/src/renderer/hooks/__tests__/
└── useAgent.test.ts             # IP-1, IP-2
```

---

## 7. 統合テスト環境

### 7.1 モック環境設定

```typescript
// vitest.setup.ts
import { vi } from "vitest";

// Electron モック
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// SDK モック
vi.mock("@anthropic-ai/claude-agent-sdk");
```

### 7.2 テストユーティリティ

```typescript
// test-utils/agent.ts
export function createMockSDKMessage(
  overrides?: Partial<SDKMessage>,
): SDKMessage {
  return {
    id: crypto.randomUUID(),
    type: "text",
    content: "Test message",
    timestamp: Date.now(),
    isComplete: false,
    ...overrides,
  };
}

export function createMockAgentClient(): AgentClient {
  return {
    query: vi.fn(),
    abort: vi.fn(),
    getStatus: vi.fn().mockReturnValue({
      status: "initialized",
      timestamp: Date.now(),
    }),
    dispose: vi.fn(),
  } as unknown as AgentClient;
}
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
