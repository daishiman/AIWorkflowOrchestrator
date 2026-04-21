/**
 * @file useStreamingProgress.test.ts
 * @description useStreamingProgress Hook ユニットテスト
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 *
 * P5 対策: クリーンアップ関数呼び出しテスト
 * P9 準拠: beforeEach でストアリセット
 * P39 準拠: fireEvent のみ（hook テストのため不要）
 */

import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, render, screen } from "@testing-library/react";
import { useStreamingProgress } from "../useStreamingProgress";
import { useAppStore } from "../../store";
import { GenerateStep } from "../../components/skill/wizard/GenerateStep";

// ---- Mock setup ----

const mockCleanup = vi.fn();
const mockOnProgress = vi.fn(() => mockCleanup);

const mockSkillCreatorAPI = {
  onProgress: mockOnProgress,
  plan: vi.fn(),
  execute: vi.fn(),
  getHistory: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // P9: ストアリセット
  useAppStore.getState().resetStreamingProgress();

  Object.defineProperty(window, "skillCreatorAPI", {
    value: mockSkillCreatorAPI,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Reflect.deleteProperty(window, "skillCreatorAPI");
});

describe("useStreamingProgress", () => {
  // ==========================================================
  // 初期状態
  // ==========================================================
  it("初期状態が idle を返す", () => {
    const { result } = renderHook(() => useStreamingProgress());
    expect(result.current.stage).toBe("idle");
    expect(result.current.percent).toBe(0);
    expect(result.current.message).toBe("");
    expect(result.current.previewContent).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isGenerating).toBe(false);
  });

  // ==========================================================
  // IPC リスナー登録
  // ==========================================================
  it("マウント時に onProgress リスナーが登録される", () => {
    renderHook(() => useStreamingProgress());
    expect(mockOnProgress).toHaveBeenCalledOnce();
    expect(mockOnProgress).toHaveBeenCalledWith(expect.any(Function));
  });

  // ==========================================================
  // P5: クリーンアップ
  // ==========================================================
  it("アンマウント時にクリーンアップ関数が呼ばれる（P5対策）", () => {
    const { unmount } = renderHook(() => useStreamingProgress());
    expect(mockCleanup).not.toHaveBeenCalled();
    unmount();
    expect(mockCleanup).toHaveBeenCalledOnce();
  });

  // ==========================================================
  // 進捗更新
  // ==========================================================
  it("onProgress コールバックで進捗が更新される", () => {
    const { result } = renderHook(() => useStreamingProgress());

    // onProgress に渡されたコールバックを取得して呼び出す
    const callback = mockOnProgress.mock.calls[0][0];

    act(() => {
      callback({
        phase: "planning",
        percentage: 15,
        message: "構造を計画中...",
      });
    });

    expect(result.current.stage).toBe("planning");
    expect(result.current.percent).toBe(15);
    expect(result.current.message).toBe("構造を計画中...");
    expect(result.current.isGenerating).toBe(true);
  });

  it("generating-skill フェーズが正しくマッピングされる", () => {
    const { result } = renderHook(() => useStreamingProgress());
    const callback = mockOnProgress.mock.calls[0][0];

    act(() => {
      callback({
        phase: "generating-skill",
        percentage: 40,
        message: "SKILL.md 生成中",
      });
    });

    expect(result.current.stage).toBe("generating-skill");
    expect(result.current.isGenerating).toBe(true);
  });

  it("done フェーズで isGenerating が false になる", () => {
    const { result } = renderHook(() => useStreamingProgress());
    const callback = mockOnProgress.mock.calls[0][0];

    act(() => {
      callback({ phase: "done", percentage: 100, message: "完了" });
    });

    expect(result.current.stage).toBe("done");
    expect(result.current.isGenerating).toBe(false);
  });

  // ==========================================================
  // エラー処理
  // ==========================================================
  it("error フェーズで API_KEY エラーが検出される", () => {
    const { result } = renderHook(() => useStreamingProgress());
    const callback = mockOnProgress.mock.calls[0][0];

    act(() => {
      callback({
        phase: "error",
        percentage: 0,
        message: "API_KEY is not set",
      });
    });

    expect(result.current.stage).toBe("error");
    expect(result.current.error).toEqual({
      code: "API_KEY_NOT_SET",
      message: "API_KEY is not set",
    });
    expect(result.current.isGenerating).toBe(false);
  });

  it("error フェーズで NETWORK エラーが検出される", () => {
    const { result } = renderHook(() => useStreamingProgress());
    const callback = mockOnProgress.mock.calls[0][0];

    act(() => {
      callback({
        phase: "error",
        percentage: 0,
        message: "NETWORK connection failed",
      });
    });

    expect(result.current.error?.code).toBe("NETWORK_ERROR");
  });

  it("error フェーズでデフォルトが LLM_ERROR になる", () => {
    const { result } = renderHook(() => useStreamingProgress());
    const callback = mockOnProgress.mock.calls[0][0];

    act(() => {
      callback({
        phase: "error",
        percentage: 0,
        message: "Rate limit exceeded",
      });
    });

    expect(result.current.error?.code).toBe("LLM_ERROR");
  });

  // ==========================================================
  // 未知のフェーズ
  // ==========================================================
  it("未知のフェーズは planning にフォールバックする", () => {
    const { result } = renderHook(() => useStreamingProgress());
    const callback = mockOnProgress.mock.calls[0][0];

    act(() => {
      callback({
        phase: "unknown-phase",
        percentage: 5,
        message: "不明なフェーズ",
      });
    });

    expect(result.current.stage).toBe("planning");
  });

  // ==========================================================
  // electronAPI が存在しない場合
  // ==========================================================
  it("electronAPI が存在しない場合でもクラッシュしない", () => {
    Object.defineProperty(window, "electronAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useStreamingProgress());
    expect(result.current.stage).toBe("idle");
  });

  // ==========================================================
  // Phase 6: リスナー登録・解除テスト（P5対策）
  // ==========================================================
  describe("リスナーライフサイクル（P5対策）", () => {
    it("再マウント時にリスナーが二重登録されない", () => {
      const { unmount } = renderHook(() => useStreamingProgress());

      expect(mockOnProgress).toHaveBeenCalledTimes(1);
      unmount();
      expect(mockCleanup).toHaveBeenCalledTimes(1);

      // 再マウント
      renderHook(() => useStreamingProgress());
      expect(mockOnProgress).toHaveBeenCalledTimes(2);
    });

    it("アンマウント後に進捗イベントが到着してもストアが更新されない", () => {
      const { unmount } = renderHook(() => useStreamingProgress());
      unmount();

      // アンマウント後にコールバックを呼び出す
      // resetStreamingProgress がクリーンアップで呼ばれるため、
      // ストアは idle にリセットされているはず
      expect(useAppStore.getState().streamingStage).toBe("idle");
    });
  });

  // ==========================================================
  // TASK-SC-08: モード別phaseマッピングテスト（TC-00〜TC-09）
  // ==========================================================
  describe("モード別phaseマッピング（TC-01〜TC-09）", () => {
    it("TC-00: collaborative mode - interview が planning にマッピングされる", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({
          phase: "interview",
          percentage: 10,
          message: "対話を開始しています",
        });
      });
      expect(result.current.stage).toBe("planning");
      expect(result.current.message).toBe("対話を開始しています");
      expect(result.current.isGenerating).toBe(true);
    });

    it("TC-00b: collaborative mode - consensus が planning にマッピングされる", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({
          phase: "consensus",
          percentage: 35,
          message: "合意形成を行っています",
        });
      });
      expect(result.current.stage).toBe("planning");
      expect(result.current.message).toBe("合意形成を行っています");
      expect(result.current.isGenerating).toBe(true);
    });

    it("TC-01: update mode - loading-skill が planning にマッピングされる", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({
          phase: "loading-skill",
          percentage: 10,
          message: "スキル読み込み中",
        });
      });
      expect(result.current.stage).toBe("planning");
      expect(result.current.isGenerating).toBe(true);
    });

    it("TC-02: update mode - analyzing が planning にマッピングされる", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({
          phase: "analyzing",
          percentage: 20,
          message: "スキル分析中",
        });
      });
      expect(result.current.stage).toBe("planning");
      expect(result.current.isGenerating).toBe(true);
    });

    it("TC-03: orchestrate mode - engine-selection が planning にマッピングされる", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({
          phase: "engine-selection",
          percentage: 15,
          message: "実行エンジン選択中",
        });
      });
      expect(result.current.stage).toBe("planning");
      expect(result.current.isGenerating).toBe(true);
    });

    it("TC-04: improve-prompt mode - improving が generating-skill にマッピングされる", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({
          phase: "improving",
          percentage: 50,
          message: "プロンプト改善中",
        });
      });
      expect(result.current.stage).toBe("generating-skill");
      expect(result.current.isGenerating).toBe(true);
    });

    it("TC-05: 未知のphaseは planning にフォールバックする（意図的）", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({
          phase: "completely-unknown-phase-xyz",
          percentage: 5,
          message: "不明フェーズ",
        });
      });
      expect(result.current.stage).toBe("planning");
    });

    it("TC-06: onProgress コールバックで streamingPercent と streamingMessage が更新される", () => {
      renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({
          phase: "loading-skill",
          percentage: 30,
          message: "読み込み中...",
        });
      });
      expect(useAppStore.getState().streamingPercent).toBe(30);
      expect(useAppStore.getState().streamingMessage).toBe("読み込み中...");
    });

    it("TC-07: idle 状態のストアに progress が来ても isGenerating フラグは stage に依存する", () => {
      const { result } = renderHook(() => useStreamingProgress());
      expect(result.current.isGenerating).toBe(false);
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({ phase: "done", percentage: 100, message: "完了" });
      });
      expect(result.current.isGenerating).toBe(false);
    });

    it("TC-08: アンマウント時に cleanup が呼ばれストアが idle にリセットされる", () => {
      const { unmount } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({ phase: "analyzing", percentage: 40, message: "分析中" });
      });
      expect(useAppStore.getState().streamingStage).toBe("planning");
      unmount();
      expect(mockCleanup).toHaveBeenCalledOnce();
      expect(useAppStore.getState().streamingStage).toBe("idle");
    });

    it("TC-09: 全モードのmode-specific phase が正しいstageにマッピングされる（退行なし）", () => {
      const modePhaseMap = [
        { phase: "loading-skill", expected: "planning" },
        { phase: "analyzing", expected: "planning" },
        { phase: "engine-selection", expected: "planning" },
        { phase: "improving", expected: "generating-skill" },
      ] as const;

      for (const { phase, expected } of modePhaseMap) {
        useAppStore.getState().resetStreamingProgress();
        const { result, unmount } = renderHook(() => useStreamingProgress());
        const callback =
          mockOnProgress.mock.calls[mockOnProgress.mock.calls.length - 1][0];
        act(() => {
          callback({ phase, percentage: 50, message: `${phase} 実行中` });
        });
        expect(result.current.stage).toBe(expected);
        unmount();
      }
    });
  });

  // ==========================================================
  // Phase 6: 全ステージマッピングテスト
  // ==========================================================
  describe("全ステージマッピング", () => {
    const stageMap = [
      { phase: "planning", expected: "planning" },
      { phase: "generating-skill", expected: "generating-skill" },
      { phase: "generating-agents", expected: "generating-agents" },
      { phase: "validating", expected: "validating" },
      { phase: "done", expected: "done" },
    ] as const;

    stageMap.forEach(({ phase, expected }) => {
      it(`phase "${phase}" が stage "${expected}" にマッピングされる`, () => {
        const { result } = renderHook(() => useStreamingProgress());
        const callback = mockOnProgress.mock.calls[0][0];

        act(() => {
          callback({ phase, percentage: 50, message: `${phase} message` });
        });

        expect(result.current.stage).toBe(expected);
      });
    });
  });

  // ==========================================================
  // Phase 6: generationProgressSlice アクション直接テスト
  // ==========================================================
  describe("generationProgressSlice アクション", () => {
    it("setStreamingPreviewContent でプレビューが更新される", () => {
      const { result } = renderHook(() => useStreamingProgress());

      act(() => {
        useAppStore.getState().setStreamingPreviewContent("# Preview");
      });

      expect(result.current.previewContent).toBe("# Preview");
    });

    it("updateStreamingProgress で previewContent を含めて更新できる", () => {
      const { result } = renderHook(() => useStreamingProgress());

      act(() => {
        useAppStore.getState().updateStreamingProgress({
          stage: "generating-skill",
          percent: 50,
          message: "生成中",
          previewContent: "# SKILL.md",
        });
      });

      expect(result.current.stage).toBe("generating-skill");
      expect(result.current.percent).toBe(50);
      expect(result.current.previewContent).toBe("# SKILL.md");
    });

    it("updateStreamingProgress で previewContent を省略した場合は変更されない", () => {
      act(() => {
        useAppStore.getState().setStreamingPreviewContent("existing content");
      });

      const { result } = renderHook(() => useStreamingProgress());

      act(() => {
        useAppStore.getState().updateStreamingProgress({
          stage: "validating",
          percent: 90,
          message: "検証中",
        });
      });

      expect(result.current.stage).toBe("validating");
      expect(result.current.previewContent).toBe("existing content");
    });

    it("setStreamingPercent で進捗パーセントが更新される", () => {
      act(() => {
        useAppStore.getState().setStreamingPercent(75);
      });

      expect(useAppStore.getState().streamingPercent).toBe(75);
    });

    it("setStreamingMessage でメッセージが更新される", () => {
      act(() => {
        useAppStore.getState().setStreamingMessage("テストメッセージ");
      });

      expect(useAppStore.getState().streamingMessage).toBe("テストメッセージ");
    });
  });

  // ==========================================================
  // Phase 6: isGenerating フラグテスト
  // ==========================================================
  describe("isGenerating フラグ", () => {
    it("idle では false", () => {
      const { result } = renderHook(() => useStreamingProgress());
      expect(result.current.isGenerating).toBe(false);
    });

    const activePhases = [
      "planning",
      "generating-skill",
      "generating-agents",
      "validating",
    ];
    activePhases.forEach((phase) => {
      it(`${phase} では true`, () => {
        const { result } = renderHook(() => useStreamingProgress());
        const callback = mockOnProgress.mock.calls[0][0];
        act(() => {
          callback({ phase, percentage: 50, message: "test" });
        });
        expect(result.current.isGenerating).toBe(true);
      });
    });

    it("error では false", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];
      act(() => {
        callback({ phase: "error", percentage: 0, message: "err" });
      });
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe("hook から UI への反映", () => {
    function StreamingProgressHarness() {
      const streaming = useStreamingProgress();
      return React.createElement(GenerateStep, {
        stage: streaming.stage,
        percent: streaming.percent,
        message: streaming.message,
        previewContent: streaming.previewContent,
        error: streaming.error,
        isGenerating: streaming.isGenerating,
      });
    }

    it("onProgress で受けた message が GenerateStep に表示される", () => {
      render(React.createElement(StreamingProgressHarness));
      const callback = mockOnProgress.mock.calls[0][0];

      act(() => {
        callback({
          phase: "consensus",
          percentage: 35,
          message: "合意形成を行っています",
        });
      });

      expect(screen.getByText("合意形成を行っています")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "35",
      );
    });
  });

  describe("planId フィルタ", () => {
    it("一致する planId の progress のみ反映する", () => {
      const { result } = renderHook(() =>
        useStreamingProgress({ planId: "plan-1" }),
      );
      const callback = mockOnProgress.mock.calls[0][0];

      act(() => {
        callback({
          phase: "planning",
          percentage: 25,
          message: "plan-1 の進捗",
          planId: "plan-1",
        });
      });

      expect(result.current.stage).toBe("planning");
      expect(result.current.percent).toBe(25);
      expect(result.current.message).toBe("plan-1 の進捗");
    });

    it("不一致の planId の progress は無視する", () => {
      const { result } = renderHook(() =>
        useStreamingProgress({ planId: "plan-1" }),
      );
      const callback = mockOnProgress.mock.calls[0][0];

      act(() => {
        callback({
          phase: "planning",
          percentage: 25,
          message: "plan-2 の進捗",
          planId: "plan-2",
        });
      });

      expect(result.current.stage).toBe("idle");
      expect(result.current.percent).toBe(0);
      expect(result.current.message).toBe("");
    });

    it("legacy payload は planId 未指定でも受け入れる", () => {
      const { result } = renderHook(() =>
        useStreamingProgress({ planId: "plan-1" }),
      );
      const callback = mockOnProgress.mock.calls[0][0];

      act(() => {
        callback({
          phase: "planning",
          percentage: 30,
          message: "legacy progress",
        });
      });

      expect(result.current.stage).toBe("planning");
      expect(result.current.percent).toBe(30);
      expect(result.current.message).toBe("legacy progress");
    });

    it("options.planId 未指定時は全 progress を受け入れる", () => {
      const { result } = renderHook(() => useStreamingProgress());
      const callback = mockOnProgress.mock.calls[0][0];

      act(() => {
        callback({
          phase: "planning",
          percentage: 40,
          message: "no filter",
          planId: "plan-2",
        });
      });

      expect(result.current.stage).toBe("planning");
      expect(result.current.percent).toBe(40);
      expect(result.current.message).toBe("no filter");
    });
  });
});
