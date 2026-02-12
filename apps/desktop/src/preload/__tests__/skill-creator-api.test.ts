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
    it("6つのSkill Creatorチャンネルが定義されていること", () => {
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
    });

    it("5つのinvokeチャンネルがホワイトリストに含まれること", () => {
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
    });

    it("progressチャンネルがonホワイトリストに含まれること", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      );
    });

    it("progressチャンネルがinvokeホワイトリストに含まれないこと", () => {
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
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
      expect(typeof api.onProgress).toBe("function");
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
