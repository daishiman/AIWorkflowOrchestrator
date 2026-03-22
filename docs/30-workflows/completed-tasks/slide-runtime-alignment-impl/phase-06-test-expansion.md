# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 6                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 4 で作成した基本テストに対し、カバレッジ不足領域を補完するテストケースを追加する。エッジケース・push イベント・エラーサニタイズ・legacy 廃止確認の4領域を対象とする。

Phase 7 のカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たすことを目標とする。

## 実行タスク

1. エッジケーステストを追加する（同時実行・キャンセル中の再実行）
2. push チャネルの event テストを追加する
3. エラーサニタイズテストを追加する
4. agent-client.ts 廃止後の import 残存確認テストを追加する

## 参照資料

| 資料名              | パス                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| 要件定義            | `docs/30-workflows/slide-runtime-alignment-impl/phase-01-requirements.md`         |
| テスト作成 (Phase4) | `docs/30-workflows/slide-runtime-alignment-impl/phase-04-test-creation.md`        |
| 実装 (Phase5)       | `docs/30-workflows/slide-runtime-alignment-impl/phase-05-implementation.md`       |
| Security 正本       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` |
| カバレッジ基準      | `.claude/rules/02-code-quality.md`（Line 80%, Branch 60%, Function 80%）          |

## 実行手順

---

### 1. エッジケーステスト

**対象ファイル**: `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`（追加）

#### 1-1: 同時実行テスト

```typescript
describe("同時実行の制御", () => {
  it("should reject concurrent executePhase calls while executing", async () => {
    // 最初の呼び出しが実行中の状態をシミュレート
    mockSkillExecutor.isExecuting.mockReturnValue(true);

    const result = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    expect(result).toMatchObject({
      success: false,
      error: { code: "CONFLICT_ERROR" },
    });
  });

  it("should allow executePhase call after previous execution completes", async () => {
    // 最初の実行が完了した後の状態
    mockSkillExecutor.isExecuting.mockReturnValue(false);
    mockSkillExecutor.execute.mockResolvedValue({
      success: true,
      phase: "outline",
    });

    const result = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    expect(result.success).toBe(true);
  });
});
```

#### 1-2: キャンセル中の再実行テスト

```typescript
describe("キャンセル中の再実行", () => {
  it("should handle cancel and then re-execute without state corruption", async () => {
    // キャンセルを呼び出す
    const cancelResult = await invokeHandler(SLIDE_INVOKE_CHANNELS.CANCEL);
    expect(cancelResult).toMatchObject({ success: true });

    // キャンセル後に isExecuting が false になる
    mockSkillExecutor.isExecuting.mockReturnValue(false);
    mockSkillExecutor.execute.mockResolvedValue({
      success: true,
      phase: "outline",
    });

    // 再実行が成功する
    const reExecResult = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );
    expect(reExecResult.success).toBe(true);
  });

  it("should return { success: true } even when cancel is called while not executing", async () => {
    mockSkillExecutor.isExecuting.mockReturnValue(false);

    const result = await invokeHandler(SLIDE_INVOKE_CHANNELS.CANCEL);

    // キャンセル対象がなくても正常終了
    expect(result).toMatchObject({ success: true });
  });
});
```

#### 1-3: watch-start / watch-stop の状態遷移テスト

```typescript
describe("watch start/stop 状態遷移", () => {
  it("should return error if watch-start is called while already watching", async () => {
    // 既に watch 中の状態をシミュレート
    mockWatcher.isWatching.mockReturnValue(true);

    const result = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.WATCH_START,
      "/valid/project/path",
    );

    expect(result).toMatchObject({
      success: false,
      error: { code: "CONFLICT_ERROR" },
    });
  });

  it("should return { success: true } on watch-stop even when not watching", async () => {
    mockWatcher.isWatching.mockReturnValue(false);

    const result = await invokeHandler(SLIDE_INVOKE_CHANNELS.WATCH_STOP);

    expect(result).toMatchObject({ success: true });
  });
});
```

---

### 2. push チャネルの event テスト

**対象ファイル**: `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`（追加）

push チャネル（Main → Renderer）は `webContents.send()` の呼び出しを検証する。

#### 2-1: slide:sync-progress イベントテスト

```typescript
describe("push channel: slide:sync-progress", () => {
  it("should emit sync-progress event with percent and message during execution", async () => {
    let progressCallback: ((progress: number, message: string) => void) | null =
      null;

    // onProgress を捕捉
    mockSkillExecutor.onProgress.mockImplementation((cb) => {
      progressCallback = cb;
    });

    // 実行開始（バックグラウンドで進行中）
    const executePromise = invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    // 途中でプログレスイベントを発火
    progressCallback?.(50, "processing outline...");

    // webContents.send が呼ばれたことを確認
    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
      SLIDE_PUSH_CHANNELS.SYNC_PROGRESS,
      expect.objectContaining({
        percent: 50,
        message: "processing outline...",
      }),
    );

    await executePromise;
  });

  it("should NOT expose internal file paths in sync-progress message", () => {
    // progress メッセージに内部パスが含まれていないことを確認
    mockSkillExecutor.onProgress.mockImplementation((cb) => {
      cb(30, "Processing /Users/internal/secret/path/file.md");
    });

    // handlers を呼び出す（progress callback を登録）
    invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    const sendCalls = vi.mocked(mockMainWindow.webContents.send).mock.calls;
    const progressCalls = sendCalls.filter(
      ([channel]) => channel === SLIDE_PUSH_CHANNELS.SYNC_PROGRESS,
    );

    // 内部パスがサニタイズされて送信されること
    for (const [, payload] of progressCalls) {
      expect(JSON.stringify(payload)).not.toMatch(/\/Users\/internal/);
    }
  });
});
```

#### 2-2: slide:sync-error イベントテスト

```typescript
describe("push channel: slide:sync-error", () => {
  it("should emit sync-error event when execution fails mid-process", async () => {
    mockSkillExecutor.execute.mockRejectedValue(
      new Error("sync failed: disk full"),
    );

    await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    // sync-error チャネルへの push を確認
    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
      SLIDE_PUSH_CHANNELS.SYNC_ERROR,
      expect.objectContaining({
        code: expect.any(String),
        message: expect.any(String),
      }),
    );
  });

  it("should NOT include stack trace in sync-error payload", async () => {
    const errorWithStack = new Error("sync error");
    errorWithStack.stack =
      "Error: sync error\n  at sensitiveFunction (/internal/path.ts:42)";
    mockSkillExecutor.execute.mockRejectedValue(errorWithStack);

    await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    const sendCalls = vi.mocked(mockMainWindow.webContents.send).mock.calls;
    const errorCalls = sendCalls.filter(
      ([channel]) => channel === SLIDE_PUSH_CHANNELS.SYNC_ERROR,
    );

    for (const [, payload] of errorCalls) {
      expect(JSON.stringify(payload)).not.toContain("sensitiveFunction");
      expect(JSON.stringify(payload)).not.toContain("/internal/path.ts");
    }
  });
});
```

#### 2-3: slide:watch-status イベントテスト

```typescript
describe("push channel: slide:watch-status", () => {
  it("should emit watch-status: 'watching' after successful watch-start", async () => {
    mockWatcher.isWatching.mockReturnValue(false);
    mockWatcher.start.mockResolvedValue(undefined);

    await invokeHandler(
      SLIDE_INVOKE_CHANNELS.WATCH_START,
      "/valid/project/path",
    );

    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
      SLIDE_PUSH_CHANNELS.WATCH_STATUS,
      expect.objectContaining({ status: "watching" }),
    );
  });

  it("should emit watch-status: 'idle' after watch-stop", async () => {
    await invokeHandler(SLIDE_INVOKE_CHANNELS.WATCH_STOP);

    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
      SLIDE_PUSH_CHANNELS.WATCH_STATUS,
      expect.objectContaining({ status: "idle" }),
    );
  });
});
```

---

### 3. エラーサニタイズテスト

**対象ファイル**: `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`（追加）

AC-8 の検証を強化する。

#### 3-1: 内部パス非露出テスト

```typescript
describe("error sanitization (AC-8)", () => {
  it("should mask home directory path in error message", async () => {
    const homeDir = os.homedir(); // 例: /Users/username
    mockSkillExecutor.execute.mockRejectedValue(
      new Error(`Cannot read file: ${homeDir}/secret/config.json`),
    );

    const result = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    expect(result.success).toBe(false);
    // ホームディレクトリパスがマスクされていること
    expect(JSON.stringify(result.error)).not.toContain(homeDir);
  });

  it("should NOT include stack trace in IPC response error", async () => {
    const errorWithStack = new Error("internal error");
    errorWithStack.stack =
      "Error: internal error\n  at internalFunction (/app/src/internal.ts:10)";
    mockSkillExecutor.execute.mockRejectedValue(errorWithStack);

    const result = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("stack");
    expect(JSON.stringify(result)).not.toContain("internalFunction");
    expect(JSON.stringify(result)).not.toContain("/app/src/internal.ts");
  });

  it("should include a human-readable message in sanitized error", async () => {
    mockSkillExecutor.execute.mockRejectedValue(new Error("execution failed"));

    const result = await invokeHandler(
      SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
      "outline",
      "/valid/project/path",
    );

    expect(result.error).toHaveProperty("code");
    expect(result.error).toHaveProperty("message");
    expect(typeof result.error.message).toBe("string");
    expect(result.error.message.length).toBeGreaterThan(0);
  });
});
```

---

### 4. agent-client.ts 廃止後の import 残存確認テスト

**対象ファイル**: `apps/desktop/src/main/slide/__tests__/agent-client-removal.test.ts`（新規）

実装ファイルの import を静的解析で検証する。

```typescript
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const SLIDE_DIR = resolve(__dirname, "..");

describe("agent-client.ts 廃止後の残存確認 (AC-7)", () => {
  it("agent-client.ts file should not exist after removal", () => {
    const agentClientPath = resolve(SLIDE_DIR, "agent-client.ts");
    // ファイルが廃止されていることを確認
    expect(existsSync(agentClientPath)).toBe(false);
  });

  it("ipc-handlers.ts should NOT import from agent-client", () => {
    const ipcHandlersPath = resolve(SLIDE_DIR, "ipc-handlers.ts");
    const content = readFileSync(ipcHandlersPath, "utf-8");
    expect(content).not.toContain("agent-client");
  });

  it("skill-executor.ts should NOT import from agent-client", () => {
    const skillExecutorPath = resolve(SLIDE_DIR, "skill-executor.ts");
    const content = readFileSync(skillExecutorPath, "utf-8");
    expect(content).not.toContain("agent-client");
  });

  it("ipc-handlers.ts should NOT directly import @anthropic-ai/sdk", () => {
    const ipcHandlersPath = resolve(SLIDE_DIR, "ipc-handlers.ts");
    const content = readFileSync(ipcHandlersPath, "utf-8");
    expect(content).not.toContain("@anthropic-ai/sdk");
    expect(content).not.toContain("safeStorage");
    expect(content).not.toContain("process.env.ANTHROPIC_API_KEY");
  });

  it("skill-executor.ts should NOT directly import @anthropic-ai/sdk", () => {
    const skillExecutorPath = resolve(SLIDE_DIR, "skill-executor.ts");
    const content = readFileSync(skillExecutorPath, "utf-8");
    expect(content).not.toContain("@anthropic-ai/sdk");
    expect(content).not.toContain("process.env.ANTHROPIC_API_KEY");
  });
});
```

---

### 5. IPC チャネル登録テスト（AC-1 / AC-2 強化）

**対象ファイル**: `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`（追加）

```typescript
describe("IPC handler registration (AC-1, AC-2)", () => {
  it("should register all 6 invoke handlers on registerSlideIpcHandlers", () => {
    const expectedChannels = Object.values(SLIDE_INVOKE_CHANNELS);

    for (const channel of expectedChannels) {
      expect(registeredHandlers.has(channel)).toBe(true);
    }
  });

  it("should unregister all handlers on unregisterSlideIpcHandlers", () => {
    unregisterSlideIpcHandlers();

    expect(vi.mocked(ipcMain.removeHandler)).toHaveBeenCalledTimes(
      Object.keys(SLIDE_INVOKE_CHANNELS).length,
    );
  });

  it("should handle re-registration without error (P5: 二重登録防止)", () => {
    // 一度登録解除してから再登録しても二重登録にならないこと
    unregisterSlideIpcHandlers();
    expect(() => registerSlideIpcHandlers(mockMainWindow)).not.toThrow();
  });
});
```

---

### 6. Preload チャネル同期テスト（P44 対策）

**対象ファイル**: `apps/desktop/src/main/slide/__tests__/channel-sync.test.ts`（新規）

Main の定数と Preload の定数が一致していることを検証する。

```typescript
import { describe, it, expect } from "vitest";
import { SLIDE_INVOKE_CHANNELS, SLIDE_PUSH_CHANNELS } from "../ipc-handlers";
// P63 対策: 既存の preload テストファイルからインポートパスを確認してから記述する
import { IPC_CHANNELS } from "../../../preload/channels";

describe("Preload <-> Main チャネル同期 (P44)", () => {
  it("all invoke channels should match between Main and Preload", () => {
    expect(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE).toBe(
      IPC_CHANNELS.SLIDE.EXECUTE_PHASE,
    );
    expect(SLIDE_INVOKE_CHANNELS.WATCH_START).toBe(
      IPC_CHANNELS.SLIDE.WATCH_START,
    );
    expect(SLIDE_INVOKE_CHANNELS.WATCH_STOP).toBe(
      IPC_CHANNELS.SLIDE.WATCH_STOP,
    );
    expect(SLIDE_INVOKE_CHANNELS.SYNC_STATUS).toBe(
      IPC_CHANNELS.SLIDE.SYNC_STATUS,
    );
    expect(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC).toBe(
      IPC_CHANNELS.SLIDE.REVERSE_SYNC,
    );
    expect(SLIDE_INVOKE_CHANNELS.CANCEL).toBe(IPC_CHANNELS.SLIDE.CANCEL);
  });

  it("all push channels should match between Main and Preload", () => {
    expect(SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED).toBe(
      IPC_CHANNELS.SLIDE.SYNC_STATUS_CHANGED,
    );
    expect(SLIDE_PUSH_CHANNELS.SYNC_PROGRESS).toBe(
      IPC_CHANNELS.SLIDE.SYNC_PROGRESS,
    );
    expect(SLIDE_PUSH_CHANNELS.SYNC_ERROR).toBe(IPC_CHANNELS.SLIDE.SYNC_ERROR);
    expect(SLIDE_PUSH_CHANNELS.EXECUTION_PROGRESS).toBe(
      IPC_CHANNELS.SLIDE.EXECUTION_PROGRESS,
    );
    expect(SLIDE_PUSH_CHANNELS.STRUCTURE_CHANGED).toBe(
      IPC_CHANNELS.SLIDE.STRUCTURE_CHANGED,
    );
    expect(SLIDE_PUSH_CHANNELS.WATCH_STATUS).toBe(
      IPC_CHANNELS.SLIDE.WATCH_STATUS,
    );
  });

  it("should NOT contain any legacy channel names in Preload", () => {
    const slideValues = Object.values(IPC_CHANNELS.SLIDE);
    expect(slideValues).not.toContain("slide:startWatching");
    expect(slideValues).not.toContain("slide:stopWatching");
    expect(slideValues).not.toContain("slide:getSyncStatus");
    expect(slideValues).not.toContain("slide:manualSync");
    expect(slideValues).not.toContain("slide:cancelExecution");
  });
});
```

---

## 統合テスト連携

| テスト領域                           | テストファイル                           | 対応受入基準     |
| ------------------------------------ | ---------------------------------------- | ---------------- |
| エッジケース（同時実行・キャンセル） | `__tests__/ipc-handlers.test.ts`         | AC-2, AC-5, AC-6 |
| push イベント                        | `__tests__/ipc-handlers.test.ts`         | AC-2, AC-8       |
| エラーサニタイズ                     | `__tests__/ipc-handlers.test.ts`         | AC-8             |
| agent-client 廃止確認                | `__tests__/agent-client-removal.test.ts` | AC-7             |
| チャネル同期                         | `__tests__/channel-sync.test.ts`         | AC-2, P44        |
| IPC 登録・解除                       | `__tests__/ipc-handlers.test.ts`         | AC-1, P5         |

## 成果物

| 成果物                      | パス                                                                 | 説明                                      |
| --------------------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| エッジケーステスト          | `apps/desktop/src/main/slide/__tests__/edge-cases.test.ts`           | 同時実行・キャンセル中再実行              |
| push チャネルテスト         | `apps/desktop/src/main/slide/__tests__/push-channels.test.ts`        | sync-progress / sync-error / watch-status |
| agent-client 廃止確認テスト | `apps/desktop/src/main/slide/__tests__/agent-client-removal.test.ts` | legacy import 残存検出                    |
| チャネル同期テスト          | `apps/desktop/src/main/slide/__tests__/channel-sync.test.ts`         | Main/Preload チャネル一致検証             |

## 完了条件

- [ ] エッジケーステスト（同時実行・キャンセル中再実行・watch 状態遷移）が追加されている
- [ ] push チャネル 3 本（sync-progress, sync-error, watch-status）の event テストが追加されている
- [ ] push イベントのペイロードに内部パス・スタックトレースが含まれないことを検証するテストが存在する
- [ ] `agent-client-removal.test.ts` が作成されており、ファイル廃止と import 残存を検証している
- [ ] `channel-sync.test.ts` が作成されており、Main/Preload 間の定数一致を検証している
- [ ] 全追加テストが実装後に PASS する
- [ ] Phase 7 のカバレッジ計測前に全テストが PASS している

## 次のPhase

Phase 7（カバレッジ確認）へ進む。カバレッジが基準未達の場合は Phase 6 へ戻る。
