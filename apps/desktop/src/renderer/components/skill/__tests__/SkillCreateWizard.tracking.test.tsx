/**
 * @file SkillCreateWizard.tracking.test.tsx
 * @description SkillCreateWizard 計装テスト（W3-seq-04）
 *
 * AC-01: skill_wizard_started
 * AC-02: skill_wizard_step1_completed（complete / skip）
 * AC-03: skill_wizard_generation_completed
 * AC-04: skill_skeleton_quality_feedback（👍 / 👎）
 * AC-05: skill_wizard_next_action（execute / open_editor / create_another）
 *
 * Phase 6 edge:
 * - started が同一マウントで1回
 * - 生成失敗時に generation_completed が発火しない
 * - 複数回フィードバックで都度発火
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import * as trackEventModule from "../../../utils/trackEvent";
import {
  SkillCreateWizard,
  resolveSkippedAtQuestion,
} from "../SkillCreateWizard";
import type { ConversationAnswers } from "@repo/shared/types/skillCreator";

type MockConversationScenario = {
  method: "skip" | "complete";
  answers: ConversationAnswers;
};

function createBlankAnswers(): ConversationAnswers {
  return {
    q1: { selectedOption: null, freeText: "" },
    q2: { selectedOption: null, freeText: "" },
    q3: { selectedOption: null, freeText: "", scheduleConfig: undefined },
    q4: { selectedOption: null, freeText: "" },
    q5: { selectedOption: null, freeText: "" },
    q6: { selectedOption: null, freeText: "" },
  };
}

function createSkipAnswers(): ConversationAnswers {
  return {
    q1: { selectedOption: "自分のみ", freeText: "" },
    q2: { selectedOption: "テキスト", freeText: "" },
    q3: { selectedOption: null, freeText: "", scheduleConfig: undefined },
    q4: { selectedOption: null, freeText: "" },
    q5: { selectedOption: null, freeText: "" },
    q6: { selectedOption: null, freeText: "" },
  };
}

function createCompleteAnswers(): ConversationAnswers {
  return {
    q1: { selectedOption: "自分のみ", freeText: "" },
    q2: { selectedOption: "テキスト", freeText: "" },
    q3: {
      selectedOption: "定期実行",
      freeText: "",
      scheduleConfig: {
        cronExpression: "0 9 * * 1-5",
        timezone: "Asia/Tokyo",
      },
    },
    q4: { selectedOption: "通知", freeText: "" },
    q5: { selectedOption: "なし", freeText: "" },
    q6: { selectedOption: "Markdown", freeText: "" },
  };
}

let mockConversationScenario: MockConversationScenario = {
  method: "complete",
  answers: createCompleteAnswers(),
};

vi.mock("../wizard", async () => {
  const actual = await vi.importActual<typeof import("../wizard")>("../wizard");
  return {
    ...actual,
    ConversationRoundStep: ({
      onAnswersChange,
      onGenerate,
    }: {
      onAnswersChange: (answers: ConversationAnswers) => void;
      onGenerate: (method: "skip" | "complete") => void;
    }) => (
      <div data-testid="conversation-round-step-mock">
        <button
          type="button"
          data-testid="seed-conversation-round-answers"
          onClick={() => onAnswersChange(mockConversationScenario.answers)}
        >
          seed
        </button>
        <button
          type="button"
          data-testid="generate-conversation-round"
          onClick={() => onGenerate(mockConversationScenario.method)}
        >
          generate
        </button>
      </div>
    ),
  };
});

const mockCreateSkill = vi.fn();
vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useClearGenerationState: () => vi.fn(),
  useWorkflowSnapshot: () => null,
  useCurrentPlanId: () => null,
  useCurrentPlanResult: () => null,
  useSetIsSkillGenerating: () => vi.fn(),
  useSetGenerationProgress: () => vi.fn(),
  useSetGenerationError: () => vi.fn(),
  useSetCurrentPlanId: () => vi.fn(),
  useSetCurrentPlanResult: () => vi.fn(),
  useResetStreamingProgress: () => vi.fn(),
}));

vi.mock("../../../hooks/useStreamingProgress", () => ({
  useStreamingProgress: () => ({
    stage: "idle",
    percent: 0,
    message: "",
    previewContent: null,
    error: null,
    isGenerating: false,
  }),
}));

vi.mock("../../../hooks/useCancelGeneration", () => ({
  useCancelGeneration: () => ({
    cancelGeneration: vi.fn(),
  }),
}));

const mockTrackEvent = vi.spyOn(trackEventModule, "trackEvent");

async function advanceToStep1() {
  fireEvent.change(screen.getByLabelText(/スキル名/i), {
    target: { value: "テストスキル" },
  });
  fireEvent.change(screen.getByLabelText(/目的/i), {
    target: { value: "テスト用の目的を十分に記述します" },
  });
  fireEvent.click(screen.getByRole("button", { name: "自動化" }));
  fireEvent.click(screen.getByRole("button", { name: /次へ/i }));
}

async function generateWith(method: "complete" | "skip") {
  mockConversationScenario = {
    method,
    answers: method === "skip" ? createSkipAnswers() : createCompleteAnswers(),
  };
  await advanceToStep1();
  await screen.findByTestId("conversation-round-step-mock");
  await act(async () => {
    fireEvent.click(screen.getByTestId("seed-conversation-round-answers"));
  });
  await act(async () => {
    fireEvent.click(screen.getByTestId("generate-conversation-round"));
  });
}

function getEventCalls(eventName: keyof trackEventModule.SkillWizardEvents) {
  return mockTrackEvent.mock.calls.filter(([name]) => name === eventName);
}

describe("SkillCreateWizard 計装テスト（W3-seq-04）", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSkill.mockResolvedValue("/mock/skills/test-skill");
    mockConversationScenario = {
      method: "complete",
      answers: createCompleteAnswers(),
    };
  });

  it("TC-01: マウント時に skill_wizard_started が空 payload で発火する", () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_started", {});
  });

  it("TC-E01: skill_wizard_started は同一マウントで1回だけ発火する", () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    expect(getEventCalls("skill_wizard_started")).toHaveLength(1);
  });

  it("TC-02: complete 方式で step1_completed が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");

    expect(mockTrackEvent).toHaveBeenCalledWith(
      "skill_wizard_step1_completed",
      {
        method: "complete",
        skippedAtQuestion: null,
      },
    );
  });

  it("TC-03: skip 方式で step1_completed が発火する", async () => {
    mockConversationScenario = {
      method: "skip",
      answers: createSkipAnswers(),
    };
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("skip");

    expect(mockTrackEvent).toHaveBeenCalledWith(
      "skill_wizard_step1_completed",
      {
        method: "skip",
        skippedAtQuestion: 3,
      },
    );
  });

  it("TC-04: 生成成功時に generation_completed が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");

    expect(mockTrackEvent).toHaveBeenCalledWith(
      "skill_wizard_generation_completed",
      expect.objectContaining({
        method: "complete",
        hasExternalIntegration: expect.any(Boolean),
      }),
    );
  });

  it("TC-E02: 生成失敗時に generation_completed が発火しない", async () => {
    mockCreateSkill.mockRejectedValue(new Error("LLM error"));
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");

    expect(getEventCalls("skill_wizard_generation_completed")).toHaveLength(0);
  });

  it("TC-05: 👍押下で quality_feedback(satisfied=true) が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    await screen.findByTestId("complete-step");

    fireEvent.click(screen.getByTestId("complete-step-feedback-satisfied"));

    expect(mockTrackEvent).toHaveBeenCalledWith(
      "skill_skeleton_quality_feedback",
      {
        satisfied: true,
        generationMethod: "complete",
      },
    );
  });

  it("TC-06: 👎押下で quality_feedback(satisfied=false) が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("skip");
    await screen.findByTestId("complete-step");

    fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

    expect(mockTrackEvent).toHaveBeenCalledWith(
      "skill_skeleton_quality_feedback",
      {
        satisfied: false,
        generationMethod: "skip",
      },
    );
  });

  it("TC-E03: フィードバックを複数回送信すると送信回数分発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);

    await generateWith("complete");
    await screen.findByTestId("complete-step");
    fireEvent.click(screen.getByTestId("complete-step-feedback-satisfied"));
    fireEvent.click(screen.getByTestId("complete-step-action-create-another"));

    await generateWith("complete");
    await screen.findByTestId("complete-step");
    fireEvent.click(screen.getByTestId("complete-step-feedback-satisfied"));

    const feedbackCalls = getEventCalls("skill_skeleton_quality_feedback");
    expect(feedbackCalls).toHaveLength(2);
  });

  it("TC-10: execute 押下で next_action(execute) が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    await screen.findByTestId("complete-step");

    fireEvent.click(screen.getByTestId("complete-step-action-execute"));

    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action: "execute",
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("TC-11: open_editor 押下で next_action(open_editor) が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    await screen.findByTestId("complete-step");

    fireEvent.click(screen.getByTestId("complete-step-action-open-editor"));

    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action: "open_editor",
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("TC-12: create_another 押下で next_action(create_another) が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    await screen.findByTestId("complete-step");

    fireEvent.click(screen.getByTestId("complete-step-action-create-another"));

    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action: "create_another",
    });
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
  });
});

describe("resolveSkippedAtQuestion", () => {
  it("全問未回答の場合は 1 を返す", () => {
    expect(resolveSkippedAtQuestion(createBlankAnswers())).toBe(1);
  });

  it("Q1のみ回答済みの場合は 2 を返す", () => {
    const answers = createBlankAnswers();
    answers.q1 = { selectedOption: "自分のみ", freeText: "" };
    expect(resolveSkippedAtQuestion(answers)).toBe(2);
  });

  it("Q1〜Q3回答済み・Q4未回答の場合は 4 を返す", () => {
    const answers = createBlankAnswers();
    answers.q1 = { selectedOption: "自分のみ", freeText: "" };
    answers.q2 = { selectedOption: "テキスト", freeText: "" };
    answers.q3 = {
      selectedOption: "定期実行",
      freeText: "",
      scheduleConfig: {
        cronExpression: "0 9 * * 1-5",
        timezone: "Asia/Tokyo",
      },
    };
    expect(resolveSkippedAtQuestion(answers)).toBe(4);
  });

  it("Q3のscheduleConfigのみ埋まっている場合も回答済みとして扱う", () => {
    const answers = createBlankAnswers();
    answers.q1 = { selectedOption: "自分のみ", freeText: "" };
    answers.q2 = { selectedOption: "テキスト", freeText: "" };
    answers.q3 = {
      selectedOption: null,
      freeText: "",
      scheduleConfig: {
        cronExpression: "0 9 * * 1-5",
        timezone: "Asia/Tokyo",
      },
    };
    expect(resolveSkippedAtQuestion(answers)).toBe(4);
  });

  it("全問回答済みの場合は null を返す", () => {
    expect(resolveSkippedAtQuestion(createCompleteAnswers())).toBeNull();
  });
});
