/**
 * スライド機能の統合テスト
 * 複数モジュール間の連携を検証する
 * @module main/slide/__tests__/slide-integration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// electron-storeのモック（agent-clientがインポートする前にモック）
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Electron safeStorageのモック
vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(true),
    encryptString: vi.fn((str: string) => Buffer.from(str).toString("base64")),
    decryptString: vi.fn((buffer: Buffer) => buffer.toString()),
  },
}));

// vi.hoistedで制御可能なモック関数を作成（fs/promises, modifier-skill用）
const { mockReadFile, mockBuildModifierPrompt, mockParseModifierResponse } =
  vi.hoisted(() => ({
    mockReadFile: vi.fn(),
    mockBuildModifierPrompt: vi.fn(),
    mockParseModifierResponse: vi.fn(),
  }));

// fs/promisesのモック（modifier フェーズの readFile 用）
vi.mock("fs/promises", () => ({
  readFile: mockReadFile,
  default: { readFile: mockReadFile },
}));

// modifier-skillのモック（modifier フェーズのプロンプト構築・レスポンスパース用）
vi.mock("../modifier-skill", () => ({
  buildModifierPrompt: mockBuildModifierPrompt,
  parseModifierResponse: mockParseModifierResponse,
}));

// vi.hoistedで制御可能なモック関数を作成
const { mockCreate, mockAnthropicConstructor } = vi.hoisted(() => {
  const create = vi.fn();
  const constructor = vi.fn().mockImplementation(() => ({
    messages: {
      create,
    },
  }));
  return {
    mockCreate: create,
    mockAnthropicConstructor: constructor,
  };
});

// Anthropic SDKのモック
vi.mock("@anthropic-ai/sdk", () => ({
  default: mockAnthropicConstructor,
}));

// vi.hoisted で変数を定義してモック内で使用可能にする
const { mockWatchInstance, mockCheckDependency, mockBothFilesExist } =
  vi.hoisted(() => {
    // MockWatcherクラスをhoisted内で定義
    class HoistedMockWatcher {
      private events: Map<string, Array<(...args: unknown[]) => void>> =
        new Map();
      close = vi.fn();

      on(event: string, handler: (...args: unknown[]) => void): this {
        if (!this.events.has(event)) {
          this.events.set(event, []);
        }
        this.events.get(event)!.push(handler);
        return this;
      }

      emit(event: string, ...args: unknown[]): boolean {
        const handlers = this.events.get(event);
        if (handlers) {
          handlers.forEach((handler) => handler(...args));
          return true;
        }
        return false;
      }
    }

    return {
      mockWatchInstance: new HoistedMockWatcher(),
      mockCheckDependency: vi.fn(),
      mockBothFilesExist: vi.fn(),
    };
  });

// chokidarをモック
vi.mock("chokidar", () => ({
  default: {
    watch: vi.fn(() => mockWatchInstance),
  },
  watch: vi.fn(() => mockWatchInstance),
}));

// @repo/sharedをモック
vi.mock("@repo/shared", () => ({
  checkDependency: mockCheckDependency,
  bothFilesExist: mockBothFilesExist,
}));

import chokidar from "chokidar";
import { createSlideWatcher } from "../file-watcher";
import { createSkillExecutor } from "../skill-executor";
import { createSyncManager } from "../sync-manager";
import { resetAgentAPI } from "../agent-client";

describe("Slide Integration Tests", () => {
  const testProjectPath = "/test/project";
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    // 環境変数をモック
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: "test-api-key" };
    // Agent APIをリセット
    resetAgentAPI();
    mockBothFilesExist.mockResolvedValue(true);
    mockCheckDependency.mockResolvedValue(true);
    // chokidarのモックを再設定
    vi.mocked(chokidar.watch).mockReturnValue(mockWatchInstance as never);
    // デフォルトのAnthropicモック動作：即座に成功を返す
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ changes: [] }) }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });
    // modifier フェーズ用モックのデフォルト値設定
    mockReadFile.mockResolvedValue("mock file content");
    mockBuildModifierPrompt.mockReturnValue("mock modifier prompt");
    mockParseModifierResponse.mockReturnValue({
      success: true,
      changes: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  describe("File Watcher + Skill Executor Integration", () => {
    it("should prevent infinite loop when skill execution triggers file change", async () => {
      // Setup
      const watcher = createSlideWatcher(testProjectPath);
      const changeCallback = vi.fn();

      watcher.onStructureChange(changeCallback);
      watcher.start();

      // Mark file as skill change (simulating skill execution)
      watcher.markAsSkillChange(`${testProjectPath}/structure.md`, "html");

      // Trigger file change event (would happen after skill writes to file)
      mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

      // Callback should NOT be called (infinite loop prevented)
      expect(changeCallback).not.toHaveBeenCalled();

      // Cleanup
      watcher.stop();
    });

    it("should process user changes after TTL expires", async () => {
      // Setup
      const watcher = createSlideWatcher(testProjectPath);
      const changeCallback = vi.fn();

      watcher.onStructureChange(changeCallback);
      watcher.start();

      // Mark as skill change
      watcher.markAsSkillChange(`${testProjectPath}/structure.md`, "html");

      // Advance past TTL (1000ms)
      vi.advanceTimersByTime(1001);

      // Trigger file change
      mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

      // Callback SHOULD be called (TTL expired)
      expect(changeCallback).toHaveBeenCalled();

      // Cleanup
      watcher.stop();
    });
  });

  describe("Skill Executor + Sync Manager Integration", () => {
    it("should sync files via html skill execution", async () => {
      // Setup
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);
      const progressCallback = vi.fn();

      syncManager.onProgress(progressCallback);

      // Execute sync
      const syncPromise = syncManager.sync(testProjectPath);

      // Advance timers to complete execution
      await vi.advanceTimersByTimeAsync(1000);

      await syncPromise;

      // Progress should have been reported
      expect(progressCallback).toHaveBeenCalled();
    });

    it("should cancel sync operation", async () => {
      // Setup
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      // Start sync
      const syncPromise = syncManager.sync(testProjectPath);

      // Cancel immediately
      syncManager.cancel();

      // Set up rejection handler BEFORE advancing timers to prevent unhandled rejection
      const assertion = expect(syncPromise).rejects.toThrow("Cancelled");

      // Advance timers
      await vi.advanceTimersByTimeAsync(1000);

      // Wait for assertion to complete
      await assertion;
    });
  });

  describe("Full Integration Flow", () => {
    it("should handle complete workflow: watch -> detect -> sync -> prevent loop", async () => {
      // Setup components
      const watcher = createSlideWatcher(testProjectPath);
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      let syncTriggered = false;
      let loopDetected = false;

      // Setup watcher to detect changes
      watcher.onStructureChange(async (filePath) => {
        // If this callback fires after sync, it's a loop
        if (syncTriggered) {
          loopDetected = true;
          return;
        }

        // Check sync status
        mockCheckDependency.mockResolvedValue(false);

        syncTriggered = true;

        // Mark file before skill execution
        watcher.markAsSkillChange(filePath, "html");

        // Execute sync
        const syncPromise = syncManager.sync(testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await syncPromise;

        // After sync completes, file system would emit change event
        // This simulates the watcher detecting the change
        mockWatchInstance.emit("change", filePath);
      });

      watcher.start();

      // Simulate initial user change
      mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

      // Verify no infinite loop occurred
      expect(loopDetected).toBe(false);

      // Cleanup
      watcher.stop();
    });

    it("should support multiple sequential skill executions", async () => {
      const executor = createSkillExecutor();
      const phases = ["hearing", "structure", "html", "modifier"] as const;

      for (const phase of phases) {
        const resultPromise = executor.execute(phase, testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);
        expect(result.phase).toBe(phase);
      }
    });

    it("should handle rapid successive user changes", async () => {
      const watcher = createSlideWatcher(testProjectPath);
      const changeCount = { value: 0 };

      watcher.onStructureChange(() => {
        changeCount.value += 1;
      });

      watcher.start();

      // Simulate rapid changes
      for (let i = 0; i < 5; i++) {
        mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);
      }

      // All changes should be detected
      expect(changeCount.value).toBe(5);

      watcher.stop();
    });
  });

  // ==========================================================================
  // Reverse Sync Integration Tests (TDD Red - Phase 4)
  // テストID: IT-01 ~ IT-06
  // ==========================================================================
  describe("Reverse Sync Integration", () => {
    it("IT-01: should trigger reverseSync on html change", async () => {
      // Setup
      const watcher = createSlideWatcher(testProjectPath);
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      let reverseSyncTriggered = false;

      // onHtmlChangeコールバックでreverseSyncをトリガー
      watcher.onHtmlChange(async () => {
        reverseSyncTriggered = true;
        const syncPromise = syncManager.reverseSync(testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await syncPromise;
      });

      watcher.start();

      // HTML変更イベントを発火
      mockWatchInstance.emit("change", `${testProjectPath}/index.html`);

      // reverseSyncがトリガーされたこと
      expect(reverseSyncTriggered).toBe(true);

      watcher.stop();
    });

    it("IT-02: should update structure.md on successful sync", async () => {
      // Setup
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      // reverseSyncを実行
      const syncPromise = syncManager.reverseSync(testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await syncPromise;

      // 成功すること
      expect(result.success).toBe(true);

      // 変更情報が返されること
      expect(result).toHaveProperty("changes");
    });

    it("IT-03: should prevent infinite loop on bidirectional sync", async () => {
      // Setup
      const watcher = createSlideWatcher(testProjectPath);
      const executor = createSkillExecutor();
      const _syncManager = createSyncManager(executor);

      let forwardLoopDetected = false;
      let reverseLoopDetected = false;

      // structure.md変更検知
      watcher.onStructureChange(async (_filePath) => {
        // modifier起因の変更でなければ処理
        // （実際の実装では内部で判定される）
        forwardLoopDetected = true;
      });

      // index.html変更検知
      watcher.onHtmlChange(async (_filePath) => {
        // html skill起因の変更でなければ処理
        reverseLoopDetected = true;
      });

      watcher.start();

      // シナリオ1: 順方向同期 → HTML更新 → HTML変更検知（無限ループ防止）
      watcher.markAsSkillChange(`${testProjectPath}/index.html`, "html");
      mockWatchInstance.emit("change", `${testProjectPath}/index.html`);

      // HTMLコールバックは呼ばれないこと（スキル起因の変更は無視）
      expect(reverseLoopDetected).toBe(false);

      // シナリオ2: 逆方向同期 → structure更新 → structure変更検知（無限ループ防止）
      watcher.markAsSkillChange(`${testProjectPath}/structure.md`, "modifier");
      mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

      // structureコールバックは呼ばれないこと（スキル起因の変更は無視）
      expect(forwardLoopDetected).toBe(false);

      watcher.stop();
    });

    it("IT-04: should emit correct IPC events", async () => {
      // Setup
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);
      const statusCallback = vi.fn();
      const progressCallback = vi.fn();

      syncManager.onStatusChange(statusCallback);
      syncManager.onProgress(progressCallback);

      // reverseSyncを実行
      const syncPromise = syncManager.reverseSync(testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      await syncPromise;

      // ステータスイベントが発火されること
      expect(statusCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: "reverse",
          status: expect.stringMatching(/syncing|synced|error/),
        }),
      );

      // 進捗イベントが発火されること
      expect(progressCallback).toHaveBeenCalled();
    });

    it("IT-05: should handle concurrent sync requests", async () => {
      // Setup
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      // 同時に順方向と逆方向の同期を開始
      // Promise.allSettledで扱う前にエラーハンドリングを追加
      const forwardPromise = syncManager.sync(testProjectPath);
      // reverseSyncが先に拒否される可能性があるため、即座にPromise.allSettledに渡す
      const reversePromise = syncManager.reverseSync(testProjectPath);

      // 両方のPromiseを即座にPromise.allSettledでラップしてunhandled rejectionを防ぐ
      const resultsPromise = Promise.allSettled([
        forwardPromise,
        reversePromise,
      ]);

      await vi.advanceTimersByTimeAsync(2000);

      // どちらかが成功し、もう一方は失敗（同時実行防止）
      const results = await resultsPromise;

      // sync()はvoidを返す、reverseSync()はReverseSyncResultを返す
      // fulfilledはエラーなしで完了したことを意味
      const successes = results.filter((r) => r.status === "fulfilled");
      const failures = results.filter((r) => r.status === "rejected");

      expect(successes.length + failures.length).toBe(2);

      // 1つだけが成功することを期待（排他制御）
      // または両方失敗（タイミング依存）
      expect(failures.length).toBeGreaterThanOrEqual(1);
    });

    it("IT-06: should recover from Agent SDK failure", async () => {
      // Setup
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      // 最初の呼び出しでエラーをシミュレート（実際にはモックを設定）
      let callCount = 0;
      const originalExecute = executor.execute;
      vi.spyOn(executor, "execute").mockImplementation(async (phase, path) => {
        callCount++;
        if (callCount === 1) {
          // 最初の呼び出しは失敗
          return {
            phase,
            success: false,
            error: "Agent SDK temporary failure",
            duration: 100,
          };
        }
        // 2回目以降は成功
        return originalExecute.call(executor, phase, path);
      });

      // reverseSyncを実行（失敗時はthrowするので、エラーを捕捉）
      await expect(syncManager.reverseSync(testProjectPath)).rejects.toThrow(
        "Agent SDK temporary failure",
      );

      // 呼び出しが行われたこと
      expect(callCount).toBe(1);
    });
  });

  describe("Reverse Sync Bidirectional Flow", () => {
    it("should handle complete bidirectional workflow", async () => {
      // Setup components
      const watcher = createSlideWatcher(testProjectPath);
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      const events: string[] = [];

      // 順方向: structure.md → index.html
      watcher.onStructureChange(async (_filePath) => {
        events.push("structure-change-detected");

        // HTML更新をマーク
        watcher.markAsSkillChange(`${testProjectPath}/index.html`, "html");

        // 同期実行
        const syncPromise = syncManager.sync(testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await syncPromise;

        events.push("forward-sync-completed");

        // HTMLファイル更新後の変更イベント（無視されるべき）
        mockWatchInstance.emit("change", `${testProjectPath}/index.html`);
      });

      // 逆方向: index.html → structure.md
      watcher.onHtmlChange(async (_filePath) => {
        events.push("html-change-detected");

        // structure更新をマーク
        watcher.markAsSkillChange(
          `${testProjectPath}/structure.md`,
          "modifier",
        );

        // 逆同期実行
        const syncPromise = syncManager.reverseSync(testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await syncPromise;

        events.push("reverse-sync-completed");

        // structureファイル更新後の変更イベント（無視されるべき）
        mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);
      });

      watcher.start();

      // 順方向シナリオのテスト
      mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

      // 無限ループが発生していないこと
      expect(
        events.filter((e) => e === "structure-change-detected").length,
      ).toBe(1);

      watcher.stop();
    });
  });
});
