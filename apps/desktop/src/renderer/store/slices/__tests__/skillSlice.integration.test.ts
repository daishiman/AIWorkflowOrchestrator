/**
 * @file skillSlice 統合テスト
 * @description エンドツーエンドのフロー検証
 * @testIds TS-6-1-90〜TS-6-1-95
 * @feature skill-import-agent-system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createSkillSlice, type SkillSlice } from "../skillSlice";
import type {
  SkillMetadata,
  ImportedSkill,
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
  {
    name: "test-skill-3",
    description: "テストスキル3の説明",
    path: "~/.claude/skills/test-skill-3",
    updatedAt: new Date("2026-01-03"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
];

const mockImportedSkills: ImportedSkill[] = [];

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

describe("skillSlice - 統合テスト", () => {
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
  // TS-6-1-90: スキルリスト取得→選択→実行フロー
  // ==========================================================================
  describe("TS-6-1-90: スキルリスト取得→選択→実行フロー", () => {
    it("全工程が正常に完了する", async () => {
      // Step 1: スキルリスト取得
      expect(store.availableSkillsMetadata).toHaveLength(0);
      await store.fetchSkills();
      expect(store.availableSkillsMetadata).toHaveLength(3);
      expect(store.isLoadingSkills).toBe(false);

      // Step 2: スキルをインポート
      await store.importSkill("test-skill-1");
      expect(store.importedSkills).toHaveLength(1);
      expect(store.availableSkillsMetadata).toHaveLength(2);

      // Step 3: スキル選択
      store.selectSkillByName("test-skill-1");
      expect(store.selectedSkillName).toBe("test-skill-1");

      // Step 4: スキル実行
      await store.executeSkill("テストプロンプト");
      expect(store.isExecuting).toBe(true);
      expect(store.skillExecutionStatus).toBe("running");
      expect(store.executionId).toBe("exec-123");

      // Step 5: ストリーミングメッセージ受信
      store._handleStreamMessage({
        executionId: "exec-123",
        type: "assistant",
        content: { text: "実行中...", isPartial: true },
        timestamp: Date.now(),
      });
      expect(store.streamingMessages).toHaveLength(1);

      // Step 6: 完了
      store._handleComplete("exec-123");
      expect(store.isExecuting).toBe(false);
      expect(store.skillExecutionStatus).toBe("completed");
    });
  });

  // ==========================================================================
  // TS-6-1-91: スキャン→インポート→実行フロー
  // ==========================================================================
  describe("TS-6-1-91: スキャン→インポート→実行フロー", () => {
    it("全工程が正常に完了する", async () => {
      // Step 1: 初期状態確認
      expect(store.availableSkillsMetadata).toHaveLength(0);

      // Step 2: スキルをスキャン
      await store.rescanSkills();
      expect(store.availableSkillsMetadata).toHaveLength(3);
      expect(store.isScanning).toBe(false);

      // Step 3: 複数スキルをインポート
      await store.importSkill("test-skill-1");
      await store.importSkill("test-skill-2");
      expect(store.importedSkills).toHaveLength(2);

      // Step 4: スキル選択と実行
      store.selectSkillByName("test-skill-2");
      await store.executeSkill("スキャン後のテスト");

      expect(store.isExecuting).toBe(true);
      expect(store.executionId).toBe("exec-123");

      // Step 5: 完了
      store._handleComplete("exec-123");
      expect(store.skillExecutionStatus).toBe("completed");
    });
  });

  // ==========================================================================
  // TS-6-1-92: 実行→権限要求→承認→完了フロー
  // ==========================================================================
  describe("TS-6-1-92: 実行→権限要求→承認→完了フロー", () => {
    it("全工程が正常に完了する", async () => {
      // Step 1: 準備
      await store.fetchSkills();
      await store.importSkill("test-skill-1");
      store.selectSkillByName("test-skill-1");

      // Step 2: 実行開始
      await store.executeSkill("権限が必要なタスク");
      expect(store.skillExecutionStatus).toBe("running");

      // Step 3: 権限リクエスト受信
      store._handlePermissionRequest(mockPermissionRequest);
      expect(store.skillExecutionStatus).toBe("permission_pending");
      expect(store.pendingPermission).not.toBeNull();
      expect(store.pendingPermission?.toolName).toBe("Bash");

      // Step 4: 権限承認
      store.respondToSkillPermission(true, true);
      expect(store.pendingPermission).toBeNull();
      expect(
        (global as any).window.electronAPI.skill.sendPermissionResponse,
      ).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: true,
        rememberChoice: true,
      });

      // Step 5: 追加のストリーミングメッセージ
      store._handleStreamMessage({
        executionId: "exec-123",
        type: "tool_result",
        content: { text: "コマンド実行結果", isPartial: false },
        timestamp: Date.now(),
      });
      expect(store.streamingMessages).toHaveLength(1);

      // Step 6: 完了
      store._handleComplete("exec-123");
      expect(store.skillExecutionStatus).toBe("completed");
      expect(store.isExecuting).toBe(false);
    });
  });

  // ==========================================================================
  // TS-6-1-93: 実行→権限要求→拒否→エラーフロー
  // ==========================================================================
  describe("TS-6-1-93: 実行→権限要求→拒否→エラーフロー", () => {
    it("全工程が正常に完了する", async () => {
      // Step 1: 準備
      await store.fetchSkills();
      await store.importSkill("test-skill-1");
      store.selectSkillByName("test-skill-1");

      // Step 2: 実行開始
      await store.executeSkill("危険なタスク");
      expect(store.skillExecutionStatus).toBe("running");

      // Step 3: 権限リクエスト受信
      store._handlePermissionRequest({
        ...mockPermissionRequest,
        toolName: "Write",
        args: { path: "/etc/passwd" },
      });
      expect(store.skillExecutionStatus).toBe("permission_pending");

      // Step 4: 権限拒否
      store.respondToSkillPermission(false);
      expect(store.pendingPermission).toBeNull();
      expect(
        (global as any).window.electronAPI.skill.sendPermissionResponse,
      ).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: false,
        rememberChoice: false,
      });

      // Step 5: エラー通知（Main側から）
      store._handleError("exec-123", "User denied permission");
      expect(store.skillExecutionStatus).toBe("error");
      expect(store.skillError).toBe("User denied permission");
      expect(store.isExecuting).toBe(false);
    });
  });

  // ==========================================================================
  // TS-6-1-94: 複数スキルの連続実行
  // ==========================================================================
  describe("TS-6-1-94: 複数スキルの連続実行", () => {
    it("全て正常に完了する", async () => {
      // 準備
      await store.fetchSkills();
      await store.importSkill("test-skill-1");
      await store.importSkill("test-skill-2");
      await store.importSkill("test-skill-3");

      // 実行カウンター
      let executionCount = 0;
      (global as any).window.electronAPI.skill.execute = vi
        .fn()
        .mockImplementation(() => {
          executionCount++;
          return Promise.resolve({
            executionId: `exec-${executionCount}`,
            success: true,
          });
        });

      // スキル1実行
      store.selectSkillByName("test-skill-1");
      await store.executeSkill("タスク1");
      store._handleComplete("exec-1");
      expect(store.skillExecutionStatus).toBe("completed");

      // ストリーミングメッセージをクリア
      store.clearStreamingMessages();

      // スキル2実行
      store.selectSkillByName("test-skill-2");
      await store.executeSkill("タスク2");
      store._handleComplete("exec-2");
      expect(store.skillExecutionStatus).toBe("completed");

      // スキル3実行
      store.selectSkillByName("test-skill-3");
      await store.executeSkill("タスク3");
      store._handleComplete("exec-3");
      expect(store.skillExecutionStatus).toBe("completed");

      // 全て実行されたことを確認
      expect(executionCount).toBe(3);
    });
  });

  // ==========================================================================
  // TS-6-1-95: エラー後のリカバリーフロー
  // ==========================================================================
  describe("TS-6-1-95: エラー後のリカバリーフロー", () => {
    it("正常に回復する", async () => {
      // 準備
      await store.fetchSkills();
      await store.importSkill("test-skill-1");
      store.selectSkillByName("test-skill-1");

      // Step 1: 最初の実行でエラー
      (global as any).window.electronAPI.skill.execute = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValue(mockExecutionResponse);

      await store.executeSkill("失敗するタスク");
      expect(store.skillExecutionStatus).toBe("error");
      expect(store.skillError).toContain("実行開始に失敗");

      // Step 2: エラーをクリア
      store.clearError();
      expect(store.skillError).toBeNull();

      // Step 3: 再実行（成功）
      await store.executeSkill("リトライタスク");
      expect(store.skillExecutionStatus).toBe("running");
      expect(store.isExecuting).toBe(true);

      // Step 4: ストリーミングメッセージ受信
      store._handleStreamMessage({
        executionId: "exec-123",
        type: "assistant",
        content: { text: "リカバリー成功", isPartial: false },
        timestamp: Date.now(),
      });

      // Step 5: 完了
      store._handleComplete("exec-123");
      expect(store.skillExecutionStatus).toBe("completed");
      expect(store.isExecuting).toBe(false);
      expect(store.streamingMessages).toHaveLength(1);
      expect(store.streamingMessages[0].content.text).toBe("リカバリー成功");
    });

    it("複数のエラーからも回復できる", async () => {
      // 準備
      store.selectedSkillName = "test-skill-1";

      // エラー1: 実行エラー
      store._handleError("exec-1", "Error 1");
      expect(store.skillExecutionStatus).toBe("error");

      // クリアして再実行
      store.clearError();
      await store.executeSkill("リトライ1");
      store._handleComplete("exec-123");

      // エラー2: 別のエラー
      await store.executeSkill("失敗タスク2");
      store._handleError("exec-2", "Error 2");
      expect(store.skillError).toBe("Error 2");

      // クリアして再実行
      store.clearError();
      await store.executeSkill("リトライ2");
      store._handleComplete("exec-123");

      expect(store.skillExecutionStatus).toBe("completed");
    });
  });
});
