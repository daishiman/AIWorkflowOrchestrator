/**
 * @vitest-environment happy-dom
 * TASK-SW-FIX-DATAFLOW-001 Phase 4
 * TC-05: createSkill Thunk context あり呼び出し
 * TC-06: createSkill Thunk context なし呼び出し（後方互換）
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";
import type { SkillCreationContext } from "@repo/shared/types/skillCreator";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";

// ==========================================================================
// テスト用ストア生成
// ==========================================================================

function createTestStore(): AgentSlice {
  const storeRef: { current: AgentSlice | null } = { current: null };

  const mockSet = (
    fn: ((state: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>,
  ) => {
    if (!storeRef.current) return;
    const partial =
      typeof fn === "function"
        ? fn(storeRef.current)
        : (fn as Partial<AgentSlice>);
    Object.assign(storeRef.current, partial);
  };

  const mockGet = () => storeRef.current!;

  const initialStore = createAgentSlice(
    mockSet as never,
    mockGet as never,
    {} as never,
  );

  storeRef.current = initialStore;
  return initialStore;
}

// ==========================================================================
// モック
// ==========================================================================

const mockSkillCreate = vi.fn();
const mockSkillList = vi.fn();
const mockSkillGetImported = vi.fn();

const mockAvailableSkills: SkillMetadata[] = [];
const mockImportedSkills: ImportedSkill[] = [];

function setupMockElectronAPI(createResult?: { path: string }): void {
  mockSkillCreate.mockResolvedValue(
    createResult ?? { path: "/mock/skills/test-skill" },
  );
  mockSkillList.mockResolvedValue(mockAvailableSkills);
  mockSkillGetImported.mockResolvedValue(mockImportedSkills);

  (window as Record<string, unknown>).electronAPI = {
    skill: {
      create: mockSkillCreate,
      list: mockSkillList,
      getImported: mockSkillGetImported,
      rescan: vi.fn().mockResolvedValue(mockAvailableSkills),
      import: vi.fn(),
      remove: vi.fn(),
      execute: vi.fn(),
      abort: vi.fn(),
      sendPermissionResponse: vi.fn(),
      analyze: vi.fn(),
      applyImprovements: vi.fn(),
      autoImprove: vi.fn(),
    },
  };
}

const defaultOptions = {
  generateTasks: false,
  addAgents: false,
  addReferences: false,
} as const;

// ==========================================================================
// TC-05, TC-06
// ==========================================================================

describe("createSkill context 引き渡しテスト (TASK-SW-FIX-DATAFLOW-001)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockElectronAPI();
  });

  describe("TC-05: context あり呼び出し", () => {
    it("context が electronAPI.skill.create の params.context に渡される", async () => {
      const store = createTestStore();

      const context: SkillCreationContext = {
        purpose: "メール整理",
        q1Purpose: "一般ユーザー",
        q2Target: "受信箱",
        q3Tools: "毎日",
        q4Timing: "フォルダ",
        q5Output: "Gmail API",
        q6Constraints: "完了メッセージ",
      };

      await store.createSkill("メール整理スキル", defaultOptions, context);

      expect(mockSkillCreate).toHaveBeenCalledWith({
        description: "メール整理スキル",
        options: defaultOptions,
        context,
      });
    });

    it("createSkill がパスを返す", async () => {
      const store = createTestStore();
      setupMockElectronAPI({ path: "/mock/skills/created" });

      const result = await store.createSkill("テストスキル", defaultOptions, {
        purpose: "テスト",
      });

      expect(result).toBe("/mock/skills/created");
    });
  });

  describe("TC-06: context なし呼び出し（後方互換）", () => {
    it("context を省略した場合も electronAPI.skill.create が呼ばれる", async () => {
      const store = createTestStore();

      await store.createSkill("テストスキル", defaultOptions);

      expect(mockSkillCreate).toHaveBeenCalledTimes(1);
    });

    it("context なしで呼んでも description・options は正しく渡される", async () => {
      const store = createTestStore();

      await store.createSkill("  テストスキル  ", defaultOptions);

      expect(mockSkillCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "テストスキル",
          options: defaultOptions,
        }),
      );
    });

    it("description が空の場合 skillError がセットされ API は呼ばれない", async () => {
      const store = createTestStore();

      const result = await store.createSkill("", defaultOptions);

      expect(result).toBe("");
      expect(mockSkillCreate).not.toHaveBeenCalled();
    });
  });

  describe("TC-02: aborted signal は IPC 呼び出し前に中断する", () => {
    it("signal.aborted === true の場合は空文字を返して API を呼ばない", async () => {
      const store = createTestStore();
      const controller = new AbortController();
      controller.abort();

      const result = await store.createSkill(
        "テストスキル",
        defaultOptions,
        undefined,
        controller.signal,
      );

      expect(result).toBe("");
      expect(mockSkillCreate).not.toHaveBeenCalled();
    });
  });

  describe("TC-01: non-aborted signal は後方互換の payload shape を維持する", () => {
    it("signal を渡しても electronAPI.skill.create の payload は現行 shape のまま", async () => {
      const store = createTestStore();
      const controller = new AbortController();

      await store.createSkill(
        "テストスキル",
        defaultOptions,
        undefined,
        controller.signal,
      );

      expect(mockSkillCreate).toHaveBeenCalledWith({
        description: "テストスキル",
        options: defaultOptions,
        context: undefined,
      });
    });
  });
});
