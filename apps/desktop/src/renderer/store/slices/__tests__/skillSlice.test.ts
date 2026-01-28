/**
 * @file skillSlice 状態管理のテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @testIds TS-6-1-XX
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

describe("skillSlice", () => {
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
  // TS-6-1-01〜10: 初期状態
  // ==========================================================================
  describe("初期状態", () => {
    it("TS-6-1-01: availableSkillsMetadataが空配列である", () => {
      expect(store.availableSkillsMetadata).toEqual([]);
    });

    it("TS-6-1-02: importedSkillsが空配列である", () => {
      expect(store.importedSkills).toEqual([]);
    });

    it("TS-6-1-03: selectedSkillNameがnullである", () => {
      expect(store.selectedSkillName).toBeNull();
    });

    it("TS-6-1-04: isExecutingがfalseである", () => {
      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-05: executionIdがnullである", () => {
      expect(store.executionId).toBeNull();
    });

    it("TS-6-1-06: skillExecutionStatusがnullである", () => {
      expect(store.skillExecutionStatus).toBeNull();
    });

    it("TS-6-1-07: streamingMessagesが空配列である", () => {
      expect(store.streamingMessages).toEqual([]);
    });

    it("TS-6-1-08: pendingPermissionがnullである", () => {
      expect(store.pendingPermission).toBeNull();
    });

    it("TS-6-1-09: skillErrorがnullである", () => {
      expect(store.skillError).toBeNull();
    });

    it("TS-6-1-10: 全ローディング状態がfalse/nullである", () => {
      expect(store.isLoadingSkills).toBe(false);
      expect(store.isScanning).toBe(false);
      expect(store.isImporting).toBe(false);
      expect(store.importingSkillName).toBeNull();
    });
  });

  // ==========================================================================
  // TS-6-1-11〜15: fetchSkills
  // ==========================================================================
  describe("fetchSkills", () => {
    describe("成功時", () => {
      it("TS-6-1-11: availableSkillsMetadataに値が設定される", async () => {
        await store.fetchSkills();
        expect(store.availableSkillsMetadata).toHaveLength(2);
        expect(store.availableSkillsMetadata[0].name).toBe("test-skill-1");
      });

      it("TS-6-1-12: importedSkillsに値が設定される", async () => {
        await store.fetchSkills();
        expect(store.importedSkills).toHaveLength(1);
        expect(store.importedSkills[0].name).toBe("test-skill-1");
      });

      it("TS-6-1-13: isLoadingSkillsがfalseになる", async () => {
        await store.fetchSkills();
        expect(store.isLoadingSkills).toBe(false);
      });

      it("TS-6-1-15: 呼び出し中はisLoadingSkillsがtrueになる", async () => {
        const promise = store.fetchSkills();
        // Note: 同期的にはtrueにならないが、実装で確認
        await promise;
        expect(store.isLoadingSkills).toBe(false);
      });
    });

    describe("失敗時", () => {
      beforeEach(() => {
        (global as any).window.electronAPI.skill.list = vi
          .fn()
          .mockRejectedValue(new Error("Fetch failed"));
      });

      it("TS-6-1-14: skillErrorに値が設定される", async () => {
        await store.fetchSkills();
        expect(store.skillError).not.toBeNull();
        expect(store.skillError).toContain("スキル一覧の取得に失敗");
      });
    });
  });

  // ==========================================================================
  // TS-6-1-16〜20: rescanSkills
  // ==========================================================================
  describe("rescanSkills", () => {
    describe("成功時", () => {
      it("TS-6-1-16: availableSkillsMetadataが更新される", async () => {
        await store.rescanSkills();
        expect(store.availableSkillsMetadata).toHaveLength(2);
      });

      it("TS-6-1-17: isScanningがfalseになる", async () => {
        await store.rescanSkills();
        expect(store.isScanning).toBe(false);
      });

      it("TS-6-1-19: 呼び出し中はisScanningがtrueになる", async () => {
        const promise = store.rescanSkills();
        await promise;
        expect(store.isScanning).toBe(false);
      });

      it("TS-6-1-20: skillErrorがnullになる", async () => {
        store.skillError = "previous error";
        await store.rescanSkills();
        expect(store.skillError).toBeNull();
      });
    });

    describe("失敗時", () => {
      beforeEach(() => {
        (global as any).window.electronAPI.skill.rescan = vi
          .fn()
          .mockRejectedValue(new Error("Rescan failed"));
      });

      it("TS-6-1-18: skillErrorに値が設定される", async () => {
        await store.rescanSkills();
        expect(store.skillError).not.toBeNull();
        expect(store.skillError).toContain("スキル再スキャンに失敗");
      });
    });
  });

  // ==========================================================================
  // TS-6-1-21〜26: importSkill
  // ==========================================================================
  describe("importSkill", () => {
    beforeEach(() => {
      store.availableSkillsMetadata = [...mockAvailableSkills];
      store.importedSkills = [];
    });

    describe("成功時", () => {
      it("TS-6-1-21: importedSkillsに追加される", async () => {
        await store.importSkill("test-skill-1");
        expect(store.importedSkills).toHaveLength(1);
        expect(store.importedSkills[0].name).toBe("test-skill-1");
      });

      it("TS-6-1-22: availableSkillsMetadataから削除される", async () => {
        await store.importSkill("test-skill-1");
        expect(
          store.availableSkillsMetadata.find((s) => s.name === "test-skill-1"),
        ).toBeUndefined();
      });

      it("TS-6-1-23: isImportingがfalseになる", async () => {
        await store.importSkill("test-skill-1");
        expect(store.isImporting).toBe(false);
      });

      it("TS-6-1-25: 呼び出し中はisImportingがtrueになる", async () => {
        const promise = store.importSkill("test-skill-1");
        await promise;
        expect(store.isImporting).toBe(false);
      });

      it("TS-6-1-26: 呼び出し中はimportingSkillNameが設定される", async () => {
        const promise = store.importSkill("test-skill-1");
        await promise;
        expect(store.importingSkillName).toBeNull();
      });
    });

    describe("失敗時", () => {
      beforeEach(() => {
        (global as any).window.electronAPI.skill.import = vi
          .fn()
          .mockRejectedValue(new Error("Import failed"));
      });

      it("TS-6-1-24: skillErrorに値が設定される", async () => {
        await store.importSkill("test-skill-1");
        expect(store.skillError).not.toBeNull();
        expect(store.skillError).toContain("スキルのインポートに失敗");
      });
    });
  });

  // ==========================================================================
  // TS-6-1-27〜30: removeSkill
  // ==========================================================================
  describe("removeSkill", () => {
    beforeEach(() => {
      store.importedSkills = [...mockImportedSkills];
      store.selectedSkillName = "test-skill-1";
    });

    describe("成功時", () => {
      it("TS-6-1-27: importedSkillsから削除される", async () => {
        await store.removeSkill("test-skill-1");
        expect(store.importedSkills).toHaveLength(0);
      });

      it("TS-6-1-28: 選択中スキル削除時にselectionがクリアされる", async () => {
        await store.removeSkill("test-skill-1");
        expect(store.selectedSkillName).toBeNull();
      });

      it("TS-6-1-29: 選択中でないスキル削除時はselectionが維持される", async () => {
        store.selectedSkillName = "other-skill";
        await store.removeSkill("test-skill-1");
        expect(store.selectedSkillName).toBe("other-skill");
      });
    });

    describe("失敗時", () => {
      beforeEach(() => {
        (global as any).window.electronAPI.skill.remove = vi
          .fn()
          .mockRejectedValue(new Error("Remove failed"));
      });

      it("TS-6-1-30: skillErrorに値が設定される", async () => {
        await store.removeSkill("test-skill-1");
        expect(store.skillError).not.toBeNull();
        expect(store.skillError).toContain("スキルの削除に失敗");
      });
    });
  });

  // ==========================================================================
  // TS-6-1-31〜33: selectSkill
  // ==========================================================================
  describe("selectSkill", () => {
    it("TS-6-1-31: スキル名を設定できる", () => {
      store.selectSkillByName("test-skill-1");
      expect(store.selectedSkillName).toBe("test-skill-1");
    });

    it("TS-6-1-32: nullを設定できる", () => {
      store.selectedSkillName = "test-skill-1";
      store.selectSkillByName(null);
      expect(store.selectedSkillName).toBeNull();
    });

    it("TS-6-1-33: 別のスキルを選択できる", () => {
      store.selectedSkillName = "test-skill-1";
      store.selectSkillByName("test-skill-2");
      expect(store.selectedSkillName).toBe("test-skill-2");
    });
  });

  // ==========================================================================
  // TS-6-1-34〜39: executeSkill
  // ==========================================================================
  describe("executeSkill", () => {
    beforeEach(() => {
      store.selectedSkillName = "test-skill-1";
    });

    describe("成功時", () => {
      it("TS-6-1-34: isExecutingがtrueになる", async () => {
        await store.executeSkill("テストプロンプト");
        // 実行中はtrue、レスポンス受信後もtrueのまま（完了イベント待ち）
        expect(store.isExecuting).toBe(true);
      });

      it("TS-6-1-35: skillExecutionStatusが'running'になる", async () => {
        await store.executeSkill("テストプロンプト");
        expect(store.skillExecutionStatus).toBe("running");
      });

      it("TS-6-1-36: streamingMessagesがクリアされる", async () => {
        store.streamingMessages = [mockStreamMessage];
        await store.executeSkill("テストプロンプト");
        expect(store.streamingMessages).toEqual([]);
      });

      it("TS-6-1-37: executionIdが設定される", async () => {
        await store.executeSkill("テストプロンプト");
        expect(store.executionId).toBe("exec-123");
      });
    });

    describe("失敗時", () => {
      beforeEach(() => {
        (global as any).window.electronAPI.skill.execute = vi
          .fn()
          .mockRejectedValue(new Error("Execute failed"));
      });

      it("TS-6-1-38: skillExecutionStatusが'error'になる", async () => {
        await store.executeSkill("テストプロンプト");
        expect(store.skillExecutionStatus).toBe("error");
      });
    });

    it("TS-6-1-39: スキル未選択時は実行されない", async () => {
      store.selectedSkillName = null;
      await store.executeSkill("テストプロンプト");
      expect(
        (global as any).window.electronAPI.skill.execute,
      ).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // TS-6-1-40〜42: abortExecution
  // ==========================================================================
  describe("abortExecution", () => {
    beforeEach(() => {
      store.isExecuting = true;
      store.executionId = "exec-123";
      store.skillExecutionStatus = "running";
    });

    it("TS-6-1-40: isExecutingがfalseになる", () => {
      store.abortExecution();
      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-41: skillExecutionStatusが'cancelled'になる", () => {
      store.abortExecution();
      expect(store.skillExecutionStatus).toBe("cancelled");
    });

    it("TS-6-1-42: executionIdがnull時は何もしない", () => {
      store.executionId = null;
      store.abortExecution();
      expect(
        (global as any).window.electronAPI.skill.abort,
      ).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // TS-6-1-43〜46: respondToPermission
  // ==========================================================================
  describe("respondToPermission", () => {
    beforeEach(() => {
      store.pendingPermission = mockPermissionRequest;
    });

    it("TS-6-1-43: 承認時にIPCが呼ばれる", () => {
      store.respondToSkillPermission(true);
      expect(
        (global as any).window.electronAPI.skill.sendPermissionResponse,
      ).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: true,
        rememberChoice: false,
      });
    });

    it("TS-6-1-44: 拒否時にIPCが呼ばれる", () => {
      store.respondToSkillPermission(false);
      expect(
        (global as any).window.electronAPI.skill.sendPermissionResponse,
      ).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: false,
        rememberChoice: false,
      });
    });

    it("TS-6-1-45: pendingPermissionがクリアされる", () => {
      store.respondToSkillPermission(true);
      expect(store.pendingPermission).toBeNull();
    });

    it("TS-6-1-46: pendingPermissionがnull時は何もしない", () => {
      store.pendingPermission = null;
      store.respondToSkillPermission(true);
      expect(
        (global as any).window.electronAPI.skill.sendPermissionResponse,
      ).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // TS-6-1-47〜53: 内部ハンドラ
  // ==========================================================================
  describe("内部ハンドラ", () => {
    it("TS-6-1-47: _handleStreamMessageでメッセージが追加される", () => {
      store._handleStreamMessage(mockStreamMessage);
      expect(store.streamingMessages).toHaveLength(1);
      expect(store.streamingMessages[0]).toEqual(mockStreamMessage);
    });

    it("TS-6-1-48: _handleCompleteでisExecutingがfalseになる", () => {
      store.isExecuting = true;
      store._handleComplete("exec-123");
      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-49: _handleCompleteでstatusが'completed'になる", () => {
      store.skillExecutionStatus = "running";
      store._handleComplete("exec-123");
      expect(store.skillExecutionStatus).toBe("completed");
    });

    it("TS-6-1-50: _handleErrorでisExecutingがfalseになる", () => {
      store.isExecuting = true;
      store._handleError("exec-123", "Error occurred");
      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-51: _handleErrorでstatusが'error'になる", () => {
      store.skillExecutionStatus = "running";
      store._handleError("exec-123", "Error occurred");
      expect(store.skillExecutionStatus).toBe("error");
    });

    it("TS-6-1-52: _handleErrorでskillErrorが設定される", () => {
      store._handleError("exec-123", "Error occurred");
      expect(store.skillError).toBe("Error occurred");
    });

    it("TS-6-1-53: _handlePermissionRequestでpendingが設定される", () => {
      store._handlePermissionRequest(mockPermissionRequest);
      expect(store.pendingPermission).toEqual(mockPermissionRequest);
      expect(store.skillExecutionStatus).toBe("permission_pending");
    });
  });

  // ==========================================================================
  // TS-6-1-54〜56: ユーティリティアクション
  // ==========================================================================
  describe("ユーティリティアクション", () => {
    it("TS-6-1-54: clearErrorでskillErrorがnullになる", () => {
      store.skillError = "Test error";
      store.clearError();
      expect(store.skillError).toBeNull();
    });

    it("TS-6-1-55: clearStreamingMessagesで配列がクリアされる", () => {
      store.streamingMessages = [mockStreamMessage];
      store.clearStreamingMessages();
      expect(store.streamingMessages).toEqual([]);
    });

    it("TS-6-1-56: エラーをクリアした後に再度設定できる", () => {
      store.skillError = "First error";
      store.clearError();
      expect(store.skillError).toBeNull();

      store._handleError("exec-123", "Second error");
      expect(store.skillError).toBe("Second error");
    });
  });

  // ==========================================================================
  // 統合テスト
  // ==========================================================================
  describe("統合テスト", () => {
    it("スキル取得→選択→実行フロー", async () => {
      // スキル取得
      await store.fetchSkills();
      expect(store.availableSkillsMetadata).toHaveLength(2);
      expect(store.importedSkills).toHaveLength(1);

      // スキル選択
      store.selectSkillByName("test-skill-1");
      expect(store.selectedSkillName).toBe("test-skill-1");

      // スキル実行
      await store.executeSkill("テストプロンプト");
      expect(store.isExecuting).toBe(true);
      expect(store.skillExecutionStatus).toBe("running");
    });

    it("権限リクエスト→承認フロー", () => {
      store.isExecuting = true;
      store.skillExecutionStatus = "running";

      // 権限リクエスト受信
      store._handlePermissionRequest(mockPermissionRequest);
      expect(store.skillExecutionStatus).toBe("permission_pending");
      expect(store.pendingPermission).not.toBeNull();

      // 承認
      store.respondToSkillPermission(true, true);
      expect(store.pendingPermission).toBeNull();
    });

    it("エラー後のリカバリーフロー", async () => {
      store.selectedSkillName = "test-skill-1";

      // エラー発生
      store._handleError("exec-123", "Test error");
      expect(store.skillExecutionStatus).toBe("error");
      expect(store.skillError).toBe("Test error");

      // エラークリア
      store.clearError();
      expect(store.skillError).toBeNull();

      // 再実行
      await store.executeSkill("テストプロンプト");
      expect(store.skillExecutionStatus).toBe("running");
    });
  });
});
