# Phase 4: テスト作成

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 4                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 2 設計で定義した Wave A / B / C の実装を Red-Green-Refactor サイクルで進めるために、実装前にテストケースを設計・作成する。各テストは対応する受入基準（AC-1〜AC-11）に紐づけてトレーサビリティを確保する。

## 実行タスク

1. Wave A テスト（IPC 接続 + セキュリティ）を作成する
2. Wave B テスト（RuntimeResolver 統合）を作成する
3. Wave C テスト（Store + legacy 廃止）を作成する

## 参照資料

| 資料名        | パス                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| 要件定義      | `docs/30-workflows/slide-runtime-alignment-impl/phase-01-requirements.md`                |
| 設計書        | `docs/30-workflows/slide-runtime-alignment-impl/phase-02-design.md`                      |
| IPC 正本      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`               |
| Security 正本 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`        |
| P42 対策      | `.claude/rules/06-known-pitfalls.md#P42`                                                 |
| P48 対策      | `.claude/rules/06-known-pitfalls.md#P48`                                                 |
| P60 対策      | `.claude/rules/06-known-pitfalls.md#P60`                                                 |
| P63 対策      | `.claude/rules/06-known-pitfalls.md#P63`（インポートパスは既存テストを参照してから記述） |

## 実行手順

---

### Wave A テスト: IPC 接続 + セキュリティ

**テストファイル**: `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`

#### A-1: チャネル定数テスト

```typescript
import { describe, it, expect } from "vitest";
import { SLIDE_INVOKE_CHANNELS, SLIDE_PUSH_CHANNELS } from "../ipc-handlers";

describe("SLIDE_INVOKE_CHANNELS", () => {
  it("should define all 6 invoke channels with canonical names", () => {
    expect(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE).toBe("slide:executePhase");
    expect(SLIDE_INVOKE_CHANNELS.WATCH_START).toBe("slide:watch-start");
    expect(SLIDE_INVOKE_CHANNELS.WATCH_STOP).toBe("slide:watch-stop");
    expect(SLIDE_INVOKE_CHANNELS.SYNC_STATUS).toBe("slide:sync-status");
    expect(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC).toBe("slide:reverse-sync");
    expect(SLIDE_INVOKE_CHANNELS.CANCEL).toBe("slide:cancel");
  });

  it("should NOT contain legacy channel names", () => {
    const values = Object.values(SLIDE_INVOKE_CHANNELS);
    expect(values).not.toContain("slide:startWatching");
    expect(values).not.toContain("slide:stopWatching");
    expect(values).not.toContain("slide:getSyncStatus");
    expect(values).not.toContain("slide:manualSync");
    expect(values).not.toContain("slide:cancelExecution");
  });
});

describe("SLIDE_PUSH_CHANNELS", () => {
  it("should define all 6 push channels", () => {
    expect(SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED).toBe(
      "slide:sync-status-changed",
    );
    expect(SLIDE_PUSH_CHANNELS.SYNC_PROGRESS).toBe("slide:sync-progress");
    expect(SLIDE_PUSH_CHANNELS.SYNC_ERROR).toBe("slide:sync-error");
    expect(SLIDE_PUSH_CHANNELS.EXECUTION_PROGRESS).toBe(
      "slide:execution-progress",
    );
    expect(SLIDE_PUSH_CHANNELS.STRUCTURE_CHANGED).toBe(
      "slide:structureChanged",
    );
    expect(SLIDE_PUSH_CHANNELS.WATCH_STATUS).toBe("slide:watch-status");
  });
});
```

#### A-2: request/response 契約テスト（invoke 6 チャネル）

```typescript
// P60 対策: レスポンス形式は { success, data/error } wrapper を期待
describe("IPC handler response contract", () => {
  describe("slide:executePhase", () => {
    it("should return { success: true, data } on valid input", async () => {
      // ... mockSkillExecutor.execute.mockResolvedValue(mockResult)
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        "outline",
        "/valid/project/path",
      );
      expect(result).toMatchObject({ success: true });
      expect(result.data).toBeDefined();
    });

    it("should return { success: false, error } on business error", async () => {
      // ... mockSkillExecutor.execute.mockRejectedValue(new Error("exec failed"))
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        "outline",
        "/valid/project/path",
      );
      expect(result).toMatchObject({
        success: false,
        error: { code: expect.any(String), message: expect.any(String) },
      });
    });
  });

  describe("slide:watch-start", () => {
    it("should return { success: true } on success", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.WATCH_START,
        "/valid/project/path",
      );
      expect(result).toMatchObject({ success: true });
    });
  });

  describe("slide:watch-stop", () => {
    it("should return { success: true } on success", async () => {
      const result = await invokeHandler(SLIDE_INVOKE_CHANNELS.WATCH_STOP);
      expect(result).toMatchObject({ success: true });
    });
  });

  describe("slide:sync-status", () => {
    it("should return { success: true, data: SyncStatus }", async () => {
      const result = await invokeHandler(SLIDE_INVOKE_CHANNELS.SYNC_STATUS);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("status");
    });
  });

  describe("slide:reverse-sync", () => {
    it("should return { success: true } on valid path", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.REVERSE_SYNC,
        "/valid/project/path",
      );
      expect(result).toMatchObject({ success: true });
    });
  });

  describe("slide:cancel", () => {
    it("should return { success: true } after cancel", async () => {
      const result = await invokeHandler(SLIDE_INVOKE_CHANNELS.CANCEL);
      expect(result).toMatchObject({ success: true });
    });
  });
});
```

#### A-3: validateIpcSender テスト（AC-5 対応）

```typescript
describe("validateIpcSender", () => {
  it("should call validateIpcSender on each invoke handler", () => {
    // getAllowedWindows callback が呼ばれることを検証（P41 対策）
    const mockValidate = vi.mocked(validateIpcSender);

    invokeHandler(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE, "outline", "/path");

    expect(mockValidate).toHaveBeenCalledWith(
      expect.anything(),
      "slide:executePhase",
      expect.objectContaining({
        getAllowedWindows: expect.any(Function),
      }),
    );

    // getAllowedWindows の戻り値を検証（P41: inline arrow function coverage 対策）
    const lastCall = mockValidate.mock.calls[0];
    const getAllowedWindows = lastCall[2].getAllowedWindows;
    expect(getAllowedWindows()).toContain(mockMainWindow);
  });

  it("should reject handler if sender is not allowed window", () => {
    vi.mocked(validateIpcSender).mockImplementationOnce(() => {
      throw new Error("Unauthorized sender");
    });

    // handler は throw せず sanitize して { success: false } を返す
    const result = invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/path",
    );
    return expect(result).resolves.toMatchObject({ success: false });
  });
});
```

#### A-4: P42 3段バリデーションテスト（AC-6 対応）

`phase` および `projectPath` の引数ごとに型チェック・空文字・trim 空文字の3段を検証する。

```typescript
describe("P42 3-stage validation for slide:executePhase", () => {
  const validPath = "/valid/project/path";

  describe("phase argument", () => {
    it("should return VALIDATION_ERROR if phase is not a string", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        123 as unknown as string,
        validPath,
      );
      expect(result).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });
    });

    it("should return VALIDATION_ERROR if phase is empty string", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        "",
        validPath,
      );
      expect(result).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });
    });

    it("should return VALIDATION_ERROR if phase is whitespace only (trim check)", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        "   ",
        validPath,
      );
      expect(result).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });
    });
  });

  describe("projectPath argument", () => {
    it("should return VALIDATION_ERROR if projectPath is not a string", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        "outline",
        null as unknown as string,
      );
      expect(result).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });
    });

    it("should return VALIDATION_ERROR if projectPath is empty string", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        "outline",
        "",
      );
      expect(result).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });
    });

    it("should return VALIDATION_ERROR if projectPath is whitespace only (trim check)", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        "outline",
        "   ",
      );
      expect(result).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });
    });
  });

  // 同様のバリデーションを slide:watch-start / slide:reverse-sync にも適用
  describe("slide:watch-start projectPath validation", () => {
    it("should return VALIDATION_ERROR if projectPath is whitespace only", async () => {
      const result = await invokeHandler(
        SLIDE_INVOKE_CHANNELS.WATCH_START,
        "   ",
      );
      expect(result).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });
    });
  });
});
```

#### A-5: detectPathTraversal テスト（AC-6 対応）

```typescript
describe("detectPathTraversal", () => {
  it("should return SECURITY_ERROR if projectPath contains ../", async () => {
    const result = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/../../../etc/passwd",
    );
    expect(result).toMatchObject({
      success: false,
      error: { code: "SECURITY_ERROR" },
    });
  });

  it("should allow normal absolute paths", async () => {
    const result = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/Users/user/project",
    );
    // バリデーション通過後にビジネスロジックが呼ばれることを確認
    expect(mockSkillExecutor.execute).toHaveBeenCalled();
  });
});
```

---

### Wave B テスト: RuntimeResolver 統合

**テストファイル**: `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`

#### B-1: RuntimeResolver 分岐テスト（AC-3 対応）

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSkillExecutor } from "../skill-executor";
import { RuntimeResolver } from "../../runtime/runtime-resolver";

vi.mock("../../runtime/runtime-resolver");

describe("SkillExecutor RuntimeResolver integration", () => {
  let executor: ReturnType<typeof createSkillExecutor>;

  beforeEach(() => {
    vi.clearAllMocks();
    executor = createSkillExecutor(/* deps */);
  });

  describe("integrated モード", () => {
    it("should call executeIntegrated when RuntimeResolver returns 'integrated'", async () => {
      vi.mocked(RuntimeResolver.resolve).mockResolvedValue("integrated");

      const result = await executor.execute("outline", "/project/path");

      expect(RuntimeResolver.resolve).toHaveBeenCalledWith("slide", "outline");
      expect(result.success).toBe(true);
      expect(result.isHandoff).toBeUndefined();
    });
  });

  describe("handoff モード", () => {
    it("should return HandoffGuidance when RuntimeResolver returns 'handoff'", async () => {
      vi.mocked(RuntimeResolver.resolve).mockResolvedValue("handoff");

      const result = await executor.execute("outline", "/project/path");

      expect(result).toMatchObject({
        success: true,
        isHandoff: true,
        guidance: {
          command: expect.any(String),
          contextSummary: expect.any(String),
          reason: expect.any(String),
        },
      });
    });

    it("should include projectPath in handoff guidance command", async () => {
      vi.mocked(RuntimeResolver.resolve).mockResolvedValue("handoff");

      const result = await executor.execute("outline", "/my/project");

      expect(result.guidance?.command).toContain("/my/project");
    });
  });
});
```

#### B-2: handoff guidance 生成テスト

```typescript
describe("buildHandoffGuidance", () => {
  it("should include phase name in contextSummary", async () => {
    vi.mocked(RuntimeResolver.resolve).mockResolvedValue("handoff");

    const result = await executor.execute("modifier", "/project/path");

    expect(result.guidance?.contextSummary).toContain("modifier");
  });

  it("should include non-empty reason", async () => {
    vi.mocked(RuntimeResolver.resolve).mockResolvedValue("handoff");

    const result = await executor.execute("outline", "/project/path");

    expect(result.guidance?.reason.trim()).not.toBe("");
  });
});
```

#### B-3: modifier phase 統合テスト（AC-4 対応）

```typescript
describe("modifier phase integration", () => {
  it("should call buildModifierPrompt when phase is 'modifier'", async () => {
    vi.mocked(RuntimeResolver.resolve).mockResolvedValue("integrated");
    const mockBuildModifierPrompt = vi.mocked(buildModifierPrompt);

    await executor.execute("modifier", "/project/path");

    expect(mockBuildModifierPrompt).toHaveBeenCalled();
  });

  it("should call parseModifierResponse after runtime completion", async () => {
    vi.mocked(RuntimeResolver.resolve).mockResolvedValue("integrated");
    const mockParseModifierResponse = vi.mocked(parseModifierResponse);

    await executor.execute("modifier", "/project/path");

    expect(mockParseModifierResponse).toHaveBeenCalled();
  });

  it("should NOT call buildModifierPrompt for non-modifier phases", async () => {
    vi.mocked(RuntimeResolver.resolve).mockResolvedValue("integrated");
    const mockBuildModifierPrompt = vi.mocked(buildModifierPrompt);

    await executor.execute("outline", "/project/path");

    expect(mockBuildModifierPrompt).not.toHaveBeenCalled();
  });
});
```

#### B-4: エラーハンドリングテスト

```typescript
describe("error handling", () => {
  it("should return { success: false } when RuntimeResolver throws", async () => {
    vi.mocked(RuntimeResolver.resolve).mockRejectedValue(
      new Error("resolver error"),
    );

    const result = await executor.execute("outline", "/project/path");

    expect(result).toMatchObject({
      success: false,
      error: { code: expect.any(String) },
    });
  });

  it("should NOT expose internal stack trace in error response", async () => {
    vi.mocked(RuntimeResolver.resolve).mockRejectedValue(
      new Error("internal error with /secret/path"),
    );

    const result = await executor.execute("outline", "/project/path");

    // AC-8: エラーサニタイズ確認
    expect(JSON.stringify(result)).not.toContain("/secret/path");
    expect(JSON.stringify(result)).not.toContain("stack");
  });
});
```

---

### Wave C テスト: Store + legacy 廃止

**テストファイル**: `apps/desktop/src/main/slide/__tests__/slide-slice.test.ts`

#### C-1: slideSlice store fields テスト（AC-11 対応）

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createSlideStore } from "../../../renderer/store/slideSlice";

describe("slideSlice store fields", () => {
  let store: ReturnType<typeof createSlideStore>;

  beforeEach(() => {
    store = createSlideStore();
  });

  describe("初期値", () => {
    it("should have syncStatus as initial field", () => {
      expect(store.getState().syncStatus).toBeDefined();
    });

    it("should have isWatching initialized to false", () => {
      expect(store.getState().isWatching).toBe(false);
    });

    it("should have syncDirection initialized", () => {
      expect(store.getState().syncDirection).toBeDefined();
    });

    it("should have syncProgress initialized to null", () => {
      expect(store.getState().syncProgress).toBeNull();
    });

    it("should have syncError initialized to null", () => {
      expect(store.getState().syncError).toBeNull();
    });

    it("should have isHandoff initialized to false", () => {
      expect(store.getState().isHandoff).toBe(false);
    });

    it("should have handoffGuidance initialized to null", () => {
      expect(store.getState().handoffGuidance).toBeNull();
    });
  });

  describe("更新", () => {
    it("should update syncProgress", () => {
      store.getState().setSyncProgress({ percent: 50, message: "processing" });
      expect(store.getState().syncProgress).toEqual({
        percent: 50,
        message: "processing",
      });
    });

    it("should update syncError", () => {
      store.getState().setSyncError({ code: "SYNC_ERROR", message: "failed" });
      expect(store.getState().syncError).toEqual({
        code: "SYNC_ERROR",
        message: "failed",
      });
    });

    it("should update isHandoff and handoffGuidance together", () => {
      const guidance = {
        command: "claude run",
        contextSummary: "outline phase",
        reason: "handoff mode",
      };
      store.getState().setHandoffGuidance(guidance);
      expect(store.getState().isHandoff).toBe(true);
      expect(store.getState().handoffGuidance).toEqual(guidance);
    });

    it("should clear handoffGuidance on clearHandoff", () => {
      store.getState().clearHandoff();
      expect(store.getState().isHandoff).toBe(false);
      expect(store.getState().handoffGuidance).toBeNull();
    });
  });
});
```

#### C-2: selector テスト

```typescript
describe("individual selectors", () => {
  it("useSyncStatus should return syncStatus", () => {
    // selector の戻り値が scalar であることを確認
    const { result } = renderHook(() => useSyncStatus());
    expect(typeof result.current).toBe("string");
  });

  it("useIsHandoff should return isHandoff boolean", () => {
    const { result } = renderHook(() => useIsHandoff());
    expect(typeof result.current).toBe("boolean");
  });
});
```

#### C-3: useShallow 適用テスト（P48 対策）

```typescript
// P48: object を返す selector には useShallow が必要
describe("useShallow selectors for object fields", () => {
  it("useSyncProgress should not cause infinite re-render", () => {
    // renderHook でタイムアウトが発生しないことを確認
    const { result, unmount } = renderHook(() => useSyncProgress());
    expect(result.current).toBeNull();
    // タイムアウトしないこと（P48 infinite loop 防止）
    unmount();
  });

  it("useHandoffGuidance should not cause infinite re-render", () => {
    const { result, unmount } = renderHook(() => useHandoffGuidance());
    expect(result.current).toBeNull();
    unmount();
  });
});
```

---

### テストセットアップ共通

各テストファイルの先頭に以下のセットアップを配置する:

```typescript
// apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts の冒頭

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ipcMain } from "electron";
import type { BrowserWindow } from "electron";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

vi.mock("../../security/ipc-sender-validator", () => ({
  validateIpcSender: vi.fn(),
}));

vi.mock("../../slide/skill-executor");

let mockMainWindow: BrowserWindow;
let registeredHandlers: Map<string, Function>;

beforeEach(() => {
  vi.clearAllMocks();
  registeredHandlers = new Map();
  mockMainWindow = {
    webContents: { send: vi.fn() },
  } as unknown as BrowserWindow;

  // ipcMain.handle の呼び出しを捕捉
  vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
    registeredHandlers.set(channel, handler);
  });

  // registerSlideIpcHandlers を呼び出してハンドラを登録
  registerSlideIpcHandlers(mockMainWindow);
});

afterEach(() => {
  unregisterSlideIpcHandlers();
});

// ヘルパー: ハンドラを直接呼び出す
async function invokeHandler(channel: string, ...args: unknown[]) {
  const handler = registeredHandlers.get(channel);
  if (!handler) throw new Error(`Handler not registered: ${channel}`);
  const mockEvent = {
    sender: mockMainWindow.webContents,
  };
  return handler(mockEvent, ...args);
}
```

---

## 統合テスト連携

| Wave   | テストファイル                     | 受入基準                     |
| ------ | ---------------------------------- | ---------------------------- |
| Wave A | `__tests__/ipc-handlers.test.ts`   | AC-1, AC-2, AC-5, AC-6, AC-8 |
| Wave B | `__tests__/skill-executor.test.ts` | AC-3, AC-4, AC-8             |
| Wave C | `__tests__/slide-slice.test.ts`    | AC-11                        |

## 成果物

| 成果物                | パス                                                           | 説明                                                         |
| --------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| IPC ハンドラテスト    | `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`   | Wave A: 全6 invoke チャネルの契約テスト + セキュリティテスト |
| skill-executor テスト | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts` | Wave B: RuntimeResolver 分岐 + handoff guidance テスト       |
| slideSlice テスト     | `apps/desktop/src/renderer/__tests__/slideSlice.test.ts`       | Wave C: store fields + selector テスト                       |

## 完了条件

- [ ] `ipc-handlers.test.ts` が作成されており、Wave A の全テストが Red 状態（実装前）
- [ ] `skill-executor.test.ts` が作成されており、Wave B の全テストが Red 状態
- [ ] `slide-slice.test.ts` が作成されており、Wave C の全テストが Red 状態
- [ ] `cd apps/desktop && pnpm vitest run src/main/slide/` でテストが全て FAIL（Red 状態）であることを確認
- [ ] テストファイルが Wave A / B / C に対応する構造で整理されている
- [ ] P60 対策: 全レスポンステストが `{ success, data/error }` wrapper 形式を期待している
- [ ] P42 対策: 全文字列引数に型チェック・空文字・trim 空文字の3段テストが含まれている
- [ ] P48 対策: object を返す selector に useShallow 適用の検証が含まれている
- [ ] P63 対策: インポートパスを既存テストファイルから確認した上で記述している

## 次のPhase

Phase 5（実装）へ進む。テストが Red 状態であることを確認してから実装を開始する。
