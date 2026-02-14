/**
 * safeInvokeUnwrap レスポンスラッパー展開テスト
 *
 * UT-FIX-IPC-RESPONSE-UNWRAP-001
 *
 * Main Process の IPC ハンドラが { success: true, data: T } 形式で返すレスポンスを
 * Preload 層の safeInvokeUnwrap で展開し、T を直接返すことを検証する。
 *
 * @module @repo/desktop/preload/__tests__/skill-api.unwrap
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ALLOWED_INVOKE_CHANNELS } from "../channels";

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
import { skillAPI } from "../skill-api";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";

// ============================================================
// テストフィクスチャ
// ============================================================
const createMockSkillMetadata = (
  overrides?: Partial<SkillMetadata>,
): SkillMetadata => ({
  name: "test-skill",
  description: "Test skill description",
  path: "/skills/test-skill",
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  ...overrides,
});

const createMockImportedSkill = (
  overrides?: Partial<ImportedSkill>,
): ImportedSkill => ({
  ...createMockSkillMetadata(),
  importedAt: new Date("2026-01-01"),
  status: "active",
  ...overrides,
});

// ============================================================
// セットアップ
// ============================================================
beforeEach(() => {
  vi.clearAllMocks();
  mockInvoke.mockResolvedValue(undefined);
  mockOn.mockImplementation(() => {});
});

// ============================================================
// 1. safeInvokeUnwrap - レスポンスラッパー展開
// ============================================================
describe("safeInvokeUnwrap - レスポンスラッパー展開", () => {
  it("{ success: true, data: [...] } から配列を展開して返す", async () => {
    const mockData = [
      createMockSkillMetadata({ name: "skill-1" }),
      createMockSkillMetadata({ name: "skill-2" }),
    ];
    mockInvoke.mockResolvedValue({ success: true, data: mockData });

    const result = await skillAPI.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(mockData);
    expect(result).toHaveLength(2);
    // ラッパーオブジェクトではなく配列が直接返ることを検証
    expect(
      (result as unknown as Record<string, unknown>).success,
    ).toBeUndefined();
  });

  it("{ success: true, data: { ... } } からオブジェクトを展開して返す", async () => {
    const mockSkill = createMockImportedSkill({ name: "single-skill" });
    mockInvoke.mockResolvedValue({ success: true, data: mockSkill });

    const result = await skillAPI.getImported();

    // getImported は配列を返すが、dataがオブジェクトでもそのまま返す
    expect(result).toEqual(mockSkill);
  });

  it("{ success: false, error: 'msg' } で Error をスローする", async () => {
    mockInvoke.mockResolvedValue({
      success: false,
      error: "スキャンに失敗しました",
    });

    await expect(skillAPI.list()).rejects.toThrow("スキャンに失敗しました");
  });

  it("{ success: false } でデフォルトエラーメッセージをスローする", async () => {
    mockInvoke.mockResolvedValue({ success: false });

    await expect(skillAPI.list()).rejects.toThrow("IPC call failed");
  });

  it("許可されていないチャンネルは ALLOWED_INVOKE_CHANNELS に含まれない", () => {
    expect(ALLOWED_INVOKE_CHANNELS).not.toContain("invalid:channel");
  });
});

// ============================================================
// 2. skill-api メソッド展開テスト
// ============================================================
describe("skill-api メソッド展開テスト", () => {
  describe("list()", () => {
    it("SkillMetadata[] を直接返す（ラッパーなし）", async () => {
      const mockSkills = [createMockSkillMetadata({ name: "skill-a" })];
      mockInvoke.mockResolvedValue({ success: true, data: mockSkills });

      const result = await skillAPI.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe("skill-a");
    });

    it("エラーレスポンス時に例外をスローする", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "スキャンに失敗しました",
      });

      await expect(skillAPI.list()).rejects.toThrow("スキャンに失敗しました");
    });
  });

  describe("getImported()", () => {
    it("ImportedSkill[] を直接返す", async () => {
      const mockImported = [createMockImportedSkill({ name: "imported-1" })];
      mockInvoke.mockResolvedValue({ success: true, data: mockImported });

      const result = await skillAPI.getImported();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe("imported-1");
    });

    it("エラーレスポンス時に例外をスローする", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "スキル取得に失敗しました",
      });

      await expect(skillAPI.getImported()).rejects.toThrow(
        "スキル取得に失敗しました",
      );
    });
  });

  describe("rescan()", () => {
    it("SkillMetadata[] を直接返す", async () => {
      const mockSkills = [createMockSkillMetadata({ name: "rescanned-1" })];
      mockInvoke.mockResolvedValue({ success: true, data: mockSkills });

      const result = await skillAPI.rescan();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe("rescanned-1");
    });

    it("エラーレスポンス時に例外をスローする", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "スキャンに失敗しました",
      });

      await expect(skillAPI.rescan()).rejects.toThrow("スキャンに失敗しました");
    });
  });

  describe("import(skillName)", () => {
    it("ImportedSkill を直接返す", async () => {
      // SKILL_IMPORT ハンドラは skillService.importSkills() を直接返す（ラッパーなし）
      const mockResult = createMockImportedSkill({ name: "new-skill" });
      mockInvoke.mockResolvedValue(mockResult);

      const result = await skillAPI.import("new-skill");

      expect(result.name).toBe("new-skill");
    });

    it("エラー時に例外をスローする", async () => {
      mockInvoke.mockRejectedValue(new Error("Skill not found: unknown-skill"));

      await expect(skillAPI.import("unknown-skill")).rejects.toThrow(
        "Skill not found",
      );
    });
  });
});

// ============================================================
// 3. エッジケーステスト
// ============================================================
describe("safeInvokeUnwrap - エッジケース", () => {
  it("data フィールドが存在しない応答では undefined が返る", async () => {
    mockInvoke.mockResolvedValue({ success: true });

    const result = await skillAPI.list();

    expect(result).toBeUndefined();
  });

  it("success フィールドが存在しない応答では Error をスローする", async () => {
    mockInvoke.mockResolvedValue({ data: [] });

    // !undefined は true と評価されるため、Error がスローされる
    await expect(skillAPI.list()).rejects.toThrow("IPC call failed");
  });

  it("null 応答では TypeError がスローされる", async () => {
    mockInvoke.mockResolvedValue(null);

    await expect(skillAPI.list()).rejects.toThrow();
  });

  it("undefined 応答では TypeError がスローされる", async () => {
    mockInvoke.mockResolvedValue(undefined);

    await expect(skillAPI.list()).rejects.toThrow();
  });

  it("ipcRenderer.invoke が reject した場合はエラーがそのまま伝播する", async () => {
    mockInvoke.mockRejectedValue(new Error("Network disconnected"));

    await expect(skillAPI.list()).rejects.toThrow("Network disconnected");
  });

  it("{ success: true, data: null } では null が返る", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: null });

    const result = await skillAPI.list();

    expect(result).toBeNull();
  });

  it("{ success: true, data: undefined } では undefined が返る", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: undefined });

    const result = await skillAPI.list();

    expect(result).toBeUndefined();
  });
});

// ============================================================
// 4. 境界値テスト
// ============================================================
describe("safeInvokeUnwrap - 境界値テスト", () => {
  it("空配列を正しく展開する", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: [] });

    const result = await skillAPI.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("100件の SkillMetadata を正しく展開する", async () => {
    const largeData = Array.from({ length: 100 }, (_, i) =>
      createMockSkillMetadata({ name: `skill-${i}` }),
    );
    mockInvoke.mockResolvedValue({ success: true, data: largeData });

    const result = await skillAPI.list();

    expect(result).toHaveLength(100);
    expect(result[0].name).toBe("skill-0");
    expect(result[99].name).toBe("skill-99");
  });

  it("単一要素配列を正しく展開する", async () => {
    const singleItem = [createMockSkillMetadata({ name: "only-one" })];
    mockInvoke.mockResolvedValue({ success: true, data: singleItem });

    const result = await skillAPI.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("only-one");
  });

  it("空文字列エラーメッセージで Error をスローする", async () => {
    mockInvoke.mockResolvedValue({ success: false, error: "" });

    // 空文字列は falsy なのでデフォルトメッセージが使用される
    await expect(skillAPI.list()).rejects.toThrow("IPC call failed");
  });

  it("長いエラーメッセージで Error をスローする", async () => {
    const longError = "エラー: ".repeat(100);
    mockInvoke.mockResolvedValue({ success: false, error: longError });

    await expect(skillAPI.list()).rejects.toThrow(longError);
  });
});
