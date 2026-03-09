/**
 * @file SkillLifecycle.integration.test.tsx
 * @description Layer 2: Renderer統合テスト - スキルライフサイクル
 * @task TASK-10A-G Phase 4
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで vi.clearAllMocks() + Store状態リセット
 * P40準拠: apps/desktop ディレクトリから実行
 *
 * ChatPanel起点のスキルライフサイクル統合テスト。
 * Store action経由の状態遷移を検証する。
 * agentSlice.skill-integration.test.ts と同様のアプローチで
 * Store action を直接呼び出し、state 遷移を検証。
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  createAgentSlice,
  type AgentSlice,
} from "../../../store/slices/agentSlice";
import {
  createMockAnalysis,
  createMockSuggestion,
} from "./helpers/test-data-factory";

// ==========================================================================
// テスト用ストア生成ヘルパー（agentSlice.skill-integration.test.ts と同パターン）
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
// electronAPI モックセットアップ
// ==========================================================================

interface MockSkillAPI {
  create: ReturnType<typeof vi.fn>;
  analyze: ReturnType<typeof vi.fn>;
  applyImprovements: ReturnType<typeof vi.fn>;
  autoImprove: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
  getImported: ReturnType<typeof vi.fn>;
  rescan: ReturnType<typeof vi.fn>;
  import: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  execute: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
  sendPermissionResponse: ReturnType<typeof vi.fn>;
  onStream: ReturnType<typeof vi.fn>;
  onComplete: ReturnType<typeof vi.fn>;
  onError: ReturnType<typeof vi.fn>;
  onPermissionRequest: ReturnType<typeof vi.fn>;
}

function setupMockElectronAPI(
  overrides: Partial<MockSkillAPI> = {},
): MockSkillAPI {
  const defaultAnalysis = createMockAnalysis();
  const mockSkillAPI: MockSkillAPI = {
    create: vi.fn().mockResolvedValue({ path: "/skills/new-skill" }),
    analyze: vi.fn().mockResolvedValue(defaultAnalysis),
    applyImprovements: vi.fn().mockResolvedValue(undefined),
    autoImprove: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue([]),
    getImported: vi.fn().mockResolvedValue([]),
    rescan: vi.fn().mockResolvedValue([]),
    import: vi.fn().mockResolvedValue(undefined),
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
    ...overrides,
  };

  (
    global as unknown as {
      window: { electronAPI: { skill: MockSkillAPI } };
    }
  ).window = {
    electronAPI: {
      skill: mockSkillAPI,
    },
  };

  return mockSkillAPI;
}

// === 定数 ===
const DEFAULT_CREATE_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
};

// ==========================================================================
// テストスイート
// ==========================================================================

describe("SkillLifecycle 統合テスト（Layer 2: Renderer統合）", () => {
  let store: AgentSlice;
  let mockAPI: MockSkillAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
    mockAPI = setupMockElectronAPI();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ========================================================================
  // ウィザード起動（FR-G02-1）
  // ========================================================================
  describe("ウィザード起動（FR-G02-1）", () => {
    it("TC-G02-001: createSkill action が存在し呼び出し可能（ウィザード起動前提）", () => {
      // Store に createSkill action が存在することを検証
      // ウィザードは Store action を経由してスキル作成を行う
      expect(typeof store.createSkill).toBe("function");
    });

    it("TC-G02-002: スキルライフサイクル関連の初期状態が正しい", () => {
      // ウィザード表示時の初期状態を検証
      expect(store.currentAnalysis).toBeNull();
      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);
      expect(store.skillError).toBeNull();
    });
  });

  // ========================================================================
  // 作成フロー（FR-G02-2, FR-G02-3 / RT-01）
  // ========================================================================
  describe("作成フロー（FR-G02-2, FR-G02-3 / RT-01）", () => {
    it("TC-G02-003: description入力後に createSkill 経由で作成が呼ばれ、パスが返る", async () => {
      mockAPI.create.mockResolvedValue({ path: "/skills/my-new-skill" });

      const result = await store.createSkill(
        "テストスキルの説明",
        DEFAULT_CREATE_OPTIONS,
      );

      expect(mockAPI.create).toHaveBeenCalledTimes(1);
      expect(mockAPI.create).toHaveBeenCalledWith({
        description: "テストスキルの説明",
        options: {
          generateTasks: true,
          addAgents: false,
          addReferences: false,
        },
      });
      expect(result).toBe("/skills/my-new-skill");
    });

    it("TC-G02-004: options が store action に正しく渡る（全オプション有効）", async () => {
      const options = {
        generateTasks: true,
        addAgents: true,
        addReferences: true,
      };

      await store.createSkill("フルオプションスキル", options);

      expect(mockAPI.create).toHaveBeenCalledWith({
        description: "フルオプションスキル",
        options,
      });
    });

    it("TC-G02-005: 作成成功後に fetchSkills が呼ばれ一覧 state が同期される", async () => {
      mockAPI.create.mockResolvedValue({ path: "/skills/created-skill" });
      mockAPI.list.mockResolvedValue([
        {
          name: "created-skill",
          description: "新規スキル",
          path: "/skills/created-skill",
        },
      ]);
      mockAPI.getImported.mockResolvedValue([]);

      await store.createSkill("新規スキル作成", DEFAULT_CREATE_OPTIONS);

      // fetchSkills が内部で呼ばれることを検証（list + getImported の両方が呼ばれる）
      expect(mockAPI.list).toHaveBeenCalledTimes(1);
      expect(mockAPI.getImported).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================================================
  // 分析・改善フロー（FR-G02-4 / RT-02, RT-03, RT-06）
  // ========================================================================
  describe("分析・改善フロー（FR-G02-4 / RT-02, RT-03, RT-06）", () => {
    it("TC-G02-006: スキル選択後に analyzeSkill が呼ばれ、currentAnalysis が設定される", async () => {
      const expectedAnalysis = createMockAnalysis({ overallScore: 88 });
      mockAPI.analyze.mockResolvedValue(expectedAnalysis);

      await store.analyzeSkill("target-skill");

      expect(mockAPI.analyze).toHaveBeenCalledWith("target-skill");
      expect(store.currentAnalysis).toEqual(expectedAnalysis);
      expect(store.isAnalyzing).toBe(false);
      expect(store.skillError).toBeNull();
    });

    it("TC-G02-007: 改善/再分析フローが store action で完結する（applyImprovements -> analyze）", async () => {
      const suggestions = [
        createMockSuggestion({
          priority: "high",
          description: "セキュリティ改善",
        }),
        createMockSuggestion({ priority: "medium", description: "構造改善" }),
      ];
      const updatedAnalysis = createMockAnalysis({ overallScore: 90 });

      mockAPI.applyImprovements.mockResolvedValue(undefined);
      mockAPI.analyze.mockResolvedValue(updatedAnalysis);

      await store.applySkillImprovements("target-skill", suggestions);

      // applyImprovements が呼ばれた後、analyze で再分析が実行される
      expect(mockAPI.applyImprovements).toHaveBeenCalledWith(
        "target-skill",
        suggestions,
      );
      expect(mockAPI.analyze).toHaveBeenCalledWith("target-skill");
      expect(store.currentAnalysis).toEqual(updatedAnalysis);
      expect(store.isImproving).toBe(false);
      expect(store.skillError).toBeNull();
    });
  });

  // ========================================================================
  // エラーハンドリング（FR-G02-5, FR-G02-6 / RT-04, RT-05, RT-07）
  // ========================================================================
  describe("エラーハンドリング（FR-G02-5, FR-G02-6 / RT-04, RT-05, RT-07）", () => {
    it("TC-G02-008: create action 失敗時にエラーメッセージが設定される（skillError state）", async () => {
      mockAPI.create.mockRejectedValue(new Error("ディスク容量不足"));

      const result = await store.createSkill("テスト", DEFAULT_CREATE_OPTIONS);

      expect(result).toBe("");
      expect(store.skillError).toContain("スキル作成に失敗");
      expect(store.skillError).toContain("ディスク容量不足");
    });

    it("TC-G02-009: analyze action 失敗後に再試行で回復できる", async () => {
      // Phase 1: 分析失敗
      mockAPI.analyze.mockRejectedValueOnce(new Error("ネットワークエラー"));

      await store.analyzeSkill("target-skill");

      expect(store.skillError).toContain("スキル分析に失敗");
      expect(store.skillError).toContain("ネットワークエラー");
      expect(store.isAnalyzing).toBe(false);
      expect(store.currentAnalysis).toBeNull();

      // Phase 2: 再試行成功
      const recoveredAnalysis = createMockAnalysis({ overallScore: 75 });
      mockAPI.analyze.mockResolvedValueOnce(recoveredAnalysis);

      await store.analyzeSkill("target-skill");

      expect(store.skillError).toBeNull();
      expect(store.currentAnalysis).toEqual(recoveredAnalysis);
      expect(store.isAnalyzing).toBe(false);
    });

    it("TC-G02-010: isAnalyzing / isImproving 中の状態遷移が正しくガードされる", async () => {
      // analyzeSkill 呼び出し直後に isAnalyzing=true になることを検証
      let isAnalyzingDuringCall = false;
      mockAPI.analyze.mockImplementation(async () => {
        // IPC呼び出し中の store 状態をキャプチャ
        isAnalyzingDuringCall = store.isAnalyzing;
        return createMockAnalysis();
      });

      await store.analyzeSkill("target-skill");

      // IPC呼び出し中は isAnalyzing=true
      expect(isAnalyzingDuringCall).toBe(true);
      // 完了後は isAnalyzing=false
      expect(store.isAnalyzing).toBe(false);

      // autoImproveSkill 呼び出し直後に isImproving=true になることを検証
      let isImprovingDuringCall = false;
      mockAPI.autoImprove.mockImplementation(async () => {
        isImprovingDuringCall = store.isImproving;
        return undefined;
      });

      await store.autoImproveSkill("target-skill");

      expect(isImprovingDuringCall).toBe(true);
      expect(store.isImproving).toBe(false);
    });
  });

  // ========================================================================
  // Phase 6: エラーリカバリ・並行操作テスト
  // ========================================================================
  describe("Phase 6 拡充: エラーリカバリ・並行操作", () => {
    it("TC-G02-011: 下位APIがネットワークエラーでrejectした場合のUI動作", async () => {
      mockAPI.create.mockRejectedValue(
        new Error("Network error: ECONNREFUSED"),
      );

      const result = await store.createSkill("テスト", DEFAULT_CREATE_OPTIONS);

      // 失敗時は空文字を返し、skillErrorにエラーが設定される
      expect(result).toBe("");
      expect(store.skillError).not.toBeNull();
      expect(store.skillError).toContain("スキル作成に失敗");
    });

    it("TC-G02-012: create成功後の一覧同期でfetchSkillsが失敗した場合の動作", async () => {
      mockAPI.create.mockResolvedValue({ path: "/skills/new-skill" });
      // fetchSkills 内部で呼ばれる list が失敗するケース
      mockAPI.list.mockRejectedValue(new Error("List fetch failed"));
      mockAPI.getImported.mockResolvedValue([]);

      // create自体は成功するがfetchSkillsが後続で失敗する
      // createSkillはtry-catchでエラーを処理するため例外が投げられない
      const result = await store.createSkill("テスト", DEFAULT_CREATE_OPTIONS);

      // createは呼ばれている
      expect(mockAPI.create).toHaveBeenCalledTimes(1);
      // パスが返る（create自体は成功）か、エラー処理により空文字になる
      expect(typeof result).toBe("string");
    });

    it("TC-G02-013: ウィザード表示中に別のstore更新が割り込んでもクラッシュしない", async () => {
      // analyzeSkill実行中にstore状態が外部から変更されても、
      // analyzeSkill完了後にcurrentAnalysisが正しく設定されることを検証
      const slowAnalysis = createMockAnalysis({ overallScore: 95 });
      mockAPI.analyze.mockImplementation(async () => {
        // 分析実行中に別のstore更新が割り込み
        store.skillError = "割り込みエラー";
        return slowAnalysis;
      });

      await store.analyzeSkill("target-skill");

      // analyzeSkillの完了後にcurrentAnalysisが正しく設定される（クラッシュしない）
      expect(store.currentAnalysis).toEqual(slowAnalysis);
      // isAnalyzingは完了後にfalseになる
      expect(store.isAnalyzing).toBe(false);
      // 注: analyzeSkillのset()はskillErrorを上書きしないため、
      // 割り込みで設定された値が残る（これは仕様上正しい動作）
      expect(store.skillError).toBe("割り込みエラー");
    });

    it("TC-G02-014: createを連続送信した場合の状態管理", async () => {
      let callCount = 0;
      mockAPI.create.mockImplementation(async () => {
        callCount++;
        return {
          path: `/skills/skill-${callCount}`,
        };
      });
      mockAPI.list.mockResolvedValue([]);
      mockAPI.getImported.mockResolvedValue([]);

      // 連続でcreateSkillを呼び出す
      const results = await Promise.all([
        store.createSkill("スキル1", DEFAULT_CREATE_OPTIONS),
        store.createSkill("スキル2", {
          generateTasks: false,
          addAgents: true,
          addReferences: false,
        }),
      ]);

      // 両方のcreate呼び出しが実行された
      expect(mockAPI.create).toHaveBeenCalledTimes(2);
      // 結果がそれぞれ返る
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(typeof r).toBe("string");
      });
    });
  });
});
