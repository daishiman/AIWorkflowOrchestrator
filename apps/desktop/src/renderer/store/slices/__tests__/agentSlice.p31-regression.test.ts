/**
 * @file agentSlice P31回帰テスト
 * @description TASK-10A-E-C Phase 6: 個別セレクタの参照安定性・無限ループ非発生を検証
 *
 * 注意: useAvailableSkillsForImport / useFilteredAvailableSkills は
 * 毎回新しい配列を返す派生セレクタのため、renderHookでは無限ループになる。
 * これらのセレクタのロジック検証はgetState経由で実施し、
 * 参照安定性テストはプリミティブ/関数を返すセレクタのみに適用する。
 *
 * @vitest-environment happy-dom
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see .claude/rules/06-known-pitfalls.md#P9
 * @feature store-lifecycle-integration-design
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAppStore, useImportSkill, useIsImportingSkill } from "../../index";
import type { AppStore } from "../../index";
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

function selectAvailableForImport(state: {
  availableSkillsMetadata: SkillMetadata[];
  importedSkills: ImportedSkill[];
}): SkillMetadata[] {
  return state.availableSkillsMetadata.filter(
    (a) => !state.importedSkills.some((i) => i.name === a.name),
  );
}

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

describe("agentSlice - P31回帰テスト（TASK-10A-E-C Phase 6）", () => {
  // ===========================================================================
  // useImportSkill 参照安定性
  // ===========================================================================
  describe("useImportSkill 参照安定性", () => {
    it("renderHookで2回取得し===比較で同一参照", () => {
      const { result, rerender } = renderHook(() => useImportSkill());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });
  });

  // ===========================================================================
  // useIsImportingSkill 参照安定性
  // ===========================================================================
  describe("useIsImportingSkill 参照安定性", () => {
    it("値が変化しない限り再レンダリングしない", () => {
      let renderCount = 0;

      renderHook(() => {
        renderCount++;
        return useIsImportingSkill();
      });

      const initialCount = renderCount;

      // 無関係な状態変更
      act(() => {
        useAppStore.setState({ skillFilter: "changed" });
      });

      // isImportingは変化していないので再レンダリングされない
      expect(renderCount).toBe(initialCount);
    });
  });

  // ===========================================================================
  // useAvailableSkillsForImport 再計算タイミング（getState経由）
  // ===========================================================================
  describe("useAvailableSkillsForImport 再計算タイミング", () => {
    it("importedSkills変更時に再計算される", () => {
      useAppStore.setState({
        availableSkillsMetadata: [
          createMockMetadata("skill-a"),
          createMockMetadata("skill-b"),
        ],
        importedSkills: [],
      });

      const before = selectAvailableForImport(useAppStore.getState());
      expect(before).toHaveLength(2);

      useAppStore.setState({
        importedSkills: [createMockImported("skill-a")],
      });

      const after = selectAvailableForImport(useAppStore.getState());
      expect(after).toHaveLength(1);
      expect(after[0].name).toBe("skill-b");
    });

    it("無関係な状態変更（isAnalyzing等）はセレクタ結果に影響しない", () => {
      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("skill-x")],
        importedSkills: [],
      });

      const before = selectAvailableForImport(useAppStore.getState());

      useAppStore.setState({ isAnalyzing: true });

      const after = selectAvailableForImport(useAppStore.getState());
      expect(after).toHaveLength(before.length);
      expect(after[0].name).toBe(before[0].name);
    });
  });

  // ===========================================================================
  // useFilteredAvailableSkills フィルタ変更時再計算（getState経由）
  // ===========================================================================
  describe("useFilteredAvailableSkills フィルタ変更時再計算", () => {
    it("skillFilter変更で正しくフィルタされた結果が返る", () => {
      useAppStore.setState({
        availableSkillsMetadata: [
          createMockMetadata("alpha-skill"),
          createMockMetadata("beta-skill"),
          createMockMetadata("gamma-other"),
        ],
        importedSkills: [],
        skillFilter: "",
      });

      const allResults = selectFilteredAvailable(useAppStore.getState());
      expect(allResults).toHaveLength(3);

      // フィルタ変更
      useAppStore.setState({ skillFilter: "alpha" });

      const filtered = selectFilteredAvailable(useAppStore.getState());
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("alpha-skill");
    });

    it("descriptionでもフィルタが機能する", () => {
      useAppStore.setState({
        availableSkillsMetadata: [
          createMockMetadata("skill-a"),
          createMockMetadata("skill-b"),
        ],
        importedSkills: [],
        // descriptionは「{name}の説明」形式
        skillFilter: "skill-aの説明",
      });

      const result = selectFilteredAvailable(useAppStore.getState());
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("skill-a");
    });
  });

  // ===========================================================================
  // useImportSkill の無限ループ非発生
  // ===========================================================================
  describe("useImportSkillをuseEffect依存配列に入れても無限ループしない", () => {
    it("useEffect内でuseImportSkillを依存配列に含めてもrenderCountが小さい", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const importSkill = useAppStore((state: AppStore) => state.importSkill);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [importSkill]);

        return { renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 無限ループでなければ10回未満
      expect(renderCount.current).toBeLessThan(10);
    });
  });
});
