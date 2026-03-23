# Phase 4: モック戦略

## メタ情報

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001  |
| Phase    | 4                                                      |
| 作成日   | 2026-03-23                                             |
| 前提     | Phase 2 contract-matrix.md、test-matrix.md（本 Phase） |

## 1. モック境界の設計原則

設計タスクであるため、本文書は「将来の実装タスク（UT-SLIDE-IMPL-001 等）がモックを設計する際の境界定義」として機能する。

### 境界定義の3原則

1. **IPC 境界**: Main ↔ Preload ↔ Renderer の境界でモックを切る
2. **Lane 境界**: integrated / manual の判定点（skill-executor.ts）でモックを切る
3. **外部依存境界**: agent-client.ts（Anthropic SDK）/ keychain / env の取得点でモックを切る

## 2. agent-client.ts のモック方針

### モック対象の特定

agent-client.ts は Anthropic SDK への direct SDK path を持つ legacy ファイル。
テストでは Anthropic SDK への実通信を行わず、応答を差し替える。

### モック設計

```typescript
// __mocks__/agent-client.ts
export const mockAgentClient = {
  runSlideSync: vi.fn(),
  getCapability: vi.fn(),
};

vi.mock("@/main/integrations/agent-client", () => ({
  AgentClient: vi.fn().mockImplementation(() => mockAgentClient),
}));
```

### 各テストでの初期化（beforeEach）

```typescript
beforeEach(() => {
  mockAgentClient.runSlideSync.mockReset();
  mockAgentClient.getCapability.mockReset();

  // デフォルト応答: integrated lane の正常応答
  mockAgentClient.runSlideSync.mockResolvedValue({
    success: true,
    changes: [],
  } satisfies ModifierResponse);

  mockAgentClient.getCapability.mockResolvedValue({
    lane: "integrated",
    apiKeySource: "safeStorage",
    uiStatus: "synced",
    blockedReason: undefined,
  } satisfies SlideCapabilityDTO);
});
```

### デグレードケースのモック例（V10-T04 対応）

```typescript
// env fallback 時のモック
mockAgentClient.getCapability.mockResolvedValue({
  lane: "integrated",
  apiKeySource: "env",
  uiStatus: "running",
  blockedReason: undefined,
});
// 警告ログが出力されることを検証
expect(mockLogger.warn).toHaveBeenCalledWith(
  expect.stringContaining("apiKeySource:env"),
);
```

## 3. skill-executor.ts の lane 分岐テスト

### モック対象の特定

skill-executor.ts の lane 分岐は `isIntegratedLane()` 相当の判定関数で制御される。
この関数をスパイし、integrated / manual の各パスを独立してテストする。

### モック設計（unit テスト用）

```typescript
// skill-executor.ts の lane 判定をスパイ
const mockIsIntegratedLane = vi.spyOn(skillExecutor, "isIntegratedLane");

// integrated lane のテスト
mockIsIntegratedLane.mockReturnValue(true);
await skillExecutor.executeSlideSync(payload);
expect(mockAgentClient.runSlideSync).toHaveBeenCalledOnce();
expect(mockManualFallback.execute).not.toHaveBeenCalled();

// manual lane のテスト（V11-T01 対応: auto-send 禁止）
mockIsIntegratedLane.mockReturnValue(false);
await skillExecutor.executeSlideSync(payload);
expect(mockAgentClient.runSlideSync).not.toHaveBeenCalled();
expect(mockManualFallback.execute).toHaveBeenCalledOnce();
```

### manual lane モックの設計

```typescript
export const mockManualFallback = {
  execute: vi.fn(),
  getStatus: vi.fn().mockReturnValue("synced"),
  // hidden injection がないことを検証するため、
  // 入力加工関数はパススルーとしてモック
  preprocessInput: vi.fn().mockImplementation((input: string) => input),
};
```

### silent retry 禁止の検証（V11-T03 対応）

```typescript
// degraded 状態後に runSlideSync が再呼び出しされないことを検証
mockAgentClient.runSlideSync.mockResolvedValueOnce({
  success: false,
  error: "SDK 通信失敗",
  fallback_reason: "network_error",
  suggested_action: "manual_review",
} satisfies ModifierResponse);

await skillExecutor.executeSlideSync(payload);
// status が degraded に遷移しても、自動リトライしない
expect(mockAgentClient.runSlideSync).toHaveBeenCalledTimes(1);
```

## 4. IPC handler のモック方針

### テストレイヤー別のモック境界

| テストレイヤー | モックする境界                        | モックしない対象                  |
| -------------- | ------------------------------------- | --------------------------------- |
| unit           | IPC handler 全体をモック              | Reducer / Validator のみ実装使用  |
| integration    | agent-client.ts / keychain / env のみ | IPC handler は実装を使用          |
| contract       | IPC handler の呼び出し側全体をモック  | ModifierResponse の型形状のみ検証 |

### integration テスト用の IPC モック（V-10 対応）

integration テストでは `ipcMain.handle` の実際の実装を呼び出す。
外部依存（Anthropic SDK / keychain）のみモックする。

```typescript
// integration テストでのセットアップ
import { ipcMain } from "electron";
import { registerSlideIpcHandlers } from "@/main/handlers/slide-handlers";

// keychain モック
vi.mock("@/main/services/keychain-service", () => ({
  KeychainService: vi.fn().mockImplementation(() => ({
    getApiKey: vi.fn().mockResolvedValue("test-api-key"),
    getApiKeySource: vi.fn().mockResolvedValue("safeStorage"),
  })),
}));

// Anthropic SDK モック（agent-client.ts 経由）
vi.mock("@anthropic-ai/sdk");

beforeAll(() => {
  registerSlideIpcHandlers(mockSlideService, mockMainWindow);
});

afterAll(() => {
  // P5 対策: 二重登録を防ぐため全ハンドラを解除
  ipcMain.removeAllListeners("slide:capability:get");
  ipcMain.removeAllListeners("slide:capability:changed");
});
```

### contextBridge モック（Renderer 側検証用）

SlideCapabilityDTO が contextBridge を通過できることを確認する（V10-T07 対応）:

```typescript
// structured clone の制約検証
// DTO に function や Symbol が含まれていないことを確認
const dto: SlideCapabilityDTO = {
  lane: "integrated",
  apiKeySource: "safeStorage",
  uiStatus: "synced",
  blockedReason: undefined,
};
// structured clone が成功することをアサート（エラーが出ないこと）
expect(() => structuredClone(dto)).not.toThrow();
```

## 5. Store モックの設計（slideSyncStore 等）

### Zustand Store のモック方針（P31 対策）

個別セレクタパターン（P31 解決策）に従い、Store 全体ではなく個別セレクタをモックする。

```typescript
// Store 全体のモック（非推奨）
vi.mock("@/renderer/store/slideSettingsStore");

// 個別セレクタのモック（推奨）
vi.mock("@/renderer/store/slideSettingsStore", () => ({
  useSlideUIStatus: vi.fn().mockReturnValue("synced"),
  useSetSlideUIStatus: vi.fn().mockReturnValue(vi.fn()),
  useSlideCapability: vi.fn().mockReturnValue({
    lane: "integrated",
    apiKeySource: "safeStorage",
    uiStatus: "synced",
    blockedReason: undefined,
  }),
}));
```

### Store 状態のリセット（beforeEach）

```typescript
beforeEach(() => {
  // Zustand Store をリセット（P9 対策: テスト間の状態リーク防止）
  useSlideUIStatusMock.mockReturnValue("synced");
});
```

## 6. モック境界まとめ図

```
[Renderer テスト]
  └── SlideWorkspace.tsx
        │ モック: useSlideUIStatus, useSlideCapability (個別セレクタ)
        └── IPC 呼び出し: window.electronAPI.slide.getCapability → モック

[integration テスト]
  └── IPC Handler（実実装）
        │ モック: KeychainService, AgentClient（Anthropic SDK 手前）
        └── skill-executor.ts（実実装）

[unit テスト]
  ├── slideStatusReducer（モックなし: 純粋関数）
  ├── manualBoundary（モック: skill-executor.isIntegratedLane スパイ）
  └── modifierResponseContract（モック: consumer ファイルの消費関数）
```

## 7. モック命名規約

後続実装タスクで一貫性を保つための命名規約:

| モック対象      | 変数名                | 型                                  |
| --------------- | --------------------- | ----------------------------------- |
| AgentClient     | `mockAgentClient`     | `vi.Mocked<AgentClient>`            |
| KeychainService | `mockKeychainService` | `vi.Mocked<KeychainService>`        |
| SkillExecutor   | `mockSkillExecutor`   | `vi.Mocked<SkillExecutor>`          |
| ManualFallback  | `mockManualFallback`  | `vi.Mocked<ManualFallbackService>`  |
| SlideService    | `mockSlideService`    | `vi.Mocked<SlideService>`           |
| Logger          | `mockLogger`          | `{ warn: vi.fn(), error: vi.fn() }` |
