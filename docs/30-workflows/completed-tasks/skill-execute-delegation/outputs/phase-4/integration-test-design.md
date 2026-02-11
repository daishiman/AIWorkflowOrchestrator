# Phase 4: 統合テスト設計書

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 4                                     |
| 機能名   | skill-execute-delegation              |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日   | 2026-02-11                            |

## 統合テスト対象

### データフロー

```
Renderer (useSkillExecution)
    |
    v (window.electronAPI.skill.execute)
Preload (safeInvoke)
    |
    v (IPC_CHANNELS.SKILL_EXECUTE)
Main Process (skillHandlers.ts)
    |
    v (SkillService.executeSkill)
SkillService
    |
    v (SkillExecutor.execute)
SkillExecutor
    |
    v (SDK query)
Claude SDK
    |
    v (stream messages)
    |
    v (mainWindow.webContents.send)
Renderer (onSkillStream callback)
```

## 統合テストシナリオ

### IT-001: registerSkillHandlers でSkillExecutor注入

```typescript
describe("IT-001: registerSkillHandlers", () => {
  it("should call skillService.setSkillExecutor during registration", () => {
    // Given: BrowserWindow と SkillService
    const mockMainWindow = createMockBrowserWindow();
    const mockSkillService = createMockSkillService();
    const setSkillExecutorSpy = vi.spyOn(mockSkillService, "setSkillExecutor");

    // When: registerSkillHandlers を呼び出す
    registerSkillHandlers(mockMainWindow, mockSkillService);

    // Then: setSkillExecutor が呼ばれる
    expect(setSkillExecutorSpy).toHaveBeenCalledWith(expect.any(SkillExecutor));
  });
});
```

### IT-002: skill:execute経由でSkillExecutor.execute()呼び出し

```typescript
describe("IT-002: skill:execute IPC handler", () => {
  it("should delegate to SkillExecutor.execute via SkillService", async () => {
    // Given: 登録済みハンドラー、インポート済みスキル
    const mockMainWindow = createMockBrowserWindow();
    const mockSkillService = createMockSkillService();
    registerSkillHandlers(mockMainWindow, mockSkillService);

    // When: skill:execute ハンドラーを呼び出す
    const handler = handlers.get(IPC_CHANNELS.SKILL_EXECUTE);
    const result = await handler(
      {},
      {
        skillId: "test-skill",
        params: { prompt: "Test" },
      },
    );

    // Then: SkillExecutionResponse が返される
    expect(result.success).toBe(true);
    expect(result.data.executionId).toBeDefined();
  });
});
```

### IT-003: エラー伝播

```typescript
describe("IT-003: Error propagation", () => {
  it("should propagate AUTHENTICATION_ERROR from SkillExecutor", async () => {
    // Given: API Key未設定
    const mockAuthKeyService = {
      getKey: vi.fn().mockResolvedValue(null),
    };

    // When: executeSkill を呼び出す
    const result = await skillService.executeSkill("test-skill");

    // Then: AUTHENTICATION_ERROR が返される
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("AUTHENTICATION_ERROR");
  });
});
```

## API契約

### Renderer -> IPC

| 項目     | 値                                                                    |
| -------- | --------------------------------------------------------------------- |
| チャネル | `skill:execute` (`IPC_CHANNELS.SKILL_EXECUTE`)                        |
| 引数     | `{ skillId: string, params?: Record<string, unknown> }`               |
| 戻り値   | `{ success: boolean, data?: SkillExecutionResponse, error?: string }` |

### IPC -> SkillService

| 項目     | 値                                                                |
| -------- | ----------------------------------------------------------------- |
| メソッド | `executeSkill(skillId: string, params?: Record<string, unknown>)` |
| 戻り値   | `Promise<SkillExecutionResponse>`                                 |

### SkillService -> SkillExecutor

| 項目     | 値                                                                 |
| -------- | ------------------------------------------------------------------ |
| メソッド | `execute(request: SkillExecutionRequest, metadata: SkillMetadata)` |
| 戻り値   | `Promise<SkillExecutionResponse>`                                  |

## 型定義

### SkillExecutionRequest

```typescript
interface SkillExecutionRequest {
  prompt: string;
  skillId: string;
  timeout?: number;
  sessionId?: string;
  retryConfig?: Partial<RetryConfig>;
}
```

### SkillExecutionResponse

```typescript
interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: SkillExecutionError;
}
```

### SkillMetadata

```typescript
interface SkillMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Array<{
    source: string;
    application: string;
    purpose: string;
  }>;
  allowedTools?: string[];
}
```

## テスト環境

### モック設定

```typescript
// BrowserWindow モック
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
    getURL: vi.fn().mockReturnValue("file://"),
  },
  isDestroyed: vi.fn().mockReturnValue(false),
  id: 1,
};

// SkillService モック
const mockSkillService = {
  setSkillExecutor: vi.fn(),
  executeSkill: vi.fn(),
  getSkillById: vi.fn(),
  importManager: {
    isImported: vi.fn(),
  },
};
```

## 実行コマンド

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test -- --grep "skillHandlers.delegate"
```
