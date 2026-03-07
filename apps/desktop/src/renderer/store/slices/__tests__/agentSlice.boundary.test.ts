/**
 * @file agentSlice 境界分離テスト
 * @description TASK-10A-E-C Phase 4: import/analyzeアクション間の状態分離を検証
 *
 * importSkillがisAnalyzing/isImproving/currentAnalysisに影響しないこと、
 * analyzeSkillがisImporting/importingSkillNameに影響しないことを保証する。
 *
 * @vitest-environment happy-dom
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

describe("agentSlice - 境界分離テスト（TASK-10A-E-C）", () => {
  // ===========================================================================
  // importSkill が analyze 関連状態に影響しないこと
  // ===========================================================================
  describe("importSkillがisAnalyzing/isImproving/currentAnalysisに影響しないこと", () => {
    it("importSkill実行中にisAnalyzingがfalseのまま", async () => {
      const imported = createMockImported("skill-x");
      mockSkillAPI.import.mockResolvedValue(imported);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("skill-x")],
        isAnalyzing: false,
        isImproving: false,
        currentAnalysis: mockAnalysis,
      });

      await useAppStore.getState().importSkill("skill-x");

      expect(useAppStore.getState().isAnalyzing).toBe(false);
      expect(useAppStore.getState().isImproving).toBe(false);
      expect(useAppStore.getState().currentAnalysis).toEqual(mockAnalysis);
    });

    it("importSkill失敗時にもisAnalyzing/isImproving/currentAnalysisは変化しない", async () => {
      mockSkillAPI.import.mockRejectedValue(new Error("fail"));

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("skill-y")],
        isAnalyzing: false,
        isImproving: false,
        currentAnalysis: mockAnalysis,
      });

      await useAppStore.getState().importSkill("skill-y");

      expect(useAppStore.getState().isAnalyzing).toBe(false);
      expect(useAppStore.getState().isImproving).toBe(false);
      expect(useAppStore.getState().currentAnalysis).toEqual(mockAnalysis);
    });
  });

  // ===========================================================================
  // analyzeSkill が import 関連状態に影響しないこと
  // ===========================================================================
  describe("analyzeSkillがisImporting/importingSkillNameに影響しないこと", () => {
    it("analyzeSkill実行中にisImportingがfalseのまま", async () => {
      mockSkillAPI.analyze.mockResolvedValue(mockAnalysis);

      useAppStore.setState({
        isImporting: false,
        importingSkillName: null,
      });

      await useAppStore.getState().analyzeSkill("test-skill");

      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importingSkillName).toBeNull();
    });

    it("analyzeSkill失敗時にもisImporting/importingSkillNameは変化しない", async () => {
      mockSkillAPI.analyze.mockRejectedValue(new Error("analyze fail"));

      useAppStore.setState({
        isImporting: false,
        importingSkillName: null,
      });

      await useAppStore.getState().analyzeSkill("test-skill");

      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importingSkillName).toBeNull();
    });
  });
});
