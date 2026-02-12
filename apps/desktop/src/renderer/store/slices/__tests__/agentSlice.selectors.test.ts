/**
 * @file agentSlice セレクタテスト
 * @description UT-STORE-HOOKS-REFACTOR-001 Phase 4: テスト作成
 * @testIds TS-STORE-01〜TS-STORE-40
 * @feature zustand-store-hooks-refactor
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { create, type StoreApi } from "zustand";
import { createAgentSlice, type AgentSlice } from "../agentSlice";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";

// ==========================================================================
// モックデータ
// ==========================================================================

const createMockSkillMetadata = (name: string): SkillMetadata => ({
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

const mockAvailableSkills: SkillMetadata[] = [
  createMockSkillMetadata("test-skill-1"),
  createMockSkillMetadata("test-skill-2"),
];

const mockImportedSkills: ImportedSkill[] = [
  {
    ...mockAvailableSkills[0],
    importedAt: new Date("2026-01-10"),
    status: "active",
  },
];

// ==========================================================================
// ヘルパー関数
// ==========================================================================

/**
 * テスト用ストアを作成
 */
function createTestStore(): StoreApi<AgentSlice> {
  return create<AgentSlice>()((...args) => createAgentSlice(...args));
}

/**
 * Mock electronAPI
 */
function setupMockElectronAPI(): void {
  const mockSkillAPI = {
    list: vi.fn().mockResolvedValue(mockAvailableSkills),
    getImported: vi.fn().mockResolvedValue(mockImportedSkills),
    rescan: vi.fn().mockResolvedValue(mockAvailableSkills),
    import: vi.fn().mockResolvedValue(mockImportedSkills[0]),
    remove: vi.fn().mockResolvedValue(undefined),
    execute: vi
      .fn()
      .mockResolvedValue({ executionId: "exec-123", success: true }),
    abort: vi.fn(),
    sendPermissionResponse: vi.fn(),
    onStream: vi.fn().mockReturnValue(() => {}),
    onComplete: vi.fn().mockReturnValue(() => {}),
    onError: vi.fn().mockReturnValue(() => {}),
    onPermissionRequest: vi.fn().mockReturnValue(() => {}),
  };

  (
    global as unknown as {
      window: { electronAPI: { skill: typeof mockSkillAPI } };
    }
  ).window = {
    electronAPI: {
      skill: mockSkillAPI,
    },
  };
}

// ==========================================================================
// テストスイート
// ==========================================================================

describe("agentSlice - セレクタテスト（UT-STORE-HOOKS-REFACTOR-001）", () => {
  let testStore: StoreApi<AgentSlice>;

  beforeEach(() => {
    testStore = createTestStore();
    setupMockElectronAPI();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // CAT-01: 状態セレクタ初期値テスト
  // ==========================================================================
  describe("CAT-01: 状態セレクタ初期値テスト", () => {
    it("TS-STORE-01: availableSkillsMetadata初期値は空配列", () => {
      const state = testStore.getState();
      expect(state.availableSkillsMetadata).toEqual([]);
    });

    it("TS-STORE-02: importedSkills初期値は空配列", () => {
      const state = testStore.getState();
      expect(state.importedSkills).toEqual([]);
    });

    it("TS-STORE-03: selectedSkillName初期値はnull", () => {
      const state = testStore.getState();
      expect(state.selectedSkillName).toBeNull();
    });

    it("TS-STORE-04: isExecuting初期値はfalse", () => {
      const state = testStore.getState();
      expect(state.isExecuting).toBe(false);
    });

    it("TS-STORE-05: executionId初期値はnull", () => {
      const state = testStore.getState();
      expect(state.executionId).toBeNull();
    });

    it("TS-STORE-06: skillExecutionStatus初期値はnull", () => {
      const state = testStore.getState();
      expect(state.skillExecutionStatus).toBeNull();
    });

    it("TS-STORE-07: streamingMessages初期値は空配列", () => {
      const state = testStore.getState();
      expect(state.streamingMessages).toEqual([]);
    });

    it("TS-STORE-08: pendingPermission初期値はnull", () => {
      const state = testStore.getState();
      expect(state.pendingPermission).toBeNull();
    });

    it("TS-STORE-09: skillError初期値はnull", () => {
      const state = testStore.getState();
      expect(state.skillError).toBeNull();
    });

    it("TS-STORE-10: isLoadingSkills初期値はfalse", () => {
      const state = testStore.getState();
      expect(state.isLoadingSkills).toBe(false);
    });

    it("TS-STORE-11: isScanning初期値はfalse", () => {
      const state = testStore.getState();
      expect(state.isScanning).toBe(false);
    });

    it("TS-STORE-12: isImporting初期値はfalse", () => {
      const state = testStore.getState();
      expect(state.isImporting).toBe(false);
    });

    it("TS-STORE-13: importingSkillName初期値はnull", () => {
      const state = testStore.getState();
      expect(state.importingSkillName).toBeNull();
    });
  });

  // ==========================================================================
  // CAT-02: 状態セレクタ値取得テスト
  // ==========================================================================
  describe("CAT-02: 状態セレクタ値取得テスト", () => {
    it("TS-STORE-14: availableSkillsMetadataが正しく取得できる", () => {
      testStore.setState({ availableSkillsMetadata: mockAvailableSkills });
      const state = testStore.getState();
      expect(state.availableSkillsMetadata).toEqual(mockAvailableSkills);
    });

    it("TS-STORE-15: importedSkillsが正しく取得できる", () => {
      testStore.setState({ importedSkills: mockImportedSkills });
      const state = testStore.getState();
      expect(state.importedSkills).toEqual(mockImportedSkills);
    });

    it("TS-STORE-16: selectedSkillNameが正しく取得できる", () => {
      testStore.setState({ selectedSkillName: "test-skill-1" });
      const state = testStore.getState();
      expect(state.selectedSkillName).toBe("test-skill-1");
    });

    it("TS-STORE-17: isExecutingが正しく取得できる", () => {
      testStore.setState({ isExecuting: true });
      const state = testStore.getState();
      expect(state.isExecuting).toBe(true);
    });

    it("TS-STORE-18: executionIdが正しく取得できる", () => {
      testStore.setState({ executionId: "exec-456" });
      const state = testStore.getState();
      expect(state.executionId).toBe("exec-456");
    });

    it("TS-STORE-19: skillExecutionStatusが正しく取得できる", () => {
      testStore.setState({ skillExecutionStatus: "running" });
      const state = testStore.getState();
      expect(state.skillExecutionStatus).toBe("running");
    });

    it("TS-STORE-20: skillErrorが正しく取得できる", () => {
      testStore.setState({ skillError: "エラーメッセージ" });
      const state = testStore.getState();
      expect(state.skillError).toBe("エラーメッセージ");
    });
  });

  // ==========================================================================
  // CAT-03: アクションセレクタ存在テスト
  // ==========================================================================
  describe("CAT-03: アクションセレクタ存在テスト", () => {
    it("TS-STORE-21: fetchSkillsアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.fetchSkills).toBe("function");
    });

    it("TS-STORE-22: rescanSkillsアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.rescanSkills).toBe("function");
    });

    it("TS-STORE-23: importSkillアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.importSkill).toBe("function");
    });

    it("TS-STORE-24: removeSkillアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.removeSkill).toBe("function");
    });

    it("TS-STORE-25: selectSkillByNameアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.selectSkillByName).toBe("function");
    });

    it("TS-STORE-26: executeSkillアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.executeSkill).toBe("function");
    });

    it("TS-STORE-27: abortExecutionアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.abortExecution).toBe("function");
    });

    it("TS-STORE-28: respondToSkillPermissionアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.respondToSkillPermission).toBe("function");
    });

    it("TS-STORE-29: clearSkillErrorアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.clearSkillError).toBe("function");
    });

    it("TS-STORE-30: clearStreamingMessagesアクションが存在する", () => {
      const state = testStore.getState();
      expect(typeof state.clearStreamingMessages).toBe("function");
    });
  });

  // ==========================================================================
  // CAT-04: アクション実行テスト
  // ==========================================================================
  describe("CAT-04: アクション実行テスト", () => {
    it("TS-STORE-31: selectSkillByNameで選択状態が更新される", () => {
      testStore.getState().selectSkillByName("new-skill");
      expect(testStore.getState().selectedSkillName).toBe("new-skill");
    });

    it("TS-STORE-32: clearSkillErrorでエラーがクリアされる", () => {
      testStore.setState({ skillError: "test error" });
      testStore.getState().clearSkillError();
      expect(testStore.getState().skillError).toBeNull();
    });

    it("TS-STORE-33: clearStreamingMessagesでメッセージがクリアされる", () => {
      testStore.setState({
        streamingMessages: [
          {
            executionId: "exec-1",
            type: "assistant",
            content: { text: "test", isPartial: false },
            timestamp: Date.now(),
          },
        ],
      });
      testStore.getState().clearStreamingMessages();
      expect(testStore.getState().streamingMessages).toEqual([]);
    });
  });

  // ==========================================================================
  // CAT-05: 関数参照安定性テスト
  // ==========================================================================
  describe("CAT-05: 関数参照安定性テスト", () => {
    it("TS-STORE-34: fetchSkillsの参照は常に同一", () => {
      const ref1 = testStore.getState().fetchSkills;
      const ref2 = testStore.getState().fetchSkills;
      expect(ref1).toBe(ref2);
    });

    it("TS-STORE-35: selectSkillByNameの参照は常に同一", () => {
      const ref1 = testStore.getState().selectSkillByName;
      const ref2 = testStore.getState().selectSkillByName;
      expect(ref1).toBe(ref2);
    });

    it("TS-STORE-36: 状態更新後もアクション参照は変わらない", () => {
      const refBefore = testStore.getState().fetchSkills;
      testStore.setState({ selectedSkillName: "updated-skill" });
      const refAfter = testStore.getState().fetchSkills;
      expect(refBefore).toBe(refAfter);
    });

    it("TS-STORE-37: 複数のアクション参照が全て安定している", () => {
      const state1 = testStore.getState();
      testStore.setState({ isExecuting: true });
      const state2 = testStore.getState();

      expect(state1.fetchSkills).toBe(state2.fetchSkills);
      expect(state1.rescanSkills).toBe(state2.rescanSkills);
      expect(state1.importSkill).toBe(state2.importSkill);
      expect(state1.removeSkill).toBe(state2.removeSkill);
      expect(state1.selectSkillByName).toBe(state2.selectSkillByName);
      expect(state1.executeSkill).toBe(state2.executeSkill);
      expect(state1.abortExecution).toBe(state2.abortExecution);
      expect(state1.clearSkillError).toBe(state2.clearSkillError);
      expect(state1.clearStreamingMessages).toBe(state2.clearStreamingMessages);
    });
  });

  // ==========================================================================
  // CAT-06: セレクタ再レンダー最適化テスト
  // ==========================================================================
  describe("CAT-06: セレクタ再レンダー最適化テスト", () => {
    it("TS-STORE-38: 異なる状態フィールドの更新で対象外フィールドは影響を受けない", () => {
      const initialSkillName = testStore.getState().selectedSkillName;
      testStore.setState({ isExecuting: true });
      expect(testStore.getState().selectedSkillName).toBe(initialSkillName);
    });

    it("TS-STORE-39: 個別セレクタで必要なフィールドのみ取得可能", () => {
      // 状態を設定
      testStore.setState({
        availableSkillsMetadata: mockAvailableSkills,
        importedSkills: mockImportedSkills,
        selectedSkillName: "test-skill",
        isExecuting: true,
      });

      // 各フィールドを個別に取得できることを確認
      const state = testStore.getState();
      expect(state.availableSkillsMetadata).toEqual(mockAvailableSkills);
      expect(state.importedSkills).toEqual(mockImportedSkills);
      expect(state.selectedSkillName).toBe("test-skill");
      expect(state.isExecuting).toBe(true);
    });
  });

  // ==========================================================================
  // CAT-07: 無限ループ防止テスト（P31対策）
  // ==========================================================================
  describe("CAT-07: 無限ループ防止テスト（P31対策）", () => {
    it("TS-STORE-40: アクション関数を依存配列に含めても無限ループしない", async () => {
      // 関数参照が安定しているため、依存配列に含めても無限ループしない
      let callCount = 0;
      const maxCalls = 100;

      const fetchSkills = testStore.getState().fetchSkills;

      // シミュレーション: useEffectが何度呼ばれても参照は変わらない
      for (let i = 0; i < maxCalls; i++) {
        const currentFetchSkills = testStore.getState().fetchSkills;
        if (currentFetchSkills === fetchSkills) {
          callCount++;
        }
      }

      // 全ての呼び出しで同じ参照であることを確認
      expect(callCount).toBe(maxCalls);
    });

    it("TS-STORE-41: 個別セレクタは毎回新しいオブジェクトを返さない", () => {
      // 同じ状態で複数回取得しても、プリミティブ値は同一
      const state1 = testStore.getState();
      const state2 = testStore.getState();

      expect(state1.selectedSkillName).toBe(state2.selectedSkillName);
      expect(state1.isExecuting).toBe(state2.isExecuting);
      expect(state1.skillError).toBe(state2.skillError);
    });

    it("TS-STORE-42: 合成Hookパターンの問題点を個別セレクタで回避", () => {
      // 合成Hook（useSkillStore）は毎回新しいオブジェクトを返す問題があった
      // 個別セレクタを使用することでこの問題を回避
      const getCompositeObject = () => ({
        selectedSkillName: testStore.getState().selectedSkillName,
        fetchSkills: testStore.getState().fetchSkills,
      });

      const obj1 = getCompositeObject();
      const obj2 = getCompositeObject();

      // オブジェクト自体は毎回新しい（参照が異なる）
      expect(obj1).not.toBe(obj2);

      // しかし、個別セレクタで取得した値/関数は同一
      expect(obj1.selectedSkillName).toBe(obj2.selectedSkillName);
      expect(obj1.fetchSkills).toBe(obj2.fetchSkills);
    });
  });

  // ==========================================================================
  // CAT-08: 非同期アクションテスト
  // ==========================================================================
  describe("CAT-08: 非同期アクションテスト", () => {
    it("TS-STORE-43: fetchSkillsが正しくデータを取得する", async () => {
      await testStore.getState().fetchSkills();

      const state = testStore.getState();
      expect(state.availableSkillsMetadata).toEqual(mockAvailableSkills);
      expect(state.importedSkills).toEqual(mockImportedSkills);
      expect(state.isLoadingSkills).toBe(false);
    });

    it("TS-STORE-44: rescanSkillsが正しくデータを再取得する", async () => {
      await testStore.getState().rescanSkills();

      const state = testStore.getState();
      expect(state.availableSkillsMetadata).toEqual(mockAvailableSkills);
      expect(state.isScanning).toBe(false);
    });

    it("TS-STORE-45: importSkillが正しくスキルをインポートする", async () => {
      await testStore.getState().importSkill("test-skill-1");

      const state = testStore.getState();
      expect(state.importedSkills).toHaveLength(1);
      expect(state.isImporting).toBe(false);
      expect(state.importingSkillName).toBeNull();
    });

    it("TS-STORE-46: executeSkillが正しく実行状態を更新する", async () => {
      testStore.setState({
        selectedSkillName: "test-skill-1",
        importedSkills: mockImportedSkills,
      });

      const executePromise = testStore.getState().executeSkill("test prompt");

      // 即座に実行状態になる
      expect(testStore.getState().isExecuting).toBe(true);
      expect(testStore.getState().skillExecutionStatus).toBe("running");

      await executePromise;

      // executionIdがサーバー値で更新される
      expect(testStore.getState().executionId).toBe("exec-123");
    });
  });

  // ==========================================================================
  // CAT-09: エラーハンドリングテスト
  // ==========================================================================
  describe("CAT-09: エラーハンドリングテスト", () => {
    it("TS-STORE-47: fetchSkillsエラー時にskillErrorが設定される", async () => {
      (
        global as unknown as {
          window: { electronAPI?: { skill?: { list: () => Promise<never> } } };
        }
      ).window = {
        electronAPI: {
          skill: {
            list: vi.fn().mockRejectedValue(new Error("Network error")),
          },
        },
      };

      await testStore.getState().fetchSkills();

      expect(testStore.getState().skillError).toContain(
        "スキル一覧の取得に失敗",
      );
      expect(testStore.getState().isLoadingSkills).toBe(false);
    });

    it("TS-STORE-48: importSkillエラー時に状態がリセットされる", async () => {
      (
        global as unknown as {
          window: {
            electronAPI?: { skill?: { import: () => Promise<never> } };
          };
        }
      ).window = {
        electronAPI: {
          skill: {
            import: vi.fn().mockRejectedValue(new Error("Import failed")),
          },
        },
      };

      await testStore.getState().importSkill("test-skill");

      expect(testStore.getState().skillError).toContain(
        "スキルのインポートに失敗",
      );
      expect(testStore.getState().isImporting).toBe(false);
      expect(testStore.getState().importingSkillName).toBeNull();
    });
  });
});
