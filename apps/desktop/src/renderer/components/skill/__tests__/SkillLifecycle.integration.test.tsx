/**
 * @vitest-environment happy-dom
 * @file SkillLifecycle.integration.test.tsx
 * @description G2: Store駆動ライフサイクル統合テスト
 * @task TASK-10A-G Phase 4-5
 *
 * Store action経由でのcreate/analyze/improve遷移を検証する。
 * P9準拠: beforeEachで状態リセット
 * P31準拠: 個別セレクタのみ使用（合成Hook禁止）
 * P39準拠: happy-dom環境ではfireEvent使用（userEvent禁止）
 * P48準拠: 派生セレクタのuseShallow適用確認
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, render, screen } from "@testing-library/react";
import {
  useAppStore,
  useCreateSkill,
  useAnalyzeSkill,
  useApplySkillImprovements,
} from "../../../store";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";
import type { SkillCreatorWorkflowUiSnapshot } from "@repo/shared/types/skillCreator";

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
// Preload API モック
// ==========================================================================

function setupMockElectronAPI(overrides: Record<string, unknown> = {}): void {
  const mockSkillAPI = {
    analyze: vi.fn().mockResolvedValue(mockAnalysis),
    applyImprovements: vi.fn().mockResolvedValue({ applied: [], skipped: [] }),
    autoImprove: vi.fn().mockResolvedValue({ applied: [], skipped: [] }),
    create: vi.fn().mockResolvedValue({ path: "/path/to/new-skill" }),
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
    ...overrides,
  };

  (window as Record<string, unknown>).electronAPI = {
    skill: mockSkillAPI,
  };
}

function getSkillAPI() {
  return (
    window as Record<string, unknown> & {
      electronAPI: { skill: Record<string, ReturnType<typeof vi.fn>> };
    }
  ).electronAPI.skill;
}

// ==========================================================================
// テスト定数
// ==========================================================================

/** createSkill で繰り返し使用するデフォルトオプション */
const DEFAULT_CREATE_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
} as const;

// ==========================================================================
// テストスイート
// ==========================================================================

describe("G2: Store駆動ライフサイクル統合テスト", () => {
  beforeEach(() => {
    // P9: テスト間の状態リークを防止
    useAppStore.getState().resetAgentState();
    setupMockElectronAPI();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Record<string, unknown>).electronAPI;
  });

  // ========================================================================
  // G2-CL: create -> fetch 遷移
  // ========================================================================
  describe("G2-CL: create -> fetch 遷移", () => {
    it("G2-CL-1: createSkill 成功後に fetchSkills が呼ばれる", async () => {
      const { result } = renderHook(() => useCreateSkill());

      await act(async () => {
        await result.current("テストスキル説明", DEFAULT_CREATE_OPTIONS);
      });

      const api = getSkillAPI();
      // createSkill 成功後に内部で fetchSkills が呼ばれ、list + getImported が実行される
      expect(api.create).toHaveBeenCalledTimes(1);
      expect(api.list).toHaveBeenCalledTimes(1);
      expect(api.getImported).toHaveBeenCalledTimes(1);
    });

    it("G2-CL-2: createSkill 成功後に preload API へ description/options が渡る", async () => {
      const { result } = renderHook(() => useCreateSkill());

      const options = {
        generateTasks: true,
        addAgents: true,
        addReferences: false,
      };

      await act(async () => {
        await result.current("カスタムスキル", options);
      });

      const api = getSkillAPI();
      expect(api.create).toHaveBeenCalledWith({
        description: "カスタムスキル",
        options,
      });
    });

    it("G2-CL-3: createSkill 失敗時にエラー状態が設定される", async () => {
      setupMockElectronAPI({
        create: vi.fn().mockRejectedValue(new Error("作成失敗")),
      });

      const { result } = renderHook(() => useCreateSkill());

      let returnValue: string = "";
      await act(async () => {
        returnValue = await result.current("テスト", DEFAULT_CREATE_OPTIONS);
      });

      expect(returnValue).toBe("");
      const state = useAppStore.getState();
      expect(state.skillError).toContain("スキル作成に失敗");
      expect(state.skillError).toContain("作成失敗");
    });
  });

  // ========================================================================
  // G2-LA: analyze 状態遷移
  // ========================================================================
  describe("G2-LA: analyze 状態遷移", () => {
    it("G2-LA-1: analyzeSkill 開始時に currentAnalysis がクリアされる", async () => {
      // 事前に分析結果を設定
      useAppStore.setState({ currentAnalysis: mockAnalysis });
      expect(useAppStore.getState().currentAnalysis).not.toBeNull();

      const { result } = renderHook(() => useAnalyzeSkill());

      // 分析開始（即座に currentAnalysis がクリアされるはず）
      let promise: Promise<void>;
      act(() => {
        promise = result.current("another-skill");
      });

      // 同期的に currentAnalysis がクリアされている
      expect(useAppStore.getState().currentAnalysis).toBeNull();

      await act(async () => {
        await promise!;
      });
    });

    it("G2-LA-2: analyzeSkill 実行中に isAnalyzing が true になる", async () => {
      // analyze を遅延させるモック
      let resolveAnalyze: (value: SkillAnalysis) => void;
      setupMockElectronAPI({
        analyze: vi.fn().mockImplementation(
          () =>
            new Promise<SkillAnalysis>((resolve) => {
              resolveAnalyze = resolve;
            }),
        ),
      });

      const { result } = renderHook(() => useAnalyzeSkill());

      expect(useAppStore.getState().isAnalyzing).toBe(false);

      let promise: Promise<void>;
      act(() => {
        promise = result.current("test-skill");
      });

      // 実行中は isAnalyzing が true
      expect(useAppStore.getState().isAnalyzing).toBe(true);

      // 完了させる
      await act(async () => {
        resolveAnalyze!(mockAnalysis);
        await promise!;
      });

      expect(useAppStore.getState().isAnalyzing).toBe(false);
    });

    it("G2-LA-3: analyzeSkill 完了後に currentAnalysis が設定される", async () => {
      const { result } = renderHook(() => useAnalyzeSkill());

      expect(useAppStore.getState().currentAnalysis).toBeNull();

      await act(async () => {
        await result.current("test-skill");
      });

      expect(useAppStore.getState().currentAnalysis).toEqual(mockAnalysis);
      expect(useAppStore.getState().isAnalyzing).toBe(false);
      expect(useAppStore.getState().skillError).toBeNull();
    });
  });

  // ========================================================================
  // G2-AI: improve 状態遷移
  // ========================================================================
  describe("G2-AI: improve 状態遷移", () => {
    it("G2-AI-1: applySkillImprovements 実行中は isImproving=true", async () => {
      let resolveApply: (value: unknown) => void;
      let resolveAnalyze: (value: SkillAnalysis) => void;
      setupMockElectronAPI({
        applyImprovements: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              resolveApply = resolve;
            }),
        ),
        analyze: vi.fn().mockImplementation(
          () =>
            new Promise<SkillAnalysis>((resolve) => {
              resolveAnalyze = resolve;
            }),
        ),
      });

      const { result } = renderHook(() => useApplySkillImprovements());

      expect(useAppStore.getState().isImproving).toBe(false);

      let promise: Promise<void>;
      act(() => {
        promise = result.current("test-skill", [mockAnalysis.suggestions[0]]);
      });

      expect(useAppStore.getState().isImproving).toBe(true);

      await act(async () => {
        resolveApply!({ applied: [], skipped: [] });
        // applyImprovements 完了後に analyze が呼ばれるため、それも解決
        await new Promise((r) => setTimeout(r, 0));
        resolveAnalyze!(mockAnalysis);
        await promise!;
      });

      expect(useAppStore.getState().isImproving).toBe(false);
    });

    it("G2-AI-2: 改善完了後の currentAnalysis の状態を検証する", async () => {
      const { result } = renderHook(() => useApplySkillImprovements());

      await act(async () => {
        await result.current("test-skill", [mockAnalysis.suggestions[0]]);
      });

      // applySkillImprovements 完了後に再分析が実行され、currentAnalysis が更新される
      const state = useAppStore.getState();
      expect(state.currentAnalysis).toEqual(mockAnalysis);
      expect(state.isImproving).toBe(false);
      expect(state.skillError).toBeNull();
    });

    it("G2-AI-3: 改善失敗時に skillError が設定される", async () => {
      setupMockElectronAPI({
        applyImprovements: vi
          .fn()
          .mockRejectedValue(new Error("改善適用エラー")),
      });

      const { result } = renderHook(() => useApplySkillImprovements());

      await act(async () => {
        await result.current("test-skill", [mockAnalysis.suggestions[0]]);
      });

      const state = useAppStore.getState();
      expect(state.skillError).toContain("改善適用に失敗");
      expect(state.skillError).toContain("改善適用エラー");
      expect(state.isImproving).toBe(false);
    });
  });

  // ========================================================================
  // G2-VAL: バリデーション分岐（Phase 6 edge case 追加）
  // ========================================================================
  describe("G2-VAL: バリデーション分岐", () => {
    it("G2-VAL-1: createSkill に空文字列を渡すと skillError が設定される", async () => {
      const { result } = renderHook(() => useCreateSkill());

      let returnValue: string = "initial";
      await act(async () => {
        returnValue = await result.current("", DEFAULT_CREATE_OPTIONS);
      });

      expect(returnValue).toBe("");
      const state = useAppStore.getState();
      expect(state.skillError).toContain("スキルの説明が無効です");
    });

    it("G2-VAL-2: createSkill にスペースのみを渡すと skillError が設定される（P42）", async () => {
      const { result } = renderHook(() => useCreateSkill());

      let returnValue: string = "initial";
      await act(async () => {
        returnValue = await result.current("   ", DEFAULT_CREATE_OPTIONS);
      });

      expect(returnValue).toBe("");
      expect(useAppStore.getState().skillError).toContain(
        "スキルの説明が無効です",
      );
    });

    it("G2-VAL-3: analyzeSkill に空文字列を渡すと skillError が設定される", async () => {
      const { result } = renderHook(() => useAnalyzeSkill());

      await act(async () => {
        await result.current("");
      });

      expect(useAppStore.getState().skillError).toContain("スキル名が無効です");
      expect(useAppStore.getState().isAnalyzing).toBe(false);
    });

    it("G2-VAL-4: applySkillImprovements に空文字列を渡すと skillError が設定される", async () => {
      const { result } = renderHook(() => useApplySkillImprovements());

      await act(async () => {
        await result.current("", [mockAnalysis.suggestions[0]]);
      });

      expect(useAppStore.getState().skillError).toContain("スキル名が無効です");
      expect(useAppStore.getState().isImproving).toBe(false);
    });

    it("G2-VAL-5: applySkillImprovements に空の suggestions 配列を渡すと skillError が設定される", async () => {
      const { result } = renderHook(() => useApplySkillImprovements());

      await act(async () => {
        await result.current("test-skill", []);
      });

      expect(useAppStore.getState().skillError).toContain(
        "改善提案が選択されていません",
      );
      expect(useAppStore.getState().isImproving).toBe(false);
    });

    it("G2-VAL-6: analyzeSkill 失敗時に skillError が設定される", async () => {
      setupMockElectronAPI({
        analyze: vi.fn().mockRejectedValue(new Error("分析エラー")),
      });

      const { result } = renderHook(() => useAnalyzeSkill());

      await act(async () => {
        await result.current("test-skill");
      });

      const state = useAppStore.getState();
      expect(state.skillError).toContain("スキル分析に失敗");
      expect(state.skillError).toContain("分析エラー");
      expect(state.isAnalyzing).toBe(false);
      expect(state.currentAnalysis).toBeNull();
    });
  });

  // ========================================================================
  // G2-GUARD: API guard 分岐（Phase 6 edge case 追加）
  // ========================================================================
  describe("G2-GUARD: API guard 分岐", () => {
    it("G2-GUARD-1: electronAPI.skill が未定義の場合 createSkill がエラーを返す", async () => {
      // electronAPI.skill を未定義にする
      (window as Record<string, unknown>).electronAPI = {};

      const { result } = renderHook(() => useCreateSkill());

      let returnValue: string = "initial";
      await act(async () => {
        returnValue = await result.current("テスト", DEFAULT_CREATE_OPTIONS);
      });

      expect(returnValue).toBe("");
      expect(useAppStore.getState().skillError).toContain("スキル作成に失敗");
    });

    it("G2-GUARD-2: electronAPI.skill が未定義の場合 analyzeSkill がエラーを返す", async () => {
      (window as Record<string, unknown>).electronAPI = {};

      const { result } = renderHook(() => useAnalyzeSkill());

      await act(async () => {
        await result.current("test-skill");
      });

      expect(useAppStore.getState().skillError).toContain("スキル分析に失敗");
      expect(useAppStore.getState().isAnalyzing).toBe(false);
    });

    it("G2-GUARD-3: electronAPI.skill が未定義の場合 applySkillImprovements がエラーを返す", async () => {
      (window as Record<string, unknown>).electronAPI = {};

      const { result } = renderHook(() => useApplySkillImprovements());

      await act(async () => {
        await result.current("test-skill", [mockAnalysis.suggestions[0]]);
      });

      expect(useAppStore.getState().skillError).toContain("改善適用に失敗");
      expect(useAppStore.getState().isImproving).toBe(false);
    });
  });

  // ========================================================================
  // INT-01~04: ConversationalInterview 統合確認（Phase 6 追加）
  // ========================================================================
  describe("G2-INT: ConversationalInterview 統合確認", () => {
    it("INT-01: ConversationalInterview は interview フェーズの snapshot でマウントされる", async () => {
      const { ConversationalInterview } =
        await import("../ConversationalInterview");

      const snapshot: SkillCreatorWorkflowUiSnapshot = {
        planId: "plan-int-1",
        currentPhase: "review",
        awaitingUserInput: {
          requestId: "req-int-1",
          reason: "plan_review",
          title: "INT-01",
          prompt: "統合テスト質問",
          kind: "single_select",
          options: [{ id: "opt-1", label: "選択肢1" }],
          requestedAt: new Date().toISOString(),
        },
        verifyResult: null,
        resumeTokenEnvelope: {
          version: "task-sdk-02-v1",
          planId: "plan-int-1",
          currentPhase: "review",
          artifactCount: 0,
          updatedAt: new Date().toISOString(),
        },
      };

      render(
        <ConversationalInterview
          workflowSnapshot={snapshot}
          onSubmit={vi.fn().mockResolvedValue(undefined)}
        />,
      );

      expect(
        screen.getByTestId("conversational-interview"),
      ).toBeInTheDocument();
    });

    it("INT-02: single_select widget が ConversationalInterview 内に表示される", async () => {
      const { ConversationalInterview } =
        await import("../ConversationalInterview");

      const snapshot: SkillCreatorWorkflowUiSnapshot = {
        planId: "plan-int-2",
        currentPhase: "review",
        awaitingUserInput: {
          requestId: "req-int-2",
          reason: "plan_review",
          title: "INT-02",
          prompt: "widget 統合確認",
          kind: "single_select",
          options: [
            { id: "w-a", label: "Widget A" },
            { id: "w-b", label: "Widget B" },
          ],
          requestedAt: new Date().toISOString(),
        },
        verifyResult: null,
        resumeTokenEnvelope: {
          version: "task-sdk-02-v1",
          planId: "plan-int-2",
          currentPhase: "review",
          artifactCount: 0,
          updatedAt: new Date().toISOString(),
        },
      };

      render(
        <ConversationalInterview
          workflowSnapshot={snapshot}
          onSubmit={vi.fn().mockResolvedValue(undefined)}
        />,
      );

      expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
      expect(screen.getByTestId("chip-w-a")).toBeInTheDocument();
      expect(screen.getByTestId("chip-w-b")).toBeInTheDocument();
    });

    it("INT-04: SkillCreatorResultPanel は skill/ ディレクトリから正しくインポートできる", async () => {
      const { SkillCreatorResultPanel } =
        await import("../SkillCreatorResultPanel");

      const payload = {
        skillName: "test-skill",
        savedPath: "/project/.claude/skills/test-skill/SKILL.md",
        content: "name: test-skill",
        requiresOverwriteConfirm: false,
      };

      render(
        <SkillCreatorResultPanel
          payload={payload}
          onOpenSkill={vi.fn()}
          onConfirmOverwrite={vi.fn()}
        />,
      );

      // SkillCreatorResultPanel はclassベースのルートdivを持つ（data-testidなし）
      expect(
        screen.getByText("スキルを生成しました: test-skill"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "スキルを開く" }),
      ).toBeInTheDocument();
    });
  });

  // ========================================================================
  // G2-SD: Store 駆動検証
  // ========================================================================
  describe("G2-SD: Store 駆動検証", () => {
    it("G2-SD-1: 個別セレクタ useCreateSkill の参照が安定（P31）", () => {
      const { result, rerender } = renderHook(() => useCreateSkill());

      const firstRef = result.current;
      rerender();
      const secondRef = result.current;
      rerender();
      const thirdRef = result.current;

      // P31: Zustand アクション参照は再レンダリング間で安定（Object.is）
      expect(Object.is(firstRef, secondRef)).toBe(true);
      expect(Object.is(secondRef, thirdRef)).toBe(true);
    });

    it("G2-SD-2: 個別セレクタ useAnalyzeSkill / useApplySkillImprovements の参照が安定（P31）", () => {
      const { result: analyzeResult, rerender: rerenderAnalyze } = renderHook(
        () => useAnalyzeSkill(),
      );
      const { result: improveResult, rerender: rerenderImprove } = renderHook(
        () => useApplySkillImprovements(),
      );

      const analyzeRef1 = analyzeResult.current;
      const improveRef1 = improveResult.current;

      rerenderAnalyze();
      rerenderImprove();

      const analyzeRef2 = analyzeResult.current;
      const improveRef2 = improveResult.current;

      expect(Object.is(analyzeRef1, analyzeRef2)).toBe(true);
      expect(Object.is(improveRef1, improveRef2)).toBe(true);
    });

    it("G2-SD-3: beforeEach で Store 状態が初期化されテスト間リークしない（P9）", () => {
      // このテストは beforeEach の resetAgentState が機能していることを検証
      const state = useAppStore.getState();

      // 初期状態であることを確認（前のテストの状態がリークしていない）
      expect(state.currentAnalysis).toBeNull();
      expect(state.isAnalyzing).toBe(false);
      expect(state.isImproving).toBe(false);
      expect(state.skillError).toBeNull();
      expect(state.isLoadingSkills).toBe(false);
      expect(state.importedSkills).toEqual([]);
      expect(state.availableSkillsMetadata).toEqual([]);
    });
  });
});
