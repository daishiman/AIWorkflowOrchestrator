/**
 * @file skillSlice 状態遷移テスト
 * @description 状態遷移の正当性を検証
 * @testIds TS-6-1-70〜TS-6-1-79
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
];

const mockImportedSkills: ImportedSkill[] = [
  {
    ...mockAvailableSkills[0],
    importedAt: new Date("2026-01-10"),
    status: "active",
  },
];

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

describe("skillSlice - 状態遷移", () => {
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
  // TS-6-1-70: idle → running → completed 遷移
  // ==========================================================================
  describe("TS-6-1-70: idle → running → completed 遷移", () => {
    it("正常な実行完了フローで遷移する", async () => {
      // 初期状態（idle）
      expect(store.skillExecutionStatus).toBeNull();
      expect(store.isExecuting).toBe(false);

      // running に遷移
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");

      expect(store.skillExecutionStatus).toBe("running");
      expect(store.isExecuting).toBe(true);

      // completed に遷移
      store._handleComplete("exec-123");

      expect(store.skillExecutionStatus).toBe("completed");
      expect(store.isExecuting).toBe(false);
    });
  });

  // ==========================================================================
  // TS-6-1-71: idle → running → error 遷移
  // ==========================================================================
  describe("TS-6-1-71: idle → running → error 遷移", () => {
    it("エラー発生時に正しく遷移する", async () => {
      // 初期状態（idle）
      expect(store.skillExecutionStatus).toBeNull();

      // running に遷移
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");

      expect(store.skillExecutionStatus).toBe("running");

      // error に遷移
      store._handleError("exec-123", "Execution failed");

      expect(store.skillExecutionStatus).toBe("error");
      expect(store.isExecuting).toBe(false);
      expect(store.skillError).toBe("Execution failed");
    });
  });

  // ==========================================================================
  // TS-6-1-72: idle → running → cancelled 遷移
  // ==========================================================================
  describe("TS-6-1-72: idle → running → cancelled 遷移", () => {
    it("中断時に正しく遷移する", async () => {
      // 初期状態（idle）
      expect(store.skillExecutionStatus).toBeNull();

      // running に遷移
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");

      expect(store.skillExecutionStatus).toBe("running");

      // cancelled に遷移
      store.abortExecution();

      expect(store.skillExecutionStatus).toBe("cancelled");
      expect(store.isExecuting).toBe(false);
    });
  });

  // ==========================================================================
  // TS-6-1-73: running → permission_pending → running 遷移
  // ==========================================================================
  describe("TS-6-1-73: running → permission_pending → running 遷移", () => {
    it("権限承認後に実行が続行される", async () => {
      // running に遷移
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");

      expect(store.skillExecutionStatus).toBe("running");

      // permission_pending に遷移
      store._handlePermissionRequest(mockPermissionRequest);

      expect(store.skillExecutionStatus).toBe("permission_pending");
      expect(store.pendingPermission).not.toBeNull();

      // 権限承認後（実際にはMain側でrunningに戻る）
      store.respondToSkillPermission(true);

      expect(store.pendingPermission).toBeNull();
      // 注: ステータスの変更はMain側からのIPCで行われる
    });
  });

  // ==========================================================================
  // TS-6-1-74: running → permission_pending → error 遷移
  // ==========================================================================
  describe("TS-6-1-74: running → permission_pending → error 遷移", () => {
    it("権限拒否後にエラー状態になる", async () => {
      // running に遷移
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");

      // permission_pending に遷移
      store._handlePermissionRequest(mockPermissionRequest);

      expect(store.skillExecutionStatus).toBe("permission_pending");

      // 権限拒否
      store.respondToSkillPermission(false);

      // エラーハンドラが呼ばれることをシミュレート
      store._handleError("exec-123", "Permission denied");

      expect(store.skillExecutionStatus).toBe("error");
      expect(store.skillError).toBe("Permission denied");
    });
  });

  // ==========================================================================
  // TS-6-1-75: completed → running（再実行）
  // ==========================================================================
  describe("TS-6-1-75: completed → running（再実行）", () => {
    it("完了後に再実行できる", async () => {
      // completed 状態を設定
      store.skillExecutionStatus = "completed";
      store.isExecuting = false;
      store.selectedSkillName = "test-skill-1";

      // 再実行
      await store.executeSkill("新しいプロンプト");

      expect(store.skillExecutionStatus).toBe("running");
      expect(store.isExecuting).toBe(true);
      expect(store.streamingMessages).toEqual([]);
    });
  });

  // ==========================================================================
  // TS-6-1-76: error → running（再実行）
  // ==========================================================================
  describe("TS-6-1-76: error → running（再実行）", () => {
    it("エラー後に再実行できる", async () => {
      // error 状態を設定
      store.skillExecutionStatus = "error";
      store.skillError = "Previous error";
      store.isExecuting = false;
      store.selectedSkillName = "test-skill-1";

      // 再実行
      await store.executeSkill("リトライプロンプト");

      expect(store.skillExecutionStatus).toBe("running");
      expect(store.isExecuting).toBe(true);
      expect(store.skillError).toBeNull();
    });
  });

  // ==========================================================================
  // TS-6-1-77: cancelled → running（再実行）
  // ==========================================================================
  describe("TS-6-1-77: cancelled → running（再実行）", () => {
    it("キャンセル後に再実行できる", async () => {
      // cancelled 状態を設定
      store.skillExecutionStatus = "cancelled";
      store.isExecuting = false;
      store.selectedSkillName = "test-skill-1";

      // 再実行
      await store.executeSkill("再試行プロンプト");

      expect(store.skillExecutionStatus).toBe("running");
      expect(store.isExecuting).toBe(true);
    });
  });

  // ==========================================================================
  // TS-6-1-78: 不正な状態遷移の拒否
  // ==========================================================================
  describe("TS-6-1-78: 不正な状態遷移の拒否", () => {
    it("スキル未選択時はrunningに遷移しない", async () => {
      store.selectedSkillName = null;

      await store.executeSkill("テスト");

      expect(store.skillExecutionStatus).toBeNull();
      expect(store.isExecuting).toBe(false);
    });

    it("executionIdなしでabortしても状態が変わらない", () => {
      store.executionId = null;
      store.skillExecutionStatus = "running";
      store.isExecuting = true;

      store.abortExecution();

      // executionIdがnullなのでabortは呼ばれない
      expect(
        (global as any).window.electronAPI.skill.abort,
      ).not.toHaveBeenCalled();
    });

    it("pendingPermissionなしでrespondToPermissionしても何も起きない", () => {
      store.pendingPermission = null;

      store.respondToSkillPermission(true);

      expect(
        (global as any).window.electronAPI.skill.sendPermissionResponse,
      ).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // TS-6-1-79: 複数の状態フラグの整合性
  // ==========================================================================
  describe("TS-6-1-79: 複数の状態フラグの整合性", () => {
    it("running時はisExecuting=true、skillExecutionStatusが一致", async () => {
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");

      expect(store.isExecuting).toBe(true);
      expect(store.skillExecutionStatus).toBe("running");
      expect(store.executionId).toBe("exec-123");
    });

    it("completed時はisExecuting=false、skillExecutionStatusが一致", async () => {
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");
      store._handleComplete("exec-123");

      expect(store.isExecuting).toBe(false);
      expect(store.skillExecutionStatus).toBe("completed");
    });

    it("error時はisExecuting=false、skillErrorが設定される", async () => {
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");
      store._handleError("exec-123", "Error message");

      expect(store.isExecuting).toBe(false);
      expect(store.skillExecutionStatus).toBe("error");
      expect(store.skillError).toBe("Error message");
    });

    it("cancelled時はisExecuting=false、skillExecutionStatusが一致", async () => {
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");
      store.abortExecution();

      expect(store.isExecuting).toBe(false);
      expect(store.skillExecutionStatus).toBe("cancelled");
    });

    it("permission_pending時はisExecuting=true、pendingPermissionが設定される", async () => {
      store.selectedSkillName = "test-skill-1";
      await store.executeSkill("テスト");
      store._handlePermissionRequest(mockPermissionRequest);

      expect(store.isExecuting).toBe(true);
      expect(store.skillExecutionStatus).toBe("permission_pending");
      expect(store.pendingPermission).toEqual(mockPermissionRequest);
    });

    it("ローディング状態の整合性が保たれる", async () => {
      // fetchSkills後
      await store.fetchSkills();
      expect(store.isLoadingSkills).toBe(false);

      // rescanSkills後
      await store.rescanSkills();
      expect(store.isScanning).toBe(false);

      // importSkill後
      store.availableSkillsMetadata = [...mockAvailableSkills];
      await store.importSkill("test-skill-1");
      expect(store.isImporting).toBe(false);
      expect(store.importingSkillName).toBeNull();
    });
  });
});
