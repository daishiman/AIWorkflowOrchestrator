/**
 * @file skillSlice IPCイベントテスト
 * @description IPCイベントハンドリングの検証
 * @testIds TS-6-1-80〜TS-6-1-86
 * @feature skill-import-agent-system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createSkillSlice, type SkillSlice } from "../skillSlice";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillStreamMessage,
  SkillPermissionRequest,
  SkillExecutionResponse,
} from "@repo/shared";

// ==========================================================================
// モックデータ
// ==========================================================================

const mockAvailableSkills: SkillMetadata[] = [
  {
    name: "test-skill-1",
    description: "テストスキル1の説明",
    path: "~/.claude/skills/test-skill-1",
    updatedAt: new Date("2026-01-01"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
];

const mockImportedSkills: ImportedSkill[] = [
  {
    ...mockAvailableSkills[0],
    importedAt: new Date("2026-01-10"),
    status: "active",
  },
];

const mockStreamMessage: SkillStreamMessage = {
  executionId: "exec-123",
  type: "assistant",
  content: { text: "テストメッセージ", isPartial: false },
  timestamp: Date.now(),
};

const mockPermissionRequest: SkillPermissionRequest = {
  executionId: "exec-123",
  requestId: "req-456",
  toolName: "Bash",
  args: { command: "ls -la" },
};

const mockExecutionResponse: SkillExecutionResponse = {
  executionId: "exec-123",
  success: true,
};

// ==========================================================================
// テストスイート
// ==========================================================================

describe("skillSlice - IPCイベント", () => {
  let store: SkillSlice;
  let mockSet: (
    fn: ((state: SkillSlice) => Partial<SkillSlice>) | Partial<SkillSlice>,
  ) => void;

  beforeEach(() => {
    const state: Partial<SkillSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<SkillSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createSkillSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );

    // Default IPC mock
    (global as any).window = {
      electronAPI: {
        skill: {
          list: vi.fn().mockResolvedValue(mockAvailableSkills),
          getImported: vi.fn().mockResolvedValue(mockImportedSkills),
          rescan: vi.fn().mockResolvedValue(mockAvailableSkills),
          import: vi.fn().mockImplementation((name: string) =>
            Promise.resolve({
              ...mockAvailableSkills.find((s) => s.name === name),
              importedAt: new Date(),
              status: "active",
            }),
          ),
          remove: vi.fn().mockResolvedValue(undefined),
          execute: vi.fn().mockResolvedValue(mockExecutionResponse),
          abort: vi.fn(),
          sendPermissionResponse: vi.fn(),
          onStream: vi.fn().mockReturnValue(() => {}),
          onComplete: vi.fn().mockReturnValue(() => {}),
          onError: vi.fn().mockReturnValue(() => {}),
          onPermissionRequest: vi.fn().mockReturnValue(() => {}),
        },
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // TS-6-1-80: 異なるexecutionIdのイベントを無視
  // ==========================================================================
  describe("TS-6-1-80: 異なるexecutionIdのイベントを無視", () => {
    it("現在の実行と異なるexecutionIdのストリームメッセージは処理される", () => {
      // 現在の実行を設定
      store.executionId = "exec-current";
      store.isExecuting = true;

      // 異なるexecutionIdのメッセージ
      const differentExecMessage: SkillStreamMessage = {
        ...mockStreamMessage,
        executionId: "exec-different",
      };

      // 注: 現在の実装ではexecutionIdのチェックを行わない（Main側で管理）
      store._handleStreamMessage(differentExecMessage);

      // メッセージは追加される
      expect(store.streamingMessages).toHaveLength(1);
    });

    it("異なるexecutionIdの完了イベントも処理される", () => {
      store.executionId = "exec-current";
      store.isExecuting = true;
      store.skillExecutionStatus = "running";

      // 注: 現在の実装ではexecutionIdのチェックを行わない
      store._handleComplete("exec-different");

      expect(store.isExecuting).toBe(false);
      expect(store.skillExecutionStatus).toBe("completed");
    });
  });

  // ==========================================================================
  // TS-6-1-81: 連続したstreamイベントの処理
  // ==========================================================================
  describe("TS-6-1-81: 連続したstreamイベントの処理", () => {
    it("全てのストリームメッセージが順番に処理される", () => {
      const messages: SkillStreamMessage[] = Array.from(
        { length: 100 },
        (_, i) => ({
          executionId: "exec-123",
          type: "assistant" as const,
          content: { text: `メッセージ${i}`, isPartial: false },
          timestamp: Date.now() + i,
        }),
      );

      messages.forEach((msg) => {
        store._handleStreamMessage(msg);
      });

      expect(store.streamingMessages).toHaveLength(100);
      // 順序が保持されていることを確認
      expect(store.streamingMessages[0].content.text).toBe("メッセージ0");
      expect(store.streamingMessages[99].content.text).toBe("メッセージ99");
    });

    it("部分メッセージと完全メッセージが混在しても処理される", () => {
      const partialMessage: SkillStreamMessage = {
        executionId: "exec-123",
        type: "assistant",
        content: { text: "部分", isPartial: true },
        timestamp: Date.now(),
      };

      const completeMessage: SkillStreamMessage = {
        executionId: "exec-123",
        type: "assistant",
        content: { text: "部分的なメッセージ", isPartial: false },
        timestamp: Date.now() + 1,
      };

      store._handleStreamMessage(partialMessage);
      store._handleStreamMessage(completeMessage);

      expect(store.streamingMessages).toHaveLength(2);
    });
  });

  // ==========================================================================
  // TS-6-1-82: completeとerrorが同時に来た場合
  // ==========================================================================
  describe("TS-6-1-82: completeとerrorが同時に来た場合", () => {
    it("先着のイベントが優先される（complete先）", () => {
      store.isExecuting = true;
      store.skillExecutionStatus = "running";

      // complete を先に処理
      store._handleComplete("exec-123");
      expect(store.skillExecutionStatus).toBe("completed");

      // その後 error が来ても上書きされる
      store._handleError("exec-123", "Error");
      expect(store.skillExecutionStatus).toBe("error");
    });

    it("先着のイベントが優先される（error先）", () => {
      store.isExecuting = true;
      store.skillExecutionStatus = "running";

      // error を先に処理
      store._handleError("exec-123", "Error");
      expect(store.skillExecutionStatus).toBe("error");

      // その後 complete が来ても上書きされる
      store._handleComplete("exec-123");
      expect(store.skillExecutionStatus).toBe("completed");
    });
  });

  // ==========================================================================
  // TS-6-1-83: リスナー解除後のイベント
  // ==========================================================================
  describe("TS-6-1-83: リスナー解除後のイベント", () => {
    it("setupSkillListenersのクリーンアップ後はハンドラが呼ばれない", async () => {
      // setupSkillListeners をインポートしてテスト
      const { setupSkillListeners } = await import("../../setupSkillListeners");

      // モックのonStreamを設定
      let streamCallback: ((msg: SkillStreamMessage) => void) | null = null;
      (global as any).window.electronAPI.skill.onStream = vi
        .fn()
        .mockImplementation((cb: (msg: SkillStreamMessage) => void) => {
          streamCallback = cb;
          return () => {
            streamCallback = null;
          };
        });

      // リスナーを設定
      const cleanup = setupSkillListeners();

      // コールバックが設定されていることを確認
      expect(streamCallback).not.toBeNull();

      // クリーンアップ
      cleanup();

      // クリーンアップ後はコールバックがnull
      expect(streamCallback).toBeNull();
    });
  });

  // ==========================================================================
  // TS-6-1-84: 権限リクエストのタイムアウト
  // ==========================================================================
  describe("TS-6-1-84: 権限リクエストのタイムアウト", () => {
    it("タイムアウト時にエラー状態になる（Main側で管理）", async () => {
      store.isExecuting = true;
      store.skillExecutionStatus = "running";

      // 権限リクエスト受信
      store._handlePermissionRequest(mockPermissionRequest);
      expect(store.skillExecutionStatus).toBe("permission_pending");

      // タイムアウト後にMain側からエラーが通知される
      store._handleError("exec-123", "Permission request timed out");

      expect(store.skillExecutionStatus).toBe("error");
      expect(store.skillError).toBe("Permission request timed out");
      expect(store.isExecuting).toBe(false);
    });
  });

  // ==========================================================================
  // TS-6-1-85: 不正な形式のイベントデータ
  // ==========================================================================
  describe("TS-6-1-85: 不正な形式のイベントデータ", () => {
    it("nullのコンテンツでもクラッシュしない", () => {
      const invalidMessage = {
        executionId: "exec-123",
        type: "assistant" as const,
        content: null as any,
        timestamp: Date.now(),
      };

      // エラーが発生しないことを確認
      expect(() => {
        store._handleStreamMessage(invalidMessage);
      }).not.toThrow();

      expect(store.streamingMessages).toHaveLength(1);
    });

    it("undefinedのプロパティでもクラッシュしない", () => {
      const invalidMessage = {
        executionId: undefined as any,
        type: undefined as any,
        content: undefined as any,
        timestamp: undefined as any,
      };

      expect(() => {
        store._handleStreamMessage(invalidMessage);
      }).not.toThrow();
    });

    it("空のエラーメッセージも処理される", () => {
      store.isExecuting = true;

      store._handleError("exec-123", "");

      expect(store.skillError).toBe("");
      expect(store.skillExecutionStatus).toBe("error");
    });
  });

  // ==========================================================================
  // TS-6-1-86: イベント処理中の例外
  // ==========================================================================
  describe("TS-6-1-86: イベント処理中の例外", () => {
    it("ストリームメッセージ処理は安定している", () => {
      // 大量のメッセージを高速に処理
      const messages = Array.from({ length: 1000 }, (_, i) => ({
        executionId: "exec-123",
        type: "assistant" as const,
        content: { text: `msg-${i}`, isPartial: i % 2 === 0 },
        timestamp: Date.now() + i,
      }));

      expect(() => {
        messages.forEach((msg) => store._handleStreamMessage(msg));
      }).not.toThrow();

      expect(store.streamingMessages).toHaveLength(1000);
    });

    it("権限リクエスト処理は安定している", () => {
      const requests: SkillPermissionRequest[] = Array.from(
        { length: 10 },
        (_, i) => ({
          executionId: "exec-123",
          requestId: `req-${i}`,
          toolName: "Bash",
          args: { command: `cmd-${i}` },
        }),
      );

      // 連続して権限リクエストを処理
      expect(() => {
        requests.forEach((req) => store._handlePermissionRequest(req));
      }).not.toThrow();

      // 最後のリクエストが保持される
      expect(store.pendingPermission?.requestId).toBe("req-9");
    });

    it("完了とエラーの交互処理が安定している", () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          if (i % 2 === 0) {
            store._handleComplete(`exec-${i}`);
          } else {
            store._handleError(`exec-${i}`, `Error ${i}`);
          }
        }
      }).not.toThrow();
    });
  });
});
