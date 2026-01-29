/**
 * @file skillSlice エッジケーステスト
 * @description 境界値・異常系のテスト
 * @testIds TS-6-1-60〜TS-6-1-69
 * @feature skill-import-agent-system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createSkillSlice, type SkillSlice } from "../skillSlice";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillStreamMessage,
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
  {
    name: "test-skill-2",
    description: "テストスキル2の説明",
    path: "~/.claude/skills/test-skill-2",
    updatedAt: new Date("2026-01-02"),
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

const mockExecutionResponse: SkillExecutionResponse = {
  executionId: "exec-123",
  success: true,
};

// 大量のストリーミングメッセージ（TS-6-1-66用）
const mockLargeStreamingMessages: SkillStreamMessage[] = Array.from(
  { length: 1000 },
  (_, i) => ({
    executionId: "exec-123",
    type: "assistant" as const,
    content: { text: `メッセージ ${i}`, isPartial: false },
    timestamp: Date.now() + i,
  }),
);

// ==========================================================================
// テストスイート
// ==========================================================================

describe("skillSlice - エッジケース", () => {
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
  // TS-6-1-60: 重複呼び出し
  // ==========================================================================
  describe("TS-6-1-60: fetchSkills中に再度fetchSkillsを呼ぶ", () => {
    it("最後の呼び出しが有効になる", async () => {
      // 最初の呼び出しは遅延
      let resolveFirst: (value: SkillMetadata[]) => void;
      const firstPromise = new Promise<SkillMetadata[]>((resolve) => {
        resolveFirst = resolve;
      });
      (global as any).window.electronAPI.skill.list = vi
        .fn()
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValueOnce([mockAvailableSkills[0]]);

      // 並行して2回呼び出し
      const promise1 = store.fetchSkills();
      const promise2 = store.fetchSkills();

      // 最初のPromiseを解決
      resolveFirst!([mockAvailableSkills[1]]);

      await Promise.all([promise1, promise2]);

      // 両方の呼び出しが処理される（最後の状態が反映される）
      expect(store.isLoadingSkills).toBe(false);
    });
  });

  // ==========================================================================
  // TS-6-1-61: 重複インポート
  // ==========================================================================
  describe("TS-6-1-61: importSkill中に同じスキルをimport", () => {
    it("同じスキルの重複インポートはエラーにならない", async () => {
      store.availableSkillsMetadata = [...mockAvailableSkills];
      store.importedSkills = [];

      // 並行して同じスキルをインポート
      await Promise.all([
        store.importSkill("test-skill-1"),
        store.importSkill("test-skill-1"),
      ]);

      // エラーが発生していないことを確認（IPCが2回呼ばれる）
      expect(
        (global as any).window.electronAPI.skill.import,
      ).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================================================
  // TS-6-1-62: 存在しないスキルの削除
  // ==========================================================================
  describe("TS-6-1-62: 存在しないスキルをremove", () => {
    it("存在しないスキルを削除してもエラーにならない", async () => {
      store.importedSkills = [...mockImportedSkills];

      await store.removeSkill("non-existent-skill");

      // エラーが設定されていないことを確認
      expect(store.skillError).toBeNull();
      // 既存のスキルは維持される
      expect(store.importedSkills).toHaveLength(1);
    });

    it("IPCエラー時にエラーが設定される", async () => {
      (global as any).window.electronAPI.skill.remove = vi
        .fn()
        .mockRejectedValue(new Error("Skill not found"));

      await store.removeSkill("non-existent-skill");

      expect(store.skillError).toContain("スキルの削除に失敗");
    });
  });

  // ==========================================================================
  // TS-6-1-63: 実行中に再実行
  // ==========================================================================
  describe("TS-6-1-63: 実行中にexecuteSkillを呼ぶ", () => {
    it("新しい実行が開始される", async () => {
      store.selectedSkillName = "test-skill-1";
      store.isExecuting = true;
      store.executionId = "old-exec-123";
      store.streamingMessages = [mockLargeStreamingMessages[0]];

      await store.executeSkill("新しいプロンプト");

      // 新しい実行が開始される
      expect(store.executionId).toBe("exec-123");
      // ストリーミングメッセージはクリアされる
      expect(store.streamingMessages).toEqual([]);
    });
  });

  // ==========================================================================
  // TS-6-1-64: 権限待ち中にabort
  // ==========================================================================
  describe("TS-6-1-64: 権限待ち中にabortExecution", () => {
    it("キャンセル処理が実行される", () => {
      store.isExecuting = true;
      store.executionId = "exec-123";
      store.skillExecutionStatus = "permission_pending";
      store.pendingPermission = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "ls" },
      };

      store.abortExecution();

      expect(store.isExecuting).toBe(false);
      expect(store.skillExecutionStatus).toBe("cancelled");
      expect(
        (global as any).window.electronAPI.skill.abort,
      ).toHaveBeenCalledWith("exec-123");
    });
  });

  // ==========================================================================
  // TS-6-1-65: 空のプロンプト
  // ==========================================================================
  describe("TS-6-1-65: 空のpromptでexecuteSkill", () => {
    it("空のプロンプトでも実行される（バリデーションはMain側で行う）", async () => {
      store.selectedSkillName = "test-skill-1";

      await store.executeSkill("");

      // IPCが呼び出される（バリデーションはMain側）
      expect(
        (global as any).window.electronAPI.skill.execute,
      ).toHaveBeenCalledWith({
        skillId: "test-skill-1",
        prompt: "",
      });
    });
  });

  // ==========================================================================
  // TS-6-1-66: 大量のストリーミングメッセージ
  // ==========================================================================
  describe("TS-6-1-66: streamingMessagesが大量の場合", () => {
    it("パフォーマンス問題なく処理される", () => {
      const startTime = performance.now();

      // 1000件のメッセージを追加
      mockLargeStreamingMessages.forEach((msg) => {
        store._handleStreamMessage(msg);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 1000件のメッセージ追加が1秒未満で完了
      expect(duration).toBeLessThan(1000);
      expect(store.streamingMessages).toHaveLength(1000);
    });
  });

  // ==========================================================================
  // TS-6-1-67: 同時に複数のスキルをインポート
  // ==========================================================================
  describe("TS-6-1-67: 同時に複数のスキルをインポート", () => {
    it("全て成功する", async () => {
      store.availableSkillsMetadata = [...mockAvailableSkills];
      store.importedSkills = [];

      await Promise.all([
        store.importSkill("test-skill-1"),
        store.importSkill("test-skill-2"),
      ]);

      // 両方のスキルがインポートされる
      expect(
        (global as any).window.electronAPI.skill.import,
      ).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================================================
  // TS-6-1-68: IPC APIがundefinedの場合
  // ==========================================================================
  describe("TS-6-1-68: IPC APIがundefinedの場合", () => {
    beforeEach(() => {
      (global as any).window = {
        electronAPI: undefined,
      };
    });

    it("fetchSkillsがエラーを設定する", async () => {
      await store.fetchSkills();
      expect(store.skillError).toContain("Skill API not available");
    });

    it("rescanSkillsがエラーを設定する", async () => {
      await store.rescanSkills();
      expect(store.skillError).toContain("Skill API not available");
    });

    it("importSkillがエラーを設定する", async () => {
      await store.importSkill("test-skill-1");
      expect(store.skillError).toContain("Skill API not available");
    });

    it("removeSkillがエラーを設定する", async () => {
      await store.removeSkill("test-skill-1");
      expect(store.skillError).toContain("Skill API not available");
    });

    it("executeSkillがエラーを設定する", async () => {
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");
      expect(store.skillError).toContain("Skill API not available");
      expect(store.skillExecutionStatus).toBe("error");
    });
  });

  // ==========================================================================
  // TS-6-1-69: 型が不正なレスポンス
  // ==========================================================================
  describe("TS-6-1-69: 型が不正なレスポンスを受け取った場合", () => {
    it("execute時に不正なレスポンスを処理する", async () => {
      (global as any).window.electronAPI.skill.execute = vi
        .fn()
        .mockResolvedValue({
          executionId: null, // 不正：nullは期待されない
          success: "invalid", // 不正：booleanを期待
        });

      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");

      // executionIdがnullでも処理される（Main側の責任）
      expect(store.executionId).toBeNull();
    });

    it("_handleStreamMessageで不正な形式を処理する", () => {
      // 不正なメッセージでも追加される（型チェックはランタイムで行わない）
      const invalidMessage = {
        executionId: "exec-123",
        type: "unknown" as any,
        content: null as any,
        timestamp: "invalid" as any,
      };

      store._handleStreamMessage(invalidMessage);

      expect(store.streamingMessages).toHaveLength(1);
    });
  });
});
