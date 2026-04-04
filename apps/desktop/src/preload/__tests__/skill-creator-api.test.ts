/**
 * SkillCreator Preload API Tests
 *
 * TASK-9B-H: SkillCreatorService Preload API テスト
 *
 * テスト範囲:
 * - 各APIメソッドが正しいチャンネルを呼び出すこと
 * - safeInvokeホワイトリスト検証
 * - safeOnホワイトリスト検証
 * - onProgressクリーンアップ関数
 * - チャンネル定数の存在確認
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

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

// Import after mocking
import { skillCreatorAPI } from "../skill-creator-api";
import type { SkillCreatorAPI } from "../skill-creator-api";
import type {
  CreateSkillOptions,
  ExecuteTasksOptions,
} from "@repo/shared/types";

// ============================================================
// テスト
// ============================================================

describe("SkillCreator Preload API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // チャンネル定数テスト
  // ============================================

  describe("チャンネル定数", () => {
    it("9つのSkill Creatorチャンネルが定義されていること", () => {
      expect(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE).toBe(
        "skill-creator:detect-mode",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_CREATE).toBe("skill-creator:create");
      expect(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS).toBe(
        "skill-creator:execute-tasks",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_VALIDATE).toBe(
        "skill-creator:validate",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA).toBe(
        "skill-creator:validate-schema",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
        "skill-creator:progress",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY).toBe(
        "skill-creator:output-ready",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED).toBe(
        "skill-creator:output-overwrite-approved",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_OPEN_SKILL).toBe(
        "skill-creator:open-skill",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS).toBe(
        "skill-creator:get-adapter-status",
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED).toBe(
        "skill-creator:adapter-status-changed",
      );
    });

    it("7つのinvokeチャンネルがホワイトリストに含まれること", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_CREATE,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_OPEN_SKILL,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
      );
    });

    it("progressチャンネルがonホワイトリストに含まれること", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      );
    });

    it("output-readyチャンネルがonホワイトリストに含まれること", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY,
      );
    });

    it("progressチャンネルがinvokeホワイトリストに含まれないこと", () => {
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      );
    });

    it("adapter-status-changed チャンネルが on ホワイトリストに含まれること", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
      );
    });
  });

  // ============================================
  // API インターフェーステスト
  // ============================================

  describe("APIインターフェース", () => {
    it("skillCreatorAPIが全メソッドを持つこと", () => {
      const api: SkillCreatorAPI = skillCreatorAPI;
      expect(typeof api.detectMode).toBe("function");
      expect(typeof api.createSkill).toBe("function");
      expect(typeof api.executeTasks).toBe("function");
      expect(typeof api.validateSkill).toBe("function");
      expect(typeof api.validateSchema).toBe("function");
      expect(typeof api.planSkill).toBe("function");
      expect(typeof api.executePlan).toBe("function");
      expect(typeof api.getWorkflowState).toBe("function");
      expect(typeof api.getAdapterStatus).toBe("function");
      expect(typeof api.submitUserInput).toBe("function");
      expect(typeof api.configureExternalApi).toBe("function");
      expect(typeof api.onWorkflowStateChanged).toBe("function");
      expect(typeof api.onAdapterStatusChanged).toBe("function");
      expect(typeof api.getVerifyDetail).toBe("function");
      expect(typeof api.reverifyWorkflow).toBe("function");
      expect(typeof api.onProgress).toBe("function");
      expect(typeof api.onOutputReady).toBe("function");
      expect(typeof api.confirmOverwrite).toBe("function");
      expect(typeof api.openSkill).toBe("function");
      expect(typeof api.improveSkillWithFeedback).toBe("function");
      expect(typeof api.applyRuntimeImprovement).toBe("function");
    });
  });

  // ============================================
  // detectMode テスト
  // ============================================

  describe("detectMode", () => {
    it("正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = { success: true, data: "collaborative" };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.detectMode("テストリクエスト");

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
        { request: "テストリクエスト" },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  // ============================================
  // createSkill テスト
  // ============================================

  describe("createSkill", () => {
    it("正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const options: CreateSkillOptions = {
        name: "test-skill",
        description: "テストスキル",
        mode: "create",
      };
      const expectedResult = { success: true, data: "/skills/test-skill" };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.createSkill(options);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_CREATE,
        options,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  // ============================================
  // executeTasks テスト
  // ============================================

  describe("executeTasks", () => {
    it("正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const options: ExecuteTasksOptions = {
        tasksDir: "/path/to/tasks",
        parallel: true,
      };
      const expectedResult = {
        success: true,
        data: {
          mode: "execution",
          results: [],
          summary: { total: 0, completed: 0, failed: 0, skipped: 0 },
        },
      };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.executeTasks(options);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
        options,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  // ============================================
  // validateSkill テスト
  // ============================================

  describe("validateSkill", () => {
    it("正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = { success: true, data: true };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.validateSkill("/path/to/skill");

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
        { skillDir: "/path/to/skill" },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  // ============================================
  // validateSchema テスト
  // ============================================

  describe("validateSchema", () => {
    it("正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = { success: true, data: true };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.validateSchema("skill-metadata", {
        name: "test",
      });

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
        { schemaName: "skill-metadata", data: { name: "test" } },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  // ============================================
  // Runtime / 補助 API テスト
  // ============================================

  describe("追加 API メソッド", () => {
    it("applyRuntimeImprovement が正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = {
        success: true,
        data: { applied: 1, skipped: 0, skippedDetails: [], errors: [] },
      };
      const suggestions = [
        {
          section: "SKILL.md",
          before: "old",
          after: "new",
          reason: "改善提案",
        },
      ];
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.applyRuntimeImprovement(
        "test-skill",
        suggestions,
      );

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
        {
          skillName: "test-skill",
          suggestions,
        },
      );
      expect(result).toEqual(expectedResult);
    });

    it("forkSkill が正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = {
        success: true,
        data: "/skills/forked-skill",
      };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.forkSkill(
        "base-skill",
        "forked-skill",
        { copyAgents: true },
      );

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_CREATOR_FORK, {
        sourceName: "base-skill",
        newName: "forked-skill",
        options: { copyAgents: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it("shareSkill が正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = {
        success: true,
        data: "/exports/test-skill.zip",
      };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.shareSkill("test-skill", "zip");

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_SHARE,
        {
          skillName: "test-skill",
          format: "zip",
        },
      );
      expect(result).toEqual(expectedResult);
    });

    it("scheduleSkill が正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = { success: true, data: undefined };
      const schedule = { cron: "0 9 * * 1-5", timezone: "Asia/Tokyo" };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.scheduleSkill(
        "test-skill",
        schedule,
      );

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_SCHEDULE,
        {
          skillName: "test-skill",
          schedule,
        },
      );
      expect(result).toEqual(expectedResult);
    });

    it("generateDocs が正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = {
        success: true,
        data: "# Generated Docs",
      };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.generateDocs("test-skill", "md", [
        "overview",
        "usage",
      ]);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_GENERATE_DOCS,
        {
          skillName: "test-skill",
          format: "md",
          sections: ["overview", "usage"],
        },
      );
      expect(result).toEqual(expectedResult);
    });

    it("getStats が正しいチャンネルとargsでinvokeを呼び出すこと", async () => {
      const expectedResult = {
        success: true,
        data: { runs: 12, successRate: 0.91 },
      };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.getStats("test-skill", "30d");

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_STATS,
        {
          skillName: "test-skill",
          period: "30d",
        },
      );
      expect(result).toEqual(expectedResult);
    });

    it("getAdapterStatus が正しいチャンネルで invoke すること", async () => {
      const expectedResult = {
        success: true,
        data: { status: "failed", failureReason: "API key is invalid" },
      };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.getAdapterStatus();

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
      );
      expect(result).toEqual(expectedResult);
    });

    it("onAdapterStatusChanged が正しいチャンネルで listener を登録すること", () => {
      const callback = vi.fn();
      skillCreatorAPI.onAdapterStatusChanged(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
        expect.any(Function),
      );
    });
  });

  // ============================================
  // onProgress テスト
  // ============================================

  describe("onProgress", () => {
    it("正しいチャンネルでonリスナーを登録すること", () => {
      const callback = vi.fn();
      skillCreatorAPI.onProgress(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        expect.any(Function),
      );
    });

    it("リスナーが進捗データを受信すること", () => {
      const callback = vi.fn();
      skillCreatorAPI.onProgress(callback);

      // onに渡されたリスナーを取得して呼び出す
      const registeredListener = mockOn.mock.calls[0][1];
      const progressData = {
        phase: "creating",
        percentage: 50,
        message: "スキル作成中...",
      };
      registeredListener({}, progressData);

      expect(callback).toHaveBeenCalledWith(progressData);
    });

    it("クリーンアップ関数がリスナーを解除すること", () => {
      const callback = vi.fn();
      const cleanup = skillCreatorAPI.onProgress(callback);

      cleanup();

      expect(mockRemoveListener).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        expect.any(Function),
      );
    });
  });

  // ============================================
  // onOutputReady テスト
  // ============================================

  describe("onOutputReady", () => {
    it("正しいチャンネルでonリスナーを登録すること", () => {
      const callback = vi.fn();
      skillCreatorAPI.onOutputReady(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY,
        expect.any(Function),
      );
    });

    it("リスナーがpayloadを受信すること", () => {
      const callback = vi.fn();
      skillCreatorAPI.onOutputReady(callback);

      const registeredListener = mockOn.mock.calls[0][1];
      const payload = {
        skillName: "test-skill",
        savedPath: "/skills/test-skill/SKILL.md",
        content: "name: test-skill",
        requiresOverwriteConfirm: false,
      };
      registeredListener({}, payload);

      expect(callback).toHaveBeenCalledWith(payload);
    });

    it("クリーンアップ関数がリスナーを解除すること", () => {
      const callback = vi.fn();
      const cleanup = skillCreatorAPI.onOutputReady(callback);

      cleanup();

      expect(mockRemoveListener).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY,
        expect.any(Function),
      );
    });
  });

  // ============================================
  // output integration API テスト
  // ============================================

  describe("confirmOverwrite", () => {
    it("正しいチャンネルとpayloadでinvokeを呼び出すこと", async () => {
      const payload = {
        skillName: "my-skill",
        savedPath: "/skills/my-skill/SKILL.md",
        content: "name: my-skill",
        requiresOverwriteConfirm: true,
      };
      const expectedResult = { success: true, data: undefined };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.confirmOverwrite(payload);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
        payload,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe("openSkill", () => {
    it("正しいチャンネルとpayloadでinvokeを呼び出すこと", async () => {
      const expectedResult = { success: true, data: undefined };
      mockInvoke.mockResolvedValue(expectedResult);

      const result = await skillCreatorAPI.openSkill(
        "/skills/my-skill/SKILL.md",
      );

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_OPEN_SKILL,
        {
          savedPath: "/skills/my-skill/SKILL.md",
        },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  // ============================================
  // safeInvoke ホワイトリスト検証テスト
  // ============================================

  describe("safeInvoke ホワイトリスト", () => {
    it("許可されたチャンネルでinvokeが呼ばれること", async () => {
      mockInvoke.mockResolvedValue({ success: true });

      // 全5つのinvokeメソッドをテスト
      await skillCreatorAPI.detectMode("test");
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
        expect.any(Object),
      );

      await skillCreatorAPI.createSkill({
        name: "t",
        description: "t",
        mode: "create",
      });
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_CREATE,
        expect.any(Object),
      );

      await skillCreatorAPI.executeTasks({ tasksDir: "/t" });
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
        expect.any(Object),
      );

      await skillCreatorAPI.validateSkill("/t");
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
        expect.any(Object),
      );

      await skillCreatorAPI.validateSchema("s", {});
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
        expect.any(Object),
      );
    });
  });
});
