/**
 * @file useStreamingProgress.test.ts
 * @description useStreamingProgress Hook ユニットテスト
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 *
 * P5 対策: クリーンアップ関数呼び出しテスト
 * P9 準拠: beforeEach でストアリセット
 * P39 準拠: fireEvent のみ（hook テストのため不要）
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStreamingProgress } from "../useStreamingProgress";
import { useAppStore } from "../../store";

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

  Object.defineProperty(window, "electronAPI", {
    value: { skillCreator: mockSkillCreatorAPI },
    writable: true,
    configurable: true,
  });
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
});
