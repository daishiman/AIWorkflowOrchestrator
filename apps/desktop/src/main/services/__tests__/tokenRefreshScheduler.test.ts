/**
 * TokenRefreshScheduler Unit Tests
 *
 * TDD Red Phase - Phase 4
 * TokenRefreshScheduler の全メソッド・エッジケースを検証
 *
 * @module @repo/desktop/main/services/__tests__/tokenRefreshScheduler.test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  TokenRefreshScheduler,
  type TokenRefreshSchedulerConfig,
  type TokenRefreshCallbacks,
  DEFAULT_CONFIG,
} from "../tokenRefreshScheduler";

// =============================================================================
// Helpers
// =============================================================================

/**
 * Promise microtask をフラッシュする（fake timers 環境下で）
 * 複数回のフラッシュで .then() チェーンを完全に解決
 */
async function flushPromises(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * テスト用コールバックを生成
 */
function createMockCallbacks(
  overrides?: Partial<TokenRefreshCallbacks>,
): TokenRefreshCallbacks {
  return {
    onRefresh: vi.fn().mockResolvedValue(Date.now() + 3600_000),
    onFailure: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  };
}

/**
 * テスト用設定を生成
 */
function createTestConfig(
  overrides?: Partial<TokenRefreshSchedulerConfig>,
): TokenRefreshSchedulerConfig {
  return {
    refreshBeforeExpiryMs: 300_000, // 5 min
    maxRetries: 3,
    retryBaseIntervalMs: 1_000, // 1s
    ...overrides,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("TokenRefreshScheduler", () => {
  let scheduler: TokenRefreshScheduler;
  let callbacks: TokenRefreshCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new TokenRefreshScheduler();
    callbacks = createMockCallbacks();
  });

  afterEach(() => {
    scheduler.dispose();
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // 基本動作
  // ---------------------------------------------------------------------------
  describe("基本動作", () => {
    it("start()でスケジューラーが開始されること", () => {
      const expiresAt = Date.now() + 600_000; // 10分後
      scheduler.start(expiresAt, callbacks);

      expect(scheduler.isRunning()).toBe(true);
    });

    it("isRunning()が開始前にfalseを返すこと", () => {
      expect(scheduler.isRunning()).toBe(false);
    });

    it("stop()でスケジューラーが停止されること", () => {
      const expiresAt = Date.now() + 600_000;
      scheduler.start(expiresAt, callbacks);
      scheduler.stop();

      expect(scheduler.isRunning()).toBe(false);
    });

    it("stop()後にisRunning()がfalseを返すこと", () => {
      const expiresAt = Date.now() + 600_000;
      scheduler.start(expiresAt, callbacks);
      scheduler.stop();

      expect(scheduler.isRunning()).toBe(false);
      expect(callbacks.onRefresh).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // リフレッシュタイミング
  // ---------------------------------------------------------------------------
  describe("リフレッシュタイミング", () => {
    it("有効期限5分前（300秒前）にonRefreshコールバックが実行されること", () => {
      const now = Date.now();
      // 有効期限を10分後に設定 → 5分後にリフレッシュ実行
      const expiresAt = now + 600_000;
      scheduler.start(expiresAt, callbacks);

      // 5分前 - まだ実行されていない
      vi.advanceTimersByTime(299_999);
      expect(callbacks.onRefresh).not.toHaveBeenCalled();

      // 5分経過 - リフレッシュ実行
      vi.advanceTimersByTime(1);
      expect(callbacks.onRefresh).toHaveBeenCalledTimes(1);
    });

    it("有効期限まで5分未満の場合、即座にリフレッシュが実行されること", () => {
      const now = Date.now();
      // 有効期限を3分後に設定 → 即座にリフレッシュ
      const expiresAt = now + 180_000;
      scheduler.start(expiresAt, callbacks);

      // 即座（delay = 0）にリフレッシュが実行
      vi.advanceTimersByTime(0);
      expect(callbacks.onRefresh).toHaveBeenCalledTimes(1);
    });

    it("expiresAtが過去の値の場合、即座にリフレッシュが実行されること", () => {
      const now = Date.now();
      const expiresAt = now - 60_000; // 1分前に期限切れ
      scheduler.start(expiresAt, callbacks);

      vi.advanceTimersByTime(0);
      expect(callbacks.onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // リフレッシュ成功
  // ---------------------------------------------------------------------------
  describe("リフレッシュ成功", () => {
    it("リフレッシュ成功時にonSuccessコールバックが呼ばれること", async () => {
      const now = Date.now();
      const newExpiresAt = now + 3600_000; // 新しい有効期限: 1時間後
      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockResolvedValue(newExpiresAt),
      });

      // 有効期限を6分後に設定 → 1分後にリフレッシュ
      const expiresAt = now + 360_000;
      scheduler.start(expiresAt, mockCallbacks);

      // リフレッシュタイミングまで進める (360000 - 300000 = 60000ms = 1分)
      vi.advanceTimersByTime(60_000);

      // Promise を解決（新タイマーは実行しない）
      await flushPromises();

      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(newExpiresAt);
    });

    it("リフレッシュ成功後にreset()で新しいタイマーが設定されること", async () => {
      const now = Date.now();
      const newExpiresAt = now + 3600_000;
      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockResolvedValue(newExpiresAt),
      });

      const expiresAt = now + 360_000;
      scheduler.start(expiresAt, mockCallbacks);

      // リフレッシュを実行
      vi.advanceTimersByTime(60_000);
      await flushPromises();

      // 成功後もスケジューラーは稼働中（新タイマーが設定されている）
      expect(scheduler.isRunning()).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // リフレッシュ失敗・リトライ
  // ---------------------------------------------------------------------------
  describe("リフレッシュ失敗・リトライ", () => {
    it("リフレッシュ失敗時にリトライが実行されること（最大3回）", async () => {
      const now = Date.now();
      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const expiresAt = now + 360_000;
      scheduler.start(expiresAt, mockCallbacks);

      // 初回リフレッシュ
      vi.advanceTimersByTime(60_000);
      await flushPromises();

      // 1回目のリトライ (~1s後 + jitter余裕)
      vi.advanceTimersByTime(1_100);
      await flushPromises();

      // 2回目のリトライ (~2s後)
      vi.advanceTimersByTime(2_100);
      await flushPromises();

      // 3回目のリトライ (~4s後)
      vi.advanceTimersByTime(4_100);
      await flushPromises();

      // 初回 + 3回リトライ = 4回呼ばれる
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(4);
    });

    it("リトライ間隔が指数バックオフ（1s→2s→4s）であること", async () => {
      const now = Date.now();
      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const config = createTestConfig({ retryBaseIntervalMs: 1_000 });
      const customScheduler = new TokenRefreshScheduler(config);

      const expiresAt = now + 360_000;
      customScheduler.start(expiresAt, mockCallbacks);

      // 初回リフレッシュ
      vi.advanceTimersByTime(60_000);
      await flushPromises();
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(1);

      // ~1s後に1回目リトライ
      vi.advanceTimersByTime(1_100);
      await flushPromises();
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(2);

      // ~2s後に2回目リトライ
      vi.advanceTimersByTime(2_100);
      await flushPromises();
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(3);

      // ~4s後に3回目リトライ
      vi.advanceTimersByTime(4_100);
      await flushPromises();
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(4);

      customScheduler.dispose();
    });

    it("全リトライ失敗後にonFailureコールバックが呼ばれること", async () => {
      const now = Date.now();
      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockRejectedValue(new Error("Persistent error")),
      });

      const expiresAt = now + 360_000;
      scheduler.start(expiresAt, mockCallbacks);

      // 初回リフレッシュ + 全リトライを実行
      vi.advanceTimersByTime(60_000);
      await flushPromises();

      // リトライ 1 (~1s)
      vi.advanceTimersByTime(1_100);
      await flushPromises();

      // リトライ 2 (~2s)
      vi.advanceTimersByTime(2_100);
      await flushPromises();

      // リトライ 3 (~4s)
      vi.advanceTimersByTime(4_100);
      await flushPromises();

      expect(mockCallbacks.onFailure).toHaveBeenCalledTimes(1);
      expect(mockCallbacks.onFailure).toHaveBeenCalledWith(expect.any(Error));
    });

    it("リトライ中にonRefreshが成功した場合、リトライが停止すること", async () => {
      const now = Date.now();
      const newExpiresAt = now + 3600_000;
      let callCount = 0;
      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount <= 1) {
            return Promise.reject(new Error("Temporary error"));
          }
          return Promise.resolve(newExpiresAt);
        }),
      });

      const expiresAt = now + 360_000;
      scheduler.start(expiresAt, mockCallbacks);

      // 初回リフレッシュ (失敗)
      vi.advanceTimersByTime(60_000);
      await flushPromises();

      // 1回目リトライ (成功)
      vi.advanceTimersByTime(1_100);
      await flushPromises();

      // onSuccessが呼ばれ、onFailureは呼ばれない
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(newExpiresAt);
      expect(mockCallbacks.onFailure).not.toHaveBeenCalled();
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------------------
  // reset / dispose
  // ---------------------------------------------------------------------------
  describe("reset / dispose", () => {
    it("reset()で既存タイマーがクリアされ新タイマーが設定されること", () => {
      const now = Date.now();
      const expiresAt = now + 600_000;
      scheduler.start(expiresAt, callbacks);

      // 新しい有効期限でリセット (20分後 → 15分後にリフレッシュ)
      const newExpiresAt = now + 1_200_000;
      scheduler.reset(newExpiresAt);

      expect(scheduler.isRunning()).toBe(true);

      // 旧タイマーの時間(5分)ではリフレッシュされない
      vi.advanceTimersByTime(300_000);
      expect(callbacks.onRefresh).not.toHaveBeenCalled();
    });

    it("dispose()で全タイマーがクリアされること", () => {
      const now = Date.now();
      const expiresAt = now + 600_000;
      scheduler.start(expiresAt, callbacks);

      scheduler.dispose();

      expect(scheduler.isRunning()).toBe(false);

      // タイマーが進んでもコールバックは呼ばれない
      vi.advanceTimersByTime(600_000);
      expect(callbacks.onRefresh).not.toHaveBeenCalled();
    });

    it("dispose()後にstart()を呼んでもエラーにならないこと", () => {
      scheduler.dispose();

      // dispose後のstart()はエラーにならない（ただし動作しない）
      expect(() => {
        const expiresAt = Date.now() + 600_000;
        scheduler.start(expiresAt, callbacks);
      }).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // エッジケース
  // ---------------------------------------------------------------------------
  describe("エッジケース", () => {
    it("start()を二重呼び出しした場合、前のタイマーがクリアされること", () => {
      const now = Date.now();
      const firstCallbacks = createMockCallbacks();
      const secondCallbacks = createMockCallbacks();

      // 1回目のstart (10分後に期限切れ → 5分後にリフレッシュ)
      scheduler.start(now + 600_000, firstCallbacks);

      // 2回目のstart (20分後に期限切れ → 15分後にリフレッシュ)
      scheduler.start(now + 1_200_000, secondCallbacks);

      // 5分後 - 1回目のタイマーが実行されないことを確認
      vi.advanceTimersByTime(300_000);
      expect(firstCallbacks.onRefresh).not.toHaveBeenCalled();
      expect(secondCallbacks.onRefresh).not.toHaveBeenCalled();
    });

    it("stop()を二重呼び出しした場合、エラーにならないこと", () => {
      const expiresAt = Date.now() + 600_000;
      scheduler.start(expiresAt, callbacks);

      expect(() => {
        scheduler.stop();
        scheduler.stop();
      }).not.toThrow();
    });

    it("configのデフォルト値が正しく適用されること", () => {
      const defaultScheduler = new TokenRefreshScheduler();

      expect(DEFAULT_CONFIG.refreshBeforeExpiryMs).toBe(300_000);
      expect(DEFAULT_CONFIG.maxRetries).toBe(3);
      expect(DEFAULT_CONFIG.retryBaseIntervalMs).toBe(1_000);

      defaultScheduler.dispose();
    });

    it("isRefreshing()が初期状態でfalseを返すこと", () => {
      expect(scheduler.isRefreshing()).toBe(false);
    });

    it("リフレッシュ中にisRefreshing()がtrueを返すこと", async () => {
      const now = Date.now();
      let resolveRefresh!: (value: number) => void;
      const refreshPromise = new Promise<number>((resolve) => {
        resolveRefresh = resolve;
      });

      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockReturnValue(refreshPromise),
      });

      // 即座にリフレッシュされるよう期限切れを設定
      const expiresAt = now - 1000;
      scheduler.start(expiresAt, mockCallbacks);

      vi.advanceTimersByTime(0);

      // リフレッシュ中はtrue
      expect(scheduler.isRefreshing()).toBe(true);

      // リフレッシュ完了
      resolveRefresh(now + 3600_000);
      await flushPromises();

      expect(scheduler.isRefreshing()).toBe(false);
    });

    it("リフレッシュ中にstart()が呼ばれてもリフレッシュが中断されないこと", async () => {
      const now = Date.now();
      let resolveRefresh!: (value: number) => void;
      const refreshPromise = new Promise<number>((resolve) => {
        resolveRefresh = resolve;
      });

      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockReturnValue(refreshPromise),
      });

      // 即座にリフレッシュを開始
      scheduler.start(now - 1000, mockCallbacks);
      vi.advanceTimersByTime(0);

      expect(scheduler.isRefreshing()).toBe(true);

      // リフレッシュ中にstartを再呼び出し
      const newCallbacks = createMockCallbacks();
      scheduler.start(now + 600_000, newCallbacks);

      // 元のリフレッシュを完了
      resolveRefresh(now + 3600_000);
      await flushPromises();

      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(1);
    });

    it("onSuccessが未定義でもリフレッシュ成功時にエラーにならないこと", async () => {
      const now = Date.now();
      const newExpiresAt = now + 3600_000;
      const mockCallbacks: TokenRefreshCallbacks = {
        onRefresh: vi.fn().mockResolvedValue(newExpiresAt),
        onFailure: vi.fn(),
        // onSuccess は undefined
      };

      const expiresAt = now + 360_000;
      scheduler.start(expiresAt, mockCallbacks);

      vi.advanceTimersByTime(60_000);
      await flushPromises();

      // エラーなく完了
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(1);
      expect(mockCallbacks.onFailure).not.toHaveBeenCalled();
    });

    it("onRefreshがnullを返した場合、リトライが実行されること", async () => {
      const now = Date.now();
      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockResolvedValue(null),
      });

      const expiresAt = now + 360_000;
      scheduler.start(expiresAt, mockCallbacks);

      // 初回リフレッシュ
      vi.advanceTimersByTime(60_000);
      await flushPromises();

      // null返却はリトライ対象 → 1回目リトライ (~1s)
      vi.advanceTimersByTime(1_100);
      await flushPromises();

      // 初回 + 1回目リトライ = 2回
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------------------
  // カスタム設定
  // ---------------------------------------------------------------------------
  describe("カスタム設定", () => {
    it("カスタム refreshBeforeExpiryMs が適用されること", () => {
      const now = Date.now();
      const config = createTestConfig({ refreshBeforeExpiryMs: 120_000 }); // 2分前
      const customScheduler = new TokenRefreshScheduler(config);
      const mockCallbacks = createMockCallbacks();

      // 10分後に期限切れ → 8分後にリフレッシュ
      customScheduler.start(now + 600_000, mockCallbacks);

      // 5分後 - まだ実行されない (デフォルトなら実行される)
      vi.advanceTimersByTime(300_000);
      expect(mockCallbacks.onRefresh).not.toHaveBeenCalled();

      // 8分後 - リフレッシュ実行
      vi.advanceTimersByTime(180_000);
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(1);

      customScheduler.dispose();
    });

    it("カスタム maxRetries が適用されること", async () => {
      const now = Date.now();
      const config = createTestConfig({ maxRetries: 1 });
      const customScheduler = new TokenRefreshScheduler(config);
      const mockCallbacks = createMockCallbacks({
        onRefresh: vi.fn().mockRejectedValue(new Error("Error")),
      });

      customScheduler.start(now + 360_000, mockCallbacks);

      // 初回リフレッシュ
      vi.advanceTimersByTime(60_000);
      await flushPromises();

      // 1回目リトライ (~1s)
      vi.advanceTimersByTime(1_100);
      await flushPromises();

      // maxRetries=1 なので、初回 + 1回リトライ = 2回
      expect(mockCallbacks.onRefresh).toHaveBeenCalledTimes(2);
      expect(mockCallbacks.onFailure).toHaveBeenCalledTimes(1);

      customScheduler.dispose();
    });
  });
});
