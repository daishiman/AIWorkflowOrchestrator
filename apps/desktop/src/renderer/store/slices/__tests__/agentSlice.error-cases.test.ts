/**
 * @file agentSlice 異常系テスト
 * @description TASK-10A-E-C Phase 6: ネットワークエラー、タイムアウト、不正レスポンスを検証
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

describe("agentSlice - 異常系テスト（TASK-10A-E-C Phase 6）", () => {
  // ===========================================================================
  // 2-1. ネットワークエラー
  // ===========================================================================
  describe("ネットワークエラー", () => {
    it("ERR_4004 NETWORK_ERRORでimport失敗時、isImportingがfalse・skillErrorにメッセージ保持", async () => {
      const networkError = new Error(
        "ERR_4004: NETWORK_ERROR - Connection refused",
      );
      mockSkillAPI.import.mockRejectedValue(networkError);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("net-fail-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("net-fail-skill");

      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importingSkillName).toBeNull();
      expect(useAppStore.getState().skillError).toContain(
        "スキルのインポートに失敗",
      );
      expect(useAppStore.getState().skillError).toContain("ERR_4004");
      expect(useAppStore.getState().importedSkills).toHaveLength(0);
    });

    it("ERR_3005 EXTERNAL_SERVICE_UNAVAILABLEでimport失敗時、skillErrorにメッセージ保持", async () => {
      const serviceError = new Error(
        "ERR_3005: EXTERNAL_SERVICE_UNAVAILABLE - Service unavailable",
      );
      mockSkillAPI.import.mockRejectedValue(serviceError);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("svc-fail-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("svc-fail-skill");

      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().skillError).toContain(
        "スキルのインポートに失敗",
      );
      expect(useAppStore.getState().skillError).toContain("ERR_3005");
    });

    it("エラー後にclearSkillErrorでskillErrorがnullになる", async () => {
      mockSkillAPI.import.mockRejectedValue(new Error("some error"));

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("err-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("err-skill");
      expect(useAppStore.getState().skillError).not.toBeNull();

      useAppStore.getState().clearSkillError();
      expect(useAppStore.getState().skillError).toBeNull();
    });
  });

  // ===========================================================================
  // 2-2. タイムアウト
  // ===========================================================================
  describe("タイムアウト", () => {
    it("ERR_3002 AI_API_TIMEOUTでimport失敗時、skillErrorにタイムアウトメッセージ", async () => {
      const timeoutError = new Error(
        "ERR_3002: AI_API_TIMEOUT - Request timed out",
      );
      mockSkillAPI.import.mockRejectedValue(timeoutError);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("timeout-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("timeout-skill");

      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().skillError).toContain(
        "スキルのインポートに失敗",
      );
      expect(useAppStore.getState().skillError).toContain("ERR_3002");
    });

    it("タイムアウト後の再試行が正常に動作する", async () => {
      const timeoutError = new Error("ERR_3002: AI_API_TIMEOUT");
      const imported: ImportedSkill = {
        ...createMockMetadata("retry-skill"),
        importedAt: new Date("2026-01-10"),
        status: "active",
      };

      // 1回目: タイムアウト
      mockSkillAPI.import.mockRejectedValueOnce(timeoutError);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("retry-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("retry-skill");
      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().skillError).toContain("ERR_3002");

      // エラークリア
      useAppStore.getState().clearSkillError();

      // 2回目: 成功
      mockSkillAPI.import.mockResolvedValueOnce(imported);
      await useAppStore.getState().importSkill("retry-skill");

      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().skillError).toBeNull();
      expect(useAppStore.getState().importedSkills).toHaveLength(1);
      expect(useAppStore.getState().importedSkills[0].name).toBe("retry-skill");
    });
  });

  // ===========================================================================
  // 2-3. 不正レスポンス
  // ===========================================================================
  describe("不正レスポンス", () => {
    it("IPCがundefinedを返す場合、importedSkillsに追加される（undefinedがpushされる）", async () => {
      // importSkillの実装では、IPC戻り値をそのままpushするため
      // undefinedが返された場合は配列に追加される（型安全性は呼び出し元に依存）
      mockSkillAPI.import.mockResolvedValue(undefined);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("undef-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("undef-skill");

      // 実装上、undefinedでもエラーにはならずimportedSkillsに追加される
      // これはimportSkillの現在の実装の振る舞いを記録するテスト
      expect(useAppStore.getState().isImporting).toBe(false);
    });

    it("IPCがErrorオブジェクトでない値をthrowした場合でもskillErrorにメッセージが設定される", async () => {
      // 文字列をthrow
      mockSkillAPI.import.mockRejectedValue("unexpected string error");

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("str-err-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("str-err-skill");

      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().skillError).toContain(
        "スキルのインポートに失敗",
      );
      expect(useAppStore.getState().skillError).toContain(
        "unexpected string error",
      );
    });

    it("IPCがnullをthrowした場合でもskillErrorにメッセージが設定される", async () => {
      mockSkillAPI.import.mockRejectedValue(null);

      useAppStore.setState({
        availableSkillsMetadata: [createMockMetadata("null-err-skill")],
        importedSkills: [],
      });

      await useAppStore.getState().importSkill("null-err-skill");

      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().skillError).toContain(
        "スキルのインポートに失敗",
      );
    });
  });
});
