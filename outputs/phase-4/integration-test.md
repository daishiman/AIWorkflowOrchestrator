# 統合テストシナリオ - スライド依存関係管理システム

## 1. ドキュメント情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | task-feat-slide-dependency-management-003 |
| バージョン | 1.0.0                                     |
| 作成日     | 2026-01-09                                |
| 作成者     | Claude (frontend-testing skill)           |

---

## 2. 統合テストカテゴリ

### 2.1 カテゴリ概要

| カテゴリ           | 検証範囲                     | 優先度 | テスト数 |
| ------------------ | ---------------------------- | ------ | -------- |
| IPC通信テスト      | Renderer ↔ Main間の通信      | High   | 8        |
| データフローテスト | 変更検知→状態更新→UI反映     | High   | 5        |
| エラーハンドリング | 各層のエラー伝播と回復       | Medium | 6        |
| 状態同期テスト     | ファイル整合性と状態管理     | High   | 5        |
| 無限ループ防止     | スキル実行起因の変更検知制御 | High   | 3        |

---

## 3. IPC通信テスト

### 3.1 slide:executePhase

```typescript
// integration/ipc-execute-phase.test.ts
describe("IPC: slide:executePhase", () => {
  let mockIpcMain: MockIpcMain;
  let mockIpcRenderer: MockIpcRenderer;

  beforeEach(() => {
    mockIpcMain = createMockIpcMain();
    mockIpcRenderer = createMockIpcRenderer();
    registerSlideHandlers(mockIpcMain);
  });

  it("IT-IPC-001: should handle valid executePhase request", async () => {
    // Given: 有効なリクエストパラメータ
    const request = { phase: "html", projectPath: "/test/project" };

    // When: IPC呼び出し
    const result = await mockIpcRenderer.invoke("slide:executePhase", request);

    // Then: 成功レスポンス
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
    expect(result.result.phase).toBe("html");
  });

  it("IT-IPC-002: should reject invalid phase", async () => {
    // Given: 無効なphase
    const request = { phase: "invalid", projectPath: "/test/project" };

    // When: IPC呼び出し
    const result = await mockIpcRenderer.invoke("slide:executePhase", request);

    // Then: バリデーションエラー
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("SLIDE_E001");
  });

  it("IT-IPC-003: should reject empty projectPath", async () => {
    // Given: 空のprojectPath
    const request = { phase: "html", projectPath: "" };

    // When: IPC呼び出し
    const result = await mockIpcRenderer.invoke("slide:executePhase", request);

    // Then: バリデーションエラー
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("SLIDE_E001");
  });

  it("IT-IPC-004: should reject concurrent execution", async () => {
    // Given: 既に実行中
    const request = { phase: "html", projectPath: "/test/project" };
    mockIpcRenderer.invoke("slide:executePhase", request); // 非同期開始

    // When: 2回目のリクエスト
    const result = await mockIpcRenderer.invoke("slide:executePhase", request);

    // Then: 競合エラー
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("SLIDE_E003");
  });
});
```

### 3.2 slide:startWatching / slide:stopWatching

```typescript
// integration/ipc-watcher.test.ts
describe("IPC: Watcher Control", () => {
  it("IT-IPC-005: should start watching on valid path", async () => {
    // Given: structure.mdが存在するパス
    const request = { projectPath: "/test/project" };

    // When: startWatching
    const result = await mockIpcRenderer.invoke("slide:startWatching", request);

    // Then: 成功
    expect(result.success).toBe(true);
  });

  it("IT-IPC-006: should fail when structure.md not found", async () => {
    // Given: structure.mdが存在しないパス
    const request = { projectPath: "/nonexistent" };

    // When: startWatching
    const result = await mockIpcRenderer.invoke("slide:startWatching", request);

    // Then: NotFoundエラー
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("SLIDE_E002");
  });

  it("IT-IPC-007: should stop watching successfully", async () => {
    // Given: 監視中
    await mockIpcRenderer.invoke("slide:startWatching", {
      projectPath: "/test/project",
    });

    // When: stopWatching
    const result = await mockIpcRenderer.invoke("slide:stopWatching");

    // Then: 成功
    expect(result.success).toBe(true);
  });

  it("IT-IPC-008: should fail stopWatching when not watching", async () => {
    // Given: 監視していない状態

    // When: stopWatching
    const result = await mockIpcRenderer.invoke("slide:stopWatching");

    // Then: 状態エラー
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("SLIDE_E006");
  });
});
```

---

## 4. データフローテスト

### 4.1 ファイル変更→UI更新フロー

```typescript
// integration/data-flow.test.ts
describe("Data Flow: File Change to UI Update", () => {
  let store: typeof useSlideProjectStore;
  let mockWatcher: MockFileWatcher;
  let mockIpcEvents: MockIpcEvents;

  beforeEach(() => {
    store = useSlideProjectStore;
    store.getState().reset();
    mockWatcher = createMockFileWatcher();
    mockIpcEvents = createMockIpcEvents();
  });

  it("IT-DF-001: should flow structure.md change → out-of-sync → syncing → synced", async () => {
    // Given: 監視中、同期済み状態
    store.getState().setSyncStatus("synced");
    store.getState().setWatching(true);

    // When: structure.md変更イベント
    mockIpcEvents.emit("slide:structureChanged", {
      path: "/project/structure.md",
      timestamp: Date.now(),
    });

    // Then: out-of-sync状態に遷移
    await waitFor(() => {
      expect(store.getState().syncStatus).toBe("out-of-sync");
    });

    // When: 自動同期開始
    mockIpcEvents.emit("slide:syncStatusChanged", { status: "syncing" });

    // Then: syncing状態に遷移
    expect(store.getState().syncStatus).toBe("syncing");

    // When: 同期完了
    mockIpcEvents.emit("slide:syncStatusChanged", { status: "synced" });

    // Then: synced状態に遷移
    expect(store.getState().syncStatus).toBe("synced");
  });

  it("IT-DF-002: should update progress during execution", async () => {
    // Given: スキル実行中
    store.getState().setPhase("html");

    // When: 進捗イベント
    mockIpcEvents.emit("slide:executionProgress", {
      progress: 50,
      phase: "html",
    });

    // Then: 進捗が更新される
    expect(store.getState().executionProgress).toBe(50);
  });

  it("IT-DF-003: should add result to history on completion", async () => {
    // Given: スキル実行中
    store.getState().setPhase("html");
    const initialHistoryLength = store.getState().executionHistory.length;

    // When: 完了イベント
    const result = {
      phase: "html",
      success: true,
      duration: 1000,
      timestamp: new Date().toISOString(),
    };
    mockIpcEvents.emit("slide:executionComplete", { result });

    // Then: 履歴に追加
    expect(store.getState().executionHistory.length).toBe(
      initialHistoryLength + 1,
    );
    expect(store.getState().currentPhase).toBe("idle");
  });

  it("IT-DF-004: should flow button click → IPC → execution → result", async () => {
    // Given: プロジェクト選択済み、監視中
    store.getState().setProject({
      path: "/project",
      structurePath: "/project/structure.md",
      htmlPath: "/project/index.html",
      syncStatus: "synced",
      lastSyncAt: null,
      structureHash: null,
      htmlHash: null,
    });
    store.getState().setWatching(true);

    // When: executePhaseを呼び出し
    const { executePhase } = useSlideProject();
    await executePhase("hearing");

    // Then: フェーズがidleに戻る（モックで即完了）
    expect(store.getState().currentPhase).toBe("idle");
  });

  it("IT-DF-005: should disable buttons during execution", () => {
    // Given: 実行中状態
    store.getState().setPhase("html");

    // When: canExecuteSkillをチェック
    const canExecute = useCanExecuteSkill();

    // Then: 実行不可
    expect(canExecute).toBe(false);
  });
});
```

---

## 5. エラーハンドリングテスト

### 5.1 スキル実行エラー

```typescript
// integration/error-handling.test.ts
describe("Error Handling: Skill Execution", () => {
  it("IT-ERR-001: should handle skill execution failure", async () => {
    // Given: スキル実行がエラーを返す設定
    mockSkillExecutor.execute.mockRejectedValue(new Error("API timeout"));

    // When: executePhase実行
    const result = await window.slideApi.executePhase("html", "/project");

    // Then: エラーレスポンス
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("IT-ERR-002: should retry on transient error (max 3 times)", async () => {
    // Given: 2回失敗後に成功
    mockSkillExecutor.execute
      .mockRejectedValueOnce(new Error("Transient error"))
      .mockRejectedValueOnce(new Error("Transient error"))
      .mockResolvedValueOnce({ success: true });

    // When: executePhase実行（リトライロジック含む）
    const result = await executeWithRetry("html", "/project");

    // Then: 最終的に成功
    expect(result.success).toBe(true);
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(3);
  });

  it("IT-ERR-003: should notify user after retry limit", async () => {
    // Given: 3回すべて失敗
    mockSkillExecutor.execute.mockRejectedValue(new Error("Persistent error"));

    // When: executePhase実行
    const result = await executeWithRetry("html", "/project");

    // Then: エラー状態
    expect(result.success).toBe(false);
    expect(store.getState().lastError).toBeDefined();
    expect(store.getState().syncStatus).toBe("error");
  });
});
```

### 5.2 ファイルシステムエラー

```typescript
describe("Error Handling: File System", () => {
  it("IT-ERR-004: should handle file not found gracefully", async () => {
    // Given: ファイルが存在しない
    mockFs.existsSync.mockReturnValue(false);

    // When: startWatching
    const result = await window.slideApi.startWatching("/nonexistent");

    // Then: エラーレスポンス
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("SLIDE_E002");
  });

  it("IT-ERR-005: should recover from watcher error", async () => {
    // Given: ウォッチャーが起動中
    await window.slideApi.startWatching("/project");

    // When: ウォッチャーエラー発生
    mockWatcher.emit("error", new Error("ENOENT"));

    // Then: エラー状態になるがUIは応答可能
    expect(store.getState().lastError).toBeDefined();
    expect(store.getState().isWatching).toBe(false);
  });

  it("IT-ERR-006: should display actionable error message", async () => {
    // Given: パーミッションエラー
    mockFs.readFile.mockRejectedValue({ code: "EACCES" });

    // When: getSyncStatus
    const result = await window.slideApi.getSyncStatus("/project");

    // Then: 対処方法を含むエラー
    expect(result.error.suggestedAction).toBeDefined();
  });
});
```

---

## 6. 状態同期テスト

### 6.1 ファイル整合性チェック

```typescript
// integration/state-sync.test.ts
describe("State Sync: File Integrity", () => {
  it("IT-SS-001: should detect out-of-sync state on project open", async () => {
    // Given: structure.mdとindex.htmlのハッシュが異なる
    mockDependencyManager.checkDependencyStatus.mockResolvedValue({
      isInSync: false,
      newHash: "abc123",
    });

    // When: プロジェクトを開く
    await openProject("/project");

    // Then: out-of-sync状態
    expect(store.getState().syncStatus).toBe("out-of-sync");
  });

  it("IT-SS-002: should detect synced state on project open", async () => {
    // Given: ファイルが同期済み
    mockDependencyManager.checkDependencyStatus.mockResolvedValue({
      isInSync: true,
      newHash: "abc123",
    });

    // When: プロジェクトを開く
    await openProject("/project");

    // Then: synced状態
    expect(store.getState().syncStatus).toBe("synced");
  });

  it("IT-SS-003: should update lastSyncAt on successful sync", async () => {
    // Given: out-of-sync状態
    store.getState().setSyncStatus("out-of-sync");

    // When: 手動同期
    await manualSync("/project");

    // Then: lastSyncAtが更新
    expect(store.getState().lastSyncAt).not.toBeNull();
  });

  it("IT-SS-004: should enable sync button only when out-of-sync", () => {
    // Given: synced状態
    store.getState().setSyncStatus("synced");

    // Then: canSyncはfalse
    expect(useCanSync()).toBe(false);

    // When: out-of-sync状態に変更
    store.getState().setSyncStatus("out-of-sync");

    // Then: canSyncはtrue
    expect(useCanSync()).toBe(true);
  });

  it("IT-SS-005: should disable sync during execution", () => {
    // Given: out-of-sync + 実行中
    store.getState().setSyncStatus("out-of-sync");
    store.getState().setPhase("html");

    // Then: canSyncはfalse（実行中のため）
    expect(useCanSync()).toBe(false);
  });
});
```

---

## 7. 無限ループ防止テスト

### 7.1 スキル変更の無視

```typescript
// integration/infinite-loop-prevention.test.ts
describe("Infinite Loop Prevention", () => {
  let watcher: SlideFileWatcher;
  let structureChangeCallback: vi.Mock;

  beforeEach(() => {
    watcher = new SlideFileWatcher();
    structureChangeCallback = vi.fn();
    watcher.onStructureChange(structureChangeCallback);
    watcher.start("/project");
  });

  afterEach(() => {
    watcher.stop();
  });

  it("IT-ILP-001: should not trigger callback for skill-generated changes", async () => {
    // Given: スキル実行による変更としてマーク
    watcher.markAsSkillChange("/project/index.html", "html");

    // When: ファイル変更イベント（1秒以内）
    await vi.advanceTimersByTimeAsync(100);
    watcher["handleChange"]("/project/index.html");

    // Then: コールバックは呼ばれない
    expect(structureChangeCallback).not.toHaveBeenCalled();
  });

  it("IT-ILP-002: should trigger callback for user-generated changes", async () => {
    // Given: マークなし（ユーザー変更）

    // When: ファイル変更イベント
    watcher["handleChange"]("/project/structure.md");
    await vi.advanceTimersByTimeAsync(500); // デバウンス待ち

    // Then: コールバックが呼ばれる
    expect(structureChangeCallback).toHaveBeenCalled();
  });

  it("IT-ILP-003: should expire skill change marker after 1 second", async () => {
    // Given: スキル変更マーク
    watcher.markAsSkillChange("/project/index.html", "html");

    // When: 1秒以上経過後にファイル変更
    await vi.advanceTimersByTimeAsync(1100);
    watcher["handleChange"]("/project/index.html");

    // Then: マーク期限切れでコールバック発火
    expect(structureChangeCallback).toHaveBeenCalled();
  });
});
```

---

## 8. テスト実行設定

### 8.1 統合テスト用Vitest設定

```typescript
// vitest.integration.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    setupFiles: ["./src/test/integration-setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
```

### 8.2 統合テストセットアップ

```typescript
// src/test/integration-setup.ts
import { vi } from "vitest";
import { EventEmitter } from "events";

// IPC モック
export const mockIpcRenderer = {
  invoke: vi.fn(),
  on: vi.fn((channel, callback) => {
    ipcEventEmitter.on(channel, callback);
    return () => ipcEventEmitter.off(channel, callback);
  }),
  removeListener: vi.fn(),
};

export const mockIpcMain = {
  handle: vi.fn(),
};

export const ipcEventEmitter = new EventEmitter();

// グローバルにモックを設定
vi.mock("electron", () => ({
  ipcRenderer: mockIpcRenderer,
  ipcMain: mockIpcMain,
}));

// テスト間でリセット
beforeEach(() => {
  vi.clearAllMocks();
  ipcEventEmitter.removeAllListeners();
});
```

---

## 9. 統合テスト統計

### 9.1 カテゴリ別件数

| カテゴリ           | テスト数 | 必須   | オプション |
| ------------------ | -------- | ------ | ---------- |
| IPC通信            | 8        | 8      | 0          |
| データフロー       | 5        | 5      | 0          |
| エラーハンドリング | 6        | 4      | 2          |
| 状態同期           | 5        | 5      | 0          |
| 無限ループ防止     | 3        | 3      | 0          |
| **合計**           | **27**   | **25** | **2**      |

### 9.2 カバレッジ目標

| 指標         | 目標 | 備考               |
| ------------ | ---- | ------------------ |
| IPC通信パス  | 100% | 全チャネルをテスト |
| データフロー | 100% | 主要フロー網羅     |
| エラーパス   | 80%+ | 主要エラーパターン |
| 状態遷移     | 100% | 全遷移をテスト     |

---

## 10. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-09 | 初版作成 |
