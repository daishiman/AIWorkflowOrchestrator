/**
 * @vitest-environment happy-dom
 *
 * SkillLifecyclePanel - LLMAdapter ステータス統合テスト (TASK-RT-01)
 * T-SLP-01, T-SLP-02
 */

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

// useLLMAdapterStatus をモック
vi.mock("../hooks/useLLMAdapterStatus", () => ({
  useLLMAdapterStatus: vi
    .fn()
    .mockReturnValue({ status: "failed", failureReason: "API key error" }),
}));

// Store モック（SkillLifecyclePanel の依存）
vi.mock("../../../store", () => ({
  useBeginSkillReview: () => vi.fn(),
  useCompleteSkillReview: () => vi.fn(),
  useCreateSkill: () => vi.fn(),
  useExecuteSkill: () => vi.fn(),
  useFetchSkills: () => vi.fn(),
  useReExecuteAfterImprovement: () => vi.fn(),
  useResetSkillExecutionCycle: () => vi.fn(),
  useSelectSkillByName: () => vi.fn(),
  useClearSkillError: () => vi.fn(),
  useClearStreamingMessages: () => vi.fn(),
  useClearGenerationState: () => vi.fn(),
  useClearHandoffGuidance: () => vi.fn(),
  useSelectedSkillName: () => null,
  useIsSkillExecuting: () => false,
  useStreamingMessages: () => [],
  useSkillExecutionStatus: () => null,
  useSkillError: () => null,
  useHandoffGuidance: () => null,
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useCurrentPlanResult: () => null,
  useCurrentPlanId: () => null,
  useSetIsSkillGenerating: () => vi.fn(),
  useSetGenerationProgress: () => vi.fn(),
  useSetGenerationError: () => vi.fn(),
  useSetCurrentPlanId: () => vi.fn(),
  useSetCurrentPlanResult: () => vi.fn(),
  useWorkflowSnapshot: () => null,
  useWorkflowError: () => null,
  useSetWorkflowSnapshot: () => vi.fn(),
  useSetWorkflowError: () => vi.fn(),
  useSetHandoffGuidance: () => vi.fn(),
}));

// 子コンポーネントのモック
vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: () => null,
}));
vi.mock("../SkillStreamingView", () => ({
  SkillStreamingView: () => null,
}));
vi.mock("../PlanResultDetailPanel", () => ({
  PlanResultDetailPanel: () => null,
}));
vi.mock("../ExecuteResultDetailPanel", () => ({
  ExecuteResultDetailPanel: () => null,
}));
vi.mock("../ImprovementProposalPanel", () => ({
  ImprovementProposalPanel: () => null,
}));
vi.mock("../../organisms/TerminalHandoffCard", () => ({
  TerminalHandoffCard: () => null,
}));
vi.mock("../ApiKeySettingsPanel", () => ({
  ApiKeySettingsPanel: () => null,
}));
vi.mock("../ConversationalInterview", () => ({
  ConversationalInterview: () => null,
}));

import { useLLMAdapterStatus } from "../hooks/useLLMAdapterStatus";
import { SkillLifecyclePanel } from "../SkillLifecyclePanel";

const minimalProps = {
  onClose: vi.fn(),
};

describe("SkillLifecyclePanel - LLMAdapter status integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T-SLP-01
  it("useLLMAdapterStatus が 'failed' を返したときエラーバナーが表示される", () => {
    vi.mocked(useLLMAdapterStatus).mockReturnValue({
      status: "failed",
      failureReason: "API key error",
    });
    render(<SkillLifecyclePanel {...minimalProps} />);
    expect(screen.getByTestId("llm-adapter-error-banner")).toBeInTheDocument();
  });

  // T-SLP-01b
  it("useLLMAdapterStatus が 'failed' で onOpenSettings が渡されたとき設定ボタンが呼ばれる", () => {
    const onOpenSettings = vi.fn();
    vi.mocked(useLLMAdapterStatus).mockReturnValue({
      status: "failed",
      failureReason: "API key error",
    });
    render(
      <SkillLifecyclePanel {...minimalProps} onOpenSettings={onOpenSettings} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "設定を開く" }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  // T-SLP-02
  it("useLLMAdapterStatus が 'ready' を返したときエラーバナーが非表示", () => {
    vi.mocked(useLLMAdapterStatus).mockReturnValue({
      status: "ready",
      failureReason: null,
    });
    render(<SkillLifecyclePanel {...minimalProps} />);
    expect(
      screen.queryByTestId("llm-adapter-error-banner"),
    ).not.toBeInTheDocument();
  });
});
