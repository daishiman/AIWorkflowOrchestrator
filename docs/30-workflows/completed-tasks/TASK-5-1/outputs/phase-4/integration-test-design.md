# Phase 4: 統合テスト設計書

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase      | 4                        |
| タスクID   | TASK-5-1                 |
| タスク名   | SkillAPI 実装（Preload） |
| 作成日     | 2026-01-27               |
| ステータス | 完了                     |

---

## 1. 統合テスト概要

### 1.1 テスト範囲

```
┌────────────────────────────────────────────────────────────┐
│                    統合テスト範囲                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Preload Script (TASK-5-1)               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │  │
│  │  │ skill-api  │  │ channels   │  │ index.ts       │ │  │
│  │  │ .ts        │──│ .ts        │──│ (expose)       │ │  │
│  │  └─────┬──────┘  └────────────┘  └────────────────┘ │  │
│  └────────┼────────────────────────────────────────────┘  │
│           │                                                │
│           │ IPC (mocked)                                   │
│           ▼                                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Main Process (TASK-4-2)                 │  │
│  │              ※ 統合テストではモック                   │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 1.2 テスト対象フロー

| フローID | フロー名                 | 方向      | 関連チャネル              |
| -------- | ------------------------ | --------- | ------------------------- |
| FLOW-1   | スキル実行フロー         | R → M     | skill:execute             |
| FLOW-2   | ストリーミング受信フロー | M → R     | skill:stream              |
| FLOW-3   | 実行中断フロー           | R → M     | skill:abort               |
| FLOW-4   | 実行状態取得フロー       | R → M     | skill:get-status          |
| FLOW-5   | 権限確認リクエストフロー | M → R     | skill:permission:request  |
| FLOW-6   | 権限確認応答フロー       | R → M     | skill:permission:response |
| FLOW-7   | 完全な権限フロー         | M → R → M | request → response        |

---

## 2. 統合テストシナリオ

### 2.1 FLOW-1: スキル実行フロー

```
Renderer              Preload               IPC Mock
   │                     │                     │
   │ execute(request)    │                     │
   │────────────────────>│                     │
   │                     │ safeInvoke          │
   │                     │ ("skill:execute")   │
   │                     │────────────────────>│
   │                     │                     │
   │                     │<────────────────────│
   │<────────────────────│ response            │
   │ {executionId}       │                     │
```

#### テストケース

| ID      | シナリオ               | 検証内容                              |
| ------- | ---------------------- | ------------------------------------- |
| INT-1-1 | 正常実行リクエスト     | safeInvoke が正しいチャネルで呼ばれる |
| INT-1-2 | レスポンス型検証       | SkillExecutionResponse 型で返る       |
| INT-1-3 | エラー時のハンドリング | Promise.reject が正しく伝播           |

### 2.2 FLOW-2: ストリーミング受信フロー

```
Main (Mock)           Preload               Renderer
   │                     │                     │
   │ skill:stream        │                     │
   │ emit(message)       │                     │
   │────────────────────>│                     │
   │                     │ callback(message)   │
   │                     │────────────────────>│
   │                     │                     │
```

#### テストケース

| ID      | シナリオ           | 検証内容                          |
| ------- | ------------------ | --------------------------------- |
| INT-2-1 | 単一メッセージ受信 | コールバックが呼ばれる            |
| INT-2-2 | 連続メッセージ受信 | 全メッセージが順序通り届く        |
| INT-2-3 | 購読解除後の無視   | cleanup後はコールバック呼ばれない |

### 2.3 FLOW-3: 実行中断フロー

```
Renderer              Preload               IPC Mock
   │                     │                     │
   │ abort(executionId)  │                     │
   │────────────────────>│                     │
   │                     │ safeInvoke          │
   │                     │ ("skill:abort")     │
   │                     │────────────────────>│
   │                     │                     │
   │                     │<────────────────────│
   │<────────────────────│ boolean             │
   │ true/false          │                     │
```

#### テストケース

| ID      | シナリオ         | 検証内容     |
| ------- | ---------------- | ------------ |
| INT-3-1 | 正常中断         | true が返る  |
| INT-3-2 | 存在しないID中断 | false が返る |

### 2.4 FLOW-7: 完全な権限フロー

```
Main (Mock)           Preload               Renderer
   │                     │                     │
   │ skill:permission    │                     │
   │ :request            │                     │
   │────────────────────>│                     │
   │                     │ onPermission        │
   │                     │ Request(callback)   │
   │                     │────────────────────>│
   │                     │                     │ User Action
   │                     │                     │
   │                     │<────────────────────│
   │                     │ sendPermission      │
   │<────────────────────│ Response(response)  │
   │ skill:permission    │                     │
   │ :response           │                     │
```

#### テストケース

| ID      | シナリオ           | 検証内容                     |
| ------- | ------------------ | ---------------------------- |
| INT-7-1 | 承認フロー完遂     | request → approve → response |
| INT-7-2 | 拒否フロー完遂     | request → deny → response    |
| INT-7-3 | 同時複数リクエスト | 各リクエストが独立処理される |

---

## 3. モック設計詳細

### 3.1 IPC Mock 構成

```typescript
// テストセットアップ
import { vi } from "vitest";

// ipcRenderer モック
const mockIpcRenderer = {
  invoke: vi.fn(),
  on: vi.fn((channel: string, listener: Function) => {
    // リスナー登録を追跡
    listeners.set(channel, listener);
  }),
  removeListener: vi.fn((channel: string, listener: Function) => {
    listeners.delete(channel);
  }),
};

vi.mock("electron", () => ({
  ipcRenderer: mockIpcRenderer,
}));

// イベント発火ヘルパー
function emitFromMain(channel: string, data: unknown) {
  const listener = listeners.get(channel);
  if (listener) {
    listener({}, data); // IpcRendererEvent, data
  }
}
```

### 3.2 テストヘルパー

```typescript
// 標準的なテストリクエスト
const createExecutionRequest = (overrides = {}) => ({
  skillName: "test-skill",
  input: { prompt: "Test prompt" },
  options: { timeout: 30000 },
  ...overrides,
});

// 標準的なストリームメッセージ
const createStreamMessage = (overrides = {}) => ({
  executionId: "exec-test-001",
  type: "text",
  content: "Test content",
  timestamp: Date.now(),
  ...overrides,
});

// 標準的な権限リクエスト
const createPermissionRequest = (overrides = {}) => ({
  executionId: "exec-test-001",
  requestId: "req-test-001",
  toolName: "Bash",
  args: { command: "echo test" },
  reason: "Execute command",
  ...overrides,
});
```

---

## 4. データフロー検証

### 4.1 型契約検証

| 境界           | 入力型                  | 出力型                 | 検証方法             |
| -------------- | ----------------------- | ---------------------- | -------------------- |
| execute        | SkillExecutionRequest   | SkillExecutionResponse | TypeScript型チェック |
| onStream       | callback                | () => void             | 関数型検証           |
| abort          | string                  | boolean                | typeof検証           |
| getStatus      | string                  | ExecutionInfo \| null  | 構造検証             |
| onPermission   | callback                | () => void             | 関数型検証           |
| sendPermission | SkillPermissionResponse | { success: boolean }   | 構造検証             |

### 4.2 チャネル検証

```typescript
describe("IPC Channel Contracts", () => {
  it("execute uses correct channel", async () => {
    await skillAPI.execute(request);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
      "skill:execute",
      expect.any(Object),
    );
  });

  it("onStream registers on correct channel", () => {
    skillAPI.onStream(callback);
    expect(ipcRenderer.on).toHaveBeenCalledWith(
      "skill:stream",
      expect.any(Function),
    );
  });

  // ... 他のチャネルも同様
});
```

---

## 5. エラーシナリオ

### 5.1 IPC エラー

| エラーシナリオ | 発生条件                 | 期待動作                        |
| -------------- | ------------------------ | ------------------------------- |
| タイムアウト   | invoke が応答しない      | Promise.reject(TimeoutError)    |
| 接続拒否       | Main Process 未起動      | Promise.reject(ConnectionError) |
| チャネル不許可 | ホワイトリスト外チャネル | Promise.reject(ChannelError)    |

### 5.2 エラーハンドリングテスト

```typescript
describe("Error Handling", () => {
  it("should reject on IPC timeout", async () => {
    mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC timeout"));

    await expect(skillAPI.execute(request)).rejects.toThrow("IPC timeout");
  });

  it("should reject on channel not allowed", async () => {
    // safeInvoke の内部実装テスト
    await expect(safeInvoke("invalid:channel", {})).rejects.toThrow(
      "is not allowed",
    );
  });
});
```

---

## 6. テスト実行計画

### 6.1 実行順序

1. チャネル定義テスト（channels.ts）
2. safeInvoke/safeOn 単体テスト
3. 各APIメソッド単体テスト
4. 統合フローテスト

### 6.2 実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- skill-api

# 統合テストのみ
pnpm --filter @repo/desktop test -- skill-api.integration

# カバレッジ付き
pnpm --filter @repo/desktop test -- skill-api --coverage
```

---

## 7. 既存テストとの整合性

### 7.1 既存テストファイル

| ファイル                        | 行数 | 統合テスト要素                 |
| ------------------------------- | ---- | ------------------------------ |
| `skill-api.test.ts`             | 624  | IPC Integration Simulation含む |
| `skill-api.permission.test.ts`  | 783  | Permission Flow Simulation含む |
| `channels.skill-import.test.ts` | 408  | Channel Definition Tests       |

### 7.2 追加不要な統合テスト

既存テストが包括的であるため、以下の統合テストは追加不要:

- [x] スキル実行フロー（INT-1-x）→ skill-api.test.ts で実装済み
- [x] ストリーミングフロー（INT-2-x）→ skill-api.test.ts で実装済み
- [x] 権限フロー（INT-7-x）→ skill-api.permission.test.ts で実装済み

---

## 8. 完了条件

| 条件                                         | 状態    |
| -------------------------------------------- | ------- |
| 全フローの統合テストシナリオが定義されている | ✅ 完了 |
| モック設計が文書化されている                 | ✅ 完了 |
| データフロー検証項目が特定されている         | ✅ 完了 |
| エラーシナリオが網羅されている               | ✅ 完了 |
| 既存テストとの整合性が確認されている         | ✅ 完了 |

---

## 9. 次のステップ

Phase 5: 実装（TDD: Green）へ進行

- 既存実装のテスト実行
- Green 状態の確認
