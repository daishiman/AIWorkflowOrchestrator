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
    q1: { selectedOptions: [], freeText: "" },
    q2: { selectedOptions: [], freeText: "" },
    q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
    q4: { selectedOptions: [], freeText: "" },
    q5: { selectedOptions: [], freeText: "" },
    q6: { selectedOptions: [], freeText: "" },
  };
}

function createSkipAnswers(): ConversationAnswers {
  return {
    q1: { selectedOptions: ["自分のみ"], freeText: "" },
    q2: { selectedOptions: ["テキスト"], freeText: "" },
    q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
    q4: { selectedOptions: [], freeText: "" },
    q5: { selectedOptions: [], freeText: "" },
    q6: { selectedOptions: [], freeText: "" },
  };
}

function createCompleteAnswers(): ConversationAnswers {
  return {
    q1: { selectedOptions: ["自分のみ"], freeText: "" },
    q2: { selectedOptions: ["テキスト"], freeText: "" },
    q3: {
      selectedOptions: ["定期実行"],
      freeText: "",
      scheduleConfig: {
        cronExpression: "0 9 * * 1-5",
        timezone: "Asia/Tokyo",
      },
    },
    q4: { selectedOptions: ["通知"], freeText: "" },
    q5: { selectedOptions: ["なし"], freeText: "" },
    q6: { selectedOptions: ["Markdown"], freeText: "" },
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
  useFetchSkills: () => vi.fn().mockResolvedValue(undefined),
  useAppStore: {
    getState: () => ({ streamingStage: "idle" }),
  },
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
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /次へ/i }));
  });
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

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
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

  it("TC-11: open_editor 押下で next_action(edit) が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    await screen.findByTestId("complete-step");

    fireEvent.click(screen.getByTestId("complete-step-action-open-editor"));

    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action: "edit",
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("TC-12: create_another 押下で next_action(close) が発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    await screen.findByTestId("complete-step");

    fireEvent.click(screen.getByTestId("complete-step-action-create-another"));

    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
      action: "close",
    });
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
  });

  // ── Phase 4+6: 新規計装テスト（W3-seq-04 追加イベント） ────────────────────

  it("TC-SCW-01: マウント時に skill_wizard_open が source:direct で発火する", () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_open", {
      source: "direct",
    });
  });

  it("TC-SCW-02: source=lifecycle_panel を渡すと skill_wizard_open が lifecycle_panel で発火する", () => {
    render(
      <SkillCreateWizard onClose={mockOnClose} source="lifecycle_panel" />,
    );
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_open", {
      source: "lifecycle_panel",
    });
  });

  it("TC-SCW-03: Step 0 完了時に skill_wizard_step_complete が step:0 で発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await advanceToStep1();
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_step_complete", {
      step: 0,
      stepName: "スキル情報入力",
    });
  });

  it("TC-SCW-04: Step 1 完了時に skill_wizard_step_complete が step:1 で発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_step_complete", {
      step: 1,
      stepName: "詳細設定",
    });
  });

  it("TC-SCW-05: Step 2 生成成功時に skill_wizard_step_complete が step:2 で発火する", async () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_step_complete", {
      step: 2,
      stepName: "生成",
    });
  });

  it("TC-SCW-06: Step 3 未到達でアンマウントすると skill_wizard_abandon が発火する", () => {
    const { unmount } = render(<SkillCreateWizard onClose={mockOnClose} />);
    vi.clearAllMocks();
    unmount();
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_abandon", {
      lastStep: 0,
    });
  });

  it("TC-SCW-07: Step 3 到達後にアンマウントすると skill_wizard_abandon が発火しない", async () => {
    const { unmount } = render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    await screen.findByTestId("complete-step");
    vi.clearAllMocks();
    unmount();
    expect(mockTrackEvent).not.toHaveBeenCalledWith(
      "skill_wizard_abandon",
      expect.anything(),
    );
  });

  it("TC-SCW-M: アンマウント時の lastStep が currentStep の値と一致する（Step 1 で離脱）", async () => {
    const { unmount } = render(<SkillCreateWizard onClose={mockOnClose} />);
    await advanceToStep1();
    vi.clearAllMocks();
    unmount();
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_abandon", {
      lastStep: 1,
    });
  });

  it("TC-SCW-08: 完了後に別のスキルを作ってからアンマウントすると abandon が再発火する", async () => {
    const { unmount } = render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    await screen.findByTestId("complete-step");
    fireEvent.click(screen.getByTestId("complete-step-action-create-another"));
    await screen.findByTestId("wizard-step-info");
    vi.clearAllMocks();
    unmount();
    expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_abandon", {
      lastStep: 0,
    });
  });

  it("TC-SCW-09: テンプレート生成中にアンマウントしても遅延成功イベントが発火しない", async () => {
    const deferred = createDeferred<string | null>();
    mockCreateSkill.mockReturnValueOnce(deferred.promise);

    const { unmount } = render(<SkillCreateWizard onClose={mockOnClose} />);
    await generateWith("complete");
    expect(mockCreateSkill).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    unmount();

    await act(async () => {
      deferred.resolve("/mock/skills/late-skill");
      await deferred.promise;
    });

    expect(getEventCalls("skill_wizard_generation_completed")).toHaveLength(0);
    expect(
      mockTrackEvent.mock.calls.filter(
        ([eventName, payload]) =>
          eventName === "skill_wizard_step_complete" &&
          typeof payload === "object" &&
          payload !== null &&
          "step" in payload &&
          payload.step === 2,
      ),
    ).toHaveLength(0);
  });
});

describe("resolveSkippedAtQuestion", () => {
  it("全問未回答の場合は 1 を返す", () => {
    expect(resolveSkippedAtQuestion(createBlankAnswers())).toBe(1);
  });

  it("Q1のみ回答済みの場合は 2 を返す", () => {
    const answers = createBlankAnswers();
    answers.q1 = { selectedOptions: ["自分のみ"], freeText: "" };
    expect(resolveSkippedAtQuestion(answers)).toBe(2);
  });

  it("Q1〜Q3回答済み・Q4未回答の場合は 4 を返す", () => {
    const answers = createBlankAnswers();
    answers.q1 = { selectedOptions: ["自分のみ"], freeText: "" };
    answers.q2 = { selectedOptions: ["テキスト"], freeText: "" };
    answers.q3 = {
      selectedOptions: ["定期実行"],
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
    answers.q1 = { selectedOptions: ["自分のみ"], freeText: "" };
    answers.q2 = { selectedOptions: ["テキスト"], freeText: "" };
    answers.q3 = {
      selectedOptions: [],
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
