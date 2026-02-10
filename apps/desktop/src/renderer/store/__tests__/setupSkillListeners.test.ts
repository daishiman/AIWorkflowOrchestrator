/**
 * @file setupSkillListeners テスト
 * @description TASK-FIX-6-1-STATE-CENTRALIZATION Phase 6: テスト拡充
 * @testIds TS-6-1-81〜TS-6-1-88
 * @feature skill-import-agent-system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createStore, type StoreApi } from "zustand";
import { setupSkillListenersWithStore } from "../setupSkillListeners";
import { createAgentSlice, type AgentSlice } from "../slices/agentSlice";
import type { SkillStreamMessage, SkillPermissionRequest } from "@repo/shared";

describe("setupSkillListeners", () => {
  let store: StoreApi<AgentSlice>;
  let mockOnStream: ReturnType<typeof vi.fn>;
  let mockOnComplete: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;
  let mockOnPermissionRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a Zustand store using createStore
    store = createStore<AgentSlice>()(createAgentSlice);

    mockOnStream = vi.fn().mockReturnValue(vi.fn());
    mockOnComplete = vi.fn().mockReturnValue(vi.fn());
    mockOnError = vi.fn().mockReturnValue(vi.fn());
    mockOnPermissionRequest = vi.fn().mockReturnValue(vi.fn());

    (
      global as unknown as {
        window: {
          electronAPI: {
            skill: {
              onStream: ReturnType<typeof vi.fn>;
              onComplete: ReturnType<typeof vi.fn>;
              onError: ReturnType<typeof vi.fn>;
              onPermissionRequest: ReturnType<typeof vi.fn>;
            };
          };
        };
      }
    ).window = {
      electronAPI: {
        skill: {
          onStream: mockOnStream,
          onComplete: mockOnComplete,
          onError: mockOnError,
          onPermissionRequest: mockOnPermissionRequest,
        },
      },
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ==========================================================================
  // リスナー登録テスト（TS-6-1-81〜TS-6-1-82）
  // ==========================================================================
  describe("リスナー登録", () => {
    it("TS-6-1-81: 全てのリスナーが登録される", () => {
      setupSkillListenersWithStore(store);

      expect(mockOnStream).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalled();
      expect(mockOnPermissionRequest).toHaveBeenCalled();
    });

    it("TS-6-1-82: electronAPIが未定義の場合、エラーなく終了する", () => {
      (
        global as unknown as {
          window: { electronAPI: undefined };
        }
      ).window = {
        electronAPI: undefined,
      };

      const cleanup = setupSkillListenersWithStore(store);

      expect(cleanup).toBeInstanceOf(Function);
      cleanup(); // エラーなく実行できる
    });
  });

  // ==========================================================================
  // メッセージハンドリングテスト（TS-6-1-83〜TS-6-1-86）
  // ==========================================================================
  describe("メッセージハンドリング", () => {
    it("TS-6-1-83: onStreamコールバックでstreamingMessagesが更新される", () => {
      setupSkillListenersWithStore(store);

      // コールバックを取得して呼び出し
      const callback = mockOnStream.mock.calls[0][0];
      const msg: SkillStreamMessage = {
        executionId: "exec-123",
        type: "assistant",
        content: { text: "test", isPartial: false },
        timestamp: Date.now(),
      };

      callback(msg);

      expect(store.getState().streamingMessages).toContainEqual(msg);
    });

    it("TS-6-1-84: onCompleteコールバックでisExecutingがfalseになる", () => {
      store.setState({ isExecuting: true });
      setupSkillListenersWithStore(store);

      const callback = mockOnComplete.mock.calls[0][0];
      callback({ executionId: "exec-123" });

      expect(store.getState().isExecuting).toBe(false);
      expect(store.getState().skillExecutionStatus).toBe("completed");
    });

    it("TS-6-1-85: onErrorコールバックでskillErrorが設定される", () => {
      setupSkillListenersWithStore(store);

      const callback = mockOnError.mock.calls[0][0];
      callback({ executionId: "exec-123", error: "Test error" });

      expect(store.getState().skillError).toBe("Test error");
      expect(store.getState().skillExecutionStatus).toBe("error");
    });

    it("TS-6-1-86: onPermissionRequestコールバックでpendingPermissionが設定される", () => {
      setupSkillListenersWithStore(store);

      const callback = mockOnPermissionRequest.mock.calls[0][0];
      const req: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "ls" },
      };

      callback(req);

      expect(store.getState().pendingPermission).toEqual(req);
      expect(store.getState().skillExecutionStatus).toBe("permission_pending");
    });
  });

  // ==========================================================================
  // クリーンアップテスト（TS-6-1-87〜TS-6-1-88）
  // ==========================================================================
  describe("クリーンアップ", () => {
    it("TS-6-1-87: cleanup関数を呼び出すと全リスナーが解除される", () => {
      const unsubStream = vi.fn();
      const unsubComplete = vi.fn();
      const unsubError = vi.fn();
      const unsubPermission = vi.fn();

      mockOnStream.mockReturnValue(unsubStream);
      mockOnComplete.mockReturnValue(unsubComplete);
      mockOnError.mockReturnValue(unsubError);
      mockOnPermissionRequest.mockReturnValue(unsubPermission);

      const cleanup = setupSkillListenersWithStore(store);
      cleanup();

      expect(unsubStream).toHaveBeenCalled();
      expect(unsubComplete).toHaveBeenCalled();
      expect(unsubError).toHaveBeenCalled();
      expect(unsubPermission).toHaveBeenCalled();
    });

    it("TS-6-1-88: 一部のリスナーがundefinedでもクリーンアップが正常に動作する", () => {
      mockOnStream.mockReturnValue(undefined);
      mockOnComplete.mockReturnValue(vi.fn());
      mockOnError.mockReturnValue(undefined);
      mockOnPermissionRequest.mockReturnValue(vi.fn());

      const cleanup = setupSkillListenersWithStore(store);

      expect(() => cleanup()).not.toThrow();
    });
  });

  // ==========================================================================
  // 追加のエッジケーステスト
  // ==========================================================================
  describe("エッジケース", () => {
    it("window.electronAPI.skillがundefinedの場合、空のクリーンアップ関数を返す", () => {
      (
        global as unknown as {
          window: { electronAPI: { skill: undefined } };
        }
      ).window = {
        electronAPI: { skill: undefined },
      };

      const cleanup = setupSkillListenersWithStore(store);

      expect(cleanup).toBeInstanceOf(Function);
      expect(() => cleanup()).not.toThrow();
    });

    it("複数のメッセージが連続して受信された場合、全て順番に追加される", () => {
      setupSkillListenersWithStore(store);

      const callback = mockOnStream.mock.calls[0][0];

      for (let i = 0; i < 5; i++) {
        callback({
          executionId: "exec-123",
          type: "assistant",
          content: { text: `message-${i}`, isPartial: false },
          timestamp: Date.now() + i,
        });
      }

      const messages = store.getState().streamingMessages;
      expect(messages).toHaveLength(5);
      expect(messages[0].content.text).toBe("message-0");
      expect(messages[4].content.text).toBe("message-4");
    });

    it("エラー後に完了イベントが発生した場合、状態が正しく更新される", () => {
      store.setState({
        isExecuting: true,
        skillExecutionStatus: "running",
      });
      setupSkillListenersWithStore(store);

      // エラーイベント
      const errorCallback = mockOnError.mock.calls[0][0];
      errorCallback({ executionId: "exec-123", error: "Error occurred" });

      expect(store.getState().skillExecutionStatus).toBe("error");
      expect(store.getState().isExecuting).toBe(false);

      // 完了イベント（エラー後）
      const completeCallback = mockOnComplete.mock.calls[0][0];
      completeCallback({ executionId: "exec-123" });

      // 完了状態に上書きされる
      expect(store.getState().skillExecutionStatus).toBe("completed");
    });
  });
});
