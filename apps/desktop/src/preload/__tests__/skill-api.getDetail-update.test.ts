/**
 * Preload API テスト: getDetail / update
 *
 * skillAPI.getDetail(skillId) と skillAPI.update(skillName, updates) の
 * P42準拠バリデーションと IPC 呼び出し動作を検証する。
 *
 * 設計仕様:
 * - getDetail: SKILL_GET_DETAIL チャンネルを { skillId } で safeInvokeUnwrap
 * - update: SKILL_UPDATE チャンネルを { skillName, updates } で safeInvokeUnwrap
 * - バリデーション失敗時: Promise.reject({ code: "VALIDATION_ERROR" }) を返す（invoke 不呼出）
 *
 * @see docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix/phase-2-design.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IPC_CHANNELS } from "../channels";
import { IPC_CHANNELS as SHARED_IPC_CHANNELS } from "@repo/shared/src/ipc/channels";

// Mock electron module - vi.hoisted() でホイスティング対応
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
import { skillAPI } from "../skill-api";

// ============================================================
// セットアップ
// ============================================================
beforeEach(() => {
  vi.clearAllMocks();
  mockInvoke.mockResolvedValue({ success: true, data: {} });
  mockOn.mockImplementation(() => {});
});

describe("shared channel parity", () => {
  it("desktop/shared で SKILL_GET_DETAIL が一致する", () => {
    expect(SHARED_IPC_CHANNELS.SKILL_GET_DETAIL).toBe(
      IPC_CHANNELS.SKILL_GET_DETAIL,
    );
  });

  it("desktop/shared で SKILL_UPDATE が一致する", () => {
    expect(SHARED_IPC_CHANNELS.SKILL_UPDATE).toBe(IPC_CHANNELS.SKILL_UPDATE);
  });
});

// ============================================================
// getDetail() テスト
// ============================================================
describe("skillAPI.getDetail()", () => {
  // --- 正常系 ---

  describe("正常系", () => {
    it("GD-01: SKILL_GET_DETAIL チャンネルを { skillId } で invoke する", async () => {
      const mockSkill = {
        id: "skill-1",
        name: "Test Skill",
        description: "A test skill",
      };
      mockInvoke.mockResolvedValue({ success: true, data: mockSkill });

      await skillAPI.getDetail("skill-1");

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_GET_DETAIL, {
        skillId: "skill-1",
      });
    });

    it("GD-02: スキルデータを返す", async () => {
      const mockSkill = {
        id: "skill-1",
        name: "Test Skill",
        path: "/skills/test-skill",
      };
      mockInvoke.mockResolvedValue({ success: true, data: mockSkill });

      const result = await skillAPI.getDetail("skill-1");

      expect(result).toEqual(mockSkill);
    });
  });

  // --- P42: skillId バリデーション ---

  describe("P42: skillId バリデーション", () => {
    it("GD-03: skillId が非string の場合 reject し invoke を呼ばない", async () => {
      // @ts-expect-error - テスト用に意図的に不正な型を渡す
      await expect(skillAPI.getDetail(123)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("GD-04: skillId が空文字列の場合 reject し invoke を呼ばない", async () => {
      await expect(skillAPI.getDetail("")).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("GD-05: skillId がスペースのみの場合 reject し invoke を呼ばない (P42 trim())", async () => {
      await expect(skillAPI.getDetail("   ")).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("GD-06: skillId が null の場合 reject し invoke を呼ばない", async () => {
      // @ts-expect-error - テスト用に意図的に不正な型を渡す
      await expect(skillAPI.getDetail(null)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("GD-07: skillId が undefined の場合 reject し invoke を呼ばない", async () => {
      // @ts-expect-error - テスト用に意図的に不正な型を渡す
      await expect(skillAPI.getDetail(undefined)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });
});

// ============================================================
// update() テスト
// ============================================================
describe("skillAPI.update()", () => {
  // --- 正常系 ---

  describe("正常系", () => {
    it("UPD-01: SKILL_UPDATE チャンネルを { skillName, updates } で invoke する", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: { success: true } });

      const updates = { description: "Updated description" };
      await skillAPI.update("test-skill", updates);

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_UPDATE, {
        skillName: "test-skill",
        updates,
      });
    });

    it("UPD-02: 結果を返す", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: undefined });

      const result = await skillAPI.update("test-skill", {
        description: "New",
      });

      expect(result).toBeUndefined();
    });

    it("UPD-03: 空オブジェクト updates でも invoke を呼ぶ", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: undefined });

      await skillAPI.update("test-skill", {});

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_UPDATE, {
        skillName: "test-skill",
        updates: {},
      });
    });
  });

  // --- P42: skillName バリデーション ---

  describe("P42: skillName バリデーション", () => {
    it("UPD-04: skillName が非string の場合 reject し invoke を呼ばない", async () => {
      // @ts-expect-error - テスト用に意図的に不正な型を渡す
      await expect(skillAPI.update(123, {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("UPD-05: skillName が空文字列の場合 reject し invoke を呼ばない", async () => {
      await expect(skillAPI.update("", {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("UPD-06: skillName がスペースのみの場合 reject し invoke を呼ばない (P42 trim())", async () => {
      await expect(skillAPI.update("   ", {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("UPD-07: skillName が null の場合 reject し invoke を呼ばない", async () => {
      // @ts-expect-error - テスト用に意図的に不正な型を渡す
      await expect(skillAPI.update(null, {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  // --- updates バリデーション ---

  describe("updates バリデーション", () => {
    it("UPD-08: updates が null の場合 reject し invoke を呼ばない", async () => {
      // @ts-expect-error - テスト用に意図的に不正な型を渡す
      await expect(skillAPI.update("test-skill", null)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("UPD-09: updates が配列の場合 reject し invoke を呼ばない", async () => {
      // @ts-expect-error - テスト用に意図的に不正な型を渡す
      await expect(
        skillAPI.update("test-skill", ["invalid"]),
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });

      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });
});
