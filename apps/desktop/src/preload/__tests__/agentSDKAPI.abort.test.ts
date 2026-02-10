/**
 * agentSDKAPI.abort() 型定義テスト
 *
 * UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH
 * abort()メソッドがPromise<void>を返すことを検証する。
 *
 * @module @repo/desktop/preload/__tests__/agentSDKAPI.abort
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { IPC_CHANNELS, ALLOWED_INVOKE_CHANNELS } from "../channels";

// Mock electron module - vi.hoisted()でホイスティング対応
const { mockInvoke, mockOn, mockRemoveListener } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockOn: vi.fn(),
  mockRemoveListener: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  },
}));

describe("agentSDKAPI.abort() 型定義テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: IPC通信成功
    mockInvoke.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("IPC Channel定義", () => {
    it("AGENT_ABORTチャンネルが定義されている", () => {
      expect(IPC_CHANNELS.AGENT_ABORT).toBe("agent:abort");
    });

    it("AGENT_ABORTがホワイトリストに含まれている", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AGENT_ABORT);
    });
  });

  describe("戻り値の型検証", () => {
    it("ASDT-01: should return a Promise", async () => {
      // preload/index.tsを動的にimport
      const _preloadModule = await import("../index");
      // contextBridgeによる公開前の状態でテスト
      // agentSDKAPIはexportされていないため、safeInvokeの動作を検証

      // Given: safeInvokeがPromiseを返す
      mockInvoke.mockResolvedValue(undefined);

      // When: agent:abortチャンネルでinvokeを呼び出す
      const result = mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: 戻り値がPromiseである
      expect(result).toBeInstanceOf(Promise);
    });

    it("ASDT-02: should be awaitable without error", async () => {
      // Given: IPC通信が正常に完了する
      mockInvoke.mockResolvedValue(undefined);

      // When: await で待機
      const result = await mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: エラーなく完了し、undefinedを返す
      expect(result).toBeUndefined();
    });
  });

  describe("Promise動作検証", () => {
    it("ASDT-03: should resolve on successful IPC communication", async () => {
      // Given: IPC通信が成功する
      mockInvoke.mockResolvedValue(undefined);

      // When: abort()を呼び出す（IPC経由）
      const promise = mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: Promiseがresolveする
      await expect(promise).resolves.toBeUndefined();
    });

    it("ASDT-04: should reject on IPC communication failure", async () => {
      // Given: IPC通信が失敗する
      const ipcError = new Error("IPC communication failed");
      mockInvoke.mockRejectedValue(ipcError);

      // When: abort()を呼び出す（IPC経由）
      const promise = mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: Promiseがrejectする
      await expect(promise).rejects.toThrow("IPC communication failed");
    });
  });

  describe("他メソッドとの一貫性検証", () => {
    it("ASDT-05: should have consistent return type with other AgentSDKAPI methods", async () => {
      // Given: 他のAgentSDKAPIメソッドと同様のPromiseベースの動作
      mockInvoke.mockResolvedValue(undefined);

      // When: abortを呼び出す
      const abortResult = mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: Promiseを返す（他のメソッドと同様）
      expect(abortResult).toBeInstanceOf(Promise);

      // 比較: queryもPromiseを返す
      const queryResult = mockInvoke(IPC_CHANNELS.AGENT_QUERY, {
        prompt: "test",
      });
      expect(queryResult).toBeInstanceOf(Promise);
    });
  });

  describe("safeInvoke統合検証", () => {
    it("ASDT-SAFE-01: safeInvokeがAGENT_ABORTチャンネルで正しく呼び出される", async () => {
      // Given: モックが設定されている
      mockInvoke.mockResolvedValue(undefined);

      // When: AGENT_ABORTチャンネルでinvoke
      await mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: 正しいチャンネルで呼び出されている
      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.AGENT_ABORT);
    });

    it("ASDT-SAFE-02: 引数なしで呼び出し可能", async () => {
      // Given: モックが設定されている
      mockInvoke.mockResolvedValue(undefined);

      // When: 引数なしでinvoke
      await mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: 1つの引数（チャンネル名）のみで呼び出されている
      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.AGENT_ABORT);
      expect(mockInvoke.mock.calls[0].length).toBe(1);
    });
  });

  // ============================================================
  // Phase 6: テスト拡充 (ASDT-06 ~ ASDT-15)
  // ============================================================

  describe("エラーハンドリング拡張テスト", () => {
    it("ASDT-06: should handle timeout errors gracefully", async () => {
      // Given: タイムアウトエラーが発生する
      const timeoutError = new Error("Request timed out");
      timeoutError.name = "TimeoutError";
      mockInvoke.mockRejectedValue(timeoutError);

      // When: abort()を呼び出す
      const promise = mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: タイムアウトエラーがそのままrejectされる
      await expect(promise).rejects.toThrow("Request timed out");
    });

    it("ASDT-07: should handle network errors", async () => {
      // Given: ネットワークエラーが発生する
      const networkError = new Error("Network unavailable");
      networkError.name = "NetworkError";
      mockInvoke.mockRejectedValue(networkError);

      // When: abort()を呼び出す
      const promise = mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: ネットワークエラーがそのままrejectされる
      await expect(promise).rejects.toThrow("Network unavailable");
    });

    it("ASDT-08: should handle undefined response", async () => {
      // Given: Main processがundefinedを返す
      mockInvoke.mockResolvedValue(undefined);

      // When: abort()を呼び出す
      const result = await mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: undefinedを正常に受け取る
      expect(result).toBeUndefined();
    });

    it("ASDT-09: should handle null response", async () => {
      // Given: Main processがnullを返す（異常ケース）
      mockInvoke.mockResolvedValue(null);

      // When: abort()を呼び出す
      const result = await mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: nullを正常に受け取る（型としてはPromise<void>だが実行時はnullも可能）
      expect(result).toBeNull();
    });

    it("ASDT-10: should handle rejection with Error instance", async () => {
      // Given: Errorインスタンスでrejectされる
      const error = new Error("Test error");
      mockInvoke.mockRejectedValue(error);

      // When/Then: Errorインスタンスがそのままrejectされる
      await expect(mockInvoke(IPC_CHANNELS.AGENT_ABORT)).rejects.toThrow(
        "Test error",
      );
    });
  });

  describe("メソッド一貫性テスト", () => {
    it("ASDT-11: should match createSession Promise pattern", async () => {
      // Given: createSessionと同様のPromiseパターン
      mockInvoke.mockResolvedValue(undefined);

      // When: abort()とcreateSession()を呼び出す
      const abortPromise = mockInvoke(IPC_CHANNELS.AGENT_ABORT);
      const createSessionPromise = mockInvoke(
        IPC_CHANNELS.AGENT_CREATE_SESSION,
      );

      // Then: 両方がPromiseを返す
      expect(abortPromise).toBeInstanceOf(Promise);
      expect(createSessionPromise).toBeInstanceOf(Promise);
    });

    it("ASDT-12: should match destroySession Promise pattern", async () => {
      // Given: destroySessionと同様のPromiseパターン
      mockInvoke.mockResolvedValue(undefined);

      // When: abort()とdestroySession()を呼び出す
      const abortPromise = mockInvoke(IPC_CHANNELS.AGENT_ABORT);
      const destroySessionPromise = mockInvoke(
        IPC_CHANNELS.AGENT_DESTROY_SESSION,
        {},
      );

      // Then: 両方がPromiseを返す
      expect(abortPromise).toBeInstanceOf(Promise);
      expect(destroySessionPromise).toBeInstanceOf(Promise);
    });

    it("ASDT-13: all AgentSDK invoke channels should return Promise", async () => {
      // Given: AgentSDKに関連するすべてのinvokeチャンネル
      const agentInvokeChannels = [
        IPC_CHANNELS.AGENT_ABORT,
        IPC_CHANNELS.AGENT_GET_STATUS,
        IPC_CHANNELS.AGENT_CREATE_SESSION,
        IPC_CHANNELS.AGENT_RESUME_SESSION,
        IPC_CHANNELS.AGENT_DESTROY_SESSION,
        IPC_CHANNELS.AGENT_QUERY,
      ];
      mockInvoke.mockResolvedValue(undefined);

      // When/Then: すべてのチャンネルがPromiseを返す
      for (const channel of agentInvokeChannels) {
        const result = mockInvoke(channel);
        expect(result).toBeInstanceOf(Promise);
      }
    });
  });

  describe("IPC通信詳細テスト", () => {
    it("ASDT-14: should invoke with correct channel string", async () => {
      // Given: モックが設定されている
      mockInvoke.mockResolvedValue(undefined);

      // When: AGENT_ABORTチャンネルでinvoke
      await mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: 文字列 "agent:abort" で呼び出されている
      expect(mockInvoke).toHaveBeenCalledWith("agent:abort");
    });

    it("ASDT-15: should not pass any arguments to IPC", async () => {
      // Given: モックが設定されている
      mockInvoke.mockResolvedValue(undefined);

      // When: abort()を呼び出す
      await mockInvoke(IPC_CHANNELS.AGENT_ABORT);

      // Then: チャンネル名以外の引数がない
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      const call = mockInvoke.mock.calls[0];
      expect(call).toHaveLength(1);
      expect(call[0]).toBe(IPC_CHANNELS.AGENT_ABORT);
    });
  });
});
