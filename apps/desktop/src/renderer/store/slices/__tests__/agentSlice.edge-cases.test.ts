/**
 * @file agentSlice 境界値テスト
 * @description TASK-10A-E-C Phase 6: 空リスト、大量スキル、重複インポートの境界値を検証
 *
 * 派生セレクタ（useAvailableSkillsForImport / useFilteredAvailableSkills）は
 * 毎回新しい配列参照を返すため、renderHookでは無限ループになる。
 * そのため、セレクタロジック自体をgetStateから直接検証する。
 *
 * @vitest-environment happy-dom
 * @see .claude/rules/06-known-pitfalls.md#P9
 * @feature store-lifecycle-integration-design
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { useAppStore } from "../../index";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";

// =============================================================================
// localStorage ポリフィル（happy-dom環境対策）
// =============================================================================
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage;
}

// =============================================================================
// セレクタロジック（store/index.tsの派生セレクタと同一ロジック）
// =============================================================================

/** useAvailableSkillsForImportのセレクタロジック */
function selectAvailableForImport(state: {
  availableSkillsMetadata: SkillMetadata[];
  importedSkills: ImportedSkill[];
}): SkillMetadata[] {
  return state.availableSkillsMetadata.filter(
    (a) => !state.importedSkills.some((i) => i.name === a.name),
  );
}

/** useFilteredAvailableSkillsのセレクタロジック */
function selectFilteredAvailable(state: {
  availableSkillsMetadata: SkillMetadata[];
  importedSkills: ImportedSkill[];
  skillFilter: string;
}): SkillMetadata[] {
  const available = state.availableSkillsMetadata.filter(
    (a) => !state.importedSkills.some((i) => i.name === a.name),
  );
  const filter = state.skillFilter.trim().toLowerCase();
  if (!filter) return available;
  return available.filter(
    (s) =>
      String(s.name).toLowerCase().includes(filter) ||
      String(s.description ?? "")
        .toLowerCase()
        .includes(filter),
  );
}

// =============================================================================
// モックデータ
// =============================================================================

const createMockMetadata = (name: string): SkillMetadata => ({
  name,
  description: `${name}の説明`,
  path: `~/.claude/skills/${name}`,
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
});

const createMockImported = (name: string): ImportedSkill => ({
  ...createMockMetadata(name),
  importedAt: new Date("2026-01-10"),
  status: "active",
});

// =============================================================================
// モックセットアップ
// =============================================================================

const mockSkillAPI = {
  list: vi.fn(),
  getImported: vi.fn(),
  import: vi.fn(),
  remove: vi.fn(),
  rescan: vi.fn(),
  execute: vi.fn(),
  abort: vi.fn(),
  sendPermissionResponse: vi.fn(),
  analyze: vi.fn(),
  applyImprovements: vi.fn(),
  autoImprove: vi.fn(),
  create: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error -- テスト用モック
  window.electronAPI = { skill: mockSkillAPI };
  const { getState } = useAppStore;
  useAppStore.setState({
    ...getState(),
    importedSkills: [],
    availableSkillsMetadata: [],
    isImporting: false,
    importingSkillName: null,
    skillError: null,
    isLoadingSkills: false,
    isScanning: false,
    isAnalyzing: false,
    isImproving: false,
    currentAnalysis: null,
    skillFilter: "",
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// =============================================================================
// テストスイート
// =============================================================================

describe("agentSlice - 境界値テスト（TASK-10A-E-C Phase 6）", () => {
  // ===========================================================================
  // 1-1. 空リスト
  // ===========================================================================
  describe("空リスト", () => {
    it("availableSkillsMetadataが空の場合、import可能リストは空配列を返す", () => {
      useAppStore.setState({
        availableSkillsMetadata: [],
        importedSkills: [createMockImported("imported-a")],
      });

      const result = selectAvailableForImport(useAppStore.getState());
      expect(result).toEqual([]);
    });

    it("importedSkillsが空の場合、import可能リストはavailableをそのまま返す", () => {
      const available = [
        createMockMetadata("skill-a"),
        createMockMetadata("skill-b"),
      ];
      useAppStore.setState({
        availableSkillsMetadata: available,
        importedSkills: [],
      });

      const result = selectAvailableForImport(useAppStore.getState());
      expect(result).toHaveLength(2);
      expect(result.map((s) => s.name)).toEqual(["skill-a", "skill-b"]);
    });

    it("両方空の場合、フィルタ付きリストは空配列を返す", () => {
      useAppStore.setState({
        availableSkillsMetadata: [],
        importedSkills: [],
        skillFilter: "",
      });

      const result = selectFilteredAvailable(useAppStore.getState());
      expect(result).toEqual([]);
    });

    it("skillFilterが空文字の場合、フィルタなしとして全件返す", () => {
      const available = [
        createMockMetadata("skill-a"),
        createMockMetadata("skill-b"),
        createMockMetadata("skill-c"),
      ];
      useAppStore.setState({
        availableSkillsMetadata: available,
        importedSkills: [],
        skillFilter: "",
      });

      const result = selectFilteredAvailable(useAppStore.getState());
      expect(result).toHaveLength(3);
    });
  });

  // ===========================================================================
  // 1-2. 大量スキル
  // ===========================================================================
  describe("大量スキル", () => {
    it("100件のavailableSkillsMetadataでselectorが正常に動作する", () => {
      const available = Array.from({ length: 100 }, (_, i) =>
        createMockMetadata(`skill-${i}`),
      );
      useAppStore.setState({
        availableSkillsMetadata: available,
        importedSkills: [],
      });

      const result = selectAvailableForImport(useAppStore.getState());
      expect(result).toHaveLength(100);
    });

    it("100件available、50件importedの場合、フィルタ後に50件返す", () => {
      const available = Array.from({ length: 100 }, (_, i) =>
        createMockMetadata(`skill-${i}`),
      );
      const imported = Array.from({ length: 50 }, (_, i) =>
        createMockImported(`skill-${i}`),
      );
      useAppStore.setState({
        availableSkillsMetadata: available,
        importedSkills: imported,
      });

      const result = selectAvailableForImport(useAppStore.getState());
      expect(result).toHaveLength(50);
      // imported済みのskill-0~49が除外されていること
      result.forEach((s) => {
        const idx = parseInt(s.name.replace("skill-", ""));
        expect(idx).toBeGreaterThanOrEqual(50);
      });
    });

    it("100件中skillFilterで1件だけマッチする場合、1件のみ返す", () => {
      const available = Array.from({ length: 100 }, (_, i) =>
        createMockMetadata(`skill-${i}`),
      );
      useAppStore.setState({
        availableSkillsMetadata: available,
        importedSkills: [],
        skillFilter: "skill-99",
      });

      const result = selectFilteredAvailable(useAppStore.getState());
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("skill-99");
    });
  });

  // ===========================================================================
  // 1-3. 重複インポート
  // ===========================================================================
  describe("重複インポート", () => {
    it("既にimported済みのスキルはIPCスキップ", async () => {
      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("existing-skill")],
        importedSkills: [createMockImported("existing-skill")],
      });

      await useAppStore.getState().importSkill("existing-skill");

      expect(mockSkillAPI.import).not.toHaveBeenCalled();
    });

    it("冪等ガード後のimportedSkillsの配列長が変わらない", async () => {
      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("existing-skill")],
        importedSkills: [createMockImported("existing-skill")],
      });

      await useAppStore.getState().importSkill("existing-skill");

      expect(useAppStore.getState().importedSkills).toHaveLength(1);
    });

    it("同名スキルを連続で2回importSkillしても1回のみIPCが呼ばれる", async () => {
      const imported = createMockImported("skill-dup");
      mockSkillAPI.import.mockResolvedValue(imported);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("skill-dup")],
        importedSkills: [],
      });

      // 1回目: IPCが呼ばれる
      await useAppStore.getState().importSkill("skill-dup");
      expect(mockSkillAPI.import).toHaveBeenCalledTimes(1);

      // 2回目: 既にimported済みなのでIPCスキップ
      await useAppStore.getState().importSkill("skill-dup");
      expect(mockSkillAPI.import).toHaveBeenCalledTimes(1);
    });
  });
});
