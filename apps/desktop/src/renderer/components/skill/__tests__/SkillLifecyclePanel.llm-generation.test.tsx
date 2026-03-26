/**
 * @vitest-environment happy-dom
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import type { TerminalHandoffBundle } from "@repo/shared/types";

// --- mock 関数定義（vi.mock 巻き上げ前に宣言）---
const mockCreateSkill = vi.fn();
const mockExecuteSkill = vi.fn();
const mockReExecuteAfterImprovement = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearStreamingMessages = vi.fn();
const mockBeginSkillReview = vi.fn();
const mockCompleteSkillReview = vi.fn();
const mockResetSkillExecutionCycle = vi.fn();
const mockFetchSkills = vi.fn();
const mockSetIsGenerating = vi.fn();
const mockSetGenerationError = vi.fn();
const mockSetGenerationProgress = vi.fn();
const mockSetCurrentPlanId = vi.fn();
const mockSetCurrentPlanResult = vi.fn();
const mockClearGenerationState = vi.fn();

type MockStoreState = {
  selectedSkillName: string | null;
  isExecuting: boolean;
  streamingMessages: Array<{
    timestamp: number;
    type: string;
    content: unknown;
  }>;
  skillExecutionStatus: string | null;
  skillError: string | null;
  // LLM Generation state
  isGenerating: boolean;
  generationProgress: string | null;
  generationError: string | null;
  currentPlanId: string | null;
  currentPlanResult: {
    type: "integrated_api" | "terminal_handoff";
    planId?: string;
    estimatedSteps?: number;
    guidance?: { reason: string; command: string };
  } | null;
};

let mockStoreState: MockStoreState = {
  selectedSkillName: null,
  isExecuting: false,
  streamingMessages: [],
  skillExecutionStatus: null,
  skillError: null,
  isGenerating: false,
  generationProgress: null,
  generationError: null,
  currentPlanId: null,
  currentPlanResult: null,
};

vi.mock("../../../store", () => ({
  // Existing selectors
  useBeginSkillReview: () => mockBeginSkillReview,
  useCreateSkill: () => mockCreateSkill,
  useCompleteSkillReview: () => mockCompleteSkillReview,
  useExecuteSkill: () => mockExecuteSkill,
  useReExecuteAfterImprovement: () => mockReExecuteAfterImprovement,
  useResetSkillExecutionCycle: () => mockResetSkillExecutionCycle,
  useSelectSkillByName: () => mockSelectSkillByName,
  useClearSkillError: () => mockClearSkillError,
  useClearStreamingMessages: () => mockClearStreamingMessages,
  useSelectedSkillName: () => mockStoreState.selectedSkillName,
  useIsSkillExecuting: () => mockStoreState.isExecuting,
  useStreamingMessages: () => mockStoreState.streamingMessages,
  useSkillExecutionStatus: () => mockStoreState.skillExecutionStatus,
  useSkillError: () => mockStoreState.skillError,
  useFetchSkills: () => mockFetchSkills,
  // New LLM generation selectors (Phase 5 で実装予定)
  useIsSkillGenerating: () => mockStoreState.isGenerating,
  useGenerationProgress: () => mockStoreState.generationProgress,
  useGenerationError: () => mockStoreState.generationError,
  useCurrentPlanId: () => mockStoreState.currentPlanId,
  useCurrentPlanResult: () => mockStoreState.currentPlanResult,
  useSetIsSkillGenerating: () => mockSetIsGenerating,
  useSetGenerationError: () => mockSetGenerationError,
  useSetGenerationProgress: () => mockSetGenerationProgress,
  useSetCurrentPlanId: () => mockSetCurrentPlanId,
  useSetCurrentPlanResult: () => mockSetCurrentPlanResult,
  useClearGenerationState: () => mockClearGenerationState,
}));

vi.mock("../SkillStreamingView", () => ({
  SkillStreamingView: ({ skillName }: { skillName: string }) => (
    <div data-testid="mock-streaming-view">{skillName}</div>
  ),
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({
    skillName,
    onClose,
  }: {
    skillName: string;
    onClose: () => void;
  }) => (
    <div data-testid="mock-analysis-view">
      <span>{skillName}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

import { SkillLifecyclePanel } from "../SkillLifecyclePanel";

// --- Mock API setup ---
const mockDetectMode = vi.fn();
const mockPlanSkill = vi.fn();
const mockExecutePlan = vi.fn();

const buildTerminalHandoffBundle = (): TerminalHandoffBundle => ({
  launcher: "claude",
  promptBundle: "runtime-skill prompt",
  cwd: "/tmp/runtime-skill",
  suggestedCommand: 'claude -p "runtime-skill prompt"',
  manualRetryRule: "認証設定を確認してから CLI で再実行する",
});

beforeEach(() => {
  vi.clearAllMocks();
  mockStoreState = {
    selectedSkillName: "test-skill",
    isExecuting: false,
    streamingMessages: [],
    skillExecutionStatus: null,
    skillError: null,
    isGenerating: false,
    generationProgress: null,
    generationError: null,
    currentPlanId: null,
    currentPlanResult: null,
  };

  (window as Window & { electronAPI?: unknown }).electronAPI = {
    skillCreator: {
      detectMode: mockDetectMode,
      planSkill: mockPlanSkill,
      executePlan: mockExecutePlan,
    },
  };

  mockDetectMode.mockResolvedValue({ success: true, data: "plan" });
  mockPlanSkill.mockResolvedValue({
    success: true,
    data: {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    },
  });
  mockExecutePlan.mockResolvedValue({
    success: true,
    data: {
      executeId: "exec-001",
      skillName: "new-skill",
      success: true,
    },
  });
  mockFetchSkills.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

const renderPanel = () =>
  render(<SkillLifecyclePanel onClose={vi.fn()} skillName="test-skill" />);

// =====================================================================
// U-1: handlePlanSkill が detectMode → planSkill の順で呼ばれる
// =====================================================================
describe("U-1: detectMode → planSkill sequential call", () => {
  it("handlePrepare 経由で detectMode='plan' のとき planSkill が自動呼出される", async () => {
    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, {
      target: { value: "メールを自動送信する" },
    });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockDetectMode).toHaveBeenCalledTimes(1);
    expect(mockDetectMode).toHaveBeenCalledWith("メールを自動送信する");
    expect(mockPlanSkill).toHaveBeenCalledTimes(1);
    expect(mockPlanSkill).toHaveBeenCalledWith(
      "メールを自動送信する",
      expect.anything(),
      expect.anything(),
    );
  });
});

// =====================================================================
// U-2: detectMode='create' のとき planSkill は呼ばれない（AC-7）
// =====================================================================
describe("U-2: backward compatibility - detectMode='create' skips planSkill", () => {
  it("detectMode が 'create' を返すとき planSkill は呼ばれない", async () => {
    mockDetectMode.mockResolvedValue({ success: true, data: "create" });

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト用入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockDetectMode).toHaveBeenCalledTimes(1);
    expect(mockPlanSkill).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-3: isGenerating=true で「実行する」ボタンが disabled
// =====================================================================
describe("U-3: isGenerating locks execute button", () => {
  it("isGenerating=true かつ plan 結果表示中は「実行する」ボタンが無効化される", () => {
    mockStoreState.isGenerating = true;
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    expect(executeBtn).toBeDisabled();
  });
});

// =====================================================================
// U-4: isGenerating=true のとき handlePlanSkill が早期リターン（R-1）
// =====================================================================
describe("U-4: isGenerating guard prevents double invocation (R-1)", () => {
  it("isGenerating=true の状態で「方針を決める」を押しても detectMode は呼ばれない", async () => {
    mockStoreState.isGenerating = true;

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockDetectMode).not.toHaveBeenCalled();
    expect(mockPlanSkill).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-5: integrated_api レスポンスで plan 結果表示セクションが表示される
// =====================================================================
describe("U-5: plan result display for integrated_api", () => {
  it("currentPlanResult が integrated_api のとき「生成計画」セクションが表示される", () => {
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    expect(screen.getByText("生成計画")).toBeInTheDocument();
    expect(screen.getByText(/推定ステップ数.*5/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "実行する" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "キャンセル" }),
    ).toBeInTheDocument();
  });
});

// =====================================================================
// U-6: terminal_handoff レスポンスで handoffGuidance が表示される
// =====================================================================
describe("U-6: terminal_handoff triggers handoff guidance display", () => {
  it("planSkill が terminal_handoff を返すと handoff ガイダンスが表示される", async () => {
    mockPlanSkill.mockResolvedValue({
      success: true,
      data: {
        type: "terminal_handoff",
        guidance: {
          reason: "Large task requires CLI execution",
          command: "npx skill-creator plan",
        },
      },
    });

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "大規模タスク" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(
      screen.getByText(/Large task requires CLI execution/),
    ).toBeInTheDocument();
  });
});

// =====================================================================
// U-7: generationError が存在するとエラーメッセージが表示される
// =====================================================================
describe("U-7: generationError displays error message", () => {
  it("generationError が設定されているとエラーメッセージが画面に表示される", () => {
    mockStoreState.generationError = "計画生成に失敗しました";

    renderPanel();

    expect(screen.getByText("計画生成に失敗しました")).toBeInTheDocument();
  });
});

// =====================================================================
// U-8: handleExecutePlan が executePlan → fetchSkills → selectSkillByName を呼ぶ
// =====================================================================
describe("U-8: handleExecutePlan triggers executePlan IPC", () => {
  it("「実行する」ボタンクリックで executePlan が呼ばれ、完了後にスキル一覧が更新される", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockExecutePlan).toHaveBeenCalledTimes(1);
    expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    expect(mockSelectSkillByName).toHaveBeenCalledWith("new-skill");
  });
});

// =====================================================================
// U-9: 「キャンセル」ボタンで clearGenerationState が呼ばれる
// =====================================================================
describe("U-9: cancel button clears generation state", () => {
  it("plan 結果表示中の「キャンセル」ボタンで clearGenerationState が呼ばれる", () => {
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    const cancelBtn = screen.getByRole("button", { name: "キャンセル" });
    fireEvent.click(cancelBtn);

    expect(mockClearGenerationState).toHaveBeenCalledTimes(1);
  });
});

// =====================================================================
// U-10: planSkill 失敗時に generationError が設定される
// =====================================================================
describe("U-10: planSkill failure propagates error", () => {
  it("planSkill が失敗レスポンスを返したとき setGenerationError が呼ばれる", async () => {
    mockPlanSkill.mockResolvedValue({
      success: false,
      error: "ネットワークエラー",
    });

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockPlanSkill).toHaveBeenCalledTimes(1);
    expect(mockSetGenerationError).toHaveBeenCalled();
  });
});

// =====================================================================
// U-11: 空文字列入力では「方針を決める」ボタンが無効化される
// =====================================================================
describe("U-11: empty input validation", () => {
  it("テキストエリアが空のとき「方針を決める」を押しても detectMode は呼ばれない", async () => {
    renderPanel();

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockDetectMode).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-12: planSkill API 未接続時の graceful degradation
// =====================================================================
describe("U-12: planSkill API unavailable graceful degradation", () => {
  it("planSkill が undefined のとき generationError が設定されアプリがクラッシュしない", async () => {
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      skillCreator: {
        detectMode: mockDetectMode,
        // planSkill intentionally omitted
      },
    };

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    // Should not crash and should set error
    expect(mockSetGenerationError).toHaveBeenCalled();
  });
});

// =====================================================================
// U-13: executePlan が terminal_handoff を返した場合、fetchSkills/selectSkillByName が呼ばれない
// =====================================================================
describe("U-13: executePlan terminal_handoff triggers early return", () => {
  it("terminal_handoff レスポンス受信時に fetchSkills が呼ばれず早期リターンする", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };
    mockExecutePlan.mockResolvedValue({
      success: true,
      data: {
        type: "terminal_handoff",
        bundle: buildTerminalHandoffBundle(),
      },
    });

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockExecutePlan).toHaveBeenCalledTimes(1);
    expect(mockFetchSkills).not.toHaveBeenCalled();
    expect(mockSelectSkillByName).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-14: executePlan が失敗レスポンスを返した場合、generationError が設定される
// =====================================================================
describe("U-14: executePlan failure propagates error", () => {
  it("executePlan が success:false を返すと generationError が設定される", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };
    mockExecutePlan.mockResolvedValue({
      success: false,
      error: "実行に失敗しました",
    });

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith("実行に失敗しました");
    expect(mockFetchSkills).not.toHaveBeenCalled();
    expect(mockSelectSkillByName).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-15: executePlan が data なし成功レスポンスを返した場合、デフォルトエラーが設定される
// =====================================================================
describe("U-15: executePlan empty data uses default error", () => {
  it("executePlan が success:true かつ data なしのとき既定メッセージを設定する", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };
    mockExecutePlan.mockResolvedValue({
      success: true,
      data: undefined,
    });

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith(
      "計画実行に失敗しました",
    );
    expect(mockFetchSkills).not.toHaveBeenCalled();
    expect(mockSelectSkillByName).not.toHaveBeenCalled();
  });
});
