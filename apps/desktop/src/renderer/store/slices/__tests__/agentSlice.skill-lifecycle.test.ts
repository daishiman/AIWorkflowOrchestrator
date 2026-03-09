/**
 * @vitest-environment happy-dom
 * @file agentSlice スキルライフサイクルテスト
 * @description TASK-10A-D Phase 4-5: スキルライフサイクル管理の状態・アクションテスト
 * @feature skill-lifecycle-ui-integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";

// ==========================================================================
// モックデータ
// ==========================================================================

const mockAnalysis: SkillAnalysis = {
  skillName: "test-skill",
  overallScore: 85,
  categories: [
    {
      name: "prompt",
      score: 90,
      details: "プロンプト品質は良好です",
      issues: [],
    },
    {
      name: "structure",
      score: 80,
      details: "構造に改善の余地があります",
      issues: ["ファイル構成の見直しを推奨"],
    },
  ],
  suggestions: [
    {
      type: "structure",
      priority: "medium",
      description: "ファイル分割を推奨",
      autoFixable: true,
    },
    {
      type: "documentation",
      priority: "low",
      description: "READMEの追加を推奨",
      autoFixable: false,
    },
  ],
  risks: [
    {
      category: "maintenance",
      level: "low",
      description: "ドキュメント不足",
      impact: "メンテナンスコスト増加",
    },
  ],
};

const mockAvailableSkills: SkillMetadata[] = [
  {
    name: "test-skill-1",
    description: "テストスキル1",
    path: "~/.claude/skills/test-skill-1",
    updatedAt: new Date("2026-01-01"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
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

interface MockElectronAPIOptions {
  skillAnalyze?: SkillAnalysis;
  skillAnalyzeError?: Error;
  skillApplyImprovements?: unknown;
  skillApplyImprovementsError?: Error;
  skillAutoImprove?: unknown;
  skillAutoImproveError?: Error;
  skillCreate?: { path: string };
  skillCreateError?: Error;
  skillList?: SkillMetadata[];
  skillGetImported?: ImportedSkill[];
}

function setupMockElectronAPI(options: MockElectronAPIOptions = {}): void {
  const mockSkillAPI = {
    analyze: options.skillAnalyzeError
      ? vi.fn().mockRejectedValue(options.skillAnalyzeError)
      : vi.fn().mockResolvedValue(options.skillAnalyze ?? mockAnalysis),
    applyImprovements: options.skillApplyImprovementsError
      ? vi.fn().mockRejectedValue(options.skillApplyImprovementsError)
      : vi
          .fn()
          .mockResolvedValue(
            options.skillApplyImprovements ?? { applied: [], skipped: [] },
          ),
    autoImprove: options.skillAutoImproveError
      ? vi.fn().mockRejectedValue(options.skillAutoImproveError)
      : vi
          .fn()
          .mockResolvedValue(
            options.skillAutoImprove ?? { applied: [], skipped: [] },
          ),
    create: options.skillCreateError
      ? vi.fn().mockRejectedValue(options.skillCreateError)
      : vi
          .fn()
          .mockResolvedValue(
            options.skillCreate ?? { path: "/path/to/new-skill" },
          ),
    list: vi.fn().mockResolvedValue(options.skillList ?? mockAvailableSkills),
    getImported: vi
      .fn()
      .mockResolvedValue(options.skillGetImported ?? mockImportedSkills),
    rescan: vi.fn().mockResolvedValue(options.skillList ?? mockAvailableSkills),
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

describe("agentSlice - スキルライフサイクルテスト（TASK-10A-D）", () => {
  let store: AgentSlice;

  beforeEach(() => {
    store = createTestStore();
    setupMockElectronAPI();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // 初期状態テスト
  // ==========================================================================
  describe("初期状態テスト", () => {
    it("currentAnalysisの初期値はnull", () => {
      expect(store.currentAnalysis).toBeNull();
    });

    it("isAnalyzingの初期値はfalse", () => {
      expect(store.isAnalyzing).toBe(false);
    });

    it("isImprovingの初期値はfalse", () => {
      expect(store.isImproving).toBe(false);
    });
  });

  // ==========================================================================
  // analyzeSkill テスト
  // ==========================================================================
  describe("analyzeSkill", () => {
    it("メソッドが存在する", () => {
      expect(typeof store.analyzeSkill).toBe("function");
    });

    it("正常な分析でcurrentAnalysisが設定される", async () => {
      await store.analyzeSkill("test-skill");

      expect(store.currentAnalysis).toEqual(mockAnalysis);
      expect(store.isAnalyzing).toBe(false);
      expect(store.skillError).toBeNull();
    });

    it("分析中にisAnalyzingがtrueになる", async () => {
      const promise = store.analyzeSkill("test-skill");

      expect(store.isAnalyzing).toBe(true);
      expect(store.currentAnalysis).toBeNull();

      await promise;
    });

    it("分析開始時にcurrentAnalysisがクリアされる", async () => {
      store.currentAnalysis = mockAnalysis;

      const promise = store.analyzeSkill("another-skill");

      expect(store.currentAnalysis).toBeNull();

      await promise;
    });

    it("分析開始時にskillErrorがクリアされる", async () => {
      store.skillError = "前のエラー";

      const promise = store.analyzeSkill("test-skill");

      expect(store.skillError).toBeNull();

      await promise;
    });

    it("API呼び出しにトリミングされた名前が渡される", async () => {
      await store.analyzeSkill("  test-skill  ");

      expect(window.electronAPI.skill.analyze).toHaveBeenCalledWith(
        "test-skill",
      );
    });

    it("APIエラー時にskillErrorが設定される", async () => {
      setupMockElectronAPI({
        skillAnalyzeError: new Error("Analysis failed"),
      });

      await store.analyzeSkill("test-skill");

      expect(store.skillError).toContain("スキル分析に失敗");
      expect(store.skillError).toContain("Analysis failed");
      expect(store.isAnalyzing).toBe(false);
      expect(store.currentAnalysis).toBeNull();
    });

    it("electronAPIが未定義の場合にエラーが設定される", async () => {
      (global as unknown as { window: { electronAPI: undefined } }).window = {
        electronAPI: undefined,
      };

      await store.analyzeSkill("test-skill");

      expect(store.skillError).toContain("スキル分析に失敗");
      expect(store.isAnalyzing).toBe(false);
    });

    // P42: 3段バリデーションテスト
    describe("P42: 3段バリデーション", () => {
      it("空文字列の場合にバリデーションエラー", async () => {
        await store.analyzeSkill("");

        expect(store.skillError).toBe("スキル名が無効です");
        expect(store.isAnalyzing).toBe(false);
      });

      it("スペースのみの場合にバリデーションエラー", async () => {
        await store.analyzeSkill("   ");

        expect(store.skillError).toBe("スキル名が無効です");
        expect(store.isAnalyzing).toBe(false);
      });

      it("非文字列の場合にバリデーションエラー", async () => {
        await store.analyzeSkill(123 as unknown as string);

        expect(store.skillError).toBe("スキル名が無効です");
        expect(store.isAnalyzing).toBe(false);
      });
    });
  });

  // ==========================================================================
  // applySkillImprovements テスト
  // ==========================================================================
  describe("applySkillImprovements", () => {
    it("メソッドが存在する", () => {
      expect(typeof store.applySkillImprovements).toBe("function");
    });

    it("正常な改善適用後にcurrentAnalysisが更新される", async () => {
      const suggestions = [mockAnalysis.suggestions[0]];

      await store.applySkillImprovements("test-skill", suggestions);

      expect(store.currentAnalysis).toEqual(mockAnalysis);
      expect(store.isImproving).toBe(false);
      expect(store.skillError).toBeNull();
    });

    it("改善適用中にisImprovingがtrueになる", async () => {
      const promise = store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);

      expect(store.isImproving).toBe(true);

      await promise;
    });

    it("APIが正しい引数で呼ばれる", async () => {
      const suggestions = [mockAnalysis.suggestions[0]];

      await store.applySkillImprovements("  test-skill  ", suggestions);

      expect(window.electronAPI.skill.applyImprovements).toHaveBeenCalledWith(
        "test-skill",
        suggestions,
      );
    });

    it("改善適用後にanalyzeが呼ばれる（再分析）", async () => {
      await store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);

      expect(window.electronAPI.skill.analyze).toHaveBeenCalledWith(
        "test-skill",
      );
    });

    it("APIエラー時にskillErrorが設定される", async () => {
      setupMockElectronAPI({
        skillApplyImprovementsError: new Error("Improvement failed"),
      });

      await store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);

      expect(store.skillError).toContain("改善適用に失敗");
      expect(store.skillError).toContain("Improvement failed");
      expect(store.isImproving).toBe(false);
    });

    it("electronAPIが未定義の場合にエラーが設定される", async () => {
      (global as unknown as { window: { electronAPI: undefined } }).window = {
        electronAPI: undefined,
      };

      await store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);

      expect(store.skillError).toContain("改善適用に失敗");
      expect(store.isImproving).toBe(false);
    });

    // P42: 3段バリデーションテスト
    describe("P42: 3段バリデーション", () => {
      it("空文字列のスキル名でバリデーションエラー", async () => {
        await store.applySkillImprovements("", [mockAnalysis.suggestions[0]]);

        expect(store.skillError).toBe("スキル名が無効です");
      });

      it("スペースのみのスキル名でバリデーションエラー", async () => {
        await store.applySkillImprovements("   ", [
          mockAnalysis.suggestions[0],
        ]);

        expect(store.skillError).toBe("スキル名が無効です");
      });

      it("空配列の提案でバリデーションエラー", async () => {
        await store.applySkillImprovements("test-skill", []);

        expect(store.skillError).toBe("改善提案が選択されていません");
      });

      it("非配列の提案でバリデーションエラー", async () => {
        await store.applySkillImprovements(
          "test-skill",
          "invalid" as unknown as unknown[],
        );

        expect(store.skillError).toBe("改善提案が選択されていません");
      });
    });
  });

  // ==========================================================================
  // autoImproveSkill テスト
  // ==========================================================================
  describe("autoImproveSkill", () => {
    it("メソッドが存在する", () => {
      expect(typeof store.autoImproveSkill).toBe("function");
    });

    it("正常な全自動改善後にcurrentAnalysisが更新される", async () => {
      await store.autoImproveSkill("test-skill");

      expect(store.currentAnalysis).toEqual(mockAnalysis);
      expect(store.isImproving).toBe(false);
      expect(store.skillError).toBeNull();
    });

    it("全自動改善中にisImprovingがtrueになる", async () => {
      const promise = store.autoImproveSkill("test-skill");

      expect(store.isImproving).toBe(true);

      await promise;
    });

    it("APIが正しい引数で呼ばれる", async () => {
      await store.autoImproveSkill("  test-skill  ");

      expect(window.electronAPI.skill.autoImprove).toHaveBeenCalledWith(
        "test-skill",
      );
    });

    it("全自動改善後にanalyzeが呼ばれる（再分析）", async () => {
      await store.autoImproveSkill("test-skill");

      expect(window.electronAPI.skill.analyze).toHaveBeenCalledWith(
        "test-skill",
      );
    });

    it("APIエラー時にskillErrorが設定される", async () => {
      setupMockElectronAPI({
        skillAutoImproveError: new Error("Auto improve failed"),
      });

      await store.autoImproveSkill("test-skill");

      expect(store.skillError).toContain("全自動改善に失敗");
      expect(store.skillError).toContain("Auto improve failed");
      expect(store.isImproving).toBe(false);
    });

    it("electronAPIが未定義の場合にエラーが設定される", async () => {
      (global as unknown as { window: { electronAPI: undefined } }).window = {
        electronAPI: undefined,
      };

      await store.autoImproveSkill("test-skill");

      expect(store.skillError).toContain("全自動改善に失敗");
      expect(store.isImproving).toBe(false);
    });

    // P42: 3段バリデーションテスト
    describe("P42: 3段バリデーション", () => {
      it("空文字列でバリデーションエラー", async () => {
        await store.autoImproveSkill("");

        expect(store.skillError).toBe("スキル名が無効です");
      });

      it("スペースのみでバリデーションエラー", async () => {
        await store.autoImproveSkill("   ");

        expect(store.skillError).toBe("スキル名が無効です");
      });

      it("非文字列でバリデーションエラー", async () => {
        await store.autoImproveSkill(null as unknown as string);

        expect(store.skillError).toBe("スキル名が無効です");
      });
    });
  });

  // ==========================================================================
  // createSkill テスト
  // ==========================================================================
  describe("createSkill", () => {
    const defaultOptions = {
      generateTasks: true,
      addAgents: false,
      addReferences: true,
    };

    it("メソッドが存在する", () => {
      expect(typeof store.createSkill).toBe("function");
    });

    it("正常なスキル作成でパスが返される", async () => {
      setupMockElectronAPI({
        skillCreate: { path: "/custom/path/my-skill" },
      });

      const result = await store.createSkill("テストスキル", defaultOptions);

      expect(result).toBe("/custom/path/my-skill");
      expect(store.skillError).toBeNull();
    });

    it("作成後にfetchSkillsが呼ばれる", async () => {
      await store.createSkill("テストスキル", defaultOptions);

      expect(window.electronAPI.skill.list).toHaveBeenCalled();
      expect(window.electronAPI.skill.getImported).toHaveBeenCalled();
    });

    it("APIが正しい引数で呼ばれる", async () => {
      await store.createSkill("  テストスキル  ", defaultOptions);

      expect(window.electronAPI.skill.create).toHaveBeenCalledWith({
        description: "テストスキル",
        options: defaultOptions,
      });
    });

    it("APIエラー時にskillErrorが設定され空文字が返される", async () => {
      setupMockElectronAPI({
        skillCreateError: new Error("Creation failed"),
      });

      const result = await store.createSkill("テストスキル", defaultOptions);

      expect(result).toBe("");
      expect(store.skillError).toContain("スキル作成に失敗");
      expect(store.skillError).toContain("Creation failed");
    });

    it("electronAPIが未定義の場合にエラーが設定される", async () => {
      (global as unknown as { window: { electronAPI: undefined } }).window = {
        electronAPI: undefined,
      };

      const result = await store.createSkill("テストスキル", defaultOptions);

      expect(result).toBe("");
      expect(store.skillError).toContain("スキル作成に失敗");
    });

    // P42: 3段バリデーションテスト
    describe("P42: 3段バリデーション", () => {
      it("空文字列でバリデーションエラー", async () => {
        const result = await store.createSkill("", defaultOptions);

        expect(result).toBe("");
        expect(store.skillError).toBe("スキルの説明が無効です");
      });

      it("スペースのみでバリデーションエラー", async () => {
        const result = await store.createSkill("   ", defaultOptions);

        expect(result).toBe("");
        expect(store.skillError).toBe("スキルの説明が無効です");
      });

      it("非文字列でバリデーションエラー", async () => {
        const result = await store.createSkill(
          undefined as unknown as string,
          defaultOptions,
        );

        expect(result).toBe("");
        expect(store.skillError).toBe("スキルの説明が無効です");
      });
    });
  });

  // ==========================================================================
  // clearAnalysis テスト
  // ==========================================================================
  describe("clearAnalysis", () => {
    it("メソッドが存在する", () => {
      expect(typeof store.clearAnalysis).toBe("function");
    });

    it("currentAnalysisがnullにクリアされる", () => {
      store.currentAnalysis = mockAnalysis;

      store.clearAnalysis();

      expect(store.currentAnalysis).toBeNull();
    });

    it("既にnullの場合もエラーなく動作する", () => {
      store.currentAnalysis = null;

      store.clearAnalysis();

      expect(store.currentAnalysis).toBeNull();
    });
  });

  // ==========================================================================
  // 状態遷移テスト
  // ==========================================================================
  describe("状態遷移テスト", () => {
    it("分析 → 改善適用の連続操作で状態が正しく遷移する", async () => {
      // 1. 分析
      await store.analyzeSkill("test-skill");
      expect(store.currentAnalysis).toEqual(mockAnalysis);
      expect(store.isAnalyzing).toBe(false);

      // 2. 改善適用
      await store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);
      expect(store.isImproving).toBe(false);
      expect(store.currentAnalysis).toEqual(mockAnalysis);
    });

    it("分析 → クリア → 再分析の連続操作で状態が正しく遷移する", async () => {
      // 1. 分析
      await store.analyzeSkill("test-skill");
      expect(store.currentAnalysis).not.toBeNull();

      // 2. クリア
      store.clearAnalysis();
      expect(store.currentAnalysis).toBeNull();

      // 3. 再分析
      await store.analyzeSkill("test-skill");
      expect(store.currentAnalysis).toEqual(mockAnalysis);
    });

    it("エラー後にskillErrorがクリアされて再分析できる", async () => {
      // 1. エラー発生
      setupMockElectronAPI({
        skillAnalyzeError: new Error("First error"),
      });
      await store.analyzeSkill("test-skill");
      expect(store.skillError).toBeDefined();

      // 2. 再分析（正常）
      setupMockElectronAPI();
      await store.analyzeSkill("test-skill");
      expect(store.skillError).toBeNull();
      expect(store.currentAnalysis).toEqual(mockAnalysis);
    });

    // ------------------------------------------
    // TC-G2-22: applySkillImprovements 成功後の state 復元
    // ------------------------------------------
    it("TC-G2-22: applySkillImprovements 成功後に isImproving=false かつ currentAnalysis が更新される", async () => {
      // 初期分析
      await store.analyzeSkill("test-skill");
      expect(store.currentAnalysis).toEqual(mockAnalysis);

      // 改善適用
      await store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);

      // state 復元確認
      expect(store.isImproving).toBe(false);
      expect(store.isAnalyzing).toBe(false);
      expect(store.skillError).toBeNull();
      expect(store.currentAnalysis).toEqual(mockAnalysis); // 再分析結果
    });

    // ------------------------------------------
    // TC-G2-23a: autoImproveSkill 成功後の state 復元
    // ------------------------------------------
    it("TC-G2-23a: autoImproveSkill 成功後に isImproving=false かつ currentAnalysis が更新される", async () => {
      await store.autoImproveSkill("test-skill");

      expect(store.isImproving).toBe(false);
      expect(store.isAnalyzing).toBe(false);
      expect(store.skillError).toBeNull();
      expect(store.currentAnalysis).toEqual(mockAnalysis); // 再分析結果
    });

    // ------------------------------------------
    // TC-G2-23b: autoImproveSkill 失敗後の state 復元
    // ------------------------------------------
    it("TC-G2-23b: autoImproveSkill 失敗後に isImproving=false かつ skillError が設定される", async () => {
      setupMockElectronAPI({
        skillAutoImproveError: new Error("Auto improve failed"),
      });

      await store.autoImproveSkill("test-skill");

      expect(store.isImproving).toBe(false);
      expect(store.isAnalyzing).toBe(false);
      expect(store.skillError).toContain("全自動改善に失敗");
      expect(store.currentAnalysis).toBeNull(); // エラーのためnullのまま
    });

    // ------------------------------------------
    // TC-G2-24: analyze エラー後の retry で state が正常に再利用できる
    // ------------------------------------------
    it("TC-G2-24: analyze エラー後の retry で skillError がクリアされ currentAnalysis が設定される", async () => {
      // 1. エラー発生
      setupMockElectronAPI({
        skillAnalyzeError: new Error("Network error"),
      });
      await store.analyzeSkill("test-skill");

      expect(store.skillError).toContain("スキル分析に失敗");
      expect(store.isAnalyzing).toBe(false);
      expect(store.currentAnalysis).toBeNull();

      // 2. retry（正常）
      setupMockElectronAPI();
      await store.analyzeSkill("test-skill");

      expect(store.skillError).toBeNull();
      expect(store.isAnalyzing).toBe(false);
      expect(store.currentAnalysis).toEqual(mockAnalysis);
    });

    // ------------------------------------------
    // TC-G2-24b: applySkillImprovements エラー後の retry で state が正常に復元される
    // ------------------------------------------
    it("TC-G2-24b: applySkillImprovements エラー後の retry で正常に改善適用できる", async () => {
      // 1. 改善適用エラー
      setupMockElectronAPI({
        skillApplyImprovementsError: new Error("Apply failed"),
      });
      await store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);

      expect(store.skillError).toContain("改善適用に失敗");
      expect(store.isImproving).toBe(false);

      // 2. retry（正常）
      setupMockElectronAPI();
      await store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);

      expect(store.skillError).toBeNull();
      expect(store.isImproving).toBe(false);
      expect(store.currentAnalysis).toEqual(mockAnalysis);
    });
  });

  // ==========================================================================
  // RT-07: isAnalyzing / isImproving 排他制御の状態遷移テスト
  // ==========================================================================
  describe("RT-07: isAnalyzing / isImproving 排他制御", () => {
    it("analyzeSkill 実行中に isAnalyzing=true で isImproving は変化しない", async () => {
      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);

      const promise = store.analyzeSkill("test-skill");

      expect(store.isAnalyzing).toBe(true);
      expect(store.isImproving).toBe(false); // 分析は isImproving に影響しない

      await promise;

      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);
    });

    it("applySkillImprovements 実行中に isImproving=true で isAnalyzing は変化しない", async () => {
      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);

      const promise = store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);

      expect(store.isImproving).toBe(true);
      expect(store.isAnalyzing).toBe(false); // 改善は isAnalyzing に影響しない

      await promise;

      expect(store.isImproving).toBe(false);
    });

    it("autoImproveSkill 実行中に isImproving=true で isAnalyzing は変化しない", async () => {
      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);

      const promise = store.autoImproveSkill("test-skill");

      expect(store.isImproving).toBe(true);
      expect(store.isAnalyzing).toBe(false); // 全自動改善は isAnalyzing に影響しない

      await promise;

      expect(store.isImproving).toBe(false);
    });

    it("analyze → apply の連続操作で isAnalyzing と isImproving が互いに独立して遷移する", async () => {
      // 分析
      await store.analyzeSkill("test-skill");
      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);
      expect(store.currentAnalysis).toEqual(mockAnalysis);

      // 改善適用
      const promise = store.applySkillImprovements("test-skill", [
        mockAnalysis.suggestions[0],
      ]);
      expect(store.isImproving).toBe(true);
      expect(store.isAnalyzing).toBe(false);

      await promise;
      expect(store.isImproving).toBe(false);
      expect(store.isAnalyzing).toBe(false);
      expect(store.currentAnalysis).toEqual(mockAnalysis);
    });

    it("P42バリデーションエラー時に isAnalyzing/isImproving が false のまま維持される", async () => {
      // 空文字列で analyzeSkill
      await store.analyzeSkill("");
      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);
      expect(store.skillError).toBe("スキル名が無効です");

      // スペースのみで applySkillImprovements
      store.skillError = null;
      await store.applySkillImprovements("   ", [mockAnalysis.suggestions[0]]);
      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);
      expect(store.skillError).toBe("スキル名が無効です");

      // 空文字列で autoImproveSkill
      store.skillError = null;
      await store.autoImproveSkill("");
      expect(store.isAnalyzing).toBe(false);
      expect(store.isImproving).toBe(false);
      expect(store.skillError).toBe("スキル名が無効です");
    });
  });
});
