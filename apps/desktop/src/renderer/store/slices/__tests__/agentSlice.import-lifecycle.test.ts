/**
 * @file agentSlice インポートライフサイクルテスト
 * @description TASK-10A-E-C Phase 4: importSkill/removeSkillの状態遷移・ガード・P31安定参照を検証
 *
 * @vitest-environment happy-dom
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see .claude/rules/06-known-pitfalls.md#P39
 * @feature store-lifecycle-integration-design
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useAppStore } from "../../index";
import { useImportSkill } from "../../index";
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
  // Store リセット
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

describe("agentSlice - インポートライフサイクルテスト（TASK-10A-E-C）", () => {
  // ===========================================================================
  // importSkill 成功フロー
  // ===========================================================================
  describe("importSkill 成功フロー", () => {
    it("isImporting遷移 → importedSkillsに追加 → availableから除外", async () => {
      const meta = createMockMetadata("new-skill");
      const imported = createMockImported("new-skill");
      mockSkillAPI.import.mockResolvedValue(imported);

      useAppStore.setState({
        availableSkillsMetadata: [meta, createMockMetadata("other-skill")],
        importedSkills: [],
      });

      // isImporting の遷移を確認するため、import の Promise を取得
      let resolveImport: (value: ImportedSkill) => void;
      mockSkillAPI.import.mockReturnValue(
        new Promise<ImportedSkill>((resolve) => {
          resolveImport = resolve;
        }),
      );

      const importPromise = useAppStore.getState().importSkill("new-skill");

      // import中の状態確認
      expect(useAppStore.getState().isImporting).toBe(true);
      expect(useAppStore.getState().importingSkillName).toBe("new-skill");

      // resolve して完了を待つ
      resolveImport!(imported);
      await importPromise;

      // 完了後の状態確認
      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importingSkillName).toBeNull();
      expect(useAppStore.getState().importedSkills).toHaveLength(1);
      expect(useAppStore.getState().importedSkills[0].name).toBe("new-skill");
      // availableから除外
      expect(
        useAppStore
          .getState()
          .availableSkillsMetadata.some((s) => s.name === "new-skill"),
      ).toBe(false);
      expect(useAppStore.getState().availableSkillsMetadata).toHaveLength(1);
    });
  });

  // ===========================================================================
  // importSkill 失敗フロー
  // ===========================================================================
  describe("importSkill 失敗フロー", () => {
    it("skillErrorにメッセージ設定、importedSkills変化なし", async () => {
      mockSkillAPI.import.mockRejectedValue(
        new Error("Import failed: permission denied"),
      );

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("fail-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("fail-skill");

      expect(useAppStore.getState().skillError).toContain(
        "スキルのインポートに失敗",
      );
      expect(useAppStore.getState().importedSkills).toHaveLength(0);
      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importingSkillName).toBeNull();
    });
  });

  // ===========================================================================
  // importSkill 連打防止
  // ===========================================================================
  describe("importSkill 連打防止", () => {
    it("isImporting中の再呼び出しでも状態が矛盾しない", async () => {
      const imported = createMockImported("skill-a");
      mockSkillAPI.import.mockResolvedValue(imported);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("skill-a")],
        importedSkills: [],
      });

      // 同時に2回呼び出し
      const p1 = useAppStore.getState().importSkill("skill-a");
      const p2 = useAppStore.getState().importSkill("skill-a");

      await Promise.all([p1, p2]);

      // importedSkillsに重複が無いことを確認（冪等ガードにより2回目はスキップされる可能性）
      const importedNames = useAppStore
        .getState()
        .importedSkills.map((s) => s.name);
      const uniqueNames = [...new Set(importedNames)];
      expect(importedNames.length).toBe(uniqueNames.length);
    });
  });

  // ===========================================================================
  // importSkill 冪等ガード
  // ===========================================================================
  describe("importSkill 冪等ガード", () => {
    it("既にimported済みのスキルはIPCスキップ", async () => {
      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("existing-skill")],
        importedSkills: [createMockImported("existing-skill")],
      });

      await useAppStore.getState().importSkill("existing-skill");

      expect(mockSkillAPI.import).not.toHaveBeenCalled();
      expect(useAppStore.getState().skillError).toBeNull();
    });
  });

  // ===========================================================================
  // clearSkillError
  // ===========================================================================
  describe("clearSkillError", () => {
    it("skillError → null", () => {
      useAppStore.setState({ skillError: "some error message" });

      act(() => {
        useAppStore.getState().clearSkillError();
      });

      expect(useAppStore.getState().skillError).toBeNull();
    });
  });

  // ===========================================================================
  // removeSkill 成功フロー
  // ===========================================================================
  describe("removeSkill 成功フロー", () => {
    it("importedSkillsから削除", async () => {
      mockSkillAPI.remove.mockResolvedValue(undefined);

      useAppStore.setState({
        importedSkills: [
          createMockImported("skill-to-remove"),
          createMockImported("skill-to-keep"),
        ],
      });

      await useAppStore.getState().removeSkill("skill-to-remove");

      expect(useAppStore.getState().importedSkills).toHaveLength(1);
      expect(useAppStore.getState().importedSkills[0].name).toBe(
        "skill-to-keep",
      );
    });
  });

  // ===========================================================================
  // P31安定参照
  // ===========================================================================
  describe("P31安定参照", () => {
    it("useImportSkillの戻り値が再レンダー間で同一参照", () => {
      const { result, rerender } = renderHook(() => useImportSkill());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });
  });
});
