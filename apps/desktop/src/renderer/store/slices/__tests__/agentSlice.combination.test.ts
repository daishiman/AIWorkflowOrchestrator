/**
 * @file agentSlice 組合せテスト
 * @description TASK-10A-E-C Phase 6: フィルタ中のインポート、import+analyze同時実行を検証
 *
 * 派生セレクタは毎回新しい配列参照を返すため、renderHookでは無限ループになる。
 * セレクタロジック検証はgetState経由で実施する。
 *
 * @vitest-environment happy-dom
 * @see .claude/rules/06-known-pitfalls.md#P9
 * @feature store-lifecycle-integration-design
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { useAppStore } from "../../index";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

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

const mockAnalysis: SkillAnalysis = {
  skillName: "test-skill",
  overallScore: 85,
  categories: [
    {
      name: "prompt",
      score: 90,
      details: "OK",
      issues: [],
    },
  ],
  suggestions: [],
  risks: [],
};

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

describe("agentSlice - 組合せテスト（TASK-10A-E-C Phase 6）", () => {
  // ===========================================================================
  // 3-2. フィルタ中のインポート
  // ===========================================================================
  describe("フィルタ中のインポート", () => {
    it("インポート成功後、フィルタ結果が再計算されインポート済みスキルが除外される", async () => {
      const imported = createMockImported("skill-alpha");
      mockSkillAPI.import.mockResolvedValue(imported);

      useAppStore.setState({
        availableSkillsMetadata: [
          createMockMetadata("skill-alpha"),
          createMockMetadata("skill-beta"),
          createMockMetadata("other-gamma"),
        ],
        importedSkills: [],
        skillFilter: "skill",
      });

      // フィルタ適用中の状態確認
      const beforeFiltered = selectFilteredAvailable(useAppStore.getState());
      expect(beforeFiltered).toHaveLength(2); // skill-alpha, skill-beta

      // インポート実行
      await useAppStore.getState().importSkill("skill-alpha");

      // フィルタ結果の再計算後
      const afterFiltered = selectFilteredAvailable(useAppStore.getState());
      expect(afterFiltered).toHaveLength(1);
      expect(afterFiltered[0].name).toBe("skill-beta");
    });

    it("インポート成功後、import可能リストからインポート済みスキルが消える", async () => {
      const imported = createMockImported("target-skill");
      mockSkillAPI.import.mockResolvedValue(imported);

      useAppStore.setState({
        availableSkillsMetadata: [
          createMockMetadata("target-skill"),
          createMockMetadata("other-skill"),
        ],
        importedSkills: [],
      });

      // インポート前
      const before = selectAvailableForImport(useAppStore.getState());
      expect(before).toHaveLength(2);

      // インポート実行
      await useAppStore.getState().importSkill("target-skill");

      // インポート後
      const after = selectAvailableForImport(useAppStore.getState());
      expect(after).toHaveLength(1);
      expect(after.some((s) => s.name === "target-skill")).toBe(false);
    });
  });

  // ===========================================================================
  // 3-3. import + analyze 同時実行
  // ===========================================================================
  describe("import + analyze 同時実行", () => {
    it("isImporting中にanalyzeSkillを呼んでも両方が独立して状態遷移する", async () => {
      const imported = createMockImported("import-skill");
      mockSkillAPI.import.mockResolvedValue(imported);
      mockSkillAPI.analyze.mockResolvedValue(mockAnalysis);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("import-skill")],
        importedSkills: [],
      });

      // 両方を同時に実行
      const importPromise = useAppStore.getState().importSkill("import-skill");
      const analyzePromise = useAppStore
        .getState()
        .analyzeSkill("analyze-target");

      await Promise.all([importPromise, analyzePromise]);

      // import結果
      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importedSkills).toHaveLength(1);

      // analyze結果
      expect(useAppStore.getState().isAnalyzing).toBe(false);
      expect(useAppStore.getState().currentAnalysis).toEqual(mockAnalysis);
    });

    it("isAnalyzing中にimportSkillを呼んでも両方が独立して状態遷移する", async () => {
      const imported = createMockImported("import-during-analyze");
      mockSkillAPI.import.mockResolvedValue(imported);
      mockSkillAPI.analyze.mockResolvedValue(mockAnalysis);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("import-during-analyze")],
        importedSkills: [],
      });

      // analyzeを先に開始
      const analyzePromise = useAppStore.getState().analyzeSkill("some-skill");
      // importを後から開始
      const importPromise = useAppStore
        .getState()
        .importSkill("import-during-analyze");

      await Promise.all([analyzePromise, importPromise]);

      // 両方完了
      expect(useAppStore.getState().isAnalyzing).toBe(false);
      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importedSkills).toHaveLength(1);
      expect(useAppStore.getState().currentAnalysis).toEqual(mockAnalysis);
    });

    it("両方が同時にfetchSkillsを呼んでも最後の結果が反映される", async () => {
      const available1 = [createMockMetadata("result-1")];
      const imported1 = [createMockImported("imp-1")];
      const available2 = [
        createMockMetadata("result-2a"),
        createMockMetadata("result-2b"),
      ];
      const imported2 = [createMockImported("imp-2")];

      // 1回目は遅延
      let resolve1List: (v: SkillMetadata[]) => void;
      let resolve1Imported: (v: ImportedSkill[]) => void;
      mockSkillAPI.list.mockReturnValueOnce(
        new Promise<SkillMetadata[]>((r) => {
          resolve1List = r;
        }),
      );
      mockSkillAPI.getImported.mockReturnValueOnce(
        new Promise<ImportedSkill[]>((r) => {
          resolve1Imported = r;
        }),
      );

      // 2回目は即座に解決
      mockSkillAPI.list.mockResolvedValueOnce(available2);
      mockSkillAPI.getImported.mockResolvedValueOnce(imported2);

      const p1 = useAppStore.getState().fetchSkills();
      const p2 = useAppStore.getState().fetchSkills();

      // 2回目が先に完了
      await p2;

      // 1回目を遅れて解決
      resolve1List!(available1);
      resolve1Imported!(imported1);
      await p1;

      // 最終的にisLoadingSkillsがfalseであること
      expect(useAppStore.getState().isLoadingSkills).toBe(false);
      // 1回目が後に完了するため、1回目の結果が最終的に反映される
      expect(useAppStore.getState().availableSkillsMetadata).toHaveLength(1);
    });
  });
});
